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

## Dicek 19 Nov 2026 malam (permintaan Farrez: "kerjakan dan cek sampai tuntas")

| Butir | Hasil | Bukti |
|---|---|---|
| Lisensi Black Marble | boleh dengan kredit NASA, tanpa logo dan tanpa kesan dukungan; area abu-abu karena halaman promosi | `data/PROVENANCE.md`, pedoman media NASA |
| Garis belang di silinder | hilang; outline image-space (depth + normal) jadi bawaan, `?garis=hull` untuk yang lama | render `bingkai/toon/G/d-dorongan.webp` |
| Garis putus di tumpukan map | berkurang setelah rentang depth disempitkan (near 2%, far 12 kali jarak) | sama |
| Kota tanpa garis | instanced mesh kini ikut pass normal | `bingkai/toon/G/d-ramai.webp` |
| Cek nilai abu-abu | nota digelapkan ke #b8322a: nota Y 97, piring Y 190, dinding Y 209 | `docs/look-dev/cerita-v5.md` |
| Cek siluet | timbangan menyatu dengan map; map dan monitor digeser | mode `?siluet=1` |
| Performa | diukur di Chrome GPU (RX 6700 XT desktop), emulasi HP DPR 2, CPU 4x; dorongan 285 draw call dan globe 403 ms bingkai pertama gagal anggaran, perbaikannya di lembar look-dev | `UKUR=1 node foto.mjs --gaya=toon --arah=G` |
| Baris lama banding-skin | dirender ulang dengan kota dan globe baru | `banding-skin.webp` |
| Gerak antarbabak | animatic 21,8 detik; putaran 1 gagal (zoom 2D pecah, blur pucat, dorongan terlalu pelan), putaran 2 menukik masuk padahal zoom out, putaran 3 lolos | `animatic-G.mp4`, `kontak-G.jpg`, `animatic.html` |
| Teks babak | naskah lewat bahasa-lisan, 2 sampai 3 pilihan per judul | `../naskah-teks.md` |
| Tes repo | `npm ci` di worktree, `npm test`: 255 lulus, 0 gagal | |

## Belum bisa dicek

- Performa di HP sungguhan: GPU HP jauh lebih lemah dari GPU desktop yang dipakai; angka GPU di atas hanya pembanding antaradegan.
- Perpindahan antaradegan di animatic memakai crossfade; build nanti memakai serah terima bertahap dengan objek jangkar (riset teknis v5), yang belum dibuat.
