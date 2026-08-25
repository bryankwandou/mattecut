import type { Dict } from "./dict";
import { id } from "./locales/id";
import { en } from "./locales/en";
import { ms } from "./locales/ms";
import { es } from "./locales/es";
import { pt } from "./locales/pt";
import { fr } from "./locales/fr";
import { de } from "./locales/de";
import { it } from "./locales/it";
import { nl } from "./locales/nl";
import { tr } from "./locales/tr";
import { vi } from "./locales/vi";
import { th } from "./locales/th";
import { ja } from "./locales/ja";
import { ko } from "./locales/ko";
import { zh } from "./locales/zh";
import { hi } from "./locales/hi";
import { ru } from "./locales/ru";
import { ar } from "./locales/ar";

export type { Dict } from "./dict";
export { fill } from "./dict";

/**
 * Every locale carries its own endonym — a language list written in the
 * reader's language is useless to the reader who cannot read it.
 */
export const LOCALES = [
  { code: "id", label: "Bahasa Indonesia", dir: "ltr" },
  { code: "en", label: "English", dir: "ltr" },
  { code: "ms", label: "Bahasa Melayu", dir: "ltr" },
  { code: "es", label: "Español", dir: "ltr" },
  { code: "pt", label: "Português", dir: "ltr" },
  { code: "fr", label: "Français", dir: "ltr" },
  { code: "de", label: "Deutsch", dir: "ltr" },
  { code: "it", label: "Italiano", dir: "ltr" },
  { code: "nl", label: "Nederlands", dir: "ltr" },
  { code: "tr", label: "Türkçe", dir: "ltr" },
  { code: "vi", label: "Tiếng Việt", dir: "ltr" },
  { code: "th", label: "ไทย", dir: "ltr" },
  { code: "ja", label: "日本語", dir: "ltr" },
  { code: "ko", label: "한국어", dir: "ltr" },
  { code: "zh", label: "中文", dir: "ltr" },
  { code: "hi", label: "हिन्दी", dir: "ltr" },
  { code: "ru", label: "Русский", dir: "ltr" },
  { code: "ar", label: "العربية", dir: "rtl" },
] as const;

export type LocaleCode = (typeof LOCALES)[number]["code"];

export const DICTS: Record<LocaleCode, Dict> = {
  id,
  en,
  ms,
  es,
  pt,
  fr,
  de,
  it,
  nl,
  tr,
  vi,
  th,
  ja,
  ko,
  zh,
  hi,
  ru,
  ar,
};

export const DEFAULT_LOCALE: LocaleCode = "id";

export const STORAGE_KEY = "roto.lang";

const CODES = new Set<string>(LOCALES.map((l) => l.code));

/** Never trust a stored or navigator-supplied string; map it or refuse. */
export function normalizeLocale(raw: string | null | undefined): LocaleCode | null {
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (CODES.has(lower)) return lower as LocaleCode;
  const base = lower.split(/[-_]/)[0];
  if (CODES.has(base)) return base as LocaleCode;
  // A few tags people actually have set that do not match by prefix.
  if (base === "in") return "id"; // legacy tag for Indonesian
  if (base === "zh" || lower.startsWith("cmn")) return "zh";
  return null;
}

export function dirOf(code: LocaleCode): "ltr" | "rtl" {
  return LOCALES.find((l) => l.code === code)?.dir ?? "ltr";
}
