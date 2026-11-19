# Riset masukan Farrez, 19 Nov 2026

Dua subagen riset (Fable 5.2, effort medium). Label: **D** dokumentasi atau sumber primer, **P** praktisi, **I** inferensi.

## Yang dipakai di kode

| Butir | Temuan | Label | Sumber | Dipakai di |
|---|---|---|---|---|
| Loader CD | Sebagian besar permukaan cermin perak; pelangi hanya dua baji sempit di sekitar pantulan, violet dekat pantulan, merah ke luar; pitch trek 1,6 um | D | physicslabs.colorado.edu (CD Rainbow), Uni Kiel (Koeppen), alanzucconi.com 2017 | `components/dunia/ular.js` |
| Loader CD | Baji diam terhadap lampu karena alur melingkar (simetri putar); yang ikut berputar hanya noda | I | turunan dari rumus kisi Zucconi | `ular.js` |
| Corong cahaya | Kerucut palsu: pudar jarak, tepi memudar menurut sudut pandang (pow N.V), additive, tanpa depth write | P | pmndrs/drei SpotLightMaterial, threex.volumetricspotlight | `bahanBerkas()` di `dunia.js` |
| Kualitas adaptif | Skala resolusi dinamis berjendela dengan histeresis dan batas bolak-balik; jangan realokasi saat kamera bergerak | P | pmndrs/drei PerformanceMonitor, forum three.js | `jagaKualitas` di `dunia.js` |
| Kualitas adaptif | Di mobile, AO dan motion blur efek pertama yang dibuang; SSAO setengah resolusi paling berdampak | D | Unity URP 14 SSAO dan post-processing, Unreal 4.27 mobile post-process | urutan buang di `jagaKualitas` |
| Kaca | Kaca bening: putih, opasitas rendah, fresnel di sudut miring, kilau tidak ikut redup oleh alpha; hindari warna volume (terbaca air) | P + I | godotshaders PBR Glass, three.js docs | `bahanKaca()` di `dunia.js` |
| Stempel | Tekan lurus dan tahan diam; goyang membuat cap ganda; tinta lebih gelap di tepi (efek squeegee), belang, ada bintik kosong | P + D | printablepress.com, Altenew, FBI Lab DOC-218-07 (lewat ringkasan) | `momen.rencana`, `teksturCap()` di `props.js` |
| Tutup vitrin | Peredam lunak bekerja di sekitar 20 derajat terakhir; tanpa peredam tutup terbanting | D | McMaster-Carr soft-closing lid supports, Sugatsune (lewat ringkasan) | `tutupPeredam` di `props.js` |
| Lonceng pintu | Shopkeeper's bell: pelat dudukan, pegas baja, cangkir kuningan 41 mm (besar 76 mm), dipasang di atas pintu | D | kilianhardware.com, House of Antique Hardware (lewat ringkasan) | lonceng di `dunia.js` |
| Pintu | Pintu toko biasanya memuat papan OPEN/CLOSED gantung sekitar 30 x 18 cm dan stiker jam buka | P | listing Staples, Etsy (lewat ringkasan) | papan OPEN di `dunia.js` |
| Buku melayang | Jalur melengkung, jeda antarbenda 50 sampai 150 ms, gerak tiap benda beberapa kali lipat jedanya, keluar berurutan di satu jalur | D + I | Flutter staggered menu, motion.dev stagger, 12 prinsip animasi | usulan adegan 10 |

## Belum terverifikasi

- Waktu tekan stempel, frekuensi ayun lonceng (dipakai 4,1 Hz, teredam 2,5 s), dan lama tutup berperedam: tidak ada sumber yang memberi angka; nilai di kode adalah inferensi.
- Rincian VFX buku melayang Harry Potter tidak ditemukan; yang ada hanya cerita fan bahwa adegan perpustakaan dibuat praktis.
