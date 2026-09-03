/**
 * The photograph half of the backdrop catalogue.
 *
 * Six thousand entries is 2.6 MB of JSON. Importing that would put it in
 * the bundle, which means every visitor downloads it before seeing the
 * page — including the ones the lightest model exists for. So it is two
 * static files, fetched the first time somebody opens the photo tab, and
 * never at all for a reader who only wants a colour.
 *
 * The pictures themselves are not here either. Self-hosting them measured
 * 348 KB each, so six thousand would be two gigabytes; they load from
 * Commons when chosen. That is the trade, and it is why `next.config.ts`
 * allows exactly one outside host.
 */

import { VOCAB } from "./vocab";

/** Keys are short because they are repeated six thousand times. */
export type Photo = {
  /** Commons thumbnail URL, at whatever width Commons rounded to. Absent on
   *  offline rows, which carry `f` instead. */
  t?: string;
  /** File stem under /offline, for the rows that ship with the app. */
  f?: string;
  /** File name, cleaned of the "File:" prefix and extension. */
  n: string;
  /** Licence exactly as Commons reported it. */
  l: string;
  /** Author. Mandatory for CC BY, since the credit cannot be given without it. */
  a: string;
  /** The Commons page, so provenance is one click away. */
  p: string;
  /** Lower-cased words the search matches. */
  q: string;
};

/**
 * Two buckets that are never mixed.
 *
 * `public` carries no obligation at all. `by` is free to use but the author
 * must be credited, which the interface does on screen rather than in a
 * disclaimer nobody reads. CC BY-SA, NC and ND were excluded when the index
 * was built: ShareAlike would travel into the composited portrait, and
 * NC/ND forbid the composite outright.
 */
export type Bucket = "public" | "by" | "offline";

const FILES: Record<Bucket, string> = {
  public: "/catalogue/photos.json",
  by: "/catalogue/photos-by.json",
  // The pack that actually ships. Its rows carry a file name instead of a
  // Commons URL, and `photoSrc` below is what tells the two apart.
  offline: "/catalogue/offline.json",
};

const cache: Partial<Record<Bucket, Photo[]>> = {};
const inflight: Partial<Record<Bucket, Promise<Photo[]>>> = {};

/** Fetched once per bucket. Concurrent openers share the one request. */
export function loadPhotos(bucket: Bucket): Promise<Photo[]> {
  const have = cache[bucket];
  if (have) return Promise.resolve(have);

  const running = inflight[bucket];
  if (running) return running;

  const p = fetch(FILES[bucket])
    .then((r) => {
      if (!r.ok) throw new Error(`catalogue ${r.status}`);
      return r.json() as Promise<Photo[]>;
    })
    .then((list) => {
      cache[bucket] = list;
      return list;
    })
    .finally(() => {
      delete inflight[bucket];
    });

  inflight[bucket] = p;
  return p;
}

/**
 * The full-size URL, derived from the thumbnail.
 *
 * Commons thumbnails carry their width in the path, and it is not the width
 * that was requested — ask for 320 and it answers 330. So the number is
 * read out of the URL rather than assumed, and swapped for the size a
 * backdrop actually needs.
 */
export function fullSize(thumb: string, width = 2048): string {
  return thumb.replace(/\/(\d+)px-/, `/${width}px-`);
}

/**
 * Where to load a row's picture from.
 *
 * Offline rows are files in this deployment and need no network at all —
 * that is the entire point of them. Indexed rows are Commons URLs, and the
 * grid asks for the thumbnail while a pick asks for the full size.
 */
export function photoSrc(p: Photo, full = false): string {
  if (p.f) return `/offline/${p.f}.webp`;
  const t = p.t ?? "";
  return full ? fullSize(t) : t;
}

export function searchPhotos(all: Photo[], raw: string): Photo[] {
  const q = raw.trim().toLowerCase();
  if (!q) return all;
  const words = q.split(/\s+/).filter(Boolean).map(expand);

  // Every typed word must match something, but each word may match through
  // any of its translations.
  const strict = all.filter((p) => words.every((alts) => hits(p.q, alts)));
  if (strict.length > 0) return strict;

  // Two words where only one is known should still show the one. An empty
  // screen teaches the reader that the catalogue is small, which is a lie.
  const loose = all.filter((p) => words.some((alts) => hits(p.q, alts)));
  return loose;
}

function hits(hay: string, alts: string[]): boolean {
  for (const a of alts) if (hay.includes(a)) return true;
  return false;
}

/**
 * Everything the index might hold for a word somebody typed.
 *
 * The catalogue stores English, because that is the language of Commons
 * file names and of our own category list. The interface speaks eighteen
 * languages, so a reader typing "perpustakaan" was searching a vocabulary
 * that had never heard of them.
 *
 * Three passes, cheapest first: the word itself, its translations, and —
 * for a typo or a half-typed word — any entry it is the beginning of.
 */
export function expand(word: string): string[] {
  const out = new Set<string>([word]);

  const exact = VOCAB[word];
  if (exact) for (const e of exact) out.add(e);

  if (!exact && word.length >= 3) {
    let found = 0;
    for (const key in VOCAB) {
      if (found >= 4) break;
      if (key.startsWith(word) || word.startsWith(key)) {
        for (const e of VOCAB[key]) out.add(e);
        found++;
      }
    }
  }

  return [...out];
}

/** One line of credit, in the form CC BY asks for: who made it, and under
 *  what. Shown on screen, not buried in a tooltip. */
export function creditLine(p: Photo): string {
  return p.a ? `${p.n} — ${p.a} — ${p.l}` : `${p.n} — ${p.l}`;
}
