// Musik latar dari rekaman berlisensi bebas (ADR 0022): setiap berkas ada, tercatat asalnya,
// berlisensi yang mengizinkan disimpan dan diputar ulang di situs, dan dikredit.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { LAGU, albumMusik } from "../content/musik.js";

const akar = new URL("../", import.meta.url);
const baca = (p) => readFileSync(new URL(p, akar), "utf8");
const berkas = (l) => new URL(`public${l.berkas}`, akar);

// Lisensi yang boleh: tanpa NC (situs ini juga mempromosikan jasa) dan tanpa ND.
const BOLEH = new Set(["CC0", "Public domain", "CC BY 4.0", "CC BY-SA 2.0", "CC BY-SA 3.0", "CC BY-SA 4.0"]);

test("setiap lagu punya berkas MP3 sungguhan, dan tidak ada berkas yatim", () => {
  assert.ok(LAGU.length >= 10);
  const nama = new Set();
  for (const l of LAGU) {
    assert.match(l.berkas, /^\/musik\/[a-z0-9-]+\.mp3$/, l.berkas);
    assert.ok(!nama.has(l.berkas), `ganda: ${l.berkas}`);
    nama.add(l.berkas);
    const isi = readFileSync(berkas(l));
    assert.ok(isi.length > 500_000, `${l.berkas} terlalu kecil`);
    // Awal MP3: tag ID3 atau sinkron bingkai MPEG (11 bit menyala).
    const mp3 = isi.subarray(0, 3).toString("latin1") === "ID3" || (isi[0] === 0xff && (isi[1] & 0xe0) === 0xe0);
    assert.ok(mp3, `${l.berkas} bukan MP3`);
    assert.ok(Number.isInteger(l.durasi) && l.durasi > 60_000 && l.durasi < 15 * 60_000, `${l.berkas}: durasi ${l.durasi}`);
  }
  const ada = readdirSync(new URL("public/musik/", akar)).filter((f) => f.endsWith(".mp3"));
  assert.deepEqual(ada.sort(), [...nama].map((b) => b.split("/").pop()).sort());
});

test("hanya lisensi yang mengizinkan disimpan di situs, dengan tautan lisensinya", () => {
  for (const l of LAGU) {
    assert.ok(BOLEH.has(l.lisensi), `${l.judul}: lisensi ${l.lisensi}`);
    assert.match(l.urlLisensi, /^https:\/\//, l.judul);
    assert.match(l.sumber, /^https:\/\/(commons\.wikimedia\.org\/wiki\/File:|incompetech\.com\/)/, l.judul);
    assert.ok(l.judul.trim() && l.artis.trim(), l.berkas);
    // Rekaman domain publik selain rilis Musopen harus terbit sebelum 1926 (domain publik di AS).
    if (l.lisensi === "Public domain" && !l.artis.includes("Musopen")) assert.ok(Number(l.tahun) < 1926, `${l.judul}: ${l.tahun}`);
  }
});

test("asal setiap berkas tercatat di PROVENANCE.md, dengan hash yang cocok", () => {
  const prov = baca("public/musik/PROVENANCE.md");
  for (const l of LAGU) {
    const nama = l.berkas.split("/").pop();
    const baris = prov.split(/\r?\n/).find((b) => b.startsWith(`| ${nama} |`));
    assert.ok(baris, `${nama} tanpa baris asal`);
    assert.ok(baris.includes(`| ${l.lisensi} |`), `${nama}: lisensi di PROVENANCE beda`);
    const hash = createHash("sha256").update(readFileSync(berkas(l))).digest("hex").slice(0, 16);
    assert.ok(baris.endsWith(`| ${hash} |`), `${nama}: berkas berubah tanpa catatan baru`);
  }
});

test("setiap lagu dikredit di credits.txt dan di buklet CD", () => {
  const kredit = baca("public/credits.txt");
  for (const l of LAGU) {
    assert.ok(kredit.includes(`"${l.judul}", ${l.artis}`), `${l.judul} tidak dikredit`);
    assert.ok(kredit.includes(`${l.lisensi} (${l.urlLisensi})`), `${l.judul}: lisensi tidak dikredit`);
  }
  assert.doesNotMatch(kredit, /spotify/i);
  assert.equal(albumMusik.daftarLagu.length, LAGU.length);
  albumMusik.daftarLagu.forEach((d, i) => {
    assert.equal(d.judul, LAGU[i].judul);
    assert.ok(d.artis.endsWith(`, ${LAGU[i].lisensi}`), `${d.judul}: lisensi tidak tampil di buklet`);
  });
});

test("pemutar memuat berkas hanya setelah ditekan, lalu lanjut ke lagu berikutnya", () => {
  const src = baca("components/musik/PemutarMusik.jsx");
  assert.match(src, /a\.preload = "none";/);
  // Elemen audio dibuat di dalam putar, bukan saat halaman dimuat.
  assert.match(src, /const putar = useCallback\(\(\) => \{\s*mauPutar\.current = true;\s*const a = elemen\(\);/);
  // Ganti lagu hanya memutar bila pengunjung memang sedang memutar.
  assert.match(src, /if \(mauPutar\.current\) a\.play\(\)/);
  assert.match(src, /a\.addEventListener\("ended", berikutnya\);/);
  assert.match(src, /\(i \+ 1\) % LAGU\.length/);
  // Berkas rusak dilewati, tapi tidak berputar tanpa akhir saat semuanya gagal.
  assert.match(src, /if \(mauPutar\.current && gagalBeruntun\.current < LAGU\.length\) berikutnya\(\);/);
  // Atribusi terlihat selama lagu diputar.
  assert.match(src, /<span className="vinyl-meta__artist" title=\{lagu\.artis\}>\{lagu\.artis\}<\/span>/);
  assert.match(src, /<a className="vinyl-meta__lisensi" href=\{lagu\.urlLisensi\}[^>]*>\s*\{lagu\.lisensi === "Public domain" \? t\("domainPublik"\) : lagu\.lisensi\}\s*<\/a>/);
  assert.match(src, /"mediaSession" in navigator/);
});

test("tidak ada lagi kode atau kunci Spotify", () => {
  const telusuri = (dir) =>
    readdirSync(new URL(dir, akar)).flatMap((f) => {
      const p = `${dir}${f}`;
      return statSync(new URL(p, akar)).isDirectory() ? telusuri(`${p}/`) : [p];
    });
  for (const p of [...telusuri("components/"), ...telusuri("app/"), ...telusuri("content/")]) {
    if (!/\.(jsx?|mjs|css)$/.test(p)) continue;
    assert.doesNotMatch(baca(p), /spotify/i, p);
  }
  assert.doesNotMatch(baca(".env.example"), /SPOTIFY/);
  for (const lang of ["id", "en"]) {
    const m = JSON.parse(baca(`messages/${lang}.json`)).pemutar;
    assert.ok(m.berikutnya?.trim(), `${lang}: label lagu berikutnya`);
    assert.ok(m.domainPublik?.trim(), `${lang}: label domain publik`);
    assert.doesNotMatch(JSON.stringify(m), /spotify/i, lang);
  }
});
