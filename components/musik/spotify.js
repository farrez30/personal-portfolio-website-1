// Tautan Spotify dan oEmbed-nya, tanpa login dan tanpa React, supaya bisa dites di Node.
// Hanya lagu, album, dan playlist: tiga jenis yang bisa diputar lewat embed resmi.

const JENIS = ["track", "album", "playlist"];
const ID = /^[A-Za-z0-9]{22}$/;
const HOST = new Set(["open.spotify.com", "play.spotify.com"]);

const buat = (jenis, id) => ({
  jenis,
  id,
  uri: `spotify:${jenis}:${id}`,
  url: `https://open.spotify.com/${jenis}/${id}`,
});

// Menerima tautan open.spotify.com (dengan intl-xx/, embed/, atau ?si=) dan URI spotify:jenis:id.
// Apa pun selain itu mengembalikan null.
export function uraiTautan(teks) {
  const s = String(teks ?? "").trim();
  if (!s || s.length > 500) return null;

  const uri = /^spotify:([a-z]+):([A-Za-z0-9]+)$/.exec(s);
  if (uri) return JENIS.includes(uri[1]) && ID.test(uri[2]) ? buat(uri[1], uri[2]) : null;

  let u;
  try {
    u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
  } catch {
    return null;
  }
  if (!/^https?:$/.test(u.protocol) || !HOST.has(u.hostname.toLowerCase())) return null;

  const bagian = u.pathname.split("/").filter(Boolean);
  if (/^intl-[a-z-]+$/i.test(bagian[0] ?? "")) bagian.shift();
  if (bagian[0] === "embed") bagian.shift();
  const [jenis, id] = bagian;
  return JENIS.includes(jenis) && ID.test(id ?? "") && bagian.length === 2 ? buat(jenis, id) : null;
}

// Sampul dari oEmbed hanya dimuat dari CDN gambar Spotify.
export function sampulAman(url) {
  try {
    const u = new URL(url);
    const h = u.hostname.toLowerCase();
    return u.protocol === "https:" && (h === "i.scdn.co" || h.endsWith(".scdn.co") || h.endsWith(".spotifycdn.com"));
  } catch {
    return false;
  }
}

// oEmbed memberi sampul 300 px. Untuk sampul album, kode ukuran yang sama tersedia
// dalam 640 px; jenis gambar lain (mosaik playlist) dibiarkan.
export function sampulBesar(url) {
  return url.replace("/ab67616d00001e02", "/ab67616d0000b273");
}

// Judul dan sampul lewat oEmbed. Gagal dengan cara apa pun (jaringan, 404, JSON rusak,
// host sampul asing, kehabisan waktu) tetap mengembalikan objek yang bisa dipakai:
// judulnya null dan pemutar memakai label jenisnya.
export async function ambilInfo(tautan, { ambil = globalThis.fetch, batasWaktu = 6000 } = {}) {
  const gagal = { judul: null, sampul: null, dariOembed: false };
  if (!tautan || typeof ambil !== "function") return gagal;
  try {
    const r = await ambil(`https://open.spotify.com/oembed?url=${encodeURIComponent(tautan.url)}`, {
      credentials: "omit",
      referrerPolicy: "no-referrer",
      signal: typeof AbortSignal?.timeout === "function" ? AbortSignal.timeout(batasWaktu) : undefined,
    });
    if (!r?.ok) return gagal;
    const d = await r.json();
    const judul = typeof d?.title === "string" ? d.title.replace(/\s+/g, " ").trim().slice(0, 120) : "";
    const sampul = typeof d?.thumbnail_url === "string" && sampulAman(d.thumbnail_url) ? d.thumbnail_url : null;
    if (!judul && !sampul) return gagal;
    return { judul: judul || null, sampul, dariOembed: true };
  } catch {
    return gagal;
  }
}

export const LABEL_JENIS = {
  track: { id: "Lagu", en: "Track" },
  album: { id: "Album", en: "Album" },
  playlist: { id: "Playlist", en: "Playlist" },
};

// Judul dan ringkasan CD musik untuk pilihan pengunjung.
export function isiAlbum(tautan, info) {
  const label = LABEL_JENIS[tautan.jenis];
  const judul = info?.judul;
  return {
    judul: { id: judul || `${label.id} Spotify`, en: judul || `Spotify ${label.en.toLowerCase()}` },
    ringkas: { id: `${label.id} pilihanmu, diputar lewat Spotify.`, en: `Your ${label.en.toLowerCase()}, played through Spotify.` },
  };
}
