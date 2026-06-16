"use client";
import React from "react";
import { ReactLenis } from "lenis/react";

// Mounted once at the layout root. `anchors` lets in-page <a href="#section">
// links smooth-scroll through Lenis; native scroll events still fire so the
// Nav scroll-spy and framer-motion useScroll keep working.
export default function LenisProvider({ children }) {
  return (
    <ReactLenis
      root
      options={{ lerp: 0.1, smoothWheel: true, anchors: true }}
    >
      {children}
    </ReactLenis>
  );
}
