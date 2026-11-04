"use client";
import { useMode } from "@/components/mode/ModeProvider";
import RakGulir from "@/components/imersif/RakGulir";
import Rak from "./Rak";

// Server dan render pertama memakai kisi HTML (terbaca mesin pencari dan pembaca
// layar); mode Imersif menggantinya dengan rak 3D yang digeser lewat gulir.
export default function RakSesuaiMode() {
  const { mode } = useMode();
  return mode === "imersif" ? <RakGulir /> : <Rak />;
}
