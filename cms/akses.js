import { revalidatePath, revalidateTag } from "next/cache.js";

// Isi CMS hanya dibaca situs lewat Local API. REST /api/<koleksi> hanya untuk admin yang
// masuk, supaya klien yang disembunyikan tidak bisa diintip lewat API.
export const hanyaAdmin = ({ req }) => Boolean(req.user);

export const aksesAdmin = { read: hanyaAdmin, create: hanyaAdmin, update: hanyaAdmin, delete: hanyaAdmin };

// Setelah simpan, halaman statis dibangun ulang di kunjungan berikutnya (lib/isi/ambil.js).
// Di luar request Next (skrip seed) revalidate melempar galat, dan itu memang boleh dilewati.
export function segarkan() {
  try {
    revalidateTag("isi", { expire: 0 });
    revalidatePath("/", "layout");
  } catch {}
}

export const kaitSegarkan = { afterChange: [() => segarkan()], afterDelete: [() => segarkan()] };
