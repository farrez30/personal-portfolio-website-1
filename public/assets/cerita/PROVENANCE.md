# Asal gambar cerita gulir v3

Sepuluh styleframe, satu per bab, dipakai sebagai panel di soundstage 3D (mode Imersif) dan
sebagai gambar bab di mode Ringan. Buatan AI.

- Alat: Google Flow, Nano Banana 2.1, 16:9, akun Google AI Pro Farrez, 10 Nov 2026, 0 kredit.
- Prompt, varian terpilih, dan pemeriksaannya: `desain/cerita-v3/PROVENANCE-gambar.md` dan
  `desain/cerita-v3/styleframe/prompt.json`.
- Pengolahan: WebP q84, 1376x768, tanpa suntingan isi.
- Tidak ada orang nyata yang wajahnya terlihat; tidak ada tulisan, logo, atau watermark.

## Look-dev (11 Nov 2026)

**Layar produk asli** di monitor bab 5, 6, dan 8 (ditempel shader di Imersif, dipanggang ke
`*-layar.webp` untuk Ringan oleh `scripts/layar-ringan.mjs`). Bukan buatan AI; data di dalamnya
fiktif atau demo, sama dengan klip hologram (`public/assets/demo/PROVENANCE.md`).

| Berkas | Sumber | Catatan |
|---|---|---|
| layar-05.webp | `public/assets/demo/coderoach-os-desktop.mp4` detik 3, 800x500 | Beranda Coderoach OS, data demo |
| layar-06a.webp | `public/assets/demo/d-day-desktop.mp4` detik 13, dipotong ke 1088x800, 680x500 | Hasil backtest demo d-day (rugi -7,32%, apa adanya) |
| layar-06b.webp | `public/assets/demo/coderoach-os-desktop.mp4` detik 13, dipotong ke 1152x800, 720x500 | Ringkasan keuangan Coderoach OS, data demo |
| layar-08.webp | `public/assets/layar/jeda-desktop.webp`, dipotong y 110 sampai 800, 780x441 | Halaman case study Jeda di coderoach.id, isi contoh fiktif |
| 05-syuting-layar.webp, 06-editing-layar.webp, 08-screening-layar.webp | styleframe + layar di atas | Mode Ringan |

**Peta kedalaman** `dalam-*.webp` untuk paralaks 2.5D: Depth Anything V2 Small
(`onnx-community/depth-anything-v2-small`, model.onnx fp32, lisensi Apache-2.0) lewat
`@huggingface/transformers` 4.3.2, dijalankan lokal di laptop Farrez, tanpa kuota. Diburamkan
sigma 2, diperkecil ke 344x192, WebP q85 abu-abu. Versi Large tidak dipakai karena berlisensi
CC-BY-NC-4.0. Panel rilis tanpa peta: kamera mendorong terlalu dekat ke tirainya.

**Artefak pembeli (12 Nov 2026).** Properti bab 2 dan 3 memuat dunia pembeli, ditempel dengan
shader yang sama (jenis "kertas": tinta dikalikan ke warna kertas) dan dipanggang untuk Ringan.

| Berkas | Sumber | Catatan |
|---|---|---|
| kertas-02.webp | Teks `desain/cerita-v3/kertas-02.txt`, ditik ffmpeg drawtext dengan Courier New Bold, 1000x640 | Daftar kebutuhan contoh di kertas mesin tik bab 2 |
| sketsa-03a.webp | `layar-05.webp` (Beranda Coderoach OS), edgedetect lalu negate, 560x350 | Garis pensil di layar sketsa laptop bab 3 |
| sketsa-03b.webp | `public/assets/demo/d-day-hp.mp4` detik 3, edgedetect lalu negate, 300x600 | Garis pensil di layar sketsa ponsel bab 3 |
| 02-naskah-layar.webp, 03-storyboard-layar.webp | styleframe + artefak di atas | Mode Ringan |

**Bab 1, laptop dengan Google Meet (12 Nov 2026).**
- `01-ide.webp` diganti versi berlaptop: edit Nano Banana 2.1 di Google Flow (project "Nov 10 - 23:54",
  dari varian b `2a2c9306`, hasil `a4c69078`), 0 kredit, akun Google AI Pro Farrez. Prompt meminta
  semua tetap sama dan hanya menambah satu laptop berlayar polos. Buatan AI. Asli di
  `desain/cerita-v3/styleframe/01-ide-laptop.jpg`.
- `layar-01.webp`: tangkapan Google Meet asli dari akun Farrez, rapat instan tanpa undangan, kamera
  dan mikrofon mati, hanya ubin "Farrez". Kode rapat dan jam dipotong; rapat ditinggalkan sesudahnya.
- `dalam-01-ide.webp` dibuat ulang dari gambar baru (Depth Anything V2 Small lokal, sigma 4).
- `01-ide-layar.webp`: versi Ringan.

**Bab 6 dan 7 (12 Nov 2026).**
- `layar-06a.webp` dan `layar-06b.webp` dibuat ulang dari klip demo yang sama, lalu diredupkan
  (`colorlevels=romax=0.66:gomax=0.68:bomax=0.74,eq=contrast=0.9`) supaya senada dengan monitor gelap
  styleframe. Ditempel jenis "bersih": tanpa pantulan isi lama monitor.
- `layar-07a.webp` (rapi) dan `layar-07b.webp` (buruk, sengaja ala AI slop): rancangan sendiri, HTML di
  `desain/cerita-v3/layar-07/`, dirender Chrome headless 1480x800, diperkecil ke 740x400. Toko dan
  nama pelanggan contoh; tidak memakai merek pihak lain. Versi rapi memakai token DESIGN.md
  (Schibsted Grotesk, IBM Plex Mono, satu aksen merah, garis 1 px, angka tabular).
- `layar-07-belah.webp`: separuh kiri versi rapi, separuh kanan versi buruk dipudarkan, dengan garis
  merah, untuk mode Ringan (`07-grading-layar.webp`).
