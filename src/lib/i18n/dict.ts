/**
 * The shape every locale must satisfy.
 *
 * Deliberately flat-ish and fully typed: adding a string to the product
 * breaks the build for every language that has not translated it yet,
 * which is the only reliable way to stop half-translated screens from
 * shipping. Placeholders use {name} and are filled by `fill()`.
 */
export type Pair = { title: string; body: string };

export type Dict = {
  meta: {
    title: string;
    description: string;
    studioTitle: string;
    studioDescription: string;
    notFoundTitle: string;
    notFoundBody: string;
    backHome: string;
  };
  common: {
    openStudio: string;
    sourceCode: string;
    readCode: string;
    close: string;
    skipToContent: string;
  };
  theme: { label: string; light: string; dark: string; system: string };
  lang: { label: string };
  hero: {
    badge: string;
    titleA: string;
    titleB: string;
    lead: string;
    cta: string;
    note: string;
    caption: string;
  };
  pillars: [Pair, Pair, Pair];
  steps: { eyebrow: string; heading: string; items: [Pair, Pair, Pair, Pair] };
  features: { eyebrow: string; items: [Pair, Pair, Pair] };
  limits: { eyebrow: string; heading: string; items: [Pair, Pair, Pair] };
  closer: { heading: string; body: string };
  footer: { tagline: string };
  studio: {
    onDevice: string;
    back: string;
    dropTitle: string;
    dropBody: string;
    pick: string;
    formats: string;
    qualityLabel: string;
    applyModel: string;
    liteTitle: string;
    liteNote: string;
    fineTitle: string;
    fineNote: string;
    lightTitle: string;
    lightNote: string;
    balancedTitle: string;
    balancedNote: string;
    maximumTitle: string;
    maximumNote: string;
    auditOpen: string;
    auditResult: string;
    auditSize: string;
    auditTiny: string;
    auditMath: string;
    auditNote: string;
    auditFailed: string;
    downloadPng: string;
    transparentSuffix: string;
    exportNote: string;
    exportNoteCapped: string;
    lowPower: string;
    zoomOut: string;
    zoomIn: string;
    zoomFit: string;
    another: string;
    restored: string;
    modelNote: string;
    attireLabel: string;
    attireNone: string;
    attire: [string, string, string];
    attireAuto: string;
    attireManual: string;
    attireReset: string;
    attireSize: string;
    attireDrop: string;
    firstDownloadNote: string;
    errUnsupported: string;
    errTooBig: string;
    errFailed: string;
    errExport: string;
    errDecode: string;
  };
  progress: {
    downloading: string;
    engine: string;
    separating: string;
    done: string;
    working: string;
    preparing: string;
  };
  compare: {
    before: string;
    after: string;
    sliderLabel: string;
    altBefore: string;
    altAfter: string;
  };
  bg: {
    bgLabel: string;
    gradientLabel: string;
    customLabel: string;
    transparent: string;
    wheel: string;
    spectrum: string;
    hue: string;
    alpha: string;
    count: string;
    hint: string;
    invalid: string;
    presets: [string, string, string, string, string, string, string, string];
    gradients: [string, string, string, string];
    wallpaperLabel: string;
    wallpapers: [string, string, string, string, string, string];
    upload: string;
    uploadHint: string;
    catalogueOpen: string;
    catalogueTitle: string;
    catalogueCount: string;
    cataloguePhotoCount: string;
    catalogueByCount: string;
    creditRequired: string;
    catalogueTabGradients: string;
    catalogueTabPhotos: string;
    catalogueSearch: string;
    catalogueEmpty: string;
    catalogueFailed: string;
    creditShown: string;
    fitCover: string;
    fitContain: string;
  };
};

/** Replace {token} with a value. Kept trivial on purpose. */
export function fill(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) =>
    k in vars ? String(vars[k]) : m,
  );
}
