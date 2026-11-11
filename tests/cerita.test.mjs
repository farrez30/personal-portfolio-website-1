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
  const angka = { 9: ["Sembilan", "Nine"], 10: ["Sepuluh", "Ten"] };
  const denganArsitektur = proyek.filter((p) => p.arsitektur).length;
  const infra = BAB.find((b) => b.id === "fondasi");
  assert.ok(infra.isi.id.startsWith(`${angka[denganArsitektur][0]} dari ${angka[proyek.length][0].toLowerCase()}`));
  assert.ok(infra.isi.en.startsWith(`${angka[denganArsitektur][1]} of the ${angka[proyek.length][1].toLowerCase()}`));
  const rak = BAB.find((b) => b.id === "rilis");
  assert.ok(rak.isi.id.startsWith(angka[proyek.length][0]));
  assert.ok(rak.isi.en.startsWith(angka[proyek.length][1]));
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

test("panggung tidak ikut terhitung sebagai babak", () => {
  // Regresi 11 Nov 2026: panggung menulis data-babak pada dirinya, lalu terhitung sebagai blok
  // saat diukur ulang, dan kamera di HP jadi satu bab di depan teksnya.
  const src = baca("components/cerita/PanggungCerita.jsx");
  assert.doesNotMatch(src, /dataset\.babak\s*=/);
  assert.match(src, /querySelectorAll\("\.cerita-pembuka\[data-babak\], \.bab\[data-babak\]"\)/);
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
