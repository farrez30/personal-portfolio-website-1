// Masuk dengan Google tanpa paket auth (ADR 0026). Alur kode OAuth biasa untuk aplikasi
// server: state acak di cookie httpOnly, kode ditukar di server dengan client secret, lalu
// id_token dibaca. Token itu datang langsung dari endpoint token Google lewat TLS, jadi
// tanda tangannya boleh tidak diperiksa (OpenID Connect Core 3.1.3.7); klaimnya tetap dicek.
// Hanya email yang sudah punya akun di koleksi users yang boleh masuk.

import { randomBytes, timingSafeEqual } from "node:crypto";

export const COOKIE_STATE = "porto-google-state";
// Halaman tujuan sesudah login Google (mis. /bank dari "Sign in as Farrez"), disimpan selama
// perjalanan ke Google dan kembali.
export const COOKIE_TUJUAN = "porto-google-ke";

/** Tujuan yang boleh: jalur /admin atau /bank di situs ini saja, supaya bukan pengalih terbuka. */
export function tujuanAman(nilai) {
  if (typeof nilai !== "string" || nilai.length > 200) return null;
  return /^\/(admin|bank)(?:[/?#][^\s\\]*)?$/.test(nilai) && !nilai.startsWith("//") ? nilai : null;
}
const PENERBIT = new Set(["https://accounts.google.com", "accounts.google.com"]);

export const googleSiap = (env = process.env) => Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);

export const buatState = () => randomBytes(24).toString("base64url");

export function stateCocok(dariCookie, dariUrl) {
  if (!dariCookie || !dariUrl) return false;
  const a = Buffer.from(dariCookie), b = Buffer.from(dariUrl);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function urlMasuk({ clientId, redirectUri, state }) {
  const u = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  u.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email",
    state,
    prompt: "select_account",
  }).toString();
  return u.toString();
}

/** Isi id_token tanpa cek tanda tangan; hanya untuk token dari endpoint token Google. */
export function bacaIdToken(idToken) {
  const bagian = String(idToken ?? "").split(".");
  if (bagian.length !== 3) return null;
  try {
    return JSON.parse(Buffer.from(bagian[1], "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

/** Email yang boleh dicari di users, atau null bila klaimnya tidak sah. */
export function emailSah(klaim, { clientId, sekarang = Date.now() / 1000 }) {
  if (!klaim || !PENERBIT.has(klaim.iss) || klaim.aud !== clientId) return null;
  if (typeof klaim.exp !== "number" || klaim.exp < sekarang) return null;
  if (klaim.email_verified !== true || typeof klaim.email !== "string") return null;
  return klaim.email.trim().toLowerCase();
}

export async function tukarKode({ code, clientId, clientSecret, redirectUri, fetchFn = fetch }) {
  const r = await fetchFn("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: "authorization_code" }),
  });
  if (!r.ok) return null;
  const j = await r.json();
  return j.id_token ?? null;
}

/**
 * Pasang cookie sesi Payload di respons balikan dan hapus cookie state. Keduanya lewat
 * `res.cookies`: ResponseCookies menulis ulang seluruh header Set-Cookie setiap kali dipakai,
 * jadi header yang di-append manual sebelumnya ikut hilang (penyebab login Google pertama gagal).
 * `cookie` adalah hasil generatePayloadCookie({ returnCookieAsObject: true }).
 */
export function pasangSesi(res, cookie) {
  res.cookies.delete({ name: COOKIE_STATE, path: "/api/google" });
  res.cookies.delete({ name: COOKIE_TUJUAN, path: "/api/google" });
  res.cookies.set({
    name: cookie.name,
    value: cookie.value,
    path: cookie.path ?? "/",
    httpOnly: true,
    secure: Boolean(cookie.secure),
    ...(cookie.domain && { domain: cookie.domain }),
    ...(cookie.expires && { expires: new Date(cookie.expires) }),
    ...(cookie.sameSite && { sameSite: String(cookie.sameSite).toLowerCase() }),
  });
  return res;
}
