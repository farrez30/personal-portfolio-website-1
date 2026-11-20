import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Semua path kecuali API, admin CMS, internal Next, dan berkas berekstensi (/assets/* dsb.).
  matcher: ["/((?!api|admin|_next|_vercel|assets|.*\..*).*)"],
};
