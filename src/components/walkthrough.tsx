"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Download, Pause, Play } from "lucide-react";
import { useI18n } from "@/components/preferences";

/**
 * A walkthrough that is drawn, not filmed.
 *
 * The obvious way to show a product working is a screen recording. For this
 * one it is the wrong medium: a tutorial video is megabytes, and the people
 * this app was hardened for are on the connections where megabytes hurt.
 * The same argument that made the backdrop catalogue generated rather than
 * downloaded applies here — everything below is shapes and transitions, so
 * the demonstration costs no network at all.
 *
 * The copy is the four steps already written and translated for the section
 * this replaces, so the animation adds no new sentence to any of the
 * eighteen dictionaries.
 */

const STAGES = 4;
const DWELL_MS = 3600;

export function Walkthrough() {
  const { t } = useI18n();
  const still = useReducedMotion();
  const [stage, setStage] = useState(0);
  // Someone reading step three should not be dragged to step four. Any
  // manual choice stops the carousel until they start it again.
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running || still) return;
    const id = setTimeout(() => setStage((s) => (s + 1) % STAGES), DWELL_MS);
    return () => clearTimeout(id);
  }, [stage, running, still]);

  const items = t.steps.items;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
      <Stage stage={stage} still={!!still} />

      <div>
        <ol className="space-y-1.5">
          {items.map((s, i) => {
            const active = i === stage;
            return (
              <li key={s.title}>
                <button
                  onClick={() => {
                    setStage(i);
                    setRunning(false);
                  }}
                  aria-current={active ? "step" : undefined}
                  className={`w-full rounded-xl border p-4 text-start transition-colors ${
                    active
                      ? "border-accent bg-accent/10"
                      : "border-transparent hover:border-line"
                  }`}
                >
                  <span className="flex items-baseline gap-3">
                    <span className="mono text-[11px] text-accent-text">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-semibold tracking-[-0.01em]">
                      {s.title}
                    </span>
                  </span>
                  {active && (
                    <p className="mt-2 ps-8 text-pretty text-sm leading-relaxed text-text-dim">
                      {s.body}
                    </p>
                  )}
                </button>
              </li>
            );
          })}
        </ol>

        {!still && (
          <button
            onClick={() => setRunning((r) => !r)}
            className="mono mt-3 inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-text-faint transition-colors hover:border-text-faint hover:text-text"
          >
            {running ? <Pause size={12} /> : <Play size={12} />}
            {String(stage + 1)}/{STAGES}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * The picture half. One frame that changes state rather than four separate
 * illustrations, so the transitions carry the meaning: the background is
 * what leaves, and the subject is what stays.
 */
function Stage({ stage, still }: { stage: number; still: boolean }) {
  const ease = [0.22, 1, 0.36, 1] as const;
  const dur = still ? 0 : 0.55;

  return (
    <div
      className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-line bg-surface"
      role="img"
      aria-hidden="true"
    >
      <div className="checker absolute inset-0" />

      {/* The original photo's background. It is the thing being removed, so
          it is the only element that leaves the frame. */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, var(--hv-1), var(--hv-2) 55%, var(--hv-3))",
        }}
        initial={false}
        animate={{ clipPath: stage === 0 ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
        transition={{ duration: dur * 1.3, ease }}
      />

      {/* The replacement background, which only exists from step three on. */}
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ opacity: stage >= 2 ? 1 : 0 }}
        transition={{ duration: dur, ease }}
        style={{
          background:
            "linear-gradient(150deg, var(--accent-hi), var(--accent-lo))",
        }}
      />

      {/* The subject: the one thing that survives every step. */}
      <motion.svg
        viewBox="0 0 120 90"
        className="absolute inset-0 h-full w-full"
        initial={false}
        animate={{ scale: stage === 3 ? 0.9 : 1 }}
        transition={{ duration: dur, ease }}
      >
        <circle cx="60" cy="36" r="14" fill="var(--text)" opacity="0.88" />
        <path
          d="M28 90c0-17.7 14.3-32 32-32s32 14.3 32 32H28Z"
          fill="var(--text)"
          opacity="0.88"
        />
      </motion.svg>

      {/* Step two: the progress of the cut, reported rather than implied. */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-1 origin-left bg-accent"
        initial={false}
        animate={{ scaleX: stage === 1 ? 1 : 0, opacity: stage === 1 ? 1 : 0 }}
        transition={{ duration: stage === 1 ? dur * 3 : dur * 0.4, ease: "linear" }}
      />

      {/* Step four: the file leaving, which is the only moment anything is
          written to disk. */}
      <motion.div
        className="absolute bottom-3 end-3 flex items-center gap-2 rounded-lg border px-2.5 py-1.5"
        style={{
          background: "var(--scrim)",
          color: "var(--scrim-fg)",
          borderColor: "var(--scrim-line)",
        }}
        initial={false}
        animate={{
          opacity: stage === 3 ? 1 : 0,
          y: stage === 3 ? 0 : 10,
        }}
        transition={{ duration: dur, ease }}
      >
        <Download size={12} />
        <span className="mono text-[10px] tracking-[0.08em]">PNG</span>
      </motion.div>

      {/* A label naming the state, so the frame is legible without sound,
          motion, or a caption track. */}
      <div
        className="mono absolute start-3 top-3 rounded-md border px-2 py-1 text-[10px] uppercase tracking-[0.14em]"
        style={{
          background: "var(--scrim)",
          color: "var(--scrim-fg)",
          borderColor: "var(--scrim-line)",
        }}
      >
        {["source", "matte", "backdrop", "export"][stage]}
      </div>
    </div>
  );
}
