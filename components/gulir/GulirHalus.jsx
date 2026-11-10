"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "lenis/dist/lenis.css";

// Gulir halus (Lenis) untuk seluruh halaman, berdetak di ticker GSAP supaya ScrollTrigger dan
// gulirnya selalu sinkron (cara resmi di README Lenis). Mati untuk prefers-reduced-motion dan
// berhenti selama album di rak terbuka, karena rak menahan gulir sendiri (ADR 0007).
export default function GulirHalus() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, anchors: true });
    lenis.on("scroll", ScrollTrigger.update);
    const detak = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(detak);
    gsap.ticker.lagSmoothing(0);

    const panggung = (e) => (e.detail?.keadaan && e.detail.keadaan !== "rak" ? lenis.stop() : lenis.start());
    window.addEventListener("panggung", panggung);
    return () => {
      window.removeEventListener("panggung", panggung);
      gsap.ticker.remove(detak);
      lenis.destroy();
    };
  }, []);
  return null;
}
