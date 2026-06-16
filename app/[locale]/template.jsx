"use client";
import React from "react";
import { motion, useReducedMotion } from "framer-motion";

// Templates remount on every navigation (including locale switches), so this
// gives each page load a clean cinematic fade-up.
export default function Template({ children }) {
  const reduce = useReducedMotion();

  if (reduce) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
