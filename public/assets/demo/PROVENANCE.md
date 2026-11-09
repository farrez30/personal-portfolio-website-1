# Asal klip demo hologram

Semua klip tanpa suara, H.264, diputar di layar hologram untuk proyek yang tidak bisa
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
