# Roto

Penghapus latar belakang gambar yang berjalan di dalam peramban. Berkas tidak
pernah dikirim ke server mana pun, tidak ada antrean, tidak ada kuota harian,
dan hasilnya diunduh pada resolusi asli.

Nama diambil dari *rotoscoping*, istilah film untuk memisahkan subjek dari
latarnya bingkai demi bingkai.

## Apa yang membuatnya berbeda

Model segmentasi dijalankan oleh peramban lewat WebAssembly, bukan oleh
server. Konsekuensinya nyata di dua arah, dan keduanya disebut apa adanya:

- Gambar tidak menyentuh server kami, karena memang tidak ada server yang
  menerimanya. Tidak ada yang perlu Anda percayai soal apa yang terjadi pada
  foto Anda.
- Unduhan pertama sekitar 54 MB, dan beban komputasi ada di perangkat Anda.
  Ponsel kelas bawah butuh belasan detik per gambar.

Halaman depan memuat satu seksi khusus yang menyebutkan batasan-batasan ini
sebelum orang mencoba, bukan sesudah.

## Fitur

- Unggah lewat tarik-lepas, tempel dari papan klip, atau galeri ponsel.
  JPG, PNG, WebP sampai 12 MB.
- Pembanding sebelum/sesudah yang bisa digeser dengan tetikus, jari, dan
  tombol panah.
- Latar baru: transparan, swatch warna, gradien, atau warna sendiri. Kolom
  warna menerima `#FF0000`, `#F00`, `#00f8`, `rgb(255, 0, 0)`,
  `rgb(10 20 30)`, dan `rgba(0, 0, 255, .4)`. Salah ketik ditandai, bukan
  diabaikan diam-diam.
- Ekspor PNG (kanal alfa dipertahankan), JPG, dan WebP, selalu pada resolusi
  berkas asli, bukan ukuran pratinjau.
- Mode terang dan gelap, plus opsi mengikuti sistem, tanpa kedipan saat muat.
- 18 bahasa: Indonesia, Inggris, Melayu, Spanyol, Portugis, Prancis, Jerman,
  Italia, Belanda, Turki, Vietnam, Thai, Jepang, Korea, Mandarin, Hindi,
  Rusia, dan Arab dengan tata letak kanan-ke-kiri.

## Menjalankan secara lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

```bash
npm run build   # build produksi
npx eslint src  # lint
npx tsc --noEmit
```

## Susunan berkas

| Berkas | Isinya |
| --- | --- |
| `src/lib/matting.ts` | Pembungkus model. Satu-satunya tempat pustaka matting disentuh, dan bebas bahasa: yang keluar hanya kunci tahapan. |
| `src/lib/color.ts` | Pengurai HEX dan `rgb()`. Mengembalikan `null` untuk apa pun yang tidak terbaca, supaya antarmuka bisa menandainya. |
| `src/lib/compose.ts` | Penyusunan kanvas dan ekspor. Pratinjau memakai CSS `background` agar seketika; kanvas hanya dipakai saat ekspor. |
| `src/lib/i18n/` | Tipe `Dict` dan 18 kamus. Menambah satu kalimat ke produk akan menggagalkan build sampai semua bahasa melengkapinya. |
| `src/components/preferences.tsx` | Tema dan bahasa, dibaca lewat `useSyncExternalStore` karena `localStorage` memang sistem eksternal. Ikut sinkron antar-tab. |
| `src/app/globals.css` | Dua palet penuh. Setiap token punya nilai di `:root` polos. |

## Aksesibilitas dan kontras

Setiap pasangan warna teks dan latar diukur di kedua tema; yang terendah
5.09 di mode terang dan 5.24 di mode gelap, keduanya di atas ambang WCAG AA
4.5. Tata letak diuji pada 375px dan 1440px untuk 18 bahasa dikali 2 tema.

## Catatan keamanan

Header keamanan diatur di `next.config.ts`: CSP, `X-Content-Type-Options`,
`X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP, CORP, dan
HSTS.

Satu hal disebut terbuka di komentar berkas itu: `script-src` memuat
`'unsafe-eval'` dan `blob:`. Runtime ONNX menyalakan worker dari URL `blob:`
dan mengompilasi lem Emscripten dari string, jadi tanpa keduanya potongan
pertama melempar `EvalError` dan aplikasinya mati total. Itu pelonggaran
nyata. Yang membatasi dampaknya adalah apa yang aplikasi ini simpan, yaitu
tidak ada: tanpa akun, tanpa cookie, tanpa sesi, tanpa server, tanpa skrip
pihak ketiga, dan tanpa data pengguna yang keluar dari tab. Sisanya tetap
terkunci pada `'self'` ditambah satu CDN yang menyajikan model.

## Tumpukan

Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4,
`@imgly/background-removal` untuk matting di perangkat, `motion` untuk gerak,
`lucide-react` untuk ikon.
