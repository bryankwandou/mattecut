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

  // Finding the neck by first guessing where the head ends does not work:
  // on a tight chest-up crop the shoulders begin inside any band generous
  // enough to contain the head, so the "widest row up top" is a shoulder.
  //
  // The neck needs no band. It is the row that is narrow *and* has
  // something wider on both sides of it — the head above, the shoulders
  // below. Scoring every row by how much it is pinched between its
  // surroundings finds it without assuming where anything starts.
  const maxAbove = new Int32Array(h);
  const maxBelow = new Int32Array(h);
  let run = 0;
  for (let y = top; y <= bottom; y++) {
    maxAbove[y] = run;
    if (width[y] > run) run = width[y];
  }
  run = 0;
  for (let y = bottom; y >= top; y--) {
    maxBelow[y] = run;
    if (width[y] > run) run = width[y];
  }

  let neckY = -1;
  let best = 0;
  const lo = top + Math.round(span * 0.08);
  const hi = top + Math.round(span * 0.8);
  for (let y = lo; y <= hi; y++) {
    if (width[y] <= 0) continue;
    const pinch = Math.min(maxAbove[y], maxBelow[y]) / width[y];
    if (pinch > best) {
      best = pinch;
      neckY = y;
    }
  }

  // A pinch this shallow is not a neck. A head alone, a full-body shot, or
  // a shoulder hidden behind a raised arm all land here, and guessing from
  // any of them would put a collar across someone's chin.
  if (neckY < 0 || best < 1.55) return null;

  // The shoulders: the widest the body gets below the neck.
  let shoulderW = 0;
  let shoulderY = neckY;
  for (let y = neckY; y <= bottom; y++) {
    if (width[y] > shoulderW) {
      shoulderW = width[y];
      shoulderY = y;
    }
  }
  if (shoulderY <= neckY + 1) return null;

  return {
    centerX: centre[shoulderY] / w,
    neckY: neckY / h,
    shoulderWidth: shoulderW / w,
  };
}
