// Katalog teknologi yang boleh disebut di cerita arsitektur. Isinya hanya nama produk
// atau peran umum: tanpa versi, host, endpoint, skema, atau detail login
// (docs/decisions/0008-safe-public-architecture.md). Ikon merek dari Simple Icons,
// peran umum dari Phosphor; keduanya sudah terpasang lewat react-icons.
import {
  SiAndroid,
  SiDocker,
  SiExpress,
  SiGithub,
  SiGithubactions,
  SiKotlin,
  SiMeta,
  SiMicrosoftexcel,
  SiMicrosoftsqlserver,
  SiNextdotjs,
  SiPostgresql,
  SiReact,
  SiBun,
  SiVercel,
  SiCloudflare,
  SiWhatsapp,
  SiPwa,
  SiPrisma,
  SiTypescript,
  SiPlaywright,
  SiAstro,
  SiJetpackcompose,
} from "react-icons/si";
import {
  PiBellRingingBold,
  PiBrowserBold,
  PiCameraBold,
  PiChartLineUpBold,
  PiClockClockwiseBold,
  PiDeviceMobileBold,
  PiEnvelopeSimpleBold,
  PiFilePdfBold,
  PiHardDrivesBold,
  PiImageBold,
  PiLinkSimpleBold,
  PiPlugsConnectedBold,
  PiShieldCheckBold,
  PiWifiHighBold,
  PiGearSixBold,
  PiDatabaseBold,
} from "react-icons/pi";

const sama = (n) => ({ id: n, en: n });

export const TEKNOLOGI = {
  // Merek
  nextjs: { nama: sama("Next.js"), Ikon: SiNextdotjs },
  react: { nama: sama("React"), Ikon: SiReact },
  typescript: { nama: sama("TypeScript"), Ikon: SiTypescript },
  postgresql: { nama: sama("PostgreSQL"), Ikon: SiPostgresql },
  prisma: { nama: sama("Prisma"), Ikon: SiPrisma },
  drizzle: { nama: sama("Drizzle ORM"), Ikon: PiDatabaseBold },
  playwright: { nama: sama("Playwright"), Ikon: SiPlaywright },
  astro: { nama: sama("Astro"), Ikon: SiAstro },
  jetpackcompose: { nama: sama("Jetpack Compose"), Ikon: SiJetpackcompose },
  sqlserver: { nama: sama("SQL Server"), Ikon: SiMicrosoftsqlserver },
  express: { nama: sama("Express"), Ikon: SiExpress },
  bun: { nama: sama("Bun"), Ikon: SiBun },
  docker: { nama: sama("Docker"), Ikon: SiDocker },
  github: { nama: sama("GitHub"), Ikon: SiGithub },
  githubactions: { nama: sama("GitHub Actions"), Ikon: SiGithubactions },
  vercel: { nama: sama("Vercel"), Ikon: SiVercel },
  cloudflare: { nama: sama("Cloudflare Workers"), Ikon: SiCloudflare },
  kotlin: { nama: sama("Kotlin"), Ikon: SiKotlin },
  android: { nama: sama("Android"), Ikon: SiAndroid },
  whatsapp: { nama: sama("WhatsApp"), Ikon: SiWhatsapp },
  meta: { nama: { id: "Iklan Meta", en: "Meta ads" }, Ikon: SiMeta },
  pwa: { nama: sama("PWA"), Ikon: SiPwa },
  excel: { nama: { id: "Berkas Excel", en: "Excel file" }, Ikon: SiMicrosoftexcel },
  // Peran umum
  peramban: { nama: { id: "Peramban", en: "Browser" }, Ikon: PiBrowserBold },
  hp: { nama: { id: "HP", en: "Phone" }, Ikon: PiDeviceMobileBold },
  penyimpananHp: { nama: { id: "Penyimpanan di HP", en: "On-device storage" }, Ikon: PiHardDrivesBold },
  foto: { nama: { id: "Penyimpanan foto", en: "Photo storage" }, Ikon: PiImageBold },
  email: { nama: { id: "Email", en: "Email" }, Ikon: PiEnvelopeSimpleBold },
  push: { nama: { id: "Notifikasi push", en: "Push notifications" }, Ikon: PiBellRingingBold },
  pdf: { nama: { id: "PDF", en: "PDF" }, Ikon: PiFilePdfBold },
  tautan: { nama: { id: "Tautan berbagi", en: "Share link" }, Ikon: PiLinkSimpleBold },
  jadwal: { nama: { id: "Tugas terjadwal", en: "Scheduled job" }, Ikon: PiClockClockwiseBold },
  mcp: { nama: { id: "Server MCP", en: "MCP server" }, Ikon: PiPlugsConnectedBold },
  bursa: { nama: { id: "Bursa (testnet)", en: "Exchange (testnet)" }, Ikon: PiChartLineUpBold },
  kamera: { nama: { id: "Kamera aksi", en: "Action camera" }, Ikon: PiCameraBold },
  wifi: { nama: { id: "WiFi kamera", en: "Camera WiFi" }, Ikon: PiWifiHighBold },
  cekAturan: { nama: { id: "Cek aturan iklan", en: "Ad policy check" }, Ikon: PiShieldCheckBold },
  mesin: { nama: { id: "Mesin", en: "Engine" }, Ikon: PiGearSixBold },
};

export const KELOMPOK = ["fitur", "stack", "infrastruktur"];

// Ambil jalur SVG dari komponen ikon react-icons tanpa merender React, supaya ikon yang
// sama bisa digambar di kanvas (halaman UV, hologram) lewat Path2D.
export function jalurIkon(Ikon) {
  const el = Ikon({});
  const viewBox = el?.props?.attr?.viewBox ?? "0 0 24 24";
  const jalur = [];
  const telusuri = (n) => {
    if (!n) return;
    if (Array.isArray(n)) return n.forEach(telusuri);
    if (n.type === "path" && n.props?.d) jalur.push(n.props.d);
    telusuri(n.props?.children);
  };
  telusuri(el?.props?.children);
  const [, , w, h] = viewBox.split(/\s+/).map(Number);
  return { viewBox, ukuran: Math.max(w || 24, h || 24), jalur };
}

// Teknologi dalam satu langkah alur, urut sesuai data; kunci tak dikenal dilewati.
export function teknologiDari(kunci = []) {
  return kunci.map((k) => (TEKNOLOGI[k] ? { kunci: k, ...TEKNOLOGI[k] } : null)).filter(Boolean);
}
