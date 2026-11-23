import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Semua path kecuali API, admin CMS, internal Next, halaman eksperimen lab (diteruskan ke zona
  // Vercel lain, ADR 0027), katalog /bank (zona bank-gerak, ADR 0028), dan berkas berekstensi (/assets/* dsb.). Hub /lab tetap lewat sini
  // supaya diberi bahasa. Backslash ditulis dua kali: di string JS, "\." hanya jadi titik, dan pola
  // itu dulu menolak semua path selain "/".
  matcher: ["/((?!api|admin|_next|_vercel|assets|lab/|bank|.*\\..*).*)"],
};
