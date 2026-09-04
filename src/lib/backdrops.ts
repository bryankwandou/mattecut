/**
 * A very large backdrop catalogue that costs no bandwidth and no memory.
 *
 * The obvious way to offer half a million backgrounds is to build half a
 * million objects. At roughly 300 bytes each that is 150 MB of heap, which
 * would kill exactly the phones the lightest model exists for — the
 * catalogue would advertise its size by crashing.
 *
 * So nothing is stored. Every swatch is *computed from its index*: give
 * `swatchAt` a number and it decodes which hue, which tone, which scheme
 * and which angle that number means, and returns the colours. The grid asks
 * for the few hundred it is about to draw and never learns the rest exist.
 *
 * Searching works the same way. The words describing a swatch depend only
 * on its family, tone and scheme — not on its step or its angle — so a
 * query is decided against 2,560 combinations rather than 487,680 swatches,
 * and the matches are expanded arithmetically. That is what makes a search
 * over half a million entries finish in a frame on a netbook.
 *
 * This is also the only part of the catalogue with no licence attached. A
 * downloaded photograph carries terms; a computed colour does not.
 */
import { hsvToRgb, toHex, type Rgba } from "./color";
import { expand } from "./photos";

export type Swatch = {
  id: string;
  from: Rgba;
  /** Null for a flat colour. Kept in one shape so the grid has one branch. */
  to: Rgba | null;
  angle: number;
  /** Lower-cased words the search matches against. */
  terms: string;
};

/**
 * Hue families, at the centre of each band.
 *
 * Names are what someone would actually type. Thirty-two of them rather
 * than sixteen, because a name is how a colour is found: doubling the
 * families doubles the vocabulary, while doubling the steps only makes
 * finer versions of colours nobody can name.
 */
const FAMILIES: { name: string; hue: number }[] = [
  { name: "red", hue: 0 },
  { name: "scarlet", hue: 12 },
  { name: "vermilion", hue: 22 },
  { name: "orange", hue: 30 },
  { name: "tangerine", hue: 38 },
  { name: "amber", hue: 45 },
  { name: "gold", hue: 50 },
  { name: "yellow", hue: 60 },
  { name: "citron", hue: 70 },
  { name: "lime", hue: 80 },
  { name: "chartreuse", hue: 90 },
  { name: "grass", hue: 105 },
  { name: "green", hue: 120 },
  { name: "emerald", hue: 140 },
  { name: "jade", hue: 155 },
  { name: "teal", hue: 165 },
  { name: "turquoise", hue: 175 },
  { name: "cyan", hue: 185 },
  { name: "aqua", hue: 192 },
  { name: "sky", hue: 200 },
  { name: "azure", hue: 210 },
  { name: "blue", hue: 220 },
  { name: "cobalt", hue: 232 },
  { name: "indigo", hue: 250 },
  { name: "violet", hue: 275 },
  { name: "purple", hue: 290 },
  { name: "orchid", hue: 300 },
  { name: "magenta", hue: 310 },
  { name: "fuchsia", hue: 320 },
  { name: "pink", hue: 330 },
  { name: "rose", hue: 345 },
  { name: "crimson", hue: 352 },
];

/** Twelve steps per family, so each name covers a real range rather than
 *  one arbitrary point. */
const STEPS = [-7, -6, -5, -4, -2, -1, 1, 2, 4, 5, 6, 7];

/** Saturation and value, named the way a person describes a backdrop. */
const TONES: { name: string; s: number; v: number }[] = [
  { name: "pastel soft", s: 0.14, v: 0.99 },
  { name: "pale wash", s: 0.22, v: 0.96 },
  { name: "light", s: 0.34, v: 0.92 },
  { name: "bright clear", s: 0.5, v: 0.95 },
  { name: "vivid strong", s: 0.78, v: 0.9 },
  { name: "studio mid", s: 0.55, v: 0.74 },
  { name: "muted dusty", s: 0.28, v: 0.66 },
  { name: "deep rich", s: 0.72, v: 0.55 },
  { name: "dark shadow", s: 0.66, v: 0.36 },
  { name: "near black ink", s: 0.5, v: 0.2 },
];

/**
 * How the second colour relates to the first. The first entry is the solid
 * case and is counted separately, because a flat colour has no angle and
 * pretending otherwise would file the same swatch eighteen times.
 */
const SCHEMES: { name: string; shift: number; lift: number }[] = [
  { name: "flat plain solid", shift: 0, lift: 0 },
  { name: "fade mono", shift: 0, lift: 0.18 },
  { name: "deep fade", shift: 0, lift: -0.22 },
  { name: "warm analogous", shift: 28, lift: 0.1 },
  { name: "cool analogous", shift: -28, lift: 0.1 },
  { name: "split warm", shift: 58, lift: 0.08 },
  { name: "triad", shift: 120, lift: 0.06 },
  { name: "complement contrast", shift: 180, lift: 0.04 },
];

/** Every twenty degrees. Eighteen is a divisor of 360, so the set is even
 *  all the way round rather than crowding one diagonal. */
const ANGLES = Array.from({ length: 18 }, (_, i) => i * 20);

const NF = FAMILIES.length;
const NST = STEPS.length;
const NT = TONES.length;
const NSC = SCHEMES.length;
const NA = ANGLES.length;
/** Gradient schemes only — the flat one lives in its own block. */
const NG = NSC - 1;

/** Colours: one per family, step and tone. */
const FLAT_COUNT = NF * NST * NT;
/** Gradients: each of those colours, in each gradient scheme, at each angle. */
const GRAD_COUNT = FLAT_COUNT * NG * NA;

/**
 * The size of the catalogue.
 *
 * Printed in the interface from this constant rather than written into a
 * sentence, so the number on screen cannot drift away from the code that
 * produces it.
 */
export const TOTAL = FLAT_COUNT + GRAD_COUNT;

function wrap(h: number) {
  return ((h % 360) + 360) % 360;
}

/** The words for a family, tone and scheme. Deliberately independent of
 *  step and angle: that is what lets a search decide 2,560 combinations
 *  instead of half a million swatches. */
function termsFor(fam: number, tone: number, scheme: number): string {
  const g = scheme === 0 ? "" : " gradient";
  return `${FAMILIES[fam].name} ${TONES[tone].name} ${SCHEMES[scheme].name}${g}`.toLowerCase();
}

function colourAt(fam: number, step: number, tone: number): Rgba {
  const hue = wrap(FAMILIES[fam].hue + STEPS[step]);
  return hsvToRgb({ h: hue, s: TONES[tone].s, v: TONES[tone].v });
}

/** The one function the grid needs: index in, swatch out, nothing stored. */
export function swatchAt(i: number): Swatch {
  if (i < FLAT_COUNT) {
    const tone = i % NT;
    const rest = (i - tone) / NT;
    const step = rest % NST;
    const fam = (rest - step) / NST;
    return {
      id: `s${i}`,
      from: colourAt(fam, step, tone),
      to: null,
      angle: 0,
      terms: termsFor(fam, tone, 0),
    };
  }

  let g = i - FLAT_COUNT;
  const angle = g % NA;
  g = (g - angle) / NA;
  const gs = g % NG;
  g = (g - gs) / NG;
  const tone = g % NT;
  g = (g - tone) / NT;
  const step = g % NST;
  const fam = (g - step) / NST;

  const scheme = gs + 1;
  const hue = wrap(FAMILIES[fam].hue + STEPS[step]);
  const t = TONES[tone];
  const sc = SCHEMES[scheme];

  return {
    id: `g${i}`,
    from: hsvToRgb({ h: hue, s: t.s, v: t.v }),
    to: hsvToRgb({
      h: wrap(hue + sc.shift),
      s: Math.max(0.05, Math.min(1, t.s * 0.85)),
      v: Math.max(0.04, Math.min(1, t.v + sc.lift)),
    }),
    angle: ANGLES[angle],
    terms: termsFor(fam, tone, scheme),
  };
}

/** CSS for one swatch, used by both the grid cell and the preview. */
export function swatchCss(s: Swatch): string {
  const a = toHex(s.from);
  if (!s.to) return a;
  return `linear-gradient(${s.angle}deg, ${a}, ${toHex(s.to)})`;
}

/**
 * A result set that is never materialised.
 *
 * `count` is exact and `at` is arithmetic, so a query matching two hundred
 * thousand swatches costs the same memory as one matching three.
 */
export type Selection = {
  count: number;
  at(k: number): Swatch;
};

const EVERYTHING: Selection = { count: TOTAL, at: swatchAt };

/** Looks like a colour someone copied out of a brand guideline. */
const HEXISH = /^#?[0-9a-f]{6}$/i;

/** How many of the nearest colours a hex query offers. Enough to choose
 *  from, few enough that the answer is still "close to what you asked". */
const NEAREST = 96;

function parseHex(raw: string): { r: number; g: number; b: number } | null {
  const h = raw.startsWith("#") ? raw.slice(1) : raw;
  if (h.length !== 6) return null;
  const n = Number.parseInt(h, 16);
  if (Number.isNaN(n)) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/**
 * Filter by typed text.
 *
 * Two paths, because the two kinds of query have different costs. Words are
 * decided against family/tone/scheme combinations and expanded; a hex code
 * has to be compared against real colours, so that path walks the 3,840
 * distinct colours instead — still small, and only taken when the query
 * actually looks like a hex.
 */
export function select(raw: string): Selection {
  const q = raw.trim().toLowerCase();
  if (!q) return EVERYTHING;

  const words = q.split(/\s+/).filter(Boolean);
  const hexes = words.filter((w) => HEXISH.test(w));
  const plain = words.filter((w) => !HEXISH.test(w)).map(expand);

  // Which (family, tone) pairs pass as flat colours, and which
  // (family, tone, gradient scheme) triples pass as gradients.
  const flatKeys: number[] = [];
  const gradKeys: number[] = [];

  const hit = (hay: string, alts: string[]) => alts.some((a) => hay.includes(a));
  const passes = (hay: string, every: boolean) =>
    plain.length === 0
      ? true
      : every
        ? plain.every((alts) => hit(hay, alts))
        : plain.some((alts) => hit(hay, alts));

  const build = (every: boolean) => {
    flatKeys.length = 0;
    gradKeys.length = 0;
    for (let fam = 0; fam < NF; fam++) {
      for (let tone = 0; tone < NT; tone++) {
        if (passes(termsFor(fam, tone, 0), every)) flatKeys.push(fam * NT + tone);
        for (let gs = 0; gs < NG; gs++) {
          if (passes(termsFor(fam, tone, gs + 1), every)) {
            gradKeys.push((fam * NT + tone) * NG + gs);
          }
        }
      }
    }
  };

  build(true);
  // An empty screen teaches the reader the catalogue is small, which is
  // untrue. Falling back to any-word keeps a partial match visible.
  if (flatKeys.length === 0 && gradKeys.length === 0) build(false);

  // A hex code is a different question. Nobody typing #1f6fff wants an
  // exact match — no generated colour will ever equal an arbitrary hex, and
  // demanding one is why this returned nothing at all. They want the
  // closest backdrop to a brand colour, so the 3,840 distinct colours are
  // ranked by distance and the nearest are offered.
  if (hexes.length > 0) {
    const want = parseHex(hexes[0]);
    if (want) {
      const scored: { i: number; d: number }[] = [];
      for (let fam = 0; fam < NF; fam++) {
        for (let st = 0; st < NST; st++) {
          for (let tone = 0; tone < NT; tone++) {
            const c = colourAt(fam, st, tone);
            const dr = c.r - want.r;
            const dg = c.g - want.g;
            const db = c.b - want.b;
            scored.push({
              i: (fam * NST + st) * NT + tone,
              d: dr * dr + dg * dg + db * db,
            });
          }
        }
      }
      scored.sort((a, b) => a.d - b.d);
      const bases = scored.slice(0, NEAREST).map((x) => x.i);
      const gradPer = NG * NA;
      return {
        count: bases.length * (1 + gradPer),
        at(k: number): Swatch {
          const which = Math.floor(k / (1 + gradPer));
          const rem = k % (1 + gradPer);
          const flat = bases[which];
          if (rem === 0) return swatchAt(flat);
          const g = rem - 1;
          return swatchAt(FLAT_COUNT + flat * gradPer + g);
        },
      };
    }
  }

  const stepList = Array.from({ length: NST }, (_, i) => i);
  const NS = stepList.length;

  const flatTotal = flatKeys.length * NS;
  const gradTotal = gradKeys.length * NS * NA;

  return {
    count: flatTotal + gradTotal,
    at(k: number): Swatch {
      if (k < flatTotal) {
        const key = flatKeys[Math.floor(k / NS)];
        const step = stepList[k % NS];
        const tone = key % NT;
        const fam = (key - tone) / NT;
        return swatchAt((fam * NST + step) * NT + tone);
      }
      let r = k - flatTotal;
      const angle = r % NA;
      r = (r - angle) / NA;
      const step = stepList[r % NS];
      r = (r - (r % NS)) / NS;
      const key = gradKeys[r];
      const gs = key % NG;
      const rest = (key - gs) / NG;
      const tone = rest % NT;
      const fam = (rest - tone) / NT;
      return swatchAt(
        FLAT_COUNT + (((fam * NST + step) * NT + tone) * NG + gs) * NA + angle,
      );
    },
  };
}
