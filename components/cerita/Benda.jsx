import {
  PiDeviceMobileBold,
  PiCloudBold,
  PiDatabaseBold,
  PiClockCounterClockwiseBold,
  PiLockSimpleBold,
  PiWifiSlashBold,
} from "react-icons/pi";
import { proyek } from "@/content/proyek";
import Perangkat from "./Perangkat";

// Satu benda per bab, semuanya dekorasi (aria-hidden): teks bab sudah memuat isinya.
// Gerak dibaca dari --p milik bab lewat CSS, jadi komponen ini tidak punya state.

// Judul ADR yang memang ada di docs/decisions, dicetak seperti liner notes.
export const CATATAN = [
  ["0001", "Rebuild on Next 16"],
  ["0004", "Immersive and Light modes"],
  ["0006", "Discography as inspiration"],
  ["0008", "Safe public architecture"],
  ["d-day", "testnet, 0 real money"],
];

export default function Benda({ id }) {
  return (
    <div className={`benda benda--${id}`} aria-hidden="true">
      {id === "demo" && (
        <svg viewBox="0 0 320 220" className="benda__coret">
          <path
            pathLength="1"
            d="M18 150c22-40 48-92 82-88 30 4 6 70 38 74 36 4 34-96 72-96 30 0 14 64 44 66 24 2 34-26 50-40"
          />
          <path pathLength="1" className="benda__coret-tipis" d="M40 186c60-10 150-12 236-4" />
          <g className="benda__gelombang">
            {Array.from({ length: 18 }, (_, i) => (
              <rect key={i} x={40 + i * 13} y="196" width="6" height="16" rx="3" style={{ "--i": i }} />
            ))}
          </g>
        </svg>
      )}

      {id === "aransemen" && <Perangkat />}

      {id === "transparansi" && (
        <div className="benda__buklet">
          <span className="mono benda__buklet-kepala">Liner notes</span>
          {CATATAN.map(([a, b], i) => (
            <span key={a} className="mono benda__baris" style={{ "--i": i }}>
              <span>{a}</span>
              <span>{b}</span>
            </span>
          ))}
        </div>
      )}

      {id === "keamanan" && (
        <div className="benda__kotak">
          <span className="benda__kotak-cakram" />
          <span className="benda__segel" />
          <span className="benda__gembok">
            <PiLockSimpleBold />
          </span>
        </div>
      )}

      {id === "keandalan" && (
        <div className="benda__putar">
          <span className="benda__cakram" />
          <span className="benda__sinyal">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} style={{ "--i": i }} />
            ))}
            <PiWifiSlashBold className="benda__tanpa-sinyal" />
          </span>
        </div>
      )}

      {id === "skala" && (
        <div className="benda__tumpuk">
          {Array.from({ length: 7 }, (_, i) => (
            <span key={i} className="benda__keping" style={{ "--i": i }} />
          ))}
        </div>
      )}

      {id === "infrastruktur" && (
        <div className="benda__pabrik">
          <svg viewBox="0 0 300 200" className="benda__jalur">
            <path pathLength="1" d="M60 100H150" />
            <path pathLength="1" d="M150 100L240 46" />
            <path pathLength="1" d="M150 100L240 154" />
          </svg>
          {[
            [PiDeviceMobileBold, 20, 50],
            [PiCloudBold, 50, 50],
            [PiDatabaseBold, 80, 23],
            [PiClockCounterClockwiseBold, 80, 77],
          ].map(([Ikon, x, y], i) => (
            <span key={i} className="benda__simpul" style={{ "--x": `${x}%`, "--y": `${y}%`, "--i": i }}>
              <Ikon />
            </span>
          ))}
        </div>
      )}

      {id === "rak" && (
        <div className="benda__rak">
          <span className="benda__rak-baris">
            {proyek.map((p, i) => (
              <span key={p.slug} className="benda__punggung" style={{ "--album": p.warna, "--i": i }} />
            ))}
          </span>
          <span className="benda__rak-papan" />
        </div>
      )}
    </div>
  );
}
