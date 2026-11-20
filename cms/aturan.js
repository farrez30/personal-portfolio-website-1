// Aturan isi yang juga dijaga npm test, dipakai ulang sebagai validasi kolom CMS supaya
// suntingan di /admin tidak bisa melewatinya (ADR 0008 dan 0026). Mengembalikan true
// atau kalimat galat, sesuai kontrak `validate` Payload.

import { createHash } from "node:crypto";

// Nama klien kantor yang tidak boleh muncul di teks proyek, dicek lewat hash seperti
// tests/arsitektur.test.mjs supaya namanya tidak tertulis di repo publik.
const LARANGAN_NAMA = new Set(["86e52f530b67c31c", "a75b15f77d185830", "48a3a5a9371b2780", "0193f13f29a6e122", "6afd836725fe3228", "899cfd8a6f406451", "f776fd61b1a82d65"]);
const hash = (w) => createHash("sha256").update(w).digest("hex").slice(0, 16);

export function teksProyekAman(s) {
  if (!s) return true;
  if (/:\/\/|\b[a-z0-9-]+\.(com|app|io|dev|net|org|co|id|sh)\b/i.test(s)) return "Jangan tulis alamat situs di sini. Taruh di kolom Tautan.";
  if (/\b(oauth|oidc|jwt|bearer|api key|apikey|secret|endpoint|localhost|ip address)\b/i.test(s)) return "Jangan tulis cara login, kunci rahasia, atau endpoint di teks publik (ADR 0008).";
  for (const kata of s.toLowerCase().split(/[^a-z0-9]+/)) {
    if (kata && LARANGAN_NAMA.has(hash(kata))) return "Nama klien kantor tidak boleh ditulis di teks proyek.";
  }
  return true;
}

export function tautanHttps(s) {
  if (!s) return true;
  try {
    return new URL(s).protocol === "https:" ? true : "Tautan harus diawali https://";
  } catch {
    return "Tautannya belum benar. Periksa lagi penulisannya.";
  }
}

// Klien hanya menautkan studi kasus di coderoach.id (tests/klien.test.mjs).
export function tautanKlien(s) {
  if (!s) return true;
  return /^https:\/\/coderoach\.id\/work\/[a-z0-9-]+$/.test(s) ? true : "Tautan klien hanya ke https://coderoach.id/work/<slug>.";
}

export function jalurAset(s) {
  if (!s) return true;
  return /^\/assets\/[\w./-]+\.(webp|png|jpe?g|svg)$/.test(s) && !s.includes("..") ? true : "Isi dengan jalur berkas di public, mis. /assets/klien/cakram/nama.webp";
}

export function slugValid(s) {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s ?? "") ? true : "Slug hanya huruf kecil, angka, dan tanda hubung.";
}

export function warnaHex(s) {
  if (!s) return true;
  return /^#[0-9a-f]{6}$/i.test(s) ? true : "Warna ditulis #rrggbb.";
}

/** Placeholder ICU ({n}, {nama}) di teks UI harus sama dengan versi berkasnya. */
export function placeholder(s) {
  return [...String(s ?? "").matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
}

export function placeholderSama(nilai, dasar) {
  if (!nilai) return true;
  const a = placeholder(nilai).join(","), b = placeholder(dasar).join(",");
  return a === b ? true : `Teks ini harus memuat ${placeholder(dasar).map((p) => `{${p}}`).join(" ") || "tanpa placeholder"}, persis.`;
}
