"use client";
import { useEffect, useRef } from "react";
import { scroll } from "motion";

// Headline dua bagian yang digerakkan gulir: bagian pertama tercoret, bagian
// kedua naik kata demi kata, dan kata kuncinya menyala. Semua lewat satu
// variabel CSS --p (0 sampai 1), jadi tiap bingkai hanya menulis satu angka.
// Tanpa JS atau dengan gerak dikurangi, keadaan akhir langsung tampil.
export default function HeadlineGulir({ a, b, sorot, idJudul }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--p", "1");
      return;
    }
    el.dataset.gerak = "1";
    const lepas = scroll(
      (p) => {
        el.style.setProperty("--p", p.toFixed(4));
      },
      { target: el.closest("[data-gulir]"), offset: ["start start", "end end"] },
    );
    return () => lepas();
  }, []);

  const kataB = b.split(" ");
  const awalSorot = sorot ? b.indexOf(sorot) : -1;
  let pos = 0;

  return (
    <h1 id={idJudul} ref={ref} className="hg" style={{ "--n": kataB.length }}>
      <span className="sr-only">
        {a} {b}
      </span>
      <span className="hg__a" aria-hidden="true">
        <span className="hg__coret">{a}</span>
      </span>{" "}
      <span className="hg__b" aria-hidden="true">
        {kataB.map((k, i) => {
          const mulai = pos;
          pos += k.length + 1;
          const disorot = awalSorot >= 0 && mulai >= awalSorot && mulai < awalSorot + sorot.length;
          return (
            <span key={i} className={`hg__kata ${disorot ? "hg__kata--sorot" : ""}`} style={{ "--i": i }}>
              {k}{" "}
            </span>
          );
        })}
      </span>
    </h1>
  );
}
