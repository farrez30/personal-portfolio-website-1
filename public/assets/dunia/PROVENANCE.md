# Asal aset dunia toko kaset

Dunia 3D di belakang beranda (ADR 0014, fase 1). Ruangan, rak CD, kartu catatan sampul, meja
kasir, pintu, lonceng, dan headphone dibangun dari primitif three.js di
`components/dunia/dunia.js`. Berkas di folder ini:

| Berkas | Asal | Lisensi | Pengolahan |
|---|---|---|---|
| `kayu.webp` | Google Flow, Nano Banana 2.1, akun Google AI Pro Farrez, project "Nov 12 - 14:03", 0 kredit. **Buatan AI.** | Ketentuan Google untuk konten buatan pengguna | PNG 1024 px ke WebP q80 (ffmpeg) |
| `busa.webp` | Sama seperti di atas (`busa-2.png`). **Buatan AI.** | Sama | Diperkecil ke 512 px, WebP q80 |
| `bar_chair_round_01.glb` | Poly Haven, glTF 1k | CC0 | Tekstur diperkecil ke 512 px (JPEG q4, ffmpeg), lalu `@gltf-transform/cli@4.1.0 optimize --compress meshopt --texture-compress false` |
| `hanging_industrial_lamp.glb` | Poly Haven, glTF 1k | CC0 | Sama. Kaca transmission diganti kaca transparan saat dimuat (lihat dunia.js) |
| `portable_cassette_player.glb` | Poly Haven, glTF 1k, karya Mateusz Sadek | CC0 | Sama |

Total 1,0 MB (model 890 KB, tekstur ruangan 118 KB). Bahan aslinya ada di folder catatan sesi
`lab3d/` (12 Nov 2026), dengan PROVENANCE lab yang mencatat prompt Flow dan parameter Hunyuan.

## Yang sengaja tidak dipakai

Headphone Hunyuan3D (`lab3d/hunyuan/b.glb`, Space `tencent/Hunyuan3D-2`) tidak ikut tayang.
Pasal 5(c) Tencent Hunyuan 3D 2.0 Community License (rilis 21 Januari 2025) melarang Output
dipakai atau **ditampilkan** di luar Territory, dan Territory mengecualikan Uni Eropa, Inggris,
dan Korea Selatan (Pasal 1(l)). Situs yang bisa dibuka dari sana masuk area abu-abu, dan AUP
poin 12 mewajibkan konten buatan mesin diberi label yang jelas di halaman. Sumber:
https://raw.githubusercontent.com/Tencent/Hunyuan3D-2/main/LICENSE. Sampai Farrez memutuskan,
headphone di bilik dengar adalah versi prosedural (`buatHeadphone` di dunia.js).
