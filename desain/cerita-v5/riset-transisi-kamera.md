# Perpindahan antarmeja: kenapa terasa sama, dan pilihannya

20 Nov 2026. Masukan Farrez setelah melihat animatic: kamera "cuma pindah-pindah meja ke sebelah
kanan, kurang kreatif".

Label: **D** sumber dibaca, **P** praktisi dibaca, **I** inferensi atau hanya cuplikan.

## 1. Diagnosis terukur

Posisi dan arah kamera di tengah tiap babak meja (`window.__dbgKam()` di previs.html):

| Babak | x | tinggi dari lantai | yaw | pitch |
|---|---|---|---|---|
| dorongan | 91,4 | 1,4 m | -10° | -17° |
| harga-diam | 94,8 | 1,1 m | -30° | -10° |
| tarikan | 98,3 | 1,0 m | -44° | -11° |
| biaya | 101,2 | 1,6 m | 0° | -71° |
| kelangsungan | 105,7 | 1,4 m | -40° | -19° |
| data | 112,7 | 2,3 m | -21° | -11° |
| kebiasaan | 117,8 | 2,0 m | -11° | -18° |

Keenam perpindahan searah (x selalu naik 3 sampai 7 m). Enam dari tujuh bingkai ada di pita tinggi
dan arah hadap yang sama. Akar masalahnya tata letak: meja berjajar satu baris di satu dinding, jadi
jalan terpendek antarmeja pasti geser ke kanan (truck right) (D, dari ukuran di atas).

## 2. Yang diketahui

| Temuan | Sumber | Label |
|---|---|---|
| Gerak kamera tidak harus rumit, cukup termotivasi oleh aksi di layar | [No Film School 2018](https://nofilmschool.com/2018/06/key-good-camera-movement-motivation), [PremiumBeat 2019](https://www.premiumbeat.com/blog/cinematography-tip-motivated-camera-movement/) | P |
| Katalog gerak dan fungsinya (whip pan, boom, arc, push-in, bird's eye); gerak acak yang berlebihan kehilangan efek | [StudioBinder 2025](https://www.studiobinder.com/blog/different-types-of-camera-movements-in-film) | P |
| 1917 menyembunyikan sambungan di benda yang lewat depan kamera dan saat gelap; rig berganti sehingga tinggi dan jenis gerak terus berubah dalam satu take | [No Film School](https://nofilmschool.com/1917-camera-edits-oner) | P |
| Children of Men: di ruang sesempit mobil, satu take tetap berganti ukuran shot dan arah, dipicu kejadian | [No Film School 2024](https://nofilmschool.com/children-of-men-long-take) | P |
| The Bear: kamera mengikuti jalur gerak orang di dapur | [No Film School 2022](https://nofilmschool.com/the-bear-oner) | P |
| Cut tersembunyi yang alasannya hanya teknis (Rope) justru terasa sebagai trik | [Mather, KINEMA 2009](https://openjournals.uwaterloo.ca/index.php/kinema/article/download/1207/1504) | D |
| Shader.se menyambung adegan dengan mendorong kamera sampai layar 3D memenuhi pandangan, isi layarnya sudah adegan berikut | [ringkasan Sensei Notes #10](https://buttondown.com/wawasensei/archive/sensei-notes-10-threejs-conf-paris-scroll-driven/) | I, artikel Codrops 403 |
| basement.studio membuat kantornya 3D dan berpindah dengan klik di dunianya; menu terasa terlalu lambat | [basement.studio 2025](https://basement.studio/post/new-digital-hq-pt-1) | D |
| Transisi Igloo Inc memakai efek layar (frost, displacement), jenis yang sudah ditolak Farrez | [Awwwards](https://awwwards.com/igloo-inc-case-study.html) | D |
| Perubahan kamera terus memicu perhatian walau diulang; efek produksi yang identik turun daya tariknya setelah ulangan ketiga | [Potter dkk. 2018](https://journalofcognition.org/articles/43); Communication Monographs 2015 | D; I |
| Kontras menaikkan intensitas visual, kesamaan menurunkannya (Block, The Visual Story) | [ringkasan MediaSmarts](https://mediasmarts.ca/digital-media-literacy/general-information/visual-media/guiding-eye-visual-media) | I |

Menu Batman Arkham tidak ditemukan dibahas di sumber tertulis; perlu diukur dari rekaman videonya.

## 3. Enam pola yang cocok untuk lantai kantor

| Pola | Gerak | Pemicu di dunia | Durasi |
|---|---|---|---|
| Ikut benda | kamera rendah mengikuti nota atau map yang dibawa ke meja berikut | nota, map, troli | 1,2 sampai 1,8 s |
| Whip pan | diam sejenak, lalu menoleh cepat 90 sampai 160° ke meja di seberang | HP berdering, printer | 0,4 sampai 0,6 s |
| Masuk layar | dorong sampai layar HP memenuhi pandangan, keluar dari monitor meja lain | notifikasi di layar | 1,0 sampai 1,4 s |
| Orbit | memutari benda utama, meja berikut muncul di belakangnya | timbangan | 0,9 sampai 1,3 s |
| Lewat di balik benda | benda dekat lensa menutup bingkai, kamera muncul di tempat lain | pilar, lemari, rekan yang lewat | 0,5 sampai 0,8 s |
| Crane ke denah | naik sampai tampak atas, bergeser, turun di meja lain | lampu gantung, kertas terbang | 1,4 sampai 2,0 s |

Aturan variasi: dua perpindahan berturut-turut tidak boleh sama sumbu, arah, dan durasinya; beda
sudut antartitik minimal sekitar 30° atau ukuran shot berubah jelas.

Syaratnya: meja tidak lagi satu baris. Lantai ditata ulang (dua sisi lorong, pulau meja, pilar,
ruang rapat kaca), supaya tata letaknya sendiri memberi sudut, ketinggian, dan benda penutup (I).
