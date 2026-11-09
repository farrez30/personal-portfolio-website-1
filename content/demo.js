// Klip demo yang diputar di layar hologram untuk proyek yang tidak bisa dibingkai langsung.
// Asal tiap berkas di public/assets/demo/PROVENANCE.md.
// - rekaman: layar aplikasi aslinya, dijalankan lokal dengan data fiktif.
// - gulir: rekaman gulir halaman case study publik di coderoach.id.
// - sinematik: klip AI (Google Flow) bergaya album proyeknya; menggambarkan orang memakai
//   produknya, bukan layar produk. Satu klip 16:9 untuk desktop dan HP.
export const DEMO = {
  "coderoach-os": { jenis: "rekaman", desktop: "/assets/demo/coderoach-os-desktop.mp4", hp: "/assets/demo/coderoach-os-hp.mp4" },
  "d-day": { jenis: "rekaman", desktop: "/assets/demo/d-day-desktop.mp4", hp: "/assets/demo/d-day-hp.mp4" },
  yiheecam: { jenis: "gulir", desktop: "/assets/demo/yiheecam-desktop.mp4", hp: "/assets/demo/yiheecam-hp.mp4" },
};

export const demoUntuk = (slug) => DEMO[slug] ?? null;
