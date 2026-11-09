// Ilustrasi buklet yang gagal dimuat sekali tidak boleh membuat halaman kosong selamanya.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buatPemuat } from "../components/imersif/muat.js";

// Image palsu yang berperilaku seperti aslinya: complete=false selama memuat, lalu
// complete=true dengan naturalWidth 0 bila gagal, dan memanggil pendengar sekali.
function pabrik(hasil) {
  const dibuat = [];
  const buat = () => {
    const pendengar = {};
    const im = {
      complete: false,
      naturalWidth: 0,
      addEventListener: (nama, fn) => ((pendengar[nama] ??= []).push(fn)),
      set src(v) {
        this._src = v;
        const ok = hasil.shift() ?? true;
        queueMicrotask(() => {
          im.complete = true;
          im.naturalWidth = ok ? 768 : 0;
          for (const fn of pendengar[ok ? "load" : "error"] ?? []) fn();
        });
      },
    };
    dibuat.push(im);
    return im;
  };
  return { buat, dibuat };
}
const segera = (fn) => queueMicrotask(fn);

test("gambar yang gagal sekali dicoba ulang dengan Image baru", async () => {
  const { buat, dibuat } = pabrik([false, true]);
  const p = buatPemuat({ buat, tunda: segera });
  const im = await p.tunggu("/a.webp");
  assert.equal(im.naturalWidth, 768);
  assert.equal(dibuat.length, 2);
  // Simpanan kini memegang Image yang berhasil, jadi pemanggil berikut langsung dapat.
  assert.equal(p.muat("/a.webp"), im);
});

test("berhenti setelah batas coba, dan mengembalikan Image rusak", async () => {
  const { buat, dibuat } = pabrik([false, false, false, false]);
  const p = buatPemuat({ buat, tunda: segera, coba: 3 });
  const im = await p.tunggu("/b.webp");
  assert.equal(im.naturalWidth, 0);
  assert.equal(dibuat.length, 3);
});

test("banyak kanvas menunggu berkas yang sama: satu permintaan ulang, bukan satu per kanvas", async () => {
  const { buat, dibuat } = pabrik([false, true]);
  const p = buatPemuat({ buat, tunda: segera });
  const [x, y, z] = await Promise.all([p.tunggu("/c.webp"), p.tunggu("/c.webp"), p.tunggu("/c.webp")]);
  assert.ok(x === y && y === z);
  assert.equal(x.naturalWidth, 768);
  assert.equal(dibuat.length, 2);
});

test("gambar yang sudah termuat tidak diminta lagi", async () => {
  const { buat, dibuat } = pabrik([true]);
  const p = buatPemuat({ buat, tunda: segera });
  await p.tunggu("/d.webp");
  await p.tunggu("/d.webp");
  assert.equal(dibuat.length, 1);
});

test("sampul dan halaman belakang buklet diberikan sebagai tekstur yang diperbarui", () => {
  const src = readFileSync(new URL("../components/imersif/adegan.js", import.meta.url), "utf8");
  assert.match(src, /src: tekstur\(gambarSampul\(/, "sampul harus lewat tekstur()");
  assert.match(src, /src: tekstur\(gambarBelakang\(/, "halaman belakang harus lewat tekstur()");
  assert.match(src, /kanvas\.siap\.then\(\(\) => \(t\.needsUpdate = true\)\)/);
  assert.doesNotMatch(src, /DEBUG/);
});
