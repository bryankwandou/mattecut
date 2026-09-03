/**
 * Unsharp masking, done the way a darkroom did it.
 *
 * The name is literal and worth keeping: you make an *unsharp* copy, and
 * whatever the original has that the blurred copy does not is the detail.
 * Add that difference back and edges gain contrast. Nothing is invented —
 * this is the opposite of a super-resolution model, which guesses pixels
 * that were never recorded.
 *
 * Two decisions in here matter more than the arithmetic:
 *
 * The blur comes from the canvas `filter` property rather than a hand
 * written convolution, because the browser runs that on the graphics card.
 * A 45 megapixel photograph is 45 million pixels to visit, and a JS blur
 * over that is measured in seconds on the machines this product is being
 * built for.
 *
 * And the alpha channel is never touched. Sharpening the matte would put a
 * hard rim around a head that the model deliberately left soft — the exact
 * halo that makes a cut-out look stamped on. Only colour is sharpened.
 */

/** Off, then three strengths. Ordered so the index is the slider value. */
export type SharpenLevel = 0 | 1 | 2 | 3;

/**
 * Radius is in pixels of a 1000 px image and scaled to the real one, so a
 * setting means the same thing on a phone snapshot and on a 6000 px scan.
 * Without that, "medium" would be violent on a small file and invisible on
 * a large one.
 */
const LEVELS: { amount: number; radius: number }[] = [
  { amount: 0, radius: 0 },
  { amount: 0.4, radius: 0.8 },
  { amount: 0.85, radius: 1.1 },
  { amount: 1.45, radius: 1.5 },
];

export const SHARPEN_STEPS = LEVELS.length;

/** Reference width the radii above are quoted against. */
const REFERENCE_W = 1000;

function surface(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

/**
 * Return a sharpened copy, or the source untouched at level zero.
 *
 * Works on anything drawable, so the same function serves the preview at
 * screen size and the export at full size — one algorithm, one set of
 * numbers, and no chance of the picture on screen disagreeing with the file
 * that comes out.
 */
export function sharpenTo(
  src: CanvasImageSource,
  w: number,
  h: number,
  level: SharpenLevel,
): CanvasImageSource {
  const { amount, radius } = LEVELS[level] ?? LEVELS[0];
  if (amount <= 0 || w < 8 || h < 8) return src;

  // Scaled so a level means the same thing at any resolution.
  const px = Math.max(0.4, (radius * w) / REFERENCE_W);

  const sharp = surface(w, h);
  const sc = sharp.getContext("2d", { willReadFrequently: true });
  const blurC = surface(w, h);
  const bc = blurC.getContext("2d", { willReadFrequently: true });
  if (!sc || !bc) return src;

  sc.drawImage(src, 0, 0, w, h);
  // The graphics card does the expensive part.
  bc.filter = `blur(${px}px)`;
  bc.drawImage(src, 0, 0, w, h);
  bc.filter = "none";

  let a: ImageData;
  let b: ImageData;
  try {
    a = sc.getImageData(0, 0, w, h);
    b = bc.getImageData(0, 0, w, h);
  } catch {
    // A tainted canvas throws. Sharpening is not worth losing the picture.
    return src;
  }

  const A = a.data;
  const B = b.data;
  for (let i = 0; i < A.length; i += 4) {
    // Alpha, at i + 3, is deliberately skipped. See the note above: the
    // matte's softness is what stops a cut-out looking stamped on.
    for (let k = 0; k < 3; k++) {
      const o = i + k;
      const v = A[o] + amount * (A[o] - B[o]);
      A[o] = v < 0 ? 0 : v > 255 ? 255 : v;
    }
  }

  sc.putImageData(a, 0, 0);
  return sharp;
}
