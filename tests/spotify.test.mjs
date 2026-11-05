import { test } from "node:test";
import assert from "node:assert/strict";
import { uraiTautan, ambilInfo, sampulAman, sampulBesar, isiAlbum, cuplikan } from "../components/musik/spotify.js";
import { albumMusik, PLAYLIST } from "../content/musik.js";

const ID = "4cOdK2wGLETKBW3PvgPWqT";

test("tautan lagu, album, dan playlist dikenali dalam berbagai bentuk", () => {
  const kasus = [
    [`https://open.spotify.com/track/${ID}`, "track"],
    [`https://open.spotify.com/track/${ID}?si=abc123&utm_source=copy-link`, "track"],
    [`open.spotify.com/album/${ID}`, "album"],
    [`https://open.spotify.com/intl-id/playlist/${ID}`, "playlist"],
    [`https://open.spotify.com/intl-pt-BR/track/${ID}`, "track"],
    [`https://open.spotify.com/embed/playlist/${ID}?utm_source=oembed`, "playlist"],
    [`http://play.spotify.com/album/${ID}`, "album"],
    [`  spotify:track:${ID}  `, "track"],
    [`https://OPEN.SPOTIFY.COM/track/${ID}/`, "track"],
  ];
  for (const [teks, jenis] of kasus) {
    const t = uraiTautan(teks);
    assert.ok(t, teks);
    assert.equal(t.jenis, jenis, teks);
    assert.equal(t.id, ID);
    assert.equal(t.uri, `spotify:${jenis}:${ID}`);
    assert.equal(t.url, `https://open.spotify.com/${jenis}/${ID}`);
  }
});

test("tautan yang bukan lagu, album, atau playlist Spotify ditolak", () => {
  const tolak = [
    "",
    null,
    undefined,
    "halo",
    `https://open.spotify.com/artist/${ID}`,
    `https://open.spotify.com/episode/${ID}`,
    `https://open.spotify.com/show/${ID}`,
    `spotify:artist:${ID}`,
    `https://open.spotify.com/track/${ID.slice(0, 21)}`,
    `https://open.spotify.com/track/${ID}x`,
    `https://open.spotify.com/track/${ID}/extra`,
    `https://open.spotify.com.evil.com/track/${ID}`,
    `https://evil.com/open.spotify.com/track/${ID}`,
    `https://spotify.link/abc`,
    `javascript:alert(1)//open.spotify.com/track/${ID}`,
    `ftp://open.spotify.com/track/${ID}`,
    `https://open.spotify.com/track/${"a".repeat(600)}`,
  ];
  for (const teks of tolak) assert.equal(uraiTautan(teks), null, String(teks));
});

// Fake fetch yang gagal seperti aslinya: status, JSON rusak, lempar galat jaringan.
const balas = (status, isi) => async () => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => (typeof isi === "string" ? JSON.parse(isi) : isi),
});

const tautan = uraiTautan(`https://open.spotify.com/track/${ID}`);

test("oEmbed yang berhasil memberi judul dan sampul, dengan permintaan tanpa kuki", async () => {
  let dipanggil;
  const ambil = async (url, opsi) => {
    dipanggil = { url, opsi };
    return balas(200, { title: "  Never   Gonna Give You Up ", thumbnail_url: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02baf8" })();
  };
  const info = await ambilInfo(tautan, { ambil });
  assert.deepEqual(info, { judul: "Never Gonna Give You Up", sampul: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02baf8", dariOembed: true });
  assert.equal(dipanggil.url, `https://open.spotify.com/oembed?url=${encodeURIComponent(tautan.url)}`);
  assert.equal(dipanggil.opsi.credentials, "omit");
  assert.equal(dipanggil.opsi.referrerPolicy, "no-referrer");
});

test("oEmbed yang gagal jatuh ke cadangan, tidak melempar", async () => {
  const cadangan = { judul: null, sampul: null, dariOembed: false };
  const kasus = {
    404: balas(404, { error: "not found" }),
    500: balas(500, { title: "Internal error", thumbnail_url: "https://i.scdn.co/image/x" }),
    "json rusak": balas(200, "{tidak json"),
    "isi kosong": balas(200, {}),
    "bukan objek": balas(200, null),
    "galat jaringan": async () => {
      throw new TypeError("Failed to fetch");
    },
    "kehabisan waktu": async () => {
      throw new DOMException("The operation was aborted due to timeout", "TimeoutError");
    },
  };
  for (const [nama, ambil] of Object.entries(kasus)) assert.deepEqual(await ambilInfo(tautan, { ambil }), cadangan, nama);
  assert.deepEqual(await ambilInfo(null, { ambil: balas(200, { title: "x" }) }), cadangan);
  assert.deepEqual(await ambilInfo(tautan, { ambil: null }), cadangan, "tanpa fetch");
});

test("sampul dari host asing dibuang, judulnya tetap dipakai", async () => {
  const info = await ambilInfo(tautan, { ambil: balas(200, { title: "Lagu", thumbnail_url: "https://evil.example/x.jpg" }) });
  assert.deepEqual(info, { judul: "Lagu", sampul: null, dariOembed: true });
  const http = await ambilInfo(tautan, { ambil: balas(200, { title: "Lagu", thumbnail_url: "http://i.scdn.co/image/x" }) });
  assert.equal(http.sampul, null);
});

test("judul yang sangat panjang dipotong", async () => {
  const info = await ambilInfo(tautan, { ambil: balas(200, { title: "a".repeat(400) }) });
  assert.equal(info.judul.length, 120);
});

test("host sampul yang diterima hanya CDN gambar Spotify", () => {
  assert.ok(sampulAman("https://i.scdn.co/image/abc"));
  assert.ok(sampulAman("https://mosaic.scdn.co/640/abc"));
  assert.ok(sampulAman("https://image-cdn-fa.spotifycdn.com/image/abc"));
  assert.ok(!sampulAman("https://spotifycdn.com.evil.net/image/abc"));
  assert.ok(!sampulAman("data:image/png;base64,AAAA"));
  assert.ok(!sampulAman("bukan url"));
});

test("sampul album dinaikkan ke 640 px, gambar lain dibiarkan", () => {
  assert.equal(sampulBesar("https://i.scdn.co/image/ab67616d00001e02abc"), "https://i.scdn.co/image/ab67616d0000b273abc");
  assert.equal(sampulBesar("https://mosaic.scdn.co/300/abc"), "https://mosaic.scdn.co/300/abc");
});

test("judul CD dari oEmbed, atau label jenisnya bila oEmbed gagal", () => {
  const pl = uraiTautan(`https://open.spotify.com/playlist/${ID}`);
  assert.deepEqual(isiAlbum(pl, { judul: "Fokus" }).judul, { id: "Fokus", en: "Fokus" });
  const c = isiAlbum(pl, { judul: null });
  assert.equal(c.judul.id, "Playlist Spotify");
  assert.equal(c.judul.en, "Spotify playlist");
  for (const l of ["id", "en"]) assert.ok(c.ringkas[l].trim());
});

test("playlist Farrez, bila diisi, adalah tautan yang sah", () => {
  if (PLAYLIST) assert.equal(uraiTautan(PLAYLIST)?.jenis, "playlist");
  assert.equal(albumMusik.musik, true);
});

test("cuplikan dikenali dari durasi, lagu penuh dan data kosong tidak", () => {
  for (const d of [15123, 18689, 30000, 31000]) assert.equal(cuplikan(d), true, String(d));
  for (const d of [31001, 206000, 0, -1, NaN, undefined, null, "18689"]) assert.equal(cuplikan(d), false, String(d));
});
