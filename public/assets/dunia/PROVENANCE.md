# Asal aset dunia toko kaset

Dunia 3D di belakang beranda (ADR 0014, fase 1). Ruangan, rak CD, kartu catatan sampul, meja
kasir, pintu, lonceng, dan dudukan headphone dibangun dari primitif three.js di
`components/dunia/dunia.js`. Berkas di folder ini:

| Berkas | Asal | Lisensi | Pengolahan |
|---|---|---|---|
| `kayu.webp` | Google Flow, Nano Banana 2.1, akun Google AI Pro Farrez, project "Nov 12 - 14:03", 0 kredit. **Buatan AI.** | Ketentuan Google untuk konten buatan pengguna | PNG 1024 px ke WebP q80 (ffmpeg) |
| `busa.webp` | Sama seperti di atas (`busa-2.png`). **Buatan AI.** | Sama | Diperkecil ke 512 px, WebP q80 |
| `beton.webp`, `beton-kasar.webp` | Dibuat kode: `scripts/beton.py` (numpy, derau disaring FFT supaya menyambung, goresan Pillow), 12 Nov 2026. Lantai beton dari lembar look-dev (`docs/look-dev.md`). Bukan buatan AI. | Milik project | 512 px, WebP q82. `beton-kasar` adalah peta roughness (dibaca tanpa konversi warna) |
| `bar_chair_round_01.glb` | Poly Haven, glTF 1k | CC0 | Tekstur diperkecil ke 512 px (JPEG q4, ffmpeg), lalu `@gltf-transform/cli@4.1.0 optimize --compress meshopt --texture-compress false` |
| `hanging_industrial_lamp.glb` | Poly Haven, glTF 1k | CC0 | Sama. Kaca transmission diganti kaca transparan saat dimuat (lihat dunia.js) |
| `portable_cassette_player.glb` | Poly Haven, glTF 1k, karya Mateusz Sadek | CC0 | Sama |
| `headphone.glb` | Hunyuan3D-2 (Space `tencent/Hunyuan3D-2`, `/shape_generation`, steps 30, guidance 5, seed 1234, octree 384, rembg) dari gambar Flow `headphone-1.png`. **Buatan AI.** | Tencent Hunyuan 3D 2.0 Community License | weld + simplify 4% (lab), lalu `@gltf-transform/cli@4.1.0 meshopt` (776 ke 218 KB). Bentuk saja: normal dihitung saat dimuat, bahan matte gelap |

Total 1,3 MB (model 1,1 MB, tekstur ruangan 191 KB). Bahan aslinya ada di folder catatan sesi
`lab3d/` (12 Nov 2026), dengan PROVENANCE lab yang mencatat prompt Flow dan parameter Hunyuan.

## Risiko lisensi headphone (diputuskan Farrez, 12 Nov 2026)

Pasal 5(c) Tencent Hunyuan 3D 2.0 Community License (rilis 21 Januari 2025) melarang Output
dipakai atau **ditampilkan** di luar Territory, dan Territory mengecualikan Uni Eropa, Inggris,
dan Korea Selatan (Pasal 1(l)). AUP poin 12 meminta konten buatan mesin diberi tanda yang jelas.
Situs ini bisa dibuka dari wilayah itu dan tidak memberi label di layar. Farrez memilih menerima
risiko ini setelah melihat perbandingan dengan versi prosedural (ADR 0015). Sanksi terburuk yang
tertulis: Tencent boleh mengakhiri lisensi (Pasal 8(b)); jalan keluarnya mengganti berkas ini
dengan headphone prosedural (commit 718117d) atau memblokir wilayah lewat header negara Vercel.
Sumber: https://raw.githubusercontent.com/Tencent/Hunyuan3D-2/main/LICENSE.

## Props cerita v4 (13 Nov 2026)

| Berkas | Asal | Lisensi | Pengolahan |
|---|---|---|---|
| `classic_laptop.glb`, `clipboard.glb`, `power_box_01.glb`, `wooden_stool_01.glb` | Poly Haven, glTF 1k (karya Arrangemonk; ProgrammerOnCoffee; Rico Cilliers dan Yann Kervran; Rico Cilliers) | CC0 | Tekstur diperkecil ke 512 px (JPEG q4, ffmpeg), lalu `@gltf-transform/cli@4.1.0 optimize --compress meshopt --texture-compress false --simplify-ratio 0.5 --simplify-error 0.002`. Layar laptop diganti tekstur saat dimuat |
| `bahan/plester-*.webp` | Poly Haven `plastered_wall_04`, tekstur 1k | CC0 | 512 px WebP |
| `bahan/wood_table_001-*.webp`, `bahan/plywood-*.webp`, `bahan/metal_plate-*.webp` | Poly Haven, tekstur 1k (warna, normal GL, roughness) | CC0 | 512 px WebP; normal dan roughness dibaca tanpa konversi warna |
| `layar/01-meet.webp`, `layar/05-rancangan.webp`, `layar/06-*.webp`, `layar/08-jeda.webp` | Tangkapan produk asli (lihat `public/assets/cerita/PROVENANCE.md`); `05-rancangan` dari `demo/erp-software-house.mp4` detik 4 | Milik project | WebP |
| `layar/03-format-*.webp` | Bingkai `demo/nds-etl.mp4` detik 5, `demo/pilot-iklan.mp4` detik 5, `layar/yiheecam-hp.webp`, `cerita/layar-05.webp` | Milik project | Dipotong ke rasio sampul tiap format |
| `layar/02-kebutuhan.webp`, `layar/07-kasir-sebelum.webp`, `layar/07-kasir-sesudah.webp` | Rancangan sendiri, HTML di `desain/cerita-v4/layar-kasir/`, dirender Chrome headless. Toko dan angka contoh. Bukan buatan AI | Milik project | WebP q82 sampai q85 |
