// Menyusun isi situs dari dua sumber (ADR 0026): content/*.js sebagai bentuk dan cadangan,
// dokumen Payload sebagai nilai yang disunting. Murni, tanpa Payload, supaya bisa dites.
//
// Aturan umum: CMS menentukan tampil, urutan, dan nilai kolom yang disunting. Kolom teks
// yang kosong di CMS jatuh ke nilai berkas, supaya situs tidak pernah menampilkan teks
// kosong. Item yang ada di berkas tapi belum ada di CMS ikut tampil di ujung daftar,
// jadi album atau klien baru dari kode tidak hilang sebelum seed dijalankan.

const ada = (v) => v != null && !(typeof v === "string" && !v.trim());

/** {id, en} dari CMS, bahasa yang kosong diisi dari berkas. */
function teks(cms, dasar) {
  if (!cms || typeof cms !== "object") return dasar;
  if (!dasar) return ada(cms.id) || ada(cms.en) ? { id: cms.id ?? cms.en ?? "", en: cms.en ?? cms.id ?? "" } : undefined;
  return { id: ada(cms.id) ? cms.id : dasar.id, en: ada(cms.en) ? cms.en : dasar.en };
}

const nilai = (cms, dasar) => (ada(cms) ? cms : dasar);
const urut = (docs) => [...docs].sort((a, b) => String(a._order ?? "").localeCompare(String(b._order ?? "")));

/** Daftar proyek yang tampil, urut, dengan teks dari CMS. Proyek baru hanya lewat kode. */
export function susunProyek(dasar, docs) {
  if (!docs) return dasar;
  const bySlug = new Map(dasar.map((p) => [p.slug, p]));
  const dipakai = new Set();
  const keluar = [];
  for (const d of urut(docs)) {
    const p = bySlug.get(d.slug);
    if (!p) continue;
    dipakai.add(d.slug);
    if (d.tampil === false) continue;
    const tautan = Object.fromEntries(
      Object.entries({ situs: d.tautan?.situs, repo: d.tautan?.repo, kasus: d.tautan?.kasus }).filter(([, v]) => ada(v)),
    );
    keluar.push({
      ...p,
      judul: teks(d.judul, p.judul),
      ringkas: teks(d.ringkas, p.ringkas),
      jenis: nilai(d.jenis, p.jenis),
      status: nilai(d.status, p.status),
      periode: nilai(d.periode, p.periode),
      warna: nilai(d.warna, p.warna),
      // Tautan mengikuti CMS apa adanya: mengosongkan kolom berarti tautannya dicabut.
      tautan: d.tautan ? tautan : p.tautan,
    });
  }
  return [...keluar, ...dasar.filter((p) => !dipakai.has(p.slug))];
}

/** Ratakan KLIEN berkas (anak box set jadi baris dengan `induk`). */
export function ratakanKlien(dasar) {
  return dasar.flatMap(({ anak, ...k }) => [k, ...(anak ?? []).map((a) => ({ ...a, kelompok: k.kelompok, induk: k.slug }))]);
}

function bentukKlien(d, b, proyek) {
  const album = nilai(d.album, b?.album);
  const p = album ? proyek.find((x) => x.slug === album) : null;
  const k = {
    slug: d.slug,
    kelompok: nilai(d.kelompok, b?.kelompok),
    nama: nilai(d.nama, b?.nama),
    cakram: nilai(d.cakram, b?.cakram),
    industri: teks(d.industri, b?.industri),
    jenis: nilai(d.jenis?.length ? d.jenis : null, b?.jenis ?? []),
    // Klien pribadi tanpa teks kerja sendiri memakai ringkasan albumnya, yang mungkin baru disunting.
    kerja: teks(d.kerja, b?.kerja && !album ? b.kerja : (p?.ringkas ?? b?.kerja)),
    tahun: nilai(d.tahun, b?.tahun ?? (p ? Number(String(p.periode).match(/\d{4}/)?.[0]) || undefined : undefined)),
  };
  if (ada(d.tautan ?? b?.tautan)) k.tautan = d.tautan ?? b.tautan;
  // Album yang disembunyikan tidak boleh ditautkan.
  if (p) k.album = album;
  for (const kunci of Object.keys(k)) if (k[kunci] === undefined) delete k[kunci];
  return k;
}

/** KLIEN siap pakai: tampil saja, urut CMS, anak box set disusun kembali di bawah induknya. */
export function susunKlien(dasar, docs, proyek) {
  if (!docs) return dasar;
  const datar = ratakanKlien(dasar);
  const bySlug = new Map(datar.map((k) => [k.slug, k]));
  const slugCms = new Set(docs.map((d) => d.slug));
  const baris = [
    ...urut(docs).map((d) => {
      const b = bySlug.get(d.slug);
      return { tampil: d.tampil !== false, induk: nilai(d.induk, b?.induk), album: nilai(d.album, b?.album), k: bentukKlien(d, b, proyek) };
    }),
    ...datar.filter((k) => !slugCms.has(k.slug)).map((b) => ({ tampil: true, induk: b.induk, album: b.album, k: bentukKlien({ slug: b.slug }, b, proyek) })),
  ];
  // Kartu proyek pribadi ikut tersembunyi bila albumnya disembunyikan: keduanya proyek yang sama.
  const slugProyek = new Set(proyek.map((p) => p.slug));
  const albumTersembunyi = (r) => Boolean(r.album) && !slugProyek.has(r.album);
  const atas = baris.filter((r) => !r.induk && r.tampil && !albumTersembunyi(r));
  return atas.map(({ k }) => {
    // Anak box set di berkas tidak membawa kelompok; kelompoknya ikut induk.
    const anak = baris.filter((r) => r.induk === k.slug && r.tampil).map(({ k: { kelompok, ...a } }) => a);
    return anak.length ? { ...k, anak } : k;
  });
}

/** Tautan pribadi: nilai CMS yang terisi menimpa berkas. */
export function susunSitus(dasar, doc) {
  if (!doc) return dasar;
  return Object.fromEntries(Object.entries(dasar).map(([k, v]) => [k, nilai(doc[k], v)]));
}
