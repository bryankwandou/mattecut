"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChevronDown, Languages, Monitor, Moon, Sun } from "lucide-react";
import { LOCALES, type LocaleCode } from "@/lib/i18n";
import { useI18n, useTheme, type ThemeChoice } from "@/components/preferences";

const OPTIONS: { key: ThemeChoice; Icon: typeof Sun }[] = [
  { key: "light", Icon: Sun },
  { key: "dark", Icon: Moon },
  { key: "system", Icon: Monitor },
];

/**
 * Three states, not two. A binary switch cannot express "whatever the OS
 * says", and that is the setting most people actually want.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { choice, setChoice } = useTheme();
  const { t } = useI18n();
  const still = useReducedMotion();
  const group = useId();

  const label = {
    light: t.theme.light,
    dark: t.theme.dark,
    system: t.theme.system,
  };

  return (
    <div
      role="radiogroup"
      aria-label={t.theme.label}
      className={`inline-flex items-center gap-0.5 rounded-full border border-line bg-surface p-0.5 ${className}`}
    >
      {OPTIONS.map(({ key, Icon }) => {
        const active = choice === key;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label[key]}
            title={label[key]}
            onClick={() => setChoice(key)}
            className="relative grid h-8 w-8 place-items-center rounded-full"
          >
            {active && (
              <motion.span
                layoutId={`${group}-theme-pill`}
                transition={
                  still
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 420, damping: 34 }
                }
                className="absolute inset-0 rounded-full bg-accent"
              />
            )}
            <Icon
              size={15}
              className={`relative transition-colors ${
                active ? "text-on-accent" : "text-text-faint"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

/**
 * A native select underneath our own chrome.
 *
 * Eighteen options in a hand-rolled popover is a worse experience on a
 * phone than the control the OS already ships, and the keyboard and
 * screen-reader behaviour comes for free. The visible part is ours so it
 * matches the rest of the UI; the select itself is a transparent layer
 * on top of it.
 *
 * "compact" shows the language code and fits a phone nav bar. "full"
 * spells out the endonym and belongs where there is room, because a
 * language list written in a language you cannot read is no help.
 */
export function LanguagePicker({
  variant = "full",
  className = "flex",
}: {
  variant?: "full" | "compact";
  className?: string;
}) {
  const { locale, setLocale, t } = useI18n();
  const id = useId();
  const current = LOCALES.find((l) => l.code === locale);

  return (
    <div
      // Display is the caller's to set. Shipping a base `flex` here and
      // letting a caller add `hidden` puts two display utilities on one
      // element, and which one wins depends on stylesheet order.
      className={`relative h-9 items-center gap-1.5 rounded-full border border-line bg-surface text-sm text-text-dim transition-colors focus-within:border-accent hover:text-text ${
        variant === "compact" ? "ps-2.5 pe-2" : "ps-3 pe-2.5"
      } ${className}`}
    >
      <Languages size={15} aria-hidden className="shrink-0 text-text-faint" />
      <span
        className={
          variant === "compact"
            ? "mono text-xs uppercase"
            : "max-w-[8.5rem] truncate"
        }
      >
        {variant === "compact" ? locale : current?.label}
      </span>
      <ChevronDown size={14} aria-hidden className="shrink-0 text-text-faint" />

      <label htmlFor={id} className="sr-only">
        {t.lang.label}
      </label>
      <select
        id={id}
        value={locale}
        onChange={(e) => setLocale(e.target.value as LocaleCode)}
        className="absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-full opacity-0"
      >
        {LOCALES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}
