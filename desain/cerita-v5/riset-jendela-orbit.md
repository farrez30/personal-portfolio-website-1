# Jendela kokpit, siang-malam bumi, dan orbit stasiun

20 Nov 2026. Permintaan Farrez:
- kokpit punya jendela untuk melihat keluar, jadi terlihat stasiun mengitari bumi, matahari lewat dan cahayanya masuk, serta satelit lain beredar;
- bumi dengan sisi siang dan malam sesuai waktu nyata detik ini, dari rumus rotasi, revolusi, dan kemiringan sumbu, berlaku puluhan sampai ratusan tahun.

Label: **D** sumber dibaca, **I** cuplikan atau inferensi.

## 1. Posisi matahari dan batas siang-malam

| Pilihan | Akurasi | Rentang | Sumber | Label |
|---|---|---|---|---|
| USNO "Approximate Solar Coordinates" + GMST ringkas (dipakai) | sekitar 1 menit busur (sekitar 2 km di terminator) | dua abad dari 2000; GMST kehilangan 0,1 detik per abad | [USNO matahari](https://aa.usno.navy.mil/faq/sun_approx); [USNO GAST](https://aa.usno.navy.mil/faq/GAST) | D |
| NOAA (persamaan Meeus) | sangat baik 1800 sampai 2100 | kalkulator -2000 sampai 3000; spreadsheet 1901 sampai 2099 | [NOAA](https://gml.noaa.gov/grad/solcalc/calcdetails.html) | D |
| NREL SPA | ±0,0003° | -2000 sampai 6000 | [NREL](https://research-hub.nrel.gov/en/publications/solar-position-algorithm-for-solar-radiation-applications-2/) | I |
| Rumus sinus kasar tanpa equation of time | meleset sampai sekitar 4° bujur | | [forum three.js](https://discourse.threejs.org/t/timetate-a-world-clock-built-on-a-real-time-day-night-terminator/93975) | I, ditolak |

Senja: terbit/terbenam di zenit 90,8333°; senja sipil, nautikal, astronomis berakhir di 96°, 102°,
108° ([USNO](https://aa.usno.navy.mil/faq/RST_defs), D). Di gaya toon, ketiganya jadi anak tangga
warna, bukan gradasi halus. Lampu kota baru menyala setelah senja sipil.

Fixture tes (Meeus lewat [PyMeeus](https://pymeeus.readthedocs.io/en/latest/examples/ex-Sun.html), I):
1992-10-13 00:00 UTC, deklinasi -7,785°, equation of time 13,71 menit. Nilai NOAA untuk tanggal
lain diisi tangan dari kalkulatornya (halamannya berbasis JavaScript).

## 2. Orbit stasiun

| Fakta | Sumber | Label |
|---|---|---|
| 16 orbit, 16 terbit dan terbenam per hari | [NASA](https://www.nasa.gov/international-space-station/space-station-facts-and-figures/) | D |
| Inklinasi 51,6°, periode 90 sampai 93 menit, lintasan bergeser sekitar 22,9° ke barat tiap orbit | [NASA JSC](https://eol.jsc.nasa.gov/Tools/orbitTutorial.htm) | D |
| TLE ISS 19 Nov 2026: 15,4949 orbit per hari (sekitar 92,9 menit) | [CelesTrak](https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE) | D |
| CelesTrak membatasi satu unduhan per 2 jam dan bisa memblokir IP | [CelesTrak](https://celestrak.org/NORAD/documentation/gp-data-formats.php) | D |
| Periode beta tinggi: ISS hampir tanpa malam beberapa hari, sekitar empat kali setahun | [ESA 2026](https://www.esa.int/ESA_Multimedia/Images/2026/07/Bathed_in_sunlight) | D |

Orbit rendah lebih cepat karena hukum Kepler III (T² sebanding a³): pada 420 km, satu putaran
sekitar 93 menit dengan kecepatan sekitar 7,66 km/s; satelit geostasioner di sekitar 36.000 km
butuh satu hari sidereal (konstanta dari [NASA Earth Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html), D; hitungan I).

Model yang dipakai: orbit melingkar tipe ISS dihitung sendiri (TLE basi dalam hitungan hari dan
butuh server cache). Pengunjung diberi tahu ini orbit seperti ISS, bukan posisi ISS saat ini.

## 3. Jendela

| Fakta | Sumber | Label |
|---|---|---|
| Cupola: enam jendela trapesium dan satu jendela bundar 80 cm (terbesar yang pernah terbang), shutter luar dibuka dari dalam | [ESA](https://www.esa.int/Our_Activities/Human_and_Robotic_Exploration/Node-3_Cupola/Cupola); [NASA](https://www.nasa.gov/international-space-station/cupola) | D |
| Foto cahaya terbit orbit masuk lewat jendela Cupola | [NASA 2025](https://www.nasa.gov/image-detail/amf-iss073e0299808/) | D |
| Jendela nadir Destiny sekitar 50,8 cm (WORF) | [NASA](https://science.nasa.gov/earth/earth-observatory/iss-window-observational-research-facility/) | I |

## 4. Skala waktu (keputusan terbuka)

| Pilihan | Yang terjadi | Risiko |
|---|---|---|
| A. Semua waktu nyata | orbit 93 menit | pengunjung 2 sampai 3 menit hampir pasti tidak melihat terbit (sekitar 6%) |
| B. Bumi dan matahari nyata, orbit dipercepat | terbit tiap sekitar 1,5 menit | fisika tidak konsisten, bisa disangka posisi ISS nyata |
| C. Mulai dari keadaan nyata detik ini, lalu time-lapse berlabel, ada tombol waktu nyata | konsisten, cerita terlihat | jam simulasi harus terlihat supaya jujur |

Rekomendasi peneliti: C.

## 5. Aksesibilitas

- Terbit orbit adalah satu perubahan terang, bukan kilatan, selama ramp-nya paling cepat sekitar 0,5 sampai 1 detik ([WCAG 2.3.1](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html), D).
- `prefers-reduced-motion`: waktu nyata, kamera diam, terang berganti lewat crossfade 2 detik tanpa silau.
- Kredit Black Marble: NASA's Goddard Space Flight Center, tanpa logo NASA ([NASA](https://www.nasa.gov/nasa-brand-center/images-and-media/), D).
