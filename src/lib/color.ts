/**
 * Colour input parsing.
 *
 * The brief asks for two entry formats — HEX and rgb(). We accept both,
 * plus the shorthands people actually type (#f00, rgba with alpha, and
 * bare hex without the hash), because rejecting those reads as a bug to
 * the person typing them.
 */

export type Rgba = { r: number; g: number; b: number; a: number };

const clamp255 = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
const clamp1 = (n: number) => Math.max(0, Math.min(1, n));

/** Returns null for anything we cannot read, so callers can show a hint. */
export function parseColor(raw: string): Rgba | null {
  const s = raw.trim().toLowerCase();
  if (!s) return null;

  // rgb(255, 0, 0) · rgba(255 0 0 / 50%) · rgb(255 0 0)
  const fn = s.match(/^rgba?\(([^)]+)\)$/);
  if (fn) {
    const parts = fn[1]
      .replace(/\//g, " ")
      .split(/[\s,]+/)
      .filter(Boolean);
    if (parts.length < 3 || parts.length > 4) return null;

    const chan = (p: string) => {
      if (p.endsWith("%")) {
        const v = parseFloat(p);
        return Number.isFinite(v) ? clamp255((v / 100) * 255) : null;
      }
      const v = parseFloat(p);
      return Number.isFinite(v) ? clamp255(v) : null;
    };

    const r = chan(parts[0]);
    const g = chan(parts[1]);
    const b = chan(parts[2]);
    if (r === null || g === null || b === null) return null;

    let a = 1;
    if (parts.length === 4) {
      const p = parts[3];
      const v = parseFloat(p);
      if (!Number.isFinite(v)) return null;
      a = clamp1(p.endsWith("%") ? v / 100 : v);
    }
    return { r, g, b, a };
  }

  // #f00 · #ff0000 · #ff0000cc · and the same without the leading hash
  const hex = s.startsWith("#") ? s.slice(1) : s;
  if (!/^[0-9a-f]+$/.test(hex)) return null;

  const dup = (c: string) => parseInt(c + c, 16);
  if (hex.length === 3)
    return { r: dup(hex[0]), g: dup(hex[1]), b: dup(hex[2]), a: 1 };
  if (hex.length === 4)
    return {
      r: dup(hex[0]),
      g: dup(hex[1]),
      b: dup(hex[2]),
      a: dup(hex[3]) / 255,
    };
  if (hex.length === 6)
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
      a: 1,
    };
  if (hex.length === 8)
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
      a: parseInt(hex.slice(6, 8), 16) / 255,
    };

  return null;
}

export function toCss({ r, g, b, a }: Rgba): string {
  return a >= 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${+a.toFixed(3)})`;
}

export function toHex({ r, g, b, a }: Rgba): string {
  const h = (n: number) => n.toString(16).padStart(2, "0");
  const base = `#${h(r)}${h(g)}${h(b)}`;
  return a >= 1 ? base : `${base}${h(Math.round(a * 255))}`;
}

/** Pick black or white text for a swatch so the label stays readable. */
export function readableOn({ r, g, b }: Rgba): "#000" | "#fff" {
  // Rec. 709 luma — close enough for a swatch label, and cheap.
  const luma = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luma > 0.55 ? "#000" : "#fff";
}

/**
 * HSV is what a colour *picker* is shaped like: one square of saturation
 * against value, one strip of hue. RGB is what a screen is shaped like.
 * The two conversions below are the seam between them, and they are the
 * only reason the spectrum control can exist.
 */
export type Hsv = { h: number; s: number; v: number };

export function rgbToHsv({ r, g, b }: Rgba): Hsv {
  const R = r / 255;
  const G = g / 255;
  const B = b / 255;
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const d = max - min;

  let h = 0;
  if (d !== 0) {
    if (max === R) h = ((G - B) / d) % 6;
    else if (max === G) h = (B - R) / d + 2;
    else h = (R - G) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  // Grey has no hue to speak of; 0 is as good an answer as any, and it
  // keeps the hue strip from jumping when the user drags into the corner.
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

export function hsvToRgb({ h, s, v }: Hsv, a = 1): Rgba {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  const seg = Math.floor(h / 60) % 6;
  const [R, G, B] = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ][seg < 0 ? seg + 6 : seg];
  return {
    r: Math.round((R + m) * 255),
    g: Math.round((G + m) * 255),
    b: Math.round((B + m) * 255),
    a,
  };
}
