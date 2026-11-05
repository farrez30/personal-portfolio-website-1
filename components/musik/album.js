// Menghubungkan pilihan Spotify dengan CD musik di rak: judul, ringkasan, sampul yang
// sudah dicetak ulang, dan tautannya. Rak 3D menggambar ulang lewat "musik:album".
import { albumMusik, AWAL_MUSIK } from "@/content/musik";
import { cetakKertas, warnaRata } from "@/components/imersif/gambar";
import { isiAlbum, sampulBesar } from "./spotify";

let urlLama = null;

function muat(src) {
  return new Promise((selesai, gagal) => {
    const im = new Image();
    im.crossOrigin = "anonymous";
    im.referrerPolicy = "no-referrer";
    im.decoding = "async";
    im.onload = () => selesai(im);
    im.onerror = gagal;
    im.src = src;
  });
}

// Sampul Spotify dicetak ulang di kanvas; hasilnya object URL lokal supaya kotak, cakram,
// buklet, dan pemutar mini memakai gambar yang sama tanpa meminta ulang ke Spotify.
export async function cetakSampul(src, benih = 7) {
  let im;
  try {
    im = await muat(sampulBesar(src));
  } catch {
    im = await muat(src);
  }
  const c = cetakKertas(im, { benih });
  const blob = await new Promise((selesai) => c.toBlob(selesai, "image/webp", 0.9));
  if (!blob) throw new Error("kanvas kosong");
  return { url: URL.createObjectURL(blob), warna: warnaRata(c) };
}

// Tanpa tautan: kembali ke keadaan awal. Playlist Farrez memakai judul CD sendiri;
// hanya sampul dan tautannya yang mengikuti Spotify.
export function terapkanKeAlbum(tautan, info, sampul, { milikFarrez = false } = {}) {
  if (urlLama && urlLama !== sampul?.url) URL.revokeObjectURL(urlLama);
  urlLama = sampul?.url ?? null;
  const isi = tautan && !milikFarrez ? isiAlbum(tautan, info) : AWAL_MUSIK;
  Object.assign(albumMusik, {
    judul: isi.judul,
    ringkas: isi.ringkas,
    ilustrasi: sampul?.url ?? null,
    warna: sampul?.warna ?? AWAL_MUSIK.warna,
    tautan: tautan ? { situs: tautan.url } : {},
  });
  window.dispatchEvent(new CustomEvent("musik:album"));
}
