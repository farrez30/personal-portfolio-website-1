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
| 1 | Ide | 120vh | 89 coretan jadi benda | pensil merah | Berawal dari keluhan sehari-hari. | ada (bab demo) |
| 2 | Naskah | 100vh | 88 catatan jadi rencana | pita pembatas | Semua dimulai dari rencana yang Anda setujui. | draf, perlu bukti |
| 3 | Storyboard | 140vh | 86 gambar kerja jadi barang | benang di dinding | Bentuknya dipilih sesuai masalahnya. | ada (bab aransemen) |
| 4 | Set dan lighting | 120vh | 53 camera path (crane) | kabel merah | Rapi sampai ke bagian yang tidak kelihatan. | ada (bab infrastruktur) |
| 5 | Syuting | 120vh | 55 objek persisten, 33 FLIP ke monitor | lampu tally | Dibangun bertahap, bisa dicoba sejak awal. | draf, perlu bukti |
| 6 | Editing | 120vh | 18 timeline panggung sticky | playhead | Progresnya jelas, kabarnya tidak putus. | ada (bab transparansi) |
| 7 | Grading | 100vh | 01 sibak, 57 butir dan distorsi | cincin grading | Enak dipakai, bukan cuma bisa dipakai. | draf, perlu bukti |
| 8 | Test screening | 120vh | 36 portal zoom-through | lampu merah | Tetap bisa diandalkan saat paling dibutuhkan. | ada (bab keandalan) |
| 9 | Segel dan duplikasi | 120vh | 56 instanced field | segel lilin | Data penting tetap di tangan yang berhak. Usaha tumbuh, sistemnya sanggup mengikuti. | ada (bab keamanan, skala) |
| 10 | Rilis | 180vh | 40 traveling hero object, 36 portal | tirai rak | Dan akhirnya, dipakai tiap hari. Sepuluh di antaranya ada di rak ini. Ambil satu, lihat ceritanya. | ada (bab rak) |

Anti-resep yang dihindari: A5 (diorama, fly-through, dan rack focus sekaligus). DOF hanya dipakai
di beat makro (1, 9), bukan saat kamera terbang.

## Kamera dan sambungan

| # | Kamera | Sambungan ke beat berikut |
|---|---|---|
| 1 | MS meja sutradara, eye level, dolly mendekat pelan | Kertas coretan ditarik ke mesin ketik |
| 2 | Bird eye view ke mesin ketik, static | Halaman beterbangan ke dinding |
| 3 | LS dinding storyboard, eye level, tracking ke kanan | Panel terakhir terbuka jadi set nyata |
| 4 | Crane shot turun ke set, high angle. Lampu menyala satu per satu | Kamera turun ke ketinggian set |
| 5 | MS laptop di set, handheld, follow kamera aksi dan HP | Gambar masuk ke monitor lapangan |
| 6 | MCU dua monitor timeline, eye level, dolly mendekat | Layar penuh berganti ke monitor grading |
| 7 | CU monitor grading, static. Garis pembatas sebelum dan sesudah bergeser | Mundur keluar dari ruang grading ke ruang tonton |
| 8 | LS ruang tonton dari baris belakang, dolly mendekat ke layar | Sorot proyektor jatuh ke kaleng film |
| 9 | ECU segel lilin, lalu zoom out ke mesin duplikasi | Satu cakram lepas dari tumpukan |
| 10 | MS kotak CD di conveyor, low angle, tracking mengikuti kotak | Kamera masuk lewat tirai rak ke seksi rak proyek |
