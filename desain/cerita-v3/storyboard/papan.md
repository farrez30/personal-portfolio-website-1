# Papan storyboard final cerita v3 (konsep film, satu soundstage)

Sumber isi untuk berkas `.pen` di folder ini. Satu berkas per papan supaya agen pen.dev tidak kena
batas 250K token per menit. Teks di bawah dipakai persis di kanvas.

## Benang merah (objek persisten)

Satu aksen merah singgah di setiap beat dan menyambungkan semuanya, pola bank 84 "benang singgah":
pensil merah (1), pita pembatas (2), benang di dinding storyboard (3), kabel merah (4), lampu tally (5),
playhead (6), cincin grading (7), lampu merah ruang tonton (8), segel lilin (9), tirai rak (10).
Kamera satu jalur tanpa potongan (pola 53 camera path) menyusuri soundstage.

## Ritme

Total sekitar 1.240vh di desktop, 900vh di HP. Kanvas three.js dipin sepanjang cerita; teks bab
muncul di sisi kiri (desktop) atau bawah (HP).

| # | Beat | Durasi desktop | Pola bank | Benang merah | Teks bab (Anda), lihat naskah-teks.md | Status teks |
|---|---|---|---|---|---|---|
| 1 | Ide | 120vh | 89 coretan jadi benda | pensil merah | Banyak proyek saya berawal dari satu keluhan. | ada (bab demo) |
| 2 | Naskah | 100vh | 88 catatan jadi rencana | pita pembatas | Keluhan itu saya ubah jadi daftar yang bisa dicentang. | draf, perlu bukti |
| 3 | Storyboard | 140vh | 86 gambar kerja jadi barang | benang di dinding | Bentuknya menyesuaikan siapa yang memakai. | ada (bab aransemen) |
| 4 | Set dan lighting | 120vh | 53 camera path (crane) | kabel merah | Bagian yang tidak kelihatan juga saya rapikan. | ada (bab infrastruktur) |
| 5 | Syuting | 120vh | 55 objek persisten, 33 FLIP ke monitor | lampu tally | Saya bangun, lalu saya coba di alat yang benar-benar dipakai. | draf, perlu bukti |
| 6 | Editing | 120vh | 18 timeline panggung sticky | playhead | Anda selalu tahu sudah sampai mana. | ada (bab transparansi) |
| 7 | Grading | 100vh | 01 sibak, 57 butir dan distorsi | cincin grading | Yang sudah jalan, saya haluskan sampai enak dipakai. | draf, perlu bukti |
| 8 | Test screening | 120vh | 36 portal zoom-through | lampu merah | Ada sinyal atau tidak, tetap jalan. | ada (bab keandalan) |
| 9 | Segel dan duplikasi | 120vh | 56 instanced field | segel lilin | Yang bisa membaca cuma orang yang memang berhak. Klien bertambah, sistemnya tidak perlu dibuat ulang. | ada (bab keamanan, skala) |
| 10 | Rilis | 180vh | 40 traveling hero object, 36 portal | tirai rak | Sampai akhirnya dipakai orang setiap hari. Sepuluh di antaranya ada di rak ini. | ada (bab rak) |

Anti-resep yang dihindari: A5 (diorama, fly-through, dan rack focus sekaligus). DOF hanya dipakai
di beat makro (1, 9), bukan saat kamera terbang.

## Kamera dan sambungan

| # | Kamera | Sambungan ke beat berikut |
|---|---|---|
| 1 | Push in pelan ke meja sutradara, setinggi mata | Kertas coretan ditarik ke mesin ketik |
| 2 | Top shot tepat di atas mesin ketik | Halaman beterbangan ke dinding |
| 3 | Tracking menyusuri dinding storyboard | Panel terakhir terbuka jadi set nyata |
| 4 | Crane down ke set, lampu nyala satu-satu | Kamera turun ke ketinggian set |
| 5 | Handheld, ikut gerak kamera aksi dan HP | Gambar masuk ke monitor lapangan |
| 6 | Push in ke dua monitor timeline | Layar penuh berganti ke monitor grading |
| 7 | Split screen, garis pembatasnya bergeser | Pull back keluar dari ruang grading, ke ruang tonton |
| 8 | Dari kursi paling belakang, lalu masuk ke layar | Sorot proyektor jatuh ke kaleng film |
| 9 | Close-up makro di segel, lalu pull back ke mesin duplikasi | Satu cakram lepas dari tumpukan |
| 10 | Ikuti satu kotak CD di conveyor | Masuk lewat tirai rak, sampai ke seksi rak proyek |
