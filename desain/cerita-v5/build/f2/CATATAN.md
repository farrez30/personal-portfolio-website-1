# F2 lantai kantor: bukti ukur dan lembar kontak (21 Nov 2026)

Diukur dengan `node scripts/ukur-stasiun.mjs <url>/id/v5 390x844 --dpr 2 --cpu 4 --gpu --kontak`
pada build produksi lokal (Chrome headless, ANGLE D3D11, RX 6700 XT; GPU desktop jauh lebih kuat dari
HP, jadi draw call yang jadi patokan, bukan waktu GPU).

| Ukuran | Batas | HP 390x844 DPR 2, CPU 4x | Desktop 1440x900 |
|---|---|---|---|
| Draw call terbanyak (diam dan selama perpindahan) | 100 | 15 | 16 |
| Segitiga per bingkai | 250 ribu | 75 sampai 80 ribu | sama |

Kenapa kecil: semua benda lantai digabung jadi satu mesh per bahan (toon, layar, kertas, label, kaca,
lampu, lantai), layar dan label digambar ke atlas kanvas. Draw call tidak naik dengan jumlah benda.

Lembar kontak per 0,1 detik (`kontak-*.jpg`, HP) diperiksa bingkai demi bingkai. Temuan dan perbaikan:

| Temuan | Perbaikan |
|---|---|
| Blend titik lihat lurus antara meja belakang dan depan (diputar 180°) membuat kamera menatap lantai kosong 0,3 sampai 0,5 s | `poseBlend` menginterpolasi yaw dan pitch; putaran besar memilih sisi arah perjalanan, jadi di tengah kamera memandang sepanjang lorong |
| Ke dan dari meja biaya (tampak atas) kamera menunduk sejak awal | pitch di tengah perpindahan setinggi ujung yang lebih datar |
| Kamera menembus pilar lorong (harga-diam ke tarikan, kelangsungan ke ruang server) | pilar digeser ke x -11,9 dan -2,0; dikunci tes "blend tidak menembus benda" |
| Tablet melayang menutupi lembar lingkup di meja biaya | tablet berdiri di meja tarikan dan tergeletak di sisi kosong meja biaya |
| Bulatan hitam di foto "kanvas saja" | tombol pemutar musik HTML yang ikut terpotret; skrip foto kini membuatnya tembus |

Yang masih terlihat dan menunggu F3 (perpindahan bertipe): satu bingkai pilar memenuhi layar di
kelangsungan ke ruang server (0,4 s), bingkai dinding samping polos saat menoleh 180° (0,2 sampai 0,3 s).
Orang duduk masih kapsul utuh di belakang kursi seperti previs.
