// Menyusun simpul arsitektur ke kolom kiri ke kanan menurut arah garis,
// supaya diagram tidak butuh koordinat tulisan tangan per proyek.
export function tataLetak(simpul, garis) {
  const masuk = new Map(simpul.map((s) => [s.id, 0]));
  const keluar = new Map(simpul.map((s) => [s.id, []]));
  for (const [a, b] of garis) {
    masuk.set(b, (masuk.get(b) ?? 0) + 1);
    keluar.get(a)?.push(b);
  }
  const kolom = new Map();
  const antre = simpul.filter((s) => masuk.get(s.id) === 0).map((s) => s.id);
  antre.forEach((id) => kolom.set(id, 0));
  // Batas langkah menjaga dari siklus di data.
  const batas = simpul.length * simpul.length;
  for (let i = 0; i < antre.length && i < batas; i++) {
    const id = antre[i];
    for (const b of keluar.get(id) ?? []) {
      const k = Math.max(kolom.get(b) ?? 0, kolom.get(id) + 1);
      if (k !== kolom.get(b)) {
        kolom.set(b, k);
        antre.push(b);
      }
    }
  }
  simpul.forEach((s) => kolom.has(s.id) || kolom.set(s.id, 0));
  const perKolom = new Map();
  const posisi = {};
  for (const s of simpul) {
    const k = kolom.get(s.id);
    const baris = perKolom.get(k) ?? 0;
    perKolom.set(k, baris + 1);
    posisi[s.id] = { kolom: k, baris };
  }
  return {
    posisi,
    perKolom,
    jumlahKolom: Math.max(...kolom.values()) + 1,
    barisTerbanyak: Math.max(...perKolom.values()),
  };
}
