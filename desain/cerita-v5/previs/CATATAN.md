# Previs cerita v5

Adegan blockout three.js untuk menilai komposisi, kamera, dan kejadian tiap babak sebelum ada kode
situs. Bukan kode produksi.

## Berkas

- `shot.mjs`: shot list. `SHOT` arah G (catatan lengkap: kejadian, kamera, pemicu, pin, pola bank,
  bukti), `ARAH` untuk A, E, F, G yang dipakai pembanding.
- `previs.html`: satu halaman, parameter `?a=G&s=dorongan&gaya=toon`. Gaya: `clay`, `toon`, `iso`, `lowpoly`.
- `foto.mjs`: potret lewat CDP dengan viewport persis (desktop 1440x900, HP 390x844).
  `node foto.mjs --gaya=toon --arah=G [id ...]`, lalu `node foto.mjs --papan=banding-1,banding-2`.
- `papan.mjs`, `banding-arah.mjs`, `banding-skin.html`, `papan-porto.mjs`: papan yang dipotret jadi PNG.
- `?dunia=penuh`: satu dunia. Tujuh meja dan ruang server di lantai 2 gedung kantor, satu kamera
  berpindah antarmeja (camera blend 0,9 detik), keluar lewat jendela, lalu naik ke atas kota.
  `DUNIA=penuh node foto.mjs --gaya=toon --arah=G`, lalu `node anim.mjs G`.
- `?a=P&s=portoKonstelasi`: lima konsep babak portofolio sesudah globe, riset di `../riset-portofolio.md`.
- `data/`: peta Natural Earth dan Black Marble, asalnya di `data/PROVENANCE.md`.

## Keputusan Farrez, 19 Nov 2026

1. Previs blockout G dibuat. Farrez meminta A, E, dan F dibuat juga untuk dibandingkan.
2. Skin: dari clay, toon, isometrik, dan low-poly, Farrez memilih toon dengan outline dan kamera
   perspektif ("Isometrik terlalu seperti diagram; toon perspektif lebih hidup untuk cerita").
   ADR 0020.
3. Masukan Farrez: kota terlihat seperti kotak-kotak dan globe tanpa peta dunia. Kota dibangun ulang
   (jalan, rumah beratap, gedung yang makin tinggi di pusat, pohon, ruko klien merah). Globe malam
   memakai garis pantai Natural Earth dan lampu kota Black Marble di langit berbintang.
4. Setelah keempat arah dibandingkan dengan skin yang sama (`banding-1.png`, `banding-2.png`),
   Farrez tetap memilih G.
5. Rak dan loader CD ikut dunia toon ("Satu dunia, satu gaya"). ADR 0021.
6. Masukan Farrez soal alur: meja ke kota harus mulus, kamera keluar lewat jendela gedung; kota
   seperti SimCity (pohon, sungai, tol sebagai pemisah, jalan tidak lurus semua, tanpa ruang hitam);
   lalu lintas lebih padat; ruang server ada di dalam gedung dan dicapai dengan camera blend, bukan
   sesudah kota; tidak kembali ke meja sesudah adegan makro; peta Nusantara tanpa tepi kotak;
   satelit bergerak lalu keluar sebagai portofolio. Urutan G kini: lima meja, ruang server, kebiasaan,
   keluar jendela ke kota, peta lebar, globe, portofolio.
7. Babak portofolio: lima konsep di `papan-porto.webp`, menunggu pilihan Farrez.

## Pelajaran teknis

- Chrome headless `--window-size` memberi viewport lebih kecil dari jendela; pakai CDP
  `Emulation.setDeviceMetricsOverride`.
- Kamera dengan `near = 0.01` pada jarak ratusan unit membuat pulau z-fighting dengan lantai
  (terlihat hitam). Adegan makro memakai `near = 1`.
- Kabut yang menyatu dengan latar menelan seluruh adegan bila kamera ortografis dijauhkan.
- Outline inverted hull belang di silinder bersudut tajam; uji outline image-space di look-dev.
- Memilah lampu di Black Marble: ambang luminans saja ikut mengangkat medan gurun; dipakai ambang
  plus syarat warna hangat (merah lebih besar dari biru).

## Dicek 19 Nov 2026 malam (permintaan Farrez: "kerjakan dan cek sampai tuntas")

| Butir | Hasil | Bukti |
|---|---|---|
| Lisensi Black Marble | boleh dengan kredit NASA, tanpa logo dan tanpa kesan dukungan; area abu-abu karena halaman promosi | `data/PROVENANCE.md`, pedoman media NASA |
| Garis belang di silinder | hilang; outline image-space (depth + normal) jadi bawaan, `?garis=hull` untuk yang lama | render `bingkai/toon/G/d-dorongan.webp` |
| Garis putus di tumpukan map | berkurang setelah rentang depth disempitkan (near 2%, far 12 kali jarak) | sama |
| Kota tanpa garis | instanced mesh kini ikut pass normal | `bingkai/toon/G/d-ramai.webp` |
| Cek nilai abu-abu | nota digelapkan ke #b8322a: nota Y 97, piring Y 190, dinding Y 209 | `docs/look-dev/cerita-v5.md` |
| Cek siluet | timbangan menyatu dengan map; map dan monitor digeser | mode `?siluet=1` |
| Performa | diukur di Chrome GPU (RX 6700 XT desktop), emulasi HP DPR 2, CPU 4x; dorongan 285 draw call dan globe 403 ms bingkai pertama gagal anggaran, perbaikannya di lembar look-dev | `UKUR=1 node foto.mjs --gaya=toon --arah=G` |
| Baris lama banding-skin | dirender ulang dengan kota dan globe baru | `banding-skin.webp` |
| Gerak antarbabak | animatic 21,8 detik; putaran 1 gagal (zoom 2D pecah, blur pucat, dorongan terlalu pelan), putaran 2 menukik masuk padahal zoom out, putaran 3 lolos | `animatic-G.mp4`, `kontak-G.jpg`, `animatic.html` |
| Teks babak | naskah lewat bahasa-lisan, 2 sampai 3 pilihan per judul | `../naskah-teks.md` |
| Tes repo | `npm ci` di worktree, `npm test`: 255 lulus, 0 gagal | |

## Dicek 19 Nov 2026 tengah malam (dunia penuh)

Alatnya `window.__periksa()` di previs.html: raycast dari tengah layar, mengembalikan jarak dan
ukuran benda pertama yang kena. Dipakai per 0,1 detik di sepanjang jalur kamera.

| Butir | Temuan | Perbaikan, bukti |
|---|---|---|
| Blend antarmeja | 4,5 dan 9,6 detik: rak buku 1,6 m berdiri 1,4 m di depan kamera, layar penuh panel | rak jadi lemari rendah 0,7 m dan papan tempel di dinding; arah pandang menoleh lebih cepat ke meja berikutnya. Raycast sesudahnya kena meja babak berikut |
| Keluar gedung | kamera menoleh ke ruang server, lalu menembus pita merah dan tiang fasad | jalur lewat celah jendela x = GX + 8; di 17,5 detik kamera melewati bidang fasad pada 1,81 m dari lantai (bukaan 0,9 sampai 3,05 m); kurva centripetal |
| Naik ke kota | 17,8 sampai 18,3 detik: menyusuri menara seberang jalan, bingkai buram oleh fasad | naik tegak di atas jalan depan gedung dulu; benda terdekat tinggal mahkota pohon trotoar 6 m |
| Peta Nusantara | tepi bidang peta terlihat di akhir babak | bidang diperlebar ke 20 sampai 220 BT, 60 LS sampai 75 LU; kamera berhenti di 1,6 kali jarak. Lembar 58 bingkai tanpa tepi |
| Kamera porto | konsep cincin, konstelasi, grid menghadap benua Amerika | kamera mengikuti arah globe penutup (`ikut`), Asia dan Nusantara di depan |
| Tes repo | | `npm test`: 255 lulus, 0 gagal |

## Belum bisa dicek

- Performa di HP sungguhan: GPU HP jauh lebih lemah dari GPU desktop yang dipakai; angka GPU di atas hanya pembanding antaradegan.
- Kamera masuk ruang server menembus dinding kaca (raycast 12,0 detik: 0,07 m dari kaca). Belum diberi pintu; dibiarkan karena kacanya transparan, perlu dinilai di build.
- Perpindahan antaradegan di animatic memakai crossfade; build nanti memakai serah terima bertahap dengan objek jangkar (riset teknis v5), yang belum dibuat.
