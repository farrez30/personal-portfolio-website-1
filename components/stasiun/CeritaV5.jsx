// Seksi HTML cerita v5: satu babak satu <li class="bab bab--<id>">, jadi naskah kamera
// (components/stasiun/naskah.js) bisa menautkan anchornya. Markup dan kelas mengikuti CeritaKerja
// supaya gaya teks sama; dunia 3D dipasang di atasnya di fase berikutnya.
import { Link } from "@/i18n/navigation";
import { BABAK_V5 } from "@/content/cerita-v5";

export default function CeritaV5({ locale }) {
  const n = String(BABAK_V5.length).padStart(2, "0");
  return (
    <section id="cerita" className="cerita-kerja" aria-labelledby="cerita-v5-judul">
      <h2 id="cerita-v5-judul" className="sr-only">{locale === "en" ? "Before you decide" : "Sebelum Anda memutuskan"}</h2>
      <ol className="cerita-kerja__daftar" style={{ listStyle: "none", padding: 0 }}>
        {BABAK_V5.map((b, i) => (
          <li key={b.id} className={`bab bab--${b.id}`} aria-labelledby={`bab-${b.id}`} data-babak={b.id}>
            <div className="wadah bab__isi">
              <div className="bab__teks">
                <p className="mono bab__nomor" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")} / {n}
                </p>
                <h3 id={`bab-${b.id}`} className="bab__judul">{b.judul[locale]}</h3>
                <p className="bab__teks-isi">{b.isi[locale]}</p>
                {b.sumber && <p className="mono bab__sumber">{locale === "en" ? "Source" : "Sumber"}: {b.sumber.teks}</p>}
                {b.bukti && (
                  <p className="bab__bukti">
                    <Link href={`/proyek/${b.bukti}`}>{locale === "en" ? "See the project" : "Lihat proyeknya"}</Link>
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
