import type { Rgba } from "./color";
import { sharpenTo, type SharpenLevel } from "./sharpen";
import { clothingSpans, fitGarment } from "./garment";
import { toCss } from "./color";

/**
 * Everything here runs on the *master* — the full-resolution transparent
 * PNG that came back from the matting pass. The on-screen preview is a
 * downscaled copy, but exports always re-composite from the master, so
 * what you download is never the preview blown back up.
 */

export type Background =
  | { kind: "transparent" }
  | { kind: "solid"; color: Rgba }
  | { kind: "gradient"; from: Rgba; to: Rgba; angle: number }
  /**
   * A photo or wallpaper behind the subject.
   *
   * It carries a Blob rather than a decoded image or an object URL, for one
   * reason that is easy to miss: this value is written straight into the
   * crash-safe draft, and IndexedDB can store a Blob but throws on an
   * HTMLImageElement. Decoding is a caching concern, handled below.
   */
  | { kind: "image"; blob: Blob; fit: Fit };

/** `cover` fills the frame and crops; `contain` fits and leaves margins. */
export type Fit = "cover" | "contain";

/**
 * Something drawn over the subject — today that means a jacket.
 *
 * Position is in fractions of the picture rather than pixels, so one value
 * places it correctly in the preview, which is a few hundred pixels wide,
 * and in the export, which is the original file. Height is left out on
 * purpose: it follows from the artwork's own aspect, so a CSS `height:auto`
 * and a canvas calculation cannot drift apart.
 */
export type Overlay = {
  blob: Blob;
  x: number;
  y: number;
  w: number;
  /** Radians. Turns the garment to sit on the shoulder line rather than on
   *  the horizon, which is the difference between worn and pasted on. */
  tilt: number;
  /** White where the person's own clothing is. When present the garment is
   *  poured into it row by row, so it follows the shoulders and the taper
   *  of the body instead of being a rectangle with its corners hidden. */
  mask?: Blob | null;
  /** Midpoint between the shoulders, as a fraction of the width. Null when
   *  the pose network did not find them, in which case the mask's own
   *  centre is the only estimate available. */
  centreX?: number | null;
  /** The shoulder line: how far down the frame, and how far apart the
   *  joints are. Both fractions. Null when the pose network found nothing,
   *  in which case the garment falls back to stretching. */
  shoulder?: { y: number; span: number } | null;
};

/**
 * Decoded backdrops, keyed by the Blob they came from.
 *
 * Weak on purpose: when a background is replaced, the old Blob becomes
 * unreachable and the bitmap and its object URL go with it, so swapping
 * wallpapers twenty times does not pin twenty full-size images in memory.
 */
const decoded = new WeakMap<Blob, HTMLImageElement>();
const urls = new WeakMap<Blob, string>();

/** Stable object URL for a backdrop, for CSS preview and decoding alike. */
export function backdropUrl(blob: Blob): string {
  let url = urls.get(blob);
  if (!url) {
    url = URL.createObjectURL(blob);
    urls.set(blob, url);
  }
  return url;
}

/**
 * Decode a backdrop so `paintBackground` can stay synchronous.
 *
 * Export calls this first. Skipping it would not throw — it would quietly
 * write a picture with no background at all, which is the worst kind of
 * bug: the file looks fine until someone opens it.
 */
/**
 * Decode with a deadline.
 *
 * `HTMLImageElement.decode()` is specified to settle, and in practice does
 * not always: a source that neither finishes nor errors leaves the promise
 * pending forever. Awaited on the export path that is the worst failure
 * this product can have — the reader presses Download and receives silence,
 * with no file, no message and nothing to retry.
 *
 * So every decode carries a deadline and every deadline names its stage,
 * because "export failed" without a stage is a bug report nobody can act
 * on.
 */
export async function decodeWithin(
  blob: Blob,
  stage: string,
  ms = 20_000,
): Promise<HTMLImageElement> {
  const held = decoded.get(blob);
  if (held) return held;

  const img = new Image();
  img.src = backdropUrl(blob);

  const settled = new Promise<HTMLImageElement>((resolve, reject) => {
    // Both paths, because decode() and the load events do not always agree
    // about SVG sources.
    img.decode().then(() => resolve(img), () => undefined);
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`${stage}: could not decode`));
  });

  const timer = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`${stage}: timed out after ${ms}ms`)), ms),
  );

  const out = await Promise.race([settled, timer]);
  decoded.set(blob, out);
  return out;
}

export async function prepareBackground(bg: Background): Promise<void> {
  if (bg.kind !== "image" || decoded.has(bg.blob)) return;
  await decodeWithin(bg.blob, "backdrop");
}

/** Where a backdrop lands inside w×h under the chosen fit. */
function frame(img: HTMLImageElement, w: number, h: number, fit: Fit) {
  const scale =
    fit === "cover"
      ? Math.max(w / img.naturalWidth, h / img.naturalHeight)
      : Math.min(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  return { x: (w - dw) / 2, y: (h - dh) / 2, dw, dh };
}

export function paintBackground(
  ctx: CanvasRenderingContext2D,
  bg: Background,
  w: number,
  h: number,
) {
  if (bg.kind === "transparent") return;

  if (bg.kind === "image") {
    const img = decoded.get(bg.blob);
    // Undecoded means `prepareBackground` was not awaited. Silence here
    // would ship a transparent export, so say so where a developer sees it.
    if (!img) {
      console.error("[mattecut] backdrop painted before decode");
      return;
    }
    const { x, y, dw, dh } = frame(img, w, h, bg.fit);
    ctx.drawImage(img, x, y, dw, dh);
    return;
  }

  if (bg.kind === "solid") {
    ctx.fillStyle = toCss(bg.color);
    ctx.fillRect(0, 0, w, h);
    return;
  }

  // Angle is in degrees, 0 = left→right, growing clockwise.
  const rad = (bg.angle * Math.PI) / 180;
  const cx = w / 2;
  const cy = h / 2;
  const half = (Math.abs(w * Math.cos(rad)) + Math.abs(h * Math.sin(rad))) / 2;
  const dx = Math.cos(rad) * half;
  const dy = Math.sin(rad) * half;

  const grad = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);
  grad.addColorStop(0, toCss(bg.from));
  grad.addColorStop(1, toCss(bg.to));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

/** Draw an overlay over the subject, at its own aspect ratio. */
export function paintOverlay(
  ctx: CanvasRenderingContext2D,
  overlay: Overlay,
  w: number,
  h: number,
  /** The original photograph, used only as a source of shading for the
   *  fitted garment. Never drawn. */
  photo: CanvasImageSource | null = null,
) {
  const img = decoded.get(overlay.blob);
  if (!img) {
    console.error("[mattecut] overlay painted before decode");
    return;
  }
  const maskImg = overlay.mask ? decoded.get(overlay.mask) : null;

  // The fitted path. The clothing mask knows where the body starts and ends
  // on every row, so the artwork is stretched into that outline and the
  // photograph's own folds are laid over it. What comes back already covers
  // the frame, so it is drawn at the origin rather than positioned.
  if (maskImg) {
    const span = clothingSpans(maskImg, w, h);
    if (span) {
      const fitted = fitGarment(
        img,
        img.naturalWidth,
        img.naturalHeight,
        span,
        photo ?? null,
        w,
        h,
        overlay.centreX ?? null,
        overlay.shoulder ?? null,
        maskImg,
      );
      if (fitted) {
        ctx.drawImage(fitted, 0, 0);
        return;
      }
    }
  }

  const dw = overlay.w * w;
  const dh = (dw * img.naturalHeight) / img.naturalWidth;
  const x = overlay.x * w;
  const y = overlay.y * h;

  const place = (c: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) => {
    if (!overlay.tilt) {
      c.drawImage(img, x, y, dw, dh);
      return;
    }
    // Rotate about the centre of the collar rather than the corner of the
    // artwork: the collar is the part that has to stay on the neck, and any
    // other pivot slides it off while turning.
    c.save();
    c.translate(x + dw / 2, y);
    c.rotate(overlay.tilt);
    c.drawImage(img, -dw / 2, 0, dw, dh);
    c.restore();
  };

  if (!maskImg) {
    place(ctx);
    return;
  }

  // Drawn on its own surface first, then cut to the clothing before it is
  // laid down. Clipping in place would erase the picture underneath it.
  const layer = new OffscreenCanvas(w, h);
  const lc = layer.getContext("2d");
  if (!lc) {
    place(ctx);
    return;
  }
  place(lc);
  lc.globalCompositeOperation = "destination-in";
  lc.drawImage(maskImg, 0, 0, w, h);
  ctx.drawImage(layer, 0, 0);
}

/** Decode an overlay, for the same reason `prepareBackground` exists. */
export async function prepareOverlay(overlay: Overlay | null): Promise<void> {
  if (!overlay) return;
  if (overlay.blob) await decodeWithin(overlay.blob, "garment");
  if (overlay.mask) await decodeWithin(overlay.mask, "clothing mask");
}

/** Draw subject over background into an existing canvas. */
export function composite(
  canvas: HTMLCanvasElement,
  subject: CanvasImageSource,
  w: number,
  h: number,
  bg: Background,
) {
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D tidak tersedia di peramban ini.");
  ctx.clearRect(0, 0, w, h);
  paintBackground(ctx, bg, w, h);
  ctx.drawImage(subject, 0, 0, w, h);
}

/**
 * Full-resolution export. PNG keeps the alpha channel when the background
 * is transparent; JPEG cannot, so we refuse that combination upstream
 * rather than silently handing back a black-backed image.
 */
/** Chrome refuses a canvas past roughly this many pixels, and a refusal is a
 *  blank export rather than an error. Measured in the browser rather than
 *  taken from a blog post: 16384x16384 allocates, 40960x23040 does not. */
const MAX_CANVAS_PX = 16384 * 16384;

/**
 * Restore the original resolution the model could not carry.
 *
 * The model runs on a shrunk copy — it has to, or a 48 MP photo exhausts
 * the tab. The old export then wrote that shrunk copy out, so a 6000 px
 * source came back at 4096 and a third of the detail was gone for no reason
 * anybody could defend.
 *
 * The reason it was unnecessary: only the *mask* comes from the model. The
 * colour comes from the photograph, which never left the machine at full
 * size. So the original is drawn at its own resolution and the cut-out is
 * used as a stencil over it — `destination-in` keeps the original's pixels
 * exactly where the cut-out is opaque.
 *
 * What that costs is the edge, not the picture: the mask is enlarged, so
 * the boundary is as soft as the model made it. Every pixel inside the
 * subject is the photographer's own.
 */
function stencil(
  source: CanvasImageSource,
  subject: CanvasImageSource,
  w: number,
  h: number,
): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  if (!g) throw new Error("Canvas 2D tidak tersedia di peramban ini.");
  g.imageSmoothingQuality = "high";
  g.drawImage(source, 0, 0, w, h);
  g.globalCompositeOperation = "destination-in";
  g.drawImage(subject, 0, 0, w, h);
  return c;
}

export async function exportImage(
  subject: CanvasImageSource,
  w: number,
  h: number,
  bg: Background,
  format: "image/png" | "image/jpeg" | "image/webp" = "image/png",
  quality = 0.95,
  overlay: Overlay | null = null,
  /** The photograph as it arrived, at its own resolution. When it is larger
   *  than the cut-out, the export is made at *its* size. */
  source: { img: CanvasImageSource; w: number; h: number } | null = null,
  /** Edge contrast, 0 for none. Applied to colour only — never to the
   *  matte, which would put a hard rim around a deliberately soft edge. */
  sharpen: SharpenLevel = 0,
  /** Write the photograph untouched instead of the cut-out. This is what
   *  makes sharpening usable on its own: a reader who only wants a crisper
   *  file, with the background they already had, never has to accept a cut
   *  they did not ask for. */
  keepOriginal = false,
  /** Output multiplier. Resampling only — it enlarges, it does not restore
   *  anything the sensor never recorded, and the interface says so. */
  enlarge = 1,
): Promise<Blob> {
  // Only worth doing when there is detail to recover and the browser will
  // actually allocate the surface.
  const bigger =
    source !== null &&
    source.w > w &&
    source.w * source.h <= MAX_CANVAS_PX;

  const baseW = bigger ? source!.w : w;
  const baseH = bigger ? source!.h : h;

  // Enlargement is refused rather than silently ignored when the result
  // would exceed what the browser will allocate: a canvas past the ceiling
  // comes back blank, and a blank file is worse than a smaller one.
  const wanted = Math.max(1, Math.round(enlarge));
  const fits = baseW * wanted * baseH * wanted <= MAX_CANVAS_PX;
  const factor = fits ? wanted : 1;
  const outW = baseW * factor;
  const outH = baseH * factor;

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D tidak tersedia di peramban ini.");

  // JPEG has no alpha — fill white so the subject does not land on black.
  await prepareBackground(bg);
  await prepareOverlay(overlay);

  if (format === "image/jpeg" && bg.kind === "transparent") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, outW, outH);
  } else {
    paintBackground(ctx, bg, outW, outH);
  }

  if (keepOriginal && source) {
    // No cut at all: the photograph as it arrived, only sharper.
    ctx.drawImage(sharpenTo(source.img, outW, outH, sharpen), 0, 0, outW, outH);
  } else if (bigger) {
    // Sharpen after stencilling, so the operation sees the finished pixels
    // and the alpha it must leave alone is already in place.
    const cut = stencil(source!.img, subject, outW, outH);
    ctx.drawImage(sharpenTo(cut, outW, outH, sharpen), 0, 0);
  } else {
    ctx.drawImage(sharpenTo(subject, outW, outH, sharpen), 0, 0, outW, outH);
  }
  if (overlay) paintOverlay(ctx, overlay, outW, outH, source?.img ?? subject);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("Peramban gagal menulis berkas gambar.")),
      format,
      quality,
    );
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Give the browser a tick to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** "kucing.jpg" → "kucing-mattecut.png" */
export function outputName(original: string, ext: string) {
  const stem = original.replace(/\.[^.]+$/, "") || "gambar";
  return `${stem}-mattecut.${ext}`;
}

/**
 * CSS equivalent of a Background, for the live preview.
 *
 * Previewing through CSS instead of re-rendering a canvas on every colour
 * change is what makes the picker feel instant: changing the background
 * costs a style recalculation, not a repaint of a 12-megapixel bitmap.
 * Returns null for transparent, where the checkerboard shows through.
 */
export function backgroundToCss(bg: Background): string | null {
  if (bg.kind === "transparent") return null;
  if (bg.kind === "solid") return toCss(bg.color);
  if (bg.kind === "image") {
    return `url("${backdropUrl(bg.blob)}") center / ${bg.fit} no-repeat`;
  }
  return `linear-gradient(${bg.angle}deg, ${toCss(bg.from)}, ${toCss(bg.to)})`;
}
