# F3 perpindahan bertipe: bukti ukur dan lembar kontak (21 Nov 2026)

Enam jenis dari ADR 0023 menggantikan blend arah pandang di lantai kantor. Rumusnya di
`components/stasiun/naskah.js` (`JALUR`, `poseJalur`, `poseAntara`), diturunkan dari previs
(`previs.html`, `pindah()`) lalu disesuaikan dengan data lantai F2. Blend dari hero ke meja 1 tetap
`poseBlend`. Gulir mundur memutar jalur yang sama dengan waktu dibalik; lompatan jauh dan
perpindahan yang disela di tengah memakai blend; gerak dikurangi tetap potongan (`durasiAntara`).

| Jenis | Dari ke | Yang terjadi |
|---|---|---|
| ikut | dorongan ke harga-diam | nota merah lepas dari timbangan meja 1 (mesh tersendiri), terbang melengkung, mendarat di atas koin di timbangan meja 2; kamera mengikutinya dari belakang |
| whip | harga-diam ke tarikan | kamera diam, menoleh sekitar 105 derajat dengan lewat 5% lalu balik (ease-out-back), baru maju |
| layar | tarikan ke biaya | masuk ke tablet meja 3 sampai layarnya memenuhi bingkai yang tampak (termasuk geseran kolom teks), potong ke tablet meja 4 yang berlayar sama, keluar ke tampak atas |
| orbit | biaya ke kelangsungan | memutari meja biaya sekitar 100 derajat sambil naik sedikit, lalu pindah |
| pilar | kelangsungan ke data | lewat di depan pilar struktur, pilarnya menyapu bingkai paling lama 0,25 s |
| crane | data ke kebiasaan | naik tegak ke 15 m (tanpa plafon), di atas denah arah atas gambar berputar ke arah pandang meja 7, lalu turun |

## Ukur

`node scripts/ukur-stasiun.mjs <url>/id/v5 390x844 --dpr 2 --cpu 4 --gpu --kontak` dan `1440x900 --gpu --kontak`,
build produksi lokal, ANGLE D3D11. Angka di `ukur-hp.json` dan `ukur-lebar.json`.

| Ukuran | Batas | HP 390x844 DPR 2, CPU 4x | Desktop 1440x900 |
|---|---|---|---|
| Draw call terbanyak, diam dan selama perpindahan | 100 | 15 | 16 |

Nota terbang menambah satu mesh (dua draw call: pass normal dan warna), tanpa bayangan.

## Lembar kontak (`hp-kontak-*.jpg`, `lebar-kontak-*.jpg`), dicek bingkai demi bingkai

| Temuan | Perbaikan |
|---|---|
| Nota meja 2 ada di bawah koin, jadi nota yang turun dari atas menembus koin (1,3 ke 1,4 s) | nota meja 2 ditaruh di atas koin; dikunci tes badan nota tidak menembus benda |
| Sesudah itu nota menyerempet ujung lengan timbangan meja 2 saat jatuh tegak | lengkung terbang diberi faktor akar(1 - e): akhir terbangnya menyelip hampir mendatar ke piring |
| Lewat sedikit pada whip dari previs hanya 0,1%, tidak terlihat | ease-out-back, lewat sekitar 5% |
| Belokan penghindar pilar di whip ternyata tidak dijaga tes mana pun (uji mutasi tetap hijau) | dibuang: jalur lurus lewat 0,33 m di belakang muka pilar dan pilarnya di luar bingkai |

Masih terlihat, bukan tembus dan bukan layar kosong, untuk dinilai Farrez:
- Orbit ke kelangsungan: rekan kerja di lorong (x -5, z -1) lewat besar di latar depan 0,5 sampai 0,8 s dan sempat menutupi meja 5. Bisa dibaca sebagai parallax, bisa juga dipindah.
- Ikut 0,2 s: kamera lewat dekat lengan timbangan meja 1 saat mundur ke belakang nota (satu bingkai ramai).
- Raycast tengah HP di pilar 0,2 s tercatat "kosong", padahal bingkainya memuat meja, dinding, dan lantai (dugaan: sinar lolos di sambungan segitiga dinding).

## Tes dan uji mutasi

`tests/stasiun-jalur.test.mjs`: 12 tes, tiap perpindahan di layar lebar dan tegak, 81 titik per jalur.
Sebelas mutasi sementara (cadangan `cp`, dipulihkan dan dicek `cmp`), semuanya merah: ikut tanpa
lengkung, ikut jatuh tegak, nota di bawah koin, whip maju sejak awal, whip tanpa lewat, layar kurang
dekat, layar gambar terbalik, orbit kurang putar, pilar lewat tembus, crane tanpa putar, mundur
tanpa balik.
