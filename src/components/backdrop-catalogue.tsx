"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, X } from "lucide-react";
import { catalogue, search, swatchCss, type Swatch } from "@/lib/backdrops";
import {
  creditLine,
  fullSize,
  loadPhotos,
  searchPhotos,
  type Bucket,
  type Photo,
} from "@/lib/photos";
import { useI18n } from "@/components/preferences";
import { fill } from "@/lib/i18n";
import type { Rgba } from "@/lib/color";

/** Cell and gap in pixels. Fixed, because the windowing arithmetic below
 *  needs a row height it can trust more than it needs fluid cells. */
const CELL = 64;
const GAP = 8;
const ROW = CELL + GAP;
/** Rows drawn beyond the viewport, so a flick does not reveal blank space. */
const OVERSCAN = 3;

type Tab = "colours" | "public" | "by";

/**
 * The backdrop catalogue, in a window of its own.
 *
 * Three things drove the shape. It is not in the sidebar because thousands
 * of swatches in a 280 px column is not a catalogue, it is a hazard. It
 * draws only the rows on screen, because the machines this product is being
 * hardened for cannot hold eight thousand DOM nodes. And the photo lists
 * are fetched on the first visit to their tab rather than imported, so a
 * reader who only wants a colour never pays 2.6 MB for the ones they did
 * not open.
 */
export function BackdropCatalogue({
  open,
  onClose,
  onPick,
  onPickPhoto,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (from: Rgba, to: Rgba | null, angle: number) => void;
  onPickPhoto: (blob: Blob, credit: string | null) => void;
}) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("colours");
  const [scrollTop, setScrollTop] = useState(0);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [photos, setPhotos] = useState<Partial<Record<Bucket, Photo[]>>>({});
  /** Buckets whose fetch failed, so a retry is a tab switch away rather than
   *  a reload. Derived state below keeps the effect free of synchronous
   *  setState, which React warns about for good reason. */
  const [broken, setBroken] = useState<Bucket[]>([]);
  const [pickFailed, setPickFailed] = useState(false);
  /** Which cell is being fetched, so a slow connection shows progress on the
   *  thing that was actually pressed. */
  const [fetching, setFetching] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  const all = useMemo(() => catalogue(), []);
  const shown = useMemo(() => search(all, query), [all, query]);

  const bucket: Bucket | null = tab === "colours" ? null : tab;
  const list = bucket ? photos[bucket] : undefined;
  const shownPhotos = useMemo(
    () => (list ? searchPhotos(list, query) : []),
    [list, query],
  );

  // Escape closes. A modal that traps someone on a slow phone is worse than
  // no modal at all.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // The list arrives only when its tab is first opened.
  useEffect(() => {
    if (!open || !bucket || photos[bucket]) return;
    let alive = true;
    void loadPhotos(bucket)
      .then((rows) => {
        if (alive) setPhotos((p) => ({ ...p, [bucket]: rows }));
      })
      .catch(() => {
        if (alive) setBroken((b) => (b.includes(bucket) ? b : [...b, bucket]));
      });
    return () => {
      alive = false;
    };
  }, [open, bucket, photos]);

  // Measure rather than assume: the column count decides the windowing, and
  // guessing it wrong leaves gaps or clips rows.
  useEffect(() => {
    if (!open) return;
    const el = scroller.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setBox({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    setBox({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, [open]);

  // Derived, not stored: a bucket is loading exactly when its tab is open,
  // its rows are absent, and nothing has failed.
  const failed = pickFailed || (bucket !== null && broken.includes(bucket));
  const loading = bucket !== null && !list && !failed;

  if (!open) return null;

  const total = tab === "colours" ? shown.length : shownPhotos.length;
  const cols = Math.max(1, Math.floor((box.w + GAP) / ROW));
  const rows = Math.ceil(total / cols);
  const first = Math.max(0, Math.floor(scrollTop / ROW) - OVERSCAN);
  const last = Math.min(rows, Math.ceil((scrollTop + box.h) / ROW) + OVERSCAN);
  const colourSlice: Swatch[] =
    tab === "colours" ? shown.slice(first * cols, last * cols) : [];
  const photoSlice: Photo[] =
    tab === "colours" ? [] : shownPhotos.slice(first * cols, last * cols);

  const toTop = () => {
    setScrollTop(0);
    scroller.current?.scrollTo({ top: 0 });
  };

  const count =
    tab === "colours"
      ? t.bg.catalogueCount
      : tab === "public"
        ? t.bg.cataloguePhotoCount
        : t.bg.catalogueByCount;

  const takePhoto = async (p: Photo) => {
    setFetching(p.t);
    try {
      const res = await fetch(fullSize(p.t));
      const blob = await res.blob();
      // Only CC BY carries an obligation, so only CC BY sends a credit back.
      onPickPhoto(blob, tab === "by" ? creditLine(p) : null);
    } catch {
      setPickFailed(true);
    } finally {
      setFetching(null);
    }
  };

  const tabs: [Tab, string][] = [
    ["colours", t.bg.catalogueTabGradients],
    ["public", t.bg.catalogueTabPhotos],
    ["by", "CC BY"],
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t.bg.catalogueTitle}
    >
      <button
        className="absolute inset-0 bg-ink/60"
        aria-label={t.common.close}
        onClick={onClose}
      />

      <div className="relative flex h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-2xl">
        <div className="flex items-center gap-3 border-b border-line p-4">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-semibold">
              {t.bg.catalogueTitle}
            </h2>
            <p className="mono mt-0.5 text-[10px] text-text-faint">
              {fill(count, { n: total })}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label={t.common.close}
            className="rounded-lg border border-line p-2 transition-colors hover:border-text-faint"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex gap-1.5 border-b border-line px-3 pt-3">
          {tabs.map(([key, label]) => (
            <button
              key={key}
              onClick={() => {
                setTab(key);
                setPickFailed(false);
                toTop();
              }}
              aria-pressed={tab === key}
              className={`rounded-t-lg border-b-2 px-3 py-2 text-xs font-medium transition-colors ${
                tab === key
                  ? "border-accent text-text"
                  : "border-transparent text-text-faint hover:text-text"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="border-b border-line p-3">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              // A new result set with the old offset lands the reader in the
              // middle of nowhere.
              toTop();
            }}
            placeholder={t.bg.catalogueSearch}
            className="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm outline-none placeholder:text-text-faint"
          />
        </div>

        <div
          ref={scroller}
          onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
          className="flex-1 overflow-y-auto p-3"
        >
          {loading ? (
            <p
              className="flex items-center justify-center gap-2 p-6 text-xs text-text-faint"
              role="status"
            >
              <Loader2 size={13} className="animate-spin" />
              {t.progress.working}
            </p>
          ) : failed ? (
            <p className="p-6 text-center text-xs text-text-faint">
              {t.bg.catalogueFailed}
            </p>
          ) : total === 0 ? (
            <p className="p-6 text-center text-xs text-text-faint">
              {t.bg.catalogueEmpty}
            </p>
          ) : (
            // One tall spacer holds the scrollbar honest; only the visible
            // rows are translated into place inside it.
            <div style={{ height: rows * ROW - GAP, position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  top: first * ROW,
                  left: 0,
                  right: 0,
                  display: "grid",
                  gridTemplateColumns: `repeat(${cols}, ${CELL}px)`,
                  gap: GAP,
                  justifyContent: "space-between",
                }}
              >
                {colourSlice.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onPick(s.from, s.to, s.angle)}
                    title={s.terms}
                    aria-label={s.terms}
                    className="h-16 rounded-lg border border-line transition-transform hover:scale-105"
                    style={{ background: swatchCss(s) }}
                  />
                ))}
                {photoSlice.map((p) => (
                  <button
                    key={p.t}
                    onClick={() => void takePhoto(p)}
                    disabled={fetching !== null}
                    // The licence and the author travel with the picture, so
                    // "where did this come from" is answerable on the spot.
                    title={creditLine(p)}
                    aria-label={creditLine(p)}
                    className="relative h-16 overflow-hidden rounded-lg border border-line bg-cover bg-center transition-transform hover:scale-105 disabled:opacity-60"
                    style={{ backgroundImage: `url("${p.t}")` }}
                  >
                    {fetching === p.t && (
                      <span className="absolute inset-0 grid place-items-center bg-ink/50">
                        <Loader2 size={14} className="animate-spin text-white" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
