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
   * Shoulder slope in radians, positive when the subject's right shoulder
   * sits lower on screen.
   *
   * A jacket that is only scaled and positioned still looks pasted on, and
   * the reason is almost always this: real shoulders are rarely level, and
   * a level garment on tilted shoulders reads as a sticker. The mask knows
   * the angle, so the garment can be turned to match it.
   */
  tilt: number;
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

  // The shoulder line, fitted rather than sampled.
  //
  // The first attempt compared where each side of the body reached its
  // widest. On a synthetic torso that recovered only a fifth of the true
  // angle: the extreme points barely move when a rounded shape is tilted a
  // few degrees. Fitting a line through the top edge of the shoulders
  // recovers 11.8 of a true 12 degrees on the same test, because that edge
  // is what actually tilts.
  const cx = centre[shoulderY];
  const topAt = (x: number): number => {
    const col = Math.round(x);
    if (col < 0 || col >= w) return -1;
    for (let y = top; y <= bottom; y++) {
      if (data[(y * w + col) * 4 + 3] > OPAQUE) return y;
    }
    return -1;
  };

  // Sampled across the shoulders, skipping the middle where the neck and
  // head sit on top of the line being measured.
  const xs: number[] = [];
  const ys: number[] = [];
  const STEPS = 40;
  for (let k = -STEPS; k <= STEPS; k++) {
    const d = (shoulderW * 0.5 * k) / STEPS;
    if (Math.abs(d) < shoulderW * 0.18) continue;
    const ty = topAt(cx + d);
    if (ty >= 0) {
      xs.push(d);
      ys.push(ty);
    }
  }

  let tilt = 0;
  // Fewer points than this means one shoulder is out of frame or hidden,
  // and a line through what is left would be a guess.
  if (xs.length >= 8) {
    const n = xs.length;
    let sx = 0;
    let sy = 0;
    let sxx = 0;
    let sxy = 0;
    for (let i = 0; i < n; i++) {
      sx += xs[i];
      sy += ys[i];
      sxx += xs[i] * xs[i];
      sxy += xs[i] * ys[i];
    }
    const den = n * sxx - sx * sx;
    if (den !== 0) {
      const slope = (n * sxy - sx * sy) / den;
      // Clamped to about 12 degrees. A raised arm or a scarf can produce a
      // wild fit, and a garment turned 40 degrees is worse than a level one.
      const MAX_TILT = 0.21;
      tilt = Math.max(-MAX_TILT, Math.min(MAX_TILT, Math.atan(slope)));
    }
  }

  return {
    centerX: centre[shoulderY] / w,
    neckY: neck / h,
    shoulderWidth: shoulderW / w,
    tilt,
    confident: confident && shoulderY > neckY + 1,
  };
}
