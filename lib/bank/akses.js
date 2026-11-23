// Kode tamu bank gerak (ADR 0028). Kode disimpan sebagai sidik HMAC, tidak pernah polos. Sesudah
// kode cocok, browser memegang tiket bertanda tangan berisi id kode dan batas waktunya; setiap kali
// zona /bank bertanya, tiket dicek lagi ke koleksi kode-bank, jadi kode yang dicabut langsung mati.

import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

export const COOKIE_TAMU = "bank-tamu";
export const UMUR_TIKET = 30 * 24 * 60 * 60; // detik
export const PANJANG_MIN = 12;

// Kunci turunan, supaya tanda tangan tiket tidak bisa dipakai di tempat lain yang memakai PAYLOAD_SECRET.
export const kunciBank = (rahasia) => {
  if (!rahasia) throw new Error("PAYLOAD_SECRET kosong, kode bank tidak bisa dicek.");
  return createHmac("sha256", rahasia).update("bank-gerak/v1").digest();
};

// Spasi, tanda hubung, dan huruf besar diabaikan supaya kode yang diketik ulang dari WhatsApp tetap cocok.
export const rapikanKode = (kode) => String(kode ?? "").normalize("NFKC").replace(/[\s\-‐-―]+/g, "").toLowerCase();

export const sidikKode = (kode, kunci) => createHmac("sha256", kunci).update(rapikanKode(kode)).digest("hex");

export function kodeLayak(kode) {
  const k = rapikanKode(kode);
  if (k.length < PANJANG_MIN) return `Kode minimal ${PANJANG_MIN} karakter, supaya tidak bisa ditebak.`;
  return true;
}

// Tanpa huruf yang mudah tertukar (0/o, 1/l/i).
const HURUF = "abcdefghjkmnpqrstuvwxyz23456789";
export function kodeAcak(panjang = 16) {
  let s = "";
  for (let i = 0; i < panjang; i++) s += HURUF[randomInt(HURUF.length)];
  return s.match(/.{1,4}/g).join("-");
}

const tanda = (isi, kunci) => createHmac("sha256", kunci).update(isi).digest("base64url");

export function buatTiket({ id, sekarang = Date.now() / 1000 }, kunci) {
  const isi = Buffer.from(JSON.stringify({ k: String(id), e: Math.floor(sekarang + UMUR_TIKET) })).toString("base64url");
  return `${isi}.${tanda(isi, kunci)}`;
}

/** Id kode dari tiket yang sah dan belum kedaluwarsa, atau null. */
export function bacaTiket(tiket, kunci, sekarang = Date.now() / 1000) {
  const [isi, sig, lebih] = String(tiket ?? "").split(".");
  if (!isi || !sig || lebih !== undefined) return null;
  const a = Buffer.from(sig), b = Buffer.from(tanda(isi, kunci));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const { k, e } = JSON.parse(Buffer.from(isi, "base64url").toString("utf8"));
    if (typeof k !== "string" || typeof e !== "number" || e < sekarang) return null;
    return k;
  } catch {
    return null;
  }
}

/** Kode masih boleh dipakai: aktif dan belum lewat tanggal kedaluwarsanya. */
export const kodeBerlaku = (doc, sekarang = new Date()) =>
  Boolean(doc?.aktif) && (!doc.kedaluwarsa || new Date(doc.kedaluwarsa) > sekarang);

// Penahan tebakan: 10 percobaan salah per alamat per 15 menit. Ingatannya per instance serverless,
// jadi ini rem, bukan tembok; temboknya panjang kode minimal di atas.
const BATAS = 10;
const JENDELA = 15 * 60 * 1000;
export function buatPenahan({ batas = BATAS, jendela = JENDELA } = {}) {
  const catatan = new Map();
  return {
    tertahan(alamat, kini = Date.now()) {
      const c = catatan.get(alamat);
      return Boolean(c && kini - c.mulai < jendela && c.n >= batas);
    },
    gagal(alamat, kini = Date.now()) {
      const c = catatan.get(alamat);
      if (!c || kini - c.mulai >= jendela) catatan.set(alamat, { mulai: kini, n: 1 });
      else c.n += 1;
      if (catatan.size > 5000) catatan.clear();
    },
  };
}

/** Kiriman form hanya dari situs ini sendiri. */
export function asalSama(req) {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
