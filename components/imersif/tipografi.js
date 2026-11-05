// Huruf genre album untuk kanvas: memuat berkas huruf sekali, lalu menulis judul
// langsung di atas gambar sampul seperti tinta cetak, bukan pita terpisah.
// Sengaja tanpa impor alias supaya bisa diuji di halaman statis.

const dimuat = new Map();
const termuat = new Set();

// Benar bila huruf sudah bisa dipakai sekarang (atau memang huruf halaman).
export function hurufTermuat(h) {
  return !h?.berkas || termuat.has(h.berkas) || typeof FontFace === "undefined";
}

// Nama keluarga yang dipakai kanvas. "var(--x)" dibaca dari CSS halaman.
export function namaHuruf(h) {
  if (!h) return "system-ui, sans-serif";
  if (h.keluarga.startsWith("var(")) {
    const nama = h.keluarga.slice(4, -1);
    const v = typeof document !== "undefined" ? getComputedStyle(document.documentElement).getPropertyValue(nama) : "";
    return v.trim() || "system-ui, sans-serif";
  }
  return `"${h.keluarga}"`;
}

// Janji yang selesai saat huruf siap dipakai kanvas. Gagal muat tidak memblokir:
// kanvas jatuh ke huruf cadangan.
export function muatHuruf(h) {
  if (!h?.berkas || typeof FontFace === "undefined") return Promise.resolve();
  if (!dimuat.has(h.berkas)) {
    const f = new FontFace(h.keluarga, `url(${h.berkas})`, { weight: String(h.berat ?? 400) });
    dimuat.set(
      h.berkas,
      f.load().then(
        (siap) => {
          document.fonts.add(siap);
          termuat.add(h.berkas);
        },
        () => termuat.add(h.berkas),
      ),
    );
  }
  return dimuat.get(h.berkas);
}

// Pecah teks ke baris selebar `lebar` (px).
export function pecahBaris(g, teks, lebar) {
  const baris = [];
  let kini = "";
  for (const kata of String(teks).trim().split(/\s+/)) {
    const coba = kini ? `${kini} ${kata}` : kata;
    if (kini && g.measureText(coba).width > lebar) {
      baris.push(kini);
      kini = kata;
    } else {
      kini = coba;
    }
  }
  if (kini) baris.push(kini);
  return baris;
}

// Tulis judul sampul menurut spesifikasi `judul` dari content/album.js.
// `ukuran` = sisi kanvas (px). Tinta digambar dua kali dengan geser kecil
// supaya terasa dicetak, lalu butir kertas di atasnya menyatukan keduanya.
export function tulisJudul(g, ukuran, teks, spec, h) {
  if (!spec || !teks) return;
  const px = spec.ukuran * ukuran;
  const isi = spec.kapital ? String(teks).toUpperCase() : String(teks);
  g.save();
  g.font = `${h?.berat ?? 400} ${px}px ${namaHuruf(h)}`;
  g.textBaseline = "top";
  g.textAlign = spec.rata ?? "left";
  if (spec.renggang && "letterSpacing" in g) g.letterSpacing = `${spec.renggang * px}px`;
  const baris = pecahBaris(g, isi, spec.lebar * ukuran);
  const tinggiBaris = px * (spec.jarak ?? 1.08);
  const x = spec.x * ukuran;
  const y = spec.y * ukuran;
  g.translate(x, y);
  if (spec.putar) g.rotate((spec.putar * Math.PI) / 180);
  if (spec.latar) {
    const lebarMaks = Math.max(...baris.map((b) => g.measureText(b).width));
    const pad = px * 0.28;
    const kiri = spec.rata === "center" ? -lebarMaks / 2 : spec.rata === "right" ? -lebarMaks : 0;
    g.fillStyle = spec.latar;
    g.fillRect(kiri - pad, -pad * 0.8, lebarMaks + pad * 2, baris.length * tinggiBaris + pad * 1.2);
  }
  const tulis = (warna, dx, dy, alfa) => {
    g.globalAlpha = alfa;
    g.fillStyle = warna;
    baris.forEach((b, i) => g.fillText(b, dx, dy + i * tinggiBaris));
  };
  if (spec.bayang) tulis(spec.bayang, px * 0.05, px * 0.05, 1);
  // Geser cetak: lapisan samar yang meleset sedikit, seperti pelat yang tidak pas.
  tulis(spec.warna, px * 0.012, px * 0.008, 0.25);
  tulis(spec.warna, 0, 0, 0.94);
  g.restore();
}

// Gambar belakang dari Flow punya pita polos di bawah (dulu diminta untuk daftar
// lagu), tingginya beda-beda. Cari batasnya: baris dari bawah yang hampir tanpa
// variasi warna dianggap pita. Mengembalikan pecahan tinggi gambar di atas pita.
// `baris`: per baris { rata, sd } terang (0..255). Baris pita = warnanya dekat
// dengan baris paling bawah dan cukup rata (tekstur kertas masih lolos). Garis
// tepi tipis di dalam pita (1–2 baris) tidak dianggap isi; isi baru dimulai
// setelah 3 baris bukan-pita berturut-turut.
export function batasPita(baris, { selisih = 14, sdMaks = 24 } = {}) {
  const dasar = baris[baris.length - 1]?.rata ?? 0;
  let isi = 0;
  for (let y = baris.length - 1; y >= 0; y--) {
    const pita = Math.abs(baris[y].rata - dasar) < selisih && baris[y].sd < sdMaks;
    isi = pita ? 0 : isi + 1;
    if (isi === 3) return Math.min(1, Math.max(0.6, (y + 3) / baris.length));
  }
  return 0.6;
}
