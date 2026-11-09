// Klip demo di layar hologram: berkasnya ada, asalnya tercatat, dan hanya dipakai bila
// situs proyek tidak bisa dibingkai langsung.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { DEMO, demoUntuk } from "../content/demo.js";
import { proyek } from "../content/proyek.js";

const akar = new URL("../", import.meta.url);
const baca = (p) => readFileSync(new URL(p, akar), "utf8");

test("setiap klip demo milik proyek yang ada, berkasnya ada dan tidak terlalu besar", () => {
  const slug = new Set(proyek.map((p) => p.slug));
  for (const [s, d] of Object.entries(DEMO)) {
    assert.ok(slug.has(s), `${s} bukan proyek`);
    assert.ok(["rekaman", "gulir", "sinematik"].includes(d.jenis), `${s}: jenis ${d.jenis}`);
    for (const k of ["desktop", "hp"]) {
      assert.match(d[k], /^\/assets\/demo\/[a-z-]+\.mp4$/, `${s}.${k}`);
      const url = new URL(`public${d[k]}`, akar);
      assert.ok(existsSync(url), `${d[k]} tidak ada`);
      assert.ok(statSync(url).size < 3_000_000, `${d[k]} lebih dari 3 MB`);
    }
  }
  assert.equal(demoUntuk("tidak-ada"), null);
});

test("asal setiap klip tercatat di PROVENANCE.md", () => {
  const prov = baca("public/assets/demo/PROVENANCE.md");
  for (const d of Object.values(DEMO)) {
    for (const k of ["desktop", "hp"]) {
      const nama = d[k].split("/").pop();
      assert.match(prov, new RegExp(`\\| ${nama.replace(".", "\\.")} \\| ${d.jenis} \\|`), `${nama} tanpa asal`);
    }
  }
});

test("hologram: situs langsung > klip demo > gambar, klip bisu dan ikut Play/Pause", () => {
  const src = baca("components/imersif/Hologram.jsx");
  assert.match(src, /const demo = langsung \? null : \(demoUntuk\(p\.slug\)\?\.\[perangkat\] \?\? null\);/);
  assert.match(src, /<video[\s\S]*?muted[\s\S]*?loop[\s\S]*?playsInline[\s\S]*?preload="metadata"/);
  assert.match(src, /poster=\{gambar \?\? undefined\}/);
  // Gerak dikurangi: tidak diputar sendiri.
  assert.match(src, /!matchMedia\("\(prefers-reduced-motion: reduce\)"\)\.matches\) v\.play\(\)/);
  assert.match(src, /else v\.pause\(\);/);
});
