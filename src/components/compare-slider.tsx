"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/preferences";

/**
 * Before/after comparison.
 *
 * Pointer Events rather than separate mouse/touch handlers, so a finger
 * on a phone and a mouse on a laptop take the identical code path.
 * Keyboard arrows move the divider too — the comparison is the core of
 * the product and should not be mouse-only.
 *
 * The chips and the divider keep a dark scrim in both themes on purpose:
 * they sit on top of the user's photo, whose brightness is unknown.
 */
export function CompareSlider({
  before,
  after,
  backdrop = null,
  className = "",
}: {
  before: string;
  after: string;
  /** CSS background for the result side; null shows the checkerboard. */
  backdrop?: string | null;
  className?: string;
}) {
  const { t } = useI18n();
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  const setFromClientX = useCallback((clientX: number) => {
    const el = box.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.width === 0) return;
    const pct = ((clientX - r.left) / r.width) * 100;
    setPos(Math.max(0, Math.min(100, pct)));
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => setFromClientX(e.clientX);
    const up = () => setDragging(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [dragging, setFromClientX]);

  return (
    <div
      ref={box}
      dir="ltr"
      className={`relative select-none overflow-hidden rounded-xl hairline ${className}`}
      style={{ touchAction: "pan-y" }}
      onPointerDown={(e) => {
        setDragging(true);
        setFromClientX(e.clientX);
      }}
    >
      {/* Original, full width underneath. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={before}
        alt={t.compare.altBefore}
        className="block w-full"
        draggable={false}
      />

      {/* Result, revealed from the left edge to the divider. */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <div
          className={`absolute inset-0 ${backdrop ? "" : "checker"}`}
          style={backdrop ? { background: backdrop } : undefined}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={after}
          alt={t.compare.altAfter}
          className="absolute inset-0 block h-full w-full"
          draggable={false}
        />
      </div>

      {/* Divider + grab handle. */}
      <div
        className="pointer-events-none absolute inset-y-0 w-px"
        style={{ left: `${pos}%`, background: "var(--scrim-line)" }}
      />
      <button
        type="button"
        role="slider"
        aria-label={t.compare.sliderLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        onKeyDown={(e) => {
          const step = e.shiftKey ? 10 : 2;
          if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - step));
          if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + step));
          if (e.key === "Home") setPos(0);
          if (e.key === "End") setPos(100);
        }}
        className="absolute top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full backdrop-blur transition-transform hover:scale-110 active:scale-95"
        style={{
          left: `${pos}%`,
          cursor: "ew-resize",
          background: "var(--scrim)",
          border: "1px solid var(--scrim-line)",
          color: "var(--scrim-fg)",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M6 3 2 8l4 5M10 3l4 5-4 5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Tag className="left-3">{t.compare.before}</Tag>
      <Tag className="right-3">{t.compare.after}</Tag>
    </div>
  );
}

function Tag({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`mono pointer-events-none absolute bottom-3 rounded-md px-2 py-1 text-[10px] font-medium uppercase tracking-[0.14em] backdrop-blur ${className}`}
      style={{ background: "var(--scrim)", color: "var(--scrim-fg)" }}
    >
      {children}
    </span>
  );
}
