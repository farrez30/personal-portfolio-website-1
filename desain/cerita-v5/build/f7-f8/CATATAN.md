# F7 dan F8: jeda gerak, suara modul, gerak dikurangi, v5 jadi beranda (24 Nov 2026)

Keputusan Farrez 24 Nov: v5 jadi beranda ("portfolio sekarang saya bisa melihat yg baru di prod"),
versi rak CD tetap bisa diakses ("nasib yg versi lama CD masih bisa diakses"). Caranya sudah ada di
ADR 0026: rute arsip `/arsip/cd`, tidak ada yang dihapus. F8 lama (membuang dunia toko kaset)
tidak dijalankan.

## Yang berubah

| Berkas | Isi |
|---|---|
| `app/[locale]/page.jsx` | beranda = cerita v5 (DuniaV5, Gerbang dengan CV, CeritaV5, ModulLab, Klien, Kontak) dan tautan "Versi lama: rak CD" di ujung |
| `app/[locale]/arsip/cd/page.jsx` | beranda lama apa adanya, noindex |
| `app/[locale]/v5/page.jsx` | `permanentRedirect` ke beranda, parameter (`?proyek=`) ikut |
| `components/gerbang/Gerbang.jsx` | prop `proyek` (jangkar tombol Lihat proyek): `#modul-lab` di beranda, bawaan `#rak` di arsip |
| `app/[locale]/proyek/[slug]/page.jsx`, `components/lab/HubLab.jsx` | tombol kembali ke `/#modul-lab` (ada di mode Imersif maupun Ringan) |
| `components/bilah/TombolJeda.jsx`, `Bilah.jsx`, `bilah.css` | tombol jeda gerak di bilah, hanya saat dunia v5 terpasang di mode Imersif; bilah dipadatkan di bawah 420 dan 380 px, dua baris di bawah 340 px |
| `components/stasiun/adegan.js` | jeda global lewat jam gerak (lalu lintas, satelit, gerak latar modul berhenti dan lanjut dari titik yang sama); HP dengan CPU atau memori 4 atau kurang digambar di DPR 1 |
| `components/stasiun/DuniaV5.jsx` | bunyi relay saat loker dibuka, rapat saat ditutup, klik saat Berikutnya, room tone selama di modul (mesin suara bersama, ikut saklar speaker) |
| `components/klien/klien.css` | deretan titik posisi klien boleh turun baris (temuan: 22 titik meluap 8 px di 360 px, juga di versi CD) |
| `DESIGN.md`, ADR 0026, storyboard §7 | beranda v5 didokumentasikan, bagian CD ditandai arsip |

## Ukur (build lokal, Chrome headless, ANGLE D3D11)

| Ukuran | HP 390x844 DPR 2 CPU 4x | Desktop 1440x900 |
|---|---|---|
| Rute | `/id`, `/en`, `/id/arsip/cd`, `/en/arsip/cd` 200; `/id/v5?proyek=jeda` 308 ke `/id?proyek=jeda` | sama |
| Draw call terbanyak | 34 | 34 |
| Bingkai pertama modul lab | 22 ms | 11 ms |
| Galat konsol | 0 | 0 |
| Uji keyboard (Tab, Enter, Escape, Back, Berikutnya, tautan langsung) | lulus | lulus |
| Tombol jeda di bilah | jam gerak latar modul beku (31,89 tetap 31,89 sesudah 1,2 s); lalu lintas dan satelit dari baca kode, tidak diukur | sama |

Gerak dikurangi (`--kurangi`, `prefers-reduced-motion: reduce`, `ukur-hp-kurangi.json`): kesebelas
perpindahan termasuk zoom selesai di bingkai pertama (4 bingkai, batas bawah skrip; tanpa gerak
dikurangi 7 sampai 56), rel hanya di titik rak (x -1,15, 0,05, 1,25, 8,65, 9,85, 11,05), loker
langsung terbuka (u = 1), jam gerak latar tidak berjalan.

Arsip CD (`scripts/ukur-dunia.mjs /id/arsip/cd`): loader sampai 100%, dunia siap 5,7 s, semua
anchor toko kaset ada, bingkai median 6,1 ms saat pindah.

Lebar bilah dan halaman (scrollWidth lawan lebar layar), beranda dan arsip: 320, 360, 390 px pas.
Sebelum perbaikan, bilah beranda di 390 px memotong tombol tema (`bilah-hp-sebelum.jpg`).

## Yang belum

- **HP sungguhan belum diuji** (syarat F7 di storyboard). Semua angka dari emulasi.
- 768 px (tablet): kedua halaman 31 px lebih lebar dari layar; yang melewati hanya elemen fixed
  (pemutar musik, rel cerita CD), akarnya belum ketemu. Sudah ada di prod sebelum F7.
- Uji fokus terprogram ke item pertama daftar tidak tertahan di skrip (sebab belum diketahui);
  navigasi Tab sungguhan item demi item lulus.
- Bingkai pertama tahap gedung (hero) 264 ms HP, 284 ms desktop, temuan lama sejak F2.
- Suara modul memakai bawaan mesin suara situs: bunyi kecuali pengunjung memilih gerak dikurangi
  atau membisukannya. Storyboard §4 menulis "mati bawaan"; belum diputuskan ulang.

## Tayang di prod (24 Nov 2026, 16:10 UTC)

Deploy prod lewat Vercel CLI dari master 9531965 (deploy otomatis sesudah merge ditolak batas
harian akun Free). `https://farrez.vercel.app`: `/id`, `/en`, `/id/arsip/cd`, `/en/arsip/cd`,
`/id/proyek/jeda`, `/id/lab` 200; `/id/v5?proyek=jeda` 308 ke `/id?proyek=jeda`; arsip memuat
`noindex`. Ukur HP CPU 4x di prod (`ukur-prod-hp.json`): 0 galat, maks 25 draw call, bingkai
pertama modul 34 ms, uji keyboard lulus (fokus L-01, empat Tab ke L-05, Enter, Escape, Back,
Berikutnya, tautan langsung), tombol jeda membekukan gerak latar, dunia memudar sesudah seksi lab.
Putaran pertama gagal karena port debug Chrome bertabrakan dengan sesi lain; skrip sekarang
memeriksa port kosong lebih dulu.

## Tautan dua arah beranda dan arsip (25 Nov 2026)

Riset (subagen peneliti, Fable 5.2): portofolio nyata memajang versi lama sebagai kartu proyek atau
menu arsip, jarang di footer; situs dokumentasi memberi pita di atas versi lama; NN/g menyebut logo
saja tidak cukup sebagai jalan pulang. Keputusan Farrez: tautan teks "Versi terbaru" di bilah atas
halaman arsip, dan rak CD jadi loker L-14 di modul lab selain tautan footer.

- `Bilah.jsx`: "Versi terbaru" hanya di `/arsip/...`; di HP bilah arsip dua baris (terukur: 418 px
  lebar halaman di layar 360 sebelum diperbaiki, sesudahnya pas di 320, 360, 390, 1440 px).
- `lab.js`: loker tambahan `["arsip", "kontak"]`, kontak tetap terakhir; 15 loker, rak terakhir satu
  pintu (tanpa pengisi). Astronot pindah ke dekat palka node karena semua ceruk terisi.
- Ukur HP CPU 4x: 0 galat, maks 25 draw call, bingkai pertama modul 29 ms, uji keyboard lulus.
