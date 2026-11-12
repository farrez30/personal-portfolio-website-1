# Aset rak

- `lingkungan.webp`: PMREM lingkungan pantul rak (studio gelap dengan empat pita putih), dibuat
  sendiri dari kanvas di `components/imersif/lingkungan.js` lalu dipanggang dengan
  `node scripts/panggang-lingkungan.mjs` (Chrome headless, three 0.187). Atlas 1536x504: enam muka
  kubus 256 px berdampingan, enam tingkat mip bertumpuk, sRGB 8 bit, WebP lossless. Panggang ulang
  bila gambar kanvasnya atau versi three berubah (tingkat mip mengikuti LOD_MIN PMREMGenerator).
