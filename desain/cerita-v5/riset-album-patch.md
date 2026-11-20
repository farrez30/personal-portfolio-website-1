# Isi proyek, patch klien, dan layar kokpit di modul lab

20 Nov 2026. Usul Farrez:
- klien jadi album patch misi di dalam modul, tiap patch bisa di-flip;
- sesudah dibuka, layar dekat kokpit menampilkan situs semi layar penuh ala Shader.se, dengan tombol buka situs asli dan tab arsitektur, alur bisnis, keputusan, tech stack, "dan lain-lainnya";
- pengganti buklet CD berupa benda luar angkasa yang ada padanannya di dunia nyata.

Label: **D** sumber dibaca, **P** praktisi dibaca, **I** cuplikan atau inferensi.

## 1. Benda nyata untuk isi proyek (pengganti buklet)

Kerangka: taksonomi Flight Data File (buku dan checklist, cue card, cuff checklist) ditambah media
elektronik (iPad, laptop SSC, layar kokpit) dan artefak informal (buku catatan, dinding Velcro).

| Benda | Fakta | Sumber | Label |
|---|---|---|---|
| iPad prosedur ISS | buku prosedur darurat kertas diganti tiga iPad bersertifikat; Mission Control memperbarui dari darat | [NTRS 20130000791](https://ntrs.nasa.gov/citations/20130000791) | D |
| Tablet di modul | astronot membaca instruksi eksperimen di tablet (2021) | [NASA](https://www.nasa.gov/image-article/astronaut-akihiko-hoshide-reviews-procedures-computer-tablet/) | D |
| Viewer prosedur IPV | manual elektronik interaktif berbasis XML dengan tautan dan isian | [AIAA Space 2011](https://traclabs.com/wp-content/uploads/2024/05/AIAA_Space_2011_hudson.pdf) | I |
| Cue card Velcro | kartu prosedur berperekat di satu atau dua sisi, sekitar 8,5 x 10,5 inci | [ibiblio Shuttle FDF](https://ibiblio.org/apollo/Shuttle/CUE_G_D.pdf) | I |
| Cuff checklist EVA | buklet spiral 3 x 5 inci di pergelangan, halaman berlapis plastik | [NASM](https://airandspace.si.edu/collection-objects/eva-cuff/nasm_A20181337000) | I |
| Layar kokpit Orion | tiga display unit, prosedur elektronik langkah demi langkah | [NASA](https://www.nasa.gov/reference/crew-systems/) | D |
| Dinding Velcro | satu dinding Node 2 dengan sekitar 40 kotak Velcro dipakai menempel barang | [PLOS ONE 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11305871) | I |

## 2. Patch misi untuk klien

| Fakta | Sumber | Label |
|---|---|---|
| Tradisi patch dimulai Gemini 5 (kereta Conestoga, rancangan Cooper) | [NASA History](https://www.nasa.gov/history/55-years-ago-gemini-5-sets-a-new-record/) | D |
| Patch digambar desainer JSC, sampai sekitar 20 iterasi, maksimal delapan warna tanpa gradasi; patch dan bendera yang ikut terbang disusun jadi montase | [NASA podcast](https://www.nasa.gov/podcasts/houston-we-have-a-podcast/mission-patches/) | D |
| Patch berpunggung Velcro, dipasang di flight suit | [NASM](https://www.airandspace.si.edu/collection-objects/name-tag-space-shuttle-astronaut-whitson-flown/nasm_A20120254000) | I |
| Album kenangan kru resmi tidak ditemukan; yang ada montase "flown with" dan Personal Preference Kit | podcast NASA; [14 CFR 1214.604](https://webarchive.library.unt.edu/eot2008/20090510213721/http://edocket.access.gpo.gov/cfr_2008/janqtr/pdf/14cfr1214.604.pdf) | D, I |

Jadi "album patch" paling jujur dibingkai sebagai montase patch yang ikut terbang, ditempel di
dinding Velcro modul, bukan album resmi astronot.

## 3. Menampilkan situs di layar

| Fakta | Sumber | Label |
|---|---|---|
| Situs yang mengirim CSP `frame-ancestors` atau X-Frame-Options tampil kosong di iframe | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors) | D |
| OWASP menyarankan situs menolak dibingkai kecuali memang perlu | [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Clickjacking_Defense_Cheat_Sheet.html) | D |
| `allow-scripts` dan `allow-same-origin` jangan dipakai bersamaan untuk dokumen satu origin; iframe butuh `title`; tiap iframe dokumen penuh | [MDN iframe](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe) | D |
| Tautan yang membuka tab baru sebaiknya memberi tahu di labelnya | [W3C G201](https://www.w3.org/WAI/WCAG22/Techniques/general/G201) | D |
| Bidang setinggi h memenuhi pandangan pada jarak h / (2 tan(fov/2)) | [three.js forum](https://discourse.threejs.org/t/functions-to-calculate-the-visible-width-height-at-a-given-z-depth-from-a-perspective-camera/269/28) | I |
| Kokpit sungguhan (Dragon, Orion, ISS) memakai layar opak; teks transparan ala hologram lebih lambat dibaca di latar bertekstur | [Scharff dan Ahumada 2002](https://scholarworks.sfasu.edu/psychology_facultypubs/4); [WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) | I, D |

Di repo: `Hologram.jsx` sudah membingkai situs hanya di farrez.vercel.app (aplikasinya mengizinkan
domain itu) dan memakai tangkapan layar di tempat lain (D, baca kode).

## 4. Isi tab studi kasus

Kerangka: survei NN/g terhadap 204 pengambil keputusan rekrut ([NN/g 2019](https://www.nngroup.com/articles/ux-design-portfolios/), D),
bentuk ADR (konteks, opsi, keputusan, konsekuensi), dan kebutuhan pembeli B2B (bukti, hasil, tidak generik; Demand Gen, I).

| # | Tab | Asal | Data di repo |
|---|---|---|---|
| 1 | Ringkasan: klien, peran, durasi, status | NN/g (peran) | `proyek.js` `ringkas`, `periode`, `status` |
| 2 | Masalah dan konteks usaha | Farrez, NN/g | buklet `challenge` (null sampai claims-audit) |
| 3 | Kendala: anggaran, waktu, sistem lama, regulasi | riset NN/g | belum ada |
| 4 | Solusi dan alur bisnis, sebelum dan sesudah | Farrez | buklet `solution` (null) |
| 5 | Arsitektur dan infrastruktur | Farrez | `content/arsitektur.js` (ada, fakta produk) |
| 6 | Keputusan dan opsi yang ditolak | Farrez, NN/g, ADR | buklet `decisions` (null) |
| 7 | Tech stack | Farrez | `components/arsitektur/teknologi.js` (ada) |
| 8 | Proses dan iterasi | riset NN/g | belum ada |
| 9 | Hasil dan metrik | NN/g, B2B | buklet `outcome` (null) |
| 10 | Kata klien | riset (praktik agensi) | belum ada |
| 11 | Demo dan situs asli | Farrez | `content/demo.js`, `tautan.situs`, `tautan.kasus` |

Tab 3, 8, dan 10 berasal dari riset, bukan dari Farrez, jadi boleh dipangkas. Tab yang datanya
`null` tidak tampil, sesuai aturan claims-audit di `content/proyek.js`.

## 5. Rekomendasi peneliti

- **Isi proyek:** tablet prosedur yang ditarik dari loker, isinya DOM dengan tab di atas. Cue card Velcro di pintu loker jadi ringkasan yang terbaca dari lorong.
- **Klien:** dinding patch Velcro yang bisa dibalik, dibingkai sebagai montase patch yang ikut terbang.
- **Layar:** tangkapan layar atau video di 3D, kamera maju sampai layar memenuhi pandangan, lalu tukar ke DOM. Situs asli dibuka di tab baru, bukan iframe. Hologram hanya aksen.

Tidak terverifikasi: bentuk binder FDF ISS sekarang, apakah ISS 2026 masih memakai cue card kertas,
mekanisme layar penuh Shader.se (Codrops 403), album kru resmi.
