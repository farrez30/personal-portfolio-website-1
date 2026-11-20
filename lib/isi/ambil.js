import { unstable_cache } from "next/cache";
import { proyek as proyekBerkas } from "@/content/proyek";
import { KLIEN } from "@/content/klien";
import { situs as situsBerkas } from "@/content/situs";
import pesanId from "@/messages/id.json";
import pesanEn from "@/messages/en.json";
import { gabungPesan } from "@/cms/teks";
import { BAGIAN_TEKS, slugTeks } from "@/cms/global/Teks";
import { susunKlien, susunProyek, susunSitus } from "./gabung";

const PESAN = { id: pesanId, en: pesanEn };
const berkas = () => ({ proyek: proyekBerkas, klien: KLIEN, situs: situsBerkas, pesan: PESAN });

// Satu kali baca CMS untuk semua halaman, disimpan sampai ada simpan di admin (tag "isi",
// cms/akses.js). Tanpa DATABASE_URI (dev tanpa DB, preview Vercel, tes) situs memakai berkas.
// Dengan DATABASE_URI, galat DB sengaja dilempar: Next tetap menyajikan halaman terakhir yang
// berhasil, jadi klien yang disembunyikan tidak muncul lagi hanya karena DB sedang tidur.
const dariCms = unstable_cache(
  async () => {
    const [{ getPayload }, { default: config }] = await Promise.all([import("payload"), import("@payload-config")]);
    const payload = await getPayload({ config });
    const semua = (collection) =>
      payload.find({ collection, locale: "all", limit: 500, depth: 0, sort: "_order", overrideAccess: true }).then((r) => r.docs);
    const teks = (locale) =>
      Promise.all(BAGIAN_TEKS.map((b) => payload.findGlobal({ slug: slugTeks(b), locale, depth: 0, overrideAccess: true }))).then(
        (docs) => Object.fromEntries(BAGIAN_TEKS.map((b, i) => [b, docs[i]])),
      );
    const [docProyek, docKlien, situs, teksId, teksEn] = await Promise.all([
      semua("proyek"),
      semua("klien"),
      payload.findGlobal({ slug: "situs", depth: 0, overrideAccess: true }),
      teks("id"),
      teks("en"),
    ]);
    const proyek = susunProyek(proyekBerkas, docProyek.length ? docProyek : null);
    return {
      proyek,
      klien: susunKlien(KLIEN, docKlien.length ? docKlien : null, proyek),
      situs: susunSitus(situsBerkas, situs),
      pesan: { id: gabungPesan(pesanId, teksId), en: gabungPesan(pesanEn, teksEn) },
    };
  },
  ["isi-cms-1"],
  { tags: ["isi"], revalidate: 3600 },
);

export async function ambilIsi() {
  if (!process.env.DATABASE_URI) return berkas();
  return dariCms();
}
