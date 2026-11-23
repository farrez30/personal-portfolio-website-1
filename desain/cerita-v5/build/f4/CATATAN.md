# F4 keluar jendela ke kota: bukti ukur dan lembar kontak (23 Nov 2026)

Babak kebiasaan ke ramai (jenis `jendela`, 2,8 s, makro). Kamera keluar lewat celah jendela tanpa
tiang di x = 8, datar setinggi 2,4 m sampai di luar fasad, naik di atas jalan depan, lalu menjauh ke
bidikan kota previs. Di babak ramai lalu lintas dan titik pesanan amber memadat sejalan gulir, dan
pesanan mendarat di atap gedung klien.

| Berkas | Isi |
|---|---|
| `components/stasiun/kota.js` | data kota tanpa three.js (dari previs `ADEGAN.kota`), kulit gedung klien, pose babak ramai, lalu lintas, pesanan |
| `components/stasiun/kota3d.js` | satu mesh gabungan untuk benda diam, InstancedMesh mobil berkabin dan pesanan |
| `components/stasiun/naskah.js` | `JALUR.jendela` (Catmull-Rom centripetal, arah pandang sebagai yaw, pitch, jarak), `lintasTahap`, durasi makro tidak dibatasi 1,8 s |
| `components/stasiun/adegan.js` | kota tampak sejak babak kebiasaan, pelat atas dan atap hanya sesudah keluar jendela (crane F3 tetap terbuka), bayangan kota hanya di desktop, gulir balik di tengah perpindahan memutar jalur yang sama mundur |
| `components/stasiun/lantai.js` | kaca fasad dibelah, celah jendela terbuka; `CELAH_JENDELA`, `FASAD` |

## Ukur

`node scripts/ukur-stasiun.mjs <url>/id/v5 390x844 --dpr 2 --cpu 4 --gpu --kontak --sela` dan `1440x900 --gpu --kontak --sela`,
build produksi lokal, ANGLE D3D11. Angka di `ukur-hp.json` dan `ukur-lebar.json`.

| Ukuran | Batas | HP 390x844 DPR 2, CPU 4x | Desktop 1440x900 |
|---|---|---|---|
| Draw call terbanyak, diam dan selama perpindahan | 100 | 25 | 25 |
| Segitiga di babak ramai, dua pass (normal dan warna) | | 321 ribu | 361 ribu |
| Galat konsol | 0 | 0 | 0 |

Segitiga kota satu pass paling banyak 146 ribu (99 ribu benda diam, 34 ribu mobil, 14 ribu pesanan;
hitungan di tes `stasiun-kota`, desktop; HP memakai separuh mobil dan pesanan), di bawah anggaran 250 ribu.
Angka `renderer.info` di atas menjumlah dua pass ditambah lantai kantor.

Opsi baru `--sela`: tiap perpindahan disela di 0,7 s lalu digulir balik. Langkah pertama sesudah balik
sama dengan langkah terakhir sebelum disela di semua perpindahan (misalnya kebiasaan ke ramai 0,786 m
dan 0,786 m), jadi gulir balik tidak meloncat. Lompatan 5,7 m di tarikan ke biaya adalah potongan
layar F3 yang disengaja.

## Lembar kontak per 0,1 s, dicek bingkai demi bingkai

| Putaran | Temuan | Perbaikan |
|---|---|---|
| 1 | 0,6 sampai 1,5 s bingkai hampir penuh bidang krem dan gelap: dinding menara di seberang jalan, 8 m dari jendela | blok seberang jendela selalu taman; pitch keluar -0,14 supaya jalan dan mobil masuk bingkai |
| 2 | 1,4 sampai 1,5 s satu tajuk pohon taman di tepi jalan memenuhi bingkai saat kamera naik | pohon taman seberang di separuh belakang |
| 2 | dari dekat mobil terbaca sebagai balok putih; dari bidikan kota gedung klien beratap ungu tenggelam; titik pesanan 1,8 m tidak terlihat dari 700 m | mobil diberi kabin; atap gedung klien merah; pesanan jari-jari 5 m |

Raycast tengah layar tidak pernah kosong selama 2,8 s (HP dan desktop): lantai, toon, lalu kota.

Masih terlihat, bukan tembus dan bukan layar kosong, untuk dinilai Farrez:
- 1,4 s di HP: bingkai hampir seluruhnya rumput taman seberang (satu pohon di atas), sesaat sebelum naik.
- Batang pohon kota ungu (pemetaan palet previs `0x6e665d` ke `#cdb8e8`); dari jalan terlihat seperti tiang ungu.
- Teks babak kebiasaan masih tampil saat kota sudah penuh di bingkai (pemicu anchor di tepi atas seksi, catatan F2).

## Cacat previs yang ditemukan tes dan diperbaiki

Tes lajur mobil memeriksa seluruh pita tiap lajur (44 lajur) terhadap semua benda kota:
- jembatan previs setinggi 2 sampai 4 m memotong lajur jalan z = 0; sekarang satu jembatan rata aspal di tiap jalan inti yang menyeberangi sungai;
- tiang tol layang berdiri di lajur jalan inti; tiang di jalan dilewati;
- kelompok pohon pinggiran dan pohon tepi sungai tumbuh di lajur jalan terluar; disaring dengan sela 16 m dari tepi kota.

## Tes dan uji mutasi

`tests/stasiun-jalur.test.mjs` (jalur jendela: raycast ruas demi ruas 1201 titik terhadap lantai, kulit
gedung, dan kota dengan jarak aman setebal bidang dekat; lewat celah dengan sela 1 m dari kusen dan
ambang; datar sampai di luar fasad; sinar tengah tidak kena kusen; naik di atas jalan; tanpa jeda mati),
`tests/stasiun-kota.test.mjs` (9 tes), `tests/stasiun-lantai.test.mjs` (durasi makro, lompatan lintas
tahap jadi potongan). `npm test`: 322 lulus.

Enam belas mutasi sementara (cadangan `cp`, dipulihkan dan dicek byte demi byte), semuanya merah: jendela
tanpa titik antara, keluar dekat kusen, keluar terlalu rendah, menengadah saat keluar, naik di atas taman,
durasi makro dibatasi, lompatan lintas tahap tetap blend, tanpa taman seberang, pohon taman di tepi jalan,
pohon tepi sungai di jalan, gedung klien tertutup menara, kelompok pinggiran di jalan, jembatan previs,
tiang tol di jalan, lajur di trotoar, lalu lintas tidak memadat.

Dua penjaga yang tetap hijau saat dimutasi dibuang karena tidak berpengaruh: pemendek gedung di garis
pandang ke gedung klien (tidak memendekkan satu gedung pun) dan saringan pohon kelompok per batang
(saringan di pusat kelompok sudah cukup). Garis pandang tetap dijaga tesnya.
