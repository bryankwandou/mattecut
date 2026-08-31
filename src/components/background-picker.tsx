"use client";

import { useRef, useState } from "react";
import { Check, ImagePlus } from "lucide-react";
import { parseColor, toCss, toHex, type Rgba } from "@/lib/color";
import { backdropUrl, type Background, type Fit } from "@/lib/compose";
import { useI18n } from "@/components/preferences";
import { Spectrum } from "@/components/spectrum";
import { BackdropCatalogue } from "@/components/backdrop-catalogue";

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

const WHITE = { r: 255, g: 255, b: 255, a: 1 } as const;

/** Bundled backdrops. SVG because a gradient described in a few hundred
 *  bytes beats a JPEG of the same gradient at every screen size. */
const BACKDROPS = [
  "studio-grey",
  "passport-blue",
  "graphite",
  "warm-sand",
  "sky",
  "sage",
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

  // Which backdrop is lit. The Background itself only carries a Blob, and
  // two different Blobs of the same picture are not equal, so the identity
  // of the choice has to be remembered separately from the value.
  const [active, setActive] = useState<string | null>(null);
  const [fit, setFit] = useState<Fit>("cover");
  const [catalogue, setCatalogue] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  // Bundled backdrops are fetched and handed on as Blobs, exactly like an
  // uploaded file. One code path downstream instead of two, and the draft
  // can store either without knowing which it got.
  const pickBackdrop = async (name: string) => {
    const res = await fetch(`/backdrops/${name}.svg`);
    const blob = await res.blob();
    backdropUrl(blob);
    setDraft(null);
    setActive(name);
    onChange({ kind: "image", blob, fit });
  };

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
                  setActive(null);
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
                  setActive(null);
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
        {/* The four above are the shortcuts. The rest live in a window of
            their own: eight thousand swatches stacked in this column would
            bury every other control on the page. */}
        <button
          onClick={() => setCatalogue(true)}
          className="mt-2 w-full rounded-lg border border-line px-3 py-2 text-xs font-medium transition-colors hover:border-text-faint"
        >
          {t.bg.catalogueOpen}
        </button>
      </Row>

      <BackdropCatalogue
        open={catalogue}
        onClose={() => setCatalogue(false)}
        onPick={(from, to, angle) => {
          setDraft(null);
          setActive(null);
          onChange(
            to ? { kind: "gradient", from, to, angle } : { kind: "solid", color: from },
          );
          setCatalogue(false);
        }}
      />

      <Row label={t.bg.wallpaperLabel}>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {BACKDROPS.map((name, i) => (
              <Swatch
                key={name}
                active={active === name}
                onClick={() => void pickBackdrop(name)}
                title={t.bg.wallpapers[i]}
              >
                <span
                  className="absolute inset-0 rounded-[7px] bg-cover bg-center"
                  style={{ backgroundImage: `url("/backdrops/${name}.svg")` }}
                />
              </Swatch>
            ))}

            <button
              type="button"
              onClick={() => file.current?.click()}
              title={t.bg.upload}
              aria-label={t.bg.upload}
              className="grid h-9 w-9 place-items-center rounded-lg border border-dashed border-line text-text-faint transition-colors hover:border-accent hover:text-accent-text"
            >
              <ImagePlus size={15} />
            </button>
            <input
              ref={file}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setActive("own");
                  onChange({ kind: "image", blob: f, fit });
                }
                // Clear it, or choosing the same file twice does nothing.
                e.target.value = "";
              }}
            />
          </div>

          {value.kind === "image" && (
            <div className="flex gap-2">
              {(["cover", "contain"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => {
                    setFit(f);
                    onChange({ ...value, fit: f });
                  }}
                  aria-pressed={value.fit === f}
                  className={`flex-1 rounded-lg border px-2 py-1.5 text-xs transition-colors ${
                    value.fit === f
                      ? "border-accent bg-accent/10 text-text"
                      : "border-line text-text-dim hover:border-text-faint"
                  }`}
                >
                  {f === "cover" ? t.bg.fitCover : t.bg.fitContain}
                </button>
              ))}
            </div>
          )}

          <p className="text-xs leading-relaxed text-text-faint">
            {t.bg.uploadHint}
          </p>
        </div>
      </Row>

      <Row label={t.bg.customLabel}>
        <div className="space-y-2.5">
          <Spectrum
            value={value.kind === "solid" ? value.color : WHITE}
            onChange={(c) => {
              setDraft(null);
              applyColor(c);
            }}
          />

          <div className="flex items-stretch gap-2">
            <span
              className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg hairline"
              title={t.bg.wheel}
            >
              <span className="checker checker-sm absolute inset-0" />
              <span
                className="absolute inset-0"
                style={{
                  background:
                    value.kind === "solid" ? toCss(value.color) : "transparent",
                }}
              />
            </span>

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
          <p className="mono text-[10px] uppercase tracking-[0.16em] text-text-faint">
            {t.bg.count}
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
