// Klip demo di layar hologram: berkasnya ada, asalnya tercatat, dan hanya dipakai bila
// situs proyek tidak bisa dibingkai langsung.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { DEMO, demoUntuk, EXPLAINER, explainerUntuk } from "../content/demo.js";
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

test("hologram: explainer > situs langsung > klip demo > gambar, dan ikut Play/Pause", () => {
  const src = baca("components/imersif/Hologram.jsx");
  assert.match(src, /const explainer = explainerUntuk\(p\.slug, locale\);/);
  assert.match(src, /const langsung = bisaLangsung && \(!explainer \|\| pakaiSitus\);/);
  assert.match(src, /const demo = langsung \? null : \(explainer \?\? demoUntuk\(p\.slug\)\?\.\[perangkat\] \?\? null\);/);
  assert.match(src, /<video[\s\S]*?muted[\s\S]*?loop=\{!narasi\}[\s\S]*?playsInline[\s\S]*?preload="metadata"/);
  assert.match(src, /poster=\{gambar \?\? undefined\}/);
  // Klip demo selalu bisu dan tidak diputar sendiri bila gerak dikurangi; explainer
  // bersuara kecuali dibisukan, dan jatuh ke bisu bila peramban menolak suara.
  assert.match(src, /v\.muted = !narasi \|\| bisu;/);
  assert.match(src, /\(narasi \|\| !matchMedia\("\(prefers-reduced-motion: reduce\)"\)\.matches\)/);
  assert.match(src, /v\.muted = true;\s*setBisu\(true\);/);
  assert.match(src, /else v\.pause\(\);/);
});

test("explainer: semua proyek punya berkas ID dan EN, kecil, dan asalnya tercatat", () => {
  const slug = proyek.map((p) => p.slug);
  assert.deepEqual([...EXPLAINER].sort(), [...slug].sort(), "setiap proyek punya explainer");
  const prov = baca("public/assets/demo/PROVENANCE.md");
  for (const s of EXPLAINER) {
    for (const lang of ["id", "en"]) {
      const jalur = explainerUntuk(s, lang);
      assert.equal(jalur, `/assets/demo/explainer/${s}-${lang}.mp4`);
      const url = new URL(`public${jalur}`, akar);
      assert.ok(existsSync(url), `${jalur} tidak ada`);
      const besar = statSync(url).size;
      assert.ok(besar > 500_000 && besar < 6_000_000, `${jalur} ${besar} byte`);
      assert.match(prov, new RegExp(`\| explainer/${s}-${lang}\.mp4 \| explainer \|`), `${jalur} tanpa asal`);
    }
  }
});

test("explainerUntuk: bahasa selain id jatuh ke en, proyek tak dikenal null", () => {
  assert.equal(explainerUntuk("jeda", "id"), "/assets/demo/explainer/jeda-id.mp4");
  assert.equal(explainerUntuk("jeda", "en"), "/assets/demo/explainer/jeda-en.mp4");
  assert.equal(explainerUntuk("jeda", "ja"), "/assets/demo/explainer/jeda-en.mp4");
  assert.equal(explainerUntuk("tidak-ada", "id"), null);
});

test("explainer bersuara menjeda Spotify dan melanjutkannya sesudahnya", () => {
  const holo = baca("components/imersif/Hologram.jsx");
  // Sinyal redam dikirim selama bersuara dan dicabut di cleanup (berhenti, bisu, CD keluar).
  assert.match(holo, /const bersuara = narasi && main && !bisu;/);
  assert.match(holo, /if \(!bersuara\) return;\s*window\.dispatchEvent\(new CustomEvent\("musik:redam", \{ detail: \{ redam: true \} \}\)\);\s*return \(\) => window\.dispatchEvent\(new CustomEvent\("musik:redam", \{ detail: \{ redam: false \} \}\)\);/);
  assert.match(holo, /onPlay=\{\(\) => setMain\(true\)\}/);
  assert.match(holo, /onPause=\{\(\) => setMain\(false\)\}/);
  assert.match(holo, /onEnded=\{\(\) => setMain\(false\)\}/);
  const musik = baca("components/musik/PemutarMusik.jsx");
  assert.match(musik, /window\.addEventListener\("musik:redam", dengar\)/);
  // Hanya lagu yang memang sedang jalan yang dilanjutkan lagi.
  assert.match(musik, /if \(!mauPutar\.current\) return;\s*diredam\.current = true;\s*jeda\(\);/);
  assert.match(musik, /else if \(diredam\.current\) \{\s*diredam\.current = false;\s*putar\(\);/);
});

test("tombol bisu dan situs langsung punya label di semua bahasa", () => {
  for (const lang of ["id", "en"]) {
    const m = JSON.parse(baca(`messages/${lang}.json`)).panggung.layar;
    for (const k of ["bisukan", "bunyikan", "situsLangsung"]) assert.ok(m[k]?.trim(), `${lang}: ${k}`);
  }
  const holo = baca("components/imersif/Hologram.jsx");
  assert.match(holo, /aria-pressed=\{bisu\}/);
  assert.match(holo, /aria-pressed=\{pakaiSitus\}/);
});
