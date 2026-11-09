"use client";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PiPlayFill, PiPauseFill, PiXBold, PiMusicNotesBold, PiLinkBold, PiArrowCounterClockwiseBold, PiArrowSquareOutBold } from "react-icons/pi";
import { useMode } from "@/components/mode/ModeProvider";
import { PLAYLIST, AWAL_MUSIK, albumMusik } from "@/content/musik";
import { uraiTautan, ambilInfo, cuplikan } from "./spotify";
import { cetakSampul, terapkanKeAlbum } from "./album";
import "./pemutar.css";

// Satu pemutar musik untuk kedua mode, lewat embed resmi Spotify (ADR 0009).
// Sebelum pengunjung menekan putar atau memasang tautan, tidak ada satu pun permintaan
// ke Spotify: skrip embed, oEmbed, dan sampul baru dimuat sesudah klik itu.

const KUNCI = "musik:pilihan";
const SKRIP = "https://open.spotify.com/embed/iframe-api/v1";

let apiSpotify = null;
function muatApi() {
  apiSpotify ??= new Promise((selesai, gagal) => {
    window.onSpotifyIframeApiReady = selesai;
    const s = document.createElement("script");
    s.src = SKRIP;
    s.async = true;
    s.onerror = () => {
      apiSpotify = null;
      gagal(new Error("Spotify embed gagal dimuat"));
    };
    document.body.appendChild(s);
  });
  return apiSpotify;
}

function bacaSimpanan() {
  try {
    const d = JSON.parse(localStorage.getItem(KUNCI) ?? "null");
    const tautan = uraiTautan(d?.url);
    return tautan ? { tautan, judul: typeof d.judul === "string" ? d.judul.slice(0, 120) : null } : null;
  } catch {
    return null;
  }
}

function simpan(pilihan) {
  try {
    if (pilihan) localStorage.setItem(KUNCI, JSON.stringify({ url: pilihan.tautan.url, judul: pilihan.judul }));
    else localStorage.removeItem(KUNCI);
  } catch {}
}

const playlistFarrez = uraiTautan(PLAYLIST);

export default function PemutarMusik() {
  const t = useTranslations("pemutar");
  const locale = useLocale();
  const { mode } = useMode();
  const idInput = useId();

  // pilihan: { tautan, judul, milikFarrez }; null bila belum ada lagu sama sekali.
  const [pilihan, setPilihan] = useState(playlistFarrez ? { tautan: playlistFarrez, judul: null, milikFarrez: true } : null);
  const [tersambung, setTersambung] = useState(false);
  const [jalan, setJalan] = useState(false);
  const [pratinjau, setPratinjau] = useState(false);
  const [meta, setMeta] = useState({ url: null, judul: null, sampul: null });
  const [tersembunyi, setTersembunyi] = useState(false);
  const [form, setForm] = useState(false);
  const [teks, setTeks] = useState("");
  const [galat, setGalat] = useState("");

  const wadahEmbed = useRef(null);
  const kontrol = useRef(null);
  const mauPutar = useRef(false);
  const uriDimuat = useRef(null);
  const dariCd = useRef(false);

  // Daftar lagu playlist Farrez untuk buklet, dari server situs sendiri (bukan Spotify
  // langsung), jadi boleh dimuat sebelum klik. Pilihan pengunjung tidak punya daftar lagu.
  const [daftar, setDaftar] = useState(null);
  useEffect(() => {
    if (!playlistFarrez) return;
    let batal = false;
    fetch("/api/musik/daftar")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => !batal && Array.isArray(d?.lagu) && setDaftar(d.lagu))
      .catch(() => {});
    return () => {
      batal = true;
    };
  }, []);
  useEffect(() => {
    albumMusik.daftarLagu = pilihan?.milikFarrez && daftar?.length ? daftar : null;
  }, [pilihan, daftar]);

  // Pilihan pengunjung dari kunjungan sebelumnya (hanya tautan dan judul, tanpa sampul).
  useEffect(() => {
    const lama = bacaSimpanan();
    if (lama) setPilihan({ ...lama, milikFarrez: false });
  }, []);

  const url = pilihan?.tautan.url ?? null;

  // Judul CD langsung mengikuti pilihan; sampulnya menunggu Spotify tersambung.
  useEffect(() => {
    if (!pilihan) terapkanKeAlbum(null);
    else terapkanKeAlbum(pilihan.tautan, { judul: pilihan.judul }, null, { milikFarrez: pilihan.milikFarrez });
  }, [url]);

  // Setelah tersambung: judul dan sampul lewat oEmbed, sampulnya dicetak ulang, lalu
  // kotak, cakram, dan buklet CD musik digambar ulang.
  useEffect(() => {
    if (!tersambung || !pilihan) return;
    let batal = false;
    (async () => {
      const info = await ambilInfo(pilihan.tautan);
      let cetak = null;
      if (!batal && info.sampul) {
        try {
          cetak = await cetakSampul(info.sampul);
        } catch {}
      }
      if (batal) {
        if (cetak) URL.revokeObjectURL(cetak.url);
        return;
      }
      const judul = info.judul ?? pilihan.judul;
      terapkanKeAlbum(pilihan.tautan, { judul }, cetak, { milikFarrez: pilihan.milikFarrez });
      setMeta({ url: pilihan.tautan.url, judul, sampul: cetak?.url ?? null });
      if (!pilihan.milikFarrez && judul) simpan({ ...pilihan, judul });
    })();
    return () => {
      batal = true;
    };
  }, [tersambung, url]);

  // Embed dibuat sekali setelah tersambung, lalu hanya berganti URI.
  useEffect(() => {
    if (!tersambung || !pilihan) return;
    const uri = pilihan.tautan.uri;
    if (kontrol.current) {
      if (uriDimuat.current !== uri) {
        uriDimuat.current = uri;
        kontrol.current.loadUri(uri);
        if (mauPutar.current) kontrol.current.play();
      }
      return;
    }
    let batal = false;
    muatApi()
      .then((api) => {
        if (batal || !wadahEmbed.current) return;
        // Spotify mengganti elemen ini dengan iframe, jadi elemennya bukan milik React.
        const tempat = document.createElement("div");
        wadahEmbed.current.replaceChildren(tempat);
        uriDimuat.current = uri;
        api.createController(tempat, { uri, width: "100%", height: 152 }, (k) => {
          kontrol.current = k;
          k.addListener("ready", () => mauPutar.current && k.play());
          k.addListener("playback_update", (e) => {
            setJalan(!e?.data?.isPaused);
            setPratinjau(cuplikan(e?.data?.duration));
          });
        });
      })
      .catch(() => setTersambung(false));
    return () => {
      batal = true;
    };
  }, [tersambung, url]);

  useEffect(
    () => () => {
      kontrol.current?.destroy?.();
      kontrol.current = null;
    },
    [],
  );

  const putar = useCallback(() => {
    if (!pilihan) {
      setForm(true);
      setTersembunyi(false);
      return;
    }
    mauPutar.current = true;
    setTersambung(true);
    kontrol.current?.play();
  }, [pilihan]);

  const jeda = useCallback(() => {
    mauPutar.current = false;
    const k = kontrol.current;
    if (!k) return;
    if (typeof k.pause === "function") k.pause();
    else k.togglePlay();
  }, []);

  // Play dan Pause di pemutar CD (mode Imersif) saat CD musik ada di dalamnya. Hanya jeda
  // bila putarnya juga datang dari CD, supaya CD proyek tidak mematikan musik latar.
  useEffect(() => {
    const dengar = (e) => {
      if (e.detail?.jalan) {
        dariCd.current = true;
        putar();
      } else if (dariCd.current) {
        dariCd.current = false;
        jeda();
      }
    };
    window.addEventListener("musik", dengar);
    return () => window.removeEventListener("musik", dengar);
  }, [putar, jeda]);

  const pasang = (e) => {
    e.preventDefault();
    const tautan = uraiTautan(teks);
    if (!tautan) {
      setGalat(t("salah"));
      return;
    }
    const baru = { tautan, judul: null, milikFarrez: false };
    simpan(baru);
    setGalat("");
    setTeks("");
    setForm(false);
    setPilihan(baru);
    mauPutar.current = true;
    setTersambung(true);
  };

  const keFarrez = () => {
    simpan(null);
    setForm(false);
    setPilihan({ tautan: playlistFarrez, judul: null, milikFarrez: true });
  };

  const segar = meta.url === url;
  const sampul = segar ? meta.sampul : null;
  const judul = !pilihan
    ? t("kosong")
    : pilihan.milikFarrez
      ? AWAL_MUSIK.judul[locale]
      : (segar && meta.judul) || pilihan.judul || t("pilihanmu");
  const keterangan = !pilihan ? "" : pilihan.milikFarrez ? `${t("playlistFarrez")}, ${t("viaSpotify")}` : `${t("pilihanmu")}, ${t("viaSpotify")}`;
  const labelPutar = jalan ? t("jeda") : t("putar");

  return (
    <>
      <section
        className={`vinyl-player ${mode === "imersif" ? "vinyl-player--imersif" : ""} ${tersembunyi ? "is-hidden" : ""} ${tersambung ? "is-tersambung" : ""}`}
        aria-label={t("sedangDiputar")}
        aria-hidden={tersembunyi}
        inert={tersembunyi ? true : undefined}
      >
        <div className="vinyl-baris">
          <div className="vinyl-stage">
            <span className={`tonearm ${jalan ? "tonearm--on" : ""}`} aria-hidden="true" />
            <div className={`vinyl ${jalan ? "playing" : ""}`}>
              <span className="vinyl__label">
                {sampul ? <img src={sampul} alt="" /> : <span className="vinyl__polos" />}
                <span className="vinyl__hole" />
              </span>
            </div>
          </div>

          <div className="vinyl-meta">
            <small className="vinyl-meta__now">{jalan ? t("sedangDiputar") : t("siap")}</small>
            <strong className="vinyl-meta__title">{judul}</strong>
            {keterangan && <span className="vinyl-meta__artist">{keterangan}</span>}
          </div>

          <div className="vinyl-controls">
            <button type="button" className="vinyl-btn" onClick={jalan ? jeda : putar} aria-label={labelPutar} title={labelPutar}>
              {jalan ? <PiPauseFill aria-hidden="true" /> : <PiPlayFill aria-hidden="true" />}
            </button>
            <button
              type="button"
              className="vinyl-btn"
              onClick={() => setForm((f) => !f)}
              aria-label={t("ganti")}
              title={t("ganti")}
              aria-expanded={form}
            >
              <PiLinkBold aria-hidden="true" />
            </button>
            <button type="button" className="vinyl-btn" onClick={() => setTersembunyi(true)} aria-label={t("sembunyi")} title={t("sembunyi")}>
              <PiXBold aria-hidden="true" />
            </button>
          </div>
        </div>

        {form && (
          <form className="vinyl-form" onSubmit={pasang} noValidate>
            <label htmlFor={idInput}>{t("tempel")}</label>
            <div className="vinyl-form__baris">
              <input
                id={idInput}
                type="url"
                inputMode="url"
                autoComplete="off"
                spellCheck={false}
                placeholder={t("contoh")}
                value={teks}
                onChange={(e) => {
                  setTeks(e.target.value);
                  if (galat) setGalat("");
                }}
                aria-invalid={galat ? true : undefined}
                aria-describedby={`${idInput}-catatan`}
                autoFocus
              />
              <button type="submit" className="vinyl-form__pasang">
                {t("pasang")}
              </button>
            </div>
            <p id={`${idInput}-catatan`} className={galat ? "vinyl-form__galat" : "vinyl-form__catatan"} role={galat ? "alert" : undefined}>
              {galat || t("disimpan")}
            </p>
            {playlistFarrez && pilihan && !pilihan.milikFarrez && (
              <button type="button" className="vinyl-form__kembali" onClick={keFarrez}>
                <PiArrowCounterClockwiseBold aria-hidden="true" /> {t("kembali")}
              </button>
            )}
          </form>
        )}

        <div ref={wadahEmbed} className="vinyl-embed" hidden={!tersambung} />
        {/* Embed tertanam tidak bisa membaca login Spotify bila browser memblokir cookie
            pihak ketiga, jadi lagu penuh selalu tersedia lewat Spotify sendiri. */}
        {tersambung && url && (
          <a className="vinyl-buka" href={url} target="_blank" rel="noopener noreferrer">
            <PiArrowSquareOutBold aria-hidden="true" /> {t("bukaSpotify")}
          </a>
        )}
        {tersambung && pratinjau && (
          <p className="vinyl-cuplikan">
            {t.rich("cuplikan", {
              login: (isi) => (
                <a href="https://accounts.spotify.com/login" target="_blank" rel="noopener noreferrer">
                  {isi}
                </a>
              ),
            })}
          </p>
        )}
      </section>

      <button
        type="button"
        className={`vinyl-reopen ${mode === "imersif" ? "vinyl-reopen--imersif" : ""} ${tersembunyi ? "is-shown" : ""}`}
        onClick={() => setTersembunyi(false)}
        aria-label={t("tampil")}
        title={t("tampil")}
        aria-hidden={!tersembunyi}
        tabIndex={tersembunyi ? 0 : -1}
      >
        <PiMusicNotesBold aria-hidden="true" />
      </button>
    </>
  );
}
