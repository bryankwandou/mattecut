"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, TriangleAlert } from "lucide-react";
import { readCatalog, mb, type Catalog } from "@/lib/catalog";
import { canGpu } from "@/lib/matting";
import { useI18n } from "@/components/preferences";
import { fill } from "@/lib/i18n";

type State =
  | { kind: "shut" }
  | { kind: "reading" }
  | { kind: "read"; catalog: Catalog }
  | { kind: "failed" };

/**
 * "Is a smaller one being hidden from me?" is a fair question to ask a
 * product that offers three sizes, and no sentence I write is a good answer
 * to it. This reads the origin manifest on click and prints every row it
 * contains, so the answer comes from the source rather than from me.
 */
export function CatalogAudit() {
  const { t } = useI18n();
  const [state, setState] = useState<State>({ kind: "shut" });
  const abort = useRef<AbortController | null>(null);

  useEffect(() => () => abort.current?.abort(), []);

  const open = useCallback(async () => {
    if (state.kind !== "shut") {
      setState({ kind: "shut" });
      return;
    }
    setState({ kind: "reading" });
    abort.current?.abort();
    const ctl = new AbortController();
    abort.current = ctl;
    try {
      const onGpu = await canGpu();
      setState({
        kind: "read",
        catalog: await readCatalog(onGpu, ctl.signal),
      });
    } catch {
      if (!ctl.signal.aborted) setState({ kind: "failed" });
    }
  }, [state.kind]);

  const shown = state.kind === "read" || state.kind === "failed";

  return (
    <div className="mt-3 border-t border-line pt-3">
      <button
        onClick={open}
        aria-expanded={shown}
        className="flex w-full items-center justify-between gap-2 text-start text-xs text-text-faint transition-colors hover:text-text"
      >
        <span>{t.studio.auditOpen}</span>
        {state.kind === "reading" ? (
          <Loader2 size={13} className="shrink-0 animate-spin" />
        ) : (
          <ChevronDown
            size={13}
            className={`shrink-0 transition-transform ${shown ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {state.kind === "failed" && (
        <p className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-text-faint">
          <TriangleAlert size={13} className="mt-0.5 shrink-0" />
          {t.studio.auditFailed}
        </p>
      )}

      {state.kind === "read" && (
        <div className="mt-2">
          <p className="flex items-start gap-2 text-xs leading-relaxed text-text">
            <Check size={13} className="mt-0.5 shrink-0 text-accent-text" />
            {fill(t.studio.auditResult, {
              models: state.catalog.models,
              small: state.catalog.smallest.toLocaleString(),
              big: state.catalog.largest.toLocaleString(),
            })}
          </p>

          <ul className="mono mt-2 space-y-1 text-[11px] text-text-faint">
            {state.catalog.entries.map((e) => (
              <li key={e.key} className="flex items-baseline justify-between gap-3">
                <span className="truncate">{e.key}</span>
                <span className="shrink-0 tabular-nums">
                  {mb(e.bytes) < 0.05
                    ? fill(t.studio.auditTiny, { kb: Math.round(e.bytes / 1024) })
                    : fill(t.studio.auditSize, { mb: mb(e.bytes).toFixed(1) })}
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-2 text-xs leading-relaxed text-text-faint">
            {fill(t.studio.auditMath, {
              rt: mb(state.catalog.runtime).toFixed(1),
            })}{" "}
            {t.studio.auditNote}
          </p>
        </div>
      )}
    </div>
  );
}
