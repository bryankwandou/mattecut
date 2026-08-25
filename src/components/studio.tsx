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
  backgroundToCss,
  downloadBlob,
  exportImage,
  outputName,
  type Background,
} from "@/lib/compose";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 12 * 1024 * 1024;

type Shot = {
  file: File;
  originalUrl: string;
  masterUrl: string;
  bitmap: HTMLImageElement;
  w: number;
  h: number;
};

export function Studio() {
  const { t } = useI18n();
  const [shot, setShot] = useState<Shot | null>(null);
  const [bg, setBg] = useState<Background>({ kind: "transparent" });
  const [quality, setQuality] = useState<Quality>("fast");
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const urls = useRef<string[]>([]);

  // Revoke object URLs on unmount; leaking them keeps whole bitmaps alive.
  useEffect(() => {
    const held = urls.current;
    return () => held.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  const run = useCallback(
    async (file: File) => {
      setError(null);

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
      setProgress({
        stage: isWarm(quality) ? "processing" : "fetching",
        ratio: null,
        key: isWarm(quality) ? "separating" : "engine",
      });

      try {
        const blob = await cutout(file, quality, setProgress);

        const originalUrl = URL.createObjectURL(file);
        const masterUrl = URL.createObjectURL(blob);
        urls.current.push(originalUrl, masterUrl);

        const bitmap = await loadImage(masterUrl, t.studio.errDecode);
        setShot({
          file,
          originalUrl,
          masterUrl,
          bitmap,
          w: bitmap.naturalWidth,
          h: bitmap.naturalHeight,
        });
        setProgress({ stage: "done", ratio: 1, key: "separating" });
      } catch (e) {
        // The library's messages are English internals; a translated
        // sentence the user can act on beats a leaked stack trace. The
        // original still goes to the console for whoever is debugging.
        console.error("[roto] cutout failed", e);
        setProgress(null);
        setError(t.studio.errFailed);
      } finally {
        setBusy(false);
      }
    },
    [quality, t],
  );

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

  const reset = () => {
    setShot(null);
    setBg({ kind: "transparent" });
    setProgress(null);
    setError(null);
  };

  const save = async (format: "image/png" | "image/jpeg" | "image/webp") => {
    if (!shot) return;
    const ext =
      format === "image/png" ? "png" : format === "image/jpeg" ? "jpg" : "webp";
    try {
      const blob = await exportImage(shot.bitmap, shot.w, shot.h, bg, format);
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
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0 space-y-3">
            <CompareSlider
              before={shot.originalUrl}
              after={shot.masterUrl}
              backdrop={backgroundToCss(bg)}
            />
            <p className="mono text-[11px] text-text-faint" dir="ltr">
              {shot.w} &times; {shot.h} px &middot; {shot.file.name}
            </p>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
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
        <div className="grid gap-2 sm:grid-cols-2">
          <QualityOption
            active={quality === "fast"}
            onClick={() => onQuality("fast")}
            title={t.studio.fastTitle}
            note={fill(t.studio.fastNote, { mb: DOWNLOAD_MB.fast })}
            disabled={busy}
          />
          <QualityOption
            active={quality === "precise"}
            onClick={() => onQuality("precise")}
            title={t.studio.preciseTitle}
            note={fill(t.studio.preciseNote, { mb: DOWNLOAD_MB.precise })}
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

function loadImage(src: string, failure: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(failure));
    img.src = src;
  });
}
