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
  /**
   * Whether the neck was actually found, or merely estimated.
   *
   * The distinction used to be null-or-not, and null sent the jacket to a
   * pair of constants — 0.8 of the frame wide, 0.55 down — that had never
   * looked at the person. On a photo where detection failed, that is what
   * produced a black slab across the chest.
   *
   * A failed pinch test does not mean the mask is uninformative: the widest
   * row below the head is still the shoulder line. So an estimate is always
   * returned, and this flag decides only whether the interface claims the
   * placement is automatic or asks the reader to check it.
   */
  confident: boolean;
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

  // A pinch this shallow is not a neck. Long hair is the common case: it
  // falls from the head to the shoulders and fills in the very gap this
  // test looks for, so a perfectly ordinary ID photo scores near nothing.
  const confident = neckY >= 0 && best >= 1.55;

  // The shoulder line is legible either way — it is the widest the subject
  // gets below the head. Searching from the neck when there is one, and
  // from below the head when there is not.
  const from = confident ? neckY : top + Math.round(span * 0.3);
  let shoulderW = 0;
  let shoulderY = from;
  for (let y = from; y <= bottom; y++) {
    if (width[y] > shoulderW) {
      shoulderW = width[y];
      shoulderY = y;
    }
  }
  if (shoulderW <= 0) return null;

  let neck = neckY;
  if (!confident || shoulderY <= neckY + 1) {
    // Walk up from the shoulders to where the subject has narrowed to a
    // little over half its widest — throat, or the hair around it. Better
    // than a constant because it is still measured from this person.
    neck = from;
    for (let y = shoulderY; y >= top; y--) {
      if (width[y] <= shoulderW * 0.62) {
        neck = y;
        break;
      }
    }
    if (neck <= top) neck = top + Math.round(span * 0.42);
  }

  return {
    centerX: centre[shoulderY] / w,
    neckY: neck / h,
    shoulderWidth: shoulderW / w,
    confident: confident && shoulderY > neckY + 1,
  };
}
