# Gambar cerita gulir (mode Ringan)

Satu gambar per bab, dipakai saat mode Ringan atau gerak dikurangi. Sejak cerita v4 (13 Nov 2026,
ADR 0016) gambarnya render dari dunia toko kaset three.js yang sama dengan mode Imersif, bukan
styleframe Flow. Bukan buatan AI; layar produk di dalamnya tangkapan asli atau rancangan sendiri
(lihat `public/assets/dunia/PROVENANCE.md`).

- Alat: `scripts/foto-babak.mjs` (Chrome headless, GPU, 1440x900, kanvas dunia saja), posisi gulir
  60% tiap bab, bab rilis 25%.
- Pengolahan: potong 1440x810, perkecil ke 1376x774, WebP q82 (ffmpeg), potong di y 45.
- Dibuat ulang 13 Nov 2026 malam sesudah AO N8AO (ADR 0017).
- Styleframe v3 dan peta kedalamannya dilepas dari situs; riwayatnya di `desain/cerita-v3/`.
