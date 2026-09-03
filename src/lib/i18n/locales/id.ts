import type { Dict } from "../dict";

export const id: Dict = {
  meta: {
    title: "Mattecut — hapus latar gambar tanpa mengunggahnya",
    description:
      "Penghapus latar belakang yang bekerja di dalam peramban. Gambar tidak dikirim ke server mana pun, tidak ada antrean, dan hasilnya diunduh pada resolusi asli.",
    studioTitle: "Studio",
    studioDescription:
      "Masukkan gambar, potong subjeknya, lalu ganti latar dengan warna atau gradien apa pun.",
    notFoundTitle: "Halaman itu tidak ada",
    notFoundBody:
      "Tautannya mungkin salah ketik, atau halamannya memang belum pernah dibuat.",
    backHome: "Kembali ke beranda",
  },
  common: {
    openStudio: "Buka studio",
    sourceCode: "Kode sumber",
    readCode: "Baca kodenya",
    close: "Tutup",
    skipToContent: "Lompat ke konten",
  },
  theme: {
    label: "Tampilan",
    light: "Terang",
    dark: "Gelap",
    system: "Ikuti sistem",
  },
  lang: { label: "Bahasa" },
  hero: {
    badge: "Berjalan di perangkat Anda",
    titleA: "Angkat subjeknya.",
    titleB: "Buang sisanya.",
    lead: "Mattecut memotong latar belakang gambar langsung di dalam peramban. Berkasnya tidak pernah dikirim ke mana-mana, jadi tidak ada antrean, tidak ada kuota harian, dan tidak ada yang perlu Anda percayai soal apa yang terjadi pada foto Anda.",
    cta: "Potong gambar pertama",
    note: "Tanpa akun · tanpa unggah · tanpa tanda air",
    caption: "Alpha matte · 8-bit",
  },
  pillars: [
    {
      title: "Diproses di perangkat",
      body: "Model segmentasi dijalankan oleh peramban Anda sendiri lewat WebAssembly. Gambar tidak menyentuh server kami, karena memang tidak ada server yang menerimanya.",
    },
    {
      title: "Resolusi asli",
      body: "Yang Anda unduh adalah hasil pada dimensi berkas aslinya. Pratinjau boleh diperkecil demi kecepatan, tetapi ekspor selalu dirakit ulang dari data penuh.",
    },
    {
      title: "Jalan tanpa sinyal",
      body: "Setelah unduhan model pertama tersimpan di peramban, gambar berikutnya bisa diproses meski koneksi sedang mati.",
    },
  ],
  steps: {
    eyebrow: "Alur kerja",
    heading: "Empat langkah, tidak ada yang tersembunyi",
    items: [
      {
        title: "Masukkan gambar",
        body: "Tarik berkas ke area unggah, tempel dari papan klip, atau pilih dari galeri ponsel. JPG, PNG, dan WebP sampai 12 MB.",
      },
      {
        title: "Tunggu potongannya",
        body: "Model memisahkan subjek dari latar. Foto biasa selesai dalam hitungan detik, dan batang progres menunjukkan tahap yang sedang berjalan, bukan angka karangan.",
      },
      {
        title: "Atur latar barunya",
        body: "Biarkan transparan, pilih warna dari swatch, ketik HEX atau rgb() sendiri, atau pakai gradien. Pratinjau berubah seketika.",
      },
      {
        title: "Unduh",
        body: "PNG untuk latar transparan, JPG bila butuh berkas ringan, WebP bila mengejar ukuran terkecil.",
      },
    ],
  },
  features: {
    eyebrow: "Yang ada di dalam",
    items: [
      {
        title: "HEX dan rgb() sekaligus",
        body: "Kolom warna menerima #FF0000, #F00, rgb(255, 0, 0), sampai rgba() bila Anda ingin latar semi-tembus. Salah ketik ditandai, bukan diabaikan diam-diam.",
      },
      {
        title: "Pembanding yang bisa digeser",
        body: "Satu penggaris untuk menilai hasil potongan. Jalan dengan tetikus, jari, maupun tombol panah di papan ketik.",
      },
      {
        title: "Tiga format ekspor",
        body: "PNG mempertahankan kanal alfa. JPG dan WebP tersedia saat yang Anda butuhkan cuma berkas kecil untuk diunggah ke tempat lain.",
      },
    ],
  },
  limits: {
    eyebrow: "Batasannya",
    heading: "Hal-hal yang sebaiknya Anda tahu sebelum mencoba",
    items: [
      {
        title: "Unduhan awal 54 MB",
        body: "Model segmentasi harus masuk ke peramban dulu. Sekali saja, lalu tersimpan. Di kuota terbatas, kerjakan lewat Wi-Fi.",
      },
      {
        title: "Perangkat lama terasa lebih lambat",
        body: "Beban komputasi ada di ponsel atau laptop Anda, bukan di server. Ponsel kelas bawah bisa butuh belasan detik per gambar.",
      },
      {
        title: "Rambut tipis masih menantang",
        body: "Mode presisi jauh lebih rapi di tepi halus, tapi tidak ada model yang sempurna pada latar yang warnanya mirip subjek.",
      },
    ],
  },
  closer: {
    heading: "Buka satu gambar dan lihat sendiri",
    body: "Tidak ada pendaftaran di depan. Buka studionya, jatuhkan berkas, selesai.",
  },
  footer: { tagline: "Dibuat untuk dipakai tanpa menitipkan foto ke siapa pun." },
  studio: {
    onDevice: "Diproses di perangkat ini",
    back: "Kembali ke beranda",
    dropTitle: "Letakkan gambar di sini",
    dropBody:
      "Tarik berkasnya ke area ini, tempel dari papan klip, atau pilih lewat tombol di bawah.",
    pick: "Pilih gambar",
    formats: "JPG · PNG · WEBP — maksimum 12 MB",
    qualityLabel: "Kualitas",
    applyModel: "Pakai model ini",
    liteTitle: "Sangat ringan",
    liteNote:
      "Model {mb} MB · unduhan terkecil, paling kasar di rambut",
    fineTitle: "Peka rambut",
    fineNote:
      "Model {mb} MB · memperlakukan rambut sebagai lapisan tersendiri, unduhan tetap kecil",
    lightTitle: "Ringan",
    lightNote:
      "Model {mb} MB · unduhan kecil, tepi lebih tajam dari sangat ringan",
    balancedTitle: "Seimbang",
    balancedNote:
      "Model {mb} MB · pilihan tengah, cukup untuk hampir semua foto",
    maximumTitle: "Maksimum",
    maximumNote:
      "Model {mb} MB · paling bersih pada rambut dan tepi lembut",
    auditOpen: "Periksa katalog model",
    auditResult:
      "Terbaca {models} model di sumbernya. Terkecil {small} bita, terbesar {big} bita — tidak ada di luar rentang itu.",
    auditSize: "{mb} MB",
    auditTiny: "{kb} KB",
    auditMath:
      "Angka pada tingkat kualitas di atas menjumlahkan model dengan runtime {rt} MB, karena itulah yang benar-benar diunduh.",
    auditNote:
      "Dibaca langsung dari server asal saat tombol ditekan, bukan angka yang ditulis di aplikasi ini. Muat ulang untuk memeriksa lagi.",
    auditFailed:
      "Katalog tidak terbaca — jaringan gagal atau server asal menolak. Angka pada tingkat kualitas di atas tidak terbukti saat ini.",
    downloadPng: "Unduh PNG",
    transparentSuffix: "transparan",
    sharpenLabel: "Ketajaman",
    sharpenLevels: ["Mati", "Ringan", "Sedang", "Kuat"],
    sharpenNote:
      "Menambah kontras tepi hanya pada warna, tidak pernah pada tepi potongan. Ia tidak memunculkan detail yang tidak direkam kamera.",
    keepOriginal: "Pertahankan latar asli",
    keepOriginalNote:
      "Mengekspor foto apa adanya — dipertajam, tanpa dipotong.",
    exportNote: "Selalu diekspor pada resolusi asli, bukan ukuran pratinjau.",
    exportNoteCapped:
      "Diekspor pada {w} × {h} px, lebih kecil dari aslinya: perangkat ini tidak sanggup membawa resolusi penuh melewati model.",
    exportNoteRestored:
      "Diekspor pada {w} × {h} px penuh sesuai berkas Anda. Model berjalan pada salinan lebih kecil, jadi hanya tepi potongannya yang lebih lembut — seluruh piksel di dalam subjek adalah asli milik Anda.",
    lowPower:
      "Perangkat ini melaporkan memori atau inti prosesor yang terbatas, jadi model teringan dipilih sebagai bawaan dan foto dikecilkan ke {px} px pada sisi terpanjang sebelum diproses. Semua tingkat tetap bisa dipilih.",
    zoomOut: "Perkecil tampilan",
    zoomIn: "Perbesar tampilan",
    zoomFit: "Muat ke layar",
    another: "Gambar lain",
    restored: "Hasil terakhir dipulihkan setelah tab tertutup.",
    modelNote: "Ganti model kapan saja; potongan diulang pada gambar yang sama.",
    attireLabel: "Pakaian",
    attireNone: "Tanpa jas",
    attire: [
      "Jas arang",
      "Jas biru dongker",
      "Blazer tanpa dasi",
    ],
    attireAuto:
      "Ditempatkan otomatis dari bahu dan leher pada potongan.",
    attireManual:
      "Bahu tidak terbaca pada foto ini. Atur sendiri ukuran dan tingginya.",
    attireReset: "Kembalikan ukuran dan tinggi",
    attireSize: "Ukuran",
    attireDrop: "Tinggi",
    firstDownloadNote:
      "Unduhan {mb} MB ini hanya sekali. Setelah tersimpan di peramban, gambar berikutnya diproses tanpa jaringan sama sekali.",
    errUnsupported: "Format itu belum didukung. Pakai JPG, PNG, atau WebP.",
    errTooBig: "Berkas {mb} MB melebihi batas 12 MB. Perkecil dulu, ya.",
    errFailed: "Gagal memproses gambar. Coba lagi dengan berkas lain.",
    errExport: "Gagal menyiapkan berkas unduhan.",
    errDecode: "Hasil tidak bisa dibaca sebagai gambar.",
  },
  progress: {
    downloading: "Mengunduh model ke perangkat",
    engine: "Menyiapkan mesin di peramban",
    separating: "Memisahkan subjek dari latar",
    done: "Selesai",
    working: "berjalan…",
    preparing: "Menyiapkan…",
  },
  compare: {
    before: "Asli",
    after: "Mattecut",
    sliderLabel: "Geser untuk membandingkan sebelum dan sesudah",
    altBefore: "Gambar asli sebelum diproses",
    altAfter: "Hasil setelah latar dihapus",
  },
  bg: {
    bgLabel: "Latar",
    gradientLabel: "Gradien",
    customLabel: "Warna sendiri",
    transparent: "Transparan",
    wheel: "Pilih dari roda warna",
    spectrum: "Spektrum warna",
    hue: "Rona",
    alpha: "Ketembusan",
    count: "16.777.216 warna",
    hint: "Menerima HEX dan rgb(), termasuk rgba() bila ingin latar semi-tembus.",
    invalid: "Format belum terbaca. Coba #FF0000, #F00, atau rgb(255, 0, 0).",
    presets: [
      "Putih",
      "Hitam",
      "Abu studio",
      "Safelight",
      "Biru pas foto",
      "Merah pas foto",
      "Hijau layar",
      "Krem",
    ],
    gradients: ["Senja", "Kabut", "Malam", "Laut"],
    wallpaperLabel: "Wallpaper",
    wallpapers: [
      "Abu studio",
      "Biru pasfoto",
      "Grafit",
      "Pasir hangat",
      "Langit",
      "Sage",
    ],
    upload: "Gambar sendiri",
    uploadHint: "Berkas tetap di perangkat ini",
    catalogueOpen:
      "Jelajahi semua latar",
    catalogueTitle:
      "Katalog latar belakang",
    catalogueCount:
      "{n} latar, dibangkitkan di perangkat ini — tidak ada yang diunduh",
    catalogueByCount:
      "{n} foto berlisensi CC BY — bebas dipakai, tetapi nama pembuat wajib dicantumkan",
    catalogueOfflineCount:
      "{n} foto tersimpan di dalam aplikasi — ini bekerja tanpa koneksi",
    catalogueTabOffline: "Tanpa jaringan",
    creditRequired:
      "Wajib dicantumkan di mana pun hasil ini dibagikan: {credit}",
    cataloguePhotoCount:
      "{n} foto, domain publik atau CC0, disajikan dari situs ini",
    catalogueTabGradients: "Warna",
    catalogueTabPhotos: "Foto",
    catalogueSearch:
      "Cari: biru, lembut, teal gelap, gradien, #1f6fff",
    catalogueEmpty:
      "Tidak ada yang cocok. Coba nama warna, atau kode heksa.",
    catalogueFailed:
      "Daftar foto tidak dapat dimuat. Periksa koneksi lalu coba lagi.",
    creditShown:
      "Cantumkan kredit foto ini di mana pun hasilnya dibagikan: {credit}",
    fitCover: "Penuhi",
    fitContain: "Muat",
  },
};
