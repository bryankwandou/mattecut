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
  const { preload } = await import("@imgly/background-removal");
  await preload(await opts(quality, onProgress));
  warmed = quality;
}

/** The one config both entry points use, so a warm run and the cut that
 *  follows it can never disagree about which files to fetch. */
async function opts(quality: Quality, onProgress?: (p: Progress) => void) {
  const onGpu = await canGpu();
  return {
    model: MODEL[quality],
    device: onGpu ? ("gpu" as const) : ("cpu" as const),
    proxyToWorker: onGpu,
    output: { format: "image/png" as const, quality: 1 },
    progress: (k: string, cur: number, total: number) =>
      onProgress?.(describe(k, cur, total)),
  };
}

export async function cutout(
  file: Blob,
  quality: Quality,
  onProgress?: (p: Progress) => void,
): Promise<Blob> {
  const { removeBackground } = await import("@imgly/background-removal");
  try {
    return await removeBackground(file, await opts(quality, onProgress));
  } catch (e) {
    // An adapter that exists but fails mid-run would otherwise lose the
    // picture entirely. The slow path still works, so take it rather than
    // hand back an error for something the CPU can do.
    if (!gpu) throw e;
    gpu = false;
    warmed = null;
    return removeBackground(file, await opts(quality, onProgress));
  }
}

export function isWarm(quality: Quality) {
  return warmed === quality;
}
