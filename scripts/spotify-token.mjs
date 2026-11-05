// Sekali jalan: login Spotify sebagai Farrez, lalu simpan refresh token ke .env.local
// tanpa mencetak nilainya. Butuh SPOTIFY_CLIENT_ID dan SPOTIFY_CLIENT_SECRET di .env.local,
// dan Redirect URI http://127.0.0.1:8888/callback terdaftar di app Spotify.
//   node scripts/spotify-token.mjs
import { createServer } from "node:http";
import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { exec } from "node:child_process";

const BERKAS = new URL("../.env.local", import.meta.url);
const ALAMAT = "http://127.0.0.1:8888/callback";

const isi = existsSync(BERKAS) ? readFileSync(BERKAS, "utf8") : "";
const env = Object.fromEntries(
  isi
    .split(/\r?\n/)
    .map((b) => /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(b))
    .filter(Boolean)
    .map(([, k, v]) => [k, v.replace(/^["']|["']$/g, "")]),
);
const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: rahasia } = env;
if (!id || !rahasia) {
  console.error("SPOTIFY_CLIENT_ID dan SPOTIFY_CLIENT_SECRET belum ada di .env.local.");
  process.exit(1);
}

const state = randomBytes(16).toString("hex");
const masuk = new URL("https://accounts.spotify.com/authorize");
masuk.search = new URLSearchParams({
  client_id: id,
  response_type: "code",
  redirect_uri: ALAMAT,
  scope: "playlist-read-private playlist-read-collaborative",
  state,
}).toString();

function simpan(token) {
  const baris = `SPOTIFY_REFRESH_TOKEN=${token}`;
  const baru = /^SPOTIFY_REFRESH_TOKEN=.*$/m.test(isi)
    ? isi.replace(/^SPOTIFY_REFRESH_TOKEN=.*$/m, baris)
    : `${isi.replace(/\s*$/, "")}\n${baris}\n`;
  writeFileSync(BERKAS, baru);
}

const server = createServer(async (req, res) => {
  const u = new URL(req.url, ALAMAT);
  if (u.pathname !== "/callback") return res.writeHead(404).end();
  const selesai = (kode, pesan) => {
    res.writeHead(kode, { "Content-Type": "text/plain; charset=utf-8" }).end(pesan);
    console.log(pesan);
    server.close();
  };
  if (u.searchParams.get("state") !== state) return selesai(400, "State tidak cocok. Jalankan ulang skripnya.");
  const kode = u.searchParams.get("code");
  if (!kode) return selesai(400, `Login dibatalkan: ${u.searchParams.get("error") ?? "tanpa kode"}.`);
  const r = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${id}:${rahasia}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "authorization_code", code: kode, redirect_uri: ALAMAT }).toString(),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.refresh_token) return selesai(500, `Gagal menukar kode (status ${r.status}).`);
  simpan(d.refresh_token);
  selesai(200, `Refresh token tersimpan di .env.local (panjang ${d.refresh_token.length}). Tab ini boleh ditutup.`);
});

server.listen(8888, "127.0.0.1", () => {
  console.log("Membuka halaman login Spotify. Kalau tidak terbuka, salin alamat ini ke browser:");
  console.log(masuk.toString());
  const buka = process.platform === "win32" ? `start "" "${masuk}"` : process.platform === "darwin" ? `open "${masuk}"` : `xdg-open "${masuk}"`;
  exec(buka);
});
