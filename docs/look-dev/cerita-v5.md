# Lembar look-dev: dunia cerita v5 "yang ditimbang"

Skill `farrez:look-dev`. Adegan: cerita gulir v5 arah G (ADR 0019), skin toon dengan outline (ADR 0020).
Menggantikan `docs/look-dev.md` (toko kaset) begitu v5 tayang. Isinya target; DESIGN.md mencatat
yang sudah dikirim. Semua nilai diambil dari previs yang sudah dirender (`desain/cerita-v5/previs/previs.html`).

Status: draf, menunggu Farrez membaca (19 Nov 2026).

## Konteks

| Butir | Isi |
|---|---|
| Cerita dan tema | Isi kepala pembeli yang menimbang: dorongan, harga diam, tarikan, lalu cemas biaya, kelangsungan vendor, ramai, data, kebiasaan tim, langkah kecil. Meja kerja, kota, peta Nusantara, globe malam. |
| Emosi | Ringan, enak dilihat, tenang; serius tanpa menakut-nakuti (JOLT: rasa takut tidak dijual). |
| Pembaca | Pemilik usaha UMKM sampai korporasi, dan tim keuangan atau TI yang diteruskan halaman ini. Harus percaya: studio ini jelas soal biaya, hak, data, dan tahan uji. |
| Tetangga | Teks DOM babak (Schibsted Grotesk, IBM Plex Mono), layar produk nyata di HP/monitor (warna asli), rak bukti proyek (belum diputuskan: CD atau dunia baru). |
| Perangkat terendah | HP Android kelas menengah (contoh Galaxy A55), pixel ratio maks 1,25 di situs sekarang; previs diukur pada DPR 2. |
| Kapan tampil | Dimuat di balik loader; kamera berpindah antarbabak saat digulir (camera blend + motion blur, ADR 0014). |
| Sumber bentuk | Primitif kode semua (kotak, silinder, kapsul, instanced). Tidak ada GLB luar. Peta dari Natural Earth, lampu kota dari NASA Black Marble (`previs/data/PROVENANCE.md`). |

## Gaya

- Gaya utama: **toon atau cel-shaded dengan garis tinta, kamera perspektif** (Farrez, 19 Nov 2026).
- Alasan dari konteks: ringan dan mudah dibaca awam; benda primitif kode cocok dengan bentuk besar bersih; tanpa IBL dan tone mapping lebih murah di HP.
- Ditolak: isometrik flat ("terlalu seperti diagram", kata Farrez), low-poly flat (kurang khas, dimensi hanya dari bayangan), clay (berat dan gelap).
- Campuran yang disengaja: layar produk di HP dan monitor memakai `MeshBasicMaterial` dengan gambar asli, tanpa ramp, supaya warnanya jujur. Globe malam memakai tekstur peta yang digambar (bukan toon) karena dilihat sebagai satu bidang.
- Referensi: designed-to-scale.vercel.app (blok pastel, garis tinta, kertas bertitik), resource pack Adventure Time Craft (warna rata, bentuk bersih), globe GitHub dan Shopify (data nyata di globe), NASA Black Marble (lampu kota).
- Pilar:
  1. Satu benda, satu warna pastel rata; dimensi dari tiga tingkat terang, bukan gradasi.
  2. Setiap benda bergaris tinta; garis dari layar (depth dan normal), tebal seragam.
  3. Merah hanya untuk objek persisten (nota, ruko klien, garis koneksi) dan satu aksen per babak.
  4. Benda makro harus langsung dikenali awam: kota punya jalan, atap, pohon; globe punya benua dan laut.
  5. Malam berarti langit biru tua berbintang dan teks terang; siang berarti kertas krem dan teks gelap.

## Palet dan nilai

| Peran | Hex | Catatan |
|---|---|---|
| Latar siang | `#f3ece0` | kertas krem, lantai bertitik `#efe6d4` titik `#d6c9b2` tiap 20 cm |
| Latar malam | `#1f2440` | 900 bintang `#fff1d6` 2 px |
| Dinding | `#eadfca` | |
| Meja kayu | `#f2d49b` | |
| Map dan bangunan | `#a9c4ec` biru, `#b9dcb0` hijau, `#cdb8e8` ungu, `#fffaf0` putih, `#f2d49b` kuning | dipetakan dari warna clay lewat `PALET` |
| Atap, kulit orang | `#f2b8a0` | |
| Logam (timbangan) | `#f6c76b` | |
| Benda gelap (monitor, kursi, jalan) | `#4b4a5c` | |
| Laut globe | `#2b3656` | daratan `#454459`, garis pantai `#8a9ab8` 2,5 px, lampu kota kuning hangat |
| Aksen objek persisten | `#b8322a` untuk nota (toon), `#e0574b` untuk garis dan ruko | nota lebih gelap supaya lolos cek nilai |
| Garis tinta | `#2a2836`, opasitas 92% | |
| Bayangan toon | ramp `[150, 212, 255]` | bayangan = 59% terang dasar, tidak dipilih per material |

- Rentang nilai (diukur di render dorongan, skala 0 sampai 255, 19 Nov): nota merah Y 97, piring kuning Y 190, dinding Y 209, rata-rata bingkai Y 204. Sebelum nota digelapkan, nota dan piring hampir sama di abu-abu.
- Saturasi maksimum: pastel di bawah 45% HSL, kecuali aksen merah.

## Bentuk dan detail

- Shape language: kotak dan silinder dengan proporsi besar, tanpa bevel; orang berupa kapsul dan bola. Tidak ada tekstur noise.
- **Diperbarui 20 Nov 2026** (masukan Farrez: benda terlalu basic): tekstur dan palet tetap, bentuk ikut `desain/cerita-v5/riset-bentuk-prop.md`. Benda keras berbevel 8 sampai 15% sisi terpendek, benda ramah 25 sampai 50%; 1 bentuk primer, 2 sampai 4 sekunder, 3 sampai 8 tersier, sekitar 70% permukaan polos; detail terkecil paling sedikit 1/20 dimensi terbesar dan 8 px di HP; bagian yang disentuh tangan 1,5 sampai 2 kali ukuran nyata; kepala robot dan astronot 40 sampai 55% tinggi.
- Anggaran segitiga: adegan meja di bawah 15 ribu, kota di bawah 250 ribu (terukur 221 ribu), globe di bawah 80 ribu (terukur 75 ribu).
- Texel density: tidak ada tekstur albedo; layar produk 1 px per 0,5 mm.
- Tekstur maksimum: layar produk 1024 px (HP 512), peta globe 4096 x 2048 desktop, 2048 x 1024 HP; peta Nusantara 4096.

## Tekstur dan bahan

| Peta | Dipakai? | Color space | Sumber |
|---|---|---|---|
| Albedo / base color | tidak (warna rata), kecuali lantai bertitik | sRGB | kanvas |
| Normal | tidak | | |
| Roughness / metalness | tidak | | |
| AO | tidak | | |
| Gradient map (toon) | ya, `DataTexture` 3 x 1 `RedFormat` | NoColorSpace, NearestFilter | kode |
| Matcap | tidak | | |
| Emissive | layar dan lampu (`MeshBasicMaterial`) | sRGB | gambar layar proyek nyata |

- Material three.js: `MeshToonMaterial` + ramp; layar `MeshBasicMaterial`; peta globe `MeshBasicMaterial` dengan tekstur kanvas.
- Dimatikan: IBL/PMREM, transmission, clearcoat, sheen, tone mapping.
- Format kirim: tekstur peta dan layar sebagai WebP yang dibuat saat build (bukan kanvas di HP); KTX2 ETC1S bila ukuran perlu ditekan.

## Cahaya dan environment

- Rig: hemisphere `#ffffff` atas, `#e6dccb` bawah, intensitas 1,4, ditambah satu directional putih (kunci) dengan bayangan. Lampu titik adegan dikali 0,25 supaya tidak membuat gradasi.
- HDRI: tidak ada.
- Bayangan: hanya directional kunci, PCF soft, peta 2048 (kota 4096), `normalBias` 0,012, bias -0,0004. Meja, lantai, dan benda di meja melempar dan menerima.

## Warna akhir dan post

- `outputColorSpace`: SRGBColorSpace.
- Tone mapping: `NoToneMapping` (ramp sudah menentukan terang).
- Grade: tidak ada.
- Urutan pass: pass normal + depth (`MeshNormalMaterial` override, tanpa titik, garis, sprite, dan instanced dasar), pass warna ke target HalfFloat MSAA 4, lalu quad tepi: 8 sampel pada jarak 1,5 px desktop dan 1,6 px HP; tepi depth `smoothstep(0.006, 0.02, |d - d0| / min(d, d0))`; tepi normal `smoothstep(0.25, 0.45, 1 - dot(n, n0))`; warna tinta dicampur 92%.
- Rentang depth: `near` = 2% jarak kamera ke sasaran, `far` = 12 kali (globe 30 kali), supaya tepi depth tidak bergerigi.
- Efek lain: motion blur antarbabak tetap dari dunia sekarang; tanpa bloom, vignette, grain.
- Yang dimatikan di HP: MSAA turun ke 2 sampel bila p95 di atas anggaran; bayangan kota dimatikan.

## Blok gaya untuk generator

```
flat cel-shaded 3D illustration, pastel blue, green, purple, cream and warm yellow, three-tone
toon shading with crisp dark ink outlines of even width, no texture noise, clean simple rounded
forms, soft cream paper background with a faint dot grid, a single red accent object, gentle
daylight, no photorealism, no gradients, no glossy reflections
```

## Anggaran performa

Terukur 19 Nov 2026 di Chrome headless GPU (RX 6700 XT desktop, ANGLE D3D11), emulasi HP 390 x 844
DPR 2, CPU 4x lebih lambat. GPU desktop jauh lebih kuat dari HP: angka GPU hanya pembanding antaradegan;
draw call dan CPU yang relevan.

| Ukuran | Batas | Terukur (HP emulasi) |
|---|---|---|
| Draw call per bingkai | 100 | dorongan 285 (gagal), data 164 (gagal), kebiasaan 109, tarikan 117, kelangsungan 100, harga diam 97, sisanya 23 sampai 47 |
| Segitiga | 250 ribu | kota 221 ribu, globe 75 ribu, meja di bawah 11 ribu |
| Bingkai median / p95 (ms) | 16 / 33 | dorongan 10,1 / 17,5; data 4,2 / 11,3; sisanya di bawah 5,2 / 16,5 |
| Bingkai pertama (kompilasi + unggah, ms) | 150 per adegan | 90 sampai 187 meja dan kota; peta 302, globe 403 (gagal: tekstur kanvas dibuat di HP) |

Perbaikan wajib sebelum build: map dan benda kecil berulang digabung (`mergeGeometries`) atau di-instance;
peta Nusantara dan globe dipanggang jadi WebP saat build; adegan dipanaskan di loader satu per bingkai.
Perbandingan: outline image-space memakai draw call 1,6 sampai 2 kali clay, setara outline hull.

## Cek per aset

| Aset | Clay | Nilai | Siluet | Berdampingan | Warna asli | Performa | Catatan |
|---|---|---|---|---|---|---|---|
| Timbangan + nota | lolos | lolos setelah nota `#b8322a` | lolos setelah map dan monitor digeser (balok berlatar dinding) | lolos | tidak relevan | lolos | objek persisten |
| Tumpukan map | lolos | lolos | menyatu dengan meja (wajar) | lolos | | gagal draw call | gabung geometri |
| Kota | lolos (setelah dibangun ulang) | lolos | lolos (siluet kota terbaca) | lolos | | lolos | ruko klien merah perlu ditonjolkan di build (sekarang tertutup gedung di bidikan desktop); F4: gedung klien di tepi blok menghadap taman, atap merah, garis pandang dikunci tes |
| Globe malam | lolos | lolos (laut Y sekitar 45, lampu Y di atas 200) | lolos | lolos | | lolos setelah dipanggang (F5: 63 ms HP) | tekstur WebP dari `scripts/panggang-peta.mjs`; 22 satelit klien dan stasiun di orbit |
| Peta Nusantara | | | | lolos | | lolos (F5: 41 ms HP) | bidang sampai 90 LS supaya tepi bawah HP tidak kosong |
| Orang (kapsul) | lolos | lolos | lolos | lolos | | lolos | bentuk masih blockout |
| Layar produk | | | | | dari gambar asli | | belum diisi layar proyek nyata |

## Riwayat keputusan

- 2026-11-19: skin toon dengan outline, kamera perspektif (ADR 0020). Outline image-space menggantikan
  inverted hull karena hull belang di silinder bersudut tajam. Nota digelapkan ke `#b8322a` setelah cek
  nilai. Map dan monitor di babak dorongan digeser setelah cek siluet.
- 2026-11-20: bumi orbit (ADR 0025). Pengecualian disengaja dari aturan anak tangga toon, khusus
  cahaya: peralihan siang-malam halus `smoothstep(-0.16, 0.06, mu)` dengan rona jingga di garis
  terbit, sisi malam hampir hitam, awan beralfa bergradasi, lampu kota Black Marble tanpa ambang
  keras. Darat (Blue Marble dipadatkan ke tangga pastel), laut, garis pantai vektor, dan benda tetap
  toon. Alasannya permintaan Farrez: garis senja dan lampu malam harus serealistis versi Cesium.
- 2026-11-23: F5. Peta Nusantara dan bumi malam dipanggang ke WebP pangkat dua (peta 4096 x 2048
  desktop, 2048 x 1024 HP; bumi sama), didekode di luar utas utama dan diunggah saat senggang. Peta
  memakai bahan dasar `MeshBasicMaterial` bertekstur, titik kota toon; globe tanpa busur ke kota dunia
  (belum ada klien di sana), satelit klien toon di tiga orbit.
