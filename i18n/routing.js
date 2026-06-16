import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "id", "nl", "ja", "de"],
  defaultLocale: "en",
  localePrefix: "always",
});
