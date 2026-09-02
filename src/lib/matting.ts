/**
 * Wrapper around the on-device matting model.
 *
 * Two things this file exists to hide from the UI:
 *  1. The library is ~54 MB of WASM + weights on first run. That download
 *     is the single worst moment in the product, so we report it honestly
 *     as a download instead of pretending it is "processing".
 *  2. It must never be imported on the server — it touches `window` at
 *     module scope. Hence the dynamic import inside the call.
 */

import { CAP, fitForModel } from "./fit";
import {
  LITE,
  clothesRegion,
  cutLite,
  loadLite,
  type Clothes,
} from "./lite";

export type Stage = "idle" | "fetching" | "processing" | "done" | "error";

/** Which sentence the UI should show. The wording lives in the
 *  dictionaries, not here, so this file stays language-free. */
export type ProgressKey = "downloading" | "engine" | "separating";

export type Progress = {
  stage: Stage;
  /** 0–1, or null when the step genuinely has no known total. */
  ratio: number | null;
  key: ProgressKey;
};

/**
 * Three tiers, because the library ships three sets of weights for the same
 * network. They differ only in how precisely each weight is stored:
 *
 *   light    8-bit integers   smallest download, softest edges
 *   balanced 16-bit floats    the middle, and the sane default
 *   maximum  32-bit floats    every weight at full precision
 *
 * Worth saying plainly, because it is the question everyone asks: there is
 * no fourth tier that is both tiny and sharper than the others. Shrinking
 * the file *is* the act of throwing away precision. A lighter model is
 * lighter because it knows less about edges, and hair is where that shows.
 */
export type Quality = "lite" | "fine" | "light" | "balanced" | "maximum";

/** The three that really are one network at three precisions. The fourth
 *  tier is a different engine on a different model and lives in ./lite, so
 *  it deliberately does not fit in the tables below. */
export type OnnxQuality = "light" | "balanced" | "maximum";

const MODEL: Record<OnnxQuality, "isnet_quint8" | "isnet_fp16" | "isnet"> = {
  light: "isnet_quint8",
  balanced: "isnet_fp16",
  maximum: "isnet",
};

/** Weights alone, as the manifest reports them. The audit panel reads the
 *  same files from the origin, so these two must agree on screen. */
const MODEL_MB: Record<OnnxQuality, number> = {
  light: 42.3,
  balanced: 84.1,
  maximum: 168.0,
};

/** The runtime that executes the weights. There are two builds, and which
 *  one a browser fetches depends on whether it can use WebGPU — so a tier's
 *  download is not one number for everybody. */
const RUNTIME_MB = { cpu: 11.3, gpu: 21.9 };

let gpu: boolean | null = null;

/**
 * Probe WebGPU once.
 *
 * This decides more than speed. The library only proxies inference to a
 * worker on the GPU path (`proxyToWorker` is ANDed with the WebGPU check
 * inside it), so on CPU the model runs on the main thread and the page
 * stops answering clicks for the whole cut. A frozen tab looks exactly
 * like a broken button to whoever is pressing it.
 */
export async function canGpu(): Promise<boolean> {
  if (gpu !== null) return gpu;
  try {
    const g = (navigator as Navigator & {
      gpu?: { requestAdapter(): Promise<unknown> };
    }).gpu;
    gpu = g ? (await g.requestAdapter()) != null : false;
  } catch {
    gpu = false;
  }
  return gpu;
}

/**
 * Whether this machine should be treated as a low-power one.
 *
 * The honest answer is that a browser will not tell you what CPU it is
 * running on, so this is a proxy: cores and, where the browser reports it,
 * installed memory. An Atom-class netbook reports two cores; a machine
 * reporting 4 GB or less is in the same territory. Both are deliberately
 * conservative, because the cost of a false positive is a smaller picture
 * and the cost of a false negative is a dead tab.
 */
export function isWeakDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (typeof mem === "number" && mem <= 4) return true;
  const cores = navigator.hardwareConcurrency ?? 0;
  return cores > 0 && cores <= 2;
}


/** First-load download for a tier: its weights plus the runtime this
 *  browser will actually fetch. */
export function downloadMb(quality: Quality, onGpu: boolean) {
  // The lightest tier carries its own engine, and that engine is the same
  // size whether or not this browser has a GPU.
  if (quality === "lite") {
    return Math.round((LITE.modelBytes + LITE.engineBytes) / 1_048_576);
  }
  if (quality === "fine") {
    return Math.round((LITE.multiclassBytes + LITE.engineBytes) / 1_048_576);
  }
  return Math.round(MODEL_MB[quality] + (onGpu ? RUNTIME_MB.gpu : RUNTIME_MB.cpu));
}

function describe(raw: string, current: number, total: number): Progress {
  const ratio = total > 0 ? Math.min(1, current / total) : null;

  if (raw.includes("fetch") || raw.includes("compute:inference") === false) {
    if (raw.includes("model")) {
      return { stage: "fetching", ratio, key: "downloading" };
    }
    if (raw.includes("wasm") || raw.includes("onnxruntime")) {
      return { stage: "fetching", ratio, key: "engine" };
    }
  }
  return { stage: "processing", ratio, key: "separating" };
}

let warmed: Quality | null = null;

/** Kick off the asset download early so the first cut is not the slow one. */
export async function warm(quality: Quality, onProgress?: (p: Progress) => void) {
  if (warmed === quality) return;
  // No file, so the cap is irrelevant here; a warm-up only fetches weights.
  await dispatch("warm", quality, undefined, CAP.normal, onProgress);
  warmed = quality;
}

type Msg =
  | { id: number; type: "progress"; key: string; cur: number; total: number }
  | { id: number; type: "clothes"; clothes: Clothes | null }
  | { id: number; type: "done"; blob?: Blob; scaled?: boolean }
  | { id: number; type: "error"; message: string };

/** What a run hands back: the cut-out, and whether the photo had to be
 *  shrunk to get there. The second half is not a detail — it is what keeps
 *  the export note from claiming a resolution this cut never had. */
export type Cut = { blob?: Blob; scaled: boolean };

let worker: Worker | null = null;
/** Set only when the worker could not be constructed or died outright, not
 *  when the model inside it threw. The difference decides whether falling
 *  back to the main thread is a repair or just the same failure, slower. */
let noWorker = false;
let seq = 0;

function hire(): Worker | null {
  if (noWorker) return null;
  if (worker) return worker;
  try {
    // Built ahead of time into /public by worker/build.mjs. Turbopack does
    // not compile `new URL('./x.ts', import.meta.url)` workers — it copies
    // the TypeScript through, the worker never starts, and the fallback
    // below quietly reinstates the freeze this is here to remove.
    worker = new Worker("/matting-worker.js");
    worker.onerror = () => {
      noWorker = true;
      worker = null;
    };
    return worker;
  } catch {
    noWorker = true;
    return null;
  }
}

function offThread(
  op: "warm" | "cut",
  quality: Quality,
  device: "cpu" | "gpu",
  file: Blob | undefined,
  cap: number,
  onProgress?: (p: Progress) => void,
): Promise<Cut> {
  const w = hire();
  if (!w) return Promise.reject(new Error("no worker"));
  const id = ++seq;
  return new Promise((resolve, reject) => {
    const listen = (e: MessageEvent<Msg>) => {
      const d = e.data;
      if (d.id !== id) return;
      if (d.type === "progress") {
        onProgress?.(describe(d.key, d.cur, d.total));
        return;
      }
      w.removeEventListener("message", listen);
      if (d.type === "error") reject(new Error(d.message));
      // A clothes answer arriving here would mean two requests crossed; the
      // id check above makes that impossible, and the guard keeps the types
      // honest about it.
      else if (d.type === "done") resolve({ blob: d.blob, scaled: d.scaled === true });
      else reject(new Error("unexpected reply"));
    };
    w.addEventListener("message", listen);
    const model =
      quality === "lite" || quality === "fine" ? quality : MODEL[quality];
    w.postMessage({ id, op, model, device, file, cap });
  });
}

/** The old path, kept for browsers that will not give us a worker. It
 *  blocks the tab, but a frozen page that finishes beats one that cannot
 *  cut at all. */
async function onThread(
  op: "warm" | "cut",
  quality: Quality,
  device: "cpu" | "gpu",
  file: Blob | undefined,
  cap: number,
  onProgress?: (p: Progress) => void,
): Promise<Cut> {
  // The lightest tier is a different engine, so it leaves here before any
  // of the ONNX configuration below is built.
  if (quality === "lite" || quality === "fine") {
    const mp = quality === "fine" ? "multiclass" : "selfie";
    const report = (cur: number, total: number) =>
      onProgress?.(describe("fetch:model", cur, total));
    if (op === "warm") {
      await loadLite(mp, report);
      return { scaled: false };
    }
    return cutLite(file as Blob, cap, mp, report);
  }

  const lib = await import("@imgly/background-removal");
  const config = {
    model: MODEL[quality],
    device,
    output: { format: "image/png" as const, quality: 1 },
    progress: (k: string, cur: number, total: number) =>
      onProgress?.(describe(k, cur, total)),
  };
  if (op === "warm") {
    await lib.preload(config);
    return { scaled: false };
  }
  // This path only runs when the worker could not be built, so the resize
  // lands on the main thread with the model. Slow, but the alternative
  // here is no picture at all.
  const fitted = await fitForModel(file as Blob, cap);
  return { blob: await lib.removeBackground(fitted.blob, config), scaled: fitted.scaled };
}

async function dispatch(
  op: "warm" | "cut",
  quality: Quality,
  file: Blob | undefined,
  cap: number,
  onProgress?: (p: Progress) => void,
): Promise<Cut> {
  const device = (await canGpu()) ? ("gpu" as const) : ("cpu" as const);
  try {
    return await offThread(op, quality, device, file, cap, onProgress);
  } catch (e) {
    if (noWorker) return onThread(op, quality, device, file, cap, onProgress);
    // An adapter that exists but fails mid-run would otherwise lose the
    // picture. The CPU path still works, so take it.
    if (device === "gpu") {
      gpu = false;
      warmed = null;
      return offThread(op, quality, "cpu", file, cap, onProgress).catch(() =>
        onThread(op, quality, "cpu", file, cap, onProgress),
      );
    }
    throw e;
  }
}

export async function cutout(
  file: Blob,
  quality: Quality,
  cap: number,
  onProgress?: (p: Progress) => void,
): Promise<{ blob: Blob; scaled: boolean }> {
  const cut = await dispatch("cut", quality, file, cap, onProgress);
  if (!cut.blob) throw new Error("no image returned");
  return { blob: cut.blob, scaled: cut.scaled };
}

export function isWarm(quality: Quality) {
  return warmed === quality;
}

/**
 * Ask where the clothing is.
 *
 * Separate from `cutout` on purpose. It runs only when somebody chooses a
 * jacket, it always uses the multiclass network whatever tier is cutting
 * the picture, and it fails quietly: a null answer means the garment falls
 * back to the silhouette estimate rather than nothing happening at all.
 */
export async function findClothes(
  file: Blob,
  cap: number,
  onProgress?: (p: Progress) => void,
): Promise<Clothes | null> {
  const w = hire();
  if (!w) {
    // No worker means the main thread, which is slower but not wrong.
    return clothesRegion(file, cap).catch(() => null);
  }
  const id = ++seq;
  return new Promise<Clothes | null>((resolve, reject) => {
    const listen = (e: MessageEvent<Msg>) => {
      const d = e.data;
      if (d.id !== id) return;
      if (d.type === "progress") {
        onProgress?.(describe(d.key, d.cur, d.total));
        return;
      }
      w.removeEventListener("message", listen);
      if (d.type === "error") reject(new Error(d.message));
      else if (d.type === "clothes") resolve(d.clothes);
      else resolve(null);
    };
    w.addEventListener("message", listen);
    w.postMessage({ id, op: "clothes", model: "fine", device: "cpu", file, cap });
  }).catch(() => null);
}
