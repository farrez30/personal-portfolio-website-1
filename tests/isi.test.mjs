// Pagar untuk isi situs: kunci terjemahan, data album, dan aturan privasi di
// content/proyek.js. Tes ini yang menangkap kunci i18n yang hilang di satu bahasa.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { proyek, HALAMAN, halamanTampil, cariProyek } from "../content/proyek.js";
import { albumMusik } from "../content/musik.js";

const akar = new URL("../", import.meta.url);
const baca = (p) => JSON.parse(readFileSync(new URL(p, akar), "utf8"));

function kunci(obj, awal = "") {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === "object" ? kunci(v, `${awal}${k}.`) : [`${awal}${k}`],
  );
}

test("messages/id.json dan en.json punya kunci yang sama persis", () => {
  const id = new Set(kunci(baca("messages/id.json")));
  const en = new Set(kunci(baca("messages/en.json")));
  assert.deepEqual([...id].filter((k) => !en.has(k)), [], "ada di id, tidak ada di en");
  assert.deepEqual([...en].filter((k) => !id.has(k)), [], "ada di en, tidak ada di id");
});

test("setiap kunci t(...) di komponen ada di messages", () => {
  const id = new Set(kunci(baca("messages/id.json")));
  // Pasangan namespace dan berkas dibaca dari pemanggilan useTranslations di tiap komponen.
  const berkas = ["components/imersif/Hologram.jsx", "components/imersif/Panggung.jsx", "components/album/AlbumIsi.jsx"];
  for (const b of berkas) {
    const src = readFileSync(new URL(b, akar), "utf8");
    const ns = /useTranslations\("([^"]+)"\)/.exec(src)?.[1];
    assert.ok(ns, `${b} tanpa useTranslations`);
    for (const [, k] of src.matchAll(/\bt\("([a-zA-Z.]+)"/g)) {
      assert.ok(id.has(`${ns}.${k}`), `${b}: ${ns}.${k} tidak ada di messages`);
    }
    // Kunci yang dipilih lewat ternary: t(x ? "a" : "b").
    for (const [, k1, k2] of src.matchAll(/\bt\([^()"]*\?\s*"([a-zA-Z.]+)"\s*:\s*"([a-zA-Z.]+)"\)/g)) {
      for (const k of [k1, k2]) assert.ok(id.has(`${ns}.${k}`), `${b}: ${ns}.${k} tidak ada di messages`);
    }
  }
});

test("slug dan nomor katalog unik, termasuk CD musik", () => {
  const semua = [...proyek, albumMusik];
  assert.equal(new Set(semua.map((p) => p.slug)).size, semua.length);
  assert.equal(new Set(semua.map((p) => p.katalog)).size, semua.length);
  for (const p of proyek) assert.match(p.katalog, /^FRZ-\d{2}$/);
});

test("setiap album punya judul dan ringkasan dua bahasa", () => {
  for (const p of [...proyek, albumMusik]) {
    for (const l of ["id", "en"]) {
      assert.ok(p.judul[l]?.trim(), `${p.slug}: judul ${l} kosong`);
      assert.ok(p.ringkas[l]?.trim(), `${p.slug}: ringkas ${l} kosong`);
    }
  }
});

test("berkas ilustrasi dan tangkapan layar yang dirujuk benar-benar ada", () => {
  for (const p of proyek) {
    const rujukan = [p.ilustrasi, ...Object.values(p.layar ?? {})].filter(Boolean);
    for (const r of rujukan) assert.ok(existsSync(new URL(`public${r}`, akar)), `${p.slug}: ${r} tidak ada`);
  }
});

test("halaman buklet yang tampil hanya yang sudah terisi, urut sesuai HALAMAN", () => {
  const contoh = { buklet: { challenge: null, decisions: "x", solution: null, delivery: null, outcome: "y" } };
  assert.deepEqual(halamanTampil(contoh), ["decisions", "outcome"]);
  for (const p of proyek) assert.deepEqual(Object.keys(p.buklet).sort(), [...HALAMAN].sort());
});

test("cariProyek mengembalikan null untuk slug yang tidak dikenal", () => {
  assert.equal(cariProyek("tidak-ada"), null);
  assert.equal(cariProyek(proyek[0].slug), proyek[0]);
});

test("iframe hanya untuk proyek yang punya situs", () => {
  for (const p of proyek.filter((x) => x.tanam)) assert.ok(p.tautan.situs, `${p.slug}: tanam tanpa situs`);
});

test("tautan case study hanya ke halaman coderoach.id/work milik album itu", () => {
  for (const p of proyek.filter((x) => x.tautan.kasus)) {
    assert.equal(p.tautan.kasus, `https://coderoach.id/work/${p.slug}`, `${p.slug}: tautan kasus`);
  }
});

test("ERP klien dan Viralytics tidak bertautan keluar sebelum ada izin", () => {
  // ERP: nama klien disamarkan. Viralytics: menunggu izin mitra.
  for (const slug of ["erp-software-house", "viralytics"]) {
    assert.deepEqual(cariProyek(slug).tautan, {}, `${slug} punya tautan`);
    assert.equal(cariProyek(slug).layar, undefined, `${slug} punya tangkapan layar`);
  }
});

test("tiap tangkapan layar punya pasangan desktop dan HP", () => {
  for (const p of proyek.filter((x) => x.layar)) assert.deepEqual(Object.keys(p.layar).sort(), ["desktop", "hp"], p.slug);
});
