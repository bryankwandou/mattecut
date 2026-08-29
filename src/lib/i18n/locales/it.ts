import type { Dict } from "../dict";

export const it: Dict = {
  meta: {
    title: "Roto — togli lo sfondo alle immagini senza caricarle",
    description:
      "Uno scontornatore che funziona dentro il browser. Le immagini non vengono inviate a nessun server, non c'è coda e il risultato si scarica alla risoluzione originale.",
    studioTitle: "Studio",
    studioDescription:
      "Trascina un'immagine, ritaglia il soggetto e sostituisci lo sfondo con qualsiasi colore o sfumatura.",
    notFoundTitle: "Questa pagina non esiste",
    notFoundBody:
      "Il link potrebbe contenere un errore di battitura, oppure la pagina non c'è mai stata.",
    backHome: "Torna alla home",
  },
  common: {
    openStudio: "Apri lo studio",
    sourceCode: "Codice sorgente",
    readCode: "Leggi il codice",
    close: "Chiudi",
    skipToContent: "Vai al contenuto",
  },
  theme: {
    label: "Aspetto",
    light: "Chiaro",
    dark: "Scuro",
    system: "Come il sistema",
  },
  lang: { label: "Lingua" },
  hero: {
    badge: "Funziona sul tuo dispositivo",
    titleA: "Solleva il soggetto.",
    titleB: "Butta il resto.",
    lead: "Roto ritaglia lo sfondo delle immagini dentro il browser stesso. Il file non lascia mai il tuo dispositivo, quindi niente coda, niente quota giornaliera e niente da prendere per buono su cosa succede alla tua foto.",
    cta: "Ritaglia la prima immagine",
    note: "Senza account · senza caricamento · senza filigrana",
    caption: "Alpha matte · 8 bit",
  },
  pillars: [
    {
      title: "Elaborato sul dispositivo",
      body: "Il modello di segmentazione gira nel tuo browser tramite WebAssembly. L'immagine non tocca i nostri server, perché dall'altra parte non c'è alcun server a riceverla.",
    },
    {
      title: "Risoluzione originale",
      body: "Quello che scarichi è il risultato alle dimensioni del file di partenza. L'anteprima può essere ridotta per velocità, ma l'esportazione viene sempre ricostruita dai dati completi.",
    },
    {
      title: "Funziona senza rete",
      body: "Una volta che il primo download del modello resta in memoria nel browser, le immagini successive si elaborano anche a connessione assente.",
    },
  ],
  steps: {
    eyebrow: "Come funziona",
    heading: "Quattro passaggi, niente di nascosto",
    items: [
      {
        title: "Porta un'immagine",
        body: "Trascina il file nell'area di caricamento, incolla dagli appunti o scegli dalla galleria del telefono. JPG, PNG e WebP fino a 12 MB.",
      },
      {
        title: "Aspetta il ritaglio",
        body: "Il modello separa il soggetto dallo sfondo. Una foto normale finisce in pochi secondi, e la barra di avanzamento mostra la fase davvero in corso, non un numero inventato.",
      },
      {
        title: "Scegli il nuovo sfondo",
        body: "Lascialo trasparente, prendi un colore dalla palette, scrivi il tuo HEX o rgb(), oppure usa una sfumatura. L'anteprima cambia all'istante.",
      },
      {
        title: "Scarica",
        body: "PNG per lo sfondo trasparente, JPG quando serve un file leggero, WebP quando punti alla dimensione più piccola.",
      },
    ],
  },
  features: {
    eyebrow: "Cosa c'è dentro",
    items: [
      {
        title: "HEX e rgb() allo stesso modo",
        body: "Il campo colore accetta #FF0000, #F00, rgb(255, 0, 0) e anche rgba() se vuoi uno sfondo semitrasparente. Un errore di battitura viene segnalato, non ignorato in silenzio.",
      },
      {
        title: "Un confronto che si trascina",
        body: "Un solo divisore per giudicare il ritaglio. Funziona con il mouse, con il dito e con le frecce della tastiera.",
      },
      {
        title: "Tre formati di esportazione",
        body: "Il PNG mantiene il canale alfa. JPG e WebP ci sono per quando ti serve soltanto un file piccolo da caricare altrove.",
      },
    ],
  },
  limits: {
    eyebrow: "I limiti",
    heading: "Cose da sapere prima di provarlo",
    items: [
      {
        title: "Un primo download da 54 MB",
        body: "Il modello di segmentazione deve prima arrivare nel browser. Una volta sola, poi resta salvato. Con traffico limitato, fallo in Wi-Fi.",
      },
      {
        title: "I dispositivi vecchi vanno più piano",
        body: "Il calcolo sta sul tuo telefono o portatile, non su un server. Un telefono di fascia bassa può metterci una decina di secondi per immagine.",
      },
      {
        title: "I capelli sottili restano difficili",
        body: "La modalità precisa è molto più pulita sui bordi morbidi, ma nessun modello è perfetto quando lo sfondo ha un colore vicino a quello del soggetto.",
      },
    ],
  },
  closer: {
    heading: "Apri un'immagine e giudica da te",
    body: "Nessuna registrazione di mezzo. Apri lo studio, trascina un file, fatto.",
  },
  footer: {
    tagline: "Fatto per essere usato senza consegnare le tue foto a nessuno.",
  },
  studio: {
    onDevice: "Elaborato su questo dispositivo",
    back: "Torna alla home",
    dropTitle: "Trascina qui un'immagine",
    dropBody:
      "Porta il file in quest'area, incolla dagli appunti oppure usa il pulsante qui sotto.",
    pick: "Scegli un'immagine",
    formats: "JPG · PNG · WEBP — massimo 12 MB",
    qualityLabel: "Qualità",
    lightTitle: "Leggero",
    lightNote:
      "Modello da {mb} MB · il più leggero, per dispositivi e reti limitati",
    balancedTitle: "Bilanciato",
    balancedNote:
      "Modello da {mb} MB · la scelta intermedia, basta per quasi tutte le foto",
    maximumTitle: "Massimo",
    maximumNote:
      "Modello da {mb} MB · più pulito su capelli e bordi morbidi",
    downloadPng: "Scarica il PNG",
    transparentSuffix: "trasparente",
    exportNote:
      "Esportato sempre alla risoluzione originale, non alla dimensione dell'anteprima.",
    another: "Un'altra immagine",
    restored: "L’ultimo risultato è stato ripristinato dopo la chiusura della scheda.",
    modelNote: "Cambia modello quando vuoi; il ritaglio viene rifatto sulla stessa immagine.",
    attireLabel: "Abbigliamento",
    attireNone: "Senza giacca",
    attire: [
      "Abito antracite",
      "Abito blu navy",
      "Blazer senza cravatta",
    ],
    attireAuto:
      "Posizionato automaticamente da spalle e collo nel ritaglio.",
    attireManual:
      "Le spalle non sono leggibili in questa foto. Imposta tu dimensione e altezza.",
    attireSize: "Dimensione",
    attireDrop: "Altezza",
    firstDownloadNote:
      "Questo download da {mb} MB avviene una volta sola. Una volta salvato nel browser, le immagini successive vengono elaborate senza rete.",
    errUnsupported: "Quel formato non è ancora supportato. Usa JPG, PNG o WebP.",
    errTooBig: "Un file da {mb} MB supera il limite di 12 MB. Riducilo prima.",
    errFailed: "Non è stato possibile elaborare l'immagine. Riprova con un altro file.",
    errExport: "Non è stato possibile preparare il file da scaricare.",
    errDecode: "Il risultato non è leggibile come immagine.",
  },
  progress: {
    downloading: "Scarico del modello sul dispositivo",
    engine: "Avvio del motore nel browser",
    separating: "Separazione del soggetto dallo sfondo",
    done: "Fatto",
    working: "in corso…",
    preparing: "Preparazione…",
  },
  compare: {
    before: "Originale",
    after: "Roto",
    sliderLabel: "Trascina per confrontare prima e dopo",
    altBefore: "L'immagine originale prima dell'elaborazione",
    altAfter: "Il risultato dopo la rimozione dello sfondo",
  },
  bg: {
    bgLabel: "Sfondo",
    gradientLabel: "Sfumatura",
    customLabel: "Colore libero",
    transparent: "Trasparente",
    wheel: "Scegli dalla ruota dei colori",
    spectrum: "Spettro di colori",
    hue: "Tonalità",
    alpha: "Opacità",
    count: "16.777.216 colori",
    hint: "Accetta HEX e rgb(), incluso rgba() per uno sfondo semitrasparente.",
    invalid: "Non interpretabile. Prova #FF0000, #F00 o rgb(255, 0, 0).",
    presets: [
      "Bianco",
      "Nero",
      "Grigio studio",
      "Luce di camera oscura",
      "Blu tessera",
      "Rosso tessera",
      "Verde croma",
      "Crema",
    ],
    gradients: ["Tramonto", "Foschia", "Mezzanotte", "Mare"],
    wallpaperLabel: "Sfondo",
    wallpapers: [
      "Grigio studio",
      "Blu passaporto",
      "Grafite",
      "Sabbia calda",
      "Cielo",
      "Salvia",
    ],
    upload: "Una tua immagine",
    uploadHint: "Il file resta su questo dispositivo",
    fitCover: "Riempi",
    fitContain: "Adatta",
  },
};
