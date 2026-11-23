import { NextResponse } from "next/server";
import { buatState, COOKIE_STATE, COOKIE_TUJUAN, googleSiap, tujuanAman, urlMasuk } from "@/cms/google";

export const dynamic = "force-dynamic";

export function GET(req) {
  const url = new URL(req.url);
  const asal = url.origin;
  if (!googleSiap()) return NextResponse.redirect(`${asal}/admin/login?google=belum-disetel`);
  const state = buatState();
  const res = NextResponse.redirect(
    urlMasuk({ clientId: process.env.GOOGLE_CLIENT_ID, redirectUri: `${asal}/api/google/balik`, state }),
  );
  const opsi = { httpOnly: true, sameSite: "lax", secure: asal.startsWith("https:"), path: "/api/google", maxAge: 600 };
  res.cookies.set(COOKIE_STATE, state, opsi);
  const ke = tujuanAman(url.searchParams.get("ke"));
  if (ke) res.cookies.set(COOKIE_TUJUAN, ke, opsi);
  return res;
}
