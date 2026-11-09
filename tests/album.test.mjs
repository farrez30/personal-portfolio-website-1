// Pagar untuk seni album per proyek: tiap CD punya genre sendiri, semua berkas yang
// dirujuk benar-benar ada, asalnya tercatat, dan letak judul masuk akal.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { proyek } from "../content/proyek.js";
import { ALBUM, albumUntuk, LOGO_LABEL } from "../content/album.js";
import { BUKLET } from "../content/buklet.js";
import { pecahBaris, hurufTermuat, batasPita } from "../components/imersif/tipografi.js";

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
    for (const f of [a.sampul, a.sampulJudul, a.label, a.belakang, ...a.buklet]) assert.ok(ada(f), `${slug}: ${f} tidak ada`);
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

test("buklet memuat halaman ilustrasi album sesudah Overview, teksnya hanya bila naskah disetujui", () => {
  const src = baca("components/imersif/adegan.js");
  const awal = src.indexOf("function halamanBuklet");
  const fungsi = src.slice(awal, src.indexOf("\n}\n", awal));
  const iOverview = fungsi.indexOf("LABEL.overview");
  const iAlbum = fungsi.indexOf("album?.buklet");
  assert.ok(iAlbum > 0, "halamanBuklet tidak memakai ilustrasi album");
  assert.ok(iAlbum > iOverview, "ilustrasi harus sesudah halaman Overview");
  assert.ok(fungsi.includes("naskah?.disetujui ? naskah.halaman[i] : null"), "teks harus digerbang persetujuan naskah");
  assert.match(src, /teksturNaskah[\s\S]*t\.dispose\(\)/, "tekstur naskah harus dibuang bersama buklet");
});

test("naskah buklet: 8 halaman per album, dua bahasa, label kerja, tanpa simbol penyambung", () => {
  const label = new Set(["Context", "Challenge", "Solution", "How it works", "Outcome"]);
  for (const slug of Object.keys(ALBUM)) {
    const n = BUKLET[slug];
    assert.ok(n, `${slug}: naskah tidak ada`);
    assert.equal(typeof n.disetujui, "boolean", `${slug}: gerbang disetujui hilang`);
    assert.equal(n.halaman.length, ALBUM[slug].buklet.length, `${slug}: jumlah halaman tidak sama dengan ilustrasi`);
    for (const [i, h] of n.halaman.entries()) {
      assert.ok(label.has(h.label), `${slug} #${i + 1}: label ${h.label}`);
      for (const bahasa of ["id", "en"]) {
        for (const teks of [h.judul[bahasa], h.isi[bahasa]]) {
          assert.ok(teks && teks.trim(), `${slug} #${i + 1}: teks ${bahasa} kosong`);
          assert.doesNotMatch(teks, /→| · | — | \| /, `${slug} #${i + 1}: simbol penyambung`);
        }
      }
      assert.ok(h.isi.id.split(/\s+/).length <= 45, `${slug} #${i + 1}: isi terlalu panjang untuk sepertiga halaman`);
    }
  }
});

test("sampul berjudul tercatat asalnya dan prompt-nya mengunci ejaan", () => {
  const prov = baca("public/assets/album/PROVENANCE.md");
  const prompt = JSON.parse(baca("docs/seni-cd/prompt-judul.json"));
  for (const slug of Object.keys(ALBUM)) {
    const bagian = prov.split(`## ${slug}:`)[1]?.split("\n## ")[0] ?? "";
    assert.match(bagian, /\| sampul-judul\.webp \| edit \|/, `${slug}: sampul berjudul tanpa baris asal`);
    const p = prompt.find((x) => x.slug === slug);
    assert.ok(p, `${slug}: prompt sampul berjudul tidak ada`);
    assert.match(p.prompt, /Spell it exactly "[^"]+" and write nothing else/, `${slug}: prompt tanpa kunci ejaan`);
  }
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

test("logo situs dan logo proyek ada, tanpa skrip atau rujukan luar", () => {
  assert.ok(ada(LOGO_LABEL), "logo situs tidak ada");
  const berlogo = Object.entries(ALBUM).filter(([, a]) => a.logo);
  assert.equal(berlogo.length, 6);
  // Klien anonim, partner yang belum memberi izin, dan pilot tanpa merek tidak berlogo.
  for (const slug of ["erp-software-house", "viralytics", "pilot-iklan"]) assert.equal(ALBUM[slug].logo, undefined, slug);
  for (const [slug, a] of berlogo) {
    assert.ok(ada(a.logo), `${slug}: ${a.logo} tidak ada`);
    const svg = readFileSync(new URL(`public${a.logo}`, akar), "utf8");
    assert.doesNotMatch(svg, /<script|href=|url\(|<image|@import|\son[a-z]+=/i, `${slug}: logo memuat isi aktif`);
    assert.match(svg, /<svg[^>]*\swidth="/, `${slug}: logo tanpa width, kanvas tidak bisa mengukurnya`);
  }
});

test("batasPita membuang pita polos di bawah, tidak lebih", () => {
  const isi = (n) => Array.from({ length: n }, (_, i) => ({ rata: 60 + (i % 5) * 30, sd: 40 }));
  const pita = (n, rata = 230, sd = 12) => Array.from({ length: n }, () => ({ rata, sd }));
  assert.equal(batasPita([...isi(80), ...pita(20)]), 0.8);
  assert.equal(batasPita(isi(100)), 1, "tanpa pita, gambar utuh");
  // Pita kertas bertekstur (sd sedang) tetap dikenali.
  assert.equal(batasPita([...isi(80), ...pita(20, 225, 20)]), 0.8);
  // Garis tepi tipis di dalam pita tetap ikut terbuang.
  assert.equal(batasPita([...isi(80), ...pita(8), { rata: 20, sd: 50 }, { rata: 20, sd: 50 }, ...pita(10)]), 0.8);
  // Pita sangat tinggi (gambar hampir polos) dibatasi supaya gambar tidak hilang.
  assert.equal(batasPita([...isi(30), ...pita(70)]), 0.6);
  // Baris yang warnanya sama dengan pita tapi ada di tengah gambar tidak dihitung.
  assert.equal(batasPita([...isi(40), ...pita(10), ...isi(50)]), 1);
});

test("kiriKolomTeks memulai teks sesudah tepi gambar, dalam batas", async () => {
  const { kiriKolomTeks } = await import("../components/imersif/tipografi.js");
  const kolom = (tepi, n = 100) => Array.from({ length: n }, (_, x) => (x < tepi ? 40 : 3));
  // Gambar berakhir di 65%: teks di 67,5%.
  assert.equal(kiriKolomTeks(kolom(65)), 0.675);
  // Gambar masuk sampai 70% (blok d-day): teks bergeser ke 72,5%.
  assert.equal(kiriKolomTeks(kolom(70)), 0.725);
  // Gambar nyaris penuh: dibatasi 74% supaya kolom tetap muat.
  assert.equal(kiriKolomTeks(kolom(95)), 0.74);
  // Gambar sempit atau polos: tidak lebih kiri dari 66%.
  assert.equal(kiriKolomTeks(kolom(30)), 0.66);
  assert.equal(kiriKolomTeks(kolom(0)), 0.66);
});

test("gambarMasukKolom: kertas di belakang teks hanya bila gambar melewati batas kolom teks", async () => {
  const { gambarMasukKolom, kiriKolomTeks } = await import("../components/imersif/tipografi.js");
  const kolom = (tepi, n = 100) => Array.from({ length: n }, (_, x) => (x < tepi ? 40 : 3));
  // Gambar berhenti di 65% atau 70%: teks muat sesudahnya, tanpa kertas.
  assert.equal(gambarMasukKolom(kolom(65)), false);
  assert.equal(gambarMasukKolom(kolom(70)), false);
  // Tepi di 73% (biasanya sudah memudar ke kertas): teks mulai di 74%, tidak menimpa.
  assert.equal(kiriKolomTeks(kolom(73)), 0.74);
  assert.equal(gambarMasukKolom(kolom(73)), false);
  // YiheeCam 03: gambar sampai 75%, teks mulai 74%, jadi judul menimpa tepi helm.
  assert.equal(gambarMasukKolom(kolom(75)), true);
  // Ilustrasi selebar halaman, kabut, atau gradasi.
  assert.equal(gambarMasukKolom(kolom(100)), true);
  // Blok warna rata (Blue Note d-day) bukan gambar: teks terang di atasnya, tanpa kertas.
  assert.equal(gambarMasukKolom(Array(100).fill(4)), false);
});

test("semua halaman buklet dimuat, supaya halaman belakang di tutup kotak tidak kosong", () => {
  const src = baca("components/imersif/adegan.js");
  assert.match(src, /pages: halaman,\s*(\/\/[^\n]*\s*)*preload: halaman\.length/, "LeafThrough harus memuat semua halaman (preload)");
});
