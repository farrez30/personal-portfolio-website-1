import { test } from "node:test";
import assert from "node:assert/strict";
import { petakanItem, formatDurasi, bagiHalaman, ambilDaftarLagu, BATAS_LAGU } from "../components/musik/daftarLagu.js";

const lagu = (name, artis = ["A"], ms = 200000, extra = {}) => ({
  item: { type: "track", name, artists: artis.map((n) => ({ name: n })), duration_ms: ms, ...extra },
});

test("respons /items dipetakan ke judul, artis, dan durasi", () => {
  const hasil = petakanItem({ items: [lagu("Satu", ["Ana", "Budi"], 206123), lagu("  Dua   Spasi ", [], 0)] });
  assert.deepEqual(hasil, [
    { judul: "Satu", artis: "Ana, Budi", durasi: 206123 },
    { judul: "Dua Spasi", artis: "", durasi: null },
  ]);
});

test("episode, lagu lokal, item kosong, dan judul kosong dilewati", () => {
  const hasil = petakanItem({
    items: [null, {}, { item: null }, { item: { type: "episode", name: "Podcast" } }, lagu("Lokal", ["X"], 1000, { is_local: true }), lagu(""), lagu("Ada")],
  });
  assert.deepEqual(hasil.map((l) => l.judul), ["Ada"]);
});

test("bentuk lama (tracks/track) dan respons rusak menghasilkan daftar kosong", () => {
  assert.deepEqual(petakanItem({ tracks: { items: [{ track: { type: "track", name: "Lama" } }] } }), []);
  for (const rusak of [null, undefined, "x", { items: "bukan larik" }]) assert.deepEqual(petakanItem(rusak), []);
});

test("daftar dibatasi", () => {
  const banyak = { items: Array.from({ length: 80 }, (_, i) => lagu(`L${i}`)) };
  assert.equal(petakanItem(banyak).length, BATAS_LAGU);
});

test("durasi ditulis m:ss atau j:mm:ss", () => {
  assert.equal(formatDurasi(206123), "3:26");
  assert.equal(formatDurasi(59500), "1:00");
  assert.equal(formatDurasi(5000), "0:05");
  assert.equal(formatDurasi(3723000), "1:02:03");
  for (const v of [0, -1, null, undefined, NaN]) assert.equal(formatDurasi(v), "");
});

test("lagu dibagi per halaman", () => {
  const l = Array.from({ length: 23 }, (_, i) => i);
  assert.deepEqual(bagiHalaman(l).map((h) => h.length), [10, 10, 3]);
  assert.deepEqual(bagiHalaman([]), []);
});

const env = { SPOTIFY_CLIENT_ID: "id", SPOTIFY_CLIENT_SECRET: "rahasia", SPOTIFY_REFRESH_TOKEN: "segar" };
const respon = (status, isi) => ({ ok: status >= 200 && status < 300, status, json: async () => isi });

test("alur lengkap: refresh token ditukar, lalu /items dengan token akses", async () => {
  const panggilan = [];
  const ambil = async (url, opsi) => {
    panggilan.push({ url, opsi });
    return url.includes("/api/token") ? respon(200, { access_token: "akses123" }) : respon(200, { items: [lagu("Satu")] });
  };
  const hasil = await ambilDaftarLagu("PL", { env, ambil });
  assert.deepEqual(hasil, { lagu: [{ judul: "Satu", artis: "A", durasi: 200000 }], alasan: null });
  assert.equal(panggilan[0].opsi.method, "POST");
  assert.equal(panggilan[0].opsi.headers.Authorization, `Basic ${Buffer.from("id:rahasia").toString("base64")}`);
  assert.match(panggilan[0].opsi.body, /grant_type=refresh_token&refresh_token=segar/);
  assert.equal(panggilan[1].url, "https://api.spotify.com/v1/playlists/PL/items?limit=50");
  assert.equal(panggilan[1].opsi.headers.Authorization, "Bearer akses123");
});

test("kegagalan berakhir di daftar kosong dengan alasan, tanpa melempar", async () => {
  const kasus = [
    [{}, async () => respon(200, {}), "tanpa-kunci"],
    [{ ...env, SPOTIFY_REFRESH_TOKEN: "" }, async () => respon(200, {}), "tanpa-kunci"],
    [env, async () => respon(400, { error: "invalid_grant" }), "token-400"],
    [env, async () => respon(200, {}), "token-kosong"],
    [env, async (u) => (u.includes("/api/token") ? respon(200, { access_token: "a" }) : respon(403, {})), "items-403"],
    [env, async () => { throw new TypeError("fetch failed"); }, "jaringan"],
    [env, async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError("x"); } }), "jaringan"],
    [env, null, "tanpa-fetch"],
  ];
  for (const [e, ambil, alasan] of kasus) assert.deepEqual(await ambilDaftarLagu("PL", { env: e, ambil }), { lagu: [], alasan }, alasan);
  assert.deepEqual(await ambilDaftarLagu(null, { env, ambil: async () => respon(200, {}) }), { lagu: [], alasan: "tanpa-playlist" });
});

test("rahasia tidak ikut di hasil", async () => {
  const ambil = async (url) => (url.includes("/api/token") ? respon(200, { access_token: "akses123" }) : respon(500, {}));
  const hasil = JSON.stringify(await ambilDaftarLagu("PL", { env, ambil }));
  for (const r of ["rahasia", "segar", "akses123"]) assert.ok(!hasil.includes(r), r);
});
