// Cerita gulir v3 "dari keluhan sampai dipakai tiap hari": sepuluh bab di antara hero dan rak,
// satu bab per panel di soundstage (components/cerita/naskah.js). Judul memakai nada B pilihan
// Farrez (11 Nov 2026); proses, pilihan, dan sumber tiap kalimat di desain/cerita-v3/naskah-teks.md.
// Versi EN ditulis tersendiri dari isi yang sama, bukan diterjemahkan dari versi ID.
// Kalimat yang belum ada buktinya tidak masuk ke sini.

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
        id: "Aplikasi kamera aksinya sudah tidak diurus vendornya.",
        en: "The action camera's app has been abandoned by its vendor.",
      },
      {
        slug: "fifofun",
        id: "Anggaran rumah tangga tidak pernah cocok sama saldo di bank.",
        en: "The household budget never matches the bank balance.",
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
      id: "Kadang cukup dashboard di HP, kadang sistem kantor di laptop, kadang alur dari iklan sampai chat WhatsApp. Ada juga yang memang butuh aplikasi sendiri, seperti YiheeCam untuk kamera aksi.",
      en: "Sometimes a phone dashboard is enough, sometimes an office system on a laptop, sometimes a flow from an ad to a WhatsApp chat. Some problems do need their own app, like YiheeCam for an action camera.",
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
      id: "Sembilan dari sepuluh proyek di rak punya halaman arsitektur, kalau Anda atau tim IT ingin tahu cara kerjanya.",
      en: "Nine of the ten projects on the shelf have an architecture page, in case you or your IT team want to see how they work.",
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
      id: "Keputusan penting saya catat beserta alasannya. Status juga saya tulis apa adanya: d-day sudah lulus uji coba, tapi belum pernah dipakai dengan uang sungguhan.",
      en: "Every key decision is written down with its reason. Status is stated as it is: d-day has passed its trial run and has never touched real money.",
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
  },
  {
    id: "andal",
    judul: {
      id: "Tetap bisa diandalkan saat paling dibutuhkan.",
      en: "Dependable when it matters most.",
    },
    isi: {
      id: "Catatan di Jeda tetap bisa ditulis walau sinyal hilang. Waktu vendor kamera aksi berhenti merawat aplikasinya, YiheeCam yang menggantikan.",
      en: "Jeda keeps taking notes when the signal drops. When an action camera's vendor stopped looking after its app, YiheeCam took its place.",
    },
    bukti: ["jeda", "yiheecam"],
  },
  {
    id: "aman",
    judul: {
      id: "Data penting tetap di tangan yang berhak.",
      en: "Important data stays with the right people.",
    },
    isi: {
      id: "Di Jeda, psikolog cuma bisa membaca catatan yang memang dibagikan kliennya. Pohon keluarga di AkarKita hanya bisa dibuka lewat undangan. Usaha tumbuh, sistemnya sanggup mengikuti: ERP di software house tempat saya bekerja dipakai beberapa klien sekaligus, dari distribusi dan servis, asuransi kesehatan, sampai payroll perkebunan.",
      en: "In Jeda, a psychologist reads only the notes a client chooses to share. An AkarKita family tree opens by invitation only. As the business grows, the system keeps up: the ERP at the software house where I work serves several clients at once, from distribution and service to health insurance and plantation payroll.",
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
