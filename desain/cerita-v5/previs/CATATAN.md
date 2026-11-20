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
7. Babak portofolio: Farrez mengusulkan konsep keenam, zoom ke satelit yang ternyata modul lab lalu memilih proyek dari rak loker (`?a=P&s=portoLab`, `portoLab-luar`, animasi 4 detik). Papan enam konsep di `papan-porto.webp`.
8. Blend antarmeja dinilai "cuma pindah ke meja sebelah kanan". Riset di `../riset-transisi-kamera.md`. Farrez minta keempat arah dibuat untuk dibandingkan: `?dunia=penuh&tx=campur|layar|crane|oner`, video `tx-<arah>.mp4`, halaman `banding-transisi.html`, perakit `banding-transisi.mjs`. Farrez memilih campur ("Paling hidup dan bervariasi"), ADR 0023. Contoh modul lab untuk dinilai di `porto-lab.html`.

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

## Dicek 20 Nov 2026 (empat arah transisi)

| Arah | Yang jalan | Kejanggalan yang tersisa |
|---|---|---|
| campur (dipilih, ADR 0023) | nota terbang diikuti kamera 1,8-2,9 s; whip pan lewat pilar 4,6-5,1 s; masuk tablet lalu keluar di meja biaya 7,2-7,8 s; crane ke denah 14,6-16,4 s | diperbaiki: ujung orbit kini menoleh ke meja kelangsungan; alas biaya 3 x 3 m jadi meja 1,65 x 1,2 m berkaki. Tersisa: dari atas, perisai segi enam ruang server tampak sebagai bidang oranye besar (15,3-15,6 s) |
| layar | tiap potongan di layar penuh tidak terlihat (2,1, 4,9, 7,5 s) | tablet menimpa monitor di meja kelangsungan dan berdiri di depan rak server |
| crane | plafon dibuka, kabel cadangan disembunyikan (sebelumnya menutup setengah layar) | denah satu baris lemah: dari atas hanya puncak dinding dan sederet meja; genangan oranye |
| oner | kamera tidak pernah diam, merendah lewat lemari 5,0-5,4 s | 8,3 s sekilas kuning polos saat mendekati meja biaya |

Keempat pemutar di `banding-transisi.html` diuji di panel: geser ke detik 5, maju saat diputar, video lain berhenti.

## Animatic G 20 Nov 2026 (campur, modul lab)

`animatic-G.mp4` 33,2 detik: kantor dengan pola campur (`?dunia=penuh&tx=campur&lengkap=1`), keluar jendela, kota, peta, globe, lalu zoom ke modul lab (`?a=P&s=portoLab-globe`, mulai dari bingkai terakhir klip globe). Modul lab dipilih Farrez, ADR 0024. Rujukan isi modul: `../riset-modul-lab.md`.

Galat yang sempat lolos: fase keluar gedung tampil diam tiga detik karena fungsi `ekor` memakai variabel `padat` dari fungsi lain. Render melempar galat dan screenshot menahan bingkai lama. Sejak itu `foto.mjs` berhenti bila `aturDunia` atau `atur` melempar galat.

## Isi modul lab, 20 Nov 2026

Farrez memilih gerak latar "ramai dengan karakter" dan suara mati dengan tombol. Cara menyusuri rak masih dibandingkan: `banding-lorong.html` (perakit `banding-lorong.mjs`), tiga video 6 detik `lorong-gulir|geser|lebar.mp4` dari `?a=P&s=portoLab-<varian>`.

Isi modul: robot berwajah layar di rel plafon, astronot melayang di depan pintu palka, tas kargo tertambat, lampu plafon bernapas, lampu loker menyala untuk loker yang disorot, loker ERP meluncur keluar dan kartunya naik.

Diperbaiki setelah dicek per 0,1 detik:
- varian lebar mula-mula berdiri di dalam rak peralatan dekat jendela, lalu terbang menembus rak; kamera dipindah ke tengah lorong;
- di varian gulir, karakter tidak masuk bingkai karena kamera menatap lurus ke dinding; arah pandang dibuat menyerong ke ujung lorong.

## Alur modul lab di animatic G, 20 Nov 2026

Farrez memilih gulir maju (ADR 0024). `?a=P&s=portoLab-alur`, 11 detik: dari bingkai terakhir globe, kamera mendekati satelit, menembus jendela, menyusuri rak dengan gulir, lalu loker pilihan (`pilih`, contoh NDS ETL) meluncur keluar. Loker mana pun bisa dipilih. Klip globe kini berakhir di jarak penuh (`akhir: 1`) supaya sambungannya tanpa putus. `animatic-G.mp4` jadi 39,2 detik.

Kesalahan yang terulang: komentar `//` yang disisipkan sed menelan `grup.position.copy(M0)`, jadi modul berada di pusat bumi dan kamera menukik menembus garis rute. Ketahuan lewat pengukuran posisi kamera, bukan dari gambar.

## Stasiun tumbuh, patch klien, isi proyek, 20 Nov 2026

Keputusan Farrez: satu modul 8 loker (13 proyek = modul A, node, modul B), semua 22 klien jadi satelit (tiga bidang orbit per kelompok), isi proyek berupa tablet prosedur dan cue card, loker ke-14 jadi loker cetak biru kontak. Patch klien dibandingkan dalam dua bentuk: `banding-klien.html` (perakit `banding-klien.mjs`), video `patch-dinding.mp4` dan `patch-album.mp4`. Riset: `../riset-album-patch.md`, `../riset-stasiun-tumbuh.md`.

Yang masih isian: isi belakang patch ("Aplikasi web, 2025"), tahun modul di cetak biru, isi cue card. Di build semuanya diturunkan dari `content/proyek.js` dan `content/klien.js`. Patch di previs digambar dari nama klien; build butuh berkas logo asli (aset cakram berbentuk CD berlubang, tidak bisa dipakai langsung).

Diperbaiki setelah dicek: tekstur kanvas di bahan `clay()` tampil putih, jadi patch, cue card, dan cetak biru memakai MeshBasicMaterial; halaman bawah album tembus sebelum halaman atas dibalik.

## Belum bisa dicek

- Performa di HP sungguhan: GPU HP jauh lebih lemah dari GPU desktop yang dipakai; angka GPU di atas hanya pembanding antaradegan.
- Kamera masuk ruang server menembus dinding kaca (raycast 12,0 detik: 0,07 m dari kaca). Belum diberi pintu; dibiarkan karena kacanya transparan, perlu dinilai di build.
- Perpindahan antaradegan di animatic memakai crossfade; build nanti memakai serah terima bertahap dengan objek jangkar (riset teknis v5), yang belum dibuat.
