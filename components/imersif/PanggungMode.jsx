"use client";
import dynamic from "next/dynamic";
import { useMode } from "@/components/mode/ModeProvider";

// three.js baru dimuat saat mode Imersif dipilih, sesudah halaman HTML tampil.
const Panggung = dynamic(() => import("./Panggung"), { ssr: false });

export default function PanggungMode() {
  const { mode } = useMode();
  return mode === "imersif" ? <Panggung /> : null;
}
