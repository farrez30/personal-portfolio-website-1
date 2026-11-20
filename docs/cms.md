# CMS portofolio

Isi situs diatur di **https://farrez.vercel.app/admin**, dengan Payload yang sama seperti coderoach.id
(ADR 0026). Berlaku untuk versi CD (toko kaset) dan nantinya cerita v5, karena keduanya membaca
data yang sama.

## Masuk

- **Username dan sandi**: ketik `farrez` (atau email) dan sandi dari Bitwarden, item
  "Portofolio CMS (produksi)" di folder `Pribadi/Portofolio`. Tombol mata di kolom sandi
  menampilkan isinya.
- **Google**: tombol "Masuk dengan Google". Hanya email yang sudah punya akun di menu Akun yang
  bisa masuk.
- Salah sandi 5 kali, akun dikunci 15 menit.

## Yang bisa diatur

| Menu | Isinya |
|---|---|
| Isi > Proyek | Album di rak: tampil atau sembunyi, urutan, judul, ringkasan, jenis, status, periode, warna sampul, tautan situs, repo, dan studi kasus. |
| Isi > Klien | Cakram di seksi klien: tampil atau sembunyi, urutan, nama, kelompok, tahun, industri, pekerjaan, jenis kerja, tautan studi kasus. Klien baru juga bisa ditambah di sini. |
| Isi > Tautan pribadi | Email, WhatsApp, LinkedIn, GitHub, dan berkas CV. |
| Teks situs | Semua tulisan di situs, satu menu per bagian (gerbang, kontak, klien, dan lainnya). |

Tiap kolom teks punya dua bahasa. Ganti **Locale** di pojok kanan atas ke English untuk
menyunting versi Inggris. Kolom yang dibiarkan kosong memakai teks bawaan dari repo.

## Cara pakai

**Menyembunyikan klien atau album.** Buka barisnya, hilangkan centang "Tampil di situs", lalu
Save. Halaman di situs berubah di kunjungan berikutnya; muat ulang sekali bila masih tampil.
Album yang disembunyikan halamannya jadi 404, dan kartu proyek pribadinya di seksi klien ikut
hilang. Box set yang induknya disembunyikan ikut menyembunyikan semua mereknya.

**Mengubah urutan.** Di daftar Proyek atau Klien, seret baris lewat pegangan di kiri.

**Mengubah tulisan.** Buka menu Teks situs, cari bagiannya, ubah, lalu Save. Teks yang memuat
`{n}`, `{judul}`, dan sejenisnya harus tetap memuatnya, karena angka atau nama diisi di situ.

**Klien baru.** Isi > Klien > Create New. Gambar cakram harus sudah ada di
`public/assets/klien/cakram/` (asalnya dicatat di `PROVENANCE.md` di folder itu), jadi
gambarnya tetap lewat repo.

## Yang tetap lewat repo

- Album baru, karena tiap album butuh sampul, buklet, dan adegan 3D.
- Cerita arsitektur dan halaman buklet (aturan ADR 0008 dan audit klaim).
- Gambar. CMS belum menerima unggahan; kolom gambar berisi jalur berkas di `public/`.

Aturan yang dijaga `npm test` juga dijaga CMS: ringkasan proyek tidak boleh memuat alamat situs,
detail login, atau nama klien kantor, dan tautan klien hanya ke studi kasus coderoach.id.

## Kalau database mati

Halaman yang sudah jadi tetap tampil seperti terakhir disimpan. Situs tidak kembali ke isi repo
diam-diam, jadi klien yang disembunyikan tidak muncul lagi. Admin tidak bisa dibuka sampai
database hidup lagi.

## Untuk developer

| Perintah | Gunanya |
|---|---|
| `npm run cms:migrasi` | Menjalankan migrasi yang belum. Build Vercel menjalankannya otomatis bila `DATABASE_URI` ada. |
| `npm run cms:migrasi -- migrate:create nama` | Membuat migrasi setelah koleksi, kolom, atau kunci `messages/*.json` berubah. `npm test` gagal sampai ini dijalankan. |
| `npm run cms:isi` | Mengisi CMS dari `content/*.js` dan `messages/*.json`. Yang sudah ada tidak disentuh; `-- --timpa` menimpa semuanya. |
| `npm run cms:akun` | Membuat akun admin, atau mengganti sandinya, dengan sandi dari Bitwarden. `-- -Produksi` memakai `.env.production.local`. |
| `npm run cms:importmap` | Setelah menambah komponen admin di `payload.config.js`. |

CLI `payload` bawaan tidak dipakai: pencari config-nya hanya membaca tsconfig, dan pemuatnya gagal
di Node 26. Skrip di `scripts/cms/` memanggil fungsi yang sama tanpa CLI.

Lingkungan:

| Variabel | Di mana | Isi |
|---|---|---|
| `DATABASE_URI` | Vercel Production saja | String koneksi Neon (pooled). Kosong di Preview, jadi preview memakai isi repo dan tidak menyentuh DB produksi. |
| `PAYLOAD_SECRET` | Vercel Production | 32 byte acak. Wajib bila `DATABASE_URI` ada. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Vercel Production | OAuth client tipe Web application. Redirect URI: `https://farrez.vercel.app/api/google/balik`. |

Tanpa `DATABASE_URI` (lokal tanpa DB, preview, tes), situs memakai isi berkas apa adanya. Untuk
dev lokal: jalankan Postgres (mis. `docker run -d --name porto-cms-pg -e POSTGRES_PASSWORD=... -p
127.0.0.1:5440:5432 postgres:17-alpine`), isi `.env.local`, lalu `npm run cms:migrasi`,
`npm run cms:isi`, `npm run cms:akun`.

Keamanan: REST `/api/<koleksi>` hanya untuk admin yang masuk, jadi klien yang disembunyikan tidak
bisa diintip lewat API. Halaman "buat akun pertama" Payload ditutup (`cms/koleksi/Users.js`).
Login Google memeriksa state, penerbit, audience, masa berlaku, dan email terverifikasi
(`cms/google.js`). Repo ini publik: klien yang disembunyikan tetap terbaca di `content/klien.js`.
Klien yang tidak boleh terbaca sama sekali dihapus dari repo, bukan hanya disembunyikan di CMS.
