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
