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
