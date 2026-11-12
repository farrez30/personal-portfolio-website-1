// Pagar untuk cerita gulir (content/cerita.js) dan wizard kontak (components/contact/brief.js).
// Klaim di cerita dihitung ulang dari content/proyek.js, jadi angka di kalimat tidak bisa
// basi diam-diam saat proyek ditambah atau halaman arsitekturnya dibuka.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { BAB } from "../content/cerita.js";
import { proyek, cariProyek } from "../content/proyek.js";
import {
  PERTANYAAN,
  BATAS_ANGGARAN,
  labelAnggaran,
  rupiah,
  sapaanUntuk,
  susunBrief,
} from "../components/contact/brief.js";

const akar = new URL("../", import.meta.url);
const baca = (p) => readFileSync(new URL(p, akar), "utf8");
const pesan = (lang) => JSON.parse(baca(`messages/${lang}.json`));

test("sepuluh bab dengan urutan dari keluhan sampai rilis", () => {
  assert.deepEqual(
    BAB.map((b) => b.id),
    ["ide", "rencana", "bentuk", "fondasi", "bangun", "progres", "rapi", "andal", "aman", "rilis"],
  );
});

test("setiap bab punya judul dan isi dua bahasa", () => {
  for (const b of BAB) {
    for (const lang of ["id", "en"]) {
      assert.ok(b.judul[lang]?.trim(), `${b.id}: judul ${lang} kosong`);
      assert.ok(b.isi[lang]?.trim(), `${b.id}: isi ${lang} kosong`);
    }
  }
});

test("setiap bukti dan keluhan menaut ke proyek yang ada di rak", () => {
  for (const b of BAB) {
    for (const slug of [...(b.bukti ?? []), ...(b.keluhan ?? []).map((k) => k.slug)]) {
      assert.ok(cariProyek(slug), `${b.id}: proyek ${slug} tidak ada`);
    }
    for (const k of b.keluhan ?? []) assert.ok(k.id && k.en, `keluhan ${k.slug} belum dua bahasa`);
  }
});

test("angka di kalimat cocok dengan isi rak", () => {
  const angka = { 10: ["Sepuluh", "Ten"] };
  const rak = BAB.find((b) => b.id === "rilis");
  assert.ok(rak.isi.id.startsWith(angka[proyek.length][0]));
  assert.ok(rak.isi.en.startsWith(angka[proyek.length][1]));
});

test("isi bab memakai keadaan umum, nama proyek hanya di tautan bukti", () => {
  // Masukan Farrez 13 Nov 2026: pemilik usaha belum kenal Jeda, YiheeCam, atau AkarKita, jadi
  // nama itu tidak berarti apa pun di kalimat utama. Nama proyek tetap boleh di daftar keluhan
  // dan tautan bukti, karena di situ ia tautan, bukan isi kalimat.
  const nama = proyek.flatMap((p) => [p.judul.id, p.judul.en, p.slug.replace(/-/g, " ")]);
  for (const b of BAB)
    for (const lang of ["id", "en"])
      for (const n of nama) assert.ok(!b.isi[lang].toLowerCase().includes(n.toLowerCase()), `${b.id} ${lang} menyebut ${n}`);
});

test("tautan luar bab menuju halaman https", () => {
  for (const b of BAB)
    for (const l of b.luar ?? []) {
      assert.ok(l.nama, `${b.id}: tautan luar tanpa nama`);
      assert.match(l.href, /^https:\/\//, `${b.id}: ${l.href}`);
    }
});

test("istilah tahap film tidak tampil di teks halaman", () => {
  // Soundstage hanya kerangka visual; pembaca tidak perlu tahu nama tahap produksi film.
  const film = /(syuting|editing|color grading|test screening|storyboard|naskah|shooting)/i;
  for (const b of BAB)
    for (const lang of ["id", "en"]) {
      assert.doesNotMatch(b.judul[lang], film, `${b.id}: judul ${lang}`);
      assert.doesNotMatch(b.isi[lang], film, `${b.id}: isi ${lang}`);
    }
});

test("mode Ringan memakai render dunia 3D untuk tiap bab, bukan styleframe", () => {
  const src = baca("components/cerita/CeritaKerja.jsx");
  assert.match(src, /src=\{`\/assets\/cerita\/\$\{b\.id\}\.webp`\}/);
  for (const b of BAB) readFileSync(new URL(`public/assets/cerita/${b.id}.webp`, akar));
  // Panggung styleframe v3 sudah dilepas dari beranda.
  assert.doesNotMatch(src, /PanggungCerita|from "\.\/naskah"/);
  const ada = readdirSync(new URL("components/cerita/", akar));
  assert.ok(!ada.includes("PanggungCerita.jsx") && !ada.includes("dunia.js"), "sisa panggung v3");
});

test("tinggi blok tersedia untuk pembuka dan setiap bab", () => {
  const src = baca("components/cerita/CeritaKerja.jsx");
  const m = src.match(/const BOBOT = (\{[^}]*\});/);
  assert.ok(m, "BOBOT tidak ditemukan");
  const bobot = Function(`return ${m[1]}`)();
  for (const id of ["pembuka", ...BAB.map((b) => b.id)]) assert.ok(bobot[id] >= 0.8 && bobot[id] <= 3, id);
});

test("cerita ada di antara hero dan rak", () => {
  const src = baca("app/[locale]/page.jsx");
  const i = (s) => src.indexOf(s);
  assert.ok(i("<Gerbang") < i("<CeritaKerja") && i("<CeritaKerja") < i("<RakSesuaiMode"));
});

test("kunci t(...) di cerita dan kontak ada di kedua bahasa", () => {
  const datar = (o, a = "") =>
    Object.entries(o).flatMap(([k, v]) => (v && typeof v === "object" ? datar(v, `${a}${k}.`) : [`${a}${k}`]));
  for (const lang of ["id", "en"]) {
    const ada = new Set(datar(pesan(lang)));
    for (const [berkas, ns] of [
      ["components/cerita/CeritaKerja.jsx", "cerita"],
      ["components/contact/Contact.jsx", "kontak"],
    ]) {
      for (const [, k] of baca(berkas).matchAll(/\bt\("([a-zA-Z.]+)"/g)) {
        assert.ok(ada.has(`${ns}.${k}`), `${lang}: ${ns}.${k} hilang`);
      }
    }
    for (const q of PERTANYAAN) {
      assert.ok(ada.has(`kontak.${q.kunci}.judul`), `${lang}: judul ${q.kunci}`);
      for (const v of q.pilihan) {
        const kunci = q.kunci === "anggaran" ? labelAnggaran(v, lang)[0] : `${q.kunci}.${v}`;
        assert.ok(ada.has(`kontak.${kunci}`), `${lang}: kontak.${kunci} hilang`);
      }
    }
    for (const s of ["pagi", "siang", "sore", "malam"]) assert.ok(ada.has(`kontak.sapa.${s}`));
  }
});

test("sapaan mengikuti jam lokal di batas-batasnya", () => {
  const harap = { 0: "malam", 3: "malam", 4: "pagi", 10: "pagi", 11: "siang", 14: "siang", 15: "sore", 17: "sore", 18: "malam", 23: "malam" };
  for (const [jam, s] of Object.entries(harap)) assert.equal(sapaanUntuk(Number(jam)), s, `jam ${jam}`);
});

test("pita anggaran bersambung tanpa celah dan memakai format rupiah", () => {
  assert.deepEqual(BATAS_ANGGARAN, [...BATAS_ANGGARAN].sort((a, b) => a - b));
  const [, a1] = labelAnggaran("antara1", "id");
  const [, a2] = labelAnggaran("antara2", "id");
  assert.equal(a1.b, a2.a);
  assert.equal(labelAnggaran("bawah", "id")[1].a, a1.a);
  assert.equal(labelAnggaran("atas", "id")[1].a, a2.b);
  // Pemisah dan singkatan dari Intl, bukan dirakit tangan.
  assert.match(rupiah(10_000_000, "id"), /^Rp\s10\sjt$/);
  assert.match(rupiah(150_000_000, "en"), /^IDR\s?150M$/);
});

test("brief hanya memuat pertanyaan yang dijawab, berurutan", () => {
  const label = (k, v) => `${k}=${v}`;
  assert.equal(susunBrief({}, label), "");
  assert.equal(susunBrief({ waktu: "bulanIni", kebutuhan: "android" }, label), "- kebutuhan=android\n- waktu=bulanIni");
  assert.equal(susunBrief({ pemakai: undefined, anggaran: "belum" }, label), "- anggaran=belum");
});

test("teks bab di HP tidak dikurung kotak yang menggulir sendiri", () => {
  // Kotak 46svh dengan overflow auto menyembunyikan ujung bab 9 di layar 375 px.
  const css = baca("components/cerita/cerita.css");
  for (const aturan of css.matchAll(/\.cerita-kerja--dunia \.bab__teks \{([^}]*)\}/g)) {
    assert.doesNotMatch(aturan[1], /max-height|overflow\s*:\s*(auto|scroll|hidden)/);
  }
  // Bayangan selebar desktop (inset negatif) membuat halaman HP lebih lebar dari layar.
  assert.match(css, /@media \(max-width: 47\.99rem\) \{[^@]*\.cerita-kerja--dunia \.bab__teks::before \{\s*inset: 0;/);
});

test("teks bab di layar pendek tetap utuh, di atas kabut gelapnya sendiri", () => {
  const css = baca("components/cerita/cerita.css");
  // clamp() dengan tiga nilai bersatuan sama selalu jatuh ke nilai tengah; posisi tempel harus
  // bergantung pada tinggi kotak.
  assert.doesNotMatch(css, /top: clamp\(40svh, 52svh, 60svh\)/);
  assert.match(css, /top: max\(4\.5rem, min\(52svh, calc\(100svh - var\(--tinggi, 0px\) - 1\.5rem\)\)\);/);
  assert.match(baca("components/cerita/CeritaKerja.jsx"), /style\.setProperty\("--tinggi"/);
  // Sejak v4 tidak ada lagi layar yang memutih ke beige: teks dan cincin fokus selalu bernilai
  // tema gelap di atas kabutnya sendiri.
  assert.doesNotMatch(css, /var\(--putih\)/);
  assert.match(css, /--fokus: #f0b35a;/);
});

test("penanda bab: sepuluh tombol berlabel, satu aktif, dan bisa dijangkau keyboard hanya saat tampil", () => {
  const src = baca("components/cerita/CeritaKerja.jsx");
  assert.match(src, /aria-label=\{t\("rel"\)\}/);
  assert.match(src, /aria-current=\{i === aktif \? "step" : undefined\}/);
  assert.match(src, /aria-label=\{t\("keBab", \{ n: i \+ 1, judul: b\.judul\[locale\] \}\)\}/);
  assert.match(src, /tabIndex=\{tampil && aktif >= 0 \? 0 : -1\}/);
  for (const l of ["id", "en"]) {
    const m = JSON.parse(baca(`messages/${l}.json`)).cerita;
    assert.ok(m.rel && m.keBab.includes("{n}") && m.keBab.includes("{judul}"), l);
  }
  // Area ketuk titik minimal 44 px tingginya.
  assert.match(baca("components/cerita/cerita.css"), /\.cerita-rel__titik \{[^}]*height: 2\.75rem;/);
});

test("kabut di belakang teks bab tidak berujung tajam di desktop", () => {
  const css = baca("components/cerita/cerita.css");
  assert.match(css, /\.cerita-kerja--dunia \.bab__teks::before \{[^}]*mask-image:\s*linear-gradient\(to right, transparent/);
  assert.match(css, /\.cerita-kerja--dunia \.bab__teks::before \{[^}]*mask-composite: intersect;/);
});
