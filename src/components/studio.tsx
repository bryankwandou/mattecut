"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  ImageIcon,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Upload,
} from "lucide-react";
import { CompareSlider } from "@/components/compare-slider";
import { BackgroundPicker } from "@/components/background-picker";
import { RotoLogo } from "@/components/logo";
import { LanguagePicker, ThemeToggle } from "@/components/switches";
import { useI18n } from "@/components/preferences";
import { fill } from "@/lib/i18n";
import {
  cutout,
  warm,
  isWarm,
  DOWNLOAD_MB,
  type Progress,
  type Quality,
} from "@/lib/matting";
import {
  backdropUrl,
  backgroundToCss,
  downloadBlob,
  exportImage,
  outputName,
  type Background,
} from "@/lib/compose";
import { clearDraft, loadDraft, saveDraft } from "@/lib/draft";
import { findPortrait, type Portrait } from "@/lib/portrait";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 12 * 1024 * 1024;

/** Jacket artwork, by file name under /attire. */
const ATTIRE = ["charcoal", "navy", "blazer"] as const;
type Attire = (typeof ATTIRE)[number];

/** A jacket is wider than the silhouette it hangs on: the mask stops at the
 *  body, the shoulder pads do not. Measured against a real cut rather than
 *  guessed — a detected shoulder width of 0.71 of the frame wants a jacket
 *  of about 0.86, which clears each shoulder without reaching the edges. */
const JACKET_SPREAD = 1.2;

/** How far above the detected neck the collar sits, in image heights. */
const JACKET_RISE = 0.035;

type Shot = {
  file: File;
  originalUrl: string;
  masterUrl: string;
  /** Kept so a background change can re-save the draft without cutting again. */
  masterBlob: Blob;
  bitmap: HTMLImageElement;
  w: number;
  h: number;
  /** Which model produced this cut, so the switcher shows the live state. */
  quality: Quality;
  /** Null when the silhouette did not read as a frontal, chest-up portrait. */
  portrait: Portrait | null;
};

export function Studio() {
  const { t } = useI18n();
  const [shot, setShot] = useState<Shot | null>(null);
  const [bg, setBg] = useState<Background>({ kind: "transparent" });
  const [quality, setQuality] = useState<Quality>("balanced");
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [restored, setRestored] = useState(false);
  const [attire, setAttire] = useState<Attire | null>(null);
  // The artwork is kept next to the name it was fetched for. Holding the
  // Blob alone would let a half-finished switch paint the previous jacket
  // for a frame, and clearing it up front would need a setState the effect
  // has no business making.
  const [art, setArt] = useState<{ name: Attire; blob: Blob } | null>(null);
  // Nudges on top of the automatic placement, both centred on zero so the
  // sliders read as corrections rather than as the settings themselves.
  const [attireScale, setAttireScale] = useState(1);
  const [attireDrop, setAttireDrop] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const urls = useRef<string[]>([]);

  // Revoke object URLs on unmount; leaking them keeps whole bitmaps alive.
  useEffect(() => {
    const held = urls.current;
    return () => held.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  const run = useCallback(
    async (file: File, q: Quality = quality) => {
      setError(null);
      setRestored(false);

      if (!ACCEPTED.includes(file.type)) {
        setError(t.studio.errUnsupported);
        return;
      }
      if (file.size > MAX_BYTES) {
        setError(
          fill(t.studio.errTooBig, { mb: (file.size / 1048576).toFixed(1) }),
        );
        return;
      }

      setBusy(true);
      setQuality(q);
      setProgress({
        stage: isWarm(q) ? "processing" : "fetching",
        ratio: null,
        key: isWarm(q) ? "separating" : "engine",
      });

      try {
        const blob = await cutout(file, q, setProgress);

        const originalUrl = URL.createObjectURL(file);
        const masterUrl = URL.createObjectURL(blob);
        urls.current.push(originalUrl, masterUrl);

        const bitmap = await loadImage(masterUrl, t.studio.errDecode);
        setShot({
          file,
          originalUrl,
          masterUrl,
          masterBlob: blob,
          bitmap,
          w: bitmap.naturalWidth,
          h: bitmap.naturalHeight,
          quality: q,
          portrait: findPortrait(bitmap),
        });
        setProgress({ stage: "done", ratio: 1, key: "separating" });
      } catch (e) {
        // The library's messages are English internals; a translated
        // sentence the user can act on beats a leaked stack trace. The
        // original still goes to the console for whoever is debugging.
        console.error("[roto] cutout failed", e);
        setProgress(null);
        // The switcher moved the moment the chip was pressed, so a failed
        // cut has to move it back; otherwise it claims a model that never
        // produced the picture on screen.
        setQuality(quality);
        setError(t.studio.errFailed);
      } finally {
        setBusy(false);
      }
    },
    [quality, t],
  );

  // A crash, a closed tab, or a stray reload should not cost the reader the
  // minute they just spent waiting for a cut. Runs once, on open.
  useEffect(() => {
    let alive = true;
    void (async () => {
      const d = await loadDraft();
      if (!alive || !d) return;
      const file = new File([d.original], d.name, { type: d.type });
      const originalUrl = URL.createObjectURL(file);
      const masterUrl = URL.createObjectURL(d.master);
      urls.current.push(originalUrl, masterUrl);
      try {
        // This string is never shown: the catch discards the draft rather
        // than blaming the reader for a record they cannot even see.
        const bitmap = await loadImage(masterUrl, "draft decode failed");
        if (!alive) return;
        setShot({
          file,
          originalUrl,
          masterUrl,
          masterBlob: d.master,
          bitmap,
          w: bitmap.naturalWidth,
          h: bitmap.naturalHeight,
          quality: d.quality,
          portrait: findPortrait(bitmap),
        });
        setQuality(d.quality);
        if (d.bg) setBg(d.bg as Background);
        // Same guard as the tier: a jacket this build no longer ships must
        // not come back as a broken fetch on the reader's first glance.
        if (d.attire && (ATTIRE as readonly string[]).includes(d.attire)) {
          setAttire(d.attire as Attire);
          if (typeof d.attireScale === "number") setAttireScale(d.attireScale);
          if (typeof d.attireDrop === "number") setAttireDrop(d.attireDrop);
        }
        setRestored(true);
      } catch {
        void clearDraft();
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Keep that draft current. The background is part of the work, so a colour
  // change re-saves too; the delay stops a drag across the colour wheel from
  // writing to disk on every frame.
  useEffect(() => {
    if (!shot) return;
    const timer = setTimeout(() => {
      void saveDraft({
        name: shot.file.name,
        type: shot.file.type,
        original: shot.file,
        master: shot.masterBlob,
        quality: shot.quality,
        bg,
        attire,
        attireScale,
        attireDrop,
        at: Date.now(),
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [shot, bg, attire, attireScale, attireDrop]);

  // Paste-to-upload. People screenshot then paste; supporting it costs a
  // handful of lines and removes a whole step from the flow.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const f = Array.from(e.clipboardData?.files ?? [])[0];
      if (f && !busy) void run(f);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [run, busy]);

  // Warm the model in the background as soon as the studio opens, so the
  // first cut is not also the first big download.
  useEffect(() => {
    if (shot || busy) return;
    const timer = setTimeout(() => void warm(quality).catch(() => {}), 1200);
    return () => clearTimeout(timer);
  }, [quality, shot, busy]);

  // Jacket artwork is fetched into a Blob, like every other image in the
  // studio, so preview and export read from one decoded copy.
  useEffect(() => {
    if (!attire) return;
    let alive = true;
    void (async () => {
      try {
        const res = await fetch(`/attire/${attire}.svg`);
        const blob = await res.blob();
        if (alive) setArt({ name: attire, blob });
      } catch {
        // A jacket that will not load is worse than none: it would leave a
        // chip lit over a picture that never changed.
        if (alive) setAttire(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, [attire]);

  // One rectangle, in fractions of the picture, used by the preview and by
  // the export alike. Two separate calculations here would be two chances
  // for the downloaded file to disagree with what the reader approved.
  const jacket = attire && art?.name === attire ? art.blob : null;
  const overlay =
    shot && jacket
      ? (() => {
          const p = shot.portrait;
          const w = (p ? p.shoulderWidth * JACKET_SPREAD : 0.8) * attireScale;
          const cx = p ? p.centerX : 0.5;
          const y = (p ? p.neckY - JACKET_RISE : 0.55) + attireDrop;
          return { blob: jacket, x: cx - w / 2, y, w };
        })()
      : null;

  const reset = () => {
    void clearDraft();
    setRestored(false);
    setShot(null);
    setBg({ kind: "transparent" });
    setAttire(null);
    setAttireScale(1);
    setAttireDrop(0);
    setProgress(null);
    setError(null);
  };

  const save = async (format: "image/png" | "image/jpeg" | "image/webp") => {
    if (!shot) return;
    const ext =
      format === "image/png" ? "png" : format === "image/jpeg" ? "jpg" : "webp";
    try {
      const blob = await exportImage(
        shot.bitmap,
        shot.w,
        shot.h,
        bg,
        format,
        0.95,
        overlay,
      );
      downloadBlob(blob, outputName(shot.file.name, ext));
    } catch (e) {
      console.error("[roto] export failed", e);
      setError(t.studio.errExport);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          aria-label={t.studio.back}
          className="flex items-center gap-3 text-text-dim transition-colors hover:text-text"
        >
          <ArrowLeft size={16} className="rtl:rotate-180" />
          <RotoLogo size={24} />
        </Link>
        <div className="flex items-center gap-2">
          <span className="mono me-1 hidden items-center gap-2 text-[11px] text-text-faint lg:flex">
            <ShieldCheck size={13} className="text-ok-text" />
            {t.studio.onDevice}
          </span>
          <LanguagePicker variant="compact" className="flex sm:hidden" />
          <LanguagePicker className="hidden sm:flex" />
          <ThemeToggle />
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-xl border border-bad/40 bg-bad/10 p-4 text-sm"
        >
          <TriangleAlert size={17} className="mt-px shrink-0 text-bad-text" />
          <p className="min-w-0 flex-1 text-text">{error}</p>
          <button
            onClick={() => setError(null)}
            className="shrink-0 text-xs text-text-faint transition-colors hover:text-text"
          >
            {t.common.close}
          </button>
        </div>
      )}

      {restored && (
        <div
          role="status"
          className="mb-6 flex items-start gap-3 rounded-xl border border-ok/40 bg-ok/10 p-4 text-sm"
        >
          <ShieldCheck size={17} className="mt-px shrink-0 text-ok-text" />
          <p className="min-w-0 flex-1 text-text">{t.studio.restored}</p>
          <button
            onClick={() => setRestored(false)}
            className="shrink-0 text-xs text-text-faint transition-colors hover:text-text"
          >
            {t.common.close}
          </button>
        </div>
      )}

      {!shot ? (
        <Dropzone
          dragOver={dragOver}
          busy={busy}
          progress={progress}
          quality={quality}
          onQuality={setQuality}
          onPick={() => inputRef.current?.click()}
          onDragState={setDragOver}
          onFile={run}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-3">
            <CompareSlider
              before={shot.originalUrl}
              after={shot.masterUrl}
              backdrop={backgroundToCss(bg)}
              overlay={
                overlay
                  ? { ...overlay, src: backdropUrl(overlay.blob) }
                  : null
              }
            />
            <p className="mono text-[11px] text-text-faint" dir="ltr">
              {shot.w} &times; {shot.h} px &middot; {shot.file.name}
            </p>
          </div>

          <aside className="space-y-5 md:sticky md:top-6 md:self-start">
            <fieldset
              className="rounded-xl border border-line bg-surface p-4"
              disabled={busy}
            >
              <legend className="mono px-2 text-[10px] uppercase tracking-[0.16em] text-text-faint">
                {t.studio.qualityLabel}
              </legend>
              <div className="grid grid-cols-3 gap-1.5">
                <ModelChip
                  active={quality === "light"}
                  busy={busy}
                  label={t.studio.lightTitle}
                  onClick={() => void run(shot.file, "light")}
                />
                <ModelChip
                  active={quality === "balanced"}
                  busy={busy}
                  label={t.studio.balancedTitle}
                  onClick={() => void run(shot.file, "balanced")}
                />
                <ModelChip
                  active={quality === "maximum"}
                  busy={busy}
                  label={t.studio.maximumTitle}
                  onClick={() => void run(shot.file, "maximum")}
                />
              </div>
              <p className="mt-2.5 text-pretty text-xs leading-relaxed text-text-faint">
                {busy
                  ? progress
                    ? t.progress[progress.key]
                    : t.progress.working
                  : t.studio.modelNote}
              </p>
            </fieldset>

            <fieldset
              className="rounded-xl border border-line bg-surface p-4"
              disabled={busy}
            >
              <legend className="mono px-2 text-[10px] uppercase tracking-[0.16em] text-text-faint">
                {t.studio.attireLabel}
              </legend>

              <div className="grid grid-cols-4 gap-1.5">
                <ModelChip
                  active={attire === null}
                  busy={false}
                  label={t.studio.attireNone}
                  onClick={() => setAttire(null)}
                />
                {ATTIRE.map((name, i) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setAttire(name)}
                    aria-pressed={attire === name}
                    title={t.studio.attire[i]}
                    aria-label={t.studio.attire[i]}
                    className={`relative h-11 overflow-hidden rounded-lg border transition-colors ${
                      attire === name
                        ? "border-accent ring-2 ring-accent/40"
                        : "border-line hover:border-text-faint"
                    }`}
                  >
                    <span
                      className="absolute inset-0 bg-contain bg-bottom bg-no-repeat"
                      style={{
                        backgroundImage: `url("/attire/${name}.svg")`,
                      }}
                    />
                  </button>
                ))}
              </div>

              {attire && (
                <div className="mt-3 space-y-2.5">
                  <Nudge
                    label={t.studio.attireSize}
                    min={70}
                    max={140}
                    value={Math.round(attireScale * 100)}
                    onChange={(v) => setAttireScale(v / 100)}
                  />
                  <Nudge
                    label={t.studio.attireDrop}
                    min={-15}
                    max={25}
                    value={Math.round(attireDrop * 100)}
                    onChange={(v) => setAttireDrop(v / 100)}
                  />
                </div>
              )}

              <p className="mt-2.5 text-pretty text-xs leading-relaxed text-text-faint">
                {shot.portrait ? t.studio.attireAuto : t.studio.attireManual}
              </p>
            </fieldset>

            <div className="rounded-xl border border-line bg-surface p-5">
              <BackgroundPicker value={bg} onChange={setBg} />
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => void save("image/png")}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3.5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hi"
              >
                <Download size={16} />
                {t.studio.downloadPng}
                {bg.kind === "transparent" && (
                  <span className="opacity-70">
                    &middot; {t.studio.transparentSuffix}
                  </span>
                )}
              </button>
              <div className="grid grid-cols-2 gap-2.5">
                <SecondaryButton onClick={() => void save("image/jpeg")}>
                  JPG
                </SecondaryButton>
                <SecondaryButton onClick={() => void save("image/webp")}>
                  WebP
                </SecondaryButton>
              </div>
              <p className="text-center text-xs leading-relaxed text-text-faint">
                {t.studio.exportNote}
              </p>
            </div>

            <button
              onClick={reset}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-line px-4 py-3 text-sm text-text-dim transition-colors hover:border-text-faint hover:text-text"
            >
              <RotateCcw size={15} />
              {t.studio.another}
            </button>
          </aside>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void run(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function SecondaryButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl border border-line bg-ink-2 px-4 py-3 text-sm text-text-dim transition-colors hover:border-text-faint hover:text-text"
    >
      {children}
    </button>
  );
}

function Dropzone({
  dragOver,
  busy,
  progress,
  quality,
  onQuality,
  onPick,
  onDragState,
  onFile,
}: {
  dragOver: boolean;
  busy: boolean;
  progress: Progress | null;
  quality: Quality;
  onQuality: (q: Quality) => void;
  onPick: () => void;
  onDragState: (v: boolean) => void;
  onFile: (f: File) => void;
}) {
  const { t } = useI18n();

  return (
    <div className="space-y-5">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          onDragState(true);
        }}
        onDragLeave={() => onDragState(false)}
        onDrop={(e) => {
          e.preventDefault();
          onDragState(false);
          const f = e.dataTransfer.files?.[0];
          if (f && !busy) onFile(f);
        }}
        className={`grid-field relative grid min-h-[380px] place-items-center rounded-2xl border-2 border-dashed p-8 transition-colors sm:min-h-[440px] ${
          dragOver ? "border-accent bg-accent/5" : "border-line bg-ink-2"
        }`}
      >
        {busy ? (
          <ProgressPanel progress={progress} quality={quality} />
        ) : (
          <div className="text-center">
            <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl border border-line bg-surface">
              <ImageIcon size={26} className="text-text-faint" />
            </div>
            <h1 className="text-balance text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
              {t.studio.dropTitle}
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-pretty text-sm leading-relaxed text-text-dim">
              {t.studio.dropBody}
            </p>
            <button
              onClick={onPick}
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hi"
            >
              <Upload size={16} />
              {t.studio.pick}
            </button>
            <p className="mono mt-5 text-[11px] text-text-faint">
              {t.studio.formats}
            </p>
          </div>
        )}
      </div>

      <fieldset className="rounded-xl border border-line bg-surface p-4">
        <legend className="mono px-2 text-[10px] uppercase tracking-[0.16em] text-text-faint">
          {t.studio.qualityLabel}
        </legend>
        <div className="grid gap-2 sm:grid-cols-3">
          <QualityOption
            active={quality === "light"}
            onClick={() => onQuality("light")}
            title={t.studio.lightTitle}
            note={fill(t.studio.lightNote, { mb: DOWNLOAD_MB.light })}
            disabled={busy}
          />
          <QualityOption
            active={quality === "balanced"}
            onClick={() => onQuality("balanced")}
            title={t.studio.balancedTitle}
            note={fill(t.studio.balancedNote, { mb: DOWNLOAD_MB.balanced })}
            disabled={busy}
          />
          <QualityOption
            active={quality === "maximum"}
            onClick={() => onQuality("maximum")}
            title={t.studio.maximumTitle}
            note={fill(t.studio.maximumNote, { mb: DOWNLOAD_MB.maximum })}
            disabled={busy}
          />
        </div>
      </fieldset>
    </div>
  );
}

function QualityOption({
  active,
  onClick,
  title,
  note,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  note: string;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`rounded-lg border p-3 text-start transition-colors disabled:opacity-50 ${
        active
          ? "border-accent bg-accent/10"
          : "border-line hover:border-text-faint"
      }`}
    >
      <span className="flex items-center gap-2 text-sm font-medium">
        {title}
        {active && <Sparkles size={13} className="text-accent-text" />}
      </span>
      <span className="mt-1 block text-xs leading-relaxed text-text-faint">
        {note}
      </span>
    </button>
  );
}

function ProgressPanel({
  progress,
  quality,
}: {
  progress: Progress | null;
  quality: Quality;
}) {
  const { t } = useI18n();
  const pct = progress?.ratio != null ? Math.round(progress.ratio * 100) : null;
  const fetching = progress?.stage === "fetching";

  return (
    <div className="w-full max-w-sm text-center">
      <Loader2 size={26} className="mx-auto mb-5 animate-spin text-accent" />
      <p
        className="text-sm font-medium"
        role="status"
        aria-live="polite"
      >
        {progress ? t.progress[progress.key] : t.progress.preparing}
      </p>

      <div
        className="mt-4 h-1 overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct ?? undefined}
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-300"
          style={{ width: pct != null ? `${pct}%` : "35%" }}
        />
      </div>

      <p className="mono mt-3 text-[11px] text-text-faint">
        {pct != null ? `${pct}%` : t.progress.working}
      </p>

      {fetching && (
        <p className="mt-5 text-pretty text-xs leading-relaxed text-text-faint">
          {fill(t.studio.firstDownloadNote, { mb: DOWNLOAD_MB[quality] })}
        </p>
      )}
    </div>
  );
}

function Nudge({
  label,
  min,
  max,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex items-center gap-3">
      <span className="mono w-14 shrink-0 text-[10px] uppercase tracking-[0.14em] text-text-faint">
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="roto-range min-w-0 flex-1"
      />
    </label>
  );
}

function ModelChip({
  active,
  busy,
  label,
  onClick,
}: {
  active: boolean;
  busy: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-medium transition-colors disabled:opacity-60 ${
        active
          ? "border-accent bg-accent/10 text-text"
          : "border-line text-text-dim hover:border-text-faint hover:text-text"
      }`}
    >
      {busy && active && <Loader2 size={12} className="animate-spin" />}
      {label}
    </button>
  );
}

function loadImage(src: string, failure: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(failure));
    img.src = src;
  });
}
