"use client";
import { useEffect, useRef } from "react";

// Laptop, HP, dan kamera aksi dari CSS 3D (bukan model glTF): tutup laptop terbuka dan HP
// berputar mengikuti --p bab. Layarnya memutar rekaman layar Coderoach OS yang sudah ada
// di public/assets/demo (asal di PROVENANCE.md di sana), hanya selama terlihat.
const LAYAR = {
  laptop: "/assets/demo/coderoach-os-desktop.mp4",
  hp: "/assets/demo/coderoach-os-hp.mp4",
};

export default function Perangkat() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const video = [...el.querySelectorAll("video")];
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        for (const v of video) {
          if (e.isIntersecting) {
            v.preload = "auto";
            v.play().catch(() => {});
          } else v.pause();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="perangkat">
      <div className="perangkat__laptop">
        <div className="perangkat__tutup">
          <div className="perangkat__layar">
            <video src={LAYAR.laptop} muted loop playsInline preload="metadata" tabIndex={-1} />
          </div>
        </div>
        <div className="perangkat__alas">
          <span className="perangkat__papan-ketik" />
        </div>
      </div>

      <div className="perangkat__hp">
        <div className="perangkat__hp-layar">
          <video src={LAYAR.hp} muted loop playsInline preload="metadata" tabIndex={-1} />
        </div>
      </div>

      <svg className="perangkat__sambung" viewBox="0 0 100 60" preserveAspectRatio="none">
        <path pathLength="1" d="M92 0C92 30 25 30 25 60" />
      </svg>

      <div className="perangkat__kamera">
        <span className="perangkat__lensa" />
        <span className="perangkat__lampu" />
      </div>
    </div>
  );
}
