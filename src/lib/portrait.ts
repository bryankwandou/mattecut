/**
 * Where the neck and shoulders are, read out of the cut-out itself.
 *
 * Placing a jacket needs to know two things: how wide the shoulders are and
 * how far down the chin sits. The obvious way to get them is a pose model —
 * another download, another runtime, another thing to fail on a slow phone.
 *
 * But the matting pass has already produced the one thing that answers both
 * questions: an alpha mask of exactly this person. A head is narrow, a neck
 * is narrower, and shoulders are abruptly wide. That shape is legible from
 * the per-row width of the mask alone, in about a millisecond, with nothing
 * to download.
 *
 * The honest limit is stated here rather than buried: this reads a *frontal,
 * chest-up* portrait, which is what a student ID photo is. Turn sideways,
 * raise an arm across the shoulder line, or crop below the chest and the
 * shape stops meaning what this function assumes. It returns null in the
 * cases it can detect, and the interface then asks the reader to place the
 * jacket by hand instead of pretending it knew.
 */

export type Portrait = {
  /** All values are fractions of the image, so they survive any resize. */
  centerX: number;
  neckY: number;
  shoulderWidth: number;
};

/** Mask is sampled at this width; the shape survives, the cost does not. */
const SAMPLE_W = 160;

/** Below this the pixel is background, not subject. */
const OPAQUE = 128;

export function findPortrait(img: HTMLImageElement): Portrait | null {
  const w = SAMPLE_W;
  const h = Math.max(
    1,
    Math.round((SAMPLE_W * img.naturalHeight) / img.naturalWidth),
  );
  if (h < 40) return null;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, w, h);

  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, w, h).data;
  } catch {
    // A tainted canvas would throw. Nothing here is worth breaking a cut for.
    return null;
  }

  // Per-row extent of the subject.
  const width = new Int32Array(h);
  const centre = new Float64Array(h);
  for (let y = 0; y < h; y++) {
    let min = -1;
    let max = -1;
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > OPAQUE) {
        if (min < 0) min = x;
        max = x;
      }
    }
    width[y] = min < 0 ? 0 : max - min + 1;
    centre[y] = min < 0 ? 0 : (min + max) / 2;
  }

  let top = -1;
  let bottom = -1;
  for (let y = 0; y < h; y++) {
    if (width[y] > 0) {
      if (top < 0) top = y;
      bottom = y;
    }
  }
  if (top < 0 || bottom - top < 24) return null;

  const span = bottom - top;

  // The head: widest row in the upper part of the silhouette.
  let headY = top;
  let headW = 0;
  const headBand = top + Math.round(span * 0.45);
  for (let y = top; y <= headBand; y++) {
    if (width[y] > headW) {
      headW = width[y];
      headY = y;
    }
  }
  if (headW < 8) return null;

  // The neck: narrowest row below the head, stopping once the silhouette
  // flares back out past the head's own width — that flare is the shoulders.
  let neckY = -1;
  let neckW = Infinity;
  for (let y = headY + 1; y <= bottom; y++) {
    if (width[y] > headW * 1.15) break;
    if (width[y] > 0 && width[y] < neckW) {
      neckW = width[y];
      neckY = y;
    }
  }
  if (neckY < 0) return null;

  // The shoulders: the widest the body gets below the neck.
  let shoulderW = 0;
  let shoulderY = neckY;
  for (let y = neckY; y <= bottom; y++) {
    if (width[y] > shoulderW) {
      shoulderW = width[y];
      shoulderY = y;
    }
  }

  // Three ways this is not the portrait we assumed: no real narrowing at the
  // neck, shoulders that never appear below it, or a neck so low that the
  // frame is probably not chest-up. Any of them means hands off.
  if (neckW > shoulderW * 0.62) return null;
  if (shoulderY <= neckY + 1) return null;
  if (neckY > top + span * 0.75) return null;

  return {
    centerX: centre[shoulderY] / w,
    neckY: neckY / h,
    shoulderWidth: shoulderW / w,
  };
}
