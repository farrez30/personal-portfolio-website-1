"use client";
import dynamic from "next/dynamic";
import { createPortal } from "react-dom";
import { useMode } from "@/components/mode/ModeProvider";

// three.js baru dimuat saat mode Imersif dipilih, sesudah halaman HTML tampil.
const Panggung = dynamic(() => import("./Panggung"), { ssr: false });

// Panggung dipasang langsung di <body>, di luar <main>: <main> diberi `inert`
// selama mode Imersif, dan apa pun di dalamnya ikut tidak bisa diklik.
export default function PanggungMode() {
  const { mode } = useMode();
  if (mode !== "imersif" || typeof document === "undefined") return null;
  return createPortal(<Panggung />, document.body);
}
