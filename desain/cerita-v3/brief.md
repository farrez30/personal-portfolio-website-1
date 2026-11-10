# Brief kreatif: cerita gulir v3 "dari ide sampai masuk rak"

10 Nov 2026. Tahap pra-produksi. Belum ada kode. Disetujui Farrez di pen.dev dulu, baru animatic.

## Masalah

Versi 1 (PR #41) dan 2 (PR #43) dinilai Farrez belum memperlihatkan **proses**: dari sesuatu yang
abstrak, lalu mengalir mulus ke tahap-tahap berikutnya, sampai barang jadi masuk rak satu per satu
dan rak terbuka menjadi seksi rak proyek. Hasil masih terasa mentah (tanpa tekstur, skin, filter).

## Pembaca

Pemilik usaha, perusahaan besar, dan recruiter yang ingin tahu: bagaimana Farrez mengubah
kebutuhan yang masih kabur menjadi sistem yang dipakai tiap hari, dan apakah prosesnya terbuka,
aman, andal, bisa membesar, dan berinfrastruktur rapi.

## Batas yang tidak berubah

- Dunia visual DESIGN.md: rak CD, kotak jewel case asli, panggung beige `#e9e1d3` di rak, halaman
  gelap `#161514`, aksen merah `#e0574b`, Schibsted Grotesk + IBM Plex Mono, butir kertas.
- Akhir cerita menyerahkan ke rak 3D yang sudah ada (rak terbuka, lalu seksi rak).
- Tiap tahap tetap memuat bukti dari proyek nyata (teks bab di `content/cerita.js`).
- Pilar yang harus terlihat: kebutuhan abstrak, desain sesuai kebutuhan, transparansi, keamanan,
  keandalan, skalabilitas, infrastruktur, produk jadi.

## Tiga konsep

### A. Produksi album
1. Dengung ide: partikel suara melayang di ruang gelap, membentuk satu gelombang.
2. Lirik: gelombang mengendap jadi tulisan tangan di buku catatan (keluhan jadi requirement).
3. Demo: voice memo di HP dan kaset demo berlabel tangan (prototipe kasar).
4. Sesi rekaman: studio, mikrofon, laptop, HP, kamera aksi sebagai "instrumen".
5. Editing: timeline multitrack, potongan take dipilih dan disambung; catatan sesi = ADR.
6. Mixing: fader naik, meter VU menyala.
7. Mastering: master disegel dan dikunci (keamanan).
8. Test pressing: cakram uji diputar, sinyal goyah lalu stabil (keandalan, QA).
9. Pressing: mesin press mencetak ratusan cakram (skalabilitas).
10. Pengemasan: buklet dicetak, cakram masuk kotak, plastik segel (infrastruktur, dokumentasi).
11. Distribusi: kotak meluncur di ban berjalan dan masuk rak satu per satu.
12. Rak terbuka: pintu rak bergeser, kamera masuk ke seksi rak proyek.

### B. Produksi film
1. Ide sutradara di kertas. 2. Naskah. 3. Storyboard. 4. Set dan lighting (infrastruktur).
5. Syuting dengan kamera aksi dan HP. 6. Editing timeline (versi, transparansi).
7. Color grading (polish). 8. Test screening (QA, keandalan). 9. Segel sensor (keamanan).
10. Penggandaan rilis (skala). 11. Gulungan film berubah jadi cakram, masuk rak.
12. Rak terbuka seperti tirai bioskop.

### C. Satu ruang studio
Satu loteng studio yang utuh. Kamera berjalan dari meja ke meja: papan ide, meja tulis, sudut
rekaman, meja edit dua monitor, rak uji, mesin press kecil, meja kemas, lalu dinding rak yang
bergeser terbuka. Paling mulus karena satu ruang yang sama, tiap meja satu tahap.

## Gaya (untuk styleframe)

Analog hangat dan sinematik: cahaya tungsten, butir film halus, vignette, depth of field dangkal,
bahan nyata (plastik bening, kertas, logam), satu aksen merah. Bukan mainan 3D bergaya kartun.

## Keputusan Farrez (10 Nov 2026)

Konsep **B (produksi film)**, dipentaskan seperti **C**: satu soundstage utuh, kamera tidak pernah
dipotong, tiap stasiun satu tahap. Alasannya (dari saran yang Farrez setujui): tahap produksi film
hampir satu lawan satu dengan kerja nyata (rapat, PRD, desain, build, iterasi, polish, UAT, rilis),
dan tombol Play di rak sudah menampilkan produk sebagai film. Akhirnya tetap CD masuk rak.

### Lembar beat (10 beat, satu kamera menyusuri soundstage)

| # | Beat | Yang terlihat | Pilar | Kamera dan sambungan |
|---|---|---|---|---|
| 1 | Ide | Lampu meja sutradara menyala; coretan di kertas berpendar, keluhan klien jadi catatan tempel | Kebutuhan abstrak | Mendekat pelan; kertas ditarik ke mesin ketik |
| 2 | Naskah | Mesin ketik: keluhan jadi adegan bernomor | Requirement | Top-down; halaman beterbangan ke dinding |
| 3 | Storyboard | Dinding panel: layar laptop, HP, kamera aksi digambar per panel | Desain sesuai kebutuhan | Menyusur dinding; satu panel jadi set nyata |
| 4 | Set dan lighting | Rel kamera, kabel, lampu dinyalakan satu per satu | Infrastruktur | Crane turun ke set |
| 5 | Syuting | Kamera aksi dan HP merekam laptop di set, lampu tally merah | Build | Handheld mengikuti; masuk monitor |
| 6 | Editing | Meja dua monitor, timeline berversi, catatan keputusan | Transparansi | Dorong ke layar; potongan disambung |
| 7 | Color grading | Gambar mentah menjadi hangat, roda grading berputar | Polish | Layar terbelah sebelum dan sesudah |
| 8 | Test screening | Ruang kecil, film tersendat sekali lalu mulus | Keandalan, UAT | Dari baris belakang; proyektor ke kaleng film |
| 9 | Segel dan penggandaan | Kaleng film disegel, mesin menggandakan ratusan cakram | Keamanan, skala | Makro ke segel; mundur ke jalur mesin |
| 10 | Rilis | Gulungan jadi cakram dalam jewel case, masuk rak satu per satu, rak terbuka seperti tirai bioskop | Produk jadi | Ikuti satu kotak; tembus tirai ke seksi rak |

Gaya styleframe: soundstage gelap hangat, cahaya tungsten dan practical, butir film halus,
vignette, DOF dangkal, bahan nyata (kertas, logam, plastik bening, kabel), satu aksen merah (lampu
tally, segel). Foto Farrez dari PR #46 bisa muncul sebagai siluet sutradara di beat 1.
