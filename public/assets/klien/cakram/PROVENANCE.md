# Asal muka cakram klien

Dibuat 12 Nov 2026 di Google Flow (Nano Banana 2.1, akun Google AI Pro Farrez, 0 kredit), satu
prompt per klien dengan logo asli sebagai bahan. Buatan AI, kecuali logonya: setelah itu
`scripts/logo-cakram.py` menimpa logo dengan piksel berkas asli (asal logo di
`desain/klien/logo/PROVENANCE.md`), lalu `scripts/cakram-akhir.py` memotong bulat 640 px.
Selisih piksel tinta logo dengan berkas asli paling besar sekitar 4/255.

| Berkas | Varian Flow | Catatan |
|---|---|---|
| uruzin, sanden | a, b | contoh pertama |
| tgr | ulang 1:1, b | versi 16:9 terpotong |
| raja-roti, success-career, studentchanges, chicken-wow, jasindo | b | |
| saychick, terasol, rpn-agro, pbt | a | viralytics a gugur: AI mengubah warna logo |
| viralytics | b | pbt b gugur: logo tidak ditemukan |
| geprek-wow, tumtim, saksama | a | tanpa logo; nama ditulis Nano Banana, ejaan dicek |
| acms | b | tanpa logo; ejaan dicek |
| pribadi-* | label album | dari `public/assets/album/<slug>/label.webp`; jeda dipotong manual |

Prompt lengkap ada di riwayat sesi dan pola umumnya di skill aset-visual-web §2b (coderoach-app).
Unduhan mentah: `D:\downloads\claude\2026-11-12-flow-cakram-klien\`.

## Revisi 12 Nov 2026: semua cakram berlogo asli

Atas revisi Farrez ("harus jelas ada logonya"). Unduhan mentah di `v2enar\`.

| Berkas | Varian | Logo | Catatan |
|---|---|---|---|
| terasol | a | terasol-lockup.png | logo rumah dari booklet; ikon bulat aplikasi tidak dipakai lagi |
| chicken-wow, geprek-wow | a, b | lockup-chicken-wow, lockup-geprek-wow | satu kelompok Masaya Food |
| masaya-food | a | masaya-food.png | induk Chicken Wow dan Geprek Wow |
| tumtim | a | tumtim.png | |
| bni | b | bni.png | menggantikan acms.webp; logo sumber 241 px, sedikit diperbesar |
| pribadi-fifofun, -nds-etl (b), -akarkita, -jeda (b), -yiheecam, -d-day (b) | | lockup-<slug>.png | gaya dari label album, dua bahan Flow; d-day a gugur (skor 0,36) |

Dihapus: saksama.webp, acms.webp (tanpa logo), pribadi-pilot-iklan.webp (proyek tanpa logo, menunggu keputusan Farrez).
