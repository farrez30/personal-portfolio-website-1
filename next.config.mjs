import createNextIntlPlugin from "next-intl/plugin";
import { withPayload } from "@payloadcms/next/withPayload";
import { aturanZona } from "./content/lab.js";

const withNextIntl = createNextIntlPlugin("./i18n/request.js");

// Bahasa yang dipangkas (ADR 0002) dialihkan permanen supaya tautan lama tetap hidup.
const LOKAL_LAMA = ["de", "ja", "nl"];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      ...LOKAL_LAMA.flatMap((l) => [
        { source: `/${l}`, destination: "/en", permanent: true },
        { source: `/${l}/:path*`, destination: "/en/:path*", permanent: true },
      ]),
      ...aturanZona().redirects,
    ];
  },
  // Halaman eksperimen System Design Lab disajikan zona Vercel milik repo masing-masing (ADR 0027).
  async rewrites() {
    return aturanZona().rewrites;
  },
};

// CMS di /admin (ADR 0026).
export default withPayload(withNextIntl(nextConfig));
