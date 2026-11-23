# F5 peta Nusantara dan globe malam: bukti ukur dan lembar kontak (23 Nov 2026)

Babak langkah-kecil (peta Nusantara lebar) dan penutup (globe malam, 22 satelit klien bergerak)
mendapat pose dan dunianya. Dua serah terima antartahap: `serah-peta` dari babak ramai (0,9 s) dan
`serah-globe` (0,3 s silang).

| Berkas | Isi |
|---|---|
| `components/stasiun/peta.js` | data tanpa three.js: kotak dan satuan peta (6 per derajat), kota dan rute satu cabang, bola bumi (jari-jari 100, sama dengan UV SphereGeometry), pose kedua babak, orbit satelit dari `content/klien.js` |
| `components/stasiun/peta3d.js` | dua adegan three.js, satu per tahap, dengan latar, kabut, dan cahaya sendiri; tekstur WebP didekode lewat `createImageBitmap` |
| `components/stasiun/naskah.js` | `JALUR["serah-peta"]`, `JALUR["serah-globe"]`, pose bertanda `tahap`, lapisan `silang` dengan bobot |
| `components/stasiun/adegan.js` | adegan per tahap, silang lewat satu render target tambahan, near/far dan kabut per tahap, peta dan globe dipanaskan saat senggang (unggah tekstur dan kompilasi), ukur bingkai pertama per tahap |
| `scripts/panggang-peta.mjs` | panggang tekstur kanvas previs ke `public/assets/stasiun/peta-{4096,2048}.webp` dan `bumi-{4096,2048}.webp` |

## Cara kerja serah terima

- **serah-peta**: kamera kota naik dari bidikan babak ramai sampai tegak 1,4 km di atas gedung klien,
  atap merahnya mengecil jadi satu titik di titik bidik. Di 0,45 sampai 0,75 s bingkai kota disilang
  ke peta yang kameranya juga tegak di atas Jakarta, cincin Jakarta seukuran atap tadi. Sesudah silang
  kamera peta mundur dan miring ke pose babak langkah-kecil.
- **serah-globe**: kamera peta mundur sambil membidik Jakarta, kamera globe mulai di atas Jakarta lalu
  mundur ke pose penutup; di tengah silang titik Jakarta kedua tahap berimpit.
- Tiap tahap di satuannya sendiri (meter di koordinat lantai kantor, satuan peta, satuan bumi), jadi
  float32 dan depth buffer cukup tanpa `logarithmicDepthBuffer`.
- Gulir mundur memutar jalur yang sama dengan waktu dibalik; gerak dikurangi tetap potongan dan
  satelit diam.
- Rute Jakarta ke Surabaya tumbuh sejalan gulir babak langkah-kecil.

## Ukur

`node scripts/ukur-stasiun.mjs <url>/id/v5 390x844 --dpr 2 --cpu 4 --gpu --kontak --sela` dan
`1440x900 --gpu --kontak --sela`, build produksi lokal, ANGLE D3D11. Angka di `ukur-hp.json` dan `ukur-lebar.json`.

| Ukuran | Batas | HP 390x844 DPR 2, CPU 4x | Desktop 1440x900 |
|---|---|---|---|
| Bingkai pertama peta (sampai GPU selesai) | 150 ms | 40,8 ms | 29,2 ms |
| Bingkai pertama globe | 150 ms | 62,6 ms | 53,0 ms |
| Draw call terbanyak, diam dan selama silang | 100 | 34 | 34 |
| Draw call babak peta / globe | | 9 / 18 | 9 / 18 |
| Galat konsol | 0 | 0 | 0 |

Previs mencatat 302 ms (peta) dan 403 ms (globe) karena kanvas 4096 px digambar di HP. Biaya yang
dipindah ke waktu senggang (HP, CPU 4x): peta bangun 23 ms, unggah 23 ms, kompilasi 42 ms; globe
bangun 86 ms, unggah 12 ms, kompilasi 49 ms.

Bingkai pertama tahap gedung (hero, sejak F2) terukur 202 ms di HP dan 276 ms di desktop dengan cara
ukur yang sama. Itu di luar F5 dan dicatat sebagai temuan terbuka.

Gulir balik di tengah serah-peta (`--sela`, disela di 0,7 s): urutan loncatan sesudah balik sama dengan
sebelum disela dalam urutan terbalik (41, 113, 169, 208, 221, 197, 122 lalu 122, 197, 221, ...), jadi jalurnya
diputar mundur tanpa loncat. Angka ratusan meter itu laju kamera naik 1,4 km dalam 0,75 s. Loncatan
antartahap tidak dihitung karena satuannya beda.

## Lembar kontak per 0,1 s, dicek bingkai demi bingkai

| Putaran | Temuan | Perbaikan |
|---|---|---|
| 1 | HP: tepi bawah bingkai peta lewat 60 LS (bidang kosong) | bidang peta sampai 90 LS (ditemukan tes sudut bingkai) |
| 1 | daratan lewat bujur 180 (Chukotka, Alaska) terpotong di tekstur | poligon digambar dua kali, digeser 360 derajat |
| 1 | silang peta ke globe: Jakarta di peta dan di globe di tempat berbeda | kamera globe mulai di atas Jakarta, kamera peta membidik Jakarta |
| 1 | HP: globe sepertiga atas, sisanya bintang | kamera HP 440 dari pusat (previs 560) |
| 1 | desktop: Papua terpotong di tepi kanan peta | titik bidik 15 satuan ke timur |

Raycast tengah layar kosong di 0,3 s globe HP: tengah bagian yang tampak (di atas teks) jatuh di
langit berbintang, bukan layar kosong.

Masih terlihat, untuk dinilai Farrez:
- Di HP bagian bawah peta memperlihatkan pantai Antartika di belakang kolom teks.
- Silang kota ke peta memperlihatkan garis pantai menumpuk di atas kota selama 0,3 s, tanpa motion blur.
- Busur dari Jakarta ke tujuh kota dunia di previs penutup tidak dipasang: menyiratkan klien luar negeri
  yang belum ada di data. Globe hanya membawa Jakarta dan cabang Surabaya dari peta.

## Tes dan uji mutasi

`tests/stasiun-jalur.test.mjs` (bagian F5: raycast ruas demi ruas bagian kota, silang 0,3 s, atap
mengecil di titik bidik, atap dan Jakarta berimpit dan seukuran, sudut bingkai selalu di bidang peta,
Jakarta peta dan globe berimpit di tengah silang, kamera di luar bumi dan bumi utuh di babak penutup),
`tests/stasiun-peta.test.mjs` (7 tes: bola sama dengan UV SphereGeometry, bidang peta, rute, satelit dari
data klien, orbit tidak bertabrakan selama satu putaran stasiun, Kepler, ukuran WebP). `npm test`: 337 lulus.

Empat belas mutasi sementara (cadangan `cp`, dipulihkan dan dicek `cmp` terhadap salinan asli), semuanya
merah: silang seketika, kamera kota terlalu rendah, kamera peta lepas dari Jakarta, kamera kota tidak
membidik atap, peta sampai 60 LS, globe tanpa mulai di atas Jakarta, peta mundur terlalu jauh, globe HP
terlalu dekat, orbit berlaju sama, satelit pengisi, orbit stasiun memotong orbit klien, pose peta tanpa
tahap, silang selesai di tahap asal, bujur bola terbalik.
