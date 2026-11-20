import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { ambilIsi } from "@/lib/isi/ambil";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale)) {
    locale = routing.defaultLocale;
  }

  // Teks berkas yang ditimpa suntingan di CMS (ADR 0026).
  const { pesan } = await ambilIsi();
  return { locale, messages: pesan[locale] };
});
