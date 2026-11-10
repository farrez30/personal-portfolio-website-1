# Bank prompt foto Farrez

Prompt untuk membuat foto profil dan foto portofolio Farrez dari foto aslinya dengan Nano Banana (Google Flow atau Gemini). Disusun 10 Nov 2026.

Label bukti di dokumen ini:

- **V**: dibaca langsung dari sumber resmi atau dari layar Flow Farrez.
- **I**: dari praktisi atau komunitas, belum diuji di akun ini.
- **U**: dugaan atau inferensi, belum ada yang menguji.

## Foto sumber

| Berkas | Ukuran | Pakai untuk |
| --- | --- | --- |
| `G:\My Drive\01 Coderoach dan Karier\Karier 2026-2027\Foto\Farrez-asli-tanpa-edit.png` | 1080x1390 | Sumber utama. Wajah depan, cahaya rata, tajam. |
| `public/assets/webp/me.webp` | 260x371 | Jangan dipakai. Terlalu kecil untuk menjaga detail wajah. |

Saran memilih foto sumber (I, praktisi; HeadshotPro V untuk layanannya sendiri): wajah menghadap depan atau tiga perempat tipis, cahaya rata, tajam, tanpa filter, kepala tidak terpotong, kacamata sama dengan yang biasa dipakai. Google tidak memberi resolusi minimum (V, tidak ditemukan di docs resmi). Nano Banana 2.1 menerima sampai 4 gambar karakter, Pro sampai 5 (V, docs AI Studio).

## Prinsip menulis prompt

1. **Tulis seperti brief ke fotografer, bukan deretan kata kunci.** Google: "Describe the scene, don't just list keywords." (V, blog Google Developers 28 Agu 2025; templat serupa di docs AI Studio.)
2. **Kunci identitas di kalimat pertama, lalu sebut detailnya.** Wajah, senyum, kacamata, rambut, warna kulit, kumis. Docs AI Studio menyarankan detail yang harus tetap dideskripsikan rinci bersama permintaan edit (V). Kunci yang samar membuat wajah melenceng (I).
3. **Pakai istilah kamera dan cahaya bernama.** 85mm, f/8, Rembrandt, split, rim light, chiaroscuro. Google sendiri mencontohkan "85mm portrait lens" dan "Chiaroscuro lighting with harsh, high contrast" (V, blog Google Cloud 6 Mar 2026).
4. **Sebut yang harus ada, bukan yang dilarang.** "Clean digital capture" lebih baik dari "no grain" (V, docs AI Studio, contoh "empty street" bukan "no cars").
5. **Satu perubahan per putaran.** Edit kecil bertahap. Kalau wajah mulai bergeser setelah beberapa putaran, mulai percakapan baru dari foto asli (V, blog Google Developers).
6. **Jaga tekstur kulit.** Model cenderung menghaluskan sampai plastik. Tulis "natural skin texture with visible pores, no smoothing" (I, tiga praktisi sepakat).
7. **Minta edit, jangan buat ulang.** Perubahan sempit (rambut dirapikan, baju diganti, cahaya diperbaiki) paling sering tetap mirip. Foto sumber yang cahayanya buruk membuat model "menggambar ulang" wajah (I, The Rundown AI Jul 2026; komentar teratas r/GeminiAI Mar 2026).
8. **Senyum mulut tertutup dan "the expression should not change".** Senyum bergigi paling sering terlihat janggal (I, uji Gemini Supercarblondie Mar 2026; laozhang Jun 2026).
9. **Hindari kata yang menyuruh mengubah wajah.** "Professional" saja pernah membuat kulit lebih cerah dan mata biru di Playground AI (V, Boston Globe 21 Jul 2023, model lain). "Sharp features", "flawless fair skin", "luxurious" adalah instruksi mempercantik (I, inferensi; belum ada uji terkontrol di Gemini).

Bukti dari akun ini (V, proyek Flow "Nov 05 - 00:56"): dari 4 gambar kemeja kotak di baris ketiga, 2 berubah jadi orang lain. Dua yang gagal memakai prompt yang menyuruh mengganti latar dan cahaya sekaligus dari foto bercahaya merah. Pelajarannya: perubahan cahaya yang besar paling mudah menggeser wajah, jadi selalu cek ulang wajah sebelum memilih.

## Bank A: CV, LinkedIn, Glints, Kalibrr

Tujuannya foto yang jujur: wajah sama persis, hanya baju, latar, dan cahaya yang dirapikan. Rasio 1:1, wajah di sepertiga atas.

### A1. Ganti kemeja dan latar kantor (sudah terbukti)

Prompt ini menghasilkan set E, F, G tanggal 5 Nov. `G-navy-1` jadi foto profil utama. Model: Nano Banana 2.1, sumber: hasil edit kemeja kotak.

```text
Edit this photo of the same man. His face, smile, glasses, hair, skin tone and crossed-arms pose must stay exactly the same person. Change only his clothes to a crisp, well-fitted plain navy blue button-up shirt in premium non-iron cotton, smooth with almost no wrinkles. Replace the background with a bright modern office that is heavily out of focus, creamy bokeh, nothing recognizable. Soft window light from the left, gentle shadows. Shot on an 85mm portrait lens at f/1.8, shallow depth of field, natural skin texture with visible pores, no smoothing, no retouching, true-to-life colors, subtle film grain, like a real corporate headshot by a photographer. Head and chest framing, square 1:1, no text.
```

Variasi yang sudah dicoba: `plain black` (E), `plain white` (F), `plain light blue` (D).

### A2. Latar diganti, baju tetap (sudah terbukti)

Hasilnya set A dan C. Cocok kalau ingin tetap memakai baju asli.

```text
Edit this exact photo. Keep the same man: his face, smile, glasses, hairstyle, skin tone, crossed-arms pose and red plaid shirt must stay identical. Only replace the dark red background and the red rim lighting with a clean, bright, softly blurred modern office background and soft natural daylight. Neutral colors, realistic professional LinkedIn headshot, head and chest framing, square 1:1, no text.
```

### A3. Studio abu-abu hangat (sudah terbukti)

Hasilnya set B. Untuk platform yang lebih suka latar polos.

```text
Create a new professional headshot of the man in the first reference photo. His face must stay recognizably the same person: same face shape, eyes, nose, mustache and skin tone. Use the second photo only for mood and styling: modern, calm, dark minimal outfit, thin glasses. Facing the camera with a slight natural smile, no cap, neat short hair, wearing a dark crew-neck knit or dark shirt. Soft studio light, plain warm grey background, head and shoulders, square 1:1, realistic photo, no text.
```

### A4. Versi rapi untuk putaran berikutnya (belum diuji)

Gabungan A1 dengan saran riset: kunci identitas lebih rinci, cahaya bernama, dan senyum serta mata dirinci supaya gigi dan mata tidak rusak (I, laozhang 22 Jun 2026; WenceStudio 23 Jun 2026).

```text
Use the uploaded photo as the only identity reference. Keep the same man exactly: same face shape, eye shape, nose, jawline, hairline, thin mustache, skin tone, apparent age, and the same thin-framed glasses. Natural closed-mouth smile, clear relaxed eyes looking into the lens.
Change only his clothes to a well-fitted plain navy button-up shirt, collar neat, no logos. Background: a plain light warm grey studio wall, evenly lit, no objects, no text.
Lighting: soft loop lighting from a large softbox at 45 degrees camera left, gentle fill from the right at about 2:1, soft catchlights in both eyes.
Shot on an 85mm lens at f/5.6, eye-level camera, head and upper chest, square 1:1. Natural skin texture with visible pores, slight natural asymmetry, true-to-life colors. Professional, understated, realistic.
```

### A5. Prompt Threads bahasa Indonesia (viral, belum diuji di akun ini)

Dari balasan tersemat [alldoenrico, 21 Jun 2026](https://www.threads.com/@alldoenrico/post/DZ0GWJFE7X5) (727 ribu tayangan, tersimpan di @trycatch200ok). Penulis aslinya tidak diketahui; alldoenrico sendiri menyebut lupa sumbernya.

```text
Ubah fotoku menjadi foto profesional resolusi tinggi untuk keperluan resume. Tingkatkan pencahayaan, ketajaman, dan kualitas keseluruhan. Sesuaikan postur agar terlihat percaya diri dan natural, ekspresi santai dan senyum tipis. Gunakan latar studio yang bersih dan netral (abu-abu atau putih gading). Perbaiki tampilan secara halus (rambut, warna kulit, noda kecil, kantung mata) tanpa terlihat berlebihan. Tambahkan pakaian profesional (blazer dan kemeja).
```

Catatan: prompt ini tidak punya kunci identitas, dan menyuruh mengubah postur serta warna kulit. Dua hal itu yang menurut riset paling sering menggeser wajah (I). Di balasan yang sama ada yang menulis hasilnya "keliatan banget AI-nya". Kalau mau dipakai, tambahkan kalimat pertama A4 ("Use the uploaded photo as the only identity reference...") dan buang "warna kulit".

### A6. "Official portrait" hitam (viral, belum diuji di akun ini)

Dari [feromauli, 26 Sep 2026](https://www.threads.com/@feromauli/post/DdwFVDJlAvj) (1 juta tayangan). Penulis aslinya juga tidak diketahui.

```text
Create an official potrait of me in black suite with sharp features and makeup still in touch, 360 HD frontal hair and it's giving luxurious vibes with high detailed 4k resolution, in a white background.
```

Catatan: kata "sharp features", "makeup", dan "luxurious" meminta model mempercantik wajah, jadi hasilnya cenderung tidak mirip dan melanggar syarat "likeness" LinkedIn (V untuk syaratnya, U untuk efeknya pada prompt ini). Ambil bagian yang berguna saja (jas hitam, latar putih) dan tempelkan ke A4.

### A7. Pas foto lamaran kerja Indonesia (latar merah atau biru)

Banyak lowongan di Indonesia masih meminta pas foto 3x4 atau 4x6. Polanya diambil dari kumpulan prompt media Indonesia: Popbela 17 Sep 2026, Katadata 28 Sep 2026, Merdeka/Liputan6 7 Okt 2025, Momsmoney 21 Okt 2025 (V, semua dibuka). Prompt di bawah ini gabungan, bukan salinan salah satunya, dan belum diuji di akun ini.

```text
Edit this photo into a formal Indonesian ID-style pass photo. Keep the same man exactly: same face shape, eyes, nose, jawline, thin mustache, skin tone, apparent age and thin-framed glasses. Do not change any facial detail. The expression should not change except a relaxed closed-mouth smile.
Dark navy suit, plain white collared shirt, no tie. Chest-up, facing the camera straight on, shoulders level, centered.
Background: plain solid red, evenly lit, no gradient, no shadow on the wall. Soft even studio light from both sides.
Clean, sharp, true-to-life colors, natural skin texture. Portrait 3:4, no text.
```

Variasi: latar `plain solid blue` untuk instansi yang meminta biru. Untuk batik, detikJabar (1 Okt 2025) membuka semua 22 prompt dengan "Gunakan foto ini dengan mempertahankan wajah aslinya" lalu menyebut motifnya, misalnya "kemeja batik lengan panjang motif parang cokelat tua" (V).

## Bank B: Portofolio, editorial "semi rahasia"

Rasa yang dicari: potret sinematik yang sebagian wajahnya tenggelam dalam bayangan, cahaya samping hangat, latar gelap. Efek blur, pixel, dan grain dipasang lewat kode di situs, jadi fotonya harus **bersih**:

- Jangan pakai kata `film`, `analog`, `Kodak`, `Portra`, `grainy`, `35mm film`. Google mencontohkan kata film memicu grain (V, blog Google Cloud). Prompt A1 di atas memang memuat `subtle film grain`, jadi jangan disalin ke bank ini.
- Jangan pakai `f/1.8` atau `shallow depth of field`. Blur nanti dari kode. Pakai latar gelap polos dan `f/8` (U, inferensi).
- Ganti dengan framing positif: `clean digital capture, crisp detail, smooth tonal gradation in the shadows, sharp focus on the eyes` (I, inferensi dari dua aturan resmi).
- Rasio 4:5 untuk potret tegak, 16:9 bila fotonya dipakai sebagai latar seksi lebar.

Foto yang sudah ada dan dekat dengan rasa ini: `Farrez-studio-setengah-badan.png` dan `Farrez-PP-studio-1x1.png` (low-key merah), `Farrez-IG-gemini-asli.png` (profil bertopi menunduk, ada tanda Gemini terlihat di pojok kanan bawah).

### B1. Split light hangat (setengah wajah gelap)

```text
Use the uploaded photo as the only identity reference. Keep the same man exactly: same face shape, eyes, nose, jawline, thin mustache, skin tone, apparent age and thin-framed glasses. Do not beautify or redesign the face.
Editorial portrait, head and shoulders, body turned slightly to his left, face toward the camera, calm neutral expression, lips closed.
Lighting: split lighting from a single warm tungsten key light at 90 degrees camera right, so the right half of his face is lit in warm amber and the left half falls into deep shadow. No fill light. Background: plain matte near-black wall.
Plain black crew-neck t-shirt. Shot on an 85mm lens at f/8, eye-level. Clean digital capture, crisp detail, smooth tonal gradation in the shadows, sharp focus on the eyes, natural skin texture. Portrait 4:5, no text.
```

### B2. Rembrandt low-key

```text
Use the uploaded photo as the only identity reference. Keep the same man exactly: same face shape, eyes, nose, jawline, thin mustache, skin tone, apparent age and thin-framed glasses. Do not beautify or redesign the face.
Low-key studio portrait, medium close-up, three-quarter view facing camera left, eyes looking slightly past the lens.
Lighting: Rembrandt lighting from a warm key light placed high at 45 degrees camera right, a small triangle of light on the shadowed cheek, fill ratio about 4:1, faint warm rim light on the hair and shoulder. Background: deep charcoal, almost black, no gradient.
Dark charcoal knit sweater. Shot on an 85mm lens at f/8. Clean digital capture, crisp detail, rich but smooth shadows, sharp focus on the near eye, natural skin texture. Portrait 4:5, no text.
```

### B3. Profil menoleh ke bayangan

```text
Use the uploaded photo as the only identity reference. Keep the same man recognizable: same face shape, nose profile, jawline, thin mustache, skin tone, apparent age and thin-framed glasses.
Cinematic side-profile portrait, head and shoulders, he is turned to camera right looking down slightly, as if reading a screen just out of frame.
Lighting: a single narrow warm light from in front of him (camera right) lights only the edge of his profile, glasses rim and cheekbone; the back of his head and shoulder fade into black. Background: pure black.
Black shirt. Shot on an 85mm lens at f/8. Clean digital capture, crisp edges, smooth shadow falloff. Wide 16:9 with the face placed on the right third and empty black space on the left, no text.
```

### B4. Cahaya monitor (sesuai cerita "dari demo ke rak")

```text
Use the uploaded photo as the only identity reference. Keep the same man exactly: same face shape, eyes, nose, jawline, thin mustache, skin tone, apparent age and thin-framed glasses.
Night portrait at a desk, head and shoulders, he looks at a laptop screen just below the frame with a focused, calm expression.
Lighting: the only light is the soft cool glow of the laptop screen from below-front, plus one warm practical lamp far behind him that makes a thin warm rim on his hair. Most of the frame stays dark. Reflections of the screen are visible in his glasses but carry no readable text.
Dark shirt. Shot on a 50mm lens at f/5.6. Clean digital capture, crisp detail, smooth shadows. Portrait 4:5, no text, no logos.
```

### B5. Relight foto merah yang sudah ada jadi hangat

Untuk `Farrez-studio-setengah-badan.png`. Ubah satu hal saja (cahaya), sesuai prinsip satu perubahan per putaran.

```text
Edit this exact photo. Keep the same man, his face, smile, glasses, hairstyle, skin tone, crossed-arms pose, plaid shirt and framing exactly the same. Change only the lighting: replace the red light with a single warm amber key light from camera right, and let the left side of his face and body fall into soft shadow. Keep the background dark and plain. Clean digital capture, sharp focus on the eyes, no text.
```

### Hasil uji 10 Nov 2026

Flow, Nano Banana 2.1, rasio 3:4 (Flow tidak menyediakan 4:5), 2 hasil per prompt, 0 kredit (terbaca di panel). Sumber: `Farrez-asli-tanpa-edit.png`. Proyek Flow "Nov 10 - 17:59". Asli tersimpan di `D:\downloads\claude\2026-11-10-foto-farrez`.

| Prompt | Hasil |
| --- | --- |
| B1 split light | Gagal mengikuti cahaya: kedua sisi wajah tetap terang hangat. Model mengabaikan "split" dan "no fill". |
| B2 Rembrandt | Sesuai: tiga perempat, cahaya hangat dari kanan, latar arang. |
| B3 profil | Paling "semi rahasia": hanya tepi wajah yang terang, sisanya hitam. |
| B4 cahaya monitor | Sesuai, pantulan layar di kacamata tanpa tulisan. Latar rak buku ikut muncul walau tidak diminta. |

Pelajaran: untuk setengah wajah gelap, B3 (cahaya sempit dari depan profil) lebih patuh daripada istilah "split lighting". Kalau ingin mencoba B1 lagi, sebut posisi bayangannya secara konkret, misalnya "the left cheek, left eye and left side of the nose are in complete darkness".

## Cek setiap hasil sebelum dipilih

1. Taruh hasil di samping foto asli. Cocokkan hidung, dagu, telinga, garis rambut, kumis, dan bingkai kacamata (I).
2. Buang hasil yang wajahnya berubah, walau bagus. Di set 5 Nov ada 2 dari 4 yang jadi orang lain (V).
3. Cek gigi, mata, jari, dan jam tangan. Bagian kecil ini yang paling sering rusak (I).
4. Cek tidak ada tulisan atau logo karangan di baju, layar, atau latar.
5. Untuk Bank B, cek tidak ada grain atau blur yang ikut terbentuk.

## Etika dan aturan platform

- LinkedIn mewajibkan foto profil mencerminkan rupa Anda sendiri (V, LinkedIn Help 430). Edit baju, latar, dan cahaya masih aman. Bentuk wajah, usia, berat badan, dan warna kulit jangan diubah (I, sintesis).
- Survei Ringover 2024 (1.087 rekruter AS): 66% terganggu bila tahu foto AI tidak diungkap, 88% ingin pelamar mengungkapnya (I, satu survei vendor). Simpan foto asli, dan jawab jujur bila ditanya.
- Kebijakan Google melarang meniru orang untuk menipu dan memakai data biometrik tanpa persetujuan (V, Generative AI Prohibited Use Policy). Wajah sendiri dengan izin sendiri aman. Chat Gemini bisa dibaca peninjau manusia (V, Gemini Privacy Hub).
- Semua hasil memuat watermark SynthID dan C2PA (V). Watermark terlihat bisa dimatikan di pengaturan (I, belum dicek di halaman resmi).
- Halaman situs tidak menulis "dibuat AI". Asal foto dicatat di `public/assets/foto/PROVENANCE.md`.

## Sumber

| Sumber | Tanggal | Jenis |
| --- | --- | --- |
| [How to prompt Gemini 2.5 Flash Image](https://developers.googleblog.com/en/how-to-prompt-gemini-2-5-flash-image-generation-for-the-best-results/) | 28 Agu 2025 | resmi Google |
| [Prompting tips Nano Banana Pro](https://blog.google/products/gemini/prompting-tips-nano-banana-pro/) | 20 Nov 2025 | resmi Google |
| [Ultimate prompting guide for Nano Banana](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana) | 6 Mar 2026 | resmi Google Cloud |
| [AI Studio: image generation](https://aistudio.google.com/docs/image-generation) | tanpa tanggal | docs resmi |
| [Bantuan Flow: ingredients](https://support.google.com/flow/answer/16894016?hl=en) | tanpa tanggal | bantuan resmi |
| [Generative AI Prohibited Use Policy](https://policies.google.com/terms/generative-ai/use-policy) | 17 Des 2024 | kebijakan resmi |
| [Gemini Privacy Hub](https://support.google.com/gemini/answer/13594961?hl=en) | 26 Okt 2026 | kebijakan resmi |
| [LinkedIn Help 430: profile photo](https://www.linkedin.com/help/linkedin/answer/430) | tanpa tanggal | kebijakan resmi |
| [awesome-nanobanana-pro](https://github.com/ZeroLu/awesome-nanobanana-pro) | diakses 10 Nov 2026 | repo komunitas |
| [laozhang: headshot prompts](https://blog.laozhang.ai/en/posts/nano-banana-headshot-portrait-prompts) | 22 Jun 2026 | praktisi |
| [WenceStudio: headshot prompt wrong face](https://wencestudio-prompt-topixel.beehiiv.com/p/your-headshot-prompt-is-producing-the-wrong-face) | 23 Jun 2026 | praktisi |
| [Techpresso: Gemini photo editing prompts](https://academy.techpresso.co/prompts/gemini-photo-editing-prompts) | 11 Sep 2026 | praktisi |
| [YouMind: fine-art B/W portrait](https://youmind.com/zh-CN/prompts/fine-art-black-white-portrait-27125) | 29 Jun 2026 | galeri prompt |
| [HeadshotPro: photo guidelines](https://www.headshotpro.com/docs/individual/creating-headshots/photo-guidelines) | tanpa tanggal | docs vendor |
| [HCAMag: survei Ringover](https://www.hcamag.com/us/specialization/hr-technology/over-3-in-4-recruiters-prefer-ai-generated-headshot-over-real-ones/503274) | 28 Agu 2024 | media HR |
| [Bantuan Gemini: generate & edit images](https://support.google.com/gemini/answer/14286560) | tanpa tanggal | bantuan resmi |
| [Katadata: 10 prompt pas foto formal](https://katadata.co.id/lifestyle/varia/6ab9ff7c031da/10-prompt-gemini-ai-pas-foto-formal-yang-profesional) | 28 Sep 2026 | media |
| [Popbela: prompt pas foto lamaran kerja](https://www.popbela.com/career/inspiration/prompt-untuk-membuat-pas-foto-di-gemini-praktis-untuk-lamaran-kerja-00-jsm56-wcqvkd) | 17 Sep 2026 | media |
| [Merdeka: 11 prompt foto formal](https://www.merdeka.com/teknologi/read/8038357/11-prompt-gemini-ai-efisien-buat-foto-formal-terbaik-tanpa-ke-studio) | 7 Okt 2025 | media |
| [Momsmoney: pas foto latar merah, hitam, putih](https://momsmoney.kontan.co.id/news/prompt-gemini-ai-buat-bikin-pas-foto-dengan-background-merah-hitam-putih) | 21 Okt 2025 | media |
| [detikJabar: 22 prompt batik korporat](https://www.detik.com/jabar/jabar-gaskeun/d-8140232/22-prompt-ai-batik-gaya-korporat-modern-profesional-dan-budaya) | 1 Okt 2025 | media |
| [detikJogja: 7 prompt foto formal CV](https://www.detik.com/jogja/berita/d-8118543/7-prompt-gemini-ai-edit-foto-sendiri-formal-bisa-untuk-foto-profil-cv-linkedin) | 18 Sep 2025 | media |
| [Alan Ranger: LinkedIn headshots 2026](https://www.alanranger.com/blog-on-photography/professional-headshots-for-linkedin) | 31 Mar 2026 | fotografer |
| [Adorama: 3 lighting styles](https://www.adorama.com/alc/3-essential-lighting-styles-better-portraiture) | 22 Sep 2016 | fotografer |
| [CreativeLive: Peter Hurley headshots](https://www.creativelive.com/blog/improve-headshots-with-peter-hurley) | 16 Nov 2016 | fotografer |
| [Boston Globe: headshot "professional" mengubah ras](https://www.boston.com/news/the-boston-globe/2023/07/21/mit-student-ai-racial-blind-spots/) | 21 Jul 2023 | media |
| [Supercarblondie: uji headshot Gemini](https://supercarblondie.com/tech/we-used-gemini-to-create-professional-headshots/) | 25 Mar 2026 | media |
| [The Rundown AI: 20 prompt headshot](https://app.therundown.ai/guides/we-tested-20-prompts-for-generating-ai-headshots-heres-the-best-strategy) | 30 Jul 2026 | praktisi |
| [r/GeminiAI: image generation of yourself fails](https://reddit.com/r/GeminiAI/comments/1rgy2qs/image_generation_of_yourself_fails_its_so_annoying/) | Mar 2026 | forum, dibaca lewat arsip |
| [alldoenrico di Threads](https://www.threads.com/@alldoenrico/post/DZ0GWJFE7X5) | 21 Jun 2026 | media sosial |
| [feromauli di Threads](https://www.threads.com/@feromauli/post/DdwFVDJlAvj) | 26 Sep 2026 | media sosial |
| Proyek Flow "Nov 05 - 00:56" di akun Farrez | 5 Nov 2026 | prompt dan hasil asli |
| Proyek Flow "Nov 10 - 17:59" di akun Farrez | 10 Nov 2026 | uji Bank B |

Postingan tersimpan di Threads @trycatch200ok dibaca seluruhnya pada 10 Nov 2026: 290 postingan, Mar sampai Nov 2026. Yang membahas prompt foto hanya alldoenrico (A5).
