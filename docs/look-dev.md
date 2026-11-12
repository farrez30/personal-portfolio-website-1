# Lembar look-dev: dunia toko kaset

Skill `farrez:look-dev` (coderoach-app PR #257). Adegan: dunia 3D di belakang beranda (ADR 0014,
`components/dunia/`). Lembar ini menentukan tampilan setiap aset yang masuk dunia itu, termasuk
ular 3D di akhir loader. Isinya target; DESIGN.md tetap mencatat yang sudah dikirim.

Status: disetujui dan diterapkan Farrez 12 Nov 2026 ("Ya, terapkan"). Hasil ukur di bagian "Cek per aset".

## Konteks

| Butir | Isi |
|---|---|
| Cerita dan tema | Toko kaset dan CD setelah tutup. Satu perjalanan: bilik dengar (hero), dinding catatan sampul (cerita), rak CD (project), kasir dan stiker label (klien), pintu dan lonceng (kontak). |
| Emosi | Hangat, akrab, sedikit nostalgia, tenang. Bukan horor, bukan neon. |
| Pembaca | Calon klien dan perekrut. Mereka harus percaya karyanya rapi dan nyata, sesuai DESIGN.md: "benda nyata yang difoto, bukan mainan 3D". |
| Tetangga | Jewel case dan seni album (warna asli harus terbaca), panel styleframe cerita (AgX untuk objek 3D, grain dan vignette CSS, ADR 0013), props CC0 Poly Haven yang realistis, headphone Hunyuan3D. |
| Perangkat terendah | HP Android kelas menengah, `pixelRatio` maks 1,25 (sudah di kode). |
| Kapan tampil | Dimuat di balik loader ular; lalu kamera berpindah antartempat saat digulir. |
| Sumber bentuk | Primitif kode (ruangan, rak, meja, pintu), Poly Haven CC0 (kursi, lampu gantung, pemutar kaset), Hunyuan3D-2 (headphone, rencana kepala ular), tekstur Flow (kayu, busa). |

## Gaya

- Gaya utama: **realistis sinematik malam** (dipilih Farrez lewat pertanyaan terstruktur, 12 Nov
  2026).
- Alasan dari konteks: DESIGN.md meminta benda yang terasa difoto; props Poly Haven sudah PBR
  realistis; cerita "toko setelah tutup" butuh suasana cahaya, bukan katalog.
- Ditolak: realistis foto produk (warna paling setia, tapi suasana malam hilang), stylized PBR
  (bertentangan dengan DESIGN.md dan menuntut bahan ulang semua props), toon (bertentangan dengan
  DESIGN.md dan aset campuran).
- Campuran yang disengaja: seni album dan stiker tetap berwarna asli. Keduanya diterangi lampu yang
  sama, tetapi grade tidak boleh menggeser hue-nya (cek "warna asli" di bawah).
- Referensi: enam styleframe Flow di `desain/look-dev/target-*.webp` (prompt di
  `prompt-styleframe.txt`). Yang dipinjam: kolam cahaya di bawah tiap lampu gantung, pemisahan
  hangat (dalam toko) dan biru (jalan di balik pintu kaca), kabut tipis yang membuat berkas cahaya
  terlihat, lantai beton yang memantulkan lampu samar, sudut gelap yang tetap menyimpan detail.
- Pilar:
  1. Setiap tempat punya satu lampu gantung sebagai sumber utama yang terlihat; benda utama berdiri
     di kolam cahayanya.
  2. Hangat di dalam, biru dari luar. Tidak ada warna cahaya ketiga.
  3. Bayangan cokelat hangat yang masih berdetail, tidak pernah hitam murni.
  4. Bahan terlihat dipakai: kayu berminyak, beton tergores, kuningan kusam. Tidak ada permukaan
     yang rata sempurna.
  5. Udara sedikit berkabut: cahaya punya volume.

## Palet dan nilai

| Peran | Hex | Catatan |
|---|---|---|
| Bayangan / latar / kabut | `#1a1410` | Ganti kabut `#0f0d0b` dan latar yang sekarang hampir hitam |
| Dinding gelap | `#2b2520` | Tetap (SUASANA.gelap) |
| Lampu hangat | `#ffb46a` | Tetap; bola lampu emissive lebih terang dari 1 supaya terasa menyala |
| Jalan biru | `#6f8fd6` | Tetap; hanya dari arah pintu |
| Kayu | `#8a5a34` sampai `#b8835a` | Lewat tekstur `kayu.webp`, variasi roughness |
| Kuningan | `#c9a25a` | Tetap, roughness naik ke 0,45 (kusam) |
| Aksen situs | `#e0574b` | Hanya untuk benda UI di dunia (mis. jarum), bukan cahaya |

- Rentang nilai: terang rata-rata layar (abu 0 sampai 255) **35 sampai 50** di setiap tempat.
  Styleframe terukur 31 sampai 52. Ukur kanvas dunia saja, tanpa teks halaman:
  `node scripts/ukur-dunia.mjs <url> 1440x900 --gpu --tanpa-teks --keluar <folder>`, lalu per
  tangkapan `*-dunia.png`: `ffmpeg -i x.png -vf "format=gray,scale=1:1" -f rawvideo - | od -An -tu1`.
- Titik terang hanya di bola lampu dan berkas cahaya; benda utama di kolam cahaya minimal 2x lebih
  terang dari dinding di belakangnya.
- Saturasi: seni album dan stiker penuh; sisanya di bawah saturasi kayu.

## Bentuk dan detail

- Shape language: kotak dan papan toko sungguhan, tepi sedikit dibulatkan (bevel 2 sampai 4 mm),
  tidak ada sudut 90 derajat yang tajam sempurna di benda dekat kamera.
- Segitiga: aset utama (headphone, kepala ular) maks 15 ribu; props latar maks 5 ribu.
- Texel density: 256 px per meter untuk permukaan ruangan (dinding, lantai, meja), 512 px per
  meter untuk benda yang didekati kamera.
- Tekstur maks: 1024 di desktop, 512 di HP (aturan yang sudah dipakai untuk props Poly Haven).

## Tekstur dan bahan

| Peta | Dipakai | Color space | Sumber |
|---|---|---|---|
| Albedo kayu, busa | Ya | sRGB | `kayu.webp`, `busa.webp` (Flow, ada) |
| Albedo dan roughness lantai beton | Ya | sRGB / linear | `beton.webp`, `beton-kasar.webp` dari `scripts/beton.py` (bukan unduhan, bukan dibuat di peramban) |
| Normal busa piramida | Ya, baru | linear (NoColorSpace) | Diturunkan dari tinggi piramida secara prosedural |
| Normal sisik ular | Ya, baru | linear | Prosedural (sel Voronoi) atau Flow tampak atas lalu diturunkan |
| AO | Hanya di props Poly Haven | linear | Bawaan glTF |
| Emissive bola lampu, mata ular | Ya | sRGB | Warna, tanpa tekstur |

- Material: `MeshStandardMaterial` semua. Tanpa `MeshPhysicalMaterial`.
- Dimatikan: `transmission` (sudah, kaca lampu), `clearcoat`, `sheen`, peta lingkungan/PMREM.
  Kilap kaca dan kuningan datang dari lampu titik, bukan IBL.
- Format kirim: WebP untuk tekstur 512 (sudah); KTX2 baru dipertimbangkan bila tekstur melewati
  1 MB total.

## Cahaya dan environment

- Rig per tempat: satu lampu gantung (PointLight hangat) yang jangkauannya mencapai benda utama dan
  lantai di bawahnya, plus kerucut berkas cahaya transparan dan kolam di lantai (pola yang sudah ada
  di cerita v3, ADR 0013). Hemisphere hangat rendah sebagai isi bayangan.
- Jangkauan lampu: sekarang `distance 7, decay 2`, kasir hampir tidak tersentuh. Atur ulang sampai
  rentang nilai di atas tercapai, ukur per tempat.
- Cahaya jalan: SpotLight biru dari pintu (ada), ditambah kotak kaca pintu yang sedikit bercahaya
  biru supaya sumbernya terlihat.
- Bayangan: tetap tanpa shadow map real-time (mahal di HP); kolam cahaya dan bayangan kontak
  (`bayang`, sudah ada) yang membawa kedalaman.
- HDRI / RoomEnvironment: **tidak**. PMREM terukur 462 ms beku di balik loader.

## Warna akhir dan post

- `outputColorSpace`: SRGBColorSpace (ada).
- Tone mapping: **AgX** (ganti ACES). ACES menggeser hue warna jenuh di intensitas tinggi (oranye
  ke kuning, biru ke cyan), sementara stiker dan seni album harus tetap warna aslinya. AgX juga
  sudah dipakai objek 3D cerita (ADR 0013), jadi dunia dan cerita satu kurva. Exposure awal 1,2,
  disetel dengan ukuran nilai.
- Grade: hangat ringan di bayangan (lift ke `#1a1410`), tanpa LUT berkas.
- Urutan: render adegan ke target HalfFloat (ada), lalu satu lintasan layar: motion blur (ada),
  tone mapping, angkat bayangan, vignette, grain (`SUASANA.*.layar`). Dunia tidak pernah punya
  grain CSS, jadi tidak ada lapisan DOM yang dipindah; grain berganti hanya saat adegan digambar
  ulang, jadi diam saat dunia diam.
- Efek: halo bola lampu sebagai sprite additive, bukan bloom post (tanpa pass tambahan). Vignette
  lembut. Grain halus. Tanpa chromatic aberration, tanpa DOF real-time.
- Di HP: halo dan grain tetap (murah), motion blur sudah turun ke 0 sampel MSAA.
- Reduced motion: tanpa grain bergerak, tanpa motion blur.

## Blok gaya untuk generator

Ditempel di setiap prompt Flow (gambar referensi Hunyuan, tekstur, video):

```
Photorealistic cinematic film still of a small independent record and cassette shop after
closing time at night. Warm tungsten pendant lamps around 2700K make soft pools of amber light;
cool blue streetlight spills in from the glass door. Soft highlight roll-off, gentle warm grade,
deep warm brown shadows that keep detail, fine 35mm film grain, subtle vignette, a little haze.
Real worn materials: oiled wood, dark pyramid acoustic foam, brushed brass, scuffed concrete.
No people, no text, no letters, no logos, no brand names.
```

Untuk gambar referensi Hunyuan (bentuk saja): objek tunggal, latar abu muda polos, cahaya rata,
tanpa blok suasana di atas, karena bayangan dan warna lampu ikut terpanggang ke bentuk.

## Ular 3D (akhir loader)

- Bentuk: tubuh dari kode (kurva dan tabung bersegmen), kepala dari kode atau Hunyuan bila lolos
  audit lisensi (ADR 0015 memicu revisit bila ular juga memakai Hunyuan).
- Bahan: sisik dengan normal map tile, albedo hijau tua `#2f4a34` ke perut krem `#b9a77f`,
  roughness 0,35 sampai 0,5 (kilap basah, bukan plastik), mata emissive kuning `#ffd84a`.
- Cahaya: lampu hangat dari atas dan rim biru dari arah pintu, sama seperti tempat lain; ular
  menerjang dari gelap masuk ke kolam cahaya.
- Peralihan dari titik digital ke 3D (storyboard `desain/transisi/ular-v2.html` arah 1) memakai
  palet yang sama: titik digital berwarna `#ffb46a`, bukan hijau neon.

## Anggaran performa

| Ukuran | Batas | Terukur |
|---|---|---|
| Total GLB + tekstur dunia (MB) | 1,6 | 1,2 (PROVENANCE dunia) |
| Beku terpanjang saat muat (ms) | 100 di balik loader | belum diukur ulang sejak PR #60 |
| Draw call per bingkai | 150 | belum diukur |
| FPS di HP terendah | 50 | belum diukur |

## Cek per aset

Diukur 12 Nov 2026 dengan `ukur-dunia.mjs --gpu --tanpa-teks` di `next dev` (RX 6700 XT), mode
gelap. Tangkapan sebelum: `desain/look-dev/sekarang-*.webp`.

| Tempat / aset | Nilai sebelum | Nilai sesudah | Siluet | Berdampingan | Catatan |
|---|---|---|---|---|---|
| Bilik dengar (1440x900) | 14 | 39 | lolos | lolos | Busa, rak, headphone di kolam lampu; teks hero tetap terbaca |
| Dinding catatan | - | 49 | lolos | lolos | |
| Rak CD | - | 40 | lolos | lolos | Berkas cahaya terlihat di antara rak |
| Kasir dan stiker | 6 | 15 | lolos | lolos | Meja dan stiker terang; rata-rata tertahan dinding kosong (lihat di bawah) |
| Pintu | - | 13 | lolos | - | Lampu kecil di atas pintu, cahaya jalan biru di lantai |
| Bilik / rak / kasir di HP 390x844 | - | 30 / 34 / 17 | lolos | lolos | |
| Mode terang (bilik / rak / kasir) | - | 146 / 175 / 213 | lolos | lolos | Berkas dan butir diredam (`berkas 0,25`) |
| Headphone Hunyuan | - | - | lolos | lolos | Bahan matte gelap, sesuai lembar |
| Ular 3D | - | - | - | - | Belum dibuat |

Belum mencapai target 35: **kasir dan pintu**. Benda utamanya sudah di kolam cahaya, tetapi
setengah bingkai adalah dinding polos gelap, sedangkan di styleframe dinding itu penuh rak kaset,
peti piringan, dan poster. Menaikkan paparan lagi membuat bilik dan dinding lewat dari 50. Yang
kurang adalah benda, bukan setelan: rak kaset dekat pintu dan peti di bawah meja (aset-visual-web
§7, keputusan sumber bentuk per benda).

Performa (dua putaran per versi, sama mesin): pembuatan dunia 36 sampai 40 ms (sebelum 44 ms);
tugas panjang saat muat setara; perpindahan kamera tanpa tugas panjang baru. Tugas panjang 210
sampai 400 ms saat pindah ke rak sudah ada di versi sebelumnya juga (rak 3D menyiapkan dirinya),
bukan dari lembar ini. Di build produksi (`next build`, dua putaran bergantian per versi) jarak
"modul" ke "dibuat" 171 sampai 435 ms sebelum dan 329 sampai 377 ms sesudah, dengan satu tugas
panjang 378 sampai 473 ms di kedua versi: sebarannya lebih besar dari selisihnya, dan tugas itu
sudah ada sebelum lembar ini. Draw call dan FPS di HP fisik belum diukur.

## Riwayat keputusan

- 2026-11-12: gaya realistis sinematik malam dipilih Farrez; styleframe Flow 6 gambar (0 kredit,
  sisa 376) dipakai sebagai target.
- 2026-11-12: lembar diterapkan. AgX menggantikan ACES; kabut dan latar `#1a1410`; lampu tanpa
  batas jangkauan, lampu kasir dipindah ke atas meja; bola lampu, halo, kerucut berkas, dan
  kolam cahaya; lampu kecil di atas pintu dan cahaya jalan di lantai; lantai beton dari
  `scripts/beton.py`; angkat bayangan, vignette, dan butir di lintasan layar; paparan 1,3.
  Tekstur beton sempat dibuat di peramban dan terukur sekitar 150 ms sinkron per peta, jadi
  dipindah ke berkas.
