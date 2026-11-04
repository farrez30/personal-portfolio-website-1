const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin("./i18n/request.js");

// Bahasa yang dipangkas (ADR 0002) dialihkan permanen supaya tautan lama tetap hidup.
const LOKAL_LAMA = ["de", "ja", "nl"];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return LOKAL_LAMA.flatMap((l) => [
      { source: `/${l}`, destination: "/en", permanent: true },
      { source: `/${l}/:path*`, destination: "/en/:path*", permanent: true },
    ]);
  },
};

module.exports = withNextIntl(nextConfig);
