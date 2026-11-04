"use client";
import { useLocale, useTranslations } from "next-intl";
import { PiArrowUpRightBold, PiGithubLogoBold } from "react-icons/pi";
import { halamanTampil } from "@/content/proyek";
import SinarX from "@/components/sinarx/SinarX";
import "./album.css";

// Isi satu album sebagai HTML: dipakai di mode Ringan, di halaman /proyek/[slug],
// dan sebagai panel teks di samping adegan 3D. Satu sumber, isi yang sama.
export default function AlbumIsi({ p, judulSebagai: Judul = "h2", idJudul }) {
  const t = useTranslations("album");
  const tr = useTranslations("rak");
  const locale = useLocale();
  const halaman = halamanTampil(p);

  return (
    <article className="album" style={{ "--album": p.warna }}>
      <header className="album__kepala">
        <p className="mono album__katalog">{p.katalog}</p>
        <Judul id={idJudul} className="album__judul">
          {p.judul[locale]}
        </Judul>
        <dl className="album__meta mono">
          <div>
            <dt>{t("jenis")}</dt>
            <dd>{tr(`jenis.${p.jenis}`)}</dd>
          </div>
          <div>
            <dt>{t("status")}</dt>
            <dd>{tr(`status.${p.status}`)}</dd>
          </div>
          <div>
            <dt>{t("periode")}</dt>
            <dd>{p.periode}</dd>
          </div>
        </dl>
      </header>

      <section className="album__bagian" aria-labelledby={`${p.slug}-overview`}>
        <h3 id={`${p.slug}-overview`} className="album__label mono">
          {t("halaman.overview")}
        </h3>
        <p className="album__ringkas">{p.ringkas[locale]}</p>
        {(p.tautan.situs || p.tautan.repo) && (
          <p className="album__tautan">
            {p.tautan.situs && (
              <a href={p.tautan.situs} className="tombol" target="_blank" rel="noopener noreferrer">
                {t("bukaSitus")} <PiArrowUpRightBold aria-hidden="true" />
              </a>
            )}
            {p.tautan.repo && (
              <a href={p.tautan.repo} className="tombol" target="_blank" rel="noopener noreferrer">
                <PiGithubLogoBold aria-hidden="true" /> {t("lihatRepo")}
              </a>
            )}
          </p>
        )}
      </section>

      {halaman.map((h) => (
        <section key={h} className="album__bagian" aria-labelledby={`${p.slug}-${h}`}>
          <h3 id={`${p.slug}-${h}`} className="album__label mono">
            {t(`halaman.${h}`)}
          </h3>
          <p className="album__judul-halaman">{p.buklet[h].judul[locale]}</p>
          <p>{p.buklet[h].isi[locale]}</p>
        </section>
      ))}

      {p.arsitektur && (
        <section className="album__bagian" aria-labelledby={`${p.slug}-architecture`}>
          <h3 id={`${p.slug}-architecture`} className="album__label mono">
            {t("halaman.architecture")}
          </h3>
          <SinarX arsitektur={p.arsitektur} warna={p.warna} />
        </section>
      )}
    </article>
  );
}
