import type { Dict } from "../dict";

export const en: Dict = {
  meta: {
    title: "Roto — remove image backgrounds without uploading them",
    description:
      "A background remover that runs inside the browser. Images are never sent to a server, there is no queue, and the result downloads at the original resolution.",
    studioTitle: "Studio",
    studioDescription:
      "Drop an image, cut the subject out, then swap the background for any colour or gradient.",
    notFoundTitle: "That page does not exist",
    notFoundBody:
      "The link may have a typo in it, or the page was never there to begin with.",
    backHome: "Back to the home page",
  },
  common: {
    openStudio: "Open studio",
    sourceCode: "Source code",
    readCode: "Read the code",
    close: "Close",
    skipToContent: "Skip to content",
  },
  theme: {
    label: "Appearance",
    light: "Light",
    dark: "Dark",
    system: "Match system",
  },
  lang: { label: "Language" },
  hero: {
    badge: "Runs on your device",
    titleA: "Lift the subject.",
    titleB: "Drop the rest.",
    lead: "Roto cuts image backgrounds out inside the browser itself. The file never leaves your device, so there is no queue, no daily quota, and nothing you have to take on trust about what happens to your photo.",
    cta: "Cut your first image",
    note: "No account · no upload · no watermark",
    caption: "Alpha matte · 8-bit",
  },
  pillars: [
    {
      title: "Processed on your device",
      body: "The segmentation model runs in your own browser through WebAssembly. Your image never touches our servers, because there is no server on the other end to receive it.",
    },
    {
      title: "Original resolution",
      body: "What you download is the result at the source file's dimensions. The preview may be scaled down for speed, but the export is always rebuilt from the full data.",
    },
    {
      title: "Works without a connection",
      body: "Once the first model download is cached in the browser, later images keep processing even when the network is gone.",
    },
  ],
  steps: {
    eyebrow: "How it works",
    heading: "Four steps, nothing hidden",
    items: [
      {
        title: "Bring in an image",
        body: "Drag a file onto the drop area, paste from the clipboard, or pick one from your phone's gallery. JPG, PNG, and WebP up to 12 MB.",
      },
      {
        title: "Wait for the cut",
        body: "The model separates subject from background. An ordinary photo finishes in seconds, and the progress bar reports the stage actually running rather than an invented number.",
      },
      {
        title: "Set the new background",
        body: "Leave it transparent, pick a swatch, type your own HEX or rgb(), or use a gradient. The preview updates the moment you change it.",
      },
      {
        title: "Download",
        body: "PNG for a transparent background, JPG when you need a light file, WebP when you are chasing the smallest size.",
      },
    ],
  },
  features: {
    eyebrow: "What is inside",
    items: [
      {
        title: "HEX and rgb() alike",
        body: "The colour field takes #FF0000, #F00, rgb(255, 0, 0), and rgba() when you want a semi-transparent backdrop. A typo is flagged, not silently ignored.",
      },
      {
        title: "A comparison you can drag",
        body: "One divider to judge the cut by. It works with a mouse, a finger, and the arrow keys.",
      },
      {
        title: "Three export formats",
        body: "PNG keeps the alpha channel. JPG and WebP are there for when all you need is a small file to upload somewhere else.",
      },
    ],
  },
  limits: {
    eyebrow: "The limits",
    heading: "Things worth knowing before you try it",
    items: [
      {
        title: "A 54 MB first download",
        body: "The segmentation model has to reach the browser first. Once only, then it stays cached. On a metered connection, do it over Wi-Fi.",
      },
      {
        title: "Older devices feel slower",
        body: "The computation sits on your phone or laptop, not on a server. A budget phone can take a dozen seconds per image.",
      },
      {
        title: "Fine hair is still hard",
        body: "Precise mode is far cleaner on soft edges, but no model is perfect when the background is close in colour to the subject.",
      },
    ],
  },
  closer: {
    heading: "Open one image and see for yourself",
    body: "No sign-up in the way. Open the studio, drop a file, done.",
  },
  footer: {
    tagline: "Built to be used without handing your photos to anyone.",
  },
  studio: {
    onDevice: "Processed on this device",
    back: "Back to the home page",
    dropTitle: "Drop an image here",
    dropBody:
      "Drag the file onto this area, paste from the clipboard, or use the button below.",
    pick: "Choose an image",
    formats: "JPG · PNG · WEBP — 12 MB maximum",
    qualityLabel: "Quality",
    fastTitle: "Fast",
    fastNote: "{mb} MB model · enough for most photos",
    preciseTitle: "Precise",
    preciseNote: "{mb} MB model · cleaner on hair and soft edges",
    downloadPng: "Download PNG",
    transparentSuffix: "transparent",
    exportNote: "Always exported at the original resolution, not the preview size.",
    another: "Another image",
    firstDownloadNote:
      "This {mb} MB download happens once. After it is cached in the browser, later images are processed with no network at all.",
    errUnsupported: "That format is not supported yet. Use JPG, PNG, or WebP.",
    errTooBig: "A {mb} MB file is over the 12 MB limit. Shrink it first.",
    errFailed: "The image could not be processed. Try again with another file.",
    errExport: "The download could not be prepared.",
    errDecode: "The result could not be read as an image.",
  },
  progress: {
    downloading: "Downloading the model to your device",
    engine: "Starting the engine in the browser",
    separating: "Separating subject from background",
    done: "Done",
    working: "working…",
    preparing: "Getting ready…",
  },
  compare: {
    before: "Original",
    after: "Roto",
    sliderLabel: "Drag to compare before and after",
    altBefore: "The original image before processing",
    altAfter: "The result after the background was removed",
  },
  bg: {
    bgLabel: "Background",
    gradientLabel: "Gradient",
    customLabel: "Custom colour",
    transparent: "Transparent",
    wheel: "Pick from the colour wheel",
    hint: "Takes HEX and rgb(), including rgba() for a semi-transparent backdrop.",
    invalid: "That did not parse. Try #FF0000, #F00, or rgb(255, 0, 0).",
    presets: [
      "White",
      "Black",
      "Studio grey",
      "Safelight",
      "Passport blue",
      "Passport red",
      "Screen green",
      "Cream",
    ],
    gradients: ["Dusk", "Haze", "Midnight", "Sea"],
  },
};
