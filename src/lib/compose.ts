import type { Rgba } from "./color";
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
   *  clipped to it, so it can only ever land on cloth — never across a face
   *  and never out onto the background. */
  mask?: Blob | null;
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
export async function prepareBackground(bg: Background): Promise<void> {
  if (bg.kind !== "image" || decoded.has(bg.blob)) return;
  const img = new Image();
  img.src = backdropUrl(bg.blob);
  await img.decode();
  decoded.set(bg.blob, img);
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
) {
  const img = decoded.get(overlay.blob);
  if (!img) {
    console.error("[mattecut] overlay painted before decode");
    return;
  }
  const dw = overlay.w * w;
  const dh = (dw * img.naturalHeight) / img.naturalWidth;
  const x = overlay.x * w;
  const y = overlay.y * h;
  const maskImg = overlay.mask ? decoded.get(overlay.mask) : null;

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
  for (const blob of [overlay.blob, overlay.mask]) {
    if (!blob || decoded.has(blob)) continue;
    const img = new Image();
    img.src = backdropUrl(blob);
    await img.decode();
    decoded.set(blob, img);
  }
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
export async function exportImage(
  subject: CanvasImageSource,
  w: number,
  h: number,
  bg: Background,
  format: "image/png" | "image/jpeg" | "image/webp" = "image/png",
  quality = 0.95,
  overlay: Overlay | null = null,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D tidak tersedia di peramban ini.");

  // JPEG has no alpha — fill white so the subject does not land on black.
  await prepareBackground(bg);
  await prepareOverlay(overlay);

  if (format === "image/jpeg" && bg.kind === "transparent") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
  } else {
    paintBackground(ctx, bg, w, h);
  }
  ctx.drawImage(subject, 0, 0, w, h);
  if (overlay) paintOverlay(ctx, overlay, w, h);

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
