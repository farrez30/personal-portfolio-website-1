# F6 modul lab satelit: bukti ukur dan lembar kontak (23 Nov 2026)

Anchor `modul-lab` mendapat pose dan dunianya sebagai tahap keempat (meter, sumbu lorong +x), dan
babak penutup keluar lewat `zoom-satelit` (5,5 s, makro) dari globe ke jendela modul. Di dalam
modul, gulir menggerakkan kamera di rel lorong; daftar proyek HTML menyalakan dan membuka loker.

| Berkas | Isi |
|---|---|
| `components/stasiun/lab.js` | data tanpa three.js: susunan loker dari daftar proyek (satu rak dua loker, satu modul empat rak, tanpa pengisi), rel lorong dengan henti per rak dan lewat lubang palka, pemetaan gulir ke loker, pose dekat loker, waktu buka, prioritas sorotan, benda padat untuk tes |
| `components/stasiun/lab3d.js` | adegan three.js: kulit dua modul dan node satu mesh, semua pintu satu mesh (loker yang dibuka digeser lewat rentang titiknya, pass normal ikut), label satu atlas, lampu loker berwarna per titik, robot di rel plafon, astronot di ceruk rak kosong, tas kargo tertambat, lampu plafon bernapas; dibangun bertahap lewat generator |
| `components/stasiun/kendaliLab.js` | satu sumber state untuk daftar HTML dan loker: fokus, hover, gulir, buka, jeda |
| `components/stasiun/ModulLab.jsx`, `lab.css`, `teksLab.js` | seksi proyek: daftar menempel (kiri di desktop, bawah di HP), panel dialog, live region, tombol jeda gerak; mode Ringan tetap kisi album (`Rak`) |
| `components/stasiun/peta.js`, `peta3d.js` | stasiun bersikap LVLH (sisi jendela menjauhi bumi, satu putaran sikap per orbit), jendela modul A di lambung |
| `components/stasiun/naskah.js` | `JALUR["zoom-satelit"]` (`poseZoom`), pose anchor modul lab, `poseBabak` |
| `components/stasiun/adegan.js` | tahap lab, jam globe beku selama zoom dan di modul, rel dan buka loker, `setNyala`, `buka`, `tutup`, `setJeda`, `layarLoker` |
| `components/stasiun/DuniaV5.jsx` | progres gulir diukur di seksi `#modul-lab`, loker gulir ke daftar, dunia memudar sesudah seksi lewat |
| `scripts/ukur-stasiun.mjs` | `--lab`: rel di sebelas titik, buka dan tutup per 0,1 s, uji keyboard lewat CDP |

## Stasiun mengorbit: jam dibekukan

Dari dua pilihan di serah terima (mengejar `posisiStasiun(t)` atau membekukan orbit), dipilih
membekukan: saat zoom mulai, jam globe berhenti dan rangka stasiun beku masuk ke jalur lewat
`bingkai.stasiun`. Alasannya: gulir mundur harus memutar bingkai yang sama dalam urutan terbalik,
dan dengan jam yang terus jalan jalur balik akan berbeda. Satelit berhenti saat kamera sudah
bergerak cepat ke stasiun, jadi tidak terbaca. Kembali ke babak penutup, jam lanjut dari titik
beku (selisihnya disimpan), satelit tidak meloncat.

Karena stasiun bisa di balik bumi saat zoom mulai, kamera berputar mengitari pusat bumi dengan
jari-jari yang tidak pernah turun di bawah orbit stasiun, lalu turun tegak lurus ke kaca. Sikap
LVLH membuat jendela selalu menghadap luar, jadi pendekatan terakhir selalu dari angkasa dengan
bumi malam di belakang stasiun. Dites di 24 fase orbit.

## Ukur

`node scripts/ukur-stasiun.mjs <url>/id/v5 390x844 --dpr 2 --cpu 4 --gpu --kontak --sela --lab` dan
`1440x900 --gpu --kontak --sela --lab`, build produksi lokal, ANGLE D3D11. Angka di `ukur-hp.json`,
`ukur-lebar.json`, dan `ukur-hp-cicil.json` (putaran `--lab` sesudah pembangunan dicicil).

| Ukuran | Batas | HP 390x844 DPR 2, CPU 4x | Desktop 1440x900 |
|---|---|---|---|
| Bingkai pertama modul lab (sampai GPU selesai) | 150 ms | 27 sampai 66 ms (empat putaran) | 18 ms |
| Draw call terbanyak, seluruh halaman | 100 | 34 | 34 |
| Draw call zoom-satelit / rel lorong / buka loker | | 21 / 14 / 8 | 21 / 14 / 11 |
| Galat konsol | 0 | 0 | 0 |

Pembangunan modul dicicil di 12 callback senggang. Di HP potongan terbesar 133 sampai 138 ms
(atlas label, 14 teks kanvas), sisanya 1 sampai 103 ms; desktop 86 ms total. Sebelum dicicil:
satu potongan 356 ms, lalu dua potongan 468 dan 612 ms di putaran yang lebih berderau. Titik
modul diturunkan dari 123 ribu ke 62 ribu (bevel satu segmen kecuali muka pintu dan rak).
Derau mesin besar di HP: bangun globe (kode F5, tidak diubah) tercatat 99 sampai 210 ms di putaran
F6, sementara F5 mencatat 86 ms.

Gulir balik di tengah zoom (`--sela`, disela di 0,7 s): jalur diputar mundur dari titik sela,
loncatan terbesar 24,7 satuan globe (HP) dan 17,4 (desktop) per 0,1 s, yaitu laju kamera saat
mengitari bumi, bukan loncatan.

## Lembar kontak per 0,1 s, dicek bingkai demi bingkai

`kontak-zoom-hp.jpg`, `kontak-zoom-lebar.jpg` (56 bingkai), `kontak-lab-hp.jpg`, `kontak-lab-lebar.jpg`
(rel di 11 titik gulir, buka dan tutup L-03 per 0,1 s), `panel-hp.jpg`.

Zoom, kedua ukuran: 0 sampai 1,1 s globe mundur pelan dengan satelit diam; 1,2 sampai 2,3 s stasiun
masuk bingkai dan membesar, bumi malam di belakangnya; 2,4 sampai 3,0 s jendela berkusen memenuhi
layar; 3,1 sampai 3,4 s kaca gelap penuh; 3,5 sampai 3,8 s silang ke dalam modul; 3,9 sampai 5,5 s
kamera menoleh dari jendela ke rak L-01. Raycast tengah "kosong" di HP 0,9 sampai 1,5 s jatuh di
langit di atas bumi (bumi dan stasiun terlihat di bingkai), sama seperti catatan F5.

| Putaran | Temuan | Perbaikan |
|---|---|---|
| 1 | pintu loker terbaca sebagai wajah: dua kancing jadi mata, pegangan mendatar jadi senyum | pegangan tegak di sisi kanan dan satu kait di bawah kiri |
| 1 | lampu loker yang menyala hampir tak terlihat | jari-jari 3,5 jadi 5,5 cm |
| 1 | uji keyboard gagal: gaya "sembunyi" untuk foto kanvas membuat daftar tidak bisa difokus | gaya dilepas sebelum uji keyboard |
| 2 | HP: pintu yang dibuka terpotong di kiri; desktop terpotong di kanan (ditemukan tes tepi pintu) | HP lensa 88° dan 1,6 m, desktop 1,3 m; tes batas ruang ditambah sesudah 2,05 m keluar dinding |
| 2 | kamera dalam modul lewat 5 cm dari rak peralatan dekat jendela (ditemukan tes) | rak peralatan digeser 30 cm |
| 2 | lembar "tutup" bergeser 0,7 s (skrip mengklik sebelum jam dimajukan) | jam dimajukan dulu |

Masih terlihat, untuk dinilai Farrez:
- HP: 3,9 sampai 5,5 s di dalam modul geraknya kecil (0,55 m sambil menoleh), terbaca hampir diam.
- Saat panel ditutup, lampu loker yang tadi dibuka padam lebih dulu dan menyala lagi di loker
  yang dipilih gulir, sebelum pintunya selesai masuk.
- Desktop: di sisi kiri bingkai (di belakang daftar) terlihat dinding polos sebelum rak pertama.

## Aksesibilitas (uji CDP, kedua ukuran)

Tab berpindah satu item daftar tiap tekan, item yang difokus menyalakan lokernya dan menggulir
kamera ke raknya; Enter membuka panel sebagai dialog dengan fokus di tombol Tutup dan live region
"L-08 dibuka: Jeda"; Escape menutup dan fokus kembali ke item L-08; Back browser juga menutup;
tombol "Jeda gerak" (`aria-pressed`) menghentikan jam gerak latar. Sesudah seksi lewat, dunia
memudar (`data-lewat`). Gerak dikurangi: zoom dan rel jadi potongan, loker langsung terbuka,
kartu tanpa animasi (dari baca kode dan tes `bagianRel` potong; tidak diukur di Chrome).

## Tes dan uji mutasi

`tests/stasiun-lab.test.mjs` (15 tes: loker dari daftar tanpa pengisi, jumlah rak dan modul untuk
0 sampai 22 proyek, pose anchor sama untuk jumlah rak berapa pun, rel tidak menembus benda dan lewat
palka, maju terus, label 11 px di HP, henti lembut dan potong, titik gulir per loker, prioritas
sorotan, kendali tanpa kabar ganda, waktu buka, pose dekat loker di dalam ruang dan seluruh pintu
di bingkai, pose masuk di balik kaca) dan bagian F6 di `tests/stasiun-jalur.test.mjs` (8 tes di 24
fase orbit: sikap LVLH, kamera di luar atmosfer, jendela terlihat dan tidak tertutup bumi sejak
0,4, kaca menutup bingkai sampai silang selesai, silang 0,44 s, bagian dalam tidak menembus benda,
tanpa jeda mati di atas 0,25 s, gulir mundur dengan rangka beku). `npm test`: 360 lulus.

Enam belas mutasi sementara (cadangan `cp`, dipulihkan dan dicek `cmp`), semuanya merah: kaca
terlalu kecil, posisi zoom lurus, silang seketika, jendela menghadap bumi, rangka beku diabaikan,
kamera dalam diam lama, rel tanpa palka, rak pengisi, titik loker tertukar, hover menang atas fokus,
kabar ganda, kamera terlalu dekat loker, loker meluncur sebelum kamera tiba, tanpa henti lembut,
kamera masuk di luar kaca, rel HP menempel di rak. Dua mutasi pertama yang lolos ternyata masih
perilaku sah (lerp arah dinormalkan, rel 1 m dari pintu) dan diganti.
