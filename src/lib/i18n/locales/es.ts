import type { Dict } from "../dict";

export const es: Dict = {
  meta: {
    title: "Roto — quita el fondo de tus imágenes sin subirlas",
    description:
      "Un quitafondos que funciona dentro del navegador. Las imágenes no se envían a ningún servidor, no hay cola de espera y el resultado se descarga en la resolución original.",
    studioTitle: "Estudio",
    studioDescription:
      "Suelta una imagen, recorta el sujeto y cambia el fondo por el color o degradado que quieras.",
    notFoundTitle: "Esa página no existe",
    notFoundBody:
      "Puede que el enlace tenga una errata, o que la página nunca haya estado ahí.",
    backHome: "Volver al inicio",
  },
  common: {
    openStudio: "Abrir el estudio",
    sourceCode: "Código fuente",
    readCode: "Leer el código",
    close: "Cerrar",
    skipToContent: "Saltar al contenido",
  },
  theme: {
    label: "Apariencia",
    light: "Claro",
    dark: "Oscuro",
    system: "Según el sistema",
  },
  lang: { label: "Idioma" },
  hero: {
    badge: "Funciona en tu dispositivo",
    titleA: "Levanta el sujeto.",
    titleB: "Descarta el resto.",
    lead: "Roto recorta el fondo de las imágenes dentro del propio navegador. El archivo nunca sale de tu dispositivo, así que no hay cola, no hay cuota diaria y no tienes que fiarte de nadie sobre lo que pasa con tu foto.",
    cta: "Recorta tu primera imagen",
    note: "Sin cuenta · sin subida · sin marca de agua",
    caption: "Alpha matte · 8 bits",
  },
  pillars: [
    {
      title: "Procesado en tu dispositivo",
      body: "El modelo de segmentación se ejecuta en tu propio navegador mediante WebAssembly. La imagen no toca nuestros servidores, porque no hay ningún servidor que la reciba.",
    },
    {
      title: "Resolución original",
      body: "Lo que descargas es el resultado con las dimensiones del archivo original. La vista previa puede reducirse por velocidad, pero la exportación se reconstruye siempre a partir de los datos completos.",
    },
    {
      title: "Funciona sin conexión",
      body: "Una vez que la primera descarga del modelo queda guardada en el navegador, las siguientes imágenes se procesan aunque se caiga la red.",
    },
  ],
  steps: {
    eyebrow: "Cómo funciona",
    heading: "Cuatro pasos, nada escondido",
    items: [
      {
        title: "Trae una imagen",
        body: "Arrastra el archivo al área de carga, pégalo desde el portapapeles o elígelo en la galería del móvil. JPG, PNG y WebP hasta 12 MB.",
      },
      {
        title: "Espera el recorte",
        body: "El modelo separa el sujeto del fondo. Una foto normal termina en segundos, y la barra de progreso indica la etapa que está corriendo de verdad, no un número inventado.",
      },
      {
        title: "Elige el fondo nuevo",
        body: "Déjalo transparente, escoge un color de la paleta, escribe tu propio HEX o rgb(), o usa un degradado. La vista previa cambia al instante.",
      },
      {
        title: "Descarga",
        body: "PNG para fondo transparente, JPG cuando necesitas un archivo ligero, WebP cuando buscas el tamaño más pequeño.",
      },
    ],
  },
  features: {
    eyebrow: "Lo que hay dentro",
    items: [
      {
        title: "HEX y rgb() por igual",
        body: "El campo de color acepta #FF0000, #F00, rgb(255, 0, 0) y también rgba() si quieres un fondo semitransparente. Una errata se señala, no se ignora en silencio.",
      },
      {
        title: "Un comparador que se arrastra",
        body: "Un solo divisor para juzgar el recorte. Funciona con ratón, con el dedo y con las flechas del teclado.",
      },
      {
        title: "Tres formatos de exportación",
        body: "PNG conserva el canal alfa. JPG y WebP están ahí para cuando lo único que necesitas es un archivo pequeño para subir a otro sitio.",
      },
    ],
  },
  limits: {
    eyebrow: "Los límites",
    heading: "Lo que conviene saber antes de probarlo",
    items: [
      {
        title: "Una primera descarga de 54 MB",
        body: "El modelo de segmentación tiene que llegar antes al navegador. Solo una vez, y luego queda guardado. Con datos limitados, hazlo por Wi-Fi.",
      },
      {
        title: "Los equipos antiguos van más lentos",
        body: "El cálculo recae en tu móvil o tu portátil, no en un servidor. Un teléfono de gama baja puede tardar más de diez segundos por imagen.",
      },
      {
        title: "El pelo fino sigue siendo difícil",
        body: "El modo preciso queda mucho más limpio en los bordes suaves, pero ningún modelo es perfecto cuando el fondo tiene un color parecido al del sujeto.",
      },
    ],
  },
  closer: {
    heading: "Abre una imagen y compruébalo",
    body: "Sin registro por delante. Abre el estudio, suelta un archivo y listo.",
  },
  footer: {
    tagline: "Hecho para usarse sin entregarle tus fotos a nadie.",
  },
  studio: {
    onDevice: "Procesado en este dispositivo",
    back: "Volver al inicio",
    dropTitle: "Suelta una imagen aquí",
    dropBody:
      "Arrastra el archivo hasta esta zona, pégalo desde el portapapeles o usa el botón de abajo.",
    pick: "Elegir imagen",
    formats: "JPG · PNG · WEBP — 12 MB como máximo",
    qualityLabel: "Calidad",
    lightTitle: "Ligero",
    lightNote:
      "Modelo de {mb} MB · el más ligero, para equipos y conexiones limitados",
    balancedTitle: "Equilibrado",
    balancedNote:
      "Modelo de {mb} MB · la opción intermedia, suficiente para casi todas las fotos",
    maximumTitle: "Máximo",
    maximumNote:
      "Modelo de {mb} MB · más limpio en el pelo y los bordes suaves",
    auditOpen: "Revisar el catálogo de modelos",
    auditResult:
      "Se leyeron {models} modelos en el origen. El menor {small} bytes, el mayor {big} bytes: nada fuera de ese rango.",
    auditSize: "{mb} MB",
    auditTiny: "{kb} KB",
    auditMath:
      "La cifra de cada nivel de arriba suma el motor de CPU de {rt} MB a su modelo, porque eso es lo que realmente se descarga.",
    auditNote:
      "Leído del servidor de origen en el momento en que pulsaste el botón, no es una cifra escrita en esta aplicación. Recarga para volver a comprobarlo.",
    auditFailed:
      "No se pudo leer el catálogo: falló la red o el origen lo rechazó. Los tamaños de los niveles de arriba no están verificados ahora mismo.",
    downloadPng: "Descargar PNG",
    transparentSuffix: "transparente",
    exportNote:
      "Siempre se exporta a la resolución original, no al tamaño de la vista previa.",
    another: "Otra imagen",
    restored: "Se restauró tu último resultado tras cerrarse la pestaña.",
    modelNote: "Cambia de modelo cuando quieras; el recorte se rehace sobre la misma imagen.",
    attireLabel: "Vestimenta",
    attireNone: "Sin chaqueta",
    attire: [
      "Traje carbón",
      "Traje azul marino",
      "Blazer sin corbata",
    ],
    attireAuto:
      "Colocada automáticamente a partir de los hombros y el cuello del recorte.",
    attireManual:
      "No se pudieron leer los hombros en esta foto. Ajusta el tamaño y la altura a mano.",
    attireSize: "Tamaño",
    attireDrop: "Altura",
    firstDownloadNote:
      "Esta descarga de {mb} MB ocurre una sola vez. Cuando quede guardada en el navegador, las siguientes imágenes se procesan sin red alguna.",
    errUnsupported: "Ese formato todavía no está admitido. Usa JPG, PNG o WebP.",
    errTooBig: "Un archivo de {mb} MB supera el límite de 12 MB. Redúcelo antes.",
    errFailed: "No se pudo procesar la imagen. Inténtalo con otro archivo.",
    errExport: "No se pudo preparar el archivo de descarga.",
    errDecode: "El resultado no se puede leer como imagen.",
  },
  progress: {
    downloading: "Descargando el modelo a tu dispositivo",
    engine: "Arrancando el motor en el navegador",
    separating: "Separando el sujeto del fondo",
    done: "Listo",
    working: "en marcha…",
    preparing: "Preparando…",
  },
  compare: {
    before: "Original",
    after: "Roto",
    sliderLabel: "Arrastra para comparar el antes y el después",
    altBefore: "La imagen original antes de procesarla",
    altAfter: "El resultado tras quitar el fondo",
  },
  bg: {
    bgLabel: "Fondo",
    gradientLabel: "Degradado",
    customLabel: "Color propio",
    transparent: "Transparente",
    wheel: "Elegir en la rueda de color",
    spectrum: "Espectro de color",
    hue: "Tono",
    alpha: "Opacidad",
    count: "16.777.216 colores",
    hint: "Acepta HEX y rgb(), incluido rgba() si quieres un fondo semitransparente.",
    invalid: "No se pudo interpretar. Prueba #FF0000, #F00 o rgb(255, 0, 0).",
    presets: [
      "Blanco",
      "Negro",
      "Gris de estudio",
      "Luz de laboratorio",
      "Azul de carnet",
      "Rojo de carnet",
      "Verde croma",
      "Crema",
    ],
    gradients: ["Ocaso", "Bruma", "Medianoche", "Mar"],
    wallpaperLabel: "Fondo",
    wallpapers: [
      "Gris de estudio",
      "Azul de pasaporte",
      "Grafito",
      "Arena cálida",
      "Cielo",
      "Salvia",
    ],
    upload: "Tu propia imagen",
    uploadHint: "El archivo se queda en este equipo",
    fitCover: "Rellenar",
    fitContain: "Ajustar",
  },
};
