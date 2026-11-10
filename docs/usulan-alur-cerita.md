# Usulan: alur cerita gulir "dari ide sampai dipakai"

Draf 10 Nov 2026, bahan keputusan Farrez sebelum ada kode. Belum ada yang diimplementasikan.

**Pilihan Farrez (10 Nov 2026):** arah "Dari demo ke rak", diletakkan antara hero dan rak,
kontak dengan wizard kebutuhan, sapaan jam lokal, dan pita anggaran. Alasan dalam kata
Farrez untuk ADR: desain dan narasinya menyambung mulus dari hero sampai rak, dan tetap
mengikuti pola serta genre yang sudah ada. Slot klaim di bagian 3 masih terbuka.

**Dibangun 10 Nov 2026** (ADR 0011). Bedanya dengan usulan:
- Kalimat ber-`[slot]` tidak ikut tayang. Bab 6 memakai daftar klien ERP yang sudah ada di
  ringkasan proyek; bab 7 memakai "sembilan dari sepuluh proyek punya halaman arsitektur",
  dihitung ulang oleh tes.
- Atas permintaan Farrez, bab 2 memakai laptop, HP, dan kamera aksi CSS 3D yang memutar
  rekaman layar Coderoach OS.
- Bab 8 berakhir di papan rak dan tombol ke rak, tanpa animasi FLIP ke kanvas three.js.

Label bukti: **[V]** dicek langsung (DOM, CSS, jaringan, berkas repo), **[B]** dari baca
kode/dokumen, **[D]** dugaan. Teks bertanda `[slot]` menunggu bukti dari Farrez atau
`karier-frz/claims-audit.md`, sama seperti aturan di `docs/naskah-adegan.md`.

## 1. Audit miftahul.com (dibuka di pane, 10 Nov 2026)

### Struktur dan urutan seksi [V]

Diukur dari DOM di layar 1024 px (tinggi halaman 14.367 px; di HP 375 px jadi 18.398 px).

| # | Seksi (class) | Tinggi | Isi | Gerak dan pemicu | Cara bangun |
|---|---|---|---|---|---|
| 0 | Loader | layar | Huruf M-I-F-T-A-H-U-L muncul satu per satu | Waktu, sekali | `@keyframes loader-letter-anim` |
| 1 | `.cut` (hero) | 2.413 px, holder sticky | Video potret sinematik (cahaya lewat kerai), nama EFAZ, lalu "I build full-stack web products / designed to launch, engineered to last." | Gulir: video dipotong jadi 16 kolom yang bergeser, ada efek "burn" dan "flare" seperti film terbakar | Variabel CSS per frame (`--cut-cols: 16`, `--cut-burn`, `--cut-flare`, `--cut-curtain`); teks headline digandakan 16 kali per irisan, 16 salinan `aria-hidden`, 1 terbaca |
| 2 | `.rake` | 2.381 px, di-pin | "Most sites are decoration. I build the ones that earn." lalu "THE PROOF STARTS BELOW" | Gulir: berkas cahaya vertikal menyapu dan menerangi kalimatnya sedikit demi sedikit | three.js r183 di canvas, `pin-spacer` (ciri GSAP ScrollTrigger), teks cadangan HTML di `.rake__fallback` |
| 3 | `.desk` | 2.611 px | Laptop 3D melayang masuk dan layarnya menampilkan situs itu sendiri; "Hi, I'm a Full-Stack Product Builder" dengan huruf tulisan tangan dan coretan bintang | Gulir: laptop berputar dan bergeser ke kanan | `laptop-web-optimized.glb` + Draco, three.js |
| 4 | `.wt` | 1.766 px | Kata WORKS | Gulir: huruf tersibak berkedip seperti glitch | three.js canvas |
| 5 | Galeri karya | ±1.000 px | 8 karya sebagai kartu melayang di ruang 3D, gambar muncul lewat dither piksel, daftar judul di kanan | Gulir dan hover | three.js, kartu diurut kedalaman, gambar lewat `/api/drive-image` (Google Drive) |
| 6 | `.vault-teaser` | 2.150 px, stage sticky | Tangan memegang map kaca bertulisan "click me", debu melayang, "Visuals and tools made by me. Take them." | Gulir: tangan masuk; klik: cahaya tumpah lalu jendela Vault terbuka | Gambar PNG + `filter: blur` lapis haze/glow + canvas debu 2D |
| 7 | `.contact` | 1.002 px | Kalimat diketik huruf per huruf, lalu "Hey there! How can we assist you on this evening **in Indonesia**?" | Masuk layar | Waktu dan negara dari jam lokal browser (zona `Asia/Jakarta`); **tidak ada** permintaan jaringan ke layanan lokasi |
| 8 | Footer | 768 px | Potret buram berbutir, "TURNING IDEAS INTO SYSTEMS", tombol "Book an intro call · 15 min", tautan | Tombol berdenyut | Canvas + lapis grain |

Lain-lain [V]: favicon animasi (`logo-m-loop.html`), menu bulat di kanan atas, 22 font face
terdaftar (Satoshi, Cabinet Grotesk, Bespoke Serif, Comico, Boreck, Optima, piksel, dll.),
banyak aturan `prefers-reduced-motion` yang mematikan animasi per komponen, dan seksi
`.seo-abstract` tersembunyi yang berisi teks utuh untuk mesin pencari. Seksi itu sendiri
menyebut tumpukannya: Next.js App Router, TypeScript, WebGL, GSAP, Lenis, Supabase sebagai CMS.

### Alur "Start a project" [V]

Wizard pilihan bertahap, bukan formulir panjang (dibuka sampai langkah 3, tidak dikirim):

1. "Ready to team up? … How can we help you?" → **Website** / **App**
2. "What kind of site are we building?" → Marketing/brand, E-commerce, Web app/dashboard,
   Portfolio, Landing page, Something else
3. "Things in life may not always be free, right? What's your budget for this project?" →
   $500–1k, $1k–2.5k, $2.5k–5k, $5k–10k, $10k+

### Copywriting [V untuk kutipan, D untuk penilaian]

- **Nada**: percaya diri, pendek, kontras. Kalimat 5 sampai 12 kata. Pola "X. Y yang
  membalik X": "Most sites are decoration. I build the ones that earn."
- **Pemilik usaha** disapa lewat uang dan hasil ("earn", pita anggaran, "15 min" untuk
  panggilan). Tiap studi kasus dibuka satu kalimat hook dari keadaan klien: "Ten sports,
  one phone number, endless back-and-forth."
- **Studi kasus berstruktur tetap** (dibaca dari data halaman): hook, narasi 3 ketukan
  (masalah, sistem, hasil), daftar masalah, 3 prinsip desain (judul + alasan), layar dengan
  keterangan, catatan build, timeline, peran, status (Live), dan label jujur "Client Work"
  vs "Concept Brand Site · Design Study".
- **Perusahaan besar** hampir tidak disapa langsung. Karyanya resort, lapangan olahraga,
  arsitek, logistik konsep. Ini celah yang bisa Farrez isi (ERP, multi-klien, keamanan).

### Ambient [V]

Satu suasana konsisten: hitam pekat, satu aksen bara (`--cut-ember: #b56c4b`), cahaya
hangat yang menyapu, butir film, debu, kabut blur. Tiap seksi punya satu sumber cahaya.

### Bagaimana menjawab tiap pembaca [D, dari struktur di atas]

| Pembaca | Yang mereka dapat |
|---|---|
| Orang yang lewat 7 detik | Video dan satu janji: "designed to launch, engineered to last." |
| Pemilik usaha | Kalimat "earn", hook per kasus dari masalah sehari-hari, wizard + pita harga, panggilan 15 menit |
| Calon klien yang teliti | Studi kasus lengkap: prinsip, layar, timeline, status |
| Developer | Repo dan live URL per kasus, catatan build |
| Perusahaan besar | Lemah: tidak ada bahasan keamanan, skala, atau proses |

### Biaya yang perlu dihindari [V]

Empat canvas WebGL sekaligus, 22 font face, halaman 14 sampai 18 ribu piksel. Di pane,
seksi kontak sempat tampil hitam sampai digulir pelan (animasi masuk menunggu pemicu).

## 2. Pelajaran untuk Farrez

| # | Yang dilihat di miftahul.com | Pelajaran | Penerapan di farrez.vercel.app |
|---|---|---|---|
| 1 | Janji dua bagian: "designed to launch, engineered to last" | Satu janji yang bisa dibuktikan, lalu buktinya | Headline Farrez sudah begitu ("dipakai tiap hari"); alur cerita jadi buktinya |
| 2 | "The proof starts below" setelah klaim | Tiap klaim langsung disusul bukti | Tiap bab ditutup satu bukti dari proyek nyata (bukan angka karangan) |
| 3 | Studi kasus: hook, masalah, prinsip, status, label Client Work/Study | Label status jujur menaikkan kepercayaan | Buklet sudah punya Overview sampai Outcome; tambah status ringkas (Live, Pilot, Testnet) di punggung CD |
| 4 | Wizard Website/App lalu jenis lalu anggaran | Pengunjung memilah dirinya sendiri, Farrez dapat brief yang rapi | Wizard "Apa yang mau Anda bereskan?" dengan cabang Android, sistem kantor/ERP, iklan sampai WhatsApp, alur konten |
| 5 | "this evening in Indonesia" dari jam browser | Kejutan kecil yang personal tanpa melacak | Sapaan pagi/siang/sore/malam dari jam lokal di kontak, tanpa layanan lokasi |
| 6 | Satu kejutan per seksi (irisan video, cahaya menyapu, laptop, map kaca) | Kejutan terikat makna seksi, bukan hiasan | Tiap bab punya satu benda yang berubah: coretan, garis, segel, cakram, tumpukan, sampul |
| 7 | Satu aksen hangat, butir, debu | Ambient = satu cahaya + tekstur, konsisten | Pakai yang sudah ada: panggung beige, grain, debu, hijau fosfor hologram. Tidak menambah palet |
| 8 | 16 salinan teks `aria-hidden`, 1 terbaca; seksi teks untuk SEO | Efek visual boleh menggandakan teks asal pembaca layar dapat satu | Semua bab tetap HTML terbaca; dekorasi `aria-hidden` |
| 9 | Banyak aturan reduced-motion per komponen | Tiap efek punya keadaan diam yang utuh | Mode Ringan dan reduced-motion menampilkan bab sebagai daftar statis yang lengkap |
| 10 | 4 WebGL + 22 font + halaman sangat panjang | Itu harga yang mahal | Tanpa canvas baru di mode Ringan; satu canvas yang sudah ada di Imersif; tanpa font baru |
| 11 | Perusahaan besar tidak disapa | Celah pasar | Bab keamanan, skalabilitas, infrastruktur dengan bukti dari ERP, Jeda, AkarKita, halaman arsitektur |

## 3. Alur cerita gulir (arah yang direkomendasikan: "Dari demo ke rak")

### Di mana tempatnya

Di antara **Gerbang** dan **Rak**, sebagai satu seksi `CeritaKerja` di halaman yang sama
(ADR 0007 tetap: header dan kontak tidak hilang). Ceritanya meminjam proses rekaman album,
jadi tetap di dunia rak CD: **demo → aransemen → liner notes → segel → diputar berulang →
press → pabrik → masuk rak**. Bab terakhir menyerahkan cakram ke rak, jadi cerita ini
menjadi pintu masuk rak, bukan tambahan yang berdiri sendiri.

- **Imersif**: bab berupa HTML di atas latar panggung beige; benda tiap bab digambar
  SVG/CSS. Hanya bab 8 yang menyentuh three.js (cakram mendarat ke rak yang sudah ada).
- **Ringan**: bab yang sama, gerak CSS ringan; bab 8 berupa sampul yang menyusut ke kisi.
- **reduced-motion / tanpa JS**: daftar bernomor seperti track list, semua teks dan bukti tampil.
- Tombol "Lihat proyek" di hero tetap melompat ke rak; ada tautan lewati di awal seksi.
- Panjang target: 8 bab × ±70vh ≈ 5,5 layar di desktop. ADR 0007 meminta ditinjau ulang
  bila pengunjung tidak sampai ke kontak; ini menambah jarak, jadi ukur setelah rilis.

### Bab dan draf copy

Nada mengikuti keputusan yang sudah ada: sapaan "Anda", formal ringan, istilah kerja tetap
Inggris (`docs/naskah-adegan.md`). Label bab ditulis seperti track list: `01 Demo`. ID ditulis
dari pembaca Indonesia, bukan terjemahan EN.

| # | Label | ID | EN | Bukti yang dipakai |
|---|---|---|---|---|
| 1 | Demo (ide atau kebutuhan) | **Sistem yang bagus sering berawal dari keluhan kecil.** Ceritakan masalahnya dengan kata Anda sendiri. Bagian teknisnya urusan saya. | **Good systems often start as a small complaint.** Tell me the problem in your own words. The technical side is my job. | Chip kebutuhan dari ringkasan proyek nyata (lihat di bawah) |
| 2 | Arrangement (desain sesuai kebutuhan) | **Bentuknya ikut kebutuhan.** Kadang jawabannya aplikasi Android. Kadang sistem kantor, alur dari iklan sampai pesanan di WhatsApp, atau alur kerja konten. | **The shape follows the need.** Sometimes it is an Android app. Sometimes an office system, an ad-to-WhatsApp order flow, or a content workflow. | YiheeCam, ERP, Pilot iklan, Viralytics [B]. "Alur kerja konten" `[slot: proyek bukti, Viralytics atau lain]` |
| 3 | Liner notes (transparansi) | **Anda selalu tahu posisinya.** Keputusan penting saya tulis bersama alasannya. Status juga ditulis apa adanya: d-day sudah lulus uji di testnet dan belum pernah memakai uang sungguhan. | **You always know where things stand.** Every key decision is written down with its reason. Status is stated as it is: d-day has passed testnet and has never used real money. | `docs/decisions/` repo ini [V]; ringkasan d-day di `content/proyek.js` [V] |
| 4 | Sealed (security) | **Yang bisa melihat hanya yang memang perlu.** Di Jeda, psikolog hanya membaca catatan yang dipilih kliennya. Di AkarKita, pohon keluarga hanya terbuka lewat undangan. | **Only the people who need to see it can see it.** In Jeda, the psychologist reads only what the client chooses to share. AkarKita opens a family tree by invitation only. | `content/proyek.js` (jeda, akarkita) [V]; cek peran di server, `content/arsitektur.js` [B] |
| 5 | On repeat (reliability) | **Tetap jalan di hari yang buruk.** Catatan di Jeda tetap bisa ditulis tanpa sinyal, lalu menyusul begitu sinyal kembali. Saat vendor kamera aksi berhenti merawat aplikasinya, YiheeCam menggantikannya. | **Still working on a bad day.** Jeda lets you write with no signal and syncs once you are back online. When an action camera's vendor stopped maintaining its app, YiheeCam took its place. | `content/arsitektur.js` (menulis tanpa sinyal) [V]; ringkasan YiheeCam [V] |
| 6 | Press run (scalability) | **Dari satu klien ke banyak, tanpa mulai dari nol.** ERP di software house tempat saya bekerja dipakai beberapa klien sekaligus. `[slot: satu angka skala yang boleh dibuka]` | **From one client to many, without starting over.** The ERP at the software house where I work serves several clients at once. `[slot]` | Ringkasan ERP [V]; angka belum ada, jangan dikarang |
| 7 | The plant (infrastructure) | **Yang tidak terlihat dirawat sama telitinya.** `[slot: praktik yang bisa dibuktikan, mis. tiap perubahan dites otomatis sebelum naik, ada jalan kembali ke versi sebelumnya]` Tiap proyek punya halaman arsitektur yang bisa Anda buka. | **The parts nobody sees get the same care.** `[slot]` Every project has an architecture page you can open. | Halaman arsitektur per proyek, ADR 0008 [V]; klaim CI/rollback per proyek belum dicek |
| 8 | In the rack (produk jadi) | **Lalu jadilah sistem yang dipakai tiap hari.** Sepuluh di antaranya ada di rak ini. | **And then it becomes a system people use every day.** Ten of them are on this shelf. | 10 proyek di `content/proyek.js` [V]; menggemakan headline hero |

Chip kebutuhan di bab 1 (tiap chip menaut ke proyeknya; kalimat disusun dari ringkasan
proyek, minta Farrez cek apakah begitu cara klien mengucapkannya):

| Proyek | ID | EN |
|---|---|---|
| Pilot iklan | Iklan sudah jalan, tapi pesanan tercecer di chat WhatsApp. | The ads run, but orders get lost in WhatsApp chats. |
| Viralytics | Kampanye, brief, kontrak, dan invoice ada di lima tempat berbeda. | Campaigns, briefs, contracts and invoices live in five different places. |
| YiheeCam | Aplikasi kamera dari vendornya sudah tidak diurus. | The camera's own app has been abandoned. |
| FiFoFun | Mutasi bank tiap bulan direkap manual. | Bank statements get tallied by hand every month. |
| nds-etl | Distributor ingin tahu posisi jaringannya tanpa menunggu laporan. | Distributors want to see their network without waiting for a report. |

Sapaan kontak (pelajaran 5), dari jam lokal browser: "Selamat malam. Ada yang bisa saya
bantu?" / "Good evening. What can I help with?"

Wizard kontak (pelajaran 4), menggantikan formulir pertama di `Contact.jsx`, hasilnya mengisi
pesan email yang sudah ada (EmailJS):

1. **Apa yang mau Anda bereskan?** Aplikasi Android · Sistem kantor atau ERP · Iklan sampai
   pesanan masuk · Alur kerja konten · Belum tahu, saya ceritakan saja
2. **Siapa yang akan memakainya?** Saya sendiri · Tim kecil · Perusahaan dengan beberapa divisi
3. **Kapan perlu jalan?** Bulan ini · Dalam 3 bulan · Masih menjajaki
4. Pita anggaran seperti miftahul.com **opsional**, keputusan Farrez (untuk pasar Indonesia
   bisa terasa menyaring terlalu cepat [D]).

## 4. Teknik animasi per bab (termurah dulu)

Penggerak tunggal: variabel `--p` 0 sampai 1 per bab, cara yang sudah dipakai
`HeadlineGulir`. CSS `animation-timeline: view()` dipakai bila tersedia
(`@supports` + `prefers-reduced-motion: no-preference`), selain itu `--p` dari satu
listener gulir pasif. **Tanpa dependensi baru**: Motion dan three.js sudah terpasang
(ADR 0003, 0004). GSAP/Lenis tidak perlu; menambahkannya keputusan signifikan.

| # | Benda yang berubah | Teknik (level) | Pola bank `coderoach-referensi/demo/pola` | Ringan / reduced-motion |
|---|---|---|---|---|
| 1 | Coretan tangan menggambar dirinya, chip kebutuhan melayang masuk | SVG `stroke-dashoffset` dari `--p` (L1) | 67 Garis tergambar, F2 Muncul saat masuk | Coretan utuh, chip diam |
| 2 | Coretan bercabang jadi 4 jalur (Android, ERP, iklan, konten), tiap jalur berujung ikon proyek | Satu path SVG panjang + `offset-path` (L1–L2) | 84 Benang singgah (asal Codrops OneElementScroll, MIT), 66 Objek menyusuri jalur | Empat jalur tergambar penuh |
| 3 | Buklet terbuka, credits tercetak baris per baris, kata kunci disorot | Opacity per kata dari `--p` (L1) | 08 Sorot kata per kata (sama dengan stabilo hero) | Teks penuh |
| 4 | Kotak CD tertutup, segel bening menempel | `clip-path` + `scale` (L1) | 01 Sibak produk | Kotak bersegel diam |
| 5 | Cakram berputar 120 rpm stabil sementara bar sinyal turun ke nol lalu naik | CSS `@keyframes` + `--p` untuk bar (L1) | F3 + 05 tanpa angka | Cakram diam, bar penuh |
| 6 | Satu cakram menggandakan diri jadi tumpukan | Elemen berulang `translate` bertahap (L2) | 16 Tumpuk kartu miring (versi datar), 20 Kipas kartu | Tumpukan jadi |
| 7 | Sisipan belakang CD berubah jadi diagram alur arsitektur | Garis tergambar + crossfade (L2) | 67, 17 Gambar tetap, cerita bergulir; komponen `CeritaArsitektur` yang sudah ada | Diagram jadi |
| 8 | Cakram masuk ke kotak lalu kotak meluncur ke slot rak | Imersif: FLIP ke posisi rak three.js (L3); Ringan: sampul menyusut ke kisi (L2) | 33 Objek pindah slot, 04 Sampul menyusut jadi header | Sampul langsung di kisi |

Anggaran: tanpa gambar raster baru (semua SVG/CSS) ≤ 40 KB tambahan; tanpa font baru; tanpa
canvas baru. Anti-resep dari bank yang dihindari: A1 (galeri menyamping di panggung pin),
A3 (snap wajib), A4 (efek laju di atas teks penjelas).

## 5. Asal pola dan lisensi

| Pola / teknik | Dari | Lisensi | Cara dipakai |
|---|---|---|---|
| Struktur janji → bukti, wizard, sapaan jam lokal, label status jujur | miftahul.com | Tanpa lisensi terbuka (situs komersial) | Ide dan struktur saja; tidak ada kode, aset, font, atau kalimat yang disalin |
| Proses rekaman sebagai cerita, kotak CD | Konsep Farrez sendiri, Discography sebagai inspirasi benda | Discography tanpa berkas LICENSE (dicek 10 Nov 2026, commit b9cf73f) | Tetap ADR 0006: teknik saja |
| 84 Benang singgah | Codrops OneElementScroll | MIT (rakitan di `demo/rakitan/one-element-scroll`) | Boleh dipinjam dengan atribusi di `public/credits.txt` |
| 01, 04, 08, 17, 33, 66, 67, F2, F3 | Galeri pola coderoach-referensi (kode sendiri), contoh dari scroll-driven-animations.style | Apache 2.0 untuk demo Chrome | Ditulis ulang dengan token project |
| Disiplin `@supports` + reduced-motion | `~/.claude/references/web-motion-dan-alat-gemini.md`, skill aset-visual-web §1 | | Aturan wajib |

## 6. Yang berubah di repo dan perkiraan kerja

| Bagian | Berkas | Perkiraan |
|---|---|---|
| Konten bab (ID/EN) dan cek klaim `[slot]` | `content/cerita.js` baru, `messages/*.json` | 0,5 hari, plus jawaban Farrez untuk slot |
| Seksi HTML + CSS + SVG 8 bab, mode Ringan dan reduced-motion | `components/cerita/` baru, `app/[locale]/page.jsx` | 2 hari |
| Bab 8 serah ke rak di Imersif | `components/imersif/RakGulir.jsx`, `lintasan.js` | 1,5 hari |
| Wizard kontak + sapaan jam lokal | `components/contact/` | 1 hari |
| Tes (urutan bab, kunci i18n lengkap di dua locale, keadaan reduced-motion, wizard mengisi pesan), audit impeccable, cek HP 375 px | `tests/` | 1 hari |
| DESIGN.md, ADR baru untuk alur cerita | `DESIGN.md`, `docs/decisions/0011-…` | 0,5 hari |
| **Total arah rekomendasi** | | **±6,5 hari kerja** |

Arah lain (untuk pertanyaan keputusan): **Cetak biru** (satu garis biru-hitam yang
menggambar produk, netral untuk korporat, ±5 hari), **Gaya Apple** (bab di-pin, satu foto
produk besar per bab, bento untuk lima pilar, ±6 hari plus aset gambar), **Sinematik ala
miftahul** (latar gelap, cahaya menyapu WebGL, video; bertabrakan dengan panggung beige dan
DESIGN.md, ±10 hari plus aset video).
