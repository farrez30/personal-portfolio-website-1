// Sampul album versi HTML: kotak CD dengan punggung, ilustrasi proyek di atas kertas,
// dan pita bawah berwarna proyek berisi judul. Versi 3D (imersif/gambar.js) bersusunan sama.
export default function Sampul({ p, locale }) {
  return (
    <span className="sampul" style={{ "--album": p.warna }} aria-hidden="true">
      <span className="sampul__punggung mono">{p.katalog}</span>
      <span className={`sampul__muka ${p.ilustrasi ? "sampul__muka--gambar" : ""}`}>
        {p.ilustrasi ? (
          <>
            <img className="sampul__gambar" src={p.ilustrasi} alt="" loading="lazy" decoding="async" />
            <span className="sampul__pita">
              <span className="sampul__judul">{p.judul[locale]}</span>
              <span className="sampul__katalog mono">{p.katalog}</span>
            </span>
          </>
        ) : (
          <>
            <span className="sampul__judul">{p.judul[locale]}</span>
            <span className="sampul__alur" />
            <span className="sampul__katalog mono">{p.katalog}</span>
          </>
        )}
      </span>
    </span>
  );
}
