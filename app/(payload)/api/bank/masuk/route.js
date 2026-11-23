import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { asalSama, buatPenahan, buatTiket, COOKIE_TAMU, kodeBerlaku, kunciBank, sidikKode, UMUR_TIKET } from "@/lib/bank/akses";

export const dynamic = "force-dynamic";

const penahan = buatPenahan();

// Form di /bank/masuk (zona bank-gerak) mengirim kodenya ke sini. Jawabannya selalu pengalihan,
// supaya form biasa tanpa JavaScript tetap jalan.
export async function POST(req) {
  const url = new URL(req.url);
  const ke = (jalur) => NextResponse.redirect(`${url.origin}${jalur}`, 303);
  if (!asalSama(req)) return new NextResponse("Asal kiriman tidak dikenal.", { status: 403 });

  const alamat = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "tanpa-alamat";
  if (penahan.tertahan(alamat)) return ke("/bank/masuk?galat=tahan");

  const form = await req.formData().catch(() => null);
  const kode = form?.get("kode");
  if (typeof kode !== "string" || !kode.trim()) return ke("/bank/masuk?galat=kosong");

  const payload = await getPayload({ config });
  const kunci = kunciBank(payload.secret);
  const { docs } = await payload.find({
    collection: "kode-bank",
    where: { sidik: { equals: sidikKode(kode, kunci) } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    showHiddenFields: true,
  });
  const doc = docs[0];
  if (!kodeBerlaku(doc)) {
    penahan.gagal(alamat);
    return ke("/bank/masuk?galat=salah");
  }

  await payload.update({
    collection: "kode-bank",
    id: doc.id,
    data: { terakhirMasuk: new Date().toISOString() },
    overrideAccess: true,
    depth: 0,
  });
  const r = ke("/bank");
  r.cookies.set(COOKIE_TAMU, buatTiket({ id: doc.id }, kunci), {
    httpOnly: true,
    secure: url.protocol === "https:",
    sameSite: "lax",
    path: "/",
    maxAge: UMUR_TIKET,
  });
  return r;
}
