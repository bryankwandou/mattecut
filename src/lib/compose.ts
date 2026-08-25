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
  | { kind: "gradient"; from: Rgba; to: Rgba; angle: number };

export function paintBackground(
  ctx: CanvasRenderingContext2D,
  bg: Background,
  w: number,
  h: number,
) {
  if (bg.kind === "transparent") return;

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
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D tidak tersedia di peramban ini.");

  // JPEG has no alpha — fill white so the subject does not land on black.
  if (format === "image/jpeg" && bg.kind === "transparent") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
  } else {
    paintBackground(ctx, bg, w, h);
  }
  ctx.drawImage(subject, 0, 0, w, h);

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

/** "kucing.jpg" → "kucing-roto.png" */
export function outputName(original: string, ext: string) {
  const stem = original.replace(/\.[^.]+$/, "") || "gambar";
  return `${stem}-roto.${ext}`;
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
  return `linear-gradient(${bg.angle}deg, ${toCss(bg.from)}, ${toCss(bg.to)})`;
}
