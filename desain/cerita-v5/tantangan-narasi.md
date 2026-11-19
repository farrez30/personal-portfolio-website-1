# Menantang arah A, lalu mencari alternatif dari keluhan pembeli

19 Nov 2026, putaran kedua. Farrez meminta arah A ("satu nota", ADR 0018) ditantang: cari celahnya,
lalu riset apa yang benar-benar dikeluhkan dan dicari pemilik usaha dan perusahaan, termasuk beban
trafik, keamanan siber, dan kasus yang biasa terjadi di lapangan pada ERP dan software.

Tiga subagen riset (Fable 5.2, effort medium). Label: **D** sumber primer yang dibaca, **P** praktisi
atau media, **I** inferensi, **(cuplikan)** hanya terlihat di ringkasan pencarian.

Sketsa alternatif: `pratinjau/papan-e.png` (uji tekan), `papan-f.png` (sehari dua kali),
`papan-g.png` (yang ditimbang). Data panel di `pratinjau/arah.json`.

## 1. Celah arah A

| Celah | Kenapa penting | Dasar |
|---|---|---|
| Babaknya mengikuti urutan kerja developer (rencana, fondasi, progres), bukan perjalanan pembeli | pembeli menilai hasil dan risiko; sebagian besar penilaian terjadi tanpa vendor hadir | Gartner: pembeli B2B hanya sekitar 17% waktu bertemu pemasok (cuplikan) |
| Ketakutan terbesar pembeli tidak disebut terang | biaya molor, kebutuhan salah tangkap, kode tidak diserahkan adalah tema terkuat di riset | bagian 2 |
| Beban trafik, serangan siber, data hilang, migrasi tidak punya adegan | ini risiko lapangan teratas | bagian 3 |
| Tidak menjawab "kenapa tidak pakai aplikasi jadi saja?" | arah A berpusat di kasir, jadi bersaing dengan aplikasi kasir jadi | Fowler UtilityVsStrategic: utilitas pakai paket jadi, yang membedakan usaha dibuat custom (P) |
| Klien Farrez bukan hanya toko | ada bank, asuransi, distributor, perkebunan, pabrik pangan (`content/klien.js`) | D, dari repo |
| Globe dan satelit tanpa data nyata | GitHub sengaja memakai data asli supaya globe tidak terbaca hiasan | github.blog, D |
| Farrez tidak muncul | pembeli jasa kecil membeli kepercayaan pada orang; riset tidak memberi angka untuk ini | I |
| Klaim yang belum ada buktinya di portofolio | uji beban, cadangan teruji, dan pemantauan tidak ditemukan di `content/` | D, dari repo |

## 2. Yang dikeluhkan dan dicari pembeli

| Tema | Bobot | Bukti | Label |
|---|---|---|---|
| Biaya dan jadwal molor | sangat kuat | Panorama: 32,8% proyek ERP lewat anggaran, 31,3% telat (131 responden 2022-2023); proyek TI besar rata-rata 45% lewat anggaran (McKinsey/Oxford); 18% proyek TI publik pembengkakan di atas 25% (Budzier dan Flyvbjerg 2013) | P lewat Accounting Today; cuplikan; D (arXiv) |
| Kebutuhan salah tangkap | kuat | 59% bisnis menyesali minimal satu pembelian software; yang menyesal paling ingin memperjelas tujuan sejak awal (36%) | D (siaran pers Capterra 2024) |
| Tidak jelas hak atas kode dan sulit lanjut bila vendor pergi | kuat secara hukum | Pasal 36 UU 28/2014: hak cipta software pesanan mengikuti perjanjian; tanpa perjanjian, ada pada pembuatnya. Jadi yang ditakuti bukan "kode tidak diserahkan", tetapi hak yang tidak tertulis. Skema sah: pengalihan penuh, lisensi, escrow, atau langganan | D (Hukumonline, BP Lawyers) |
| Manfaat tidak tercapai | kuat, korporasi | 70% inisiatif ERP tidak sepenuhnya memenuhi business case, 25% gagal katastrofik (Gartner lewat The Register 2025) | P |
| Sistem tidak dipakai tim | sedang | Gartner: manajemen perubahan terbatas; UMKM lebih sering menyalahkan implementasi buruk | P; cuplikan |
| Dukungan setelah jadi | sedang | dukungan tidak memadai 39% di survei UMKM Capterra 2023 | cuplikan |
| UMKM masih manual, tanpa orang teknis | kuat, UMKM | 77% dari yang mencatat keuangan masih manual (OCBC BFI 2024); 26% UKM menyebut keahlian teknis internal terbatas sebagai tantangan terbesar (Clutch 2026) | D |
| Keamanan dan kebocoran data | sedang, didorong UU PDP | kewajiban lapor 3 x 24 jam (Pasal 46 UU 27/2022) | D lewat salinan pasal.id |

Lima kebutuhan pembeli teratas (I, urut kekuatan bukti): kepastian biaya dan lingkup bertahap;
vendor yang menggali kebutuhan dulu; kepemilikan kode, akun, data, dan dokumentasi; kualitas
terbukti lewat portofolio dan uji coba; pendampingan setelah jadi.

Celah riset: tidak ditemukan thread forum Indonesia tentang vendor menghilang; tidak ada angka
untuk "tumbang saat ramai", "data hilang", dan "laporan tidak bisa dipercaya" dari survei pembeli.

## 3. Kasus lapangan

| Risiko | Kasus | Label |
|---|---|---|
| Data hilang, cadangan tidak teruji | PDN Surabaya Juni 2024: menurut Kepala BSSN hanya 2% data ter-backup; GitLab 2017: lima lapis backup gagal, 6 jam data hilang; Code Spaces 2014: backup di akun yang sama, perusahaan tutup | P; D (postmortem GitLab); P |
| Serangan siber | 49% usaha kecil Indonesia kehilangan waktu atau uang akibat serangan siber pada 2025 (CPA Australia); BSI Mei 2023 (LockBit) | D; P |
| Go-live sekaligus tanpa jalur mundur | Coretax Jan 2025 akhirnya jalan paralel dengan sistem lama; TSB 2018 didenda £48,65 juta; Hershey 1999 go-live di musim puncak | D (DJP), P; D (FCA); P |
| Tumbang saat ramai | PPDB 2024 (502 Bad Gateway, pendaftaran dialihkan offline); tiket Lebaran KAI 2025; promo 9.9 2024; Healthcare.gov 2013 kapasitas tidak direncanakan | cuplikan; D (GAO) |
| Data master kotor, angka tidak cocok | 65% catatan stok peritel tidak cocok dengan fisik (DeHoratius dan Raman 2008); Target Canada; Revlon "material weakness" | cuplikan; P |
| Proses dipaksakan ke software | Lidl menghentikan SAP setelah 7 tahun karena menolak mengubah proses | P |
| Bergantung pada satu vendor | Builder.ai 2025: klien terkunci dari kode dan data | P |
| Listrik dan cloud padam | PLN Agustus 2019 sekitar 21,9 juta pelanggan; CrowdStrike Juli 2024; AWS us-east-1 Okt 2025 | P; D; D |

Catatan kejujuran: Coretax tidak pernah resmi disebut tumbang karena trafik (DJP hanya menyebut
penambahan bandwidth); angka kebocoran BSI, Tokopedia, BPJS, dan Bjorka adalah klaim pelaku.

## 4. Kerangka narasi yang dipakai alternatif

| Kerangka | Isi | Label |
|---|---|---|
| Empat gaya kemajuan (JTBD) | orang pindah bila dorongan plus tarikan lebih besar dari cemas plus kebiasaan | D (jobstobedone.org, Christensen Institute) |
| JOLT | 40 sampai 60% deal kalah berakhir tanpa keputusan; menambah rasa takut saat pembeli ragu memperburuk di 84% kasus; angkat risiko dari meja | D, ringkasan penerbit metode |
| Pre-mortem | anggap proyek sudah gagal, tulis sebabnya, lalu cegah | D, ringkasan HBR |
| StoryBrand | klien sebagai tokoh utama, vendor sebagai pemandu | P, tanpa uji independen |
| Studi kasus | format kedua paling dihargai pembeli B2B (40%) | cuplikan |

Pelajaran yang mengikat semua alternatif (I, dari JOLT): rasa takut tidak dijual. Tiap ujian selesai di
adegan yang sama, dan bagian "selamat" lebih lama dari bagian "masalah".

## 5. Alternatif

| | A. Satu nota (terpilih sebelumnya) | E. Uji tekan | F. Sehari dua kali | G. Yang ditimbang |
|---|---|---|---|---|
| Premis | urutan kerja, nota jadi titik data | satu nota melewati hari terburuk dan selamat | satu hari pemilik usaha, sebelum dan sesudah | cemas pembeli dijawab satu per satu |
| Menjawab keluhan pembeli (bagian 2) | sebagian, tersirat | biaya tidak langsung; kode, adopsi, data langsung | sedang | paling langsung, kelima tema |
| Memuat kasus lapangan (bagian 3) | padam saja | ramai, padam, serangan, data hilang, migrasi, ganti orang, cabang, serah terima | ramai dan padam | ramai, data, kebiasaan |
| Cocok untuk korporasi | lemah | kuat | lemah, harinya hari toko | kuat |
| Drama dan visual | sedang | kuat, tiap babak satu kejadian | kuat, emosional | lemah, risiko jadi FAQ beranimasi |
| Zoom makro yang beralasan | Nusantara dan globe hiasan | kota saat ramai dan padam, Nusantara saat cabang | peta cabang gelap lalu menyala | kota dan Nusantara |
| Satelit di penutup | ya | ya: cabang atau kebun terpencil tetap tersambung (perlu konfirmasi) | ya: langit malam | ya |
| Risiko | mirip iklan aplikasi kasir | menakut-nakuti bila salah tempo; tiap klaim harus pernah diuji | generik (StoryBrand banyak dipakai) | datar |
| Rekomendasi | | **ya** | | |

Kenapa E (I): satu-satunya arah yang memuat semua yang diminta Farrez (beban, keamanan, kasus
lapangan), berlaku untuk UMKM dan korporasi, dan tiap zoom makro punya sebab fisik (lonjakan dan
padam memang terjadi sekota, cabang memang tersebar). Urutan kerja lama tidak hilang: rencana,
fondasi, prototipe, dan uji masuk sebagai jawaban tiap ujian. Saran gabungan: buka dengan satu
babak "hari biasa" dari F, tutup dengan langkah kecil dari G, dan isi babak bukti dengan angka dari
satu klien nyata (kerangka D di riset) bila ada izinnya.

Kapan E salah: bila klaimnya tidak bisa dibuktikan. Uji beban, latihan pulih dari cadangan, dan
serah terima kode harus benar-benar pernah dilakukan; kalau belum, babaknya dibuang atau
dikerjakan dulu sebagai pekerjaan sungguhan sebelum diceritakan.

## 6. Yang perlu dikonfirmasi Farrez sebelum E dipakai

- Pernah menjalankan uji beban (k6, JMeter, atau sejenis) di proyek mana?
- Cadangan data pernah dicoba dipulihkan?
- Hak atas kode (dialihkan atau lisensi) ditulis di kontrak, dan data klien bisa diekspor?
- Harga dan lingkup ditulis per tahap?
- Ada cabang atau kebun klien yang memakai koneksi satelit (mis. perkebunan)? Kalau tidak, satelit
  di penutup dibaca sebagai "tersambung ke mana saja", bukan klaim proyek.
- Klien mana yang mengizinkan angka hasilnya ditampilkan?

## 7. Belum terverifikasi

- Angka Gartner, Capterra (rincian UMKM), McKinsey, dan Edelman hanya dari cuplikan atau pihak ketiga.
- Standish CHAOS tidak dipakai: sumber sekunder saling bertentangan.
- Tidak ada kasus kegagalan ERP korporasi Indonesia yang bernama di media.
- Tidak ada contoh scrollytelling "uji tekan" yang digerakkan gulir; acuan visual terdekat adalah
  simulasi antrean dan load balancing Sam Rose (samwho.dev, D) yang interaktif, bukan gulir.
- Skor dan rekomendasi adalah inferensi, belum diuji ke pemilik usaha.

## 8. Keputusan Farrez, 19 Nov 2026

- **Arah G, "yang ditimbang sebelum memutuskan"**, dipilih di atas rekomendasi E. Alasannya, dalam
  kata Farrez: "Isinya bisa diteruskan pemilik ke orang keuangan dan TI di perusahaannya."
- **Klaim yang dikonfirmasi Farrez:** uji beban, latihan pulih cadangan, harga dan lingkup per
  tahap, dan hak atas kode sesuai kesepakatan.
- **Koreksi Farrez soal kode:** kode tidak selalu diserahkan; bisa dialihkan penuh atau hanya
  lisensi, sesuai kontrak, seperti di kantornya. Babak vendor diubah jadi "yang Anda dapat tertulis
  sejak awal": milik atau lisensi sesuai kesepakatan, data tetap milik klien dan bisa diekspor
  (klien adalah pengendali data menurut UU PDP), catatan cara kerja ada. Escrow disebut sebagai
  pilihan, tetapi seberapa umum di Indonesia belum dicek (I). Label: dikonfirmasi pemilik; tiap klaim dikaitkan ke
  proyek bernama saat teks ditulis.
- **Satelit tetap di penutup.** Rak dan loader CD diputuskan setelah previs.
- Menjaga risiko G (terbaca seperti FAQ): tiap rasa cemas diberi satu kejadian konkret dari bagian 3,
  dan diselesaikan di adegan yang sama.
- ADR: `docs/decisions/0019-story-v5-what-the-buyer-weighs.md` (menggantikan 0018).
