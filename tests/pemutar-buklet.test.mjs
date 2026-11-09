// Panel musik tidak boleh menutupi kolom teks buklet: dilipat selama buklet dibaca,
// kembali sendiri saat ditutup, dan musiknya tetap jalan (embed tidak dilepas).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const baca = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("panggung mengumumkan keadaannya, dan kembali ke rak saat dilepas", () => {
  const src = baca("components/imersif/Panggung.jsx");
  assert.match(src, /new CustomEvent\("panggung", \{ detail: \{ keadaan: s\.keadaan \} \}\)/);
  assert.match(src, /\[s\.keadaan\]\);/);
  assert.match(src, /\(\) => \(\) => window\.dispatchEvent\(new CustomEvent\("panggung", \{ detail: \{ keadaan: "rak" \} \}\)\)/);
});

test("pemutar melipat panel hanya selama buklet, terpisah dari pilihan pengguna", () => {
  const src = baca("components/musik/PemutarMusik.jsx");
  assert.match(src, /setDilipat\(e\.detail\?\.keadaan === "buklet"\)/);
  assert.match(src, /const sembunyi = tersembunyi \|\| dilipat;/);
  // Panel dan tombol buka kembali memakai keadaan gabungan, bukan hanya pilihan pengguna.
  assert.match(src, /\$\{sembunyi \? "is-hidden" : ""\}/);
  assert.match(src, /\$\{sembunyi \? "is-shown" : ""\}/);
  assert.match(src, /inert=\{sembunyi \? true : undefined\}/);
  // Membuka manual selama buklet menang atas lipatan otomatis.
  assert.match(src, /setTersembunyi\(false\);\s*setDilipat\(false\);/);
  // Embed tidak bergantung pada lipatan, jadi musik tidak berhenti.
  assert.match(src, /className="vinyl-embed" hidden=\{!tersambung\}/);
});
