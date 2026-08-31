"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MattecutMark } from "@/components/logo";
import { useI18n } from "@/components/preferences";

export default function NotFound() {
  const { t } = useI18n();

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-16">
      <div className="max-w-md text-center">
        <MattecutMark size={40} className="mx-auto" />
        <p className="mono mt-8 text-[11px] uppercase tracking-[0.16em] text-text-faint">
          404
        </p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.03em]">
          {t.meta.notFoundTitle}
        </h1>
        <p className="mt-4 text-pretty text-sm leading-relaxed text-text-dim">
          {t.meta.notFoundBody}
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-xl border border-line px-5 py-3 text-sm text-text-dim transition-colors hover:border-text-faint hover:text-text"
        >
          <ArrowLeft size={15} className="rtl:rotate-180" />
          {t.meta.backHome}
        </Link>
      </div>
    </main>
  );
}
