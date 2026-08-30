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
export type Quality = "light" | "balanced" | "maximum";

const MODEL: Record<Quality, "isnet_quint8" | "isnet_fp16" | "isnet"> = {
  light: "isnet_quint8",
  balanced: "isnet_fp16",
  maximum: "isnet",
};

/** Weights alone, as the manifest reports them. The audit panel reads the
 *  same files from the origin, so these two must agree on screen. */
const MODEL_MB: Record<Quality, number> = {
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

/** First-load download for a tier: its weights plus the runtime this
 *  browser will actually fetch. */
export function downloadMb(quality: Quality, onGpu: boolean) {
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
  await dispatch("warm", quality, undefined, onProgress);
  warmed = quality;
}

type Msg =
  | { id: number; type: "progress"; key: string; cur: number; total: number }
  | { id: number; type: "done"; blob?: Blob }
  | { id: number; type: "error"; message: string };

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
    worker = new Worker(new URL("./matting.worker.ts", import.meta.url), {
      type: "module",
    });
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
  onProgress?: (p: Progress) => void,
): Promise<Blob | undefined> {
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
      else resolve(d.blob);
    };
    w.addEventListener("message", listen);
    w.postMessage({ id, op, model: MODEL[quality], device, file });
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
  onProgress?: (p: Progress) => void,
): Promise<Blob | undefined> {
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
    return undefined;
  }
  return lib.removeBackground(file as Blob, config);
}

async function dispatch(
  op: "warm" | "cut",
  quality: Quality,
  file: Blob | undefined,
  onProgress?: (p: Progress) => void,
): Promise<Blob | undefined> {
  const device = (await canGpu()) ? ("gpu" as const) : ("cpu" as const);
  try {
    return await offThread(op, quality, device, file, onProgress);
  } catch (e) {
    if (noWorker) return onThread(op, quality, device, file, onProgress);
    // An adapter that exists but fails mid-run would otherwise lose the
    // picture. The CPU path still works, so take it.
    if (device === "gpu") {
      gpu = false;
      warmed = null;
      return offThread(op, quality, "cpu", file, onProgress).catch(() =>
        onThread(op, quality, "cpu", file, onProgress),
      );
    }
    throw e;
  }
}

export async function cutout(
  file: Blob,
  quality: Quality,
  onProgress?: (p: Progress) => void,
): Promise<Blob> {
  const blob = await dispatch("cut", quality, file, onProgress);
  if (!blob) throw new Error("no image returned");
  return blob;
}

export function isWarm(quality: Quality) {
  return warmed === quality;
}
