# Asal klip demo hologram

Klip demo tanpa suara, H.264, diputar di layar hologram untuk proyek yang tidak bisa
dibingkai langsung. Mentahnya di `D:\downloads\claude\2026-11-09-demo-hologram`.

| Berkas | Jenis | Sumber | Diambil | Catatan |
|---|---|---|---|---|
| coderoach-os-desktop.mp4 | rekaman | Coderoach OS dijalankan lokal (`next dev`), viewport 1280x800, 19,6 s, dipercepat 1,15x | 9 Nov 2026 | Postgres Docker baru berisi `src/db/seed.ts`, `src/db/data-awal.ts`, dan `scripts/demo-data.ts` (nama dari `scripts/nama-demo.ts`); DATABASE_URL dicek 127.0.0.1, rahasia `.env*` ditimpa nilai acak. Klien yang tampil fiktif (PT Contoh Rasa Nusantara, Warta Contoh Media, Prospek Fintech A); Farrez, Wafi, dan Staff Coderoach tampil sebagai pengguna. Butir "Pemindai tidak menjangkau 20 repo" disembunyikan karena memuat nama repo asli. Alur: Beranda, Proyek, Penawaran, Invoice, Ringkasan, Board. |
| coderoach-os-hp.mp4 | rekaman | Sama, viewport 390x780, 19,5 s, dipercepat 1,2x | 9 Nov 2026 | Sama; alur Beranda, Proyek, Invoice, Board lewat menu samping. |
| d-day-desktop.mp4 | rekaman | Dashboard d-day dijalankan lokal, viewport 1280x800, 19,6 s | 9 Nov 2026 | Postgres sekali pakai berisi migrasi dan candle dari fixture repo; `.env` asli tidak dipakai, variabel bursa dan akses dibuang. Strategi demo `demo_ema`, backtest 1.000 USDT; hasilnya rugi -7,32% dan dibiarkan apa adanya. Tombol Aktifkan tidak ditekan. Tanpa saldo, kunci, ID akun, atau nama orang. Bagian menunggu dipotong, sisanya dipercepat 1,25 sampai 4,2 kali. |
| d-day-hp.mp4 | rekaman | Sama, viewport 390x780 dengan skala 2 (video 780x1560), 18,7 s | 9 Nov 2026 | Sama. |
| yiheecam-desktop.mp4 | gulir | https://coderoach.id/work/yiheecam, viewport 1280x800, 14,3 s | 9 Nov 2026 | Halaman case study publik, Chrome profil kosong. Spanduk promo ditutup lewat tombolnya; gulir berhenti sebelum bagian Sumber. |
| yiheecam-hp.mp4 | gulir | Sama, viewport 390x780 (emulasi HP), 14,3 s | 9 Nov 2026 | Sama. |
| erp-software-house.mp4 | sinematik | Google Flow, Omni 1.2 Flash, 720p 16:9, 6 s, project "Nov 09 - 23:43" | 9 Nov 2026 | Klip AI bergaya Swiss International Style: juru tulis menyortir formulir ke tiga tumpukan. Bukan layar produk. Orang fiktif. Ada label kecil setengah terbaca di kartu (tulisan AI), bukan klaim. Audio dibuang, encode ulang CRF 27. Dipakai juga untuk HP (dipotong tengah). |
| viralytics.mp4 | sinematik | Sama | 9 Nov 2026 | Kolase 70-an: balon chat menjadi papan kampanye, potret kreator fiktif, tumpukan kertas bertulisan INVOICE. Sama. |
| nds-etl.mp4 | sinematik | Sama | 9 Nov 2026 | Poster konstruktivis: perempuan lanjut usia fiktif dengan ponsel, pohon jaringan tumbuh dari satu titik. Ada potongan huruf acak di pojok kanan bawah. Sama. |
| pilot-iklan.mp4 | sinematik | Sama | 9 Nov 2026 | Pop art: pemilik toko fiktif dengan ponsel, balon chat kosong bermunculan. Tanpa merek. Sama. |

Prompt keempat klip sinematik ada di `docs/seni-cd/prompt-video.json`. Biaya 72 kredit Flow (1.196 menjadi 1.124), tercatat di log kuota konten.

## Explainer bernarasi

Satu video per proyek per bahasa, 37 sampai 53 detik, diputar bersuara saat Play ditekan.
Naskahnya diturunkan dari teks buklet proyek (`content/buklet.js`) yang sudah disetujui
Farrez, tanpa klaim baru, tanpa nama klien, teman, atau merek. Naskah, prompt klip, dan
template Remotion tersalin di `docs/explainer/`; bahan mentah dan proyek Remotion lengkapnya di
`D:\downloads\claude\2026-11-10-explainer-hologram`.

- Narasi: Gemini TTS jalur gratis, satu permintaan per bahasa, dipotong per babak di jeda
  antarparagraf, diseragamkan kerasnya (loudnorm -16 LUFS) dan dipercepat paling banyak 1,2x.
  Model `gemini-3.1-flash-tts-preview`, kecuali akarkita, jeda, dan yiheecam
  (`gemini-2.5-flash-preview-tts`) dan d-day (`gemini-3.8-flash-lite-tts`) karena jatah harian habis.
- Gambar: klip Flow baru per adegan (prompt gaya album, tanpa tulisan, orang fiktif), klip
  sinematik atau rekaman lama di folder ini untuk adegan pembuka, dan klip pembuka diulang
  sebagai penutup di fifofun, akarkita, jeda, dan yiheecam. Tiga klip dipotong tepinya karena
  memuat tulisan karangan AI: logo di jeda adegan 2, papan toko di pilot-iklan adegan 2,
  poster di d-day adegan 3.
  Mentah unduhan Flow disimpan di `D:\Downloads D\Claude\2026-11-10 explainer-hologram\flow`.
- Efek sapuan: `public/assets/suara/kertas-1.mp3` (CC0, sudah dipakai situs), dipotong 0,7 s.
- Biaya: 37 klip x 18 kredit = 666 kredit Flow (satu klip ERP adegan 2 dibuat ulang karena kartu asuransinya bertulisan) (nds-etl sebelumnya 90 kredit), tercatat di log kuota konten.

| Berkas | Jenis | Sumber | Dibuat | Catatan |
|---|---|---|---|---|
| explainer/erp-software-house-id.mp4 | explainer | Remotion 4.0.538, 1280x720, narasi Gemini TTS suara Charon, klip Google Flow Omni 1.2 Flash | 10 Nov 2026 | Gaya Swiss International Style, Arial Bold (pengganti huruf situs). Bahasa Indonesia. |
| explainer/erp-software-house-en.mp4 | explainer | Remotion 4.0.538, 1280x720, narasi Gemini TTS suara Charon, klip Google Flow Omni 1.2 Flash | 10 Nov 2026 | Gaya Swiss International Style, Arial Bold (pengganti huruf situs). English. |
| explainer/viralytics-id.mp4 | explainer | Remotion 4.0.538, 1280x720, narasi Gemini TTS suara Charon, klip Google Flow Omni 1.2 Flash | 10 Nov 2026 | Gaya kolase foto 70-an, Shrikhand. Bahasa Indonesia. |
| explainer/viralytics-en.mp4 | explainer | Remotion 4.0.538, 1280x720, narasi Gemini TTS suara Charon, klip Google Flow Omni 1.2 Flash | 10 Nov 2026 | Gaya kolase foto 70-an, Shrikhand. English. |
| explainer/coderoach-os-id.mp4 | explainer | Remotion 4.0.538, 1280x720, narasi Gemini TTS suara Charon, klip Google Flow Omni 1.2 Flash | 10 Nov 2026 | Gaya Bauhaus, Josefin Sans. Bahasa Indonesia. |
| explainer/coderoach-os-en.mp4 | explainer | Remotion 4.0.538, 1280x720, narasi Gemini TTS suara Charon, klip Google Flow Omni 1.2 Flash | 10 Nov 2026 | Gaya Bauhaus, Josefin Sans. English. |
| explainer/fifofun-id.mp4 | explainer | Remotion 4.0.538, 1280x720, narasi Gemini TTS suara Charon, klip Google Flow Omni 1.2 Flash | 10 Nov 2026 | Gaya mid-century modern, Pacifico. Bahasa Indonesia. |
| explainer/fifofun-en.mp4 | explainer | Remotion 4.0.538, 1280x720, narasi Gemini TTS suara Charon, klip Google Flow Omni 1.2 Flash | 10 Nov 2026 | Gaya mid-century modern, Pacifico. English. |
| explainer/nds-etl-id.mp4 | explainer | Remotion 4.0.538, 1280x720, narasi Gemini TTS suara Charon, klip Google Flow Omni 1.2 Flash | 10 Nov 2026 | Gaya poster konstruktivis, Oswald. Bahasa Indonesia. |
| explainer/nds-etl-en.mp4 | explainer | Remotion 4.0.538, 1280x720, narasi Gemini TTS suara Charon, klip Google Flow Omni 1.2 Flash | 10 Nov 2026 | Gaya poster konstruktivis, Oswald. English. |
| explainer/akarkita-id.mp4 | explainer | Remotion 4.0.538, 1280x720, narasi Gemini TTS suara Charon, klip Google Flow Omni 1.2 Flash | 10 Nov 2026 | Gaya cetak cukil lino, Alfa Slab One. Bahasa Indonesia. |
| explainer/akarkita-en.mp4 | explainer | Remotion 4.0.538, 1280x720, narasi Gemini TTS suara Charon, klip Google Flow Omni 1.2 Flash | 10 Nov 2026 | Gaya cetak cukil lino, Alfa Slab One. English. |
| explainer/pilot-iklan-id.mp4 | explainer | Remotion 4.0.538, 1280x720, narasi Gemini TTS suara Charon, klip Google Flow Omni 1.2 Flash | 10 Nov 2026 | Gaya komik pop art, Bangers. Bahasa Indonesia. |
| explainer/pilot-iklan-en.mp4 | explainer | Remotion 4.0.538, 1280x720, narasi Gemini TTS suara Charon, klip Google Flow Omni 1.2 Flash | 10 Nov 2026 | Gaya komik pop art, Bangers. English. |
| explainer/jeda-id.mp4 | explainer | Remotion 4.0.538, 1280x720, narasi Gemini TTS suara Charon, klip Google Flow Omni 1.2 Flash | 10 Nov 2026 | Gaya minimalis ECM, Cormorant Garamond. Bahasa Indonesia. |
| explainer/jeda-en.mp4 | explainer | Remotion 4.0.538, 1280x720, narasi Gemini TTS suara Charon, klip Google Flow Omni 1.2 Flash | 10 Nov 2026 | Gaya minimalis ECM, Cormorant Garamond. English. |
| explainer/yiheecam-id.mp4 | explainer | Remotion 4.0.538, 1280x720, narasi Gemini TTS suara Charon, klip Google Flow Omni 1.2 Flash | 10 Nov 2026 | Gaya city-pop Jepang 80-an, Kaushan Script. Bahasa Indonesia. |
| explainer/yiheecam-en.mp4 | explainer | Remotion 4.0.538, 1280x720, narasi Gemini TTS suara Charon, klip Google Flow Omni 1.2 Flash | 10 Nov 2026 | Gaya city-pop Jepang 80-an, Kaushan Script. English. |
| explainer/d-day-id.mp4 | explainer | Remotion 4.0.538, 1280x720, narasi Gemini TTS suara Charon, klip Google Flow Omni 1.2 Flash | 10 Nov 2026 | Gaya sampul jazz Blue Note, Bebas Neue. Bahasa Indonesia. |
| explainer/d-day-en.mp4 | explainer | Remotion 4.0.538, 1280x720, narasi Gemini TTS suara Charon, klip Google Flow Omni 1.2 Flash | 10 Nov 2026 | Gaya sampul jazz Blue Note, Bebas Neue. English. |
