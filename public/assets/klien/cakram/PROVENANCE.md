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
