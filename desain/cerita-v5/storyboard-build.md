# Storyboard build cerita v5

20 Nov 2026. Jembatan dari previs (`previs/`) ke kode situs. Dokumen ini belum mengubah kode:
`components/dunia/` dan `components/imersif/` baru disentuh di sesi build, satu fase per PR.

Keputusan yang dipakai: ADR 0019 (arah G, "yang ditimbang"), 0020 (toon bergaris), 0021 (rak dan
loader ikut dunia toon), 0023 (perpindahan campur antarmeja), 0024 (modul lab satelit, gulir maju,
ramai dengan karakter, suara mati bawaan). Rujukan visual: `previs/animatic-G.mp4` (39,2 detik),
`previs/kontak-G.jpg`, `previs/banding-transisi.html`, `previs/banding-lorong.html`.

Label: **D** terbaca di kode atau dokumen repo, **I** inferensi atau rancangan baru.

## 1. Yang dipakai ulang dari kode sekarang (D)

| Bagian | Di mana | Dipakai untuk v5 |
|---|---|---|
| Anchor kamera terikat ke seksi HTML; gulir memilih anchor tujuan, perpindahan diputar dalam waktu | `components/dunia/naskah.js` (`ANCHOR`, `pemicuAnchor`, `anchorAktif`, `poseAntara`, `durasiBlend`, `kekuatanBlur`) | tetap jadi tulang punggung; anchor diganti isi v5, jenis perpindahan ditambah |
| Naskah kamera dipisah dari three.js, dites di Node | `tests/dunia-*.test.mjs` | semua aturan baru (urutan, variasi, durasi) dites di sini |
| Teks seksi tetap HTML hasil server di atas kanvas | `Dunia.jsx` | judul dan isi babak tetap HTML, kanvas `aria-hidden` |
| Mode Imersif dan Ringan, tirai pra-gambar | `Dunia.jsx`, `ModeProvider` | Ringan = HTML biasa plus grid proyek (`RakSesuaiMode`) |
| Gambar hanya saat ada yang berubah | `dunia.js` | tetap; di modul lab gerak latar menyalakan render, berhenti saat panel terbuka |
| Halaman proyek per slug | `app/[locale]/proyek/[slug]/` | tautan dari loker; URL per proyek sudah ada |
| Data proyek | `content/proyek.js` (13 proyek) | sumber daftar loker dan daftar HTML |
| Seksi beranda: Gerbang, CeritaKerja, RakSesuaiMode, Klien, Contact | `app/[locale]/page.jsx` | v5 mengganti isi CeritaKerja dan Rak; Klien dan Contact tetap |

## 2. Peta babak

Satu baris = satu seksi HTML dan satu anchor. Kelas `bab--<id>` dibuat otomatis dari `id` di `content/cerita.js` (`CeritaKerja.jsx:263`, D), jadi id babak v5 langsung jadi selectornya. "Keluar" = jenis perpindahan ke baris berikutnya.
Durasi dari previs; batas atas 1,8 detik per perpindahan di dalam gedung (pelajaran lift Mass Effect,
`riset-modul-lab.md`), kecuali serah terima makro.

| # | Seksi | Judul | Tempat | Keluar | Durasi | Pemicu di dunia |
|---|---|---|---|---|---|---|
| 0 | `.gerbang` | (hero) | lantai kantor, meja 1 dari jauh | blend | 0,9 s | |
| 1 | `.bab--dorongan` | Rekap tiap malam, angkanya beda lagi. | meja 1, baris belakang | ikut benda | 1,4 s | nota merah terbang ke meja 2 |
| 2 | `.bab--harga-diam` | Dibiarkan juga ada ongkosnya. | meja 2, baris depan (diputar 180°) | whip pan | 0,6 s | HP berdering di meja 3 |
| 3 | `.bab--tarikan` | Buka HP, angka hari ini sudah ada. | meja 3, baris belakang | masuk layar | 1,2 s | tablet berlayar sama di meja 3 dan 4 |
| 4 | `.bab--biaya` | Harganya jelas sebelum mulai. | meja 4, baris depan, tampak atas | orbit | 1,1 s | timbangan diputari |
| 5 | `.bab--kelangsungan` | Sistemnya tetap jalan, siapa pun yang merawat. | meja 5, baris belakang | lewat balik pilar | 0,8 s | pilar struktur di lorong |
| 6 | `.bab--data` | Rusak di satu tempat, utuh di tempat lain. | ruang server kaca | crane ke denah | 1,8 s | plafon dibuka (rumah boneka) |
| 7 | `.bab--kebiasaan` | Urutannya sama dengan yang biasa tim kerjakan. | meja 7, baris depan | keluar jendela, naik | 2,8 s | celah jendela tanpa tiang |
| 8 | `.bab--ramai` | Diuji sebelum hari ramai. | atas kota, lalu lintas memadat | serah terima ke peta | 0,6 s + 0,3 s silang | gedung klien jadi titik merah |
| 9 | `.bab--langkah-kecil` | Mulai dari satu cabang. | peta Nusantara lebar | serah terima ke globe | 0,3 s silang | Jakarta jadi titik di globe |
| 10 | `.bab--penutup` | Ceritakan yang bikin capek. | globe malam, satelit bergerak | zoom ke satelit | 5,5 s | satelit melayang masuk dari atas |
| 11 | `RakSesuaiMode` (diganti modul lab) | (daftar proyek) | modul lab, lorong rak | gulir di rel lorong | ikut gulir | lihat bagian 4 |
| 12 | `Klien`, `Contact` | tetap | kanvas berhenti atau memudar | | | keputusan terbuka 1 |

Aturan yang dites (I): dua perpindahan berturut-turut tidak boleh sama jenisnya; setiap anchor
menunjuk seksi yang ada di halaman; setiap perpindahan dalam gedung punya pemicu yang terlihat di
bingkai sebelum kamera bergerak (dicek manual lewat lembar kontak).

## 3. Dunia, skala, dan serah terima

Rentang meja 1 m sampai bumi melebihi presisi float32 dan depth buffer (`riset-arah-narasi.md` §4,
D), jadi dunia dibagi empat tahap dalam satuan lokal masing-masing (I, dari riset itu):

| Tahap | Isi | Ambang serah terima |
|---|---|---|
| Gedung | lantai kantor, ruang server, fasad, jalan depan | kamera melewati celah jendela, lalu naik sampai menara seberang di bawah bingkai |
| Kota | blok, sungai, tol, lalu lintas instanced | gedung klien mengecil jadi titik merah; titik itu muncul di peta |
| Nusantara | bidang peta lebar 20 sampai 220 BT, 60 LS sampai 75 LU | Jakarta jadi titik di globe; crossfade 0,3 detik ditutup motion blur |
| Orbit dan lab | globe, satelit, modul lab | kusen jendela modul memenuhi layar; adegan interior dimuat di belakang kusen |

Tidak memakai `logarithmicDepthBuffer` (riset §4, P). Near dan far dinamis per tahap seperti previs.

## 4. Modul lab: interaksi

Mengikuti `riset-modul-lab.md` §4 dan ADR 0024.

| Langkah | Perilaku | Catatan build |
|---|---|---|
| Masuk | rel kamera dari globe ke kusen jendela; kaca gelap menutup layar sekitar 0,4 detik | adegan interior sudah dipanaskan sebelum kusen penuh |
| Menyusuri | gulir biasa menggerakkan kamera maju di rel lorong; berhenti lembut tiap kelompok loker, hanya di desktop | laju gulir tidak diubah (NN/g scrolljacking) |
| Memilih | daftar proyek HTML (tautan biasa) selalu terlihat; hover atau fokus menyalakan lampu loker padanannya, fade 150 sampai 250 ms | satu sumber state untuk daftar dan sorotan |
| Membuka | klik atau Enter: kamera mendekat 0,6 sampai 0,9 s, loker meluncur 0,4 s, kartu HTML tumbuh dari posisi loker jadi panel | panel berperilaku dialog: fokus masuk, Escape menutup |
| Kembali | Tutup, Escape, atau Back browser membalik animasi; fokus kembali ke item daftar | keputusan terbuka 2: panel atau langsung halaman proyek |
| Gerak latar | robot di rel plafon, astronot di depan palka, tas kargo tertambat, lampu plafon bernapas; sudah berjalan sejak tampil, berhenti saat panel terbuka | WCAG 2.2.2: tombol jeda gerak |
| Suara | mati bawaan; tombol suara: dengung kipas pelan, bunyi kait loker | `components/imersif/suara.js` sudah ada |

Jumlah loker (**diputuskan Farrez 20 Nov**): satu modul 8 loker (4 rak x 2). 13 proyek = modul A penuh, node, modul B berisi 5 proyek dan loker cetak biru kontak. Modul baru di-berth ke port node saat loker penuh; jumlah modul, loker, dan satelit dihitung dari data dan dikunci tes, tanpa pengisi (`riset-stasiun-tumbuh.md`). Semua 22 klien jadi satelit di tiga bidang orbit menurut kelompok. Isi proyek: tablet prosedur dengan tab studi kasus, cue card di pintu loker (`riset-album-patch.md`).
Urutan loker = urutan daftar HTML = urutan `proyek.js`.

## 5. Aksesibilitas

- Kanvas `aria-hidden`; semua aksi bisa lewat HTML.
- `prefers-reduced-motion`: semua perpindahan kamera jadi potongan langsung atau crossfade pendek, gerak latar mati, loker tidak meluncur (kartu langsung tampil).
- Tombol jeda gerak global (WCAG 2.2.2) dan tombol suara, dua-duanya tombol HTML berlabel.
- Live region singkat mengumumkan proyek yang dibuka.
- Mode Ringan atau tanpa WebGL2: halaman HTML biasa dan grid proyek (`RakSesuaiMode`) seperti sekarang.

## 6. Anggaran kinerja HP

Batas dari `docs/look-dev/cerita-v5.md` (D): 100 draw call, 250 ribu segitiga, bingkai pertama
150 ms per adegan. Yang gagal saat diukur 19 Nov dan cara menutupnya:

| Masalah terukur | Perbaikan |
|---|---|
| meja dorongan 285 draw call, ruang server 164 | tumpukan map dan benda berulang digabung (`mergeGeometries`) atau di-instance |
| peta 302 ms, globe 403 ms bingkai pertama | tekstur peta dan bumi malam dipanggang jadi WebP saat build, bukan kanvas di HP |
| outline image-space 1,6 sampai 2 kali draw call | diukur per tahap; matikan di tahap kota dan globe bila melewati batas |
| modul lab (baru) | loker diam satu InstancedMesh, label loker satu atlas, bayangan dipanggang, DPR maksimal 1,5 di HP |
| kompilasi shader membekukan loader | pemanasan satu program per bingkai di loader (memori beku-shader-three) |

## 7. Tahapan kerja

Satu fase satu PR, previs dan lembar kontak per 0,1 detik sebelum merge.

| Fase | Isi | Selesai bila |
|---|---|---|
| F1 | naskah kamera v5 di `naskah.js`: anchor, jenis perpindahan, durasi, aturan variasi | tes Node lulus, termasuk aturan "tidak dua jenis sama berturut-turut" |
| F2 | lantai kantor toon: dua baris meja, pilar, ruang server, props tiap babak | draw call di bawah 100 di HP emulasi |
| F3 | enam jenis perpindahan campur | lembar kontak tanpa benda tembus dan tanpa layar kosong |
| F4 | keluar jendela, kota, lalu lintas | jalur lewat celah jendela, terukur raycast |
| F5 | peta Nusantara dan globe malam, satelit | bingkai pertama di bawah 150 ms |
| F6 | modul lab, daftar proyek sebagai pengendali, panel proyek | keyboard dan pembaca layar bisa memakai semua fungsi |
| F7 | reduced motion, tombol jeda dan suara, preset HP | uji di HP sungguhan |
| F8 | buang dunia toko kaset dan loader CD (ADR 0021), tulis ulang DESIGN.md | tidak ada aset atau kode toko kaset yang tertinggal |

## 8. Tes yang ditulis

| Kontrak | Kasus |
|---|---|
| urutan babak | 11 anchor cerita, urutan sama dengan seksi HTML |
| variasi perpindahan | tidak ada dua jenis sama berturut-turut; durasi di dalam gedung paling lama 1,8 s |
| reduced motion | semua perpindahan jadi potongan; gerak latar mati |
| loker | jumlah loker paling sedikit jumlah proyek; tiap slug punya satu loker; urutan sama dengan daftar |
| daftar dan sorotan | fokus item ke-n menyorot loker ke-n; Escape menutup panel dan fokus kembali |
| teks | judul tiap babak ada di id dan en |

## 9. Keputusan terbuka (untuk Farrez)

1. Seksi Klien: tetap sesudah modul lab sebagai HTML biasa, atau logo klien muncul di babak kota atau globe.
2. Membuka proyek: panel di atas modul lab dengan tautan ke halaman lengkap, atau langsung pindah ke `/proyek/<slug>`.
3. Loker ke-14: **diputuskan Farrez 20 Nov**, "proyek berikutnya": loker berlabel ajakan, membukanya mengarah ke kontak.
4. Teks EN untuk judul baru: **diputuskan Farrez 20 Nov**, ditulis di fase 1 sebelum kode, tersendiri seperti v4, lewat 2 sampai 3 pilihan per judul.

Keputusan 1 dan 2 dibuka lagi oleh usul Farrez 20 Nov: klien jadi album patch misi di dalam modul, dan isi proyek butuh pengganti buklet yang berupa benda luar angkasa sungguhan. Riset dan konsepnya di `riset-album-patch.md`.

Syarat keamanan layar situs (dari `components/imersif/Hologram.jsx`): iframe hanya untuk situs beda origin, karena `sandbox` berisi `allow-scripts` dan `allow-same-origin` sekaligus; tautan keluar tetap `rel="noopener noreferrer"`.
