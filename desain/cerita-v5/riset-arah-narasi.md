# Riset arah narasi cerita v5

19 Nov 2026. Permintaan Farrez: cari analogi sehari-hari yang lebih cocok dengan pekerjaannya
(membangun sistem dan aplikasi untuk usaha) daripada toko kaset, dengan perpindahan adegan secara
makro yang berakhir dengan zoom out ke dunia yang saling terhubung. Contoh idenya: listrik dan
pembangkit, perumahan, sumber daya, jaringan internet, atau alur nyata membuat aplikasi.

Tiga subagen riset (Fable 5.2, effort medium) ditambah penyisiran referensi lokal. Label:
**D** sumber primer atau dokumentasi yang dibaca, **P** praktisi, **I** inferensi,
**(cuplikan)** hanya terlihat di ringkasan hasil pencarian. Semua skor di bawah adalah inferensi
peneliti dan belum diuji ke pemilik usaha sungguhan.

Sketsa storyboard: `pratinjau/papan-a.png` sampai `papan-d.png` (dibuat dari `pratinjau/sketsa.mjs`,
data per panel di `pratinjau/arah.json`).

## 1. Yang dikatakan riset tentang analogi

| Klaim | Label | Sumber |
|---|---|---|
| Metafora berguna untuk memunculkan pertanyaan, berbahaya bila dipakai membenarkan jawaban; metafora konstruksi memisahkan desain dari pembangunan | P | Fowler, martinfowler.com/bliki/MetaphoricQuestioning.html (2004) |
| Software terus dirawat dan berubah, bangunan tidak; Atwood memilih metafora kebun | P | Atwood, blog.codinghorror.com/tending-your-software-garden (2008) |
| Urutan kerja konstruksi lahir dari batasan fisik yang tidak ada di software | P | Shore, jamesshore.com/v2/blog/2005/that-damned-construction-analogy |
| Analogi konstruksi menyiratkan perubahan mahal dan dokumen terkunci | P | Saunders, capgemini.github.io/agile/agile-analogies (2014) |
| McConnell tetap memilih konstruksi karena menyiratkan persiapan matang | P (cuplikan) | Code Complete 2, bab 2 (O'Reilly 403) |
| Metafora konseptual memakai pengalaman fisik langsung untuk memahami hal abstrak, dan hanya menyorot sebagian konsep | I | Lakoff dan Johnson 1980, lewat Wikipedia |
| Yang dipetakan analogi adalah peran relasional, bukan kemiripan permukaan; analogi harus menimbang pengetahuan awal pembaca | I (cuplikan) | Gray dan Holyoak 2021, doi 10.1111/mbe.12288 |
| Bank copy: satu metafora lokal yang langsung terbayang (Jago: kantong) | P | coderoach-referensi-panduan/docs/bank-copy/gaya.md |

Keakraban pembaca di Indonesia:

| Data | Label | Sumber |
|---|---|---|
| 229,4 juta pengguna internet, penetrasi 80,66% (APJII 2025) | I (pihak ketiga dibaca) | detikInet, 6 Agu 2025 |
| 96,2 juta pelanggan PLN akhir 2025, 87,4 juta rumah tangga; porsi prabayar tidak ditemukan | I (pihak ketiga dibaca) | listrikindonesia.com |
| Lebih dari 39,7 juta merchant memakai QRIS, 93% UMKM | I (pihak ketiga dibaca) | Republika/ANTARA, 15 Agu 2025 |
| Volume paket harian khusus Indonesia | tidak ditemukan | angka J&T 26,5 juta/hari tidak jelas wilayahnya |

Kesimpulan yang dipakai (I): pilih sumber analogi yang dialami langsung oleh pembaca (toko, paket,
listrik di rumah), bukan yang hanya pernah didengar (kabel bawah laut, menara ATC). Analogi hanya
pintu masuk; bukti tetap dari proyek nyata di rak, sesuai peringatan Fowler.

## 2. Taksonomi analogi (14 kandidat ditambah opsi apa adanya)

Skor 1 sampai 5, makin tinggi makin baik. C = cocok dengan 10 babak, J = jelas bagi orang awam,
O = punya objek persisten alami, Z = bisa zoom out ke skala dunia, K = tidak klise.

| Analogi | C | J | O | Z | K | Catatan utama |
|---|---|---|---|---|---|---|
| Usaha pembaca sendiri (toko, gudang, cabang) + apa adanya | 5 | 5 | 5 | 4 | 4 | babak andal dan aman jadi literal; risiko mirip iklan aplikasi kasir |
| Membangun rumah atau ruko | 5 | 5 | 3 | 3 | 1 | paling klise, dikritik empat praktisi; babak andal dipaksakan |
| Penjahit baju ukur | 4 | 5 | 4 | 2 | 4 | paling tepat untuk "dibuat pas", tidak sampai skala dunia |
| Perjalanan satu paket | 3 | 5 | 5 | 5 | 3 | terkuat untuk progres (lacak resi), lemah di babak membangun |
| Air (PDAM, toren, keran) | 3 | 4 | 5 | 4 | 4 | toren adalah padanan offline lalu sinkron paling pas |
| Listrik (pembangkit, gardu, rumah) | 3 | 4 | 4 | 5 | 3 | zoom terbaik secara visual; padam identik keluhan ke PLN |
| Dapur warung atau katering | 4 | 4 | 4 | 2 | 3 | stasiun per peran alami; zoom berhenti di ruang makan |
| Kapal pinisi dan pelayaran | 4 | 3 | 4 | 5 | 4 | romantis, jauh dari keseharian pemilik usaha darat |
| Pelabuhan peti kemas | 2 | 2 | 5 | 5 | 4 | hanya kuat di progres, aman, rilis |
| Sawah dan subak | 3 | 4 | 4 | 3 | 4 | kesan lambat dan bergantung cuaca |
| Kopi atau nasi dari lahan ke meja | 2 | 4 | 5 | 4 | 3 | rantai produk massal, bukan pesanan khusus |
| Bengkel dan mobil | 3 | 4 | 4 | 3 | 3 | bengkel berarti memperbaiki yang rusak |
| Jaringan internet itu sendiri | 2 | 2 | 4 | 5 | 4 | menjelaskan teknis dengan teknis; cocok sebagai adegan penutup |
| Kota, kereta, bandara | 3 | 3 | 2 sampai 4 | 4 sampai 5 | 3 sampai 4 | kesan proyek pemerintah; lebih berguna sebagai lapisan zoom |
| Tubuh, orkestra, produksi film | 2 sampai 3 | 3 | 2 sampai 3 | 2 | 3 sampai 4 | orkestra masih dunia musik yang mau ditinggalkan |

Pola umum (I): tidak ada satu analogi yang alami di 10 babak sekaligus punya objek bergerak dan
zoom global. Gabungan "tempat yang dibangun" dengan "benda yang berjalan" menutup keduanya.

## 3. Situs dengan narasi makro dan globe

Tidak ditemukan pemenang Awwwards, FWA, atau CSSDA yang narasinya persis "detail kecil ke kota ke
globe" (pencarian ke thefwa.com dan cssdesignawards.com tidak mengembalikan halaman). Yang paling dekat:

| Situs | Penghargaan | Teknik yang dipinjam | Label |
|---|---|---|---|
| Galaxy Portfolio, discourse.threejs.org/t/82229 | tidak ada | 7 adegan per skala (galaksi ke kamar); tiap adegan dirender ke buffer 1x1 saat loading supaya shader siap | D |
| INTFRAME "A Planet in a Browser Tab", dev.to/intframe | tidak ada | kamera great-circle, citra bumi kasar plus tambalan detail di 4 kota, 1,5 MB, governor resolusi | D |
| GitHub globe, github.blog | tidak dicek | 12.000 titik instanced tanpa tekstur, arc Bezier dibuka dengan setDrawRange, 4 tingkat mutu | D |
| Stripe globe, stripe.com/blog/globe | tidak dicek | 20.000 titik spiral, `antialias: false` yang menyelamatkan layar resolusi tinggi | D |
| Shopify BFCM 2023, shopify.engineering | tidak dicek | puluhan ribu arc dalam satu draw call, kurva di vertex shader; HP kewalahan di atas 1.000 arc tanpa instancing | D |
| Igloo Inc | SOTD 23 Jul 2024 (D), Webby 2026 (D), SOTY 2024 (cuplikan) | **bukan** zoom makro: transisinya efek layar (chromatic aberration, frost) | D |
| NASA Great Zooms, svs.gsfc.nasa.gov | rujukan teknik | lapisan citra bersarang dengan registrasi posisi dan warna supaya pergantian tak terlihat | D |
| Mapbox storytelling, github.com/mapbox/storytelling | BSD-3 | bab = keadaan kamera; `jumpTo` untuk jarak jauh | D |
| Scale of the Universe, If the Moon Were Only 1 Pixel (Webby 2014) | | satu kendali untuk satu sumbu skala; jarak dirasakan lewat lama menggulir | D |
| SkyFi (Webby 2023 Best Homepage) | D | globe dengan satelit, zoom masuk ke lokasi | D |
| Zoomquilt | | 46 gambar bersarang 50%, infinite zoom paling murah | D |

Referensi lokal yang cocok:
- Galeri pola `coderoach-referensi/demo/pola`: 35 zoom parallax, 36 portal zoom-through, 53 camera
  path, 55 persistent object showcase, 56 instanced field.
- Bank Codrops (`data/codrops/item.json`): "More Than a Portfolio: Building a Scroll-Driven 3D World
  with Something to Say" (2026, pola 55, level 5), "How to Create a Globe and Add Cities using
  Three.js" (2021), "Building a Layered Zoom Scroll Effect" (2025, pola 35), "Telescope Zoom
  Animation on Scroll" (pola 35, aman di HP).

## 4. Cara teknis yang ringan di HP

Rekomendasi (I, dari sumber D di atas):
1. **Zoom bertahap dengan serah terima**, bukan satu dunia berskala nyata. Meja 1 m sampai bumi
   6.371 km adalah rentang 10^7, di luar presisi float32 dan depth 24-bit. Pakai 3 sampai 4 tahap
   (toko, kota, Nusantara, globe) dalam satuan lokal; di tiap ambang, tahap lama mengecil jadi satu
   titik di tahap baru, crossfade 0,3 sampai 0,5 detik gulir ditutup motion blur yang sudah ada.
   Ini sejalan dengan camera blend yang sudah dipilih (ADR 0014, memori transisi-kamera-sederhana).
2. **Jangan `logarithmicDepthBuffer`**: opsi konstruktor renderer (ikut ke seluruh adegan),
   mematikan early-Z; satu laporan forum 65 ke 35 fps di desktop (P).
3. **Globe ditulis sendiri** di atas three 0.187 yang terpasang: titik darat dibuat saat build dari
   Natural Earth 110m (domain publik, D) jadi Float32Array 32 sampai 96 kB, satu draw call `Points`;
   arc dalam satu InstancedBufferGeometry dengan kurva di vertex shader; pulsa lewat satu uniform
   waktu; satelit 6 sampai 12 instance. Target 5 sampai 7 draw call, di bawah 80 ribu segitiga,
   nol lampu, nol bayangan.
4. **Pemanasan**: `compileAsync` saja tidak cukup; render pemanasan lewat jalur composer yang sama,
   satu program per bingkai (P). Ini sama dengan pelajaran beku 2 detik di audit 19 Nov.
5. **Pixel ratio 1,5 untuk tahap globe** (GitHub turun ke 1,5), antialias mati.
6. **Rute kabel bawah laut digambar sendiri**: data TeleGeography berlisensi komersial (cuplikan).

Library: three-globe (MIT, 156 kB gzip, 17 dependensi) terlalu berat; globe.gl membawa renderer
sendiri; cobe (MIT, sekitar 5 kB) ringan tapi konteks WebGL terpisah dari three.js. Menulis sendiri
tidak menambah dependensi.

## 5. Empat arah storyboard

Diukur dengan kerangka yang diminta: cocok dengan 10 babak dan bukti proyek, jelas bagi orang
awam, objek persisten, biaya HP, risiko klise.

| | A. Satu nota | B. Ruko jadi kota | C. Stopkontak sampai satelit | D. Satu paket |
|---|---|---|---|---|
| Inti | usaha pembaca sendiri, apa adanya | membangun tempat usaha, lalu tersambung ke kota | listrik dan sinyal di toko (ide awal Farrez) | perjalanan satu pesanan |
| Objek persisten | nota merah yang jadi titik data | kabel merah dari meteran ruko | pulsa cahaya merah di kabel | paket merah dan resinya |
| Cocok 10 babak | 5: semua babak literal | 4: babak andal meminjam toren dan genset | 3: rencana, bangun, rapi dipaksakan | 3: ide, fondasi, bangun dipaksakan |
| Bukti proyek | langsung: kasir, gudang, distributor, offline (Jeda, NDS, ERP) | tidak langsung | tidak langsung | progres dan andal saja |
| Jelas bagi awam | 5 | 5 | 4 | 5 |
| Zoom global | toko, kota, Nusantara, globe | ruko, blok kota, pulau, globe | stopkontak, gardu, pembangkit, peta lampu, satelit | gudang, rute Nusantara, globe |
| Biaya HP | sedang: interior toko detail, 3 serah terima | sedang sampai berat: bangunan dan kota | ringan sampai sedang: garis bercahaya murah | ringan sampai sedang |
| Risiko klise | rendah sampai sedang: mirip iklan aplikasi kasir | tinggi: analogi software paling umum | sedang: padam terdengar seperti keluhan PLN | sedang: bahasa visual iklan e-commerce |
| Rekomendasi | **ya** | | | |

Kenapa A direkomendasikan (I): satu-satunya arah yang tidak perlu diterjemahkan pembaca. Babak 8
(listrik padam, kasir tetap jalan) dan babak 9 (kasir, gudang, pemilik) sudah literal dan sudah jadi
isi teks v4 dari riset kendala usaha (memori teks-cerita-keadaan-umum). Zoom ke Nusantara
menceritakan hal yang memang dikerjakan: distributor dan cabang yang tersambung. C bisa dipinjam
sebagai lapisan penutup (satelit dan kabel bawah laut di globe A).

Kapan A salah: bila Farrez ingin halaman terasa sinematis dan "ajaib" lebih dulu daripada jelas;
di situ C lebih kuat secara visual.

## 6. Yang terdampak bila arah berganti (I)

- `components/dunia/` (toko kaset, props 10 babak) dan `components/imersif/` harus dirombak atau
  diganti; ini keputusan signifikan dan perlu ADR baru yang menggantikan ADR 0014 dan 0016.
- DESIGN.md menyebut konsep "rak toko kaset untuk karya"; rak CD koleksi proyek, loader CD, dan
  kotak CD bisa dipertahankan sebagai tempat bukti (penutup tiap arah masuk ke rak), atau ikut
  diganti. Ini pertanyaan kedua untuk Farrez.
- Teks judul babak tetap (nada B pilihan Farrez 11 Nov); isi babak disesuaikan dengan adegan arah
  yang dipilih lewat skill `bahasa-lisan`.

## 7. Belum terverifikasi

- Tidak ada riset yang menguji analogi mana yang paling dipahami pemilik usaha Indonesia; semua skor inferensi.
- Halaman yang dibaca lewat alat fetch dirangkum; kutipan perlu dicocokkan ulang sebelum dipakai ke luar.
- Igloo sebagai SOTY 2024 hanya dari cuplikan (halaman tahunan 404).
- Tidak ada angka performa di Galaxy A55; semua anggaran (draw call, segitiga, pixel ratio) harus diukur di perangkat.
- Repo galaxy-portfolio dan intframe/scroll-rig belum dibuka; lisensinya belum dicek.
- Sketsa adalah gambar garis tangan, bukan render previs; framing kamera final ditentukan setelah arah dipilih.

## 8. Keputusan Farrez, 19 Nov 2026

- **Arah A, satu nota**, dipilih (kemudian digantikan arah G, lihat `tantangan-narasi.md` dan ADR 0019) lewat pertanyaan terstruktur. Alasannya, dalam kata Farrez:
  "Ceritanya sama dengan yang memang saya kerjakan: kasir, gudang, cabang, dan distributor yang
  tersambung."
- **Satelit tetap ada di akhir** (permintaan Farrez sesudah memilih). Penutup A sekarang zoom out
  sampai ketinggian orbit: globe dengan garis dari Indonesia, satelit mengorbit dan memantulkan
  sinyal, lalu kamera masuk ke rak. Biayanya kecil: 6 sampai 12 satelit dalam satu draw call
  (bagian 4). Sketsa: `pratinjau/papan-a.png`, panel penutup.
- **Rak CD dan loader CD: diputuskan nanti**, setelah storyboard previs arah A jadi.
- ADR: `docs/decisions/0018-story-v5-one-receipt-in-the-readers-own-shop.md`.

Langkah berikutnya: storyboard previs arah A (render dari dunia three.js uji atau styleframe di
kanvas, sesuai memori storyboard-di-pen-dev-dulu), lalu persetujuan, baru kode.
