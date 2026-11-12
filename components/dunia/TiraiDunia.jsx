import { routing } from "@/i18n/routing";
import { pilihModeAwal } from "@/components/mode/pilihMode";

// Skrip pemblokir sebelum gambar pertama: di beranda, pengunjung yang akan mendapat mode
// Imersif langsung melihat layar loader, bukan hero yang sekejap kemudian tertutup ular.
// Aturan mode memakai fungsi yang sama dengan ModeProvider (pilihModeAwal), disalin apa adanya
// ke skrip. WebGL2 tidak diperiksa di sini supaya gambar pertama tidak tertahan; bila ternyata
// tidak ada, ModeProvider memilih Ringan dan tirai langsung dilepas.
const beranda = `^/(${routing.locales.join("|")})/?$`;
const skrip = `(function(){try{if(!new RegExp(${JSON.stringify(beranda)}).test(location.pathname))return;var s=null;try{s=localStorage.getItem("mode")}catch(e){}var n=navigator;var env={kurangiGerak:matchMedia("(prefers-reduced-motion: reduce)").matches,hematData:!!(n.connection&&n.connection.saveData),memori:n.deviceMemory==null?null:n.deviceMemory,inti:n.hardwareConcurrency==null?null:n.hardwareConcurrency,webgl2:true};if((${pilihModeAwal.toString()})(s,env)==="imersif")document.documentElement.setAttribute("data-dunia","muat")}catch(e){}})();`;

export default function TiraiDunia() {
  return <script dangerouslySetInnerHTML={{ __html: skrip }} />;
}
