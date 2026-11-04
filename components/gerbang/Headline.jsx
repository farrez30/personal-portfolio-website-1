"use client";
import { useEffect, useRef } from "react";
import { animate, stagger } from "motion";

// Kata-kata naik satu per satu; kalimat utuh sudah ada di HTML sejak awal,
// jadi tanpa JS atau dengan gerak dikurangi pembaca tetap melihat teksnya.
export default function Headline({ teks }) {
  const ref = useRef(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const kata = ref.current?.querySelectorAll("[data-kata]");
    if (!kata?.length) return;
    const a = animate(
      kata,
      { opacity: [0, 1], transform: ["translateY(0.4em)", "translateY(0)"] },
      { delay: stagger(0.045), duration: 0.6, ease: [0.2, 0.7, 0.2, 1] },
    );
    return () => a.stop();
  }, [teks]);

  return (
    <span ref={ref}>
      <span className="sr-only">{teks}</span>
      {teks.split(" ").map((k, i) => (
        <span key={i} aria-hidden="true" data-kata className="kata">
          {k}{" "}
        </span>
      ))}
    </span>
  );
}
