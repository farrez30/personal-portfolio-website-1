"use client";
import { useEffect, useRef, useState } from "react";

// Huruf berdatangan sebagai karakter acak lalu mengendap ke huruf aslinya,
// kiri ke kanan. Teks utuh selalu ada untuk pembaca layar; tanpa JS atau
// dengan gerak dikurangi, kalimatnya langsung tampil.
const GLIF = "abcdefghijklmnopqrstuvwxyz#%&*+=/<>?";

export default function Acak({ teks, durasi = 1400, tunda = 0, className }) {
  const [tampil, setTampil] = useState(teks);
  const raf = useRef(0);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTampil(teks);
      return;
    }
    const mulai = performance.now() + tunda;
    const n = teks.length;
    const langkah = (now) => {
      const t = Math.max(0, now - mulai);
      let s = "";
      for (let i = 0; i < n; i++) {
        const ch = teks[i];
        // Tiap huruf mengendap pada waktunya sendiri, sedikit acak.
        const endap = (i / n) * durasi * 0.75 + durasi * 0.25 * ((i * 37) % 7) / 7;
        if (ch === " " || t >= endap) s += ch;
        else if (t < endap - durasi * 0.5) s += " ";
        else s += GLIF[(Math.floor(now / 45) + i * 7) % GLIF.length];
      }
      setTampil(s);
      if (t < durasi * 1.1) raf.current = requestAnimationFrame(langkah);
      else setTampil(teks);
    };
    raf.current = requestAnimationFrame(langkah);
    return () => cancelAnimationFrame(raf.current);
  }, [teks, durasi, tunda]);

  return (
    <span className={className}>
      <span className="sr-only">{teks}</span>
      <span aria-hidden="true">{tampil}</span>
    </span>
  );
}
