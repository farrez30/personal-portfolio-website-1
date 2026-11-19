# Riset audit ulang dunia toko kaset, 19 Nov 2026

Tiga subagen riset (Fable 5.2, effort medium) untuk 12 temuan Farrez tanggal 19 Nov 2026
(tangkapan layar di catatan sesi `masukan-farrez-19nov-b`). Label: **D** dokumentasi atau sumber
primer yang dibaca, **P** praktisi, **I** inferensi, **(cuplikan)** hanya terlihat di ringkasan
hasil pencarian, halamannya tidak terbuka.

## Yang dibuktikan dengan alat ukur, bukan riset

| Butir | Temuan | Bukti |
|---|---|---|
| 1 cincin di lantai | Bukan bayangan sangkar lampu (dugaan sesi lama). Sumbernya kerucut berkas lampu gantung: `pow()` dengan basis sedikit negatif di tepi bawah memberi NaN, additive menjadikannya hitam. Kerucut juga menyala sesaat di setiap perpindahan babak, jadi cincinnya hanya muncul saat kamera terbang. | Sapuan gulir desktop (bingkai 015, 016, 026, 038), bingkai beku `?uji-dunia`: cincin hilang hanya saat grup nyala disembunyikan. PR #83. |
| 8 stempel | Pose stempel dipetakan langsung ke gulir: mundur menghapus cap, langkah gulir HP melompati fase, dan props membaca geser kamera yang meluncur dari babak sebelumnya. | Sapuan mundur babak rencana. PR #83. |
| 9 lag HP | Beku 2.102 ms di babak bentuk = rak koleksi 3D dibuat sepuluh layar lebih awal, di tengah gulir. Isinya: isi awal tekstur per piksel (`petaData`, 407 ms), pola butir kertas LeafThrough (526 ms), analisis kolom ilustrasi album (`getImageData`, 980 ms), lalu 8,7 s pemanasan dengan long task 80 sampai 260 ms. | CDP, 390x844 DPR 3, CPU 4x, profil CPU per fungsi. |
| 10 rak dari bawah | "Rak masuk dari kanan" di PR #81 tidak pernah dikodekan; panggung selalu naik dari bawah. | Pengukuran transform panggung per posisi gulir. |

## Kaca vitrin (butir 4)

| Klaim | Label | Sumber |
|---|---|---|
| Kaca float tampak hijau di tepi dan lembar tebal karena besi; dari depan hampir tak berwarna | P | en.wikipedia.org/wiki/Float_glass |
| Semua kaca etalase berwarna sedikit karena besi; low-iron mengurangi | P | info.gaylord.com/all-about-glass-showcases |
| Vitrin meja memakai kaca tempered 5 mm (pintu 6 mm, rak 8 mm) | I (cuplikan) | displays2go.com, archiexpo (403) |
| Dengan transparansi alpha, menurunkan opasitas ikut meredupkan pantulan; hanya transmission yang mempertahankannya | P | discourse.threejs.org/t/17611 (donmccurdy) |
| Alpha tinggi di sudut miring tanpa peta lingkungan hanya mengecat warna difus kaca; sisi kotak selalu miring, jadi volumenya terbaca terisi (jeli) | I | hitungan Schlick F0 0,04 |
| Transparan diurutkan per objek, bukan per muka; satu mesh per panel | P | discourse.threejs.org/t/11553 |

Rekomendasi: lima panel tipis 5 mm (bukan satu kotak), muka hampir tak terlihat (alpha 0,03
sampai 0,08, maksimum sekitar 0,15 di sudut miring), sorot garis dan pantulan lampu sebagai lapisan
terpisah yang dikali fresnel, dan tepi panel yang terlihat sebagai bahan hijau botol hampir buram,
isyarat terkuat bahwa itu kaca.

## Sorot benda bab bentuk (butir 2)

| Klaim | Label | Sumber |
|---|---|---|
| SpotLight three punya angle, penumbra, decay 2; peta cookie hanya jalan bila castShadow | D | threejs.org/docs SpotLight |
| Lampu aksen sungguhan: sorot sempit di bawah 10 derajat untuk benda kecil, benda sekitar 5x lebih terang dari sekitarnya, tepi bersih sedikit lembut | I (cuplikan) | erco.com (429) |
| Bidang additive yang memotong geometri terbelah tajam oleh uji kedalaman | P | vfxdoc.readthedocs.io fading, NVIDIA Soft Particles 2007 |

Rekomendasi yang dipakai: buang elips dan kolam palsu; benda diterangi lampu sungguhan. Dipakai
lampu kunci yang sudah ada, dipindah ke atas depan benda dan kerucutnya disempitkan, supaya
jumlah lampu tetap (lampu baru mengompilasi ulang semua shader dan menambah beban per piksel HP).

## Benda nyata (butir 3, 5, 6, 7)

| Benda | Ukuran dan ciri | Label | Sumber |
|---|---|---|---|
| Ponsel Galaxy A55 | 161,1 x 77,4 x 8,2 mm; sisi datar, sudut membulat, tiga cincin kamera tegak di kiri atas | P (cuplikan) | gsmarena, sammobile |
| Laptop 14 inci | Vivobook 14 X1404 324,9 x 213,9 x 17,9 mm; IdeaPad Slim 3 314,4 x 222,1 x 16,9 mm | D (cuplikan) | asus.com, psref.lenovo.com |
| Dudukan brosur A5 akrilik | Miring 148 x 169 x 205 mm, tatakan 50 mm, akrilik 2 mm bertepi mengilap | P (cuplikan) | slimlinewarehouse |
| Dudukan ponsel lipat | 120 x 76 x 20 mm, pelat 2 mm, dua engsel, bantalan silikon | P (cuplikan) | Ugreen, StarTech |
| Kotak software | Big box sekitar 178 x 229 x 51 mm; kedalaman 51 mm yang membuatnya terbaca software | P (cuplikan) | raspberrypi.com |
| Mug keramik 11 oz | Tinggi sekitar 95 mm, diameter 80 sampai 83 mm, lebar dengan gagang 120 mm | P (cuplikan) | optimalprint |
| Gelas belimbing (gelas kopi) | Tinggi 9,6 cm, diameter 9 cm, 340 ml; versi polos umum disebut gelas kopi di rumah dan warung | P (cuplikan) | productnation.co/id |
| Gelas kertas 8 oz | Atas 79 mm, bawah 57 mm, tinggi 89 mm | P (cuplikan) | webstaurantstore |
| Kotak MCB | Schneider Domae 8 modul 222 x 208 x 92 mm; MCB 1 kutub 18 x 81 x 71,5 mm di rel DIN | D/P (cuplikan) | eshop.se.com |
| Lonceng toko modern | Tinggi 178 mm, cangkir 41 mm, pegas pelat 12,7 mm, dipasang di sisi dalam ambang atas daun pintu | P | kilianhardware.com/shdobe.html |
| Lonceng toko antik | Pegas ulir lurus 34 sampai 35 cm, cangkir 14,5 cm, dipasang di kusen di atas pintu | P (cuplikan) | drewpritchard.co.uk |
| Ruko | Muka 4 sampai 5 m, lantai dasar 3,2 sampai 3,8 m, rolling door 3 x 2,9 m | P (cuplikan) | rumah123, tokopedia |
| Lampu jalan | Sodium 1400 sampai 2700 K jingga; LED putih 4500 sampai 6500 K | P | wikipedia Sodium-vapor lamp, IEEE Spectrum |

Inferensi utama (I): pegas lonceng yang melengkung saat diam tidak cocok dengan kedua jenis
lonceng sungguhan (pelat lurus yang naik lalu menekuk ke depan, atau ulir lurus yang kaku).
Gedung tampak seperti kardus karena satu bidang datar, cahaya rata, tanpa lapisan dan paralaks;
jalan dari balik kaca disusun berlapis (pantulan di kaca, teras, jalan, ruko seberang dengan
rolling door, tiang dan kabel, langit), dengan blur yang naik menurut jarak.

## Gulir HP dan teks (butir 11, 12)

| Klaim | Label | Sumber |
|---|---|---|
| Kartu berikut yang terlihat sebagian adalah isyarat carousel yang kuat; titik isyarat yang lemah | D | nngroup.com/articles/mobile-carousels (Budiu 2018) |
| Sebagian besar peserta setidaknya sedikit bingung oleh scrolljacking; hindari di mobile atau buat versi khusus | D | nngroup.com/articles/scrolljacking-101 (Paul 2023) |
| WCAG 2.5.7: fungsi geser harus bisa dengan satu penunjuk tanpa menyeret; gulir overflow bawaan dikecualikan | D | w3.org WCAG 2.2 dragging-movements |
| Tidak ada riset yang mengukur petunjuk ghost swipe | I | pencarian tanpa hasil |
| GSAP termasuk SplitText gratis untuk komersial sejak 3.13 (29 Apr 2025) | D | gsap.com/blog/3-13 |
| SplitText `aria: "auto"` memberi aria-label di induk dan aria-hidden di potongan | D | gsap.com/docs SplitText |
| Animasi blur per kata mahal di HP; transform dan opacity murah | I | |

## Mengukur HP dari desktop (butir 9)

| Klaim | Label | Sumber |
|---|---|---|
| Throttling 4x adalah relatif terhadap mesin; DevTools tidak bisa meniru arsitektur CPU ponsel | D | developer.chrome.com/docs/devtools/device-mode |
| GPU tidak ikut diperlambat; angka desktop adalah batas bawah untuk WebGL | I | |
| Remote debugging HP lewat chrome://inspect, rekam trace di perangkat | D | developer.chrome.com/docs/devtools/remote-debugging |

## Belum terverifikasi

- Sebagian besar ukuran benda hanya dari cuplikan pencarian.
- Tampilan kaca vitrin di foto (garis sorot, tepi panel) dan alasan "fresnel alpha membuat kotak
  terlihat terisi": inferensi, tidak ada sumber praktisi yang membahasnya langsung.
- Perilaku HP sungguhan Farrez: belum diukur di perangkatnya.
