import { Link } from "@/i18n/navigation";
import { eksperimen, alamatHalaman, TEKS_HUB } from "@/content/lab";
import { cariProyek } from "@/content/proyek";
import "./lab.css";

// Panel modul lab dengan token DESIGN.md: tiap eksperimen satu loker berpelat nomor, tiap halaman
// satu laci yang bergeser keluar saat disorot.
export default function HubLab({ locale }) {
  const t = (k) => TEKS_HUB[k][locale];

  return (
    <div className="wadah lab">
      {/* baris tombol seperti /proyek/[slug]; sekaligus memberi ruang untuk pemutar musik di kanan */}
      <p className="lab__kembali">
        <Link href="/#rak" className="tombol">
          {t("kembali")}
        </Link>
      </p>
      <header className="lab__kepala">
        <h1 className="lab__judul">System Design Lab</h1>
        <p className="lab__intro">{t("intro")}</p>
      </header>

      <ul className="lab__rak" role="list">
        {eksperimen.map((e) => {
          const p = cariProyek(e.proyek);
          return (
            <li key={e.slug}>
              <article className="loker" aria-labelledby={`loker-${e.slug}`}>
                <p className="loker__pelat mono">
                  <span className="loker__nomor">{e.nomor}</span>
                  <span>{e.jalur[locale]}</span>
                </p>
                <h2 id={`loker-${e.slug}`} className="loker__judul">
                  {e.judul[locale]}
                </h2>
                <p className="loker__masalah">{e.masalah[locale]}</p>

                <ul className="loker__laci" role="list">
                  {e.halaman.map((h) => (
                    <li key={h.kunci}>
                      <a className="laci" href={alamatHalaman(e, h, locale)}>
                        <span className="laci__gagang" aria-hidden="true" />
                        <span className="laci__judul">{h.judul[locale]}</span>
                        <span className="laci__ket">{h.ket[locale]}</span>
                        <span className="laci__meta mono">{h.meta[locale]}</span>
                      </a>
                    </li>
                  ))}
                </ul>

                {p && (
                  <p className="loker__proyek">
                    <Link href={`/proyek/${p.slug}`} className="loker__tautan">
                      {t("catatanProyek")}
                    </Link>{" "}
                    <span className="mono loker__katalog">{p.katalog}</span>
                  </p>
                )}
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
