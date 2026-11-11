// Styleframe untuk mode Ringan dengan layar produk asli yang sudah ditempel, supaya mode Ringan
// menampilkan layar yang sama dengan panggung Imersif (shader di components/cerita/dunia.js).
//
//   node scripts/layar-ringan.mjs
//
// Koordinat layar dibaca dari LAYAR di dunia.js, jadi kedua mode tidak bisa berbeda. Hasilnya
// public/assets/cerita/<styleframe>-layar.webp. Butuh ffmpeg di PATH.
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const akar = new URL("../", import.meta.url);
const sumber = readFileSync(new URL("components/cerita/dunia.js", akar), "utf8");
const teks = sumber.match(/const LAYAR = (\{[\s\S]*?\n\});/)[1];
const LAYAR = new Function(`return ${teks}`)();
const [W, H] = [1376, 768];

// Titik di dalam segi empat (urutan searah jarum jam di layar): semua silang tepi bertanda sama.
const dalamSegiEmpat = (s) =>
  s
    .map(([x0, y0], i) => {
      const [x1, y1] = s[(i + 1) % 4];
      return `gte((${x1 - x0})*(Y-${y0})-(${y1 - y0})*(X-${x0}),0)`;
    })
    .join("*");

for (const [gambar, semua] of Object.entries(LAYAR)) {
  // Layar terbelah (bab 7): Ringan memakai satu gambar yang sudah terbelah di tengah.
  const daftar = semua[0].belah ? [{ ...semua[0], src: semua[0].ringan }] : semua;
  const masuk = ["-i", `public/assets/cerita/${gambar}.webp`];
  const rantai = [];
  let alas = "0:v";
  daftar.forEach((l, j) => {
    masuk.push("-i", `public/assets/cerita/${l.src}.webp`);
    const [a, b, c, d] = l.sudut;
    let topeng = dalamSegiEmpat(l.sudut);
    for (const [x0, y0, x1, y1] of l.tutup ?? []) topeng += `*(1-between(X,${x0},${x1})*between(Y,${y0},${y1}))`;
    if (l.potong) {
      const [[x0, y0], [x1, y1]] = l.potong;
      topeng += `*gte((${x1 - x0})*(Y-${y0})-(${y1 - y0})*(X-${x0}),0)`;
    }
    // Grade sama dengan fungsi tempel() di shader: lebih pudar dan hangat, ditambah 18% gambar asli.
    // Kertas: tinta dikalikan ke kertas yang diburamkan (mipmap 4 di shader, kira-kira blur 16 px).
    const kertas = l.jenis === "kertas";
    const bersih = l.jenis === "bersih";
    const grade =
      l.jenis === "proyektor"
        ? "hue=s=0.45,colorchannelmixer=rr=0.86:gg=0.74:bb=0.58"
        : kertas
          ? "null"
          : bersih
            ? "colorchannelmixer=rr=0.86:gg=0.83:bb=0.8"
          : "hue=s=0.72,colorchannelmixer=rr=0.62:gg=0.58:bb=0.52";
    const i = j + 1;
    rantai.push(
      `[${i}:v]scale=${W}:${H},format=rgb24,${grade},perspective=0:0:${W}:0:0:${H}:${W}:${H}:sense=source:eval=init,` +
        `perspective=${a[0]}:${a[1]}:${b[0]}:${b[1]}:${d[0]}:${d[1]}:${c[0]}:${c[1]}:sense=destination[l${j}]`,
      // Bersih: layar menutup penuh, jadi gambar asli tidak perlu dipecah untuk dicampur.
      bersih ? `[${alas}]format=rgb24[dasar${j}]` : `[${alas}]format=rgb24,split[asli${j}][dasar${j}]`,
      bersih
        ? `[l${j}]format=rgb24[campur${j}]`
        : kertas
        ? `[asli${j}]gblur=sigma=16,format=rgb24[kabur${j}];[l${j}][kabur${j}]blend=all_mode=multiply,format=rgb24[campur${j}]`
        : `[l${j}][asli${j}]blend=all_expr='min(A+0.18*B,255)'[campur${j}]`,
      // Masker jadi kanal alfa lapisan layar, lalu ditimpa ke gambar dasar. maskedmerge sempat
      // membocorkan lapisan di luar masker dan mewarnai separuh adegan.
      `color=black:s=${W}x${H},format=gray,geq=lum='255*${topeng}'[t${j}]`,
      `[campur${j}]format=rgba[cr${j}];[cr${j}][t${j}]alphamerge[la${j}]`,
      `[dasar${j}][la${j}]overlay=format=auto,format=rgb24[h${j}]`,
    );
    alas = `h${j}`;
  });
  const keluar = `public/assets/cerita/${gambar}-layar.webp`;
  execFileSync("ffmpeg", ["-v", "error", "-y", ...masuk, "-filter_complex", rantai.join(";"), "-map", `[${alas}]`, "-frames:v", "1", "-c:v", "libwebp", "-quality", "82", keluar], { cwd: akar });
  console.log(keluar);
}
