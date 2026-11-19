# Isi modul lab satelit: transisi, benda, interaksi

20 Nov 2026. Permintaan Farrez: rujukan yang bagus dan indah untuk kumpulan portofolio di dalam
modul satelit, termasuk transisi, benda, dan interaksi di dalamnya ("dll"), supaya mulus dan halus.
Keputusan arah: ADR 0024.

Label: **D** sumber dibaca, **P** praktisi dibaca, **I** cuplikan pencarian atau inferensi.

## 1. Kerangka kelengkapan

- Alur tugas masuk, jelajah, pilih, buka, kembali, dipetakan ke mantra Shneiderman: overview, zoom
  and filter, details on demand (I).
- Taksonomi UI diegetik Fagerholt dan Lorentzon 2009 (diegetic, spatial, meta, non-diegetic). Daftar
  HTML adalah lapis non-diegetik yang efisien, loker adalah lapis diegetik (I, tesis tidak terbaca utuh).
- WCAG 2.2 (2.2.2 Pause Stop Hide, 2.3.3 Animation from Interactions) dan pola WAI-ARIA APG (D).
- Daftar cek kinerja three.js di HP (P).
- Lapisan "ruang hidup": gerak mikro, suara, cahaya, label.

## 2. Benda dari modul sungguhan

| Temuan | Sumber | Label |
|---|---|---|
| Destiny: 24 posisi rak (13 sains, 11 sistem), jendela WORF untuk memandang bumi | [NASA](https://www.nasa.gov/international-space-station/destiny-laboratory-module) | D |
| Kibo: enam rak berjajar per dinding di empat sisi, jadi terbaca sebagai lorong berdinding rak | [JAXA](https://iss.jaxa.jp/en/about/kibo/jpm) | D |
| Rak EXPRESS memuat loker middeck (tunggal, ganda, quad) dan laci; satu rak sampai 10 muatan kecil. Padanan nyata "satu loker satu proyek" | [ISS National Lab](https://issnationallab.org/?p=42273) | D |
| Posisi loker berlabel L1 sampai L8 | [NTRS](https://ntrs.nasa.gov/api/citations/20140010107/downloads/20140010107.pdf) | I |
| Tiap barang di ISS punya barcode, ada tas "lost and found" dan poster "Wanted" untuk barang hilang | [NASA 2017](https://www.nasa.gov/mission_pages/station/research/payload_stowage) | D |
| Lampu LED interior berganti warna dan intensitas mengikuti siklus 24 jam | [NASA 2021](https://www.nasa.gov/missions/station/nasa-research-boosts-led-lamps-for-home-and-garden/) | D |
| Velcro, pegangan tangan, bungee, dan tali menahan benda dan kru | [NTRS](https://ntrs.nasa.gov/api/citations/20130013008/downloads/20130013008.pdf) | I |
| Salyut 6 memakai warna pastel lembut; warna yang tepat menurunkan stres kru | [Jiang dkk. 2021](https://eprints.whiterose.ac.uk/178224/1/Jiang_Foing_Schlacht_Yao_Cheung_Rhodes%20-%20Applied%20Ergonomics%20-%20accepted%20Aug%202021.pdf) | I |
| ISS mengorbit tiap sekitar 90 menit | [NASA](https://www.nasa.gov/international-space-station/space-station-facts-and-figures/) | D |
| Di Gravity, interior ISS dibangun dari foto sungguhan, letak prop disunting demi cerita; benda nol-g tidak melambat | [fxguide 2013](https://www.fxguide.com/?p=46873) | P |

## 3. Rujukan cara mengalami ruang

| Temuan | Sumber | Label |
|---|---|---|
| Proyek di dunia 3D bisa diklik, digulir, keyboard, sentuh; HP memakai preset rendah; satu bunyi klik dengan pitch bervariasi | [Bruno Simon 2026](https://www.awwwards.com/brunos-portfolio-case-study.html) | P |
| Alien: Isolation memisahkan menu yang ringkas dan efisien dari layar di dunia yang sengaja kuno | [Art of the Title](https://www.artofthetitle.com/title/alien-isolation/) | P |
| Lift di Mass Effect terasa imersif hanya kalau singkat; yang lama jadi keluhan | [Kotaku](https://kotaku.com/mass-effect-2-has-shorter-elevator-rides-5194793) | I |
| Prey: stasiun terasa nyata karena benda sesuai fungsi tempatnya dan arsitekturnya punya sejarah | [Game Developer 2017](https://gamedeveloper.com/design/designing-i-prey-i-s-sci-fi-space-station-to-be-like-a-mega-dungeon-) | P |
| Moon (2009): robot GERTY yang sederhana dan ekspresif membuat ruang hidup | [Typeset in the Future](https://typesetinthefuture.com/2014/02/11/moon/) | I |
| Scrolljacking membingungkan, terutama di HP; navigasi yang selalu terlihat jadi jalan keluar | [NN/g 2023](https://www.nngroup.com/articles/scrolljacking-101/) | D |
| Gerak yang mulai mendadak merebut perhatian; onset yang halus tidak | [Abrams dan Christ 2003](https://pubmed.ncbi.nlm.nih.gov/12930472/); [Sunny dan von Mühlenen 2018](https://link.springer.com/article/10.3758/s13414-018-1548-1) | I |
| Gerak latar lebih dari 5 detik yang mulai sendiri wajib bisa dijeda | [WCAG 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) | D |
| Dialog: fokus masuk, Escape menutup, fokus kembali ke pemicu | [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) | D |
| Cermin DOM disinkronkan dua arah dengan kanvas, aksi diumumkan lewat live region | [Figma 2026](https://www.figma.com/blog/building-accessibility-into-a-canvas-based-product/) | P |
| Suara web baru bisa jalan setelah gestur pengguna | [Chrome Developers](https://developer.chrome.com/blog/web-audio-autoplay) | D |
| HP: target di bawah 100 draw call, InstancedMesh, satu atlas tekstur, DPR dibatasi | [Utsubo 2026](https://www.utsubo.com/blog/threejs-best-practices-100-tips) | P |

## 4. Rancangan yang direkomendasikan

| Bagian | Rekomendasi | Alternatif |
|---|---|---|
| Masuk | rel kamera tanpa putus dari globe sampai jendela, pergantian adegan disembunyikan di kusen | lewat palka (lebih panjang, narasi jendela hilang) |
| Bergerak di lorong | gulir biasa menggerakkan kamera di rel lurus, lorong pendek 3 sampai 4 layar, snap lembut hanya di desktop | kamera diam dan rak bergeser; atau satu bidikan lebar tanpa gerak |
| Memilih | daftar HTML jadi pengendali, loker padanannya menyala lembut (150 sampai 250 ms, tanpa kedip) | sorot langsung di 3D (tidak ada hover di HP) |
| Membuka proyek | kamera mendekat 0,6 sampai 0,9 s, loker meluncur keluar 0,4 s dengan ayunan nol-g, kartu HTML tumbuh dari loker jadi panel, URL per proyek | kartu 3D berteks WebGL (tidak terbaca pembaca layar); pindah halaman biasa |
| Kembali | animasi dibalik lewat Tutup, Escape, atau Back, fokus kembali ke daftar; tombol Berikutnya di panel | potong langsung (bawaan saat reduced motion) |
| Gerak mikro | paling banyak tiga: bumi berputar di jendela, satu tas kargo tertambat melayang pelan, lampu indikator "bernapas"; sudah berjalan sejak awal, berhenti saat panel terbuka, ada tombol jeda | robot kecil atau astronot (lebih hidup, merebut perhatian, aset mahal); statis |
| Suara | mati bawaan, tombol suara: dengung kipas pelan dan bunyi kait loker | tanpa suara |
| HP | satu InstancedMesh loker, atlas label, bayangan dipanggang, dua preset kualitas, diukur di HP sungguhan | gambar diam untuk HP lemah |
| Aksesibilitas | daftar HTML sumber kebenaran, kanvas aria-hidden, reduced motion mengganti gerak kamera dengan potongan | cermin DOM di atas tiap loker |

Motif label dari ISS sungguhan: kode loker L1 sampai L8, barcode kecil, Velcro, pegangan tangan.
Durasi di atas adalah inferensi dan harus diuji dengan lembar kontak per 0,05 detik.

Tidak terverifikasi: teks utuh Fagerholt dan Lorentzon serta Bartram dkk., artikel Codrops (403),
ukuran dalam penampang Destiny, palet tujuh warna Columbus (berbayar).
