// Cerita v5 arah G, "yang ditimbang" (ADR 0019): sepuluh babak di lantai kantor, lalu kota, peta,
// globe, dan modul lab. Judul dan isi ID dari desain/cerita-v5/naskah-teks.md (set rekomendasi,
// keputusan Farrez 19 Nov 2026). Klaim di isi sudah dikonfirmasi Farrez 19 Nov.
// Teks EN ditulis tersendiri, bukan diterjemahkan. Judulnya set rekomendasi di
// desain/cerita-v5/naskah-teks-en.md, dipilih Farrez 21 Nov 2026.

export const BABAK_V5 = [
  {
    id: "dorongan",
    judul: { id: "Rekap tiap malam, angkanya beda lagi.", en: "Every night's tally comes out different." },
    isi: {
      id: "Nota menumpuk, stok di gudang beda dengan catatan, laporan cabang datang lewat grup WA. Tiga dari empat usaha kecil yang mencatat keuangan masih menulisnya dengan tangan.",
      en: "Receipts pile up, the warehouse count disagrees with the books, and branch reports arrive in a WhatsApp group. Three in four small businesses that keep accounts still write them by hand.",
    },
    // tautan sumbernya belum tercatat di riset; ditambahkan saat seksi ini dipasang
    sumber: { teks: "OCBC BFI 2024" },
  },
  {
    id: "harga-diam",
    judul: { id: "Dibiarkan juga ada ongkosnya.", en: "Leaving it alone costs money too." },
    isi: {
      id: "Jam lembur untuk rekap dan selisih stok yang tidak ketemu jarang dihitung, padahal dibayar tiap bulan.",
      en: "Overtime spent on the tally and stock gaps nobody can trace rarely get counted, yet they are paid for every month.",
    },
  },
  {
    id: "tarikan",
    judul: { id: "Buka HP, angka hari ini sudah ada.", en: "Open your phone, today's numbers are there." },
    isi: {
      id: "Penjualan, stok, dan kas hari ini terkumpul di satu layar, termasuk dari cabang.",
      en: "Today's sales, stock, and cash sit on one screen, branches included.",
    },
    bukti: "nds-etl",
  },
  {
    id: "biaya",
    judul: { id: "Harganya jelas sebelum mulai.", en: "You know the price before we start." },
    isi: {
      id: "Lingkup dan harga ditulis per tahap. Ada permintaan baru di tengah jalan, masuk tahap berikutnya dengan harganya sendiri.",
      en: "Scope and price are written per phase. A new request halfway through goes into the next phase, with its own price.",
    },
  },
  {
    id: "kelangsungan",
    judul: { id: "Sistemnya tetap jalan, siapa pun yang merawat.", en: "It keeps running, whoever looks after it." },
    isi: {
      id: "Hak atas kode ditulis di kontrak: milik Anda atau lisensi, sesuai kesepakatan. Data tetap milik Anda dan bisa diekspor, dan cara kerjanya tercatat.",
      en: "Rights to the code are in the contract: yours or licensed, as agreed. The data stays yours and can be exported, and how it works is written down.",
    },
  },
  {
    id: "data",
    judul: { id: "Rusak di satu tempat, utuh di tempat lain.", en: "Broken in one place, whole in another." },
    isi: {
      id: "Tiap orang hanya membuka bagian yang jadi tugasnya. Cadangannya disimpan terpisah, dan cara mengembalikannya pernah dicoba.",
      en: "Each person opens only the part that is theirs to handle. Backups are kept apart, and restoring them has been rehearsed.",
    },
    bukti: "jeda",
  },
  {
    id: "kebiasaan",
    judul: { id: "Urutannya sama dengan yang biasa tim kerjakan.", en: "The steps follow how your team already works." },
    isi: {
      id: "Urutan layarnya mengikuti cara tim bekerja sekarang. Data lama ikut pindah, dan sistem lama tetap jalan sampai semua yakin.",
      en: "The screens follow the order your team works in now. Old data comes along, and the old system keeps running until everyone is sure.",
    },
  },
  {
    id: "ramai",
    judul: { id: "Diuji sebelum hari ramai.", en: "Tested before the busy days." },
    isi: {
      id: "Sebelum dipakai, sistemnya dicoba dengan lonjakan transaksi seperti tanggal gajian atau promo.",
      en: "Before launch, the system is put through a rush of transactions like payday or a promo.",
    },
    // bukti uji beban dipilih bebas oleh Farrez (21 Nov): lab flash sale, ~114 ribu pembeli dan bot, nol kelebihan jual
    bukti: "flash-sale-lab",
  },
  {
    id: "langkah-kecil",
    judul: { id: "Mulai dari satu cabang.", en: "Start with one branch." },
    isi: {
      id: "Satu cabang atau satu bagian dulu. Hasilnya kelihatan, baru melebar ke tempat lain.",
      en: "One branch or one department first. Once the results show, it spreads to the rest.",
    },
  },
  {
    id: "penutup",
    judul: { id: "Ceritakan yang bikin capek.", en: "Tell me what wears you out." },
    isi: {
      id: "Proyek yang sudah dipakai ada di modul lab. Ambil satu, lihat ceritanya.",
      en: "Projects already in use are in the lab module. Pick one and see its story.",
    },
  },
];
