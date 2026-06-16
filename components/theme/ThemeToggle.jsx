"use client";
import React from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "@/components/providers/ThemeProvider";
import "./themeToggle.css";

const ThemeToggle = () => {
  const { theme, toggle } = useTheme();
  const isLight = theme === "light";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      title={isLight ? "Switch to dark mode" : "Switch to light mode"}
    >
      {/* theme can be null before mount; default to the moon (dark) glyph */}
      {isLight ? <FiMoon /> : <FiSun />}
    </button>
  );
};

export default ThemeToggle;
