# Animatic cerita v3

Purwarupa gulir kasar dari styleframe dan jalur kamera, untuk menguji ritme sebelum build 3D.
Bukan bagian situs. Data per beat (durasi, kamera, sambungan) ada di `naskah.js`.

Jalankan dari folder `desain/cerita-v3`:

    python -m http.server 4390 --bind 127.0.0.1

lalu buka http://127.0.0.1:4390/animatic/. Angka di kanan atas: beat, progres beat (u), progres
total. Rel merah di bawah dibagi menurut durasi tiap beat. `?hud=0` menyembunyikan angka, `?g=0.35`
mengunci progres (dipakai `kontak.mjs`).

Lembar kontak: `node kontak.mjs http://127.0.0.1:4390/animatic/index.html <folder> [--hp]`, hasil
11 Nov 2026 di `kontak-desktop.webp`, `kontak-hp.webp`, `kontak-sambungan.webp`.

Yang belum bisa ditunjukkan animatic dan baru muncul di build 3D: CD masuk rak satu per satu
(beat 10), benang merah yang berpindah benda, lampu yang menyala per titik (di sini seluruh gambar
menerang bertahap), dan mesin penggandaan yang bergerak.
