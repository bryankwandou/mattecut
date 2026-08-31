import type { Dict } from "../dict";

export const fr: Dict = {
  meta: {
    title: "Roto — détourez vos images sans les envoyer",
    description:
      "Un détoureur qui fonctionne dans le navigateur. Les images ne partent sur aucun serveur, il n'y a pas de file d'attente, et le résultat se télécharge à la résolution d'origine.",
    studioTitle: "Studio",
    studioDescription:
      "Déposez une image, détourez le sujet, puis remplacez le fond par la couleur ou le dégradé de votre choix.",
    notFoundTitle: "Cette page n'existe pas",
    notFoundBody:
      "Le lien contient peut-être une faute de frappe, ou la page n'a jamais existé.",
    backHome: "Revenir à l'accueil",
  },
  common: {
    openStudio: "Ouvrir le studio",
    sourceCode: "Code source",
    readCode: "Lire le code",
    close: "Fermer",
    skipToContent: "Aller au contenu",
  },
  theme: {
    label: "Apparence",
    light: "Clair",
    dark: "Sombre",
    system: "Suivre le système",
  },
  lang: { label: "Langue" },
  hero: {
    badge: "Fonctionne sur votre appareil",
    titleA: "Gardez le sujet.",
    titleB: "Jetez le reste.",
    lead: "Roto détoure le fond des images à l'intérieur même du navigateur. Le fichier ne quitte jamais votre appareil : pas de file d'attente, pas de quota quotidien, et rien à croire sur parole quant à ce qu'il advient de votre photo.",
    cta: "Détourer une première image",
    note: "Sans compte · sans envoi · sans filigrane",
    caption: "Alpha matte · 8 bits",
  },
  pillars: [
    {
      title: "Traité sur votre appareil",
      body: "Le modèle de segmentation tourne dans votre propre navigateur via WebAssembly. L'image ne touche pas nos serveurs, parce qu'aucun serveur n'est là pour la recevoir.",
    },
    {
      title: "Résolution d'origine",
      body: "Ce que vous téléchargez, c'est le résultat aux dimensions du fichier source. L'aperçu peut être réduit pour la vitesse, mais l'export est toujours reconstruit à partir des données complètes.",
    },
    {
      title: "Marche sans connexion",
      body: "Une fois le premier téléchargement du modèle mis en cache dans le navigateur, les images suivantes se traitent même sans réseau.",
    },
  ],
  steps: {
    eyebrow: "Le déroulé",
    heading: "Quatre étapes, rien de caché",
    items: [
      {
        title: "Amenez une image",
        body: "Faites glisser le fichier sur la zone de dépôt, collez depuis le presse-papiers, ou choisissez dans la galerie du téléphone. JPG, PNG et WebP jusqu'à 12 Mo.",
      },
      {
        title: "Attendez le détourage",
        body: "Le modèle sépare le sujet du fond. Une photo ordinaire est terminée en quelques secondes, et la barre de progression indique l'étape réellement en cours, pas un chiffre inventé.",
      },
      {
        title: "Choisissez le nouveau fond",
        body: "Laissez-le transparent, prenez une couleur du nuancier, saisissez votre propre HEX ou rgb(), ou utilisez un dégradé. L'aperçu change immédiatement.",
      },
      {
        title: "Téléchargez",
        body: "PNG pour un fond transparent, JPG quand il faut un fichier léger, WebP quand vous visez la plus petite taille.",
      },
    ],
  },
  features: {
    eyebrow: "Ce qu'il y a dedans",
    items: [
      {
        title: "HEX et rgb() indifféremment",
        body: "Le champ couleur accepte #FF0000, #F00, rgb(255, 0, 0), et rgba() si vous voulez un fond semi-transparent. Une faute de frappe est signalée, pas ignorée en silence.",
      },
      {
        title: "Un comparateur qui se fait glisser",
        body: "Un seul curseur pour juger du détourage. Il fonctionne à la souris, au doigt et aux flèches du clavier.",
      },
      {
        title: "Trois formats d'export",
        body: "Le PNG conserve la couche alpha. JPG et WebP sont là pour les fois où il vous faut simplement un petit fichier à déposer ailleurs.",
      },
    ],
  },
  limits: {
    eyebrow: "Les limites",
    heading: "Ce qu'il vaut mieux savoir avant d'essayer",
    items: [
      {
        title: "Un premier téléchargement de 54 Mo",
        body: "Le modèle de segmentation doit d'abord arriver dans le navigateur. Une seule fois, puis il reste en cache. Avec un forfait limité, faites-le en Wi-Fi.",
      },
      {
        title: "Les appareils anciens sont plus lents",
        body: "Le calcul repose sur votre téléphone ou votre ordinateur, pas sur un serveur. Un téléphone d'entrée de gamme peut demander une dizaine de secondes par image.",
      },
      {
        title: "Les cheveux fins restent difficiles",
        body: "Le mode précis est nettement plus propre sur les bords doux, mais aucun modèle n'est parfait quand le fond a une couleur proche de celle du sujet.",
      },
    ],
  },
  closer: {
    heading: "Ouvrez une image et jugez par vous-même",
    body: "Aucune inscription en travers du chemin. Ouvrez le studio, déposez un fichier, c'est fait.",
  },
  footer: {
    tagline: "Conçu pour être utilisé sans confier vos photos à qui que ce soit.",
  },
  studio: {
    onDevice: "Traité sur cet appareil",
    back: "Revenir à l'accueil",
    dropTitle: "Déposez une image ici",
    dropBody:
      "Faites glisser le fichier sur cette zone, collez depuis le presse-papiers, ou passez par le bouton ci-dessous.",
    pick: "Choisir une image",
    formats: "JPG · PNG · WEBP — 12 Mo maximum",
    qualityLabel: "Qualité",
    applyModel: "Utiliser ce modèle",
    liteTitle: "Ultraléger",
    liteNote:
      "Modèle de {mb} Mo · le plus petit téléchargement, plus grossier sur les cheveux",
    lightTitle: "Léger",
    lightNote:
      "Modèle de {mb} Mo · petit téléchargement, bords plus nets qu’ultraléger",
    balancedTitle: "Équilibré",
    balancedNote:
      "Modèle de {mb} Mo · le choix intermédiaire, suffisant pour presque toutes les photos",
    maximumTitle: "Maximum",
    maximumNote:
      "Modèle de {mb} Mo · plus net sur les cheveux et les bords doux",
    auditOpen: "Vérifier le catalogue des modèles",
    auditResult:
      "{models} modèles lus à la source. Le plus petit {small} octets, le plus grand {big} octets — rien en dehors de cette plage.",
    auditSize: "{mb} Mo",
    auditTiny: "{kb} Ko",
    auditMath:
      "Le chiffre de chaque niveau ci-dessus ajoute le moteur de {rt} Mo à son modèle, car c’est cela qui est réellement téléchargé.",
    auditNote:
      "Lu sur le serveur d’origine au moment où vous avez appuyé, ce n’est pas un chiffre inscrit dans cette application. Rechargez pour revérifier.",
    auditFailed:
      "Le catalogue n’a pas pu être lu — la connexion a échoué ou l’origine a refusé. Les tailles des niveaux ci-dessus ne sont pas vérifiées pour l’instant.",
    downloadPng: "Télécharger le PNG",
    transparentSuffix: "transparent",
    exportNote:
      "Toujours exporté à la résolution d'origine, pas à la taille de l'aperçu.",
    exportNoteCapped:
      "Exporté en {w} × {h} px, plus petit que l’original : cette machine n’a pas pu faire passer la pleine résolution dans le modèle.",
    lowPower:
      "Cette machine signale une mémoire ou un nombre de cœurs limité : le modèle le plus léger est donc choisi par défaut et les photos sont réduites à {px} px sur le grand côté avant traitement. Tous les niveaux restent sélectionnables.",
    another: "Une autre image",
    restored: "Votre dernier résultat a été restauré après la fermeture de l’onglet.",
    modelNote: "Changez de modèle à tout moment ; le détourage est refait sur la même image.",
    attireLabel: "Tenue",
    attireNone: "Sans veste",
    attire: [
      "Costume anthracite",
      "Costume bleu marine",
      "Blazer sans cravate",
    ],
    attireAuto:
      "Placée automatiquement d'après les épaules et le cou du détourage.",
    attireManual:
      "Les épaules n'ont pas pu être lues sur cette photo. Réglez la taille et la hauteur vous-même.",
    attireSize: "Taille",
    attireDrop: "Hauteur",
    firstDownloadNote:
      "Ce téléchargement de {mb} Mo n'a lieu qu'une fois. Une fois en cache dans le navigateur, les images suivantes sont traitées sans réseau du tout.",
    errUnsupported: "Ce format n'est pas encore pris en charge. Utilisez JPG, PNG ou WebP.",
    errTooBig: "Un fichier de {mb} Mo dépasse la limite de 12 Mo. Réduisez-le d'abord.",
    errFailed: "L'image n'a pas pu être traitée. Réessayez avec un autre fichier.",
    errExport: "Le fichier de téléchargement n'a pas pu être préparé.",
    errDecode: "Le résultat ne peut pas être lu comme une image.",
  },
  progress: {
    downloading: "Téléchargement du modèle sur votre appareil",
    engine: "Démarrage du moteur dans le navigateur",
    separating: "Séparation du sujet et du fond",
    done: "Terminé",
    working: "en cours…",
    preparing: "Préparation…",
  },
  compare: {
    before: "Original",
    after: "Roto",
    sliderLabel: "Faites glisser pour comparer avant et après",
    altBefore: "L'image d'origine avant traitement",
    altAfter: "Le résultat après suppression du fond",
  },
  bg: {
    bgLabel: "Fond",
    gradientLabel: "Dégradé",
    customLabel: "Couleur libre",
    transparent: "Transparent",
    wheel: "Choisir dans la roue chromatique",
    spectrum: "Spectre de couleurs",
    hue: "Teinte",
    alpha: "Opacité",
    count: "16 777 216 couleurs",
    hint: "Accepte HEX et rgb(), y compris rgba() pour un fond semi-transparent.",
    invalid: "Non interprétable. Essayez #FF0000, #F00 ou rgb(255, 0, 0).",
    presets: [
      "Blanc",
      "Noir",
      "Gris studio",
      "Lampe inactinique",
      "Bleu identité",
      "Rouge identité",
      "Vert incrustation",
      "Crème",
    ],
    gradients: ["Crépuscule", "Brume", "Minuit", "Mer"],
    wallpaperLabel: "Fond",
    wallpapers: [
      "Gris studio",
      "Bleu passeport",
      "Graphite",
      "Sable chaud",
      "Ciel",
      "Sauge",
    ],
    upload: "Votre propre image",
    uploadHint: "Le fichier reste sur cet appareil",
    catalogueOpen:
      "Parcourir tous les fonds",
    catalogueTitle:
      "Catalogue de fonds",
    catalogueCount:
      "{n} fonds, générés sur cet appareil — rien de téléchargé",
    catalogueByCount:
      "{n} photos sous CC BY — libres d’usage, mais l’auteur doit être crédité",
    creditRequired:
      "Crédit obligatoire partout où vous partagez ceci : {credit}",
    cataloguePhotoCount:
      "{n} photos, domaine public ou CC0, servies depuis ce site",
    catalogueTabGradients: "Couleurs",
    catalogueTabPhotos: "Photos",
    catalogueSearch:
      "Rechercher : blue, soft, deep teal, gradient, #1f6fff",
    catalogueEmpty:
      "Aucun résultat. Essayez un nom de couleur ou un code hex.",
    catalogueFailed:
      "La liste de photos n’a pas pu être chargée. Vérifiez la connexion et réessayez.",
    creditShown:
      "Créditez cette photo partout où vous partagez le résultat : {credit}",
    fitCover: "Remplir",
    fitContain: "Ajuster",
  },
};
