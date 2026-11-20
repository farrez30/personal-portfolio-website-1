"use client";

import { useEffect } from "react";
import { pasangTombolIntip, TANDA } from "./intip-sandi.js";

// Kolom sandi admin Payload (masuk, reset, ganti sandi) tidak punya tombol intip. Komponen ini
// menambahkannya ke setiap kolom, termasuk yang muncul belakangan, tanpa mengganti form Payload,
// jadi kunci akun dan pesan galatnya tetap milik Payload.
export default function PasswordReveal({ children }) {
  useEffect(() => {
    const pengatur = new WeakMap();
    const pasang = () => {
      for (const input of document.querySelectorAll(`input[type="password"]:not([${TANDA}])`)) {
        input.parentElement?.classList.add("intip-sandi");
        pengatur.set(input, pasangTombolIntip(input));
      }
    };
    pasang();
    const pengamat = new MutationObserver(pasang);
    pengamat.observe(document.body, { childList: true, subtree: true });

    // Kembali jadi kolom sandi sebelum dikirim, supaya password manager tetap menawarkan simpan.
    const sembunyikan = (e) => {
      for (const input of e.target.querySelectorAll(`input[${TANDA}]`)) pengatur.get(input)?.(false);
    };
    document.addEventListener("submit", sembunyikan, true);
    return () => {
      pengamat.disconnect();
      document.removeEventListener("submit", sembunyikan, true);
    };
  }, []);

  return (
    <>
      <style>{GAYA}</style>
      {children}
    </>
  );
}

const GAYA = `
.intip-sandi { position: relative; }
.intip-sandi input[${TANDA}] { padding-right: 48px; }
.intip-sandi__tombol {
  position: absolute; top: 50%; right: 2px; transform: translateY(-50%);
  width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center;
  border: 0; border-radius: 4px; background: transparent; color: var(--theme-elevation-500); cursor: pointer;
}
.intip-sandi__tombol:hover { color: var(--theme-elevation-800); }
.intip-sandi__tombol:focus-visible { outline: 2px solid var(--theme-success-500); outline-offset: -2px; }
`;
