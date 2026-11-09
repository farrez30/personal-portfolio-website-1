// Pemuat gambar bersama untuk kanvas adegan. Satu Image per berkas; yang gagal dimuat
// (jaringan putus sesaat, terlalu banyak permintaan sekaligus) dicoba ulang dengan Image
// baru, supaya satu kegagalan tidak membuat halaman kosong sampai halaman dimuat ulang.
// `buat` dan `tunda` bisa diganti untuk tes.
export function buatPemuat({ buat = () => new Image(), coba = 3, jeda = 700, tunda = setTimeout } = {}) {
  const simpanan = new Map();
  const ulangan = new Map();
  const jadwal = new WeakMap();
  const baru = (src) => {
    const im = buat();
    im.decoding = "async";
    im.src = src;
    simpanan.set(src, im);
    return im;
  };
  const muat = (src) => simpanan.get(src) ?? baru(src);
  const rusak = (im) => im.complete && !im.naturalWidth;

  // Janji yang selesai dengan Image-nya: termuat, atau tetap rusak setelah `coba` kali.
  const tunggu = (src) =>
    new Promise((selesai) => {
      const langkah = () => {
        const im = muat(src);
        if (!im.complete) {
          im.addEventListener("load", () => selesai(im), { once: true });
          im.addEventListener("error", langkah, { once: true });
          return;
        }
        if (!rusak(im)) return selesai(im);
        // Kanvas lain yang menunggu Image rusak yang sama ikut jadwal ulang yang sudah ada.
        if (jadwal.has(im)) return void jadwal.get(im).then(langkah);
        const n = ulangan.get(src) ?? 0;
        if (n >= coba - 1) return selesai(im);
        ulangan.set(src, n + 1);
        const ulang = new Promise((lanjut) =>
          tunda(() => {
            if (simpanan.get(src) === im) baru(src);
            lanjut();
          }, jeda * (n + 1)),
        );
        jadwal.set(im, ulang);
        ulang.then(langkah);
      };
      langkah();
    });

  return { muat, tunggu, rusak };
}
