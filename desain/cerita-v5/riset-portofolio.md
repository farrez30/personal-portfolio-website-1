# Babak sesudah globe: menampilkan sekitar 10 proyek

19 Nov 2026. Permintaan Farrez: sesudah globe malam, satelit melesat ke balik bumi lalu keluar
sebagai portofolio. Pilihannya cincin yang mengitari bumi, masuk lagi ke ruang khusus di kantor,
showroom, atau ide lain yang lebih kreatif.

Label bukti: **D** = sumber primer dibaca, **P** = tulisan praktisi dibaca, **I** = inferensi,
**(cuplikan)** = hanya dari ringkasan hasil pencarian. Halaman dibaca lewat alat peringkas, jadi
kutipan perlu dicek ulang sebelum dikutip ke luar.

## 1. Yang diketahui

| Temuan | Sumber | Label |
|---|---|---|
| Carousel paling banyak 5 bingkai, tidak maju sendiri di HP, isi penting diulang di luar carousel | [NN/g, Designing Effective Carousels (2013)](https://www.nngroup.com/articles/designing-effective-carousels/) | D |
| 46% carousel beranda e-commerce yang diuji bermasalah; slide tidak boleh jadi satu-satunya jalan ke isi; teks slide harus HTML asli | [Baymard, Homepage carousel](https://baymard.com/blog/homepage-carousel) | D |
| Navigasi 3D untuk ruang informasi abstrak membuat orang tersesat; 3D cocok untuk benda fisik dan hiburan | [Nielsen, 2D is Better Than 3D (1998)](https://www.nngroup.com/articles/2d-is-better-than-3d/) | D, sumber lama |
| Makin banyak item disebar ke kedalaman, makin lambat orang mencari; orang tetap lebih suka versi 3D | [Cockburn dan McKenzie, CHI 2002](https://www.csse.canterbury.ac.nz/andrew.cockburn/2d3d.html) | D (halaman ringkasan, PDF tidak dibaca) |
| Gerak carousel harus bisa dihentikan (WCAG 2.2.2) | [W3C WAI, Carousels: Animations](https://www.w3.org/WAI/tutorials/carousels/animations/) | D |
| Igloo Inc membatalkan balok seragam karena proyek terlihat terlalu mirip saat dilewati; tiap proyek diberi bentuk sendiri | [Awwwards, Igloo Inc case study](https://awwwards.com/igloo-inc-case-study.html) | D |
| Perjalanan zoom galaksi ke meja yang berakhir di portofolio HTML biasa di monitor 3D | [three.js forum, Galaxy Portfolio](https://discourse.threejs.org/t/galaxy-portfolio-an-interactive-zoom-journey-from-milky-way-to-desk/82229) | P |
| Praktisi menyarankan DOM semantik paralel yang ikut sorotan 3D, plus mode lompat langsung | [three.js forum, Accessibility for 3D websites](https://discourse.threejs.org/t/accessibility-for-3d-websites/87092) | P |
| Ubin proyek di keliling globe yang berhenti pas (snap); versi awal lambat di HP karena seret dan snap berebut | [Codrops, Goodgrowth (2026)](https://tympanus.net/codrops/2026/08/27/goodgrowth-boot-sequences-spinning-discs-and-the-art-of-the-portfolio/) | (cuplikan), halaman 403 |
| Showroom 3D di web hampir selalu untuk benda fisik (mobil) | [Awwwards Inspiration, Interactive 3D Showroom](https://www.awwwards.com/inspiration/showroom-interactive-3d-showroom) | (cuplikan) |

Yang tidak ditemukan: riset kegunaan yang khusus membandingkan portofolio 3D dengan daftar biasa,
dan portofolio pemenang penghargaan berbentuk showroom mobil. Riset carousel di atas berasal dari
beranda e-commerce, jadi penerapannya ke portofolio adalah inferensi.

## 2. Lima konsep (previs di `previs/papan-porto.webp`)

| Konsep | Sambungan dari globe | Memilih proyek | Risiko utama |
|---|---|---|---|
| 1. Cincin kartu mengitari bumi | langsung, satelit jadi pembawa kartu (I) | gulir memutar cincin, ketuk kartu depan; daftar HTML wajib ada (D Baymard) | 10 kartu melewati batas 5 bingkai bila hanya satu terlihat (D NN/g); kartu di sisi jauh tak terbaca (D Nielsen) |
| 2. Konstelasi satelit, tiap proyek berbentuk bendanya | paling mulus, satelit yang ada bertambah jadi sepuluh (I) | daftar nama selalu terlihat, gulir memindah sorotan | 10 model kecil = aset terbanyak; outline per objek perlu diukur (I) |
| 3. Pulang ke kantor: lemari arsip | turun sekali gerak ke gedung yang sama (I) | map disusun rata menghadap kamera, bukan disebar ke kedalaman (D Cockburn) | klise "kamar 3D" tinggi (P); bisa antiklimaks sesudah globe (I) |
| 4. Showroom panggung putar | paling lemah, ruang baru yang tidak ada di cerita (I) | satu diorama per layar, perlu daftar terpisah (D NN/g) | metafora benda fisik untuk software (D Nielsen); 10 diorama aset terberat (I) |
| 5. Globe jadi latar, grid proyek HTML | langsung, hampir tanpa aset baru (I) | grid biasa, semua terlihat sekaligus (D Baymard) | kesan paling rendah, cerita 3D terasa habis tepat di bagian terpenting (I) |

## 3. Rekomendasi

Konsep 2 dengan gerak pembuka konsep 1 dan daftar konsep 5: satelit melesat ke balik bumi, keluar
sebagai sepuluh satelit proyek di satu bidang orbit (dari jauh terbaca sebagai cincin), tiap
satelit bersiluet sendiri, daftar nama HTML selalu terlihat dan jadi cermin DOM. Di HP daftar jadi
kartu yang digulir biasa dan globe jadi latar. Tidak kembali ke kantor.

Alasannya: sambungan terpendek (I); daftar yang selalu terlihat menjawab NN/g, Baymard, dan saran
DOM paralel sekaligus (D, D, P); siluet berbeda menjawab masalah Igloo (D); orang suka 3D walau tidak
lebih cepat (D Cockburn), jadi 3D untuk kesan dan daftar 2D untuk kecepatan.

Jalan mundur: aset tidak cukup untuk 10 model, pakai konsep 1 dengan daftar yang sama; performa HP
bermasalah, konsep 5 jadi lantai aman. Showroom tidak disarankan.

Keyakinan: sedang. Riset kegunaannya umum, bukan khusus portofolio 3D; dua rujukan terdekat untuk
cincin hanya terbaca dari cuplikan.
