"use client";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({ theme: "dark", toggle: () => {} });

export const useTheme = () => useContext(ThemeContext);

export default function ThemeProvider({ children }) {
  // Start with null until mounted so we never render an icon that disagrees
  // with the pre-paint script (which is the source of truth for the attribute).
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    setTheme(current);
  }, []);

  const apply = useCallback((next) => {
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
      // Mirror to a cookie so the server could read it later if needed.
      document.cookie = `theme=${next}; path=/; max-age=31536000; samesite=lax`;
    } catch (e) {
      /* storage unavailable — attribute still applied for this session */
    }
    setTheme(next);
  }, []);

  const toggle = useCallback(() => {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    apply(current === "dark" ? "light" : "dark");
  }, [apply]);

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
