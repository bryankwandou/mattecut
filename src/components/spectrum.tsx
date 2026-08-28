"use client";

import { useRef, useState } from "react";
import {
  hsvToRgb,
  rgbToHsv,
  toCss,
  type Hsv,
  type Rgba,
} from "@/lib/color";
import { useI18n } from "@/components/preferences";

/**
 * An in-page colour spectrum, replacing `<input type="color">`.
 *
 * The native input opens the operating system's colour dialog. On Windows
 * that is a separate window that lands on top of the panel and gets clipped
 * by it; on a phone it takes over the whole screen. Neither one can be
 * styled, neither matches the theme, and both make picking a colour feel
 * like leaving the app.
 *
 * This is deliberately built from CSS gradients rather than a canvas. Two
 * stacked gradients over a hue-coloured box *are* the saturation/value
 * square, so there is no bitmap to allocate, nothing to repaint on drag,
 * and nothing that costs more on a cheap phone than on a laptop. The two
 * sliders are real range inputs, which get keyboard and touch handling for
 * free instead of us reimplementing them badly.
 */
export function Spectrum({
  value,
  onChange,
}: {
  value: Rgba;
  onChange: (c: Rgba) => void;
}) {
  const { t } = useI18n();

  // Saturation and brightness read straight off the colour, so there is no
  // second copy of them to keep in step. Hue is the one piece RGB throws
  // away: pure black is hue 0 whichever hue you dimmed to reach it, so
  // driving the strip from the colour alone would snap it back to red every
  // time the user dragged to the bottom edge.
  //
  // So hue is held, and corrected during render whenever a colour arrives
  // that actually carries one — a swatch, a typed hex, a restored draft.
  // That is React's own "adjust state while rendering" pattern rather than
  // an effect: it settles before anything paints, so the strip never shows
  // one hue for a frame and another the next.
  const area = useRef<HTMLDivElement>(null);
  const seen = rgbToHsv(value);
  const [hue, setHue] = useState(seen.h);
  if (seen.s > 0 && seen.v > 0 && seen.h !== hue) setHue(seen.h);
  const hsv: Hsv = { h: hue, s: seen.s, v: seen.v };

  const emit = (next: Hsv, alpha = value.a) => {
    setHue(next.h);
    onChange(hsvToRgb(next, alpha));
  };

  const fromPointer = (e: React.PointerEvent) => {
    const el = area.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    emit({ h: hsv.h, s: x, v: 1 - y });
  };

  const pure = toCss(hsvToRgb({ h: hsv.h, s: 1, v: 1 }, 1));
  const opaque = toCss({ ...value, a: 1 });

  return (
    <div className="space-y-2.5">
      <div
        ref={area}
        role="application"
        aria-label={t.bg.spectrum}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          fromPointer(e);
        }}
        onPointerMove={(e) => {
          if (e.buttons === 1) fromPointer(e);
        }}
        // Without this the browser scrolls the page instead of tracking the
        // finger, which makes the square unusable on a phone.
        className="relative h-32 w-full cursor-crosshair touch-none rounded-lg hairline"
        style={{
          background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${pure})`,
        }}
      >
        <span
          className="pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,.45)]"
          style={{
            left: `${hsv.s * 100}%`,
            top: `${(1 - hsv.v) * 100}%`,
            background: opaque,
          }}
        />
      </div>

      <input
        type="range"
        min={0}
        max={359}
        step={1}
        value={Math.round(hsv.h)}
        aria-label={t.bg.hue}
        onChange={(e) => emit({ ...hsv, h: Number(e.target.value) })}
        className="spectrum-slider"
        style={{
          background:
            "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
        }}
      />

      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={Math.round(value.a * 100)}
        aria-label={t.bg.alpha}
        onChange={(e) => emit(hsv, Number(e.target.value) / 100)}
        className="spectrum-slider checker checker-sm"
        style={{
          backgroundImage: `linear-gradient(to right, transparent, ${opaque})`,
        }}
      />
    </div>
  );
}
