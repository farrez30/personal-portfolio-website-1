# Teks cerita v3 (versi Indonesia)

Putaran 3, 11 Nov 2026. Putaran 1 kaku. Putaran 2 sudah tidak kaku, tapi Farrez menilainya aneh
("mana ada orang copywriting seperti itu"), karena kalimatnya dirakit dari aturan, bukan dari
contoh nyata. Putaran ini ditulis dari riset (`riset-teks.md` di folder ini): cara software house
dan agensi Indonesia menulis tahap kerjanya, dan kajian kenapa teks terasa terjemahan.

Pola yang dipakai, semuanya terlihat di situs Indonesia sungguhan (11 Nov 2026):
- Ajakan langsung di awal: "Ceritakan kebutuhan Anda" (Javan, GITS, KerjainWeb).
- Pelaku jelas dan kata kerja tanpa me-: "Kami pelajari ...", "Kami susun ..." (Olakses, KerjainWeb).
  Di situs pribadi pelakunya "saya".
- Klien jadi pelaku di tahap persetujuan: "Anda tinjau dan setujui sebelum masuk development"
  (KerjainWeb).
- Benda konkret, bukan sifat abstrak: "domain, hosting, CMS" (Olakses), "garansi bug" (Venturo).
- Istilah kerja dibiarkan Inggris: requirement, development, UAT, go-live, bug (Venturo, Niagadev).
- Satu kalimat per tahap, 7 sampai 14 kata.

Yang dihindari, juga dari riset: kalimat yang terbaca balik sebagai tagline Inggris, kata kerja
transitif tanpa objek ("menyesuaikan"), sifat abstrak tanpa contoh, "lebih dari sekadar",
"solusi digital", "era digital" (Narabahasa; alvinindra/bahasa-skills; Machali 2023).

Fakta dan cakupan klaim sama dengan `content/cerita.js`. Baris **[konfirmasi]** memuat klaim yang
hanya Farrez tahu benar tidaknya; baris itu belum dipasang di papan dan animatic.

## Judul dan isi per beat

| # | Putaran 2 (aneh) | Putaran 3 | Polanya dari mana |
|---|---|---|---|
| 1 judul | Banyak proyek saya berawal dari satu keluhan. | Ceritakan dulu masalahnya. | Ajakan "Ceritakan kebutuhan Anda" (Javan, GITS). |
| 1 isi | Ceritakan saja masalahnya pakai bahasa Anda sendiri. Soal teknis, biar saya yang pikirkan. | Tidak perlu pakai istilah teknis. Cukup cerita apa yang bikin repot, sisanya saya yang urus. | Bahasa pemilik usaha ("bikin repot"); janji pendek di akhir. |
| 2 judul | Keluhan itu saya ubah jadi daftar yang bisa dicentang. | Saya pelajari alurnya, lalu saya tulis jadi requirement. | "Kami pelajari bisnis Anda" (Olakses); requirement dibiarkan Inggris (Venturo). |
| 2 isi | Tiap poin jelas: siapa yang pakai, apa yang harus terjadi, kapan dianggap beres. | Anda cek dan setujui dulu sebelum masuk development. **[konfirmasi]** | Klien sebagai pelaku persetujuan (KerjainWeb). |
| 3 judul | Bentuknya menyesuaikan siapa yang memakai. | Tidak selalu jadi aplikasi. | Diagnosis: "menyesuaikan" tanpa objek adalah kalke "adapts to". Diganti pernyataan yang bisa dibuktikan. |
| 3 isi | Kadang jadinya aplikasi Android yang tersambung ke kamera aksi. Kadang sistem kantor di laptop, dashboard di HP, atau alur dari iklan sampai chat WhatsApp. | Kadang aplikasi Android yang tersambung ke kamera aksi. Kadang sistem kantor di laptop, dashboard di HP, atau alur dari iklan sampai chat WA. | Benda konkret dipertahankan; "WA" seperti ucapan orang. |
| 4 judul | Bagian yang tidak kelihatan juga saya rapikan. | Server dan database juga saya urus. | Diagnosis: "bagian yang tidak kelihatan" klise abstrak. Sebut bendanya (pola "domain, hosting, CMS"). |
| 4 isi | Sembilan dari sepuluh proyek di rak punya halaman arsitektur. Di situ Anda bisa ikuti satu permintaan dari layar sampai server, tanpa ada rahasia klien yang terbuka. | Sembilan dari sepuluh proyek di rak punya halaman arsitektur. Anda bisa lihat jalannya data dari layar sampai server, tanpa rahasia klien ikut terbuka. | Kalimat dipendekkan; "permintaan" (kalke "request") diganti "jalannya data". |
| 5 judul | Saya bangun, lalu saya coba di alat yang benar-benar dipakai. | Lalu saya bangun, bertahap. | "bertahap" dipakai KerjainWeb untuk tahap development. |
| 5 isi | YiheeCam saya uji langsung dengan kamera aksi aslinya. | YiheeCam saya uji langsung dengan kamera aksinya. **[konfirmasi]** | Bukti nyata, kalau benar. |
| 6 judul | Anda selalu tahu sudah sampai mana. | Progresnya selalu bisa Anda cek. | "progres" kata yang dipakai klien dan vendor; klien jadi pelaku. |
| 6 isi | Setiap keputusan penting saya catat, lengkap dengan alasannya. Statusnya juga saya tulis apa adanya: d-day sudah lulus uji di testnet, tapi belum pernah dipakai dengan uang sungguhan. | Keputusan penting saya catat beserta alasannya. Status juga saya tulis apa adanya: d-day sudah lulus uji di testnet, tapi belum pernah dipakai dengan uang sungguhan. | Dipendekkan. |
| 7 judul | Yang sudah jalan, saya haluskan sampai enak dipakai. | Lalu dirapikan sampai enak dipakai. | Pasif sederhana seperti "Website diluncurkan" (KerjainWeb); pasif bukan tanda terjemahan. |
| 7 isi | (belum ada) | **[konfirmasi]** satu contoh perbaikan setelah masukan pengguna. | |
| 8 judul | Ada sinyal atau tidak, tetap jalan. | Sinyal hilang, catatan tetap tersimpan. | Diagnosis: putaran 2 terbaca balik "Signal or not, it works", subjeknya hilang. Sekarang ada benda dan akibatnya. |
| 8 isi | Di Jeda, catatan tetap bisa ditulis walau tidak ada sinyal, lalu tersimpan sendiri begitu sinyal kembali. Waktu vendor kamera aksi berhenti merawat aplikasinya, YiheeCam yang menggantikan. | Di Jeda, catatan tetap bisa ditulis tanpa sinyal, lalu terkirim sendiri begitu sinyal kembali. Waktu vendor kamera aksi berhenti merawat aplikasinya, YiheeCam yang menggantikan. | Fakta sama. |
| 9a judul | Yang bisa membaca cuma orang yang memang berhak. | Siapa boleh lihat apa, saya atur dari awal. | Pelaku jelas, kalimat yang diucapkan orang saat rapat. |
| 9a isi | Di Jeda, psikolog cuma bisa membaca catatan yang dibagikan kliennya. Pohon keluarga di AkarKita hanya terbuka lewat undangan. | Di Jeda, psikolog cuma bisa baca catatan yang dibagikan kliennya. Pohon keluarga di AkarKita hanya terbuka lewat undangan. | Fakta sama. |
| 9b judul | Klien bertambah, sistemnya tidak perlu dibuat ulang. | Klien bertambah, sistemnya tetap satu. | Lebih pendek; bisa dibuktikan lewat isi di bawahnya. |
| 9b isi | ERP di software house tempat saya bekerja dipakai beberapa klien sekaligus: distribusi dan servis, asuransi kesehatan, sampai payroll perkebunan. | (sama) | Sudah lolos. |
| 10 judul | Sampai akhirnya dipakai orang setiap hari. | Sampai akhirnya dipakai tiap hari. | Dipendekkan. |
| 10 isi | Sepuluh di antaranya ada di rak ini. | (sama) | Sudah lolos. |

## Keluhan di beat 1 (kertas tempel)

Ditulis seperti ucapan pemakainya.

| Proyek | Teks |
|---|---|
| viralytics | Kampanye, kontrak, invoice, semuanya masih di spreadsheet dan grup WA. |
| yiheecam | Aplikasi kamera aksinya sudah tidak diurus vendornya. |
| fifofun | Anggaran rumah tangga tidak pernah cocok sama saldo di bank. |
| nds-etl | Distributor yang sudah sepuh ingin cek dari HP: kapan harus repeat order, dan berapa. |
| akarkita | Anak muda sering bingung harus memanggil kerabatnya apa. |

## Catatan kamera di papan

Ditulis mengikuti cara shot list dan camera report Indonesia (`riset-teks.md` bagian 3): ukuran
gambar, angle, dan gerak kamera dalam istilah Inggris atau singkatannya (MS, LS, CU, ECU, eye
level, dolly, tracking, zoom out), subjeknya dalam bahasa Indonesia biasa. "Push in" tidak muncul
di satu pun sumber Indonesia, dan "setinggi mata" adalah bentuk terjemahan mesin (blog Kling ID).

| # | Putaran 2 (aneh) | Putaran 3 |
|---|---|---|
| 1 | Push in pelan ke meja sutradara, setinggi mata. | MS meja sutradara, eye level, dolly mendekat pelan. |
| 2 | Top shot tepat di atas mesin ketik. | Bird eye view ke mesin ketik, static. |
| 3 | Tracking menyusuri dinding storyboard. | LS dinding storyboard, eye level, tracking ke kanan. |
| 4 | Crane down ke set, lampu nyala satu-satu. | Crane shot turun ke set, high angle. Lampu menyala satu per satu. |
| 5 | Handheld, ikut gerak kamera aksi dan HP. | MS laptop di set, handheld, follow kamera aksi dan HP. |
| 6 | Push in ke dua monitor timeline. | MCU dua monitor timeline, eye level, dolly mendekat. |
| 7 | Split screen, garis pembatasnya bergeser. | CU monitor grading, static. Garis pembatas sebelum dan sesudah bergeser. |
| 8 | Dari kursi paling belakang, lalu masuk ke layar. | LS ruang tonton dari baris belakang, dolly mendekat ke layar. |
| 9 | Close-up makro di segel, lalu pull back ke mesin duplikasi. | ECU segel lilin, lalu zoom out ke mesin duplikasi. |
| 10 | Ikuti satu kotak CD di conveyor. | MS kotak CD di conveyor, low angle, tracking mengikuti kotak. |

Sambungan yang ikut diganti: beat 7 "Mundur keluar dari ruang grading ke ruang tonton.", beat 10
"Kamera masuk lewat tirai rak ke seksi rak proyek."
