// Seksi klien dan partner: isi data, aset, terjemahan, dan bentuk cincin.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { KLIEN, KELOMPOK, klienKelompok, cakramDepan } from "../content/klien.js";
import { bentukCincin, kemajuanSeksi, MEKAR, PUTAR } from "../components/klien/cincin.js";

const akar = new URL("../", import.meta.url);
const ada = (p) => existsSync(new URL(`public${p}`, akar));
const baca = (p) => readFileSync(new URL(p, akar), "utf8");
const pesan = { id: JSON.parse(baca("messages/id.json")).klien, en: JSON.parse(baca("messages/en.json")).klien };
const semua = KLIEN.flatMap((k) => [k, ...(k.anak ?? [])]);

test("tiap kelompok punya cakram dan logo induk yang ada di public/", () => {
  for (const k of KELOMPOK) {
    assert.ok(klienKelompok(k.slug).length >= 3, k.slug);
    assert.ok(ada(k.induk), k.induk);
  }
});

test("slug unik dan setiap cakram, termasuk anak box set, punya berkas gambar", () => {
  const slug = semua.map((k) => k.slug);
  assert.equal(new Set(slug).size, slug.length);
  for (const k of semua) assert.ok(ada(k.cakram), `${k.slug}: ${k.cakram}`);
});

test("asal setiap berkas cakram tercatat di PROVENANCE.md", () => {
  const prov = baca("public/assets/klien/cakram/PROVENANCE.md");
  for (const k of semua) {
    const nama = k.cakram.split("/").pop().replace(".webp", "");
    const kunci = nama.startsWith("pribadi-") ? "pribadi-" : nama;
    assert.ok(prov.includes(kunci), `${nama} tidak ada di PROVENANCE`);
  }
});

test("industri dan kerja ditulis dalam dua bahasa, jenis kerja punya terjemahan", () => {
  for (const k of semua) {
    for (const b of ["id", "en"]) {
      assert.ok(k.industri?.[b], `${k.slug} industri ${b}`);
      if (k.kerja) assert.ok(k.kerja[b], `${k.slug} kerja ${b}`);
      for (const j of k.jenis) assert.ok(pesan[b].jenis[j], `${k.slug} jenis ${j} (${b})`);
    }
  }
});

test("klien studio dan kantor selalu punya keterangan pekerjaan", () => {
  for (const k of semua.filter((x) => x.kelompok !== "pribadi")) assert.ok(k.kerja, k.slug);
});

test("tautan keluar hanya ke studi kasus coderoach.id", () => {
  for (const k of semua.filter((x) => x.tautan)) {
    assert.match(k.tautan, /^https:\/\/coderoach\.id\/work\/[a-z0-9-]+$/, k.slug);
  }
});

test("Masaya Food adalah box set Chicken Wow dan Geprek Wow", () => {
  const m = KLIEN.find((k) => k.slug === "masaya-food");
  assert.deepEqual(m.anak.map((a) => a.slug), ["chicken-wow", "geprek-wow"]);
});

test("cakramDepan memilih cakram terdekat ke depan dan membungkus putaran", () => {
  assert.equal(cakramDepan(0, 6), 0);
  assert.equal(cakramDepan(60, 6), 1);
  assert.equal(cakramDepan(359, 6), 0);
  assert.equal(cakramDepan(-60, 6), 5);
  assert.equal(cakramDepan(720 + 120, 6), 2);
  assert.equal(cakramDepan(29, 6), 0);
  assert.equal(cakramDepan(31, 6), 1);
  assert.equal(cakramDepan(10, 0), -1);
});

test("kemajuanSeksi 0 di atas seksi, 1 di ujung pin, dan aman untuk seksi pendek", () => {
  assert.equal(kemajuanSeksi({ top: 100, height: 2600 }, 1000), 0);
  assert.equal(kemajuanSeksi({ top: -800, height: 2600 }, 1000), 0.5);
  assert.equal(kemajuanSeksi({ top: -5000, height: 2600 }, 1000), 1);
  assert.equal(kemajuanSeksi({ top: -10, height: 900 }, 1000), 0);
});

test("cincin: tumpukan di awal, mekar penuh di akhir fase mekar, satu putaran di akhir", () => {
  const r = 200;
  const awal = bentukCincin(0, 8, 0, r);
  for (const c of awal.cakram) assert.ok(Math.abs(c.x) < 0.5, `x ${c.x}`);

  const mekar = bentukCincin(MEKAR, 8, 0, r);
  const maks = Math.max(...mekar.cakram.map((c) => Math.abs(c.x)));
  assert.ok(Math.abs(maks - r) < 1, `jari-jari ${maks}`);
  assert.equal(mekar.depan, 0);

  const akhir = bentukCincin(MEKAR + PUTAR, 8, 0, r);
  assert.ok(Math.abs(akhir.putaran - 1) < 1e-9);
  assert.equal(akhir.depan, 0);

  // Sama persis bila dihitung ulang: gulir balik memberi bingkai yang sama.
  assert.deepEqual(bentukCincin(0.4, 8, 0.1, r), bentukCincin(0.4, 8, 0.1, r));
});

test("cakram depan paling besar dan paling atas lapisnya setelah mekar", () => {
  const b = bentukCincin(0.5, 7, 0, 200);
  const d = b.cakram[b.depan];
  for (const [i, c] of b.cakram.entries()) {
    if (i === b.depan) continue;
    assert.ok(d.skala >= c.skala, `skala ${i}`);
    assert.ok(d.lapis >= c.lapis, `lapis ${i}`);
  }
});
