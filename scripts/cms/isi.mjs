// Mengisi CMS dari berkas: content/proyek.js, content/klien.js, content/situs.js, messages/*.json.
// Yang sudah ada di CMS tidak disentuh, jadi aman dijalankan ulang setelah album atau klien
// baru ditambah di kode. --timpa menimpa semua isi CMS dengan isi berkas.
//   npm run cms:isi
//   npm run cms:isi -- --timpa
import { getPayload } from "payload";
import { proyek } from "../../content/proyek.js";
import { KLIEN } from "../../content/klien.js";
import { situs } from "../../content/situs.js";
import pesanId from "../../messages/id.json" with { type: "json" };
import pesanEn from "../../messages/en.json" with { type: "json" };
import { ratakanKlien } from "../../lib/isi/gabung.js";
import { dataTeks } from "../../cms/teks.js";
import { BAGIAN_TEKS, slugTeks } from "../../cms/global/Teks.js";

if (!process.env.DATABASE_URI) {
  console.error("DATABASE_URI kosong. Isi .env.local dulu (lihat docs/cms.md).");
  process.exit(1);
}
const timpa = process.argv.includes("--timpa");
const { default: config } = await import("../../payload.config.js");
const payload = await getPayload({ config: await config });
const opsi = { overrideAccess: true, depth: 0, context: { tanpaSegarkan: true } };

const perBahasa = (data, b) =>
  Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v && typeof v === "object" && "id" in v && "en" in v ? v[b] : v]));

async function simpan(collection, data) {
  const ada = await payload.find({ collection, where: { slug: { equals: data.slug } }, limit: 1, ...opsi });
  const lama = ada.docs[0];
  if (lama && !timpa) return "dilewati";
  const id = perBahasa(data, "id"), en = perBahasa(data, "en");
  const doc = lama
    ? await payload.update({ collection, id: lama.id, data: id, locale: "id", ...opsi })
    : await payload.create({ collection, data: id, locale: "id", ...opsi });
  await payload.update({ collection, id: doc.id, data: en, locale: "en", ...opsi });
  return lama ? "ditimpa" : "dibuat";
}

const hitung = {};
const catat = (k, hasil) => ((hitung[k] ??= {}), (hitung[k][hasil] = (hitung[k][hasil] ?? 0) + 1));

for (const p of proyek) {
  catat("proyek", await simpan("proyek", {
    slug: p.slug, katalog: p.katalog, tampil: true, judul: p.judul, ringkas: p.ringkas,
    jenis: p.jenis, status: p.status, periode: p.periode, warna: p.warna,
    tautan: { situs: p.tautan?.situs ?? null, repo: p.tautan?.repo ?? null, kasus: p.tautan?.kasus ?? null },
  }));
}

for (const k of ratakanKlien(KLIEN)) {
  catat("klien", await simpan("klien", {
    slug: k.slug, nama: k.nama, kelompok: k.kelompok, induk: k.induk ?? null, tahun: k.tahun ?? null,
    industri: k.industri,
    // Klien pribadi dengan album mengikuti ringkasan albumnya, jadi kolom kerjanya dibiarkan kosong.
    kerja: k.album ? { id: null, en: null } : (k.kerja ?? { id: null, en: null }),
    jenis: k.jenis, tautan: k.tautan ?? null, cakram: k.cakram, album: k.album ?? null, tampil: true,
  }));
}

const situsCms = await payload.findGlobal({ slug: "situs", ...opsi });
if (timpa || !situsCms.email) {
  await payload.updateGlobal({ slug: "situs", data: situs, ...opsi });
  catat("situs", "diisi");
} else catat("situs", "dilewati");

// Satu bagian teks dianggap sudah diisi bila salah satu kolomnya punya nilai.
const terisi = (o) => Object.values(o ?? {}).some((v) => (v && typeof v === "object" ? terisi(v) : typeof v === "string" && v));
for (const b of BAGIAN_TEKS) {
  const slug = slugTeks(b);
  const { id, createdAt, updatedAt, globalType, ...lama } = await payload.findGlobal({ slug, locale: "id", ...opsi });
  if (!timpa && terisi(lama)) {
    catat("teks", "dilewati");
    continue;
  }
  await payload.updateGlobal({ slug, data: dataTeks(pesanId[b]), locale: "id", ...opsi });
  await payload.updateGlobal({ slug, data: dataTeks(pesanEn[b]), locale: "en", ...opsi });
  catat("teks", "diisi");
}

console.log(JSON.stringify(hitung));
process.exit(0);
