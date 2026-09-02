import type { Dict } from "../dict";

export const ms: Dict = {
  meta: {
    title: "Mattecut — buang latar gambar tanpa memuat naiknya",
    description:
      "Pembuang latar belakang yang berjalan di dalam pelayar. Gambar tidak pernah dihantar ke pelayan, tiada giliran menunggu, dan hasilnya dimuat turun pada resolusi asal.",
    studioTitle: "Studio",
    studioDescription:
      "Masukkan gambar, potong subjeknya, kemudian tukar latar dengan warna atau kecerunan apa pun.",
    notFoundTitle: "Halaman itu tidak wujud",
    notFoundBody:
      "Pautannya mungkin tersalah taip, atau halaman itu memang tidak pernah ada.",
    backHome: "Kembali ke laman utama",
  },
  common: {
    openStudio: "Buka studio",
    sourceCode: "Kod sumber",
    readCode: "Baca kodnya",
    close: "Tutup",
    skipToContent: "Lompat ke kandungan",
  },
  theme: {
    label: "Paparan",
    light: "Cerah",
    dark: "Gelap",
    system: "Ikut sistem",
  },
  lang: { label: "Bahasa" },
  hero: {
    badge: "Berjalan pada peranti anda",
    titleA: "Angkat subjeknya.",
    titleB: "Buang selebihnya.",
    lead: "Mattecut memotong latar belakang gambar terus di dalam pelayar. Failnya tidak pernah keluar dari peranti anda, jadi tiada giliran menunggu, tiada kuota harian, dan tiada apa-apa yang perlu anda percayai tentang apa yang berlaku kepada foto anda.",
    cta: "Potong gambar pertama",
    note: "Tanpa akaun · tanpa muat naik · tanpa tera air",
    caption: "Alpha matte · 8-bit",
  },
  pillars: [
    {
      title: "Diproses pada peranti",
      body: "Model segmentasi dijalankan oleh pelayar anda sendiri melalui WebAssembly. Gambar tidak menyentuh pelayan kami, kerana memang tiada pelayan yang menerimanya.",
    },
    {
      title: "Resolusi asal",
      body: "Yang anda muat turun ialah hasil pada dimensi fail asalnya. Pratonton boleh dikecilkan demi kelajuan, tetapi eksport sentiasa dibina semula daripada data penuh.",
    },
    {
      title: "Jalan tanpa sambungan",
      body: "Selepas muat turun model pertama tersimpan dalam pelayar, gambar seterusnya boleh diproses walaupun rangkaian terputus.",
    },
  ],
  steps: {
    eyebrow: "Cara ia berfungsi",
    heading: "Empat langkah, tiada yang disembunyikan",
    items: [
      {
        title: "Masukkan gambar",
        body: "Seret fail ke kawasan muat naik, tampal daripada papan keratan, atau pilih daripada galeri telefon. JPG, PNG, dan WebP sehingga 12 MB.",
      },
      {
        title: "Tunggu potongannya",
        body: "Model memisahkan subjek daripada latar. Foto biasa siap dalam beberapa saat, dan bar kemajuan menunjukkan peringkat yang sedang berjalan, bukan angka rekaan.",
      },
      {
        title: "Tetapkan latar barunya",
        body: "Biarkan lutsinar, pilih warna daripada swatch, taip HEX atau rgb() sendiri, atau guna kecerunan. Pratonton berubah serta-merta.",
      },
      {
        title: "Muat turun",
        body: "PNG untuk latar lutsinar, JPG bila perlukan fail ringan, WebP bila mengejar saiz terkecil.",
      },
    ],
  },
  features: {
    eyebrow: "Apa yang ada di dalam",
    items: [
      {
        title: "HEX dan rgb() sekali gus",
        body: "Ruang warna menerima #FF0000, #F00, rgb(255, 0, 0), sehingga rgba() bila anda mahu latar separa lutsinar. Salah taip ditanda, bukan diabaikan diam-diam.",
      },
      {
        title: "Pembanding yang boleh diseret",
        body: "Satu pembahagi untuk menilai hasil potongan. Berfungsi dengan tetikus, jari, mahupun kekunci anak panah.",
      },
      {
        title: "Tiga format eksport",
        body: "PNG mengekalkan saluran alfa. JPG dan WebP ada untuk saat yang anda perlukan hanyalah fail kecil untuk dimuat naik ke tempat lain.",
      },
    ],
  },
  limits: {
    eyebrow: "Batasannya",
    heading: "Perkara yang elok anda tahu sebelum mencuba",
    items: [
      {
        title: "Muat turun awal 54 MB",
        body: "Model segmentasi perlu masuk ke pelayar dahulu. Sekali sahaja, kemudian tersimpan. Pada kuota terhad, buat menerusi Wi-Fi.",
      },
      {
        title: "Peranti lama terasa lebih perlahan",
        body: "Beban pengiraan ada pada telefon atau komputer riba anda, bukan pada pelayan. Telefon kelas bawah boleh mengambil belasan saat untuk satu gambar.",
      },
      {
        title: "Rambut halus masih mencabar",
        body: "Mod persis jauh lebih kemas pada tepi halus, tetapi tiada model yang sempurna apabila warna latar hampir sama dengan subjek.",
      },
    ],
  },
  closer: {
    heading: "Buka satu gambar dan lihat sendiri",
    body: "Tiada pendaftaran di hadapan. Buka studionya, lepaskan fail, siap.",
  },
  footer: {
    tagline: "Dibina untuk digunakan tanpa menyerahkan foto kepada sesiapa.",
  },
  studio: {
    onDevice: "Diproses pada peranti ini",
    back: "Kembali ke laman utama",
    dropTitle: "Letakkan gambar di sini",
    dropBody:
      "Seret failnya ke kawasan ini, tampal daripada papan keratan, atau pilih melalui butang di bawah.",
    pick: "Pilih gambar",
    formats: "JPG · PNG · WEBP — maksimum 12 MB",
    qualityLabel: "Kualiti",
    applyModel: "Guna model ini",
    liteTitle: "Sangat ringan",
    liteNote:
      "Model {mb} MB · muat turun terkecil, paling kasar pada rambut",
    lightTitle: "Ringan",
    lightNote:
      "Model {mb} MB · muat turun kecil, tepi lebih tajam daripada sangat ringan",
    balancedTitle: "Seimbang",
    balancedNote:
      "Model {mb} MB · pilihan tengah, memadai untuk kebanyakan foto",
    maximumTitle: "Maksimum",
    maximumNote:
      "Model {mb} MB · paling bersih pada rambut dan tepi lembut",
    auditOpen: "Semak katalog model",
    auditResult:
      "Terbaca {models} model di sumbernya. Terkecil {small} bait, terbesar {big} bait — tiada di luar julat itu.",
    auditSize: "{mb} MB",
    auditTiny: "{kb} KB",
    auditMath:
      "Angka pada setiap tahap di atas menambah runtime {rt} MB kepada modelnya, kerana itulah yang benar-benar dimuat turun.",
    auditNote:
      "Dibaca terus dari pelayan asal ketika butang ditekan, bukan angka yang ditulis dalam aplikasi ini. Muat semula untuk menyemak lagi.",
    auditFailed:
      "Katalog tidak dapat dibaca — rangkaian gagal atau pelayan asal menolak. Saiz pada tahap di atas belum disahkan buat masa ini.",
    downloadPng: "Muat turun PNG",
    transparentSuffix: "lutsinar",
    exportNote:
      "Sentiasa dieksport pada resolusi asal, bukan saiz pratonton.",
    exportNoteCapped:
      "Dieksport pada {w} × {h} px, lebih kecil daripada asal: peranti ini tidak mampu membawa resolusi penuh melalui model.",
    lowPower:
      "Peranti ini melaporkan memori atau teras pemproses yang terhad, jadi model paling ringan dipilih secara lalai dan foto dikecilkan kepada {px} px pada sisi terpanjang sebelum diproses. Semua tahap masih boleh dipilih.",
    zoomOut: "Kecilkan paparan",
    zoomIn: "Besarkan paparan",
    zoomFit: "Muat pada skrin",
    another: "Gambar lain",
    restored: "Hasil terakhir dipulihkan selepas tab ditutup.",
    modelNote: "Tukar model bila-bila masa; potongan diulang pada imej yang sama.",
    attireLabel: "Pakaian",
    attireNone: "Tanpa jaket",
    attire: [
      "Sut arang",
      "Sut biru gelap",
      "Blazer tanpa tali leher",
    ],
    attireAuto:
      "Diletakkan automatik daripada bahu dan leher pada potongan.",
    attireManual:
      "Bahu tidak dapat dibaca pada foto ini. Tetapkan saiz dan ketinggian sendiri.",
    attireSize: "Saiz",
    attireDrop: "Ketinggian",
    firstDownloadNote:
      "Muat turun {mb} MB ini sekali sahaja. Selepas tersimpan dalam pelayar, gambar seterusnya diproses tanpa rangkaian langsung.",
    errUnsupported: "Format itu belum disokong. Guna JPG, PNG, atau WebP.",
    errTooBig: "Fail {mb} MB melebihi had 12 MB. Kecilkan dahulu.",
    errFailed: "Gagal memproses gambar. Cuba lagi dengan fail lain.",
    errExport: "Gagal menyediakan fail muat turun.",
    errDecode: "Hasil tidak dapat dibaca sebagai gambar.",
  },
  progress: {
    downloading: "Memuat turun model ke peranti",
    engine: "Menyediakan enjin dalam pelayar",
    separating: "Memisahkan subjek daripada latar",
    done: "Selesai",
    working: "berjalan…",
    preparing: "Menyediakan…",
  },
  compare: {
    before: "Asal",
    after: "Mattecut",
    sliderLabel: "Seret untuk membandingkan sebelum dan selepas",
    altBefore: "Gambar asal sebelum diproses",
    altAfter: "Hasil selepas latar dibuang",
  },
  bg: {
    bgLabel: "Latar",
    gradientLabel: "Kecerunan",
    customLabel: "Warna sendiri",
    transparent: "Lutsinar",
    wheel: "Pilih daripada roda warna",
    spectrum: "Spektrum warna",
    hue: "Rona",
    alpha: "Kelegapan",
    count: "16,777,216 warna",
    hint: "Menerima HEX dan rgb(), termasuk rgba() bila mahu latar separa lutsinar.",
    invalid: "Format belum terbaca. Cuba #FF0000, #F00, atau rgb(255, 0, 0).",
    presets: [
      "Putih",
      "Hitam",
      "Kelabu studio",
      "Safelight",
      "Biru pasport",
      "Merah pasport",
      "Hijau skrin",
      "Krim",
    ],
    gradients: ["Senja", "Kabus", "Malam", "Laut"],
    wallpaperLabel: "Kertas dinding",
    wallpapers: [
      "Kelabu studio",
      "Biru pasport",
      "Grafit",
      "Pasir suam",
      "Langit",
      "Sage",
    ],
    upload: "Imej sendiri",
    uploadHint: "Fail kekal pada peranti ini",
    catalogueOpen:
      "Layari semua latar",
    catalogueTitle:
      "Katalog latar belakang",
    catalogueCount:
      "{n} latar, dijana pada peranti ini — tiada yang dimuat turun",
    catalogueByCount:
      "{n} foto di bawah CC BY — bebas digunakan, tetapi nama pencipta wajib dinyatakan",
    creditRequired:
      "Wajib dinyatakan di mana sahaja hasil ini dikongsi: {credit}",
    cataloguePhotoCount:
      "{n} foto, domain awam atau CC0, disajikan dari laman ini",
    catalogueTabGradients: "Warna",
    catalogueTabPhotos: "Foto",
    catalogueSearch:
      "Cari: biru, lembut, teal gelap, kecerunan, #1f6fff",
    catalogueEmpty:
      "Tiada padanan. Cuba nama warna, atau kod heks.",
    catalogueFailed:
      "Senarai foto tidak dapat dimuatkan. Semak sambungan dan cuba lagi.",
    creditShown:
      "Nyatakan kredit foto ini di mana sahaja hasilnya dikongsi: {credit}",
    fitCover: "Penuhi",
    fitContain: "Muat",
  },
};
