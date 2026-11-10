// Cerita gulir "dari demo ke rak": delapan bab di antara hero dan rak. Tiap bab
// meminjam satu tahap rekaman album dan ditutup bukti dari proyek yang ada di rak.
// Usulan, pilihan Farrez, dan sumber tiap klaim: docs/usulan-alur-cerita.md.
// Kalimat yang belum ada buktinya tidak masuk ke sini.

export const BAB = [
  {
    id: "demo",
    label: "Demo",
    judul: {
      id: "Sistem yang bagus sering berawal dari keluhan kecil.",
      en: "Good systems often start as a small complaint.",
    },
    isi: {
      id: "Ceritakan masalahnya dengan kata Anda sendiri. Bagian teknisnya urusan saya.",
      en: "Tell me the problem in your own words. The technical side is my job.",
    },
    // Keluhan yang memang melahirkan proyek di rak, ditulis dari sisi pemakainya.
    keluhan: [
      {
        slug: "viralytics",
        id: "Kampanye, kontrak, dan invoice masih tersebar di spreadsheet dan grup WhatsApp.",
        en: "Campaigns, contracts and invoices still live in spreadsheets and WhatsApp groups.",
      },
      {
        slug: "yiheecam",
        id: "Aplikasi kamera aksinya sudah ditinggalkan vendornya.",
        en: "The action camera's app was abandoned by its vendor.",
      },
      {
        slug: "fifofun",
        id: "Anggaran rumah tangga tidak pernah cocok dengan saldo di bank.",
        en: "The household budget never matches the bank balance.",
      },
      {
        slug: "nds-etl",
        id: "Distributor yang sudah sepuh perlu tahu kapan dan berapa repeat order, cukup dari HP.",
        en: "Older distributors need to know when and how much to reorder, right from their phones.",
      },
      {
        slug: "akarkita",
        id: "Yang muda bingung harus memanggil kerabat dengan sebutan apa.",
        en: "The younger ones are never sure what to call which relative.",
      },
    ],
  },
  {
    id: "aransemen",
    label: "Arrangement",
    judul: {
      id: "Bentuknya ikut kebutuhan.",
      en: "The shape follows the need.",
    },
    isi: {
      id: "Kadang jawabannya aplikasi Android yang tersambung ke kamera aksi. Kadang sistem kantor di laptop, dashboard di HP, atau alur dari iklan sampai obrolan WhatsApp.",
      en: "Sometimes the answer is an Android app paired with an action camera. Sometimes an office system on a laptop, a dashboard on a phone, or a flow from an ad into a WhatsApp chat.",
    },
    bukti: ["yiheecam", "erp-software-house", "nds-etl", "pilot-iklan"],
  },
  {
    id: "transparansi",
    label: "Liner notes",
    judul: {
      id: "Anda selalu tahu posisinya.",
      en: "You always know where things stand.",
    },
    isi: {
      id: "Keputusan penting saya tulis bersama alasannya. Status juga ditulis apa adanya: d-day sudah lulus uji di testnet dan belum pernah memakai uang sungguhan.",
      en: "Every key decision is written down with its reason. Status is stated as it is: d-day has passed testnet and has never used real money.",
    },
    bukti: ["d-day", "coderoach-os"],
  },
  {
    id: "keamanan",
    label: "Sealed",
    judul: {
      id: "Yang bisa melihat hanya yang memang perlu.",
      en: "Only the people who need to see it can see it.",
    },
    isi: {
      id: "Di Jeda, psikolog hanya membaca catatan yang dibagikan kliennya. Di AkarKita, pohon keluarga hanya terbuka lewat undangan.",
      en: "In Jeda, the psychologist reads only what the client chooses to share. AkarKita opens a family tree by invitation only.",
    },
    bukti: ["jeda", "akarkita"],
  },
  {
    id: "keandalan",
    label: "On repeat",
    judul: {
      id: "Tetap jalan di hari yang buruk.",
      en: "Still working on a bad day.",
    },
    isi: {
      id: "Catatan di Jeda tetap bisa ditulis tanpa sinyal, lalu menyusul begitu sinyal kembali. Saat vendor kamera aksi berhenti merawat aplikasinya, YiheeCam menggantikannya.",
      en: "Jeda lets you write with no signal and catches up once you are back online. When an action camera's vendor stopped looking after its app, YiheeCam took its place.",
    },
    bukti: ["jeda", "yiheecam"],
  },
  {
    id: "skala",
    label: "Press run",
    judul: {
      id: "Dari satu klien ke banyak, tanpa mulai dari nol.",
      en: "From one client to many, without starting over.",
    },
    isi: {
      id: "ERP di software house tempat saya bekerja dipakai beberapa klien sekaligus: distribusi dan servis, asuransi kesehatan, sampai payroll perkebunan.",
      en: "The ERP at the software house where I work serves several clients at once: distribution and service, health insurance, plantation payroll.",
    },
    bukti: ["erp-software-house"],
  },
  {
    id: "infrastruktur",
    label: "The plant",
    judul: {
      id: "Yang tidak terlihat dirawat sama telitinya.",
      en: "The parts nobody sees get the same care.",
    },
    isi: {
      id: "Sembilan dari sepuluh proyek di rak punya halaman arsitektur. Anda bisa menelusuri satu permintaan dari layar sampai server, tanpa membuka rahasia klien.",
      en: "Nine of the ten projects on the shelf have an architecture page. You can follow one request from the screen to the server, with no client secrets exposed.",
    },
    bukti: ["coderoach-os", "fifofun"],
  },
  {
    id: "rak",
    label: "In the rack",
    judul: {
      id: "Lalu jadilah sistem yang dipakai tiap hari.",
      en: "And then it becomes a system people use every day.",
    },
    isi: {
      id: "Sepuluh di antaranya ada di rak ini.",
      en: "Ten of them are on this shelf.",
    },
  },
];
