// Daftar lagu playlist Farrez untuk buklet CD musik (ADR 0010). Hanya playlist di
// content/musik.js; route ini tidak menerima ID dari luar, jadi bukan proxy Spotify.
import { PLAYLIST } from "@/content/musik";
import { uraiTautan } from "@/components/musik/spotify";
import { ambilDaftarLagu } from "@/components/musik/daftarLagu";

export const dynamic = "force-dynamic";

export async function GET() {
  const id = uraiTautan(PLAYLIST)?.jenis === "playlist" ? uraiTautan(PLAYLIST).id : null;
  const { lagu, alasan } = await ambilDaftarLagu(id, { env: process.env });
  // Alasan gagal hanya ke log server, tanpa isi respons Spotify.
  if (alasan && alasan !== "tanpa-playlist") console.warn(`daftar lagu: ${alasan}`);
  return Response.json(
    { lagu },
    {
      headers: {
        // Cache di CDN: Spotify dipanggil paling sering sekali sejam, bukan per pengunjung.
        "Cache-Control": alasan ? "public, s-maxage=300" : "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
