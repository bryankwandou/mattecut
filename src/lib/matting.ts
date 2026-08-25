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

export type Quality = "fast" | "precise";

const MODEL: Record<Quality, "isnet_quint8" | "isnet_fp16"> = {
  fast: "isnet_quint8",
  precise: "isnet_fp16",
};

/** Approximate first-load download per quality tier, for honest copy. */
export const DOWNLOAD_MB: Record<Quality, number> = {
  fast: 54,
  precise: 96,
};

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
  await preload({
    model: MODEL[quality],
    device: "cpu",
    output: { format: "image/png" },
    progress: (k, cur, total) => onProgress?.(describe(k, cur, total)),
  });
  warmed = quality;
}

export async function cutout(
  file: Blob,
  quality: Quality,
  onProgress?: (p: Progress) => void,
): Promise<Blob> {
  const { removeBackground } = await import("@imgly/background-removal");
  return removeBackground(file, {
    model: MODEL[quality],
    device: "cpu",
    output: { format: "image/png", quality: 1 },
    progress: (k, cur, total) => onProgress?.(describe(k, cur, total)),
  });
}

export function isWarm(quality: Quality) {
  return warmed === quality;
}
