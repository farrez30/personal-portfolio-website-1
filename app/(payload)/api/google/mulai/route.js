import { NextResponse } from "next/server";
import { buatState, COOKIE_STATE, googleSiap, urlMasuk } from "@/cms/google";

export const dynamic = "force-dynamic";

export function GET(req) {
  const asal = new URL(req.url).origin;
  if (!googleSiap()) return NextResponse.redirect(`${asal}/admin/login?google=belum-disetel`);
  const state = buatState();
  const res = NextResponse.redirect(
    urlMasuk({ clientId: process.env.GOOGLE_CLIENT_ID, redirectUri: `${asal}/api/google/balik`, state }),
  );
  res.cookies.set(COOKIE_STATE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: asal.startsWith("https:"),
    path: "/api/google",
    maxAge: 600,
  });
  return res;
}
