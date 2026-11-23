import { NextResponse } from "next/server";
import { asalSama, COOKIE_TAMU } from "@/lib/bank/akses";

export const dynamic = "force-dynamic";

// Keluar dari katalog untuk tamu. Pemilik keluar lewat CMS seperti biasa.
export async function POST(req) {
  if (!asalSama(req)) return new NextResponse("Asal kiriman tidak dikenal.", { status: 403 });
  const r = NextResponse.redirect(new URL("/bank/masuk", req.url), 303);
  r.cookies.delete({ name: COOKIE_TAMU, path: "/" });
  return r;
}
