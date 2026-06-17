// Portfolio showroom data.
//
// HOW TO EDIT:
// - `concept` / `impact` / `learnings` hold the case-study copy. Real
//   descriptions are filled where provided; the rest are PLACEHOLDERS — replace
//   the lines marked `// TODO`.
// - `year` and some `role` values are PLACEHOLDERS — set the real ones.
// - `thumbnail` is optional. With no image, the card renders a gradient
//   "poster" keyed off `accent` (0–7). Add `thumbnail: "/assets/.../x.jpg"`
//   (and optionally `thumbnailWebp`) to show a real screenshot instead.
// - `type`: "web" (live iframe + desktop/mobile toggle), "media" (UI/UX
//   carousel from `media[]` + external `links[]`), or "soon" (work-in-progress).

const portfolioData = [
  {
    id: "raja-roti-cemerlang",
    title: "Raja Roti Cemerlang",
    type: "web",
    year: "2024", // TODO confirm year
    role: "Full-Stack Developer", // TODO confirm role
    accent: 0,
    demoUrl: "https://rajaroticemerlang.com/",
    github: "",
    concept: "Company profile and product showcase for a bakery business.", // TODO refine
    impact: "", // TODO
    learnings: "", // TODO
  },
  {
    id: "uruzin",
    title: "Uruzin",
    type: "web",
    year: "2024", // TODO
    role: "Full-Stack Developer", // TODO
    accent: 1,
    demoUrl: "https://uruzin.id/",
    github: "",
    concept: "", // TODO describe Uruzin
    impact: "",
    learnings: "",
  },
  {
    id: "coderoach-studio",
    title: "Coderoach Studio",
    type: "web",
    year: "2024", // TODO
    role: "Full-Stack Developer", // TODO
    accent: 2,
    demoUrl: "https://coderoach-web.vercel.app/",
    github: "",
    concept: "Studio website for Coderoach.", // TODO refine
    impact: "",
    learnings: "",
  },
  {
    id: "tumtim-cookies",
    title: "Tum Tim Cookies",
    type: "web",
    year: "2024", // TODO
    role: "Full-Stack Developer", // TODO
    accent: 3,
    demoUrl: "https://tumtimcookies.com/",
    github: "",
    concept: "Brand and product site for a cookies business.", // TODO refine
    impact: "",
    learnings: "",
  },
  {
    id: "locascore",
    title: "Locascore",
    type: "web",
    year: "2025", // TODO
    role: "Full-Stack Developer", // TODO
    accent: 4,
    demoUrl: "https://locascore-three.vercel.app/",
    github: "",
    concept: "", // TODO describe Locascore
    impact: "",
    learnings: "",
  },
  {
    id: "viralytics",
    title: "Viralytics",
    type: "web",
    year: "2025", // TODO
    role: "Full-Stack Developer", // TODO
    accent: 5,
    demoUrl: "https://viralytics-web.vercel.app/",
    github: "",
    concept: "", // TODO describe Viralytics
    impact: "",
    learnings: "",
  },
  {
    id: "rpn-agro",
    title: "RPN Agro",
    type: "web",
    year: "2024", // TODO
    role: "Full-Stack Developer", // TODO
    accent: 6,
    demoUrl: "https://rpn-agro.com/",
    github: "",
    concept: "", // TODO describe RPN Agro
    impact: "",
    learnings: "",
  },
  {
    id: "groseria",
    title: "Groseria",
    type: "web",
    year: "2023", // TODO
    role: "Full-Stack Developer", // TODO
    accent: 7,
    demoUrl: "https://groseria-client.vercel.app/",
    github: "https://github.com/farrez30",
    concept: "An e-grocery platform for browsing, ordering, and managing grocery products.", // TODO refine
    impact: "",
    learnings: "",
  },
  {
    id: "payung-hukum",
    title: "Payung Hukum",
    type: "media",
    year: "2024", // TODO
    role: "Business & UI/UX",
    accent: 2,
    concept:
      "A digital-first biro jasa (agency) assisting businesses and individuals with company registration, Intellectual Property, and taxation.",
    impact: "", // TODO
    learnings: "", // TODO
    links: [
      { label: "Instagram", href: "https://www.instagram.com/payunghukum.id/" },
      { label: "Figma", href: "" }, // TODO add Figma link
    ],
    media: [], // TODO add Figma exports: { kind: "image", src: "/assets/.../x.png" }
  },
  {
    id: "cuanbot",
    title: "Cuanbot",
    type: "media",
    year: "2024", // TODO
    role: "Front-End Developer (UI/UX partner)",
    accent: 5,
    concept:
      "A custom trading bot interface built to visualize and execute a client's proprietary algorithmic formulas.",
    impact: "", // TODO
    learnings:
      "Focused on the front-end implementation, translating a UI/UX partner's designs into a working interface.",
    links: [], // TODO add Figma / demo link if available
    // PLACEHOLDER media so the carousel is demonstrable — REPLACE with your
    // real Cuanbot UI/UX exports (Figma screenshots / mockups).
    media: [
      { kind: "image", src: "/assets/pngjpg/portfolio2.jpg" },
      { kind: "image", src: "/assets/pngjpg/portfolio3.jpg" },
      { kind: "image", src: "/assets/pngjpg/portfolio4.jpg" },
    ],
  },
  {
    id: "laporta",
    title: "Laporta",
    type: "soon",
    year: "2025",
    role: "Full-Stack Developer", // TODO confirm
    accent: 1,
    concept:
      "A comprehensive, centralized financial tracking web application designed specifically for businesses with multiple branch outlets.",
    impact: "",
    learnings: "",
  },
  {
    id: "bpu-utm",
    title: "Platform Digital BPU Universitas Trunojoyo Madura",
    type: "soon",
    year: "2025",
    role: "Full-Stack Developer", // TODO confirm
    accent: 4,
    concept: "Digital platform for BPU Universitas Trunojoyo Madura.", // TODO refine
    impact: "",
    learnings: "",
  },
];

export default portfolioData;
