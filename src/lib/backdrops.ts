/**
 * A large backdrop catalogue that costs no bandwidth.
 *
 * The obvious way to offer thousands of backgrounds is to ship thousands of
 * photographs. For this product that is close to the worst possible choice:
 * the people the lightest model exists for are on slow connections and old
 * phones, and a photo library is measured in megabytes per pick. Everything
 * here is generated from a few numbers instead — the whole catalogue costs
 * one array of integers and renders as CSS.
 *
 * It is also the only version with no licence attached to it. A downloaded
 * photograph carries terms; a computed colour does not.
 */
import { hsvToRgb, toHex, type Rgba } from "./color";
import { expand } from "./photos";

export type Swatch = {
  id: string;
  from: Rgba;
  /** Null for a flat colour. Kept in one shape so the grid has one branch. */
  to: Rgba | null;
  angle: number;
  /** Lower-cased words the search matches against. English for now, which
   *  is a real limitation and not a hidden one. */
  terms: string;
};

/** Hue families, at the centre of each band. Names are what someone would
 *  actually type, which is why "lime" and "teal" are here and "chartreuse"
 *  is not. */
const FAMILIES: { name: string; hue: number }[] = [
  { name: "red", hue: 0 },
  { name: "orange", hue: 30 },
  { name: "amber", hue: 45 },
  { name: "yellow", hue: 60 },
  { name: "lime", hue: 80 },
  { name: "green", hue: 120 },
  { name: "teal", hue: 165 },
  { name: "cyan", hue: 185 },
  { name: "sky", hue: 200 },
  { name: "blue", hue: 220 },
  { name: "indigo", hue: 250 },
  { name: "violet", hue: 275 },
  { name: "purple", hue: 290 },
  { name: "magenta", hue: 310 },
  { name: "pink", hue: 330 },
  { name: "rose", hue: 345 },
];

/** Four steps per family, so each name covers a real range rather than one
 *  arbitrary point. */
const STEPS = [-6, -2, 2, 6];

/** Saturation and value, named the way a person describes a backdrop. */
const TONES: { name: string; s: number; v: number }[] = [
  { name: "pastel soft", s: 0.18, v: 0.98 },
  { name: "light", s: 0.34, v: 0.92 },
  { name: "studio mid", s: 0.55, v: 0.74 },
  { name: "deep dark", s: 0.72, v: 0.42 },
];

/** How the second colour relates to the first. "flat" is the solid case. */
const SCHEMES: { name: string; shift: number; lift: number }[] = [
  { name: "flat plain solid", shift: 0, lift: 0 },
  { name: "fade mono", shift: 0, lift: 0.18 },
  { name: "warm analogous", shift: 28, lift: 0.1 },
  { name: "cool analogous", shift: -28, lift: 0.1 },
  { name: "triad", shift: 120, lift: 0.06 },
  { name: "complement contrast", shift: 180, lift: 0.04 },
];

const ANGLES = [0, 45, 90, 135, 180, 315];

function wrap(h: number) {
  return ((h % 360) + 360) % 360;
}

/**
 * Build the whole catalogue once, lazily.
 *
 * Roughly five thousand entries, and the exact figure is whatever this
 * function returns — printed in the UI from `catalogue().length` rather
 * than written into a sentence that could drift away from the code.
 */
let cache: Swatch[] | null = null;

export function catalogue(): Swatch[] {
  if (cache) return cache;
  const out: Swatch[] = [];

  for (const fam of FAMILIES) {
    for (const step of STEPS) {
      const hue = wrap(fam.hue + step);
      for (const tone of TONES) {
        const from = hsvToRgb({ h: hue, s: tone.s, v: tone.v });

        for (const scheme of SCHEMES) {
          if (scheme.shift === 0 && scheme.lift === 0) {
            // The flat colour: one entry, no angle to vary.
            out.push({
              id: `s-${hue}-${tone.name}-flat`,
              from,
              to: null,
              angle: 0,
              terms: `${fam.name} ${tone.name} ${scheme.name}`.toLowerCase(),
            });
            continue;
          }
          const to = hsvToRgb({
            h: wrap(hue + scheme.shift),
            s: Math.max(0.05, Math.min(1, tone.s * 0.85)),
            v: Math.max(0.05, Math.min(1, tone.v + scheme.lift)),
          });
          for (const angle of ANGLES) {
            out.push({
              id: `g-${hue}-${tone.name}-${scheme.name}-${angle}`,
              from,
              to,
              angle,
              terms:
                `${fam.name} ${tone.name} ${scheme.name} gradient ${angle}`.toLowerCase(),
            });
          }
        }
      }
    }
  }

  cache = out;
  return out;
}

/** CSS for one swatch, used by both the grid cell and the preview. */
export function swatchCss(s: Swatch): string {
  const a = toHex(s.from);
  if (!s.to) return a;
  return `linear-gradient(${s.angle}deg, ${a}, ${toHex(s.to)})`;
}

/**
 * Filter by typed text.
 *
 * Matches the descriptive words and the hex code, because someone holding a
 * brand guideline types "#1f6fff" and someone choosing a backdrop types
 * "soft blue". Both should work.
 */
export function search(all: Swatch[], raw: string): Swatch[] {
  const q = raw.trim().toLowerCase();
  if (!q) return all;

  // The colour names are English in the data and the interface is not, so a
  // reader typing "biru" was searching a vocabulary that had never heard of
  // them. Each word carries its translations with it.
  const words = q.split(/\s+/).filter(Boolean).map(expand);
  const match = (hay: string, alts: string[]) => alts.some((a) => hay.includes(a));

  const hay = (s: Swatch) =>
    `${s.terms} ${toHex(s.from)} ${s.to ? toHex(s.to) : ""}`;

  const strict = all.filter((s) => words.every((alts) => match(hay(s), alts)));
  if (strict.length > 0) return strict;
  return all.filter((s) => words.some((alts) => match(hay(s), alts)));
}
