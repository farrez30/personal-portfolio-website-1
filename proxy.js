import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Semua path kecuali API, internal Next, dan berkas berekstensi (/assets/* dsb.).
  matcher: ["/((?!api|_next|_vercel|assets|.*\..*).*)"],
};
