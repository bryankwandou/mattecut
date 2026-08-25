import type { Dict } from "../dict";

export const de: Dict = {
  meta: {
    title: "Roto — Bildhintergründe entfernen, ohne sie hochzuladen",
    description:
      "Ein Hintergrundentferner, der im Browser läuft. Bilder gehen an keinen Server, es gibt keine Warteschlange, und das Ergebnis wird in der Originalauflösung heruntergeladen.",
    studioTitle: "Studio",
    studioDescription:
      "Bild ablegen, Motiv freistellen und den Hintergrund durch eine beliebige Farbe oder einen Verlauf ersetzen.",
    notFoundTitle: "Diese Seite gibt es nicht",
    notFoundBody:
      "Im Link steckt vielleicht ein Tippfehler, oder die Seite hat es nie gegeben.",
    backHome: "Zurück zur Startseite",
  },
  common: {
    openStudio: "Studio öffnen",
    sourceCode: "Quellcode",
    readCode: "Code lesen",
    close: "Schließen",
    skipToContent: "Zum Inhalt springen",
  },
  theme: {
    label: "Darstellung",
    light: "Hell",
    dark: "Dunkel",
    system: "Wie das System",
  },
  lang: { label: "Sprache" },
  hero: {
    badge: "Läuft auf Ihrem Gerät",
    titleA: "Motiv freistellen.",
    titleB: "Rest verwerfen.",
    lead: "Roto schneidet Bildhintergründe direkt im Browser heraus. Die Datei verlässt Ihr Gerät nie, also gibt es keine Warteschlange, kein Tageslimit und nichts, was Sie darüber glauben müssten, was mit Ihrem Foto passiert.",
    cta: "Erstes Bild freistellen",
    note: "Ohne Konto · ohne Upload · ohne Wasserzeichen",
    caption: "Alpha-Matte · 8 Bit",
  },
  pillars: [
    {
      title: "Auf Ihrem Gerät verarbeitet",
      body: "Das Segmentierungsmodell läuft über WebAssembly in Ihrem eigenen Browser. Das Bild berührt unsere Server nicht, weil auf der anderen Seite gar kein Server steht, der es entgegennimmt.",
    },
    {
      title: "Originalauflösung",
      body: "Heruntergeladen wird das Ergebnis in den Maßen der Ausgangsdatei. Die Vorschau darf aus Tempogründen kleiner sein, der Export wird aber immer aus den vollen Daten neu aufgebaut.",
    },
    {
      title: "Läuft ohne Verbindung",
      body: "Sobald der erste Modell-Download im Browser liegt, werden weitere Bilder auch ohne Netz verarbeitet.",
    },
  ],
  steps: {
    eyebrow: "Der Ablauf",
    heading: "Vier Schritte, nichts versteckt",
    items: [
      {
        title: "Bild hereingeben",
        body: "Datei in den Ablagebereich ziehen, aus der Zwischenablage einfügen oder aus der Galerie des Telefons wählen. JPG, PNG und WebP bis 12 MB.",
      },
      {
        title: "Freistellung abwarten",
        body: "Das Modell trennt Motiv und Hintergrund. Ein normales Foto ist in Sekunden fertig, und der Fortschrittsbalken zeigt den Schritt, der tatsächlich läuft, keine erfundene Zahl.",
      },
      {
        title: "Neuen Hintergrund wählen",
        body: "Transparent lassen, eine Farbe aus der Palette nehmen, eigenes HEX oder rgb() eintippen oder einen Verlauf verwenden. Die Vorschau ändert sich sofort.",
      },
      {
        title: "Herunterladen",
        body: "PNG für einen transparenten Hintergrund, JPG für eine leichte Datei, WebP für die kleinste Größe.",
      },
    ],
  },
  features: {
    eyebrow: "Was drinsteckt",
    items: [
      {
        title: "HEX und rgb() gleichermaßen",
        body: "Das Farbfeld nimmt #FF0000, #F00, rgb(255, 0, 0) und auch rgba(), wenn der Hintergrund halbtransparent sein soll. Ein Tippfehler wird markiert, nicht stillschweigend übergangen.",
      },
      {
        title: "Ein Vergleich zum Ziehen",
        body: "Ein Trenner, um die Freistellung zu beurteilen. Er funktioniert mit Maus, Finger und den Pfeiltasten.",
      },
      {
        title: "Drei Exportformate",
        body: "PNG behält den Alphakanal. JPG und WebP sind für die Fälle da, in denen Sie nur eine kleine Datei zum Hochladen brauchen.",
      },
    ],
  },
  limits: {
    eyebrow: "Die Grenzen",
    heading: "Was Sie vorher wissen sollten",
    items: [
      {
        title: "54 MB beim ersten Mal",
        body: "Das Segmentierungsmodell muss zuerst in den Browser. Nur einmal, danach bleibt es gespeichert. Bei begrenztem Datenvolumen besser über WLAN.",
      },
      {
        title: "Ältere Geräte sind langsamer",
        body: "Die Rechenlast liegt auf Ihrem Telefon oder Notebook, nicht auf einem Server. Ein Einsteigertelefon kann gut zehn Sekunden pro Bild brauchen.",
      },
      {
        title: "Feines Haar bleibt schwierig",
        body: "Der präzise Modus ist an weichen Kanten deutlich sauberer, aber kein Modell ist perfekt, wenn der Hintergrund farblich nah am Motiv liegt.",
      },
    ],
  },
  closer: {
    heading: "Ein Bild öffnen und selbst nachsehen",
    body: "Keine Anmeldung im Weg. Studio öffnen, Datei ablegen, fertig.",
  },
  footer: {
    tagline: "Gebaut, um genutzt zu werden, ohne Ihre Fotos jemandem zu überlassen.",
  },
  studio: {
    onDevice: "Auf diesem Gerät verarbeitet",
    back: "Zurück zur Startseite",
    dropTitle: "Bild hier ablegen",
    dropBody:
      "Die Datei in diesen Bereich ziehen, aus der Zwischenablage einfügen oder den Knopf unten verwenden.",
    pick: "Bild auswählen",
    formats: "JPG · PNG · WEBP — höchstens 12 MB",
    qualityLabel: "Qualität",
    fastTitle: "Schnell",
    fastNote: "Modell mit {mb} MB · reicht für die meisten Fotos",
    preciseTitle: "Präzise",
    preciseNote: "Modell mit {mb} MB · sauberer bei Haar und weichen Kanten",
    downloadPng: "PNG herunterladen",
    transparentSuffix: "transparent",
    exportNote:
      "Wird immer in der Originalauflösung exportiert, nicht in der Vorschaugröße.",
    another: "Anderes Bild",
    firstDownloadNote:
      "Dieser Download von {mb} MB fällt nur einmal an. Sobald er im Browser liegt, werden weitere Bilder ganz ohne Netz verarbeitet.",
    errUnsupported: "Dieses Format wird noch nicht unterstützt. Nehmen Sie JPG, PNG oder WebP.",
    errTooBig: "Eine Datei mit {mb} MB liegt über der Grenze von 12 MB. Bitte vorher verkleinern.",
    errFailed: "Das Bild konnte nicht verarbeitet werden. Versuchen Sie es mit einer anderen Datei.",
    errExport: "Die Datei für den Download konnte nicht vorbereitet werden.",
    errDecode: "Das Ergebnis lässt sich nicht als Bild lesen.",
  },
  progress: {
    downloading: "Modell wird auf Ihr Gerät geladen",
    engine: "Engine wird im Browser gestartet",
    separating: "Motiv wird vom Hintergrund getrennt",
    done: "Fertig",
    working: "läuft…",
    preparing: "Wird vorbereitet…",
  },
  compare: {
    before: "Original",
    after: "Roto",
    sliderLabel: "Ziehen, um Vorher und Nachher zu vergleichen",
    altBefore: "Das Originalbild vor der Verarbeitung",
    altAfter: "Das Ergebnis nach dem Entfernen des Hintergrunds",
  },
  bg: {
    bgLabel: "Hintergrund",
    gradientLabel: "Verlauf",
    customLabel: "Eigene Farbe",
    transparent: "Transparent",
    wheel: "Aus dem Farbkreis wählen",
    hint: "Nimmt HEX und rgb(), auch rgba() für einen halbtransparenten Hintergrund.",
    invalid: "Nicht lesbar. Versuchen Sie #FF0000, #F00 oder rgb(255, 0, 0).",
    presets: [
      "Weiß",
      "Schwarz",
      "Studiograu",
      "Dunkelkammerlicht",
      "Passbildblau",
      "Passbildrot",
      "Greenscreen",
      "Creme",
    ],
    gradients: ["Dämmerung", "Dunst", "Mitternacht", "Meer"],
  },
};
