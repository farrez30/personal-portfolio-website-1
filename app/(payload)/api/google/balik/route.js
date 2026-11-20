import { NextResponse } from "next/server";
import { getPayload } from "payload";
import { addSessionToUser, generatePayloadCookie } from "payload/shared";
import { getFieldsToSign, jwtSign } from "payload";
import config from "@payload-config";
import { bacaIdToken, COOKIE_STATE, emailSah, googleSiap, stateCocok, tukarKode } from "@/cms/google";

export const dynamic = "force-dynamic";

// Balikan dari Google. Sesi dibuat dengan cara yang sama seperti operasi login Payload
// (node_modules/payload/dist/auth/operations/login.js): sesi di akun, JWT, cookie payload-token.
export async function GET(req) {
  const url = new URL(req.url);
  const keLogin = (alasan) => {
    const r = NextResponse.redirect(`${url.origin}/admin/login?google=${alasan}`);
    r.cookies.delete({ name: COOKIE_STATE, path: "/api/google" });
    return r;
  };
  if (!googleSiap()) return keLogin("belum-disetel");
  if (!stateCocok(req.cookies.get(COOKIE_STATE)?.value, url.searchParams.get("state"))) return keLogin("gagal");

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const idToken = await tukarKode({
    code: url.searchParams.get("code") ?? "",
    clientId,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: `${url.origin}/api/google/balik`,
  }).catch(() => null);
  const email = emailSah(bacaIdToken(idToken), { clientId });
  if (!email) return keLogin("gagal");

  const payload = await getPayload({ config });
  const koleksi = payload.collections.users.config;
  const { docs } = await payload.find({
    collection: "users",
    where: { email: { equals: email } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    showHiddenFields: true,
  });
  const user = docs[0];
  if (!user) return keLogin("ditolak");
  if (user.lockUntil && new Date(user.lockUntil) > new Date()) return keLogin("terkunci");

  const { sid } = await addSessionToUser({ collectionConfig: koleksi, payload, user });
  const { token } = await jwtSign({
    fieldsToSign: getFieldsToSign({ collectionConfig: koleksi, email, sid, user }),
    secret: payload.secret,
    tokenExpiration: koleksi.auth.tokenExpiration,
  });
  const res = NextResponse.redirect(`${url.origin}/admin`);
  res.headers.append(
    "Set-Cookie",
    generatePayloadCookie({ collectionAuthConfig: koleksi.auth, cookiePrefix: payload.config.cookiePrefix, token }),
  );
  res.cookies.delete({ name: COOKIE_STATE, path: "/api/google" });
  return res;
}
