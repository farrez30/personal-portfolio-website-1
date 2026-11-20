// Lapisan citra NASA GIBS untuk globe orbit (dipakai orbit.html?lapis=nasa dan orbit-cesium.html).
// Ide lapisannya dari God's Eye View (MIT, D:\Projects\references\gods-eye-view), kodenya tidak disalin.
// Data NASA domain publik di AS; tanpa logo NASA dan tanpa kesan didukung NASA.

export const WMS = "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi";

export const gibs = (lapis, w, h, tanggal) =>
  `${WMS}?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&CRS=EPSG:4326&BBOX=-90,-180,90,180&FORMAT=image/jpeg&LAYERS=${lapis}&WIDTH=${w}&HEIGHT=${h}${tanggal ? "&TIME=" + tanggal : ""}`;

// kotak = [lintang bawah, bujur kiri, lintang atas, bujur kanan] (urutan sumbu WMS 1.3.0 EPSG:4326)
export const gibsKotak = (lapis, [la0, lo0, la1, lo1], w, h) =>
  `${WMS}?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&CRS=EPSG:4326&BBOX=${la0},${lo0},${la1},${lo1}&FORMAT=image/jpeg&LAYERS=${lapis}&WIDTH=${w}&HEIGHT=${h}`;

export const muatGambar = async (url) => { const img = new Image(); img.crossOrigin = "anonymous"; img.src = url; await img.decode(); return img; };

const piksel = (img, w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d", { willReadFrequently: true }); g.drawImage(img, 0, 0, w, h); return g.getImageData(0, 0, w, h).data; };

// citra VIIRS satu hari penuh baru lengkap sehari kemudian
export const tanggalAwan = (ms = Date.now()) => new Date(ms - 86400000).toISOString().slice(0, 10);

// Awan nyata: makin terang dan makin abu piksel VIIRS, makin pekat awannya; tempat yang di Blue
// Marble tanpa awan juga sudah putih (es dan salju) dilewati. Alfa bergradasi, jadi tepinya lembut.
export function petaAwan(viirs, blueMarble, w, h) {
  const v = piksel(viirs, w, h), b = piksel(blueMarble, w, h);
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d"), out = g.createImageData(w, h);
  for (let i = 0; i < v.length; i += 4) {
    const mn = Math.min(v[i], v[i + 1], v[i + 2]), mx = Math.max(v[i], v[i + 1], v[i + 2]);
    const esBM = Math.min(b[i], b[i + 1], b[i + 2]) > 165;
    const pekat = Math.min(1, Math.max(0, (mn - 140) / 90)) * Math.min(1, Math.max(0, 1 - (mx - mn - 18) / 40));
    out.data[i] = out.data[i + 1] = out.data[i + 2] = 255; out.data[i + 3] = esBM ? 0 : Math.round(255 * pekat);
  }
  g.putImageData(out, 0, 0);
  // sedikit dihaluskan supaya tangga piksel 10 km tidak terlihat dari dekat
  const h2 = document.createElement("canvas"); h2.width = w; h2.height = h;
  const g2 = h2.getContext("2d"); g2.filter = "blur(1.5px)"; g2.drawImage(c, 0, 0);
  return h2;
}

// Lampu kota dari Black Marble: kurva lembut tanpa ambang keras, kuning hangat di pinggir kota dan
// hampir putih di pusatnya. Permukaan gelap kebiruan di citra aslinya dibuang.
export function lampuMalam(img, w, h) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d"); g.drawImage(img, 0, 0, w, h);
  const d = g.getImageData(0, 0, w, h);
  for (let i = 0; i < d.data.length; i += 4) {
    const r = d.data[i], gg = d.data[i + 1], b = d.data[i + 2], lum = 0.3 * r + 0.59 * gg + 0.11 * b;
    const v = Math.pow(Math.min(1, Math.max(0, (lum - 28) / 190)), 1.25) * (r >= b ? 1 : 0.4), pusat = v * v;
    d.data[i] = 255 * v; d.data[i + 1] = (178 + 60 * pusat) * v; d.data[i + 2] = (95 + 120 * pusat) * v; d.data[i + 3] = 255;
  }
  g.putImageData(d, 0, 0);
  return c;
}

// Darat bergaya toon: bentuk daratan tetap dari kanvas Natural Earth (sama dengan garis pantai vektor),
// Blue Marble hanya memberi warna. Piksel darat yang di Blue Marble ternyata laut (garis pantainya
// sedikit berbeda) diberi warna darat datar, jadi isian tidak pernah keluar dari garis.
export function daratToon(kanvasSiang, blueMarble) {
  const w = kanvasSiang.width, h = kanvasSiang.height;
  const halus = document.createElement("canvas"); halus.width = w; halus.height = h;
  const gh = halus.getContext("2d", { willReadFrequently: true }); gh.filter = "blur(1.2px)"; gh.drawImage(blueMarble, 0, 0, w, h);
  const b = gh.getImageData(0, 0, w, h).data, g = kanvasSiang.getContext("2d"), d = g.getImageData(0, 0, w, h);
  const tangga = (x) => Math.min(255, Math.round(x / 28) * 28 + 6), datar = [185, 220, 176];
  for (let i = 0; i < d.data.length; i += 4) {
    if (d.data[i] <= 177) continue;
    const laut = b[i + 2] > b[i] + 12 && b[i + 2] > b[i + 1];
    for (let k = 0; k < 3; k++) d.data[i + k] = laut ? datar[k] : tangga(255 - (255 - b[i + k]) * 0.55);
  }
  g.putImageData(d, 0, 0);
}
