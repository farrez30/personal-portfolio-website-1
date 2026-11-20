# Bentuk prop kartun 3D

20 Nov 2026. Masukan Farrez: hampir semua benda masih terlalu basic bentuknya. Tekstur, palet,
dan gaya toon bergaris tinta tetap; yang diperbaiki bentuk, siluet, dan kepadatan detail.
Lembar look-dev (`docs/look-dev/cerita-v5.md`) sebelumnya menetapkan "kotak dan silinder tanpa
bevel"; aturan itu diganti oleh aturan di bawah.

Label: **D** sumber dibaca, **I** cuplikan atau inferensi.

## 1. Temuan

| Temuan | Sumber | Label |
|---|---|---|
| Shape language: kotak terasa kokoh, lingkaran terasa ramah; siluet terbaca sekilas | [Blizzard, Overwatch](https://overwatch.blizzard.com/en-gb/news/23537427) | D |
| Outer Wilds: bentuk tajam terstilisasi, gradasi besar, kesederhanaan lebih penting daripada detail; rasa NASA 60-an dan 70-an | [Mobius Digital](https://www.mobiusdigitalgames.com/blog/our-new-style); [80.lv](https://80.lv/articles/dissecting-the-art-style-of-outer-wilds) | D, I |
| Fortnite dan Sea of Thieves: buang garis sejajar, prop sedikit miring, beri tanda pakai, jangan tambah benda yang terlalu kecil | [habrador](https://blog.habrador.com/2018/08/stylized-graphics-fortnite-sea-of-thieves.html) | I |
| Hierarki detail primer, sekunder, tersier; sekitar 70% permukaan polos | Packt; catatan 123 | I |
| Robot disukai karena matanya; EVE mulus tanpa fitur, mata sederhana membawa suasana hati | [Core77](https://www.core77.com/posts/54328/Whats-the-One-Design-Element-That-Can-Make-a-Robot-Lovable) | D |
| Astro Bot: kepala kubah, mata LED, rangka ringkas, sendi terlihat | [PlayStation Blog](https://blog.playstation.com/?p=395223) | D |
| GERTY: seperti tumpukan PC lama dibaut, bola kamera, wajah emotikon | [Gavin Rothery](https://www.gavinrothery.com/making-of-moon-blog/4jxxlhr6bjxm6en-h3225-4xj8d) | D |
| Cel shading tanpa nada antara: beda kecil pada normal jadi noda besar | Motomura, GDC 2015 | I |
| RoundedBoxGeometry: segitiga = 12(2s+1)², s=2 jadi 300, s=3 jadi 588 | [three.js](https://threejs.org/docs/pages/RoundedBoxGeometry.html) | D |
| Target draw call HP kelas bawah 100 sampai 200 | [PlayCanvas](https://developer.playcanvas.com/user-manual/optimization/guidelines/) | D |
| Patch bordir NASA bertepi jahitan pearl tebal | [NPR 2023](https://www.npr.org/2023/02/24/1159019083/nasa-spacex-mission-patches) | I |

## 2. Aturan bentuk (dipakai di lembar look-dev)

| Aturan | Angka | Dasar |
|---|---|---|
| Benda ramah (robot, astronot) lingkaran dan kapsul; benda kokoh (loker, rak, tablet) kotak berbevel | | Overwatch (D) |
| Radius bevel benda keras | 8 sampai 15% sisi terpendek | inferensi (I) |
| Radius bevel benda ramah | 25 sampai 50% | inferensi (I) |
| Bevel terlihat di layar | paling sedikit 3 px | inferensi (I) |
| Detail per benda | 1 primer, 2 sampai 4 sekunder, 3 sampai 8 tersier; 70% polos | Packt (I) |
| Detail terkecil | paling kecil 1/20 dimensi terbesar dan 8 px di HP | Fortnite/SoT (I) |
| Bagian yang disentuh tangan (pegangan, bumper, tali) | 1,5 sampai 2 kali ukuran nyata | praktik stylized (I) |
| Hindari garis sejajar sempurna | miring atau tirus 2 sampai 5° | Fortnite/SoT (I) |
| Kepala robot dan astronot | 40 sampai 55% tinggi total | Astro Bot (D), Kerbal (I) |
| Mesh yang menempel atau koplanar | beri jarak nyata, atau gabung jadi satu mesh | forum Godot (I) |

Angka rasio adalah inferensi: tidak ada studio yang menerbitkan rasio bevel. Dicek lewat cek
siluet dan berdampingan di adegan.

## 3. Resep ringkas

| Benda | Bagian penyusun | Detail kunci |
|---|---|---|
| Tablet prosedur | cangkang RoundedBox tebal 2 sampai 3 kali iPad, empat bumper sudut menonjol, layar tertanam dalam bezel, tali tangan di punggung, kotak Velcro, cincin tether | bumper tebal dan tali |
| Loker dan rak | rangka berlubang 2 x 4, pintu RoundedBox lewat InstancedMesh, pegangan setengah torus besar, dua kancing, plat label kode | grid pintu berlabel, satu pintu terbuka |
| Robot | kepala RoundedBox bulat (radius 30 sampai 40%), layar mata, badan telur (Lathe), antena, lengan kapsul dengan sendi bola, bola kamera di bawah kepala | mata di layar |
| Astronot | helm bola besar, visor, cincin leher tebal, badan kapsul gemuk, ransel PLSS, sarung tangan dan sepatu besar, patch bahu | visor dan ransel |
| Patch | badan pipih, tepi bordir torus tebal, isi datar 3 sampai 4 warna, satu elemen timbul | tepi bordir |
| Layar kokpit | bezel Extrude berlubang, tudung anti-silau miring, deret tombol besar, lengan dudukan | tudung dan bezel tebal |
| Lembar prosedur | clipboard, penjepit besar, kertas sedikit melengkung, 2 sampai 3 lembar bertumpuk miring | kertas melengkung |

Risiko: bevel satu segmen bisa memunculkan garis ganda di outline normal; bevel terlalu besar
membuat benda keras terlihat seperti mainan karet; merge geometri menghilangkan transform bagian
yang bergerak. Anggaran segitiga HP hanya patokan forum, jadi diukur di perangkat.
