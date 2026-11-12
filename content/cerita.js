// Cerita gulir "dari keluhan sampai dipakai tiap hari": sepuluh bab di antara hero dan rak,
// satu benda per bab di dunia toko kaset (components/dunia/props.js, cerita v4). Judul memakai nada B pilihan
// Farrez (11 Nov 2026); proses, pilihan, dan sumber tiap kalimat di desain/cerita-v3/naskah-teks.md.
// Versi EN ditulis tersendiri dari isi yang sama, bukan diterjemahkan dari versi ID.
// Kalimat yang belum ada buktinya tidak masuk ke sini. Sejak v4 (13 Nov 2026) isi bab memakai
// keadaan umum di usaha, bukan nama proyek; nama proyek ada di tautan bukti. Dasar dan pilihan
// tiap kalimat: desain/cerita-v4/usulan-revisi-1.md.

export const BAB = [
  {
    id: "ide",
    judul: {
      id: "Berawal dari keluhan sehari-hari.",
      en: "It starts with an everyday complaint.",
    },
    isi: {
      id: "Tidak perlu tahu istilah teknisnya. Cukup cerita apa yang bikin repot. Cara menyelesaikannya, biar saya yang pikirkan.",
      en: "No need for the technical terms. Just tell me what keeps getting in the way. Working out the fix is my job.",
    },
    // Keluhan yang memang melahirkan proyek di rak, ditulis seperti ucapan pemakainya.
    keluhan: [
      {
        slug: "viralytics",
        id: "Kampanye, kontrak, invoice, semuanya masih di spreadsheet dan grup WA.",
        en: "Campaigns, contracts, invoices, all of it still in spreadsheets and WhatsApp groups.",
      },
      {
        slug: "yiheecam",
        id: "Aplikasi dari vendor lama sudah tidak ada yang merawat.",
        en: "Nobody looks after the app from the old vendor anymore.",
      },
      {
        slug: "fifofun",
        id: "Catatan uang masuk dan keluar tidak pernah cocok dengan saldo bank.",
        en: "Money in and money out never match the bank balance.",
      },
      {
        slug: "nds-etl",
        id: "Distributor yang sudah sepuh ingin cek dari HP: kapan harus repeat order, dan berapa.",
        en: "Older distributors want to check from their phones when to reorder, and how much.",
      },
      {
        slug: "akarkita",
        id: "Anak muda sering bingung harus memanggil kerabatnya apa.",
        en: "The younger ones are never sure what to call which relative.",
      },
    ],
  },
  {
    id: "rencana",
    judul: {
      id: "Semua dimulai dari rencana yang Anda setujui.",
      en: "Everything starts with a plan you sign off on.",
    },
    isi: {
      id: "Keluhan tadi saya rangkum jadi daftar yang jelas: apa yang harus bisa dilakukan sistemnya dan siapa yang memakainya. Anda baca dan setujui dulu.",
      en: "I turn the complaint into a clear list: what the system has to do and who will use it. You read it and approve it first.",
    },
  },
  {
    id: "bentuk",
    judul: {
      id: "Bentuknya dipilih sesuai masalahnya.",
      en: "The shape follows the problem.",
    },
    isi: {
      id: "Kadang cukup dashboard di HP, kadang sistem kantor di laptop, kadang alur dari iklan sampai chat WhatsApp. Aplikasi sendiri hanya kalau memang perlu.",
      en: "Sometimes a phone dashboard is enough, sometimes an office system on a laptop, sometimes a flow from an ad to a WhatsApp chat. A dedicated app only when it is really needed.",
    },
    bukti: ["yiheecam", "erp-software-house", "nds-etl", "pilot-iklan"],
  },
  {
    id: "fondasi",
    judul: {
      id: "Rapi sampai ke bagian yang tidak kelihatan.",
      en: "Tidy all the way to the parts you don't see.",
    },
    isi: {
      id: "Setiap bagian punya catatan cara kerjanya, jadi sistem Anda tidak bergantung pada satu orang.",
      en: "Every part comes with notes on how it works, so your system never depends on one person.",
    },
    bukti: ["coderoach-os", "fifofun"],
  },
  {
    id: "bangun",
    judul: {
      id: "Sudah kelihatan sebelum dibangun.",
      en: "You see it before it gets built.",
    },
    isi: {
      id: "Sebelum mulai dibuat, Anda sudah bisa melihat dan mencoba rancangan tampilannya. Yang kurang pas diubah di situ, baru sesudahnya dibangun.",
      en: "Before anything is built, you can see and try the design. Whatever feels off gets changed there, and only then does building start.",
    },
  },
  {
    id: "progres",
    judul: {
      id: "Progresnya jelas, kabarnya tidak putus.",
      en: "Clear progress, steady updates.",
    },
    isi: {
      id: "Anda tidak perlu menagih kabar. Yang sudah jadi, yang belum, dan alasannya tercatat di satu tempat.",
      en: "You never have to chase for updates. What is done, what is not, and why, all written down in one place.",
    },
    bukti: ["d-day", "coderoach-os"],
  },
  {
    id: "rapi",
    judul: {
      id: "Enak dipakai, bukan cuma bisa dipakai.",
      en: "Pleasant to use, not just usable.",
    },
    isi: {
      id: "Tampilannya sudah dirancang rapi sejak awal. Sebelum dipakai sehari-hari, tim Anda mencobanya dulu, dan langkah yang masih membingungkan dipangkas.",
      en: "The look is designed to be tidy from the start. Before everyday use, your team tries it first, and any step that still confuses gets cut.",
    },
    // Contoh rombakan nyata di luar rak: situs klien Coderoach sebelum dan sesudah.
    luar: [{ nama: "The Global Review", href: "https://coderoach.id/work/the-global-review" }],
  },
  {
    id: "andal",
    judul: {
      id: "Tetap bisa diandalkan saat paling dibutuhkan.",
      en: "Dependable when it matters most.",
    },
    isi: {
      id: "Sinyal hilang atau listrik padam, pencatatan tetap jalan. Datanya menyusul begitu tersambung lagi.",
      en: "Lost signal or a power cut, the recording keeps going. The data catches up once you are back online.",
    },
    bukti: ["jeda"],
  },
  {
    id: "aman",
    judul: {
      id: "Data penting tetap di tangan yang berhak.",
      en: "Important data stays with the right people.",
    },
    isi: {
      id: "Kasir membuka bagian kasir, gudang membuka bagian gudang, laporan keuangan hanya untuk Anda. Usaha tumbuh, sistemnya sanggup mengikuti.",
      en: "Cashiers open the cashier side, the warehouse opens the warehouse side, and the financial reports are yours alone. As the business grows, the system keeps up.",
    },
    bukti: ["jeda", "akarkita", "erp-software-house"],
  },
  {
    id: "rilis",
    judul: {
      id: "Dan akhirnya, dipakai tiap hari.",
      en: "And in the end, used every day.",
    },
    isi: {
      id: "Sepuluh di antaranya ada di rak ini. Ambil satu, lihat ceritanya.",
      en: "Ten of them are on this shelf. Pick one and see its story.",
    },
  },
];
