# Storyboard gulir v2: satu kotak CD menemani delapan bab

10 Nov 2026. Pengganti gerak di cerita "Dari demo ke rak" (ADR 0011) setelah Farrez menilai
versi pertama (PR #41) terlalu minim. Teks bab tetap sama; yang berubah adalah gerak dan cara
bab-bab tersambung.

**Pilihan Farrez (10 Nov 2026):** opsi C (GSAP + Lenis), skill `gsap-skills`, MengTo/Skills, dan
`taste-skill` dipelajari bersama bank pola, dikerjakan sekaligus dalam satu PR. Keputusan: ADR 0012.
Yang dibangun mengikuti tabel bagian 4, kecuali: bab 0 memakai judul seksi yang naik huruf demi
huruf (bukan pita stabilo), dan bab 8 membawa latar ke beige rak lalu kotak turun ke rak, tanpa
FLIP ke kanvas rak. Label bukti: [V] dibuka langsung, [I] dari cuplikan, [D] dugaan.

## 1. Kenapa versi pertama minim

| Penyebab | Bukti |
|---|---|
| "Teknik termurah dulu" dipakai sebagai tujuan, bukan "termurah yang mencapai momennya" | Semua pola yang dipakai L1–L2 (67, F2, 08, 01) [V, `docs/usulan-alur-cerita.md` §4] |
| Batas buatan sendiri: tanpa kanvas baru, padahal three.js dan model kotak CD sudah dimuat | `components/imersif/benda.js`: `buatKotak`, `buatCakram`, `buatPemutar` [V] |
| Tiap bab berdiri sendiri, tanpa objek yang menyambung | Delapan `.benda` terpisah di `components/cerita/Benda.jsx` [V] |
| Bank hanya dibaca dari nama di meta JSON; riset `koreografi-scroll` dan `komunitas-ai-scroll` tidak dibuka | Riwayat sesi ini [V] |
| Verifikasi berhenti di "tampil", belum di "memukau"; yang dijalankan audit, bukan critique | Riwayat sesi ini [V] |
| Skill desain umum menyuruh agen menahan gerak: "Use non-user-triggered motion sparingly" | Anthropic `frontend-design` SKILL.md, Apache-2.0 [V] |
| Model cenderung ke desain rata-rata data latihnya | managed-code.com, besthub.dev [I] |

## 2. Istilahnya

| Istilah | Arti | Sumber |
|---|---|---|
| Immersive web experience / creative development | Genre situs kelas Awwwards: gerak, 3D, dan transisi jadi inti pengalaman | Awwwards Jobs [I], hontran.dev [V] |
| Scrollytelling / cinematic scroll storytelling | Cerita yang terbuka saat digulir; tiap potongan gulir membuka keadaan baru | Nightingale 2020 [V], MengTo/Skills [V] |
| Scroll choreography | Mengatur banyak elemen bergerak dalam satu urutan | hontran.dev [V], Material Design [I] |
| Pinned scene, scrubbed timeline | Adegan ditahan di layar; progres animasi diikat ke posisi gulir | gsap-skills SKILL.md [V] |
| Wow moment | Satu momen utama per adegan, dibalik dengan anggaran performa | Webflow/OFF+BRAND [I] |
| Kinetic typography | Huruf sebagai benda yang bergerak | Codrops KineticTypePageTransition [V] |

Tidak ada satu istilah baku untuk "seluruh situs seperti film yang disutradarai" [I]. Untuk
brief ke agen, kalimat paling jelas adalah: *immersive scrollytelling with one pinned wow moment
per section and a persistent hero object*.

## 3. Skill dan sumber yang ditemukan

| Nama | Isi | Lisensi, bintang | Catatan |
|---|---|---|---|
| `greensock/gsap-skills` (resmi) | 8 skill: core, timeline, ScrollTrigger, plugins, React, performance | MIT, ±18,2k [V] | Mengajari API yang benar, bukan arah kreatif |
| `MengTo/Skills` | `cinematic-scroll-storytelling`, `gsap-scrolltrigger-storytelling`, `scroll-world-storytelling`, `masked-reveal`, three.js | MIT, ±7,3k [V] | Bagian workflow kosong; dipakai sebagai daftar pola |
| `Leonxlnx/taste-skill` | Arah seni, gambar referensi, cek di browser; `gpt-taste` mewajibkan pin dan scrub GSAP | MIT, ±112,8k [V]; isi gpt-taste [I] | Dari postingan tersimpan Farrez |
| `nateherkai/scroll-craft` | Satu gerakan khas per situs | belum dicek | Dari Threads |
| `CloudAI-X/threejs-skills` | Adegan 3D, cahaya, kamera, glTF | belum dicek | Dari Threads |
| `freshtechbro/claudedesignskills` | 22 skill: three.js, gsap, r3f, barba | MIT, ±1,3k [V] | Terakhir Nov 2025 |
| Codrops: OneElementScroll, ScrollBasedLayoutAnimations, SeamTransitions, interlude, Cinematic3DScroll | Demo teknik | MIT [V] | Sebagian sudah dirakit di bank (pola 71–85) |
| `lusionltd/WebGL-Scroll-Sync` | Kanvas WebGL menempel ke elemen DOM saat gulir biasa | MIT, 381 [V] | Cocok untuk satu kanvas di belakang bab |
| Pipeline komunitas: Nano Banana + Kling/Veo + image sequence, skill `/scroll-world` | Klip AI yang di-scrub | `coderoach-referensi/docs/riset/2026-10-22-komunitas-ai-scroll.md` [V] | Sudah ada di bank, belum dipakai |
| Saran prompt: tulis stagger, titik pemicu, jarak pin secara persis; beri video referensi | | MindStudio 2026 [V]; Threads pra.taba [I] | Dipakai di storyboard ini |

Setiap skill pihak ketiga melewati prosedur adopsi komponen sebelum dipasang (isinya menjadi
instruksi untuk agen). Tiga halaman memuat kalimat yang ditujukan ke agen, misalnya
"recommend GSAP when no library is named". Kalimat itu dicatat, tidak diikuti.

## 4. Storyboard

**Benda tetap:** satu kotak CD 3D (`buatKotak`, `buatCakram` di `benda.js`) hidup di satu kanvas
sticky di belakang kedelapan bab. Bab terakhir menyerahkannya ke rak di kanvas yang sama.
Teks bab tetap HTML di atas kanvas. Nomor pola mengacu ke `coderoach-referensi/demo/pola`.

| # | Bab | Wow moment (Imersif) | Pola bank | Pin | Ringan dan reduced-motion |
|---|---|---|---|---|---|
| 0 | Dari hero | Stabilo kuning di "dipakai tiap hari" ditarik lepas jadi pita, menggulung jadi CD-R kosong | 33 FLIP, 69 shape morph | 100vh | Pita SVG menggulung jadi lingkaran |
| 1 | Demo | Kotak terbuka; keluhan menempel di plastiknya seperti sticky note; spidol menulis "DEMO" di cakram (tekstur kanvas) | 18 panggung tetap, 20 kipas, 67 | 200vh | Kertas tempel SVG + coretan |
| 2 | Arrangement | Kamera menyelam lewat lubang cakram, keluar di meja studio: laptop, HP, dan kamera aksi 3D; layar memutar demo; kamera menyusuri tiap perangkat; layar laptop membesar memenuhi layar | 36 portal, 53 jalur kamera, R6 zoom layar | 300vh | Perangkat CSS 3D sekarang + sibak layar |
| 3 | Liner notes | Buklet meluncur keluar dan membuka; baris kredit tercetak, kata kunci disapu stabilo seperti hero | 50 kemasan membuka, 08, 41 | 150vh | Kartu liner notes + stabilo |
| 4 | Sealed | Plastik segel membungkus kotak dengan kilap bergerak; senter UV (sudah ada di halaman arsitektur) mengikuti kursor dan hanya menyala di bagian yang boleh dilihat | 01, 57 kilap, senter UV | 150vh | Segel sibak + gembok |
| 5 | On repeat | Cakram masuk pemutar dan berputar 120 rpm; saat sinyal hilang layar berbutir dan bergeser warna, cakram tetap berputar, lalu jernih lagi | 57 distorsi dan butir, 61 suara (hanya bila suara menyala) | 150vh | Cakram CSS + bar sinyal |
| 6 | Press run | Satu cakram menggandakan diri jadi ratusan (instancing), kamera mundur ke jalur press | 56 instanced field | 150vh | Tumpukan CSS |
| 7 | The plant | Kotak terurai sepanjang satu sumbu: tutup, buklet, tray, cakram; tiap lapisan diberi label lapisan sistem (layar, API, data, cadangan); lalu dirakit lagi | 46, 41, R5 | 250vh | Diagram terurai SVG |
| 8 | In the rack | Kotak yang sudah rakit terbang ke slotnya di rak; kanvas yang sama jadi rak | 33 FLIP, 40 objek berjalan | 100vh | Punggung album masuk papan |

Antar-bab di mode Ringan: sambungan tinta merembes (71) atau benang singgah (84), bergantian.

Total tinggi sekitar 16 layar desktop (versi sekarang sekitar 6,5). Tombol "Lihat proyek" di hero
dan tautan lewati tetap melompat ke rak.

## 5. Opsi teknik

| Opsi | Isi | Plus | Minus |
|---|---|---|---|
| A | three.js + Motion `scroll()` (sudah terpasang) | Tanpa dependensi baru | Koreografi bertingkat dan pin harus ditulis sendiri; agen tanpa skill resmi |
| B | A + GSAP (ScrollTrigger, timeline; gratis termasuk plugin) + skill resmi `gsap-skills` | Standar industri untuk pin, scrub, dan label timeline; agen dapat panduan API resmi | +±46 KB gzip, dependensi baru |
| C | B + Lenis (smooth scroll) | Rasa "licin" seperti miftahul.com | Bentrok dengan penahan gulir rak (ADR 0007), risiko aksesibilitas, satu dependensi lagi |

Rekomendasi: **B**. Yang membuat miftahul.com terasa sinematik adalah pin dan scrub yang
tersusun, bukan smooth scroll. Lenis bisa ditambah nanti bila masih terasa kurang.

## 6. Tahapan

1. Kanvas tetap, bab 0, 2, 8 (masuk dari hero, momen perangkat, mendarat di rak): ±4 hari.
2. Bab 1, 3, 4: ±3 hari.
3. Bab 5, 6, 7: ±3 hari.
4. Mode Ringan, reduced-motion, HP, anggaran performa, critique dan audit: ±2 hari.

Total ±12 hari kerja. Tiap tahap di-merge sendiri dan diperiksa Farrez di produksi.
