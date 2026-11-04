// CD musik di ujung rak: memutar lagu yang sudah dipakai pemutar piringan hitam.
// Bukan proyek, jadi tidak tampil di mode Ringan.
// Catatan lisensi: berkas ES_ berasal dari Epidemic Sound; lisensinya belum tercatat.
export const LAGU = {
  src: "/assets/audio/ES_Despite_Such_a_Trustworthy_Appearance-Ludvig_Moulin.mp3",
  judul: "Despite Such a Trustworthy Appearance",
  artis: "Ludvig Moulin",
};

export const albumMusik = {
  slug: "musik",
  katalog: "FRZ-00",
  judul: { id: "Teman kerja", en: "Something to work to" },
  jenis: "musik",
  status: "dipakai",
  periode: "",
  warna: "#6b5a3a",
  tautan: {},
  gambar: null,
  ringkas: { id: `${LAGU.judul}, ${LAGU.artis}.`, en: `${LAGU.judul}, ${LAGU.artis}.` },
  arsitektur: null,
  buklet: {},
  musik: true,
};
