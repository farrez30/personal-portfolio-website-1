# Riset pra-produksi cerita gulir v3

10 Nov 2026. Label: [V] dibuka langsung, [I] dari cuplikan pencarian atau sumber kedua.

## 1. Alur kerja studio (dipakai untuk cerita v3)

| Tahap | Keluaran | Sumber |
|---|---|---|
| Discover dan brief | Pembaca, rasa yang ditinggalkan, style tile | KODE Immersive, Awwwards 2025 [V] |
| Referensi dan moodboard | Papan referensi, jangkar dunia nyata | 24/7 Artists, Codrops 2025 [I]; Lusion Oryzo [V] |
| Konsep dan sinopsis | Satu kalimat ide, busur tiga babak | Inkwell, SavoirFaire 2025 [V] |
| Storyboard | Satu panel per seksi gulir, menggantikan wireframe | Inkwell [V]; 24/7 Artists [I]; The Spark, Codrops 2026 [I] |
| Styleframe | Satu gambar diam per adegan kunci | Crosswire, Unseen Studio [I] |
| Previs atau animatic | Jalur kamera kasar (Blender atau purwarupa gulir) | ATMOS, LEEROY [V]; Blender camera path, Codrops 2026 [I] |
| Purwarupa teknik berisiko | Uji terpisah sebelum build | Resn [V]; Bornfight 2019 [V] |
| Produksi | Aset 3D, mesin gulir | semua |
| Look-dev dan polish | Shader, cahaya, lapisan butir, tone mapping, post-processing; banyak membuang | KODE [V]; Immersive Garden 2025 [V] |
| Suara | Suara ikut gulir | The Spark [I]; Press Play On Tape [V] |
| QA dan kirim | Uji perangkat, efek dikurangi di HP | Cargo the Film [V]; KODE [V] |

Akademis: Segel & Heer 2010 (narasi diarahkan penulis vs dijelajah pembaca) [V];
Hullman dkk. 2013 (urutan dengan struktur paralel lebih diingat) [V]; Oesch dkk. 2022
(lima teknik scrollytelling) [I].

## 2. Referensi proses dan media

- Sony "Be Moved", Assembly: produk dibongkar per komponen saat digulir (FWA, Cannes) [V].
- Press Play On Tape, Vendredi Society: metafora kaset dan VHS, Lenis [V].
- Chasing the Moment, Codrops 2026: "webfilm" three.js dengan transisi GLSL [I].
- Ten Years Away, Studio375: komik gulir di satu kanvas WebGL [I].
- cratedigger (risq, MIT): rak piringan hitam 3D [V].
- Urutan pabrik sungguhan: United Record Pressing (lacquer, electroplating, press, test
  pressing, cetak, kemas, kirim) [V]; replikasi CD (glass master, stamper, injection, lapisan
  aluminium, cetak) [I].
- Pinterest (dibuka 10 Nov di akun Farrez): "Comoll, storyboard vs actual film", "Vinyl
  pressing manufacture process" (Disc Wizards), "Music Production Workflow", "Alethia 3D scroll".
- Threads: alur "character sheet, object board, storyboard, lalu Flow"; @amirmushich
  "scrolly-telling websites" dengan Seedance/LTX.

## 3. Skill agen untuk alur ini

| Skill | Isi | Lisensi |
|---|---|---|
| `agiwhitelist/auteur` | Mengarahkan situs seperti film: recon, moodboard, commit-sheet arah seni, aset, build satu konteks WebGL + GSAP/Lenis, gerbang QA gerak | MIT, ±1k [V] |
| `juliobsz/skills` /awwwards | Brief, tiga konsep bernilai dengan satu signature moment, arah seni ke DESIGN.md, QA rubrik sampai 8/10 | MIT, ±1,2k [V] |
| `oso95/scroll-world` | Diorama per adegan, klip penghubung dari bingkai tetangga, mesin scrub (Higgsfield berbayar) | MIT, ±10,9k [V] |
| `whystrohm/shotkit` | Storyboard ke shots.json, prompt gambar dan video, kritik aset | Apache-2.0 [V] |
| `CloudAI-X/threejs-skills` | Postprocessing, performa, shader, pipeline aset three.js | MIT, ±4,1k [V] |

Belum diaudit isinya; tiap skill melewati prosedur adopsi komponen sebelum dipakai.

## 4. Polish three.js

- `pmndrs/postprocessing` (Zlib): bloom, DOF, vignette, chromatic aberration, noise, LUT, tone
  mapping, SSAO dalam satu EffectPass [V]. Addon three.js: FilmPass, BokehPass, LUTPass, OutputPass [V].
- Tone mapping: AgX lebih datar dan enak di-grade, PBR Neutral setia warna produk [V].
- HP: DPR maks 2, post-processing setengah resolusi, ±100 draw call, cahaya dan AO di-bake [V].
- Bayangan lembut: AccumulativeShadows atau ContactShadows sekali render untuk benda diam [V].
- Tekstur dan HDRI: Poly Haven dan ambientCG, CC0 [V].
