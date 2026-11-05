// CD musik di ujung rak. Isinya dari Spotify lewat embed resmi (ADR 0009): playlist
// Farrez, atau lagu, album, dan playlist yang ditempel pengunjung. Bukan proyek, jadi
// tidak tampil di daftar proyek mode Ringan.

// Tautan playlist Farrez (open.spotify.com/playlist/...). Kosong: pengunjung yang memilih.
export const PLAYLIST = "https://open.spotify.com/playlist/1qmBZS2MPCIpgs9tqzYslN";

// Objek ini sengaja bisa diubah: pemutar musik mengisi judul, ringkasan, dan sampulnya
// dari oEmbed, lalu rak 3D menggambar ulang kotak dan cakramnya.
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
  ilustrasi: null,
  ringkas: { id: "Playlist kerja Farrez, diputar lewat Spotify.", en: "Farrez's work playlist, played through Spotify." },
  arsitektur: null,
  buklet: {},
  musik: true,
};

// Keadaan awal, untuk kembali ke playlist Farrez setelah pengunjung memilih lagu sendiri.
export const AWAL_MUSIK = structuredClone(albumMusik);
