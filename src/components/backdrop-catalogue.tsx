"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { catalogue, search, swatchCss, type Swatch } from "@/lib/backdrops";
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

/**
 * The backdrop catalogue, in a window of its own.
 *
 * Two things drove the shape. It is not in the sidebar because eight
 * thousand swatches in a 280 px column is not a catalogue, it is a hazard.
 * And it draws only the rows on screen: the machines this product is being
 * hardened for cannot hold eight thousand DOM nodes, and putting them there
 * would undo the low-power work in a different file.
 */
export function BackdropCatalogue({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (from: Rgba, to: Rgba | null, angle: number) => void;
}) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [scrollTop, setScrollTop] = useState(0);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const scroller = useRef<HTMLDivElement>(null);

  const all = useMemo(() => catalogue(), []);
  const shown = useMemo(() => search(all, query), [all, query]);

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

  if (!open) return null;

  const cols = Math.max(1, Math.floor((box.w + GAP) / ROW));
  const rows = Math.ceil(shown.length / cols);
  const first = Math.max(0, Math.floor(scrollTop / ROW) - OVERSCAN);
  const last = Math.min(rows, Math.ceil((scrollTop + box.h) / ROW) + OVERSCAN);
  const slice: Swatch[] = shown.slice(first * cols, last * cols);

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
              {fill(t.bg.catalogueCount, { n: shown.length })}
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

        <div className="border-b border-line p-3">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              // A new result set with the old offset lands the reader in the
              // middle of nowhere.
              setScrollTop(0);
              scroller.current?.scrollTo({ top: 0 });
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
          {shown.length === 0 ? (
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
                {slice.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onPick(s.from, s.to, s.angle)}
                    title={s.terms}
                    aria-label={s.terms}
                    className="h-16 rounded-lg border border-line transition-transform hover:scale-105"
                    style={{ background: swatchCss(s) }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
