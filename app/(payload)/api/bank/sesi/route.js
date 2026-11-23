import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { bacaTiket, COOKIE_TAMU, kodeBerlaku, kunciBank } from "@/lib/bank/akses";

export const dynamic = "force-dynamic";

// Ditanya server zona bank-gerak dengan cookie pengunjung yang diteruskan. Zona tidak memegang
// rahasia apa pun: pemilik dikenali dari sesi CMS (payload-token), tamu dari tiket bank-tamu.
// Jawabannya hanya peran, tanpa isi akun.
export async function GET(req) {
  const jawab = (isi, status = 200) => NextResponse.json(isi, { status, headers: { "cache-control": "no-store" } });
  const payload = await getPayload({ config });

  const { user } = await payload.auth({ headers: req.headers }).catch(() => ({ user: null }));
  if (user?.collection === "users") return jawab({ peran: "pemilik" });

  const id = bacaTiket(req.cookies.get(COOKIE_TAMU)?.value, kunciBank(payload.secret));
  if (id) {
    const doc = await payload
      .findByID({ collection: "kode-bank", id, depth: 0, overrideAccess: true, disableErrors: true })
      .catch(() => null);
    if (kodeBerlaku(doc)) return jawab({ peran: "tamu", nama: doc.nama });
  }
  return jawab({ peran: null }, 401);
}
