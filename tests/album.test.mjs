// Pagar untuk seni album per proyek: tiap CD punya genre sendiri, semua berkas yang
// dirujuk benar-benar ada, asalnya tercatat, dan letak judul masuk akal.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { proyek } from "../content/proyek.js";
import { ALBUM, albumUntuk } from "../content/album.js";
import { pecahBaris, hurufTermuat } from "../components/imersif/tipografi.js";

const akar = new URL("../", import.meta.url);
const ada = (url) => existsSync(new URL(`public${url}`, akar));
const baca = (p) => readFileSync(new URL(p, akar), "utf8");

test("setiap proyek punya album, dan tidak ada album tanpa proyek", () => {
  const slug = proyek.map((p) => p.slug).sort();
  assert.deepEqual(Object.keys(ALBUM).sort(), slug);
  for (const s of slug) assert.ok(albumUntuk(s), s);
  assert.equal(albumUntuk("tidak-ada"), null);
});

test("genre tidak ada yang sama, dan bukan gaya risograf seragam yang lama", () => {
  const genre = Object.values(ALBUM).map((a) => a.genre.toLowerCase());
  assert.equal(new Set(genre).size, genre.length, "ada genre yang dipakai dua kali");
  assert.ok(!genre.some((g) => g.includes("risograph")));
});

test("semua gambar dan huruf yang dirujuk ada di public/", () => {
  for (const [slug, a] of Object.entries(ALBUM)) {
    assert.equal(a.buklet.length, 8, `${slug}: halaman buklet`);
    for (const f of [a.sampul, a.label, a.belakang, ...a.buklet]) assert.ok(ada(f), `${slug}: ${f} tidak ada`);
    if (a.huruf.berkas) assert.ok(ada(a.huruf.berkas), `${slug}: ${a.huruf.berkas} tidak ada`);
  }
});

test("letak judul di dalam sampul; sampul murni gambar paling banyak tiga", () => {
  const murni = Object.values(ALBUM).filter((a) => a.judul === null).length;
  assert.ok(murni <= 3, `${murni} sampul tanpa judul`);
  for (const [slug, a] of Object.entries(ALBUM)) {
    if (!a.judul) continue;
    const { x, y, ukuran, lebar, rata } = a.judul;
    for (const [k, v] of Object.entries({ x, y, ukuran, lebar })) {
      assert.ok(v > 0 && v < 1, `${slug}: judul.${k}=${v} di luar 0..1`);
    }
    assert.ok(["left", "center", "right"].includes(rata), `${slug}: rata ${rata}`);
    assert.match(a.judul.warna, /^#[0-9a-f]{6}$/i, `${slug}: warna judul`);
  }
});

test("asal setiap berkas tercatat di PROVENANCE.md dan prompt.json", () => {
  const prov = baca("public/assets/album/PROVENANCE.md");
  const prompt = JSON.parse(baca("docs/seni-cd/prompt.json"));
  for (const [slug, a] of Object.entries(ALBUM)) {
    const bagian = prov.split(`## ${slug}:`)[1]?.split("\n## ")[0];
    assert.ok(bagian, `${slug} tidak ada di PROVENANCE.md`);
    for (const f of [a.sampul, a.label, a.belakang, ...a.buklet]) {
      const nama = f.split("/").pop();
      assert.match(bagian, new RegExp(`\\| ${nama.replace(".", "\\.")} \\| v[12] \\|`), `${slug}/${nama} tanpa baris asal`);
      const p = prompt.find((x) => x.slug === slug && x.berkas === nama);
      assert.ok(p, `${slug}/${nama} tanpa prompt`);
      assert.match(p.prompt, /no text/i, `${slug}/${nama}: prompt tanpa larangan teks`);
    }
  }
});

test("buklet memuat halaman ilustrasi album sebagai URL, sesudah Overview", () => {
  const src = baca("components/imersif/adegan.js");
  const fungsi = src.slice(src.indexOf("function halamanBuklet"), src.indexOf("\n}\n", src.indexOf("function halamanBuklet")));
  const iOverview = fungsi.indexOf("LABEL.overview");
  const iAlbum = fungsi.indexOf("albumUntuk(p.slug)?.buklet");
  assert.ok(iAlbum > 0, "halamanBuklet tidak memakai ilustrasi album");
  assert.ok(iAlbum > iOverview, "ilustrasi harus sesudah halaman Overview");
});

// Kanvas palsu: lebar teks = 10 px per karakter, seperti huruf monospace.
const kanvasPalsu = { measureText: (t) => ({ width: t.length * 10 }) };

test("pecahBaris memecah di batas lebar tanpa memotong kata", () => {
  assert.deepEqual(pecahBaris(kanvasPalsu, "a bb ccc", 40), ["a bb", "ccc"]);
  // Tepat di batas tetap satu baris.
  assert.deepEqual(pecahBaris(kanvasPalsu, "a bb", 40), ["a bb"]);
  // Satu kata yang lebih lebar dari batas tetap utuh di barisnya sendiri.
  assert.deepEqual(pecahBaris(kanvasPalsu, "Dashboard jaringan", 50), ["Dashboard", "jaringan"]);
  assert.deepEqual(pecahBaris(kanvasPalsu, "  spasi   ganda ", 200), ["spasi ganda"]);
  assert.deepEqual(pecahBaris(kanvasPalsu, "", 100), []);
});

test("huruf halaman sendiri dianggap sudah termuat", () => {
  assert.equal(hurufTermuat({ keluarga: "var(--font-sans)" }), true);
  assert.equal(hurufTermuat(undefined), true);
});
