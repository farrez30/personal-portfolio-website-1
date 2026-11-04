# Naskah adegan: Rak CD proyek

> Status 5 Nov 2026: naskah ini draf sebelum kode. Yang sudah berubah sesudahnya (rak jadi bagian
> halaman yang digeser lewat gulir, Play menampilkan hologram produk, CD musik terpisah, sinar-X
> diganti senter UV di halaman Architecture buklet) tercatat di `docs/decisions/` dan `DESIGN.md`.
> Aturan bahasa di bawah tetap berlaku.

Draf 1, 4 Nov 2026. Bahan tinjauan Farrez sebelum ada kode. Setiap adegan menulis apa yang
dilihat pengunjung, apa yang bisa ia lakukan, teks yang tampil, dan apa yang terjadi di mode
Ringan. Teks bertanda `[slot]` menunggu penilaian klaim di `karier-frz/claims-audit.md`.

## Keputusan yang sudah diambil

| Hal | Keputusan Farrez |
|---|---|
| Headline | "Bukan sekadar sistem yang selesai dibuat, tapi sistem yang dipakai tiap hari." / "Not just a system that ships. A system people use every day." |
| AI | Tidak di judul. Muncul pelan di cara kerja dan studi kasus (ADR 0011 karier-frz). |
| Benda | Kotak CD. Tiap proyek satu album: kotak, cakram, buklet. |
| Bahasa | ID dan EN, sapaan "Anda", formal ringan. |
| Mode | Imersif (3D) dan Ringan (HTML, 3D minim), bisa diganti kapan saja seperti setelan grafis game. |
| Kontak | Helix kaca kecil yang berbunyi saat disapu. |
| CV | Tombol tetap menyajikan PDF yang ada sampai CV v1 jadi. |

Inspirasi: Discography karya dmtrbrl (ide benda CD; repo tanpa lisensi, jadi kode dan asetnya
tidak dipakai), Codrops Skeleton Fluid Reveal, Codrops Glass Xylophone, Run Rob Run, nuansa
pemilih game Annapurna Interactive. Semuanya dibangun ulang sendiri.

## Aturan bahasa (keputusan Farrez, 4 Nov 2026)

- Versi ID ditulis ulang dari konteks pembaca Indonesia, bukan diterjemahkan dari EN. Dua
  versi berangkat dari isi yang sama, kalimatnya disusun sendiri-sendiri.
- Istilah kerja yang memang diucapkan orang kantor dan tim software dalam bahasa Inggris tetap
  Inggris di versi ID: label bagian (Overview, Challenge, Key decisions, Solution,
  Delivery & role, Outcome), juga requirement, stakeholder, UAT, rollout, deploy, ERP, ADR.
  Menerjemahkannya ("Tantangan", "Cara jadi") justru terdengar kaku.
- Kalimat di sekitarnya tetap bahasa lisan yang rapi (skill `bahasa-lisan`), sapaan "Anda".
- Contoh: bukan "Keputusan: memilih indeks unik terfilter alih-alih constraint", tapi
  "Key decisions: Saya pilih filtered unique index, bukan constraint biasa, karena data lama
  masih punya duplikat."
- Dasar: studi kasus UX karya desainer Indonesia umumnya memakai judul bagian bahasa Inggris
  (mis. redesain iPusnas dan Wattpad di Medium; dibaca dari cuplikan pencarian, label I), dan
  penelitian campur kode menemukan karyawan memakai istilah Inggris untuk istilah industri
  (studi kualitatif skala kecil, label I).

## Adegan 0. Gerbang (detik pertama)

- Layar pertama selalu HTML biasa: nama, headline, dua tombol, dan saklar mode. Tidak menunggu
  3D. Recruiter yang hanya punya 7 detik sudah dapat siapa Anda dan apa yang Anda kerjakan.
- Saklar di pojok: **Imersif / Ringan**. Bawaan dipilih otomatis: Ringan bila HP lemah,
  koneksi hemat data, atau `prefers-reduced-motion`; Imersif bila tidak. Pilihan diingat.
- Teks: headline, satu kalimat peran `[slot: kalimat peran setelah klaim dinilai]`, tombol
  "Lihat proyek" dan "Hubungi saya".

## Adegan 1. Rak (memilih proyek)

- **Imersif:** kotak-kotak CD berjajar miring di rak, sedikit bergoyang seperti baru ditaruh.
  Seret, gulir, atau panah keyboard menggeser rak; kotak di tengah maju sedikit dan terbalik
  pelan memperlihatkan punggung (judul, tahun, peran). Musik ambient bisa dinyalakan, tidak
  pernah otomatis.
- **Ringan:** daftar sampul datar dalam kisi, judul dan peran di bawahnya.
- Tiap sampul punya tiga label kecil: jenis (Kerja kantor / Studio / Pribadi), peran, status
  (Dipakai / Sedang berjalan).
- Urutan rak `[usul, minta persetujuan]`: mitraPlus (disamarkan), Viralytics (menunggu izin
  partner), Coderoach OS, FiFoFun, NDS-ETL, AkarKita, pilot iklan usaha keluarga, Jeda,
  YiheeCam, d-day.

## Adegan 2. Membuka kotak

- Klik kotak: kotak maju ke tengah, tutupnya terbuka dengan bunyi klik kecil (mati bila suara
  mati). Di dalam ada dua benda: cakram di kanan, buklet di kiri.
- Tangan pengunjung yang memilih: klik buklet untuk membaca, klik cakram untuk "memutar".
- **Ringan:** halaman studi kasus biasa dengan dua tab, Cerita dan Lihat langsung.

## Adegan 3. Buklet (cerita proyek)

Halaman dibalik seperti buklet CD (LeafThrough, MIT). Struktur dari riset 4 Nov 2026 (sumber
di bawah). Tiap halaman punya label kecil berbahasa Inggris (sama di ID dan EN), lalu judul
berupa kalimat, sehingga membaca judulnya saja sudah memberi cerita utuh. Satu gagasan per
halaman. Semua proyek memakai templat yang sama.

| Hal. | Isi | Batas | Dasar |
|---|---|---|---|
| 1. Overview | Jenis proyek, klien (disamarkan: industri dan skala), periode, chip status (Dipakai / Berjalan sejak bulan tahun / Pilot), peran dalam satu baris, satu hasil atau "Sedang berjalan". | 40 kata | Hasil dan peran di depan (UX Tools, Palmer 2022; Ladders 2018 lewat HR Dive) |
| 2. Challenge | Keadaannya, siapa yang kesulitan, batasan (waktu, biaya, sistem lama). | 80 kata | NN/g, Krause 2019 |
| 3. Key decisions | Dua atau tiga keputusan berbentuk "memilih X, bukan Y, karena Z", plus satu hal yang sengaja tidak dikerjakan. Tautan ADR bila publik. | 100 kata | Shape Up bab 6 (no-gos); NN/g konsep yang ditinggalkan |
| 4. Solution | Peta fitur 3 sampai 6 modul, tangkapan layar asli atau wireframe. Efek sinar-x (adegan 5) ada di halaman ini. | 60 kata + gambar | NN/g |
| 5. Delivery & role | Lini masa kebutuhan, tes, rilis. Satu baris kontribusi yang memisahkan "saya" dari "tim" dan alat, termasuk bagian inti yang dibuat orang lain. Kode ditulis jelas bukan oleh Farrez sendiri, tanpa menjadikan AI sorotan. | 80 kata | STAR, Dartmouth/MIT CAPD ("I" bukan "we"); ADR 0011 karier-frz |
| 6. Outcome | Bukti hasil; untuk yang berjalan: tahap sekarang dan gerbang berikutnya, tanpa angka proyeksi. Satu hal yang akan dikerjakan berbeda. | 80 kata | Laporan asesmen GOV.UK tahap alpha; NN/g pembelajaran |

Kesalahan yang dihindari: lini masa proses generik tanpa keputusan, "kami membangun" tanpa
peran pribadi, angka ilustrasi yang tampil seperti hasil, tangkapan layar tanpa alasan,
dinding teks, pelajaran yang isinya pujian, dan klien samaran yang masih bisa ditebak dari logo
atau angkanya.

Catatan bukti: angka 7,4 detik Ladders hanya terbaca lewat HR Dive (laporan aslinya 404).
Angka "90 detik untuk portofolio" tidak bersumber. Belum ada sumber kredibel tentang cara
mengungkap kode buatan AI di portofolio; baris kontribusi di halaman 5 adalah turunan prinsip
"saya bukan kami". Batas kata adalah perkiraan, bukan dari sumber.

Semua kalimat bertanda `[slot]` sampai klaimnya dinilai. Tidak ada angka yang tidak ada di
claims-audit, dan tidak ada nama klien mitraPlus.

## Adegan 4. Memutar cakram (lihat langsung)

- Klik cakram: cakram terangkat, meluncur ke pemutar CD di sisi kanan bawah, berputar. Dari
  pemutar naik cahaya tipis seperti hologram yang membuka jendela kecil.
- Jendela itu berisi tangkapan layar produknya (bukan iframe, supaya ringan dan aman), dengan
  tombol "Buka situs" untuk proyek yang publik (FiFoFun, AkarKita `/warisan`, Jeda).
- Proyek tanpa izin tampil sebagai jendela buram dengan keterangan "Menunggu izin" `[cek:
  apakah teks ini melanggar aturan halaman tidak menerangkan dirinya]`.
- Sambil berputar, cakram juga memutar trek ambient album itu bila suara menyala.
- **Ringan:** tab Lihat langsung berisi gambar dan tombol yang sama.

## Adegan 5. Sinar-x (yang di balik layar)

Di halaman Dibangun, tangkapan layar produk tampil utuh. Kursor atau jari menyibak cairan
gelap seperti sinar-x, dan di bawahnya tampil lapisan kedua yang bercerita:

1. **Lapisan rancangan:** wireframe dan garis tata letak layar itu.
2. **Lapisan arsitektur:** dari tombol yang disentuh, garis menyala mengalir ke kotak layanan
   (aplikasi, API, database, layanan luar seperti email atau pembayaran). Paket data kecil
   berjalan di garis itu.
3. **Lapisan jaringan:** di tepi jauh, garis keluar ke peta titik-titik kota tempat
   pemakainya berada, atau ke aplikasi lain yang tersambung.

Isi diagram per proyek diambil dari repo dan diperlakukan sebagai klaim `[slot]`: hanya
komponen yang memang ada. Di mode Ringan, lapisan ini jadi diagram statis yang bisa dibaca
pembaca layar sebagai daftar.

## Adegan 6. Kontak

- Helix kaca kecil berputar pelan. Disapu kursor atau jari, tiap batang berbunyi satu nada.
- Teks: kalimat ajakan `[slot]`, email, WhatsApp, LinkedIn, GitHub. Formulir EmailJS tetap ada
  sesuai keputusan sebelumnya.
- **Ringan:** helix jadi gambar diam; kontaknya sama.

## Suara

- Pemutar piringan hitam tetap ada sebagai kontrol suara global. Suara selalu mati di awal.
- Trek: perlu musik berlisensi. Lagu `ES_...mp3` di repo berasal dari Epidemic Sound dan
  lisensinya tidak tercatat. Opsi: langganan pustaka musik, musik bebas royalti dengan
  lisensi tertulis, atau buatan sendiri. `[keputusan Farrez]`

## Aset yang dibuat (alur alur-desain: Gemini membuat, Claude mengatur)

| Aset | Alat | Catatan |
|---|---|---|
| Sampul album per proyek | Gemini / Flow | Gaya satu keluarga. Dicatat di `PROVENANCE.md`. Kuota dilaporkan dulu. |
| Cetakan cakram | Prosedural di kode | Tanpa gambar, supaya ringan. |
| Halaman buklet | HTML + teks | Teks bisa dipilih dan dibaca pembaca layar. |
| Tangkapan layar produk | Tangkapan sendiri | Viralytics dan klien menunggu izin. |
| Diagram sinar-x | SVG dari data per proyek | Satu berkas data per proyek. |

## Anggaran performa

- Mode Imersif: satu kanvas Three.js untuk seluruh halaman, dimuat setelah teks tampil.
  Rasio piksel dibatasi 1,5, tanpa bayangan real-time, berhenti saat tab tersembunyi.
- Mode Ringan: tanpa Three.js sama sekali.
- Target: LCP di bawah 2,5 detik di HP menengah pada mode Ringan; Imersif tidak menghalangi
  LCP karena teks sudah tampil lebih dulu.
- Diukur dari build produksi, bukan dev server.

## Aksesibilitas

- Semua yang bisa diklik di 3D punya padanan tombol HTML yang bisa dicapai keyboard.
- Isi buklet adalah teks HTML yang sama dengan mode Ringan, jadi Google dan pembaca layar
  membaca isi yang sama.
- `prefers-reduced-motion`: mode Ringan otomatis, tetap bisa diganti.

## Yang menunggu Farrez

1. Urutan dan daftar proyek di rak.
2. Struktur enam halaman buklet di adegan 3 (sudah diriset, tinggal disetujui).
3. Sumber musik.
4. Persetujuan konsep sinar-x tiga lapis.
