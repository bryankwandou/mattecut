/**
 * The lightest tier, on a different engine entirely.
 *
 * The other three tiers are one ONNX network at three precisions. This one
 * is not in that family at all: it is MediaPipe's selfie segmenter, and it
 * exists because the gap between "42 MB of weights" and "nothing" was the
 * whole reason a low-end machine could not use this product.
 *
 * The arithmetic that matters, measured from the origins rather than
 * quoted from a blog post:
 *
 *   selfie_segmenter.tflite      249,537 B   the model
 *   vision_wasm_internal.wasm 11,756,954 B   the engine that runs it
 *   vision_wasm_internal.js      323,377 B   the loader
 *                             -------------
 *   first download            ~12 MB
 *
 * The model really is a quarter of a megabyte. The download is not, and the
 * tier is labelled by the download — the same rule the other three follow,
 * for the same reason: the audit panel reads these sizes from the network,
 * so a prettier number on the button would simply be contradicted on screen.
 *
 * What it costs: this is a 256×256 network. It finds a person reliably and
 * is far softer than ISNet around hair. That is the trade being offered,
 * not a defect to hide.
 */
import type { ImageSegmenter } from "@mediapipe/tasks-vision";
import { fitForModel, type Fitted } from "./fit";

/** Both served from this origin, copied in by worker/build.mjs. The page's
 *  CSP allows `connect-src 'self'`, and a product claiming to process on
 *  your device should not have to call a CDN to begin. */
export const LITE = {
  wasm: "/mediapipe/wasm",
  model: "/mediapipe/selfie_segmenter.tflite",
  /** Bytes, as the origins reported them. The audit panel re-checks these
   *  live; they are here so the tier can be labelled before it is opened. */
  modelBytes: 249_537,
  engineBytes: 11_756_954 + 323_377,
} as const;

let segmenter: ImageSegmenter | null = null;
let loading: Promise<ImageSegmenter> | null = null;

/**
 * Fetch the weights ourselves rather than handing MediaPipe a URL.
 *
 * It costs a few lines and buys a real progress bar: the library reports
 * nothing while it downloads, and an unexplained pause is the failure this
 * product keeps having to design around.
 */
async function fetchModel(
  onProgress?: (cur: number, total: number) => void,
): Promise<Uint8Array> {
  const res = await fetch(LITE.model);
  if (!res.ok) throw new Error(`model ${res.status}`);

  const total = Number(res.headers.get("content-length")) || LITE.modelBytes;
  if (!res.body) return new Uint8Array(await res.arrayBuffer());

  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let cur = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    cur += value.length;
    onProgress?.(cur, total);
  }

  const out = new Uint8Array(cur);
  let at = 0;
  for (const c of chunks) {
    out.set(c, at);
    at += c.length;
  }
  return out;
}

/** Built once and kept. Concurrent callers share the same promise so a
 *  double-click cannot start two 12 MB downloads. */
export function loadLite(
  onProgress?: (cur: number, total: number) => void,
): Promise<ImageSegmenter> {
  if (segmenter) return Promise.resolve(segmenter);
  if (loading) return loading;

  loading = (async () => {
    const vision = await import("@mediapipe/tasks-vision");
    const [files, modelAssetBuffer] = await Promise.all([
      vision.FilesetResolver.forVisionTasks(LITE.wasm),
      fetchModel(onProgress),
    ]);
    segmenter = await vision.ImageSegmenter.createFromOptions(files, {
      baseOptions: { modelAssetBuffer },
      runningMode: "IMAGE",
      // Confidence rather than categories: a category mask is binary, and a
      // hard 0/255 edge around a head looks worse than a soft one that is
      // slightly wrong.
      outputConfidenceMasks: true,
      outputCategoryMask: false,
    });
    return segmenter;
  })();

  try {
    return loading;
  } finally {
    void loading.catch(() => {
      // A failed load must not be cached as a permanent refusal.
      loading = null;
    });
  }
}

export function isLiteReady() {
  return segmenter !== null;
}

/**
 * Cut the background out and return a PNG with a real alpha channel.
 *
 * MediaPipe hands back a confidence mask, not an image, so the compositing
 * is ours to do — which is also why this cannot simply be another entry in
 * the ONNX model table.
 */
export async function cutLite(
  file: Blob,
  cap: number,
  onProgress?: (cur: number, total: number) => void,
): Promise<Fitted> {
  const seg = await loadLite(onProgress);
  const fitted = await fitForModel(file, cap);

  const bmp = await createImageBitmap(fitted.blob);
  const canvas = new OffscreenCanvas(bmp.width, bmp.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d context");

  ctx.drawImage(bmp, 0, 0);
  const frame = ctx.getImageData(0, 0, bmp.width, bmp.height);

  const result = seg.segment(bmp);
  const masks = result.confidenceMasks;
  if (!masks || masks.length === 0) {
    result.close();
    bmp.close();
    throw new Error("no mask returned");
  }

  // Two categories come back as [background, person]; a single-category
  // build returns the person directly. Taking the last entry is correct in
  // both shapes, and wrong in neither.
  const mask = masks[masks.length - 1];
  const alpha = mask.getAsFloat32Array();
  const mw = mask.width;
  const mh = mask.height;

  const px = frame.data;
  for (let y = 0; y < bmp.height; y++) {
    // Nearest-neighbour: the mask normally arrives at the image's own size,
    // and this only earns its keep when it does not.
    const my = mh === bmp.height ? y : Math.min(mh - 1, ((y * mh) / bmp.height) | 0);
    for (let x = 0; x < bmp.width; x++) {
      const mx = mw === bmp.width ? x : Math.min(mw - 1, ((x * mw) / bmp.width) | 0);
      const a = alpha[my * mw + mx];
      px[(y * bmp.width + x) * 4 + 3] = a > 1 ? 255 : Math.round(a * 255);
    }
  }

  result.close();
  bmp.close();

  ctx.putImageData(frame, 0, 0);
  const blob = await canvas.convertToBlob({ type: "image/png" });
  return { blob, scaled: fitted.scaled };
}
