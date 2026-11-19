# Previs cerita v5

Adegan blockout three.js untuk menilai komposisi, kamera, dan kejadian tiap babak sebelum ada kode
situs. Bukan kode produksi.

## Berkas

- `shot.mjs`: shot list. `SHOT` arah G (catatan lengkap: kejadian, kamera, pemicu, pin, pola bank,
  bukti), `ARAH` untuk A, E, F, G yang dipakai pembanding.
- `previs.html`: satu halaman, parameter `?a=G&s=dorongan&gaya=toon`. Gaya: `clay`, `toon`, `iso`, `lowpoly`.
- `foto.mjs`: potret lewat CDP dengan viewport persis (desktop 1440x900, HP 390x844).
  `node foto.mjs --gaya=toon --arah=G [id ...]`, lalu `node foto.mjs --papan=banding-1,banding-2`.
- `papan.mjs`, `banding-arah.mjs`, `banding-skin.html`: papan yang dipotret jadi PNG.
- `data/`: peta Natural Earth dan Black Marble, asalnya di `data/PROVENANCE.md`.

## Keputusan Farrez, 19 Nov 2026

1. Previs blockout G dibuat. Farrez meminta A, E, dan F dibuat juga untuk dibandingkan.
2. Skin: dari clay, toon, isometrik, dan low-poly, Farrez memilih toon dengan outline dan kamera
   perspektif ("Isometrik terlalu seperti diagram; toon perspektif lebih hidup untuk cerita").
   ADR 0020.
3. Masukan Farrez: kota terlihat seperti kotak-kotak dan globe tanpa peta dunia. Kota dibangun ulang
   (jalan, rumah beratap, gedung yang makin tinggi di pusat, pohon, ruko klien merah). Globe malam
   memakai garis pantai Natural Earth dan lampu kota Black Marble di langit berbintang.
4. Setelah keempat arah dibandingkan dengan skin yang sama (`banding-1.png`, `banding-2.png`),
   Farrez tetap memilih G.
5. Rak dan loader CD: diputuskan setelah lembar look-dev.

## Pelajaran teknis

- Chrome headless `--window-size` memberi viewport lebih kecil dari jendela; pakai CDP
  `Emulation.setDeviceMetricsOverride`.
- Kamera dengan `near = 0.01` pada jarak ratusan unit membuat pulau z-fighting dengan lantai
  (terlihat hitam). Adegan makro memakai `near = 1`.
- Kabut yang menyatu dengan latar menelan seluruh adegan bila kamera ortografis dijauhkan.
- Outline inverted hull belang di silinder bersudut tajam; uji outline image-space di look-dev.
- Memilah lampu di Black Marble: ambang luminans saja ikut mengangkat medan gurun; dipakai ambang
  plus syarat warna hangat (merah lebih besar dari biru).

## Belum dicek

- Gerak antarbabak (camera blend, motion blur): previs hanya bingkai diam.
- Performa di HP sungguhan: render memakai SwiftShader, bukan GPU.
- Teks babak belum lewat skill bahasa-lisan; judul dan catatan di sini adalah naskah kerja.
- Baris isometrik dan low-poly di `banding-skin.webp` masih memakai kota dan globe versi lama (sebelum dibangun ulang); hanya baris toon yang sudah versi baru.
