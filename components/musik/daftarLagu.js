// Daftar lagu playlist Farrez lewat Web API Spotify (ADR 0010), dipakai route
// /api/musik/daftar. Tanpa alias "@/" supaya bisa dites di Node.
//
// Sejak Feb 2026, GET /playlists/{id}/items hanya mengembalikan isi playlist milik
// pengguna yang login, jadi server memakai refresh token Farrez, bukan client credentials.

export const BATAS_LAGU = 50;

const TOKEN = "https://accounts.spotify.com/api/token";
const API = "https://api.spotify.com/v1";

const teks = (v, maks) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, maks) : "");

// Respons /items ke bentuk yang dipakai buklet. Lagu lokal, episode, dan item kosong dilewati.
export function petakanItem(json) {
  const daftar = Array.isArray(json?.items) ? json.items : [];
  const lagu = [];
  for (const baris of daftar) {
    const t = baris?.item;
    if (!t || t.type !== "track" || t.is_local) continue;
    const judul = teks(t.name, 120);
    if (!judul) continue;
    const artis = (Array.isArray(t.artists) ? t.artists : [])
      .map((a) => teks(a?.name, 60))
      .filter(Boolean)
      .join(", ")
      .slice(0, 120);
    lagu.push({ judul, artis, durasi: Number.isFinite(t.duration_ms) && t.duration_ms > 0 ? t.duration_ms : null });
    if (lagu.length >= BATAS_LAGU) break;
  }
  return lagu;
}

export function formatDurasi(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return "";
  const detik = Math.round(ms / 1000);
  const jam = Math.floor(detik / 3600);
  const menit = Math.floor((detik % 3600) / 60);
  const sisa = String(detik % 60).padStart(2, "0");
  return jam ? `${jam}:${String(menit).padStart(2, "0")}:${sisa}` : `${menit}:${sisa}`;
}

export function bagiHalaman(lagu, perHalaman = 10) {
  const hasil = [];
  for (let i = 0; i < lagu.length; i += perHalaman) hasil.push(lagu.slice(i, i + perHalaman));
  return hasil;
}

// Mengambil daftar lagu. Tidak pernah melempar: kunci yang belum diisi, token ditolak,
// atau API berubah semuanya berakhir di { lagu: [], alasan } supaya buklet tetap tampil.
export async function ambilDaftarLagu(idPlaylist, { env = {}, ambil = globalThis.fetch } = {}) {
  const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: rahasia, SPOTIFY_REFRESH_TOKEN: segar } = env;
  if (!idPlaylist) return { lagu: [], alasan: "tanpa-playlist" };
  if (!id || !rahasia || !segar) return { lagu: [], alasan: "tanpa-kunci" };
  if (typeof ambil !== "function") return { lagu: [], alasan: "tanpa-fetch" };
  try {
    const rt = await ambil(TOKEN, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${id}:${rahasia}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: segar }).toString(),
      cache: "no-store",
    });
    if (!rt?.ok) return { lagu: [], alasan: `token-${rt?.status ?? "?"}` };
    const akses = (await rt.json())?.access_token;
    if (typeof akses !== "string" || !akses) return { lagu: [], alasan: "token-kosong" };

    const ri = await ambil(`${API}/playlists/${encodeURIComponent(idPlaylist)}/items?limit=${BATAS_LAGU}`, {
      headers: { Authorization: `Bearer ${akses}` },
      cache: "no-store",
    });
    if (!ri?.ok) return { lagu: [], alasan: `items-${ri?.status ?? "?"}` };
    return { lagu: petakanItem(await ri.json()), alasan: null };
  } catch {
    return { lagu: [], alasan: "jaringan" };
  }
}
