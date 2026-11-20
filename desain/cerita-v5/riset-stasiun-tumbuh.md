# Stasiun yang tumbuh, satelit klien, dan loker cetak biru

20 Nov 2026. Usul Farrez:
- loker terakhir jadi pintu kontak berisi cetak biru stasiun yang nanti diperluas, dengan pesan "kami butuh Anda";
- tiap klien yang sudah ada adalah satelit yang beroperasi, diluncurkan dari stasiun hub;
- modul bertambah saat rak penuh, dan satelit di globe bertambah sesuai jumlah klien, kecil tapi tidak memenuhi langit ("real time building simulation").

Label: **D** sumber dibaca, **I** cuplikan atau inferensi.

## 1. Padanan nyata

| Temuan | Sumber | Label |
|---|---|---|
| ISS dirakit dari 1998 (Zarya, lalu Node 1 Unity), node berport menyambung modul lain, truss membawa panel surya; 37 penerbangan Shuttle | [NASA History](https://www.nasa.gov/history/iss20th-high-flying-construction) | D |
| Urutan perakitan stasiun komersial Axiom diubah: modul pertama ditambatkan ke ISS dulu, bisa lepas jadi stasiun mandiri paling cepat 2028 | [NASA 2024](https://nasa.gov/humans-in-space/nasa-axiom-space-change-assembly-order-of-commercial-space-station) | D |
| Gateway tumbuh satu modul per misi Artemis | [NASA](https://www.nasa.gov/reference/gateway-about/) | D |
| Tiangong: modul datang di satu port lalu dipindah ke posisi akhir, jadi bentuk T (2022) | [Space.com](https://www.space.com/china-completes-tiangong-space-station) | I |
| CubeSat milik pengguna dilepas dari airlock Kibo oleh lengan robot, didorong pegas (J-SSOD) | [JAXA](https://humans-in-space.jaxa.jp/en/biz-lab/experiment/facility/ef/jssod/) | D |
| Nanoracks menjual slot peluncuran dari ISS; Bishop adalah airlock komersial pertama (2020) | [Wikipedia](https://en.wikipedia.org/wiki/Nanoracks_CubeSat_Deployer); [eoPortal](https://www.eoportal.org/satellite-missions/iss-bishop-airlock) | I |
| Hosted payload: modul milik pihak lain menumpang di satelit komersial | [Wikipedia](https://en.wikipedia.org/wiki/Hosted_payload) | I |

Istilah: **berth** (modul ditangkap lengan robot lalu dipasang ke port), **dock** (datang dan
menyambung sendiri), **node** (penghubung berport), **truss** (kerangka luar), **port** (titik
sambung; port kosong = tempat modul berikutnya).

Padanan terdekat untuk "klien diluncurkan dari hub" adalah J-SSOD: studio membangun dan melepas,
klien mengoperasikan satelitnya sendiri.

## 2. Banyak satelit tanpa kacau

| Temuan | Sumber | Label |
|---|---|---|
| Pelacak WebGL objek orbit (StuffInSpace) | [GitHub](https://www.github.com/jeyoder/StuffInSpace) | D |
| KeepTrack berlisensi AGPL-3.0, jadi kodenya tidak dipakai | [GitHub](https://github.com/thkruz/keeptrack.space) | D |
| Lebih dari 10.000 Starlink aktif: contoh langit penuh, kebalikan target | [satellitemap.space](https://satellitemap.space/constellation/starlink) | I |
| Taksonomi pengurangan clutter (pengelompokan, penyaringan, ukuran) | [Ellis dan Dix 2007](https://eprints.lancs.ac.uk/id/eprint/12942) | D, abstrak |
| Clutter diukur dari seberapa sulit benda baru menarik perhatian | [Rosenholtz dkk. 2007](https://news.mit.edu/2007/mits-clutter-detector-could-cut-confusion) | I |

Cara tampil: ukuran tetap di layar (kecil tapi terlihat), satu orbit tipis per kelompok, tanpa
puing atau satelit pengisi, label muncul saat disorot. Orbit lingkaran sederhana cukup.

## 3. Cetak biru dan ajakan

| Temuan | Sumber | Label |
|---|---|---|
| Poster rekrutmen Mars NASA/KSC 2016 "Explorers Wanted" | [NASA](https://science.nasa.gov/resource/explorers-wanted-on-the-journey-to-mars) | D |
| Konten NASA umumnya bebas hak cipta, tapi insignia dan logotype dilindungi; tidak boleh menyiratkan dukungan NASA | [NASA Brand Center](https://www.nasa.gov/nasa-brand-center/images-and-media/) | D |
| Logo ESA merek dagang, butuh izin tertulis | [ESA](https://www.esa.int/About_Us/Law_at_ESA/Intellectual_Property_Rights/ESA_and_trademarks) | D |

Jadi poster dan cetak biru digambar sendiri, mengambil semangatnya saja.

## 4. Kejujuran klaim

- UU 8/1999 Pasal 17 ayat (1) melarang iklan yang mengelabui kuantitas atau memuat informasi keliru ([pasal.id](https://pasal.id/peraturan/uu/uu-no-8-tahun-1999/pasal-17), D). Maka jumlah modul, loker, dan satelit diturunkan dari data dan dikunci dengan tes, tanpa pengisi.
- "Dipancarkan ke seluruh dunia" hanya ditulis bila jangkauannya memang begitu.
- Modul rencana di cetak biru diberi label rencana, digambar putus-putus.
- Hosted payload hanya jujur untuk klien yang memang di-host studio.

## 5. Data di repo (20 Nov 2026, D)

| Data | Jumlah |
|---|---|
| Proyek, `content/proyek.js` | 13 |
| Klien, `content/klien.js` | 22, dalam kelompok Coderoach, Mitraplus, Personal |

## 6. Rekomendasi peneliti

Satu metafora menyambung ketiganya, yaitu port yang terisi dan port yang menunggu:
- **pertumbuhan:** modul dan node ala ISS, modul baru di-berth ke port node saat loker penuh, semua dari satu sumber data;
- **satelit klien:** dilepas dari airlock, tampil di globe sebagai titik berukuran tetap, dikelompokkan per angkatan tahun, jumlahnya sama dengan klien;
- **loker kontak:** cetak biru urutan perakitan, modul yang ada bergaris penuh, rencana putus-putus, satu port kosong jadi tombol "kami butuh Anda".

Tidak terverifikasi: jumlah rak per modul ISS dan port Unity dari sumber primer, harga rideshare
resmi, status poster "Explorers Wanted" secara khusus, riset tentang dunia yang terasa kosong bila
datanya sedikit (inferensi).
