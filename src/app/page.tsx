"use client";

import Link from "next/link";
import {
  ArrowRight,
  Cpu,
  Download,
  Maximize2,
  MousePointerClick,
  Palette,
  WifiOff,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { GithubIcon } from "@/components/github-icon";
import { RotoLogo, RotoMark } from "@/components/logo";
import { HeroVisual } from "@/components/hero-visual";
import { Reveal } from "@/components/reveal";
import { LanguagePicker, ThemeToggle } from "@/components/switches";
import { useI18n } from "@/components/preferences";

const REPO = "https://github.com/nayrbryanGaming/roto";

export default function Home() {
  const { t } = useI18n();

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-on-accent"
      >
        {t.common.skipToContent}
      </a>
      <Nav />
      <main id="main" className="relative">
        <Hero />
        <Pillars />
        <Steps />
        <Features />
        <Honesty />
        <Closer />
      </main>
      <Footer />
    </>
  );
}

function Nav() {
  const { t } = useI18n();

  return (
    <nav className="sticky top-0 z-50 border-b border-line-soft bg-ink/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <RotoMark size={26} className="sm:hidden" />
        <RotoLogo size={26} className="hidden sm:inline-flex" />
        <div className="flex items-center gap-1.5 sm:gap-2">
          <a
            href={REPO}
            target="_blank"
            rel="noreferrer noopener"
            className="hidden items-center gap-2 px-2 text-sm text-text-dim transition-colors hover:text-text lg:flex"
          >
            <GithubIcon size={16} />
            {t.common.sourceCode}
          </a>
          <LanguagePicker variant="compact" className="flex md:hidden" />
          <LanguagePicker className="hidden md:flex" />
          <ThemeToggle />
          <Link
            href="/studio"
            className="whitespace-nowrap rounded-full bg-accent px-3 py-2 text-[13px] font-semibold text-on-accent transition-colors hover:bg-accent-hi sm:px-4 sm:text-sm"
          >
            {t.common.openStudio}
          </Link>
        </div>
      </div>
    </nav>
  );
}

/** A slow-drifting wash behind the hero. It is the only thing on the page
 *  that moves without being asked to, so it stays very quiet. */
function Aurora() {
  const still = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -top-1/3 left-1/2 h-[70vh] w-[120vw] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, var(--glow) 0%, transparent 100%)",
        }}
        animate={still ? undefined : { scale: [1, 1.12, 1], opacity: [0.75, 1, 0.75] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function Hero() {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden border-b border-line-soft">
      <Aurora />
      <div className="relative mx-auto grid max-w-6xl gap-14 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <Reveal>
            <span className="mono inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-[11px] uppercase tracking-[0.1em] text-text-dim">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ok" />
              </span>
              {t.hero.badge}
            </span>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.035em] sm:text-5xl lg:text-6xl">
              {t.hero.titleA}
              <br />
              <span className="text-text-faint">{t.hero.titleB}</span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-6 max-w-md text-pretty text-base leading-relaxed text-text-dim sm:text-lg">
              {t.hero.lead}
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/studio"
                className="group inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hi"
              >
                {t.hero.cta}
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                />
              </Link>
              <a
                href={REPO}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 rounded-xl border border-line px-6 py-3.5 text-sm text-text-dim transition-colors hover:border-text-faint hover:text-text"
              >
                <GithubIcon size={16} />
                {t.common.readCode}
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mono mt-6 text-[11px] leading-relaxed text-text-faint">
              {t.hero.note}
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.12}>
          <HeroVisual />
        </Reveal>
      </div>
    </section>
  );
}

function Pillars() {
  const { t } = useI18n();
  const icons = [Cpu, Maximize2, WifiOff];

  return (
    <section className="border-b border-line-soft">
      <div className="mx-auto grid max-w-6xl gap-px overflow-hidden bg-line-soft px-4 sm:px-6 md:grid-cols-3">
        {t.pillars.map((it, i) => {
          const Icon = icons[i];
          return (
            <Reveal
              key={it.title}
              delay={i * 0.07}
              className="bg-ink p-8 transition-colors hover:bg-surface-2 lg:p-10"
            >
              <Icon size={20} className="text-accent-text" />
              <h3 className="mt-5 text-base font-semibold tracking-[-0.01em]">
                {it.title}
              </h3>
              <p className="mt-2.5 text-pretty text-sm leading-relaxed text-text-dim">
                {it.body}
              </p>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function Steps() {
  const { t } = useI18n();

  return (
    <section className="border-b border-line-soft">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <Reveal>
          <p className="mono text-[11px] uppercase tracking-[0.16em] text-accent-text">
            {t.steps.eyebrow}
          </p>
          <h2 className="mt-4 max-w-lg text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            {t.steps.heading}
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2">
          {t.steps.items.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.06}>
              <div className="flex gap-5">
                <span className="mono shrink-0 text-sm text-accent-text">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold tracking-[-0.01em]">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-pretty text-sm leading-relaxed text-text-dim">
                    {s.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const { t } = useI18n();
  const icons = [Palette, MousePointerClick, Download];

  return (
    <section className="border-b border-line-soft">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <Reveal>
          <p className="mono text-[11px] uppercase tracking-[0.16em] text-accent-text">
            {t.features.eyebrow}
          </p>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {t.features.items.map((it, i) => {
            const Icon = icons[i];
            return (
              <Reveal key={it.title} delay={i * 0.07}>
                <div className="group h-full rounded-2xl border border-line bg-surface p-7 transition-all duration-200 hover:-translate-y-1 hover:border-accent/50">
                  <Icon size={19} className="text-accent-text" />
                  <h3 className="mt-5 text-base font-semibold tracking-[-0.01em]">
                    {it.title}
                  </h3>
                  <p className="mt-2.5 text-pretty text-sm leading-relaxed text-text-dim">
                    {it.body}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** The section most tools skip. Stating the limits up front is cheaper
 *  than having someone discover them mid-task. */
function Honesty() {
  const { t } = useI18n();

  return (
    <section className="border-b border-line-soft bg-ink-2">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <Reveal>
          <p className="mono text-[11px] uppercase tracking-[0.16em] text-amber-text">
            {t.limits.eyebrow}
          </p>
          <h2 className="mt-4 max-w-xl text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            {t.limits.heading}
          </h2>
        </Reveal>

        <div className="mt-12 divide-y divide-line-soft border-y border-line-soft">
          {t.limits.items.map((row, i) => (
            <Reveal key={row.title} delay={i * 0.06}>
              <div className="grid gap-2 py-6 md:grid-cols-[280px_1fr] md:gap-10">
                <p className="text-sm font-medium">{row.title}</p>
                <p className="text-pretty text-sm leading-relaxed text-text-dim">
                  {row.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Closer() {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden border-b border-line-soft">
      <div className="relative mx-auto max-w-6xl px-4 py-24 text-center sm:px-6 sm:py-32">
        <Reveal>
          <RotoMark size={44} className="mx-auto" />
          <h2 className="mx-auto mt-8 max-w-xl text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">
            {t.closer.heading}
          </h2>
          <p className="mx-auto mt-5 max-w-md text-pretty leading-relaxed text-text-dim">
            {t.closer.body}
          </p>
          <Link
            href="/studio"
            className="group mt-10 inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-4 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hi"
          >
            {t.common.openStudio}
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
            />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  const { t } = useI18n();

  return (
    <footer className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-10 text-sm text-text-faint sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <RotoLogo size={20} className="inline-flex text-text-dim" />
        <div className="flex flex-wrap items-center gap-5">
          <a
            href={REPO}
            target="_blank"
            rel="noreferrer noopener"
            className="transition-colors hover:text-text"
          >
            GitHub
          </a>
          <Link href="/studio" className="transition-colors hover:text-text">
            {t.meta.studioTitle}
          </Link>

        </div>
      </div>
      <p className="text-pretty text-xs leading-relaxed">{t.footer.tagline}</p>
    </footer>
  );
}
