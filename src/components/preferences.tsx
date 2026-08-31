"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import {
  DEFAULT_LOCALE,
  DICTS,
  LOCALES,
  STORAGE_KEY as LANG_KEY,
  dirOf,
  normalizeLocale,
  type Dict,
  type LocaleCode,
} from "@/lib/i18n";

export type ThemeChoice = "light" | "dark" | "system";
export const THEME_KEY = "mattecut.theme";

/* ── the store ───────────────────────────────────────────────────────────
   localStorage is an external system, so it is read through
   useSyncExternalStore rather than copied into state inside an effect.
   Three things fall out of that for free: no setState cascade on mount,
   no hydration mismatch (the server snapshot is used for the first client
   render too), and cross-tab sync — change the theme in one tab and every
   other tab follows.                                                     */

function makeStore<T extends string>(
  key: string,
  fallback: T,
  parse: (raw: string | null) => T | null,
) {
  const listeners = new Set<() => void>();
  let cache: T | null = null;
  let bound = false;

  // localStorage throws in a few real browsers (private mode, blocked
  // cookies). A preference is never worth taking the page down for.
  const fromDisk = (): T => {
    try {
      return parse(window.localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  };

  const notify = () => listeners.forEach((l) => l());

  return {
    subscribe(cb: () => void) {
      listeners.add(cb);
      if (!bound) {
        bound = true;
        window.addEventListener("storage", (e: StorageEvent) => {
          if (e.key === key || e.key === null) {
            cache = null;
            notify();
          }
        });
      }
      return () => {
        listeners.delete(cb);
      };
    },
    // Must be referentially stable between renders, hence the cache.
    get(): T {
      if (cache === null) cache = fromDisk();
      return cache;
    },
    server(): T {
      return fallback;
    },
    set(value: T) {
      cache = value;
      try {
        window.localStorage.setItem(key, value);
      } catch {
        /* the choice still applies for this session */
      }
      notify();
    },
  };
}

const THEMES: ThemeChoice[] = ["light", "dark", "system"];

const themeStore = makeStore<ThemeChoice>(THEME_KEY, "system", (raw) =>
  raw && (THEMES as string[]).includes(raw) ? (raw as ThemeChoice) : null,
);

const langStore = makeStore<LocaleCode>(LANG_KEY, DEFAULT_LOCALE, (raw) => {
  const stored = normalizeLocale(raw);
  if (stored) return stored;
  // Nothing chosen yet: fall back to what the browser says it reads.
  return (
    normalizeLocale(navigator.language) ??
    normalizeLocale(navigator.languages?.[0]) ??
    null
  );
});

/** The OS preference is its own external store. */
const darkQuery = {
  subscribe(cb: () => void) {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
  },
  get(): "light" | "dark" {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  },
  server(): "light" | "dark" {
    return "dark";
  },
};

/* ── theme ───────────────────────────────────────────────────────────── */

type ThemeCtx = {
  choice: ThemeChoice;
  resolved: "light" | "dark";
  setChoice: (t: ThemeChoice) => void;
};

const Theme = createContext<ThemeCtx | null>(null);

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const choice = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.get,
    themeStore.server,
  );
  const system = useSyncExternalStore(
    darkQuery.subscribe,
    darkQuery.get,
    darkQuery.server,
  );
  const resolved = choice === "system" ? system : choice;

  // The inline script in the head already stamped the attribute before the
  // first paint; this keeps it true for every change after that.
  useEffect(() => {
    const root = document.documentElement;
    if (choice === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", choice);
  }, [choice]);

  const setChoice = useCallback((t: ThemeChoice) => themeStore.set(t), []);

  const value = useMemo(
    () => ({ choice, resolved, setChoice }),
    [choice, resolved, setChoice],
  );
  return <Theme.Provider value={value}>{children}</Theme.Provider>;
}

export function useTheme() {
  const ctx = useContext(Theme);
  if (!ctx) throw new Error("useTheme must be used inside <Preferences>");
  return ctx;
}

/* ── language ────────────────────────────────────────────────────────── */

type LangCtx = {
  locale: LocaleCode;
  t: Dict;
  setLocale: (l: LocaleCode) => void;
};

const Lang = createContext<LangCtx | null>(null);

function LangProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(
    langStore.subscribe,
    langStore.get,
    langStore.server,
  );

  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = dirOf(locale);

    // The head is rendered on the server in one language. Once a reader
    // picks another, the tab title and the description should follow —
    // otherwise the page announces itself in a language nobody asked for.
    const dict = DICTS[locale];
    const studio = window.location.pathname.startsWith("/studio");
    const title = studio ? `${dict.meta.studioTitle} · Mattecut` : dict.meta.title;

    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        "content",
        studio ? dict.meta.studioDescription : dict.meta.description,
      );

    // React treats <title> as a hoistable it owns and re-asserts the
    // server-rendered value after hydration, which would undo a plain
    // assignment. Watch the element and put the translated title back.
    document.title = title;
    const node = document.querySelector("title");
    if (!node) return;
    const keep = new MutationObserver(() => {
      if (document.title !== title) document.title = title;
    });
    keep.observe(node, { childList: true, characterData: true, subtree: true });
    return () => keep.disconnect();
  }, [locale]);

  const setLocale = useCallback((l: LocaleCode) => {
    if (LOCALES.some((x) => x.code === l)) langStore.set(l);
  }, []);

  const value = useMemo(
    () => ({ locale, t: DICTS[locale], setLocale }),
    [locale, setLocale],
  );
  return <Lang.Provider value={value}>{children}</Lang.Provider>;
}

export function useI18n() {
  const ctx = useContext(Lang);
  if (!ctx) throw new Error("useI18n must be used inside <Preferences>");
  return ctx;
}

/* ── both, in one wrapper ────────────────────────────────────────────── */

export function Preferences({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LangProvider>{children}</LangProvider>
    </ThemeProvider>
  );
}

/**
 * Runs before the first paint, so the page never flashes the wrong theme
 * and <html lang> is right before the first screen-reader pass. Wrapped in
 * try/catch: a throw here would block rendering entirely.
 */
export const PREFERENCE_BOOTSTRAP = `(function(){try{
var d=document.documentElement;
var t=localStorage.getItem('${THEME_KEY}');
if(t==='light'||t==='dark')d.setAttribute('data-theme',t);
var codes=${JSON.stringify(LOCALES.map((l) => l.code))};
var rtl=${JSON.stringify(LOCALES.filter((l) => l.dir === "rtl").map((l) => l.code))};
var l=localStorage.getItem('${LANG_KEY}');
if(!l||codes.indexOf(l)<0){var n=(navigator.language||'').toLowerCase().split('-')[0];l=codes.indexOf(n)>-1?n:null;}
if(l){d.lang=l;d.dir=rtl.indexOf(l)>-1?'rtl':'ltr';}
}catch(e){}})();`;
