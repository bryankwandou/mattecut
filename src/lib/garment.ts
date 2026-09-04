/**
 * Making a flat garment sit on a real body.
 *
 * Everything before this scaled the artwork, turned it to the shoulder line
 * and clipped it to the clothing. That stops it landing on a face, but it
 * still reads as a sticker, and for two reasons that have nothing to do
 * with placement:
 *
 *   1. The artwork is a rectangle. A torso is not. Clipping hides the parts
 *      that overhang, but the garment inside the outline is still straight
 *      where the body curves.
 *   2. The artwork is flat colour. A real photograph of clothing is full of
 *      folds and shading, and a shape with none of that looks painted on
 *      even when its outline is perfect.
 *
 * Both are fixable without inventing anything.
 *
 * The warp is measured, not modelled: for each row of the picture the
 * clothing mask already knows where the body starts and ends, so the
 * artwork's row is stretched to exactly that span. The garment then follows
 * the shoulders, the chest and the taper at the waist because it is being
 * poured into the outline rather than laid over it.
 *
 * The shading is borrowed, not generated. The folds in the original
 * clothing are real light that the camera recorded. Taking the local detail
 * of that — the photograph minus a blurred copy of itself, which is
 * everything that varies faster than the overall brightness — and laying it
 * over the garment in soft light puts those folds onto the new cloth. The
 * overall level is deliberately discarded, or a dark suit underneath would
 * simply darken the whole jacket instead of texturing it.
 *
 * What this is not: it does not synthesise fabric, and it cannot invent a
 * fold the photograph did not contain. A garment-synthesis model would, and
 * would also be gigabytes and need a graphics card.
 */

/** Rows are found on a working copy no taller than this. A garment outline
 *  is smooth, so more rows buy nothing and cost a full-resolution read of
 *  the mask on a machine that may have 2 GB. */
const WORK_H = 1400;

/** Below this the mask is background, not cloth. */
const OPAQUE = 110;

/** How much of the body's own shading is carried onto the garment. Enough
 *  to read as cloth, short of restating the shirt underneath. */
const SHADING = 0.55;

/** Radius of the blur that separates local folds from overall brightness,
 *  in pixels of a 1000 px image. */
const DETAIL_RADIUS = 9;

/**
 * How far a jacket reaches below the neckline, as a multiple of shoulder
 * width.
 *
 * A garment needs a length of its own. Stretched instead over every pixel
 * the clothing model found, a full-length photograph turned the jacket into
 * a sheet from the collar to below the knee — covering the dress, the arms
 * and the boots, because all of those are clothing.
 *
 * Tailoring gives the ratio: a suit jacket runs roughly one and a half to
 * one and three-quarter shoulder widths from the shoulder seam. 1.65 sits
 * in the middle, and it holds whatever the crop, because it is measured
 * against the body rather than against the frame.
 */
const JACKET_DROP = 1.65;

function surface(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

export type Span = { top: number; rows: Int32Array };

/**
 * Where the clothing starts and ends on every row.
 *
 * Returned as a flat pair-per-row array rather than objects: this is read
 * once per row of the output and allocating two thousand small objects for
 * it is exactly the kind of cost that shows up on the machines this product
 * is for.
 */
export function clothingSpans(
  mask: CanvasImageSource,
  w: number,
  h: number,
): Span | null {
  const scale = h > WORK_H ? WORK_H / h : 1;
  const mw = Math.max(8, Math.round(w * scale));
  const mh = Math.max(8, Math.round(h * scale));

  const c = surface(mw, mh);
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(mask, 0, 0, mw, mh);

  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, mw, mh).data;
  } catch {
    return null;
  }

  // Two entries per row: left edge and right edge, in fractions of the
  // width so the caller can apply them at any output size.
  const rows = new Int32Array(mh * 2);
  let first = -1;
  let last = -1;
  for (let y = 0; y < mh; y++) {
    // The longest unbroken run of cloth, not the outermost pixels.
    //
    // Taking the first and last opaque pixel bridges whatever sits between
    // them, so an arm held away from the body, a hand at the hip or a strap
    // over a shoulder would stretch the garment across the gap. A torso is
    // the widest connected thing on its row; the gap is not part of it.
    let bestStart = -1;
    let bestLen = 0;
    let runStart = -1;
    for (let x = 0; x <= mw; x++) {
      const on = x < mw && data[(y * mw + x) * 4 + 3] > OPAQUE;
      if (on) {
        if (runStart < 0) runStart = x;
      } else if (runStart >= 0) {
        const len = x - runStart;
        if (len > bestLen) {
          bestLen = len;
          bestStart = runStart;
        }
        runStart = -1;
      }
    }

    if (bestLen > 0) {
      rows[y * 2] = bestStart;
      rows[y * 2 + 1] = bestStart + bestLen - 1;
      if (first < 0) first = y;
      last = y;
    } else {
      rows[y * 2] = -1;
      rows[y * 2 + 1] = -1;
    }
  }

  // A single misread row would otherwise cut a notch into the garment's
  // edge. Three-row median keeps the shoulder line and the taper while
  // removing spikes that are one row deep.
  const smooth = Int32Array.from(rows);
  for (let y = 1; y < mh - 1; y++) {
    for (let k = 0; k < 2; k++) {
      const a = rows[(y - 1) * 2 + k];
      const b = rows[y * 2 + k];
      const c = rows[(y + 1) * 2 + k];
      if (a < 0 || b < 0 || c < 0) continue;
      smooth[y * 2 + k] = Math.max(Math.min(a, b), Math.min(Math.max(a, b), c));
    }
  }
  rows.set(smooth);

  // Collapses, which a median cannot reach.
  //
  // Measured on a real portrait: the garment's width ran 307, 330, 113,
  // 310 down the chest. A hundred and thirteen is not a waist — it is the
  // clothing mask breaking where a tie or an open collar reads as a
  // different class, and the longest-run rule then honestly reporting the
  // widest surviving fragment. A body does not pinch to a third of itself
  // and widen again over a few rows.
  //
  // So a row far narrower than its neighbourhood is treated as missing and
  // rebuilt from the nearest rows that are not. Real tapering survives,
  // because a taper is gradual and never trips the threshold.
  const HALF = 12;
  const COLLAPSE = 0.62;
  const width = new Int32Array(mh);
  for (let y = 0; y < mh; y++) {
    const l = rows[y * 2];
    const r = rows[y * 2 + 1];
    width[y] = l < 0 || r <= l ? 0 : r - l;
  }

  const fixed = Int32Array.from(rows);
  const nearby: number[] = [];
  for (let y = 0; y < mh; y++) {
    if (width[y] === 0) continue;
    nearby.length = 0;
    for (let j = Math.max(0, y - HALF); j <= Math.min(mh - 1, y + HALF); j++) {
      if (width[j] > 0) nearby.push(width[j]);
    }
    if (nearby.length < 5) continue;
    nearby.sort((a, b) => a - b);
    // The upper quartile, not the median.
    //
    // A median assumes most of the window is intact, and that assumption
    // fails exactly when it is needed: a fourteen-row break inside a
    // twenty-five-row window makes the broken rows the majority, so the
    // median becomes the collapse and the collapse looks normal. Measured
    // on that case, the median left a 112 pixel pinch in a 330 pixel torso
    // untouched; the upper quartile repaired all four sampled rows.
    const ref = nearby[Math.min(nearby.length - 1, Math.floor(nearby.length * 0.75))];
    if (width[y] >= ref * COLLAPSE) continue;

    // Nearest rows on each side that are not themselves collapsed.
    let up = -1;
    for (let j = y - 1; j >= 0 && j >= y - HALF * 2; j--) {
      if (width[j] > ref * COLLAPSE) {
        up = j;
        break;
      }
    }
    let down = -1;
    for (let j = y + 1; j < mh && j <= y + HALF * 2; j++) {
      if (width[j] > ref * COLLAPSE) {
        down = j;
        break;
      }
    }
    if (up < 0 && down < 0) continue;
    if (up < 0) up = down;
    if (down < 0) down = up;

    const span = down - up || 1;
    const f = (y - up) / span;
    for (let k = 0; k < 2; k++) {
      const a = rows[up * 2 + k];
      const b = rows[down * 2 + k];
      fixed[y * 2 + k] = Math.round(a + (b - a) * f);
    }
  }
  rows.set(fixed);

  // A span this short is noise, not a torso.
  if (first < 0 || last - first < 8) return null;

  // Normalise to fractions of the working size, kept as thousandths so the
  // array can stay integer.
  for (let y = 0; y < mh; y++) {
    const l = rows[y * 2];
    const r = rows[y * 2 + 1];
    rows[y * 2] = l < 0 ? -1 : Math.round((l / mw) * 1000);
    rows[y * 2 + 1] = r < 0 ? -1 : Math.round(((r + 1) / mw) * 1000);
  }

  return { top: first / mh, rows };
}

/**
 * Pour the artwork into the clothing outline, then lay the body's own
 * folds over it.
 *
 * `photo` is the original photograph, used only as a source of shading. It
 * is never drawn: only the part of it that varies faster than the local
 * average is kept, which is the folds and nothing else.
 */
export function fitGarment(
  art: CanvasImageSource,
  artW: number,
  artH: number,
  span: Span,
  photo: CanvasImageSource | null,
  w: number,
  h: number,
): HTMLCanvasElement | null {
  const out = surface(w, h);
  const g = out.getContext("2d");
  if (!g) return null;

  const rowCount = span.rows.length / 2;
  const startRow = Math.floor(span.top * rowCount);

  // The artwork is mapped over the rows that actually contain cloth, so the
  // collar lands at the neckline and the hem at the bottom of the garment.
  let lastRow = startRow;
  for (let i = rowCount - 1; i >= startRow; i--) {
    if (span.rows[i * 2] >= 0) {
      lastRow = i;
      break;
    }
  }

  // The shoulders: the widest the body gets in the top third of the cloth,
  // which is where shoulders are on any upright person.
  const shoulderLimit = startRow + Math.max(1, Math.round((lastRow - startRow) / 3));
  let widest = 0;
  for (let i = startRow; i <= shoulderLimit; i++) {
    const l = span.rows[i * 2];
    const r = span.rows[i * 2 + 1];
    if (l >= 0 && r > l) widest = Math.max(widest, r - l);
  }

  // A jacket has a hem. Without one, a full-length photograph gets a
  // garment from the collar to the shoe, because every one of those pixels
  // is clothing to the model that found them.
  if (widest > 0) {
    const shoulderPx = (widest / 1000) * w;
    const dropRows = Math.round(((shoulderPx * JACKET_DROP) / h) * rowCount);
    lastRow = Math.min(lastRow, startRow + Math.max(4, dropRows));
  }

  const usedRows = lastRow - startRow + 1;
  if (usedRows < 4) return null;

  g.imageSmoothingQuality = "high";

  for (let i = startRow; i <= lastRow; i++) {
    const l = span.rows[i * 2];
    const r = span.rows[i * 2 + 1];
    if (l < 0 || r <= l) continue;

    const y0 = Math.floor((i / rowCount) * h);
    const y1 = Math.max(y0 + 1, Math.floor(((i + 1) / rowCount) * h));
    const x0 = (l / 1000) * w;
    const x1 = (r / 1000) * w;

    // The matching slice of artwork, stretched to this row's span. One
    // drawImage per row: the browser resamples, so the seams disappear.
    const srcY = ((i - startRow) / usedRows) * artH;
    const srcH = Math.max(1, artH / usedRows);
    g.drawImage(art, 0, srcY, artW, srcH, x0, y0, x1 - x0, y1 - y0);
  }

  if (photo) {
    // The garment's own alpha has to be kept before blending: a blend mode
    // still paints where the destination is empty, so without this the soft
    // light would spread grey across the whole frame.
    const keep = surface(w, h);
    keep.getContext("2d")?.drawImage(out, 0, 0);
    shade(g, photo, keep, w, h);
  }
  return out;
}

/**
 * Lay the photograph's local detail over the garment in soft light.
 *
 * The absolute brightness is thrown away on purpose. Keeping it would mean
 * a dark shirt underneath darkens the whole jacket, which is not shading,
 * it is showing through.
 */
function shade(
  g: CanvasRenderingContext2D,
  photo: CanvasImageSource,
  /** A copy of the garment, taken before blending, purely for its alpha. */
  keep: HTMLCanvasElement,
  w: number,
  h: number,
) {
  const radius = Math.max(2, (DETAIL_RADIUS * w) / 1000);

  const flat = surface(w, h);
  const fc = flat.getContext("2d", { willReadFrequently: true });
  const soft = surface(w, h);
  const sc = soft.getContext("2d", { willReadFrequently: true });
  if (!fc || !sc) return;

  fc.filter = "grayscale(1)";
  fc.drawImage(photo, 0, 0, w, h);
  fc.filter = "none";

  sc.filter = `grayscale(1) blur(${radius}px)`;
  sc.drawImage(photo, 0, 0, w, h);
  sc.filter = "none";

  let a: ImageData;
  let b: ImageData;
  try {
    a = fc.getImageData(0, 0, w, h);
    b = sc.getImageData(0, 0, w, h);
  } catch {
    return;
  }

  const A = a.data;
  const B = b.data;
  for (let i = 0; i < A.length; i += 4) {
    // Detail around neutral grey: 128 means "change nothing" under soft
    // light, so only what the blur removed survives.
    const d = 128 + (A[i] - B[i]);
    const v = d < 0 ? 0 : d > 255 ? 255 : d;
    A[i] = v;
    A[i + 1] = v;
    A[i + 2] = v;
    A[i + 3] = 255;
  }
  fc.putImageData(a, 0, 0);

  g.save();
  g.globalCompositeOperation = "soft-light";
  g.globalAlpha = SHADING;
  g.drawImage(flat, 0, 0);
  g.restore();

  // Soft light paints the whole rectangle; the garment's own alpha, saved
  // before the blend, is what says where it may show.
  g.globalCompositeOperation = "destination-in";
  g.drawImage(keep, 0, 0);
  g.globalCompositeOperation = "source-over";
}
