// Sampul album versi HTML: kotak CD dengan punggung, warna proyek, dan tipografi.
// Versi 3D digambar di kanvas oleh imersif/sampulKanvas.js dengan susunan yang sama.
export default function Sampul({ p, locale }) {
  return (
    <span className="sampul" style={{ "--album": p.warna }} aria-hidden="true">
      <span className="sampul__punggung mono">{p.katalog}</span>
      <span className="sampul__muka">
        <span className="sampul__judul">{p.judul[locale]}</span>
        <span className="sampul__alur" />
        <span className="sampul__katalog mono">{p.katalog}</span>
      </span>
    </span>
  );
}
