// Katalog bank gerak di /bank (ADR 0028): halaman dan datanya tinggal di repo privat
// farrez30/bank-gerak, disajikan sebagai zona Vercel dengan basePath /bank. Repo ini publik,
// jadi di sini hanya ada alamat zonanya.
export const ASAL_BANK = process.env.BANK_GERAK_ASAL || "https://bank-gerak.vercel.app";

export function aturanBank(asal = ASAL_BANK) {
  return {
    rewrites: [
      { source: "/bank", destination: `${asal}/bank` },
      { source: "/bank/:path*", destination: `${asal}/bank/:path*` },
    ],
  };
}
