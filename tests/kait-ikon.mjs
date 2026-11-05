// react-icons 4 tidak punya "exports", jadi Node ESM menolak `import ... from "react-icons/si"`
// (impor direktori). Bundler Next tidak keberatan; untuk tes, arahkan ke berkas CJS-nya.
import { registerHooks } from "node:module";

registerHooks({
  resolve(spesifier, konteks, berikut) {
    if (/^react-icons\/[a-z0-9]+$/.test(spesifier)) return berikut(`${spesifier}/index.js`, konteks);
    return berikut(spesifier, konteks);
  },
});
