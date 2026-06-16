import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match all paths except API, Next internals, and any file with an extension
  // (this keeps /assets/* and other static files out of locale routing).
  matcher: ["/((?!api|_next|_vercel|assets|.*\\..*).*)"],
};
