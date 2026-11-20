// Tombol tampil/sembunyi yang dipasang PasswordReveal di sebelah tiap kolom sandi admin.
// DOM biasa, disalin dari coderoach.id (src/lib/password-reveal.ts), supaya bisa dites tanpa browser.

export const TANDA = "data-intip";

/** Pasang tombol setelah kolom, kembalikan pengubahnya supaya submit bisa menyembunyikan lagi. */
export function pasangTombolIntip(input) {
  input.setAttribute(TANDA, "");
  // Sandi yang terlihat jangan masuk kamus keyboard atau berubah huruf besar.
  input.setAttribute("autocapitalize", "none");
  input.setAttribute("autocorrect", "off");
  input.spellcheck = false;

  const tombol = input.ownerDocument.createElement("button");
  tombol.type = "button";
  tombol.className = "intip-sandi__tombol";
  const atur = (terlihat) => {
    input.type = terlihat ? "text" : "password";
    tombol.setAttribute("aria-label", terlihat ? "Sembunyikan sandi" : "Tampilkan sandi");
    tombol.setAttribute("aria-pressed", String(terlihat));
    tombol.innerHTML = terlihat ? MATA_TUTUP : MATA;
  };
  // Fokus dan keyboard ponsel tetap di kolom saat tombol diketuk.
  tombol.addEventListener("mousedown", (e) => e.preventDefault());
  tombol.addEventListener("click", () => atur(input.type === "password"));
  atur(false);
  input.after(tombol);
  return atur;
}

const svg = (isi) =>
  `<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${isi}</svg>`;
const MATA = svg('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>');
const MATA_TUTUP = svg(
  '<path d="M3 3l18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-2.9 3.9M6.6 6.6C3.8 8.5 2 12 2 12s3.5 7 10 7a9.6 9.6 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
);
