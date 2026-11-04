"use client";
import dynamic from "next/dynamic";
import { useRef } from "react";
import { proyek } from "@/content/proyek";

const Panggung = dynamic(() => import("./Panggung"), { ssr: false });

// Bagian rak di halaman utuh: setinggi beberapa layar, panggungnya menempel,
// dan gulir di dalam bagian ini memindah album satu per satu.
export default function RakGulir() {
  const ref = useRef(null);
  const n = proyek.length + 1; // ditambah CD musik
  return (
    <section id="rak" ref={ref} className="rak-gulir" style={{ height: `calc(${n - 1} * 42vh + 100vh)` }}>
      <Panggung gulir={ref} />
    </section>
  );
}
