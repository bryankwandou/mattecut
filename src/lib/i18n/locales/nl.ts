import type { Dict } from "../dict";

export const nl: Dict = {
  meta: {
    title: "Roto — achtergronden weghalen zonder te uploaden",
    description:
      "Een achtergrondverwijderaar die in de browser draait. Afbeeldingen gaan naar geen enkele server, er is geen wachtrij en het resultaat wordt op de oorspronkelijke resolutie gedownload.",
    studioTitle: "Studio",
    studioDescription:
      "Zet een afbeelding neer, knip het onderwerp uit en vervang de achtergrond door een kleur of verloop naar keuze.",
    notFoundTitle: "Die pagina bestaat niet",
    notFoundBody:
      "Misschien zit er een typfout in de link, of de pagina heeft er nooit gestaan.",
    backHome: "Terug naar de startpagina",
  },
  common: {
    openStudio: "Studio openen",
    sourceCode: "Broncode",
    readCode: "Lees de code",
    close: "Sluiten",
    skipToContent: "Naar de inhoud",
  },
  theme: {
    label: "Weergave",
    light: "Licht",
    dark: "Donker",
    system: "Volg het systeem",
  },
  lang: { label: "Taal" },
  hero: {
    badge: "Draait op je eigen apparaat",
    titleA: "Til het onderwerp eruit.",
    titleB: "Gooi de rest weg.",
    lead: "Roto knipt achtergronden weg binnen de browser zelf. Het bestand verlaat je apparaat nooit, dus geen wachtrij, geen daglimiet en niets wat je op goed vertrouwen hoeft aan te nemen over wat er met je foto gebeurt.",
    cta: "Knip je eerste afbeelding",
    note: "Geen account · geen upload · geen watermerk",
    caption: "Alpha matte · 8 bits",
  },
  pillars: [
    {
      title: "Verwerkt op je apparaat",
      body: "Het segmentatiemodel draait in je eigen browser via WebAssembly. De afbeelding raakt onze servers niet, want er staat aan de andere kant geen server om hem aan te nemen.",
    },
    {
      title: "Oorspronkelijke resolutie",
      body: "Wat je downloadt is het resultaat op de afmetingen van het bronbestand. De voorvertoning mag kleiner zijn voor de snelheid, maar de export wordt altijd opnieuw opgebouwd uit de volledige data.",
    },
    {
      title: "Werkt zonder verbinding",
      body: "Zodra de eerste download van het model in de browser staat, worden volgende afbeeldingen ook zonder netwerk verwerkt.",
    },
  ],
  steps: {
    eyebrow: "Hoe het werkt",
    heading: "Vier stappen, niets verborgen",
    items: [
      {
        title: "Breng een afbeelding binnen",
        body: "Sleep het bestand naar het uploadvak, plak vanaf het klembord of kies er een uit de galerij van je telefoon. JPG, PNG en WebP tot 12 MB.",
      },
      {
        title: "Wacht op de uitsnede",
        body: "Het model scheidt onderwerp en achtergrond. Een gewone foto is in seconden klaar, en de voortgangsbalk laat de stap zien die echt bezig is, geen verzonnen getal.",
      },
      {
        title: "Kies de nieuwe achtergrond",
        body: "Laat hem transparant, pak een kleur uit het palet, typ je eigen HEX of rgb(), of gebruik een verloop. De voorvertoning verandert meteen.",
      },
      {
        title: "Download",
        body: "PNG voor een transparante achtergrond, JPG als je een licht bestand nodig hebt, WebP als je op de kleinste omvang mikt.",
      },
    ],
  },
  features: {
    eyebrow: "Wat erin zit",
    items: [
      {
        title: "HEX en rgb() allebei",
        body: "Het kleurveld neemt #FF0000, #F00, rgb(255, 0, 0) en ook rgba() als je een halfdoorzichtige achtergrond wilt. Een typfout wordt gemeld, niet stilletjes genegeerd.",
      },
      {
        title: "Een vergelijking om te slepen",
        body: "Eén scheidingslijn om de uitsnede te beoordelen. Werkt met muis, vinger en de pijltjestoetsen.",
      },
      {
        title: "Drie exportformaten",
        body: "PNG behoudt het alfakanaal. JPG en WebP zijn er voor als je alleen een klein bestand nodig hebt om ergens anders te uploaden.",
      },
    ],
  },
  limits: {
    eyebrow: "De grenzen",
    heading: "Wat je beter kunt weten voor je begint",
    items: [
      {
        title: "Een eerste download van 54 MB",
        body: "Het segmentatiemodel moet eerst in de browser komen. Eén keer, daarna blijft het bewaard. Met een beperkte bundel: doe het via wifi.",
      },
      {
        title: "Oudere apparaten voelen trager",
        body: "Het rekenwerk zit op je telefoon of laptop, niet op een server. Een instaptelefoon kan er ruim tien seconden per afbeelding over doen.",
      },
      {
        title: "Fijn haar blijft lastig",
        body: "De precieze stand is veel schoner op zachte randen, maar geen model is perfect als de achtergrond qua kleur dicht bij het onderwerp ligt.",
      },
    ],
  },
  closer: {
    heading: "Open één afbeelding en zie het zelf",
    body: "Geen registratie ervoor. Open de studio, laat een bestand vallen, klaar.",
  },
  footer: {
    tagline: "Gebouwd om te gebruiken zonder je foto's aan iemand af te geven.",
  },
  studio: {
    onDevice: "Verwerkt op dit apparaat",
    back: "Terug naar de startpagina",
    dropTitle: "Zet hier een afbeelding neer",
    dropBody:
      "Sleep het bestand naar dit vak, plak vanaf het klembord of gebruik de knop hieronder.",
    pick: "Afbeelding kiezen",
    formats: "JPG · PNG · WEBP — maximaal 12 MB",
    qualityLabel: "Kwaliteit",
    lightTitle: "Licht",
    lightNote:
      "Model van {mb} MB · het lichtst, voor beperkte apparaten en verbindingen",
    balancedTitle: "Gebalanceerd",
    balancedNote:
      "Model van {mb} MB · de middenkeuze, genoeg voor de meeste foto's",
    maximumTitle: "Maximaal",
    maximumNote:
      "Model van {mb} MB · schoner bij haar en zachte randen",
    downloadPng: "PNG downloaden",
    transparentSuffix: "transparant",
    exportNote:
      "Altijd geëxporteerd op de oorspronkelijke resolutie, niet op het formaat van de voorvertoning.",
    another: "Andere afbeelding",
    restored: "Je laatste resultaat is hersteld nadat het tabblad sloot.",
    modelNote: "Wissel altijd van model; de uitsnede wordt op dezelfde afbeelding opnieuw gemaakt.",
    firstDownloadNote:
      "Deze download van {mb} MB gebeurt één keer. Zodra hij in de browser staat, worden volgende afbeeldingen zonder netwerk verwerkt.",
    errUnsupported: "Dat formaat wordt nog niet ondersteund. Gebruik JPG, PNG of WebP.",
    errTooBig: "Een bestand van {mb} MB gaat over de grens van 12 MB. Verklein het eerst.",
    errFailed: "De afbeelding kon niet verwerkt worden. Probeer een ander bestand.",
    errExport: "Het downloadbestand kon niet worden klaargezet.",
    errDecode: "Het resultaat is niet als afbeelding te lezen.",
  },
  progress: {
    downloading: "Model wordt naar je apparaat gehaald",
    engine: "Motor wordt in de browser gestart",
    separating: "Onderwerp wordt van de achtergrond gescheiden",
    done: "Klaar",
    working: "bezig…",
    preparing: "Voorbereiden…",
  },
  compare: {
    before: "Origineel",
    after: "Roto",
    sliderLabel: "Sleep om voor en na te vergelijken",
    altBefore: "De oorspronkelijke afbeelding voor de verwerking",
    altAfter: "Het resultaat nadat de achtergrond weg is",
  },
  bg: {
    bgLabel: "Achtergrond",
    gradientLabel: "Verloop",
    customLabel: "Eigen kleur",
    transparent: "Transparant",
    wheel: "Kies uit de kleurenschijf",
    spectrum: "Kleurenspectrum",
    hue: "Kleurtoon",
    alpha: "Dekking",
    count: "16.777.216 kleuren",
    hint: "Neemt HEX en rgb(), inclusief rgba() voor een halfdoorzichtige achtergrond.",
    invalid: "Niet te lezen. Probeer #FF0000, #F00 of rgb(255, 0, 0).",
    presets: [
      "Wit",
      "Zwart",
      "Studiogrijs",
      "Doka-licht",
      "Pasfotoblauw",
      "Pasfotorood",
      "Greenscreen",
      "Crème",
    ],
    gradients: ["Schemering", "Nevel", "Middernacht", "Zee"],
    wallpaperLabel: "Achtergrond",
    wallpapers: [
      "Studiogrijs",
      "Paspoortblauw",
      "Grafiet",
      "Warm zand",
      "Lucht",
      "Salie",
    ],
    upload: "Je eigen afbeelding",
    uploadHint: "Het bestand blijft op dit apparaat",
    fitCover: "Vullen",
    fitContain: "Passend",
  },
};
