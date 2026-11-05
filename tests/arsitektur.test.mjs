import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { proyek } from "../content/proyek.js";
import { ARSITEKTUR } from "../content/arsitektur.js";
import { TEKNOLOGI, KELOMPOK, jalurIkon, teknologiDari } from "../components/arsitektur/teknologi.js";

const adaTeks = (t) => t && typeof t.id === "string" && typeof t.en === "string" && t.id.trim() && t.en.trim();
const denganArsitektur = proyek.filter((p) => p.arsitektur);

test("setiap cerita punya 4 sampai 6 langkah, dua bahasa, teknologi dari katalog", () => {
  assert.ok(denganArsitektur.length >= 8);
  for (const p of denganArsitektur) {
    const { alur, teknologi } = p.arsitektur;
    assert.ok(alur.length >= 4 && alur.length <= 6, `${p.slug}: ${alur.length} langkah`);
    for (const [i, l] of alur.entries()) {
      assert.ok(adaTeks(l.judul) && adaTeks(l.rincian), `${p.slug} langkah ${i + 1}: teks kosong`);
      assert.ok(l.teknologi.length >= 1, `${p.slug} langkah ${i + 1}: tanpa teknologi`);
      for (const k of l.teknologi) assert.ok(TEKNOLOGI[k], `${p.slug}: kunci ${k} tidak ada di katalog`);
    }
    assert.deepEqual(Object.keys(teknologi).sort(), [...KELOMPOK].sort(), p.slug);
    for (const f of teknologi.fitur) assert.ok(adaTeks(f), `${p.slug}: fitur kosong`);
    for (const k of [...teknologi.stack, ...teknologi.infrastruktur]) assert.ok(TEKNOLOGI[k], `${p.slug}: ${k}`);
  }
});

test("setiap teknologi di katalog dipakai dan punya ikon yang bisa digambar", () => {
  const dipakai = new Set();
  for (const a of Object.values(ARSITEKTUR)) {
    a.alur.forEach((l) => l.teknologi.forEach((k) => dipakai.add(k)));
    [...a.teknologi.stack, ...a.teknologi.infrastruktur].forEach((k) => dipakai.add(k));
  }
  for (const [k, t] of Object.entries(TEKNOLOGI)) {
    assert.ok(dipakai.has(k), `${k} tidak dipakai, hapus dari katalog`);
    assert.ok(adaTeks(t.nama), `${k}: nama`);
    const ikon = jalurIkon(t.Ikon);
    assert.ok(ikon.jalur.length > 0 && ikon.ukuran > 0, `${k}: ikon tanpa jalur`);
  }
});

test("teknologiDari melewati kunci yang tidak dikenal dan menjaga urutan", () => {
  assert.deepEqual(teknologiDari(["postgresql", "hantu", "nextjs"]).map((t) => t.kunci), ["postgresql", "nextjs"]);
});

// Aturan ADR 0008: semua teks publik bebas host, endpoint, versi, detail login, region,
// dan nama klien. Nama klien dicek lewat hash supaya tidak tertulis di repo publik.
const semuaTeks = () => {
  const out = [];
  const jalan = (v) => {
    if (typeof v === "string") out.push(v);
    else if (Array.isArray(v)) v.forEach(jalan);
    else if (v && typeof v === "object") Object.values(v).forEach(jalan);
  };
  jalan(ARSITEKTUR);
  for (const t of Object.values(TEKNOLOGI)) jalan(t.nama);
  return out;
};

test("tidak ada URL, domain, path API, atau nomor versi", () => {
  for (const s of semuaTeks()) {
    assert.doesNotMatch(s, /:\/\//, s);
    assert.doesNotMatch(s, /\b[a-z0-9-]+\.(com|app|io|dev|net|org|co|id|sh)\b/i, s);
    assert.doesNotMatch(s, /\/api\b|\/v\d\b/i, s);
    assert.doesNotMatch(s, /\bv?\d+\.\d+(\.\d+)?\b/, s);
  }
});

test("tidak ada detail login, rahasia, skema, atau region", () => {
  const terlarang = /\b(oauth|oidc|jwt|bearer|api key|apikey|secret|rahasia|endpoint|schema|skema|tabel|table|region|singapore|singapura|localhost|ip address|port \d+)\b/i;
  for (const s of semuaTeks()) assert.doesNotMatch(s, terlarang, s);
});

test("tidak ada nama klien (dicek lewat hash)", () => {
  const hash = (w) => createHash("sha256").update(w).digest("hex").slice(0, 16);
  const larangan = new Set(["86e52f530b67c31c", "a75b15f77d185830", "48a3a5a9371b2780", "0193f13f29a6e122", "6afd836725fe3228", "899cfd8a6f406451", "f776fd61b1a82d65"]);
  for (const s of semuaTeks()) {
    for (const kata of s.toLowerCase().split(/[^a-z0-9]+/)) {
      if (kata) assert.ok(!larangan.has(hash(kata)), `nama terlarang di: ${s}`);
    }
  }
});
