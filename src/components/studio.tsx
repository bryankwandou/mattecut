"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  ImageIcon,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Minus,
  Plus,
  Sparkles,
  TriangleAlert,
  Upload,
} from "lucide-react";
import { CompareSlider } from "@/components/compare-slider";
import { BackgroundPicker } from "@/components/background-picker";
import { CatalogAudit } from "@/components/catalog-audit";
import { MattecutLogo } from "@/components/logo";
import { LanguagePicker, ThemeToggle } from "@/components/switches";
import { useI18n } from "@/components/preferences";
import { fill } from "@/lib/i18n";
import {
  cutout,
  findClothes,
  warm,
  isWarm,
  canGpu,
  downloadMb,
  isWeakDevice,
  type Progress,
  type Quality,
} from "@/lib/matting";
import { CAP } from "@/lib/fit";
import type { Clothes } from "@/lib/lite";
import type { Shoulders } from "@/lib/pose";
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

/** The weak-device answer never changes within a page life, so there is
 *  nothing to subscribe to — and the server, which has no `navigator`, is
 *  told the safe answer instead of being made to guess. */
const subscribeNever = () => () => {};
const serverIsFine = () => false;

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

/** The same idea measured against the shoulder span instead of the frame,
 *  so it survives any crop: a collar sits about a fifth of a shoulder width
 *  above the line between the shoulders. */
const JACKET_RISE_SPAN = 0.2;

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
  /** True when the photo was shrunk to fit this machine, so the export note
   *  stops promising a resolution this cut never had. */
  capped: boolean;
  /** The photograph's own size. The model works on a shrunk copy, but the
   *  export is written at these numbers, so they are what the note quotes. */
  srcW: number;
  srcH: number;
};

export function Studio() {
  const { t } = useI18n();
  const [shot, setShot] = useState<Shot | null>(null);
  const [bg, setBg] = useState<Background>({ kind: "transparent" });
  // Null until someone actually picks a tier, so the default can be derived
  // from the machine rather than written into state and then corrected. The
  // correction is what would flash Balanced on a netbook for one frame.
  const [picked, setPicked] = useState<Quality | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  // Whether this browser can run the model on the GPU. It changes the size
  // of the runtime it downloads, so the tier labels wait for the answer.
  const [onGpu, setOnGpu] = useState(false);
  // Whether this machine should be spared the heavier work. Read through
  // useSyncExternalStore rather than an effect: `navigator` does not exist
  // during the server render, and this is exactly the shape React provides
  // for a value the server cannot know — false there, the real answer once
  // the client takes over, and no hydration mismatch in between.
  const weak = useSyncExternalStore(subscribeNever, isWeakDevice, serverIsFine);
  // A netbook starts on the lightest tier without being asked. This moves
  // the default only: every stop on the slider stays reachable, so a reader
  // willing to wait is never locked out of the better cut.
  const quality: Quality = picked ?? (weak ? "lite" : "balanced");
  // A warm-up is a large download with no picture on screen yet. Left
  // unannounced it reads as a dead page, which is exactly how it was read.
  const [warming, setWarming] = useState(false);
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
  // Where this photo's own clothing is. Asked for once per picture, and only
  // when a jacket is actually wanted, because it costs a 16 MB download that
  // nobody choosing "no jacket" should pay for.
  const [clothes, setClothes] = useState<Clothes | null>(null);
  // Shoulder points, when the pose network found them. They decide the
  // garment's width, centre and angle; the clothing mask decides where it
  // is allowed to show. Neither replaces the other.
  const [shoulders, setShoulders] = useState<Shoulders | null>(null);
  const [clothesFor, setClothesFor] = useState<File | null>(null);
  // How tall the preview may be, as a share of the window. Browser zoom is
  // not a substitute: it magnifies the whole interface, so the reader ends
  // up with a bigger picture and a bigger sidebar and no more of either on
  // screen. This shrinks only the picture.
  const [viewVh, setViewVh] = useState(68);
  const inputRef = useRef<HTMLInputElement>(null);
  const urls = useRef<string[]>([]);

  useEffect(() => {
    let alive = true;
    void canGpu().then((v) => alive && setOnGpu(v));
    return () => {
      alive = false;
    };
  }, []);

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
      setPicked(q);
      setProgress({
        stage: isWarm(q) ? "processing" : "fetching",
        ratio: null,
        key: isWarm(q) ? "separating" : "engine",
      });

      try {
        // The cap travels into the worker rather than being applied here:
        // the shrink needs a full decode, and doing that on this thread is
        // the freeze the worker exists to prevent.
        const { blob, scaled } = await cutout(
          file,
          q,
          weak ? CAP.weak : CAP.normal,
          setProgress,
        );

        const originalUrl = URL.createObjectURL(file);
        const masterUrl = URL.createObjectURL(blob);
        urls.current.push(originalUrl, masterUrl);

        const bitmap = await loadImage(masterUrl, t.studio.errDecode);
        // The original's own dimensions. Cheap here — the browser has just
        // decoded this file for the preview — and it is what the export and
        // its note are measured against.
        const src = await loadImage(originalUrl, t.studio.errDecode).catch(
          () => null,
        );
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
          capped: scaled,
          srcW: src?.naturalWidth ?? bitmap.naturalWidth,
          srcH: src?.naturalHeight ?? bitmap.naturalHeight,
        });
        setProgress({ stage: "done", ratio: 1, key: "separating" });
      } catch (e) {
        // The library's messages are English internals; a translated
        // sentence the user can act on beats a leaked stack trace. The
        // original still goes to the console for whoever is debugging.
        console.error("[mattecut] cutout failed", e);
        setProgress(null);
        // The switcher moved the moment the chip was pressed, so a failed
        // cut has to move it back; otherwise it claims a model that never
        // produced the picture on screen.
        setPicked(quality);
        setError(t.studio.errFailed);
      } finally {
        setBusy(false);
      }
    },
    [quality, t, weak],
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
        const src = await loadImage(originalUrl, "draft decode failed").catch(
          () => null,
        );
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
          capped: d.capped === true,
          srcW: src?.naturalWidth ?? bitmap.naturalWidth,
          srcH: src?.naturalHeight ?? bitmap.naturalHeight,
        });
        setPicked(d.quality);
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
        capped: shot.capped,
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
    let alive = true;
    const timer = setTimeout(() => {
      if (isWarm(quality)) return;
      setWarming(true);
      void warm(quality, (p) => {
        if (alive) setProgress(p);
      })
        .catch(() => {})
        .finally(() => {
          if (!alive) return;
          setWarming(false);
          setProgress(null);
        });
    }, 1200);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [quality, shot, busy]);

  // The clothing region, found the first time a jacket is chosen for a
  // picture. A null answer is not a failure: the garment falls back to the
  // silhouette estimate, which is what it always used before.
  useEffect(() => {
    if (!shot || !attire) return;
    if (clothesFor === shot.file) return;
    let alive = true;
    void findClothes(shot.file, weak ? CAP.weak : CAP.normal).then((fit) => {
      if (!alive) return;
      setClothes(fit.clothes);
      setShoulders(fit.shoulders);
      setClothesFor(shot.file);
    });
    return () => {
      alive = false;
    };
  }, [shot, attire, clothesFor, weak]);

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
          // Measured clothing beats an inferred silhouette. This box is
          // where cloth actually is, so the collar lands on the real
          // neckline, the width is the person's own, and the garment is
          // clipped to it — which is why it can no longer reach a face or
          // spread out to the size of a chair.
          const measured = clothesFor === shot.file;

          // Shoulders first when the pose network saw them. Two points give
          // the width, the centre and the angle outright, so none of the
          // three is an estimate any more. The clothing mask still clips.
          if (measured && shoulders) {
            const dx = shoulders.leftX - shoulders.rightX;
            const dy = shoulders.leftY - shoulders.rightY;
            const span = Math.hypot(dx, dy);
            const cw = span * JACKET_SPREAD * attireScale;
            const cx = (shoulders.leftX + shoulders.rightX) / 2;
            const cy = (shoulders.leftY + shoulders.rightY) / 2;
            return {
              blob: jacket,
              x: cx - cw / 2,
              // The collar sits a little above the shoulder line, where a
              // real one does, measured against the shoulder span so it
              // holds at any crop.
              y: cy - span * JACKET_RISE_SPAN + attireDrop,
              w: cw,
              tilt: Math.atan2(dy, dx),
              mask: clothes ? clothes.mask : null,
            };
          }

          if (clothes && measured) {
            const cw = clothes.w * attireScale;
            return {
              blob: jacket,
              x: clothes.x + (clothes.w - cw) / 2,
              y: clothes.y + attireDrop,
              w: cw,
              tilt: shot.portrait ? shot.portrait.tilt : 0,
              mask: clothes.mask,
            };
          }

          // Fallback for a photo where no cloth was found: bare shoulders,
          // or a network that misread it. Measured from the silhouette,
          // which is less reliable but never nothing.
          const p = shot.portrait;
          const w = (p ? p.shoulderWidth * JACKET_SPREAD : 0.8) * attireScale;
          const cx = p ? p.centerX : 0.5;
          const y = (p ? p.neckY - JACKET_RISE : 0.55) + attireDrop;
          // The jacket turns with the shoulders it is being hung on. Zero
          // when the shoulders were not readable, which is honest: a guessed
          // angle looks worse than a level one.
          const tilt = p ? p.tilt : 0;
          return { blob: jacket, x: cx - w / 2, y, w, tilt, mask: null };
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
      // The photograph at its own resolution. The model ran on a shrunk
      // copy, but the colour never had to be shrunk with it — only the mask
      // came from the model. Decoded here rather than held for the life of
      // the page, because a 48 MP bitmap in memory is what the cap exists
      // to avoid in the first place.
      let source: { img: HTMLImageElement; w: number; h: number } | null = null;
      if (shot.capped) {
        try {
          const img = await loadImage(shot.originalUrl, t.studio.errDecode);
          source = { img, w: img.naturalWidth, h: img.naturalHeight };
        } catch {
          // Falling back to the cut's own size is the old behaviour, which
          // is worse but still produces a file.
          source = null;
        }
      }

      const blob = await exportImage(
        shot.bitmap,
        shot.w,
        shot.h,
        bg,
        format,
        0.95,
        overlay,
        source,
      );
      downloadBlob(blob, outputName(shot.file.name, ext));
    } catch (e) {
      console.error("[mattecut] export failed", e);
      setError(t.studio.errExport);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10 xl:max-w-7xl 2xl:max-w-[1720px]">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          aria-label={t.studio.back}
          className="flex items-center gap-3 text-text-dim transition-colors hover:text-text"
        >
          <ArrowLeft size={16} className="rtl:rotate-180" />
          <MattecutLogo size={24} />
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
          warming={warming}
          weak={weak}
          onGpu={onGpu}
          progress={progress}
          quality={quality}
          onQuality={setPicked}
          onPick={() => inputRef.current?.click()}
          onDragState={setDragOver}
          onFile={run}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_260px] md:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0 space-y-3">
            <CompareSlider
              before={shot.originalUrl}
              after={shot.masterUrl}
              backdrop={backgroundToCss(bg)}
              overlay={
                overlay
                  ? {
                      ...overlay,
                      src: backdropUrl(overlay.blob),
                      mask: overlay.mask ? backdropUrl(overlay.mask) : null,
                    }
                  : null
              }
              maxVh={viewVh}
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="mono text-[11px] text-text-faint" dir="ltr">
                {shot.w} &times; {shot.h} px &middot; {shot.file.name}
              </p>
              <div className="flex items-center gap-1">
                <ViewButton
                  label={t.studio.zoomOut}
                  onClick={() => setViewVh((v) => Math.max(24, v - 12))}
                  disabled={viewVh <= 24}
                >
                  <Minus size={13} />
                </ViewButton>
                <button
                  onClick={() => setViewVh(68)}
                  title={t.studio.zoomFit}
                  className="mono rounded-lg border border-line px-2.5 py-1.5 text-[11px] tabular-nums text-text-faint transition-colors hover:border-text-faint hover:text-text"
                >
                  {Math.round((viewVh / 68) * 100)}%
                </button>
                <ViewButton
                  label={t.studio.zoomIn}
                  onClick={() => setViewVh((v) => Math.min(92, v + 12))}
                  disabled={viewVh >= 92}
                >
                  <Plus size={13} />
                </ViewButton>
              </div>
            </div>
          </div>

          <aside className="space-y-5 sm:sticky sm:top-6 sm:self-start">
            <fieldset
              className="rounded-xl border border-line bg-surface p-4"
              disabled={busy}
            >
              <legend className="mono px-2 text-[10px] uppercase tracking-[0.16em] text-text-faint">
                {t.studio.qualityLabel}
              </legend>
              {/* Moving the slider re-cuts the same photo straight away. The
                  fieldset disables itself the moment that starts, so a drag
                  across the track cannot queue a second cut behind the
                  first. */}
              <QualitySlider
                value={quality}
                onChange={(q) => void run(shot.file, q)}
                disabled={busy}
                onGpu={onGpu}
              />
              {(attireScale !== 1 || attireDrop !== 0) && (
                <button
                  onClick={() => {
                    setAttireScale(1);
                    setAttireDrop(0);
                  }}
                  className="mt-2.5 w-full rounded-lg border border-line px-3 py-2 text-xs font-medium transition-colors hover:border-text-faint"
                >
                  {t.studio.attireReset}
                </button>
              )}
              <p className="mt-2.5 text-pretty text-xs leading-relaxed text-text-faint">
                {busy
                  ? progress
                    ? t.progress[progress.key]
                    : t.progress.working
                  : t.studio.modelNote}
              </p>
              {weak && (
                <p className="mt-2 text-pretty text-xs leading-relaxed text-text-faint">
                  {fill(t.studio.lowPower, { px: CAP.weak })}
                </p>
              )}
              <CatalogAudit />
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
                {shoulders || (clothes && clothesFor === shot.file) ||
                shot.portrait?.confident
                  ? t.studio.attireAuto
                  : t.studio.attireManual}
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
                {!shot.capped
                  ? t.studio.exportNote
                  : shot.srcW > shot.w
                    ? // The cut was made small; the file is written large.
                      fill(t.studio.exportNoteRestored, {
                        w: shot.srcW,
                        h: shot.srcH,
                      })
                    : fill(t.studio.exportNoteCapped, { w: shot.w, h: shot.h })}
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
  warming,
  weak,
  onGpu,
  progress,
  quality,
  onQuality,
  onPick,
  onDragState,
  onFile,
}: {
  dragOver: boolean;
  busy: boolean;
  warming: boolean;
  weak: boolean;
  onGpu: boolean;
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
          <ProgressPanel progress={progress} quality={quality} onGpu={onGpu} />
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
        <QualitySlider
          value={quality}
          onChange={onQuality}
          disabled={busy}
          onGpu={onGpu}
        />
        {weak && (
          <p className="mt-2.5 text-pretty text-xs leading-relaxed text-text-faint">
            {fill(t.studio.lowPower, { px: CAP.weak })}
          </p>
        )}
        {warming && (
          <p
            className="mt-2.5 flex items-center gap-2 text-xs leading-relaxed text-text-faint"
            role="status"
            aria-live="polite"
          >
            <Loader2 size={12} className="shrink-0 animate-spin" />
            {progress ? t.progress[progress.key] : t.progress.preparing}
            {progress?.ratio != null && (
              <span className="mono tabular-nums">
                {Math.round(progress.ratio * 100)}%
              </span>
            )}
          </p>
        )}
        <CatalogAudit />
      </fieldset>
    </div>
  );
}

/** The view-size buttons. Icon-only, so the control stays the same width in
 *  every one of the eighteen languages. */
function ViewButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="rounded-lg border border-line p-1.5 text-text-faint transition-colors hover:border-text-faint hover:text-text disabled:opacity-40"
    >
      {children}
    </button>
  );
}

/** The tiers in the order they belong on a scale, lightest first. */
const TIERS: readonly Quality[] = ["lite", "fine", "light", "balanced", "maximum"];

/**
 * The three tiers as one slider instead of three cards.
 *
 * They are a single ordered scale — one network at rising precision — and
 * three separate buttons made them look like three different products. The
 * ends are labelled with the tier names that already exist, so the control
 * needs no new sentence in any of the eighteen languages.
 *
 * A native range, deliberately. It arrives keyboard-operable and announced
 * to a screen reader without a line of script, and the machines this whole
 * control exists to serve are the last place to spend JavaScript on a
 * widget the platform already ships.
 */
function QualitySlider({
  value,
  onChange,
  disabled,
  onGpu,
}: {
  value: Quality;
  onChange: (q: Quality) => void;
  disabled: boolean;
  onGpu: boolean;
}) {
  const { t } = useI18n();
  // Where the handle is, which is not yet what the model is. Dragging across
  // four stops used to start four cuts; the fieldset disabling itself
  // mid-drag hid that most of the time, which is not the same as fixing it.
  const [pending, setPending] = useState<Quality>(value);

  // The applied tier can move without this slider: a restored draft, or a
  // failed cut putting the choice back. Follow it, or the handle ends up
  // claiming a model that is not running. Adjusted during render rather
  // than in an effect, which is React's own answer for state that has to
  // track a prop — an effect here would render the stale handle first.
  const [tracked, setTracked] = useState<Quality>(value);
  if (tracked !== value) {
    setTracked(value);
    setPending(value);
  }

  const at = Math.max(0, TIERS.indexOf(pending));
  const titles = [
    t.studio.liteTitle,
    t.studio.fineTitle,
    t.studio.lightTitle,
    t.studio.balancedTitle,
    t.studio.maximumTitle,
  ];
  const notes = [
    t.studio.liteNote,
    t.studio.fineNote,
    t.studio.lightNote,
    t.studio.balancedNote,
    t.studio.maximumNote,
  ];
  const dirty = pending !== value;

  return (
    <div>
      <p className="flex items-center gap-2 text-sm font-medium">
        {titles[at]}
        {!dirty && <Sparkles size={13} className="text-accent-text" />}
      </p>
      <div className="mt-3 flex items-center gap-3">
        <span className="mono shrink-0 text-[10px] uppercase tracking-[0.12em] text-text-faint">
          {titles[0]}
        </span>
        <div className="relative flex-1">
          {/* Drawn under the thumb, because a four-position control with a
              bare rail reads as continuous. */}
          <div className="range-rail" aria-hidden="true">
            {TIERS.map((tier, i) => (
              <span
                key={tier}
                className="range-stop"
                style={{ left: `${(i / (TIERS.length - 1)) * 100}%` }}
              />
            ))}
          </div>
          <input
            type="range"
            className="mc-range ticks relative w-full"
            min={0}
            max={TIERS.length - 1}
            step={1}
            value={at}
            disabled={disabled}
            aria-label={t.studio.qualityLabel}
            aria-valuetext={titles[at]}
            onChange={(e) => setPending(TIERS[Number(e.target.value)])}
          />
        </div>
        <span className="mono shrink-0 text-[10px] uppercase tracking-[0.12em] text-text-faint">
          {titles[TIERS.length - 1]}
        </span>
      </div>
      <p className="mt-2.5 text-pretty text-xs leading-relaxed text-text-faint">
        {fill(notes[at], { mb: downloadMb(pending, onGpu) })}
      </p>
      {dirty && (
        <button
          onClick={() => onChange(pending)}
          disabled={disabled}
          className="mt-2.5 w-full rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-on-accent transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {t.studio.applyModel}
        </button>
      )}
    </div>
  );
}

function ProgressPanel({
  progress,
  quality,
  onGpu,
}: {
  progress: Progress | null;
  quality: Quality;
  onGpu: boolean;
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
          {fill(t.studio.firstDownloadNote, { mb: downloadMb(quality, onGpu) })}
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
        className="mc-range min-w-0 flex-1"
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
