"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { parseColor, toCss, toHex, type Rgba } from "@/lib/color";
import type { Background } from "@/lib/compose";
import { useI18n } from "@/components/preferences";

/** Labels live in the dictionaries; only the values live here, indexed by
 *  position so a translator never has to touch a hex code. */
const PRESETS = [
  "#ffffff",
  "#0b0b0d",
  "#e5e5e3",
  "#ff5a1f",
  "#1f6fff",
  "#e03131",
  "#00b140",
  "#f5ead6",
] as const;

const GRADIENTS: { from: string; to: string; angle: number }[] = [
  { from: "#ff5a1f", to: "#ffb800", angle: 45 },
  { from: "#e8e8ea", to: "#b9bec7", angle: 90 },
  { from: "#0b0b0d", to: "#2a2a32", angle: 135 },
  { from: "#1f6fff", to: "#7ce0ff", angle: 60 },
];

export function BackgroundPicker({
  value,
  onChange,
}: {
  value: Background;
  onChange: (b: Background) => void;
}) {
  const { t } = useI18n();

  // `draft` is what the user has typed; null means they are not typing, so
  // the field simply shows the colour that is actually selected. Deriving
  // it beats mirroring the selection into state and then fighting to keep
  // the two in step.
  const [draft, setDraft] = useState<string | null>(null);

  const selected = value.kind === "solid" ? toHex(value.color) : "#ffffff";
  const text = draft ?? selected;
  const invalid =
    draft !== null && draft.trim().length > 0 && parseColor(draft) === null;

  const applyColor = (c: Rgba) => onChange({ kind: "solid", color: c });

  return (
    <div className="space-y-5">
      <Row label={t.bg.bgLabel}>
        <div className="flex flex-wrap gap-2">
          <Swatch
            active={value.kind === "transparent"}
            onClick={() => {
              setDraft(null);
              onChange({ kind: "transparent" });
            }}
            title={t.bg.transparent}
          >
            <span className="checker checker-sm absolute inset-0 rounded-[7px]" />
          </Swatch>

          {PRESETS.map((hex, i) => {
            const c = parseColor(hex)!;
            const active =
              value.kind === "solid" && toHex(value.color) === toHex(c);
            return (
              <Swatch
                key={hex}
                active={active}
                onClick={() => {
                  setDraft(null);
                  applyColor(c);
                }}
                title={t.bg.presets[i]}
              >
                <span
                  className="absolute inset-0 rounded-[7px]"
                  style={{ background: hex }}
                />
              </Swatch>
            );
          })}
        </div>
      </Row>

      <Row label={t.bg.gradientLabel}>
        <div className="flex flex-wrap gap-2">
          {GRADIENTS.map((g, i) => {
            const from = parseColor(g.from)!;
            const to = parseColor(g.to)!;
            const active =
              value.kind === "gradient" &&
              toHex(value.from) === toHex(from) &&
              toHex(value.to) === toHex(to);
            return (
              <Swatch
                key={`${g.from}${g.to}`}
                active={active}
                onClick={() => {
                  setDraft(null);
                  onChange({ kind: "gradient", from, to, angle: g.angle });
                }}
                title={t.bg.gradients[i]}
              >
                <span
                  className="absolute inset-0 rounded-[7px]"
                  style={{
                    background: `linear-gradient(${g.angle}deg, ${g.from}, ${g.to})`,
                  }}
                />
              </Swatch>
            );
          })}
        </div>
      </Row>

      <Row label={t.bg.customLabel}>
        <div className="space-y-2">
          <div className="flex items-stretch gap-2">
            <label
              className="relative h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-lg hairline"
              title={t.bg.wheel}
            >
              <span
                className="absolute inset-0"
                style={{
                  background:
                    value.kind === "solid" ? toCss(value.color) : "#ffffff",
                }}
              />
              <input
                type="color"
                aria-label={t.bg.wheel}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                value={
                  value.kind === "solid"
                    ? toHex(value.color).slice(0, 7)
                    : "#ffffff"
                }
                onChange={(e) => {
                  const c = parseColor(e.target.value);
                  if (c) {
                    setDraft(null);
                    applyColor(c);
                  }
                }}
              />
            </label>

            <input
              value={text}
              onChange={(e) => {
                setDraft(e.target.value);
                const c = parseColor(e.target.value);
                if (c) applyColor(c);
              }}
              onBlur={() => setDraft(null)}
              dir="ltr"
              spellCheck={false}
              autoComplete="off"
              maxLength={32}
              placeholder="#FF0000  ·  rgb(255, 0, 0)"
              aria-label={t.bg.customLabel}
              aria-invalid={invalid}
              aria-describedby="color-hint"
              className={`mono h-10 min-w-0 flex-1 rounded-lg border bg-ink-2 px-3 text-sm text-text outline-none transition-colors placeholder:text-text-faint ${
                invalid
                  ? "border-bad text-bad-text"
                  : "border-line focus:border-accent"
              }`}
            />
          </div>
          <p
            id="color-hint"
            className={`text-xs leading-relaxed ${
              invalid ? "text-bad-text" : "text-text-faint"
            }`}
          >
            {invalid ? t.bg.invalid : t.bg.hint}
          </p>
        </div>
      </Row>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <p className="mono text-[10px] font-medium uppercase tracking-[0.16em] text-text-faint">
        {label}
      </p>
      {children}
    </div>
  );
}

function Swatch({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={`relative h-9 w-9 overflow-hidden rounded-lg border transition-transform duration-150 hover:scale-105 ${
        active
          ? "border-accent ring-2 ring-accent/40 ring-offset-2 ring-offset-surface"
          : "border-line hover:border-text-faint"
      }`}
    >
      {children}
      {active && (
        <span
          className="absolute inset-0 grid place-items-center"
          style={{ color: "var(--scrim-fg)" }}
        >
          <span
            className="grid h-5 w-5 place-items-center rounded-full"
            style={{ background: "var(--scrim)" }}
          >
            <Check size={12} strokeWidth={3} />
          </span>
        </span>
      )}
    </button>
  );
}
