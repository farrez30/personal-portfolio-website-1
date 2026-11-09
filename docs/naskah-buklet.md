# Naskah buklet (disetujui Farrez 9 Nov 2026)

Pilihan 1 (9 Nov 2026): isi satu suara, judul mengikuti genre album. Fakta produk saja; halaman peran/keputusan menunggu claims-audit.

## erp-software-house

| # | Label | Judul sebelum | Judul sesudah | Isi |
|---|---|---|---|---|
| 1 | Context | Satu tim, banyak klien | Satu tim. Banyak klien. | Software house tempat saya bekerja membuat sistem back-office untuk beberapa klien sekaligus. Bidangnya berbeda-beda, nama kliennya tidak saya sebut. |
| 2 | Context | Tiga dunia yang berbeda | Tiga bidang. Tiga aturan. | Distribusi dan servis, asuransi kesehatan, sampai payroll perkebunan. Tiap klien punya aturan dan istilahnya sendiri. |
| 3 | Challenge | Aturan bisnis yang terus berubah | Aturan yang bergerak | Satu transaksi melewati banyak aturan validasi. Kalau satu aturan salah, staf di kantor klien yang pertama kena. |
| 4 | Solution | Gudang dan servis | Distribusi / servis | Sistem untuk usaha distribusi dan servis. |
| 5 | Solution | Asuransi kesehatan | Asuransi kesehatan | Back-office untuk perusahaan asuransi kesehatan. |
| 6 | Solution | Payroll perkebunan | Payroll perkebunan | Penggajian untuk usaha perkebunan. |
| 7 | How it works | Dari layar ke database | Layar, API, database | Staf membuka layar transaksi di web. API meneruskan permintaannya, logika berat berjalan di stored procedure SQL Server, lalu hasilnya kembali ke layar. Rilis dikemas dengan Docker lewat GitOps. |
| 8 | Outcome | Dipakai tiap hari | Dipakai setiap hari | Sistemnya dipakai kantor klien untuk pekerjaan harian. Angka dan rinciannya menyusul setelah diperiksa ulang. |

## viralytics

| # | Label | Judul sebelum | Judul sesudah | Isi |
|---|---|---|---|---|
| 1 | Context | Agency KOL | Brand, agency, kreator | Agency yang menghubungkan brand dengan kreator. Satu kampanye melibatkan tim agency, perwakilan brand, dan banyak KOL. |
| 2 | Context | Semuanya di spreadsheet | Potongan di mana-mana | Sebelumnya brief, kontrak, dan invoice tersebar di spreadsheet dan grup WhatsApp. |
| 3 | Challenge | Satu kampanye, seribu pesan | Seribu pesan, satu kampanye | Status kampanye susah dilacak. Siapa sudah setuju, siapa belum dibayar, semuanya harus dicari di obrolan. |
| 4 | Solution | Kampanye bertahap | Tahap demi tahap | Kampanye berjalan lewat tahap persetujuan yang jelas, dari brief sampai laporan. |
| 5 | Solution | Direktori KOL | Wajah-wajah di direktori | Kreator bisa dicari dan disaring sebelum diajak masuk kampanye. |
| 6 | Solution | Kontrak sampai invoice | Kertas yang akhirnya rapi | Kontrak, pembayaran KOL, dan invoice ada di satu tempat bersama riwayat aktivitasnya. |
| 7 | How it works | Detail menyusul | Menyusul | Rincian cara kerjanya menunggu izin partner. |
| 8 | Outcome | Sudah berjalan | Sudah mengudara | Sistem ini sudah dipakai di produksi. |

## coderoach-os

| # | Label | Judul sebelum | Judul sesudah | Isi |
|---|---|---|---|---|
| 1 | Context | Studio dua orang | Bengkel dua orang | Coderoach adalah studio produk digital dengan dua model pendapatan: proyek harga tetap dan retainer bulanan. |
| 2 | Context | Inti dari co-founder | Dibangun di atas inti | Co-founder menulis inti ERP-nya pada 21 Agustus 2026. Sejak 25 Agustus aplikasinya terus diperluas: CI, modul repo, sampai server MCP. |
| 3 | Challenge | Lima pertanyaan tiap minggu | Lima pertanyaan, tiap minggu | Proyek mana yang untung setelah jam dihitung? Siapa belum bayar? Kapasitas terpakai berapa? Retainer mana yang jatahnya jebol? Kas aman tiga bulan ke depan? |
| 4 | Solution | Grid jam mingguan | Jam sebagai bahan baku | Tim mengisi jam per proyek tiap minggu. Dari sini margin tiap proyek dihitung. |
| 5 | Solution | Git disandingkan dengan jam | Kode bertemu jam | Riwayat GitHub dibandingkan dengan jam tercatat: ada commit tanpa jam, ada jam tanpa commit. |
| 6 | Solution | Status bergerak sendiri | Status bergerak sendiri | Status story ikut bergerak dari pull request, hasil tes CI, dan deploy produksi. |
| 7 | How it works | Dari penawaran ke kas | Penawaran ke kas | Penawaran jadi proyek, fase selesai jadi termin Siap Tagih, invoice terbit, lalu semua masuk jurnal double-entry dan laporan kas. |
| 8 | Outcome | Dipakai studio setiap hari | Alat kerja studio | Dipakai internal dengan data sungguhan. Per 5 November 2026 ada 179 berkas tes dan lebih dari 80 catatan keputusan (ADR). |

## fifofun

| # | Label | Judul sebelum | Judul sesudah | Isi |
|---|---|---|---|---|
| 1 | Context | Anggaran rumah tangga | Meja dapur, buku kas | Banyak keluarga mencatat anggaran di spreadsheet. Masalahnya, spreadsheet hanya bercerita tentang bulan lalu. |
| 2 | Context | Mulai 19 Agustus 2026 | Rumah baru, buku baru | Hari pertama langsung membaca e-Statement bank. Seminggu kemudian sudah ada perencanaan, catatan tunai, dan anggaran per kategori. |
| 3 | Challenge | Salah satu baris, meleset semua | Lho, kok minus? | Satu transaksi Rp4,7 juta salah kategori sampai terbaca 5964% dari anggaran. Saldo e-wallet minus selama empat minggu tanpa ada yang sadar. |
| 4 | Solution | Dicek ke saldo bank | Cocok sampai ke rupiah | Setiap baris e-Statement dicocokkan dengan saldo cetakan bank. Kalau ada selisih, yang ditunjuk transaksinya, bukan cuma totalnya. |
| 5 | Solution | Pindah dompet bukan belanja | Pindah dompet, bukan belanja | Top-up ke e-wallet sendiri dan uang yang cuma numpang lewat tidak dihitung sebagai belanja. |
| 6 | Solution | Peta belanja | Peta belanja keluarga | Tandai pedagang sekali di peta, pembayaran berikutnya ke sana ikut tercatat di titik yang sama. |
| 7 | How it works | Dari e-Statement ke rencana | Dari slip ke rencana | Unggah e-Statement, cocokkan dengan saldo, tinjau yang belum jelas, catat tunai, tetapkan anggaran, lalu bagikan ringkasan tiga bulan dalam PDF. |
| 8 | Outcome | Dipakai harian | Santai di sofa | Dipakai satu rumah tangga setiap hari. 23 e-Statement dengan 1.591 transaksi cocok persis dengan saldo bank. Kodenya terbuka dengan lisensi MIT. |

## nds-etl

| # | Label | Judul sebelum | Judul sesudah | Isi |
|---|---|---|---|---|
| 1 | Context | Distributor di HP | DISTRIBUTOR DI GENGGAMAN | Banyak distributor jaringan ini ibu-ibu yang membuka semuanya dari HP. Mereka perlu jawaban, bukan tabel. |
| 2 | Context | Mulai 11 Juli 2026 | DARI SATU SIMPUL | Pekan pertama sudah bisa membaca data portal, menyusun ulang pohon jaringan, dan menghitung rencana. Simulator menyusul 18 Juli. |
| 3 | Challenge | Data mentah tanpa saran | DATA TANPA ARAH | Portal hanya memberi chart dan tabel. Pertanyaan mingguannya tetap sama: bonus cair berapa, beli berapa botol, posisi baru di mana, kapan repeat order. |
| 4 | Solution | Rencana repeat order | RENCANA DI DEPAN | Empat aturan dari comp-plan dihitung otomatis dan diurutkan dari yang paling mendesak. |
| 5 | Solution | Simulator jaringan | UJI DULU JARINGANNYA | Coba penempatan dan repeat order di pohon jaringan sendiri sebelum benar-benar dilakukan. |
| 6 | Solution | Ramah mata lansia | BESAR, JELAS, TERBACA | Huruf 17 px, tombol minimal 44 px, kontras cukup di mode terang maupun gelap. |
| 7 | How it works | Satu beranda, empat jawaban | SATU BERANDA, EMPAT JAWABAN | Data ditarik terjadwal, rencana dihitung, beranda menjawab empat pertanyaan, dan pengingat datang lewat email, kalender, atau notifikasi. |
| 8 | Outcome | Uji coba | MASIH UJI COBA | Sedang diuji coba oleh beberapa distributor dengan masa coba tujuh hari. Belum ada pembayaran. |

## akarkita

| # | Label | Judul sebelum | Judul sesudah | Isi |
|---|---|---|---|---|
| 1 | Context | Cerita dari teras | Cerita dari teras | Silsilah keluarga biasanya hidup di ingatan para tetua. Begitu mereka pergi, banyak sebutan dan cerita ikut hilang. |
| 2 | Context | Mulai 24 Agustus 2026 | Akar pertama ditanam | Hari pertama sudah ada kerangka aplikasi, dua sistem kekerabatan sebagai data, dan hitungan faraid. Identitas visual Tenun Nusantara menyusul 15 September. |
| 3 | Challenge | Harus panggil apa? | Harus panggil apa? | Di acara keluarga, yang muda sering bingung harus memanggil siapa dengan sebutan apa. Apalagi kalau keluarganya Sunda dan Minang sekaligus. |
| 4 | Solution | Pohon yang bisa dijelajahi | Pohon yang bisa dijelajahi | Geser dan perbesar pohon di HP. Pilih satu orang, semua sebutan langsung dihitung dari sudut orang itu. |
| 5 | Solution | Budaya sebagai data | Adat yang tercatat | Sebutan Pancakaki Sunda dan garis suku Minang disimpan sebagai aturan, jadi bisa ditambah tanpa mengubah kode. |
| 6 | Solution | Hanya untuk keluarga | Pintu hanya untuk kerabat | Masuk hanya lewat undangan. Anggota bisa mengusulkan perubahan, penjaga keluarga yang memutuskan. |
| 7 | How it works | Undang, jelajahi, usulkan | Undang, jelajahi, usulkan | Kerabat diundang, membuka pohon, memilih fokus, membaca profil, lalu mengusulkan perubahan yang diputuskan penjaga. |
| 8 | Outcome | Dipakai satu keluarga | Berbuah di satu keluarga | Sudah dipakai sungguhan oleh satu keluarga di akarkita.vercel.app. Per 5 November 2026 ada 64 berkas tes. |

## pilot-iklan

| # | Label | Judul sebelum | Judul sesudah | Isi |
|---|---|---|---|---|
| 1 | Context | Usaha rumahan keluarga | Toko rumahan! | Sebuah usaha keluarga menjual produk suplemen dan ingin mencoba iklan Meta untuk pertama kali. |
| 2 | Context | Pilot mulai 20 Oktober 2026 | Belum ada iklan. Belum ada uang keluar. | Fase pertama hanya menyiapkan aturan dan draf. Belum ada iklan tayang dan belum ada uang keluar. |
| 3 | Challenge | Satu kalimat bisa fatal | Satu kalimat. Langsung kena! | Iklan produk kesehatan diatur berlapis. Satu klaim yang salah bisa membuat akun iklan atau izin produk bermasalah. |
| 4 | Solution | Gerbang aturan iklan | Gerbang 41 aturan! | 41 aturan dicek otomatis ke setiap draf iklan. Satu pelanggaran berat membuat drafnya ditolak. |
| 5 | Solution | Dari iklan ke WhatsApp | Klik! Langsung WhatsApp | Pengunjung dari iklan langsung ke WhatsApp penjual, dengan kode iklan terbawa di pesannya. |
| 6 | Solution | Klik dicatat tanpa identitas | Dicatat. Tanpa nama! | Setiap klik WhatsApp dicatat tanpa nomor, IP, atau ID peramban. Halaman privasi menjelaskannya. |
| 7 | How it works | Draf, cek, tayang | Draf, cek, tayang! | Draf dicek, kampanye dibuat dalam keadaan jeda, pemilik mengaktifkannya sendiri, lalu klik dibandingkan dengan hasil Meta. |
| 8 | Outcome | Iklan uji berjalan | Iklan uji mengudara! | Empat iklan uji aktif sejak 3 November 2026. Hasil penjualan belum cukup untuk dilaporkan. |

## jeda

| # | Label | Judul sebelum | Judul sesudah | Isi |
|---|---|---|---|---|
| 1 | Context | Di antara dua sesi | di antara dua sesi. | Pikiran yang berat jarang datang tepat saat sesi terapi. Lebih sering di malam hari, saat sendirian. |
| 2 | Context | Mulai 1 Oktober 2026 | awal oktober. | Dua hari kemudian fitur intinya sudah jalan. Ringkasan untuk psikolog menyusul 4 November. |
| 3 | Challenge | Mencatat tanpa dinilai | hening dulu. | Psikolognya meminta lebih sedikit analisis dan lebih banyak kehadiran. Aplikasinya cukup mencatat, tidak menafsirkan. |
| 4 | Solution | Tetap jalan tanpa sinyal | tanpa sinyal. | Catatan tersimpan di HP dulu, lalu ikut tersinkron begitu ada sinyal. |
| 5 | Solution | Klien yang membagikan | klien yang memutuskan. | Klien membuat tautan baca-saja untuk psikolognya. Bisa diberi PIN, bisa kedaluwarsa, bisa dicabut kapan saja. |
| 6 | Solution | Ringkasan untuk psikolog | sekilas, untuk psikolog. | Psikolog melihat perasaan per hari, per minggu, dan per jam, tanpa grafik di layar klien. |
| 7 | How it works | Catat, sinkron, bagikan | catat. sinkron. bagikan. | Klien mencatat lewat tombol Catat, catatan tersinkron, lalu dibagikan lewat tautan atau dengan menghubungkan psikolog. |
| 8 | Outcome | Pilot pribadi | satu orang. | Dipakai satu orang sebagai pilot pribadi. Setiap pull request melewati lint, typecheck, tes unit, dan tes end-to-end. |

## yiheecam

| # | Label | Judul sebelum | Judul sesudah | Isi |
|---|---|---|---|---|
| 1 | Context | Kamera yang ditinggal vendornya | Kamera yang ditinggal | Kameranya masih bagus, tapi aplikasi resminya sudah tidak bisa dipasang di Android 15. |
| 2 | Context | Mulai 7 Oktober 2026 | Berangkat 7 Oktober | Dimulai dari membedah aplikasi lama dan protokol kameranya, lalu layar pertama jadi esok harinya. |
| 3 | Challenge | Dipakai sambil berkendara | Sekilas di bawah matahari | HP dilirik sekilas di bawah matahari, kadang dengan sarung tangan. Tidak ada waktu untuk menu yang dalam. |
| 4 | Solution | Live view yang cepat | Jalan di depan, tanpa jeda | Pemutar video dipilih lewat pengukuran langsung dengan kamera asli, supaya jedanya sekecil mungkin. |
| 5 | Solution | Papan status sekali lirik | Papan yang terbaca sekilas | Sisa rekam, baterai, suhu HP, dan sinyal tampil besar seperti papan split-flap. |
| 6 | Solution | Tandai momen tanpa menyentuh HP | Tangan tetap di stang | Tombol intercom helm menandai momen penting tanpa melepas tangan dari stang. |
| 7 | How it works | Sambung, rekam, salin | Sambung, rekam, pulang | Sambung ke WiFi kamera, pantau live view, rekam dan tandai momen, lalu salin videonya ke HP setelah sampai. |
| 8 | Outcome | Teruji di jalan | Jakarta–Pangandaran | Dipakai di perjalanan Jakarta–Pangandaran, 17–20 Oktober 2026. Aplikasinya pribadi dan tidak disebarkan. |

## d-day

| # | Label | Judul sebelum | Judul sesudah | Isi |
|---|---|---|---|---|
| 1 | Context | Strategi milik teman | STRATEGI SEORANG TEMAN | Seorang teman punya strategi trading kripto dan ingin lepas dari bot pihak ketiga yang ia pakai. |
| 2 | Context | Mulai 8 September 2026 | HARI KEDUA | Hari kedua sudah ada perhitungan biaya, indikator, backtester, dan dashboard pertama. |
| 3 | Challenge | Mengubah strategi tanpa menunggu | TANPA MENUNGGU | Pemilik strategi paham trading tapi tidak membaca kode. Ia perlu mengubah parameter dan membaca hasilnya sendiri. |
| 4 | Solution | Stop loss sungguhan | STOP LOSS SUNGGUHAN | Stop loss dipasang sebagai order di exchange, bukan sekadar dicek oleh bot. |
| 5 | Solution | Hitungan untung yang jujur | ANGKA YANG JUJUR | Untung kotor, slippage, fee, dan PPh 1% per penjualan dipisah, jadi angkanya bisa dipercaya. |
| 6 | Solution | Wizard dan backtest | SUSUN. UJI. | Strategi disusun langkah demi langkah dari indikator, lalu diuji ke data lama sebelum diaktifkan. |
| 7 | How it works | Atur, uji, aktifkan | ATUR. UJI. AKTIFKAN. | Pilih aset, atur modal dan batas rugi, susun kondisi masuk dan keluar, uji, lalu aktifkan. Dashboard tidak pernah mengirim order sendiri. |
| 8 | Outcome | Lulus uji, belum uang sungguhan | LULUS. BELUM UANG SUNGGUHAN. | Lulus gerbang uji di testnet pada 7 Oktober 2026 dengan strategi uji. Belum pernah memakai uang sungguhan. |
