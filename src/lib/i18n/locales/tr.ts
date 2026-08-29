import type { Dict } from "../dict";

export const tr: Dict = {
  meta: {
    title: "Roto — görselleri yüklemeden arka planını kaldırın",
    description:
      "Tarayıcının içinde çalışan bir arka plan kaldırıcı. Görseller hiçbir sunucuya gönderilmez, sıra beklemek yok ve sonuç özgün çözünürlükte indirilir.",
    studioTitle: "Stüdyo",
    studioDescription:
      "Bir görsel bırakın, özneyi kesin, sonra arka planı istediğiniz renk veya geçişle değiştirin.",
    notFoundTitle: "Böyle bir sayfa yok",
    notFoundBody:
      "Bağlantıda yazım hatası olabilir ya da sayfa hiç var olmamış olabilir.",
    backHome: "Ana sayfaya dön",
  },
  common: {
    openStudio: "Stüdyoyu aç",
    sourceCode: "Kaynak kod",
    readCode: "Kodu oku",
    close: "Kapat",
    skipToContent: "İçeriğe geç",
  },
  theme: {
    label: "Görünüm",
    light: "Açık",
    dark: "Koyu",
    system: "Sistemi izle",
  },
  lang: { label: "Dil" },
  hero: {
    badge: "Kendi cihazınızda çalışır",
    titleA: "Özneyi ayırın.",
    titleB: "Gerisini atın.",
    lead: "Roto, görsellerin arka planını doğrudan tarayıcının içinde keser. Dosya cihazınızdan hiç çıkmaz; yani sıra yok, günlük kota yok ve fotoğrafınıza ne olduğu konusunda kimseye güvenmeniz gerekmiyor.",
    cta: "İlk görseli kesin",
    note: "Hesap yok · yükleme yok · filigran yok",
    caption: "Alfa matte · 8 bit",
  },
  pillars: [
    {
      title: "Cihazınızda işlenir",
      body: "Bölütleme modeli WebAssembly üzerinden kendi tarayıcınızda çalışır. Görsel sunucularımıza değmez, çünkü karşı tarafta onu alacak bir sunucu yok.",
    },
    {
      title: "Özgün çözünürlük",
      body: "İndirdiğiniz sonuç, kaynak dosyanın boyutlarındadır. Önizleme hız için küçültülebilir ama dışa aktarım her zaman tam veriden yeniden kurulur.",
    },
    {
      title: "Bağlantısız da çalışır",
      body: "İlk model indirmesi tarayıcıda saklandıktan sonra, sonraki görseller ağ olmasa da işlenmeye devam eder.",
    },
  ],
  steps: {
    eyebrow: "Nasıl işliyor",
    heading: "Dört adım, saklanan bir şey yok",
    items: [
      {
        title: "Bir görsel getirin",
        body: "Dosyayı bırakma alanına sürükleyin, panodan yapıştırın veya telefonun galerisinden seçin. 12 MB'a kadar JPG, PNG ve WebP.",
      },
      {
        title: "Kesimi bekleyin",
        body: "Model özneyi arka plandan ayırır. Sıradan bir fotoğraf saniyeler içinde biter ve ilerleme çubuğu uydurma bir sayıyı değil, gerçekten çalışan aşamayı gösterir.",
      },
      {
        title: "Yeni arka planı seçin",
        body: "Saydam bırakın, paletten bir renk seçin, kendi HEX veya rgb() değerinizi yazın ya da bir geçiş kullanın. Önizleme anında değişir.",
      },
      {
        title: "İndirin",
        body: "Saydam arka plan için PNG, hafif dosya gerektiğinde JPG, en küçük boyutun peşindeyseniz WebP.",
      },
    ],
  },
  features: {
    eyebrow: "İçinde ne var",
    items: [
      {
        title: "HEX de rgb() de olur",
        body: "Renk alanı #FF0000, #F00, rgb(255, 0, 0) ve yarı saydam arka plan isterseniz rgba() kabul eder. Yazım hatası sessizce yok sayılmaz, işaretlenir.",
      },
      {
        title: "Sürüklenebilen karşılaştırma",
        body: "Kesimi değerlendirmek için tek bir ayırıcı. Fare, parmak ve klavyedeki ok tuşlarıyla çalışır.",
      },
      {
        title: "Üç dışa aktarım biçimi",
        body: "PNG alfa kanalını korur. JPG ve WebP, başka bir yere yüklemek için sadece küçük bir dosya gerektiğinde orada.",
      },
    ],
  },
  limits: {
    eyebrow: "Sınırlar",
    heading: "Denemeden önce bilmekte fayda olanlar",
    items: [
      {
        title: "İlk seferde 54 MB indirme",
        body: "Bölütleme modelinin önce tarayıcıya inmesi gerekir. Yalnızca bir kez, sonra saklı kalır. Kotanız kısıtlıysa Wi-Fi ile yapın.",
      },
      {
        title: "Eski cihazlar daha yavaş",
        body: "Hesap yükü sunucuda değil, telefonunuzda veya dizüstünüzde. Giriş seviyesi bir telefon görsel başına on saniyeyi aşabilir.",
      },
      {
        title: "İnce saç hâlâ zor",
        body: "Hassas kip yumuşak kenarlarda çok daha temiz, ama arka planın rengi özneye yakınken hiçbir model kusursuz değil.",
      },
    ],
  },
  closer: {
    heading: "Bir görsel açın ve kendiniz görün",
    body: "Önünüzde kayıt ekranı yok. Stüdyoyu açın, dosyayı bırakın, bitti.",
  },
  footer: {
    tagline: "Fotoğraflarınızı kimseye teslim etmeden kullanılsın diye yapıldı.",
  },
  studio: {
    onDevice: "Bu cihazda işleniyor",
    back: "Ana sayfaya dön",
    dropTitle: "Görseli buraya bırakın",
    dropBody:
      "Dosyayı bu alana sürükleyin, panodan yapıştırın ya da aşağıdaki düğmeyi kullanın.",
    pick: "Görsel seçin",
    formats: "JPG · PNG · WEBP — en fazla 12 MB",
    qualityLabel: "Kalite",
    lightTitle: "Hafif",
    lightNote:
      "{mb} MB model · en hafifi, sınırlı cihaz ve bağlantılar için",
    balancedTitle: "Dengeli",
    balancedNote:
      "{mb} MB model · ortadaki seçim, çoğu fotoğraf için yeterli",
    maximumTitle: "Azami",
    maximumNote:
      "{mb} MB model · saçta ve yumuşak kenarlarda en temizi",
    auditOpen: "Model kataloğunu denetle",
    auditResult:
      "Kaynakta {models} model okundu. En küçüğü {small} bayt, en büyüğü {big} bayt — bu aralığın dışında hiçbir şey yok.",
    auditSize: "{mb} MB",
    auditTiny: "{kb} KB",
    auditNote:
      "Düğmeye bastığınız anda kaynak sunucudan okundu; bu uygulamaya yazılmış bir sayı değil. Yeniden denetlemek için sayfayı yenileyin.",
    auditFailed:
      "Katalog okunamadı — ağ başarısız oldu ya da kaynak reddetti. Yukarıdaki kademelerin boyutları şu anda doğrulanmamış durumda.",
    downloadPng: "PNG indir",
    transparentSuffix: "saydam",
    exportNote:
      "Her zaman önizleme boyutunda değil, özgün çözünürlükte dışa aktarılır.",
    another: "Başka görsel",
    restored: "Sekme kapandıktan sonra son sonucunuz geri yüklendi.",
    modelNote: "İstediğiniz zaman model değiştirin; kesim aynı görsel üzerinde yeniden yapılır.",
    attireLabel: "Kıyafet",
    attireNone: "Ceketsiz",
    attire: [
      "Antrasit takım",
      "Lacivert takım",
      "Kravatsız blazer",
    ],
    attireAuto:
      "Kesitteki omuz ve boyundan otomatik yerleştirildi.",
    attireManual:
      "Bu fotoğrafta omuzlar okunamadı. Boyutu ve yüksekliği kendin ayarla.",
    attireSize: "Boyut",
    attireDrop: "Yükseklik",
    firstDownloadNote:
      "Bu {mb} MB'lık indirme yalnızca bir kez olur. Tarayıcıda saklandıktan sonra sonraki görseller hiç ağ kullanmadan işlenir.",
    errUnsupported: "Bu biçim henüz desteklenmiyor. JPG, PNG veya WebP kullanın.",
    errTooBig: "{mb} MB'lık dosya 12 MB sınırını aşıyor. Önce küçültün.",
    errFailed: "Görsel işlenemedi. Başka bir dosyayla yeniden deneyin.",
    errExport: "İndirme dosyası hazırlanamadı.",
    errDecode: "Sonuç görsel olarak okunamıyor.",
  },
  progress: {
    downloading: "Model cihazınıza indiriliyor",
    engine: "Motor tarayıcıda başlatılıyor",
    separating: "Özne arka plandan ayrılıyor",
    done: "Bitti",
    working: "sürüyor…",
    preparing: "Hazırlanıyor…",
  },
  compare: {
    before: "Özgün",
    after: "Roto",
    sliderLabel: "Öncesi ile sonrasını karşılaştırmak için sürükleyin",
    altBefore: "İşlenmeden önceki özgün görsel",
    altAfter: "Arka plan kaldırıldıktan sonraki sonuç",
  },
  bg: {
    bgLabel: "Arka plan",
    gradientLabel: "Renk geçişi",
    customLabel: "Kendi renginiz",
    transparent: "Saydam",
    wheel: "Renk çarkından seçin",
    spectrum: "Renk tayfı",
    hue: "Ton",
    alpha: "Örtücülük",
    count: "16.777.216 renk",
    hint: "HEX ve rgb() kabul eder; yarı saydam arka plan için rgba() de olur.",
    invalid: "Okunamadı. #FF0000, #F00 veya rgb(255, 0, 0) deneyin.",
    presets: [
      "Beyaz",
      "Siyah",
      "Stüdyo grisi",
      "Karanlık oda ışığı",
      "Vesikalık mavisi",
      "Vesikalık kırmızısı",
      "Yeşil perde",
      "Krem",
    ],
    gradients: ["Alacakaranlık", "Pus", "Gece yarısı", "Deniz"],
    wallpaperLabel: "Duvar kâğıdı",
    wallpapers: [
      "Stüdyo grisi",
      "Pasaport mavisi",
      "Grafit",
      "Ilık kum",
      "Gökyüzü",
      "Adaçayı",
    ],
    upload: "Kendi görselin",
    uploadHint: "Dosya bu cihazda kalır",
    fitCover: "Doldur",
    fitContain: "Sığdır",
  },
};
