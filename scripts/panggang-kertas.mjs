// Panggang pola butir kertas bawaan LeafThrough (MIT) ke PNG, supaya buklet rak tidak menghitungnya
// per piksel saat dibuat (526 ms di HP dengan CPU 4x, 19 Nov 2026). Kode polanya diambil langsung
// dari paket yang terpasang dan dijalankan dengan kanvas tiruan, jadi hasilnya sama persis dengan
// pola bawaan. Jalankan ulang setelah memperbarui leafthrough:
//   node scripts/panggang-kertas.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const akar = new URL("../", import.meta.url);
export const KELUAR = new URL("public/assets/rak/kertas-butir.png", akar);

// Potongan kode pola dari dist leafthrough: dari `var SIZE` sampai akhir paperPatternCanvas().
export function polaBawaan() {
  const src = readFileSync(new URL("node_modules/leafthrough/dist/chunk-MJSK3A5O.js", akar), "utf8");
  const a = src.indexOf("var SIZE = ");
  const b = src.indexOf("function createPaperPattern(");
  if (a < 0 || b < a) throw new Error("struktur leafthrough berubah: pola tidak ditemukan");
  let gambar = null;
  const document = {
    createElement: () => ({
      getContext: () => ({
        createImageData: (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }),
        putImageData: (im) => (gambar = im),
      }),
    }),
  };
  new Function("document", `${src.slice(a, b)}; return paperPatternCanvas();`)(document);
  return gambar;
}

// PNG abu-abu 8 bit tanpa kompresi rugi: nilai piksel sama dengan kanal R pola bawaan.
export function pngAbu(im) {
  const { width: w, height: h, data } = im;
  const baris = Buffer.alloc((w + 1) * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) baris[y * (w + 1) + 1 + x] = data[(y * w + x) * 4];
  const crc = (buf) => {
    let c = ~0;
    for (const v of buf) {
      c ^= v;
      for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
    return ~c >>> 0;
  };
  const potong = (jenis, isi) => {
    const t = Buffer.from(jenis);
    const p = Buffer.alloc(4);
    p.writeUInt32BE(isi.length);
    const c = Buffer.alloc(4);
    c.writeUInt32BE(crc(Buffer.concat([t, isi])));
    return Buffer.concat([p, t, isi, c]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 0;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), potong("IHDR", ihdr), potong("IDAT", deflateSync(baris, { level: 9 })), potong("IEND", Buffer.alloc(0))]);
}

if (process.argv[1]?.endsWith("panggang-kertas.mjs")) {
  const im = polaBawaan();
  writeFileSync(KELUAR, pngAbu(im));
  console.log(`kertas-butir.png ${im.width}x${im.height}`);
}
