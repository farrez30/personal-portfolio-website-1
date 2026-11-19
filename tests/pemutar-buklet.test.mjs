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
  assert.match(src, /const sembunyi = tersembunyi \|\| dilipat \|\| \(lipatOtomatis && !dibukaManual\);/);
  // Panel dan tombol buka kembali memakai keadaan gabungan, bukan hanya pilihan pengguna.
  assert.match(src, /\$\{sembunyi \? "is-hidden" : ""\}/);
  assert.match(src, /\$\{sembunyi \? "is-shown" : ""\}/);
  assert.match(src, /inert=\{sembunyi \? true : undefined\}/);
  // Membuka manual selama buklet menang atas lipatan otomatis.
  assert.match(src, /setTersembunyi\(false\);\s*setDilipat\(false\);/);
  // Embed tidak bergantung pada lipatan, jadi musik tidak berhenti.
  assert.match(src, /className="vinyl-embed" hidden=\{!tersambung\}/);
});

test("pemutar menciut ke cakram selama cerita gulir tampil, dan bisa dibuka lagi di dalamnya", () => {
  const src = baca("components/musik/PemutarMusik.jsx");
  assert.match(src, /addEventListener\("cerita", dengar\)/);
  assert.match(src, /setDiCerita\(!!e\.detail\?\.tampil\)/);
  // Pindah zona (masuk atau keluar cerita, lewat atau kembali ke hero) mengembalikan lipatan otomatis.
  assert.match(src, /useEffect\(\(\) => setDibukaManual\(false\), \[diCerita, lewatHero\]\);/);
  assert.match(src, /if \(lipatOtomatis\) setDibukaManual\(true\);/);
  const cerita = baca("components/cerita/CeritaKerja.jsx");
  assert.match(cerita, /new CustomEvent\("cerita", \{ detail: \{ tampil: e\.isIntersecting \} \}\)/);
  // Saat cerita dibongkar, pemutar tidak boleh tertinggal menciut.
  assert.match(cerita, /new CustomEvent\("cerita", \{ detail: \{ tampil: false \} \}\)/);
  const css = baca("components/musik/pemutar.css");
  assert.match(css, /\.vinyl-reopen--lipat \{[^}]*top: 4\.75rem;/);
});

// Di HP panel menutupi judul rak, klien, dan kontak (audit 19 Nov 2026), jadi begitu hero lewat
// panel menciut ke cakram kanan atas, di bawah tautan kepala panggung. Musik tetap jalan.
test("di HP pemutar menciut ke cakram begitu hero lewat, cakramnya di kanan atas", () => {
  const src = baca("components/musik/PemutarMusik.jsx");
  assert.match(src, /const sembunyi = tersembunyi \|\| dilipat \|\| \(lipatOtomatis && !dibukaManual\);/);
  // Di HP embed Spotify yang tersambung membuat panel setinggi 300 px dan menutupi judul hero,
  // jadi hero ikut melipat; panel yang baru saja dipakai (putar, pasang tautan) tetap terbuka.
  assert.match(src, /const lipatOtomatis = diCerita \|\| lewatHero \|\| \(layarHp && tersambung\);/);
  assert.match(src, /setDibukaManual\(true\);\s*if \(jalan\) jeda\(\);\s*else putar\(\);/);
  assert.match(src, /setDibukaManual\(true\);\s*mauPutar\.current = true;\s*setTersambung\(true\);/);
  assert.match(src, /setLayarHp\(hp\.matches\);/);
  // Hanya layar HP, dan diamati ulang tiap path berganti karena pemutar hidup di layout.
  assert.match(src, /matchMedia\("\(max-width: 600px\)"\)/);
  assert.match(src, /document\.querySelector\("\.gerbang"\)/);
  assert.match(src, /\}, \[pathname\]\);/);
  // Halaman tanpa hero (proyek) tidak melipat panel.
  assert.match(src, /if \(!hero \|\| !hp\.matches\) return setLewatHero\(false\);/);
  assert.match(src, /vinyl-reopen--lipat/);
  assert.match(src, /vinyl-player--lipat/);
  // Embed tetap di dokumen, jadi musik tidak berhenti saat melipat.
  assert.match(src, /className="vinyl-embed" hidden=\{!tersambung\}/);

  const css = baca("components/musik/pemutar.css");
  const hp = css.slice(css.lastIndexOf("@media screen and (max-width: 600px)"));
  assert.match(hp, /\.vinyl-reopen--lipat \{[^}]*right: 0\.75rem;[^}]*top: 7\.25rem;/);
  // Panel yang dibuka dari cakram muncul di dekat cakram, bukan di kiri bawah (mode Ringan).
  assert.match(hp, /\.vinyl-player--lipat \{[^}]*right: 0\.75rem;[^}]*top: 6\.5rem;/);
  // Di layar sentuh warna hover tertinggal di cakram sesudah diketuk.
  assert.match(css, /@media \(hover: hover\) \{\s*\.vinyl-btn:hover,\s*\.vinyl-reopen:hover \{/);
  assert.doesNotMatch(css.replace(/@media \(hover: hover\) \{[\s\S]*?\n\}/, ""), /\.vinyl-(btn|reopen):hover/);
});

// Di HP embed Spotify hanya memutar cuplikan walau pengunjung sudah login (laporan Farrez dan
// forum developer Spotify, 19 Nov 2026), jadi petunjuk login dan cookie tidak menolong di sana.
test("di layar sentuh petunjuk cuplikan mengajak ke aplikasi Spotify, bukan login", () => {
  const src = baca("components/musik/PemutarMusik.jsx");
  assert.match(src, /matchMedia\("\(pointer: coarse\)"\)/);
  assert.match(src, /t\.rich\(sentuh \? "cuplikanHp" : "cuplikan", \{/);
  assert.match(src, /buka: \(isi\) => \(\s*<a href=\{url\} target="_blank" rel="noopener noreferrer">/);
  for (const bahasa of ["id", "en"]) {
    const m = JSON.parse(baca(`messages/${bahasa}.json`)).pemutar;
    assert.match(m.cuplikanHp, /<buka>[^<]+<\/buka>/, bahasa);
    assert.doesNotMatch(m.cuplikanHp, /<login>|cookie/i, bahasa);
  }
});
