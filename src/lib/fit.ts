/**
 * Shrink an oversized photo before the model ever sees it.
 *
 * The network reads a 1024 px square whatever it is handed, so the extra
 * pixels in a 24-megapixel phone shot buy nothing at the inference step.
 * What they do buy is a full-resolution decode plus a mask upsampled back
 * to that size, and on a two-core laptop that pair is what kills the tab.
 *
 * Written to run in either place, and it belongs in the worker: doing this
 * on the main thread freezes the page for exactly the machines the resize
 * exists to rescue. `OffscreenCanvas` is what makes that possible, and the
 * document fallback is only for the main-thread path the worker failure
 * case still uses.
 */

/** Longest edge, in pixels, that each class of machine is asked to carry. */
export const CAP = {
  /** Two cores or 4 GB of RAM. Comfortably above the model's own 1024. */
  weak: 1280,
  /** Effectively a no-op for ordinary photos; a guard against 48 MP files. */
  normal: 4096,
} as const;

export type Fitted = {
  blob: Blob;
  /** True only when pixels were actually dropped, so the studio can stop
   *  promising an export at the original resolution. */
  scaled: boolean;
};

/**
 * Returns the original untouched whenever it already fits, or the decode
 * fails. A failure here must not cost the reader their picture — the model
 * can still try the original.
 */
export async function fitForModel(file: Blob, cap: number): Promise<Fitted> {
  if (typeof createImageBitmap !== "function") return { blob: file, scaled: false };

  let src: ImageBitmap;
  try {
    src = await createImageBitmap(file);
  } catch {
    return { blob: file, scaled: false };
  }

  const long = Math.max(src.width, src.height);
  if (long <= cap) {
    src.close();
    return { blob: file, scaled: false };
  }

  const k = cap / long;
  const w = Math.max(1, Math.round(src.width * k));
  const h = Math.max(1, Math.round(src.height * k));

  const blob = await redraw(src, w, h);
  src.close();
  return blob ? { blob, scaled: true } : { blob: file, scaled: false };
}

/** PNG, not JPEG: a compression artefact along a collar is exactly the kind
 *  of edge the mask would then learn to cut around. */
async function redraw(src: ImageBitmap, w: number, h: number): Promise<Blob | null> {
  if (typeof OffscreenCanvas === "function") {
    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(src, 0, 0, w, h);
    return canvas.convertToBlob({ type: "image/png" });
  }

  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(src, 0, 0, w, h);
  const out = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  // Zeroing the canvas releases the backing store on machines where that
  // matters, which is the same machines this function exists for.
  canvas.width = 0;
  canvas.height = 0;
  return out;
}
