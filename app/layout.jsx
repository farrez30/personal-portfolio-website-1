import "./globals.css";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata = {
  title: "Farrez Al Hakim - Full Stack Developer",
  description:
    "Portfolio of Farrez Al Hakim — Full-Stack Developer, AI Agentic Engineer, and Data Engineer.",
  icons: {
    icon: "https://img.freepik.com/free-vector/bird-colorful-gradient-design-vector_343694-2506.jpg",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body>{children}</body>
    </html>
  );
}
