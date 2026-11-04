"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { pilihModeAwal } from "./pilihMode";

const ModeContext = createContext({ mode: null, setMode: () => {} });

export const useMode = () => useContext(ModeContext);

// mode null sampai terpasang: server dan render pertama selalu HTML biasa,
// jadi tidak ada beda hidrasi dan teks tampil sebelum 3D mana pun dimuat.
export default function ModeProvider({ children }) {
  const [mode, setModeState] = useState(null);

  useEffect(() => {
    let simpanan = null;
    try {
      simpanan = localStorage.getItem("mode");
    } catch {}
    setModeState(pilihModeAwal(simpanan, lingkungan()));
  }, []);

  const setMode = useCallback((m) => {
    try {
      localStorage.setItem("mode", m);
    } catch {}
    setModeState(m);
  }, []);

  return <ModeContext.Provider value={{ mode, setMode }}>{children}</ModeContext.Provider>;
}

function lingkungan() {
  const nav = navigator;
  let webgl2 = false;
  try {
    webgl2 = !!document.createElement("canvas").getContext("webgl2");
  } catch {}
  return {
    kurangiGerak: matchMedia("(prefers-reduced-motion: reduce)").matches,
    hematData: !!nav.connection?.saveData,
    memori: nav.deviceMemory ?? null,
    inti: nav.hardwareConcurrency ?? null,
    webgl2,
  };
}
