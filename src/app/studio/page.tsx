import type { Metadata } from "next";
import { Studio } from "@/components/studio";
import { DEFAULT_LOCALE, DICTS } from "@/lib/i18n";

const base = DICTS[DEFAULT_LOCALE];

export const metadata: Metadata = {
  title: base.meta.studioTitle,
  description: base.meta.studioDescription,
};

export default function StudioPage() {
  return (
    <main className="min-h-dvh">
      <Studio />
    </main>
  );
}
