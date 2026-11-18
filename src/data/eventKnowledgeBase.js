/**
 * Knowledge Base Resmi FILKOM Event Management - Universitas Klabat
 * Berisi data resmi 4 event utama serta 230 Pertanyaan dan Jawaban (FAQ)
 * yang komprehensif untuk mendasari jawaban Gemini AI Event Assistant.
 */

export const OFFICIAL_EVENTS = [
  {
    "id": "e2",
    "title": "Workshop Machine Learning dengan Python",
    "date": "2026-11-25",
    "formattedDate": "Rabu, 25 November 2026",
    "startTime": "13:30",
    "endTime": "16:30",
    "timeZone": "WITA",
    "location": "Lab Komputer FILKOM Lantai 2",
    "category": "Workshop",
    "quota": 50,
    "registeredCount": 36,
    "remainingQuota": 14,
    "fee": 0,
    "feeLabel": "Gratis",
    "organizer": "BEM FILKOM",
    "description": "Workshop hands-on implementasi model Machine Learning menggunakan Python dan library scikit-learn. Peserta akan belajar membangun model prediksi dari data nyata. Wajib membawa laptop.",
    "requirements": [
      "Membawa laptop pribadi",
      "Python 3.x dan scikit-learn terpasang"
    ],
    "benefits": [
      "Ilmu implementasi ML praktis",
      "Dataset proyek nyata",
      "E-Sertifikat resmi kehadiran"
    ]
  },
  {
    "id": "e4",
    "title": "Pelatihan Desain UI/UX dengan Figma",
    "date": "2026-12-10",
    "formattedDate": "Kamis, 10 Desember 2026",
    "startTime": "09:00",
    "endTime": "16:00",
    "timeZone": "WITA",
    "location": "Ruang Seminar FILKOM Lt. 3",
    "category": "Pelatihan",
    "quota": 40,
    "registeredCount": 39,
    "remainingQuota": 1,
    "fee": 0,
    "feeLabel": "Gratis",
    "organizer": "BEM FILKOM",
    "description": "Pelatihan intensif tentang prinsip desain antarmuka pengguna menggunakan Figma. Peserta akan membuat prototype aplikasi mobile dari awal hingga siap presentasi.",
    "requirements": [
      "Membawa laptop",
      "Akun Figma aktif"
    ],
    "benefits": [
      "Template UI kit mobile",
      "Teknik prototyping interaktif",
      "E-Sertifikat resmi kehadiran"
    ]
  },
  {
    "id": "e5",
    "title": "Malam Apresiasi Mahasiswa FILKOM 2026",
    "date": "2026-12-18",
    "formattedDate": "Jumat, 18 Desember 2026",
    "startTime": "18:00",
    "endTime": "22:00",
    "timeZone": "WITA",
    "location": "Gedung Olahraga UNKLAB",
    "category": "Sosial & Budaya",
    "quota": 300,
    "registeredCount": 127,
    "remainingQuota": 173,
    "fee": 0,
    "feeLabel": "Gratis",
    "organizer": "BEM FILKOM",
    "description": "Acara tahunan Fakultas Ilmu Komputer sebagai bentuk apresiasi kepada mahasiswa berprestasi, penampilan seni, dan pengumuman penghargaan akademik semester ganjil 2026.",
    "requirements": [
      "Pakaian rapi dan sopan (smart casual / formal)",
      "Membawa tiket QR pendaftaran"
    ],
    "benefits": [
      "Makan malam bersama",
      "Penganugerahan mahasiswa berprestasi",
      "Pertunjukan seni & networking"
    ]
  },
  {
    "id": "93Z74tr8Cew",
    "title": "FILKOM Day",
    "date": "2026-11-20",
    "formattedDate": "Jumat, 20 November 2026",
    "startTime": "08:00",
    "endTime": "19:00",
    "timeZone": "WITA",
    "location": "Kampus UNKLAB",
    "category": "Lainnya",
    "quota": 100,
    "registeredCount": 0,
    "remainingQuota": 100,
    "fee": 225000,
    "feeLabel": "Rp 225.000 (Berbayar)",
    "paymentInfo": {
      "bank": "BNI",
      "accountNumber": "0000000000",
      "accountName": "a.n. Gledial"
    },
    "mealOptions": [
      "Ayam",
      "Ikan",
      "Vegetarian"
    ],
    "shirtSizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "organizer": "BEM FILKOM",
    "description": "Kegiatan tahunan akbar seluruh civitas akademika Fakultas Ilmu Komputer. Wajib diikuti oleh seluruh mahasiswa FILKOM.",
    "requirements": [
      "Wajib diikuti seluruh mahasiswa aktif FILKOM",
      "Menyelesaikan pembayaran Rp 225.000 dan mengunggah bukti transfer"
    ],
    "benefits": [
      "Baju kaos resmi FILKOM Day",
      "Konsumsi makanan (pilihan Ayam/Ikan/Vegetarian)",
      "E-Sertifikat resmi kegiatan"
    ]
  }
];

export const EVENT_KNOWLEDGE_BASE = [
  {
    "id": 1,
    "category": "Pertanyaan Umum Sistem",
    "question": "Apa itu sistem FILKOM Event Management?",
    "answer": "FILKOM Event Management adalah sistem informasi resmi Fakultas Ilmu Komputer Universitas Klabat untuk mengelola event, pendaftaran mahasiswa, absensi berbasis QR code, serta penerbitan sertifikat digital.",
    "keywords": [
      "sistem",
      "filkom event management",
      "aplikasi",
      "portal"
    ]
  },
  {
    "id": 2,
    "category": "Pertanyaan Umum Sistem",
    "question": "Siapa saja yang bisa menggunakan sistem ini?",
    "answer": "Sistem ini dapat diakses oleh mahasiswa aktif FILKOM (@student.unklab.ac.id), panitia pelaksana/BEM FILKOM, dan Administrator fakultas.",
    "keywords": [
      "pengguna",
      "siapa saja",
      "akses"
    ]
  },
  {
    "id": 3,
    "category": "Pertanyaan Umum Sistem",
    "question": "Apakah saya harus login untuk melihat dan mendaftar event?",
    "answer": "Ya, Anda harus login menggunakan akun mahasiswa FILKOM dengan email resmi @student.unklab.ac.id untuk dapat mendaftar event dan mengakses tiket absensi.",
    "keywords": [
      "login",
      "masuk",
      "wajib login"
    ]
  },
  {
    "id": 4,
    "category": "Pertanyaan Umum Sistem",
    "question": "Apa fungsi AI Event Assistant ini?",
    "answer": "AI Event Assistant ini bertugas membantu menjawab pertanyaan seputar jadwal kegiatan, detail event, alur pendaftaran, kuota, pengumuman fakultas, serta memberikan rekomendasi event yang cocok untuk Anda.",
    "keywords": [
      "fungsi ai",
      "chatbot",
      "bisa apa saja"
    ]
  },
  {
    "id": 5,
    "category": "Pertanyaan Umum Sistem",
    "question": "Apakah AI Assistant ini bisa mendaftarkan event untuk saya?",
    "answer": "Tidak, AI Assistant tidak dapat mendaftarkan atau membatalkan event secara otomatis. Untuk mendaftar, silakan buka menu \"Daftar Event\", pilih event yang diinginkan, lalu klik tombol \"Daftar\".",
    "keywords": [
      "daftar otomatis",
      "daftarkan saya",
      "bisa daftarin"
    ]
  },
  {
    "id": 6,
    "category": "Pertanyaan Umum Sistem",
    "question": "Apakah AI Assistant bisa melihat tiket atau data pribadi saya?",
    "answer": "Tidak, AI Assistant tidak terhubung langsung ke database privat pendaftaran Anda demi keamanan. Anda dapat memeriksa tiket dan barcode pribadi di menu \"Riwayat Pendaftaran\".",
    "keywords": [
      "lihat data saya",
      "lihat tiket saya",
      "bisa lihat riwayat"
    ]
  },
  {
    "id": 7,
    "category": "Pertanyaan Umum Sistem",
    "question": "Di mana saya bisa melihat daftar event yang tersedia?",
    "answer": "Daftar seluruh event yang sedang dibuka dapat dilihat pada menu \"Daftar Event\" di panel navigasi sebelah kiri portal mahasiswa.",
    "keywords": [
      "daftar event",
      "menu event",
      "lihat kegiatan"
    ]
  },
  {
    "id": 8,
    "category": "Pertanyaan Umum Sistem",
    "question": "Bagaimana cara melihat tiket dan barcode yang sudah saya daftarkan?",
    "answer": "Anda dapat melihat tiket, barcode QR absensi, serta kwitansi pendaftaran di menu \"Riwayat Pendaftaran\".",
    "keywords": [
      "tiket",
      "barcode",
      "qr",
      "riwayat pendaftaran"
    ]
  },
  {
    "id": 9,
    "category": "Pertanyaan Umum Sistem",
    "question": "Di mana saya bisa membaca pengumuman resmi fakultas?",
    "answer": "Pengumuman resmi fakultas dapat diakses melalui menu \"Pengumuman Fakultas\" di sidebar portal mahasiswa.",
    "keywords": [
      "pengumuman",
      "menu pengumuman",
      "info kampus"
    ]
  },
  {
    "id": 10,
    "category": "Pertanyaan Umum Sistem",
    "question": "Apakah sistem ini terhubung dengan email mahasiswa?",
    "answer": "Ya, notifikasi pendaftaran, verifikasi pembayaran, pengumuman kegiatan, dan pengiriman sertifikat dikirimkan langsung ke email resmi mahasiswa.",
    "keywords": [
      "notifikasi email",
      "terhubung email"
    ]
  },
  {
    "id": 11,
    "category": "Pertanyaan Umum Sistem",
    "question": "Jam berapa saja event biasanya dilaksanakan?",
    "answer": "Waktu pelaksanaan bervariasi sesuai jadwal masing-masing event (WITA), yang dapat dilihat langsung pada detail event di portal ini.",
    "keywords": [
      "jam berapa",
      "waktu pelaksanaan",
      "zona waktu"
    ]
  },
  {
    "id": 12,
    "category": "Pertanyaan Umum Sistem",
    "question": "Zona waktu apa yang digunakan pada sistem FILKOM Events?",
    "answer": "Sistem FILKOM Events menggunakan zona waktu Waktu Indonesia Tengah (WITA / UTC+8).",
    "keywords": [
      "zona waktu",
      "wita",
      "timezone"
    ]
  },
  {
    "id": 13,
    "category": "Pertanyaan Umum Sistem",
    "question": "Apakah sistem ini bisa diakses lewat smartphone?",
    "answer": "Ya, tampilan portal FILKOM Events responsif dan dapat diakses dengan nyaman melalui browser ponsel maupun laptop.",
    "keywords": [
      "hp",
      "mobile",
      "smartphone",
      "tampilan"
    ]
  },
  {
    "id": 14,
    "category": "Pertanyaan Umum Sistem",
    "question": "Ke mana saya harus melapor jika sistem mengalami kendala teknis?",
    "answer": "Silakan hubungi administrator fakultas melalui ruang admin FILKOM atau sampaikan kepada pengurus BEM FILKOM.",
    "keywords": [
      "kendala teknis",
      "lapor bug",
      "error"
    ]
  },
  {
    "id": 15,
    "category": "Pertanyaan Umum Sistem",
    "question": "Apakah data pendaftaran saya tersimpan aman?",
    "answer": "Ya, data pendaftaran dan absensi Anda tersimpan pada basis data resmi sistem FILKOM Event Management.",
    "keywords": [
      "keamanan data",
      "aman"
    ]
  },
  {
    "id": 16,
    "category": "Informasi Seluruh Event Mendatang",
    "question": "Event apa saja yang akan datang di FILKOM?",
    "answer": "Saat ini terdapat 4 event resmi mendatang di FILKOM UNKLAB:\n1. FILKOM Day (20 Nov 2026)\n2. Workshop Machine Learning dengan Python (25 Nov 2026)\n3. Pelatihan Desain UI/UX dengan Figma (10 Des 2026)\n4. Malam Apresiasi Mahasiswa FILKOM 2026 (18 Des 2026).",
    "keywords": [
      "event mendatang",
      "jadwal event",
      "ada event apa saja",
      "daftar kegiatan"
    ]
  },
  {
    "id": 17,
    "category": "Informasi Seluruh Event Mendatang",
    "question": "Apa event terdekat yang akan diadakan?",
    "answer": "Event terdekat adalah FILKOM Day yang akan diadakan pada Jumat, 20 November 2026 di Kampus UNKLAB mulai pukul 08:00 WITA.",
    "keywords": [
      "event terdekat",
      "yang paling dekat",
      "kapan terdekat"
    ]
  },
  {
    "id": 18,
    "category": "Informasi Seluruh Event Mendatang",
    "question": "Kapan FILKOM Day dilaksanakan?",
    "answer": "FILKOM Day diselenggarakan pada Jumat, 20 November 2026, pukul 08:00 - 19:00 WITA di Kampus UNKLAB.",
    "keywords": [
      "kapan filkom day",
      "tanggal filkom day"
    ]
  },
  {
    "id": 19,
    "category": "Informasi Seluruh Event Mendatang",
    "question": "Kapan Workshop Machine Learning diadakan?",
    "answer": "Workshop Machine Learning dengan Python diselenggarakan pada Rabu, 25 November 2026, pukul 13:30 - 16:30 WITA di Lab Komputer FILKOM Lantai 2.",
    "keywords": [
      "kapan workshop ml",
      "tanggal workshop machine learning"
    ]
  },
  {
    "id": 20,
    "category": "Informasi Seluruh Event Mendatang",
    "question": "Kapan Pelatihan UI/UX Figma diadakan?",
    "answer": "Pelatihan Desain UI/UX dengan Figma diselenggarakan pada Kamis, 10 Desember 2026, pukul 09:00 - 16:00 WITA di Ruang Seminar FILKOM Lt. 3.",
    "keywords": [
      "kapan pelatihan ui ux",
      "tanggal ui ux"
    ]
  },
  {
    "id": 21,
    "category": "Informasi Seluruh Event Mendatang",
    "question": "Kapan Malam Apresiasi Mahasiswa FILKOM dilaksanakan?",
    "answer": "Malam Apresiasi Mahasiswa FILKOM 2026 dilaksanakan pada Jumat, 18 Desember 2026, pukul 18:00 - 22:00 WITA di Gedung Olahraga UNKLAB.",
    "keywords": [
      "kapan malam apresiasi",
      "tanggal malam apresiasi"
    ]
  },
  {
    "id": 22,
    "category": "Informasi Seluruh Event Mendatang",
    "question": "Apakah ada kegiatan di bulan November 2026?",
    "answer": "Ada dua kegiatan di bulan November 2026, yaitu:\n1. FILKOM Day pada 20 November 2026\n2. Workshop Machine Learning dengan Python pada 25 November 2026.",
    "keywords": [
      "event november",
      "bulan november"
    ]
  },
  {
    "id": 23,
    "category": "Informasi Seluruh Event Mendatang",
    "question": "Apakah ada kegiatan di bulan Desember 2026?",
    "answer": "Ada dua kegiatan di bulan Desember 2026, yaitu:\n1. Pelatihan Desain UI/UX dengan Figma pada 10 Desember 2026\n2. Malam Apresiasi Mahasiswa FILKOM pada 18 Desember 2026.",
    "keywords": [
      "event desember",
      "bulan desember"
    ]
  },
  {
    "id": 24,
    "category": "Informasi Seluruh Event Mendatang",
    "question": "Dari seluruh event mendatang, mana yang gratis?",
    "answer": "Tiga event diselenggarakan secara Gratis: Workshop Machine Learning dengan Python, Pelatihan Desain UI/UX dengan Figma, dan Malam Apresiasi Mahasiswa FILKOM 2026.",
    "keywords": [
      "event gratis",
      "tanpa bayar",
      "free"
    ]
  },
  {
    "id": 25,
    "category": "Informasi Seluruh Event Mendatang",
    "question": "Event mana yang berbayar?",
    "answer": "Hanya FILKOM Day yang berbayar dengan biaya pendaftaran sebesar Rp 225.000 (sudah termasuk baju kaos dan konsumsi).",
    "keywords": [
      "event berbayar",
      "bayar"
    ]
  },
  {
    "id": 26,
    "category": "Informasi Seluruh Event Mendatang",
    "question": "Apakah semua event memberikan sertifikat?",
    "answer": "Ya, peserta yang hadir pada kegiatan dan tercatat absensinya akan diterbitkan e-sertifikat resmi.",
    "keywords": [
      "sertifikat",
      "apakah dapat sertif"
    ]
  },
  {
    "id": 27,
    "category": "Informasi Seluruh Event Mendatang",
    "question": "Apakah saya boleh mendaftar lebih dari satu event?",
    "answer": "Tentu saja! Mahasiswa diperbolehkan mendaftar lebih dari satu event selama kuota pendaftaran masih tersedia dan jadwal tidak bentrok.",
    "keywords": [
      "daftar banyak",
      "lebih dari satu"
    ]
  },
  {
    "id": 28,
    "category": "Informasi Seluruh Event Mendatang",
    "question": "Apakah ada seminar tentang cybersecurity yang dibuka saat ini?",
    "answer": "Saat ini belum ada event khusus Cyber Security yang berstatus Published di sistem resmi. Pantau terus pengumuman fakultas untuk update kegiatan mendatang.",
    "keywords": [
      "cyber security",
      "keamanan siber"
    ]
  },
  {
    "id": 29,
    "category": "Informasi Seluruh Event Mendatang",
    "question": "Apakah ada kompetisi programming atau hackathon?",
    "answer": "Saat ini belum ada jadwal kompetisi programming yang terdaftar. Kegiatan yang tersedia saat ini meliputi workshop, pelatihan, FILKOM Day, dan malam apresiasi.",
    "keywords": [
      "lomba",
      "kompetisi",
      "hackathon"
    ]
  },
  {
    "id": 30,
    "category": "Informasi Seluruh Event Mendatang",
    "question": "Siapa yang mengorganisir seluruh event ini?",
    "answer": "Seluruh kegiatan resmi ini dikoordinasikan oleh Badan Eksekutif Mahasiswa (BEM) FILKOM bersama panitia pelaksana di bawah naungan Fakultas Ilmu Komputer UNKLAB.",
    "keywords": [
      "panitia",
      "penyelenggara",
      "organizer"
    ]
  },
  {
    "id": 31,
    "category": "Detail Workshop Machine Learning",
    "question": "Apa topik utama Workshop Machine Learning?",
    "answer": "Topik utama workshop ini adalah hands-on implementasi model Machine Learning menggunakan bahasa Python dan library scikit-learn untuk membangun model prediksi data nyata.",
    "keywords": [
      "topik machine learning",
      "materi ml",
      "belajar apa di ml"
    ]
  },
  {
    "id": 32,
    "category": "Detail Workshop Machine Learning",
    "question": "Kapan Workshop Machine Learning dilaksanakan?",
    "answer": "Workshop Machine Learning dilaksanakan pada hari Rabu, 25 November 2026, pukul 13:30 hingga 16:30 WITA.",
    "keywords": [
      "kapan ml",
      "jadwal ml",
      "jam ml"
    ]
  },
  {
    "id": 33,
    "category": "Detail Workshop Machine Learning",
    "question": "Di mana lokasi Workshop Machine Learning?",
    "answer": "Lokasinya berada di Lab Komputer FILKOM Lantai 2, Kampus Universitas Klabat.",
    "keywords": [
      "lokasi ml",
      "tempat workshop ml",
      "ruangan ml"
    ]
  },
  {
    "id": 34,
    "category": "Detail Workshop Machine Learning",
    "question": "Berapa biaya pendaftaran Workshop Machine Learning?",
    "answer": "Pendaftaran Workshop Machine Learning adalah Gratis (Rp 0).",
    "keywords": [
      "biaya ml",
      "harga ml",
      "apakah ml bayar"
    ]
  },
  {
    "id": 35,
    "category": "Detail Workshop Machine Learning",
    "question": "Berapa total kuota peserta Workshop Machine Learning?",
    "answer": "Total kuota yang disediakan adalah 50 peserta.",
    "keywords": [
      "kuota ml",
      "kapasitas ml"
    ]
  },
  {
    "id": 36,
    "category": "Detail Workshop Machine Learning",
    "question": "Berapa sisa kuota Workshop Machine Learning saat ini?",
    "answer": "Saat ini sudah terdaftar 36 peserta dari kuota 50, sehingga tersisa 14 kursi lagi.",
    "keywords": [
      "sisa kuota ml",
      "apakah ml masih ada kuota"
    ]
  },
  {
    "id": 37,
    "category": "Detail Workshop Machine Learning",
    "question": "Apa saja persyaratan untuk mengikuti Workshop Machine Learning?",
    "answer": "Peserta diwajibkan membawa laptop pribadi dan sudah menginstal Python 3.x beserta pustaka pendukung seperti scikit-learn.",
    "keywords": [
      "syarat ml",
      "persyaratan ml",
      "bawa apa ml"
    ]
  },
  {
    "id": 38,
    "category": "Detail Workshop Machine Learning",
    "question": "Apakah pemula boleh ikut Workshop Machine Learning?",
    "answer": "Boleh. Workshop ini dirancang hands-on sehingga mahasiswa yang baru tertarik pada kecerdasan buatan dapat mengikuti pembelajarannya.",
    "keywords": [
      "pemula ml",
      "apakah pemula boleh ikut"
    ]
  },
  {
    "id": 39,
    "category": "Detail Workshop Machine Learning",
    "question": "Library apa saja yang dipelajari pada Workshop ML?",
    "answer": "Workshop ini berfokus pada scikit-learn serta library pendukung analisis data dengan Python.",
    "keywords": [
      "library ml",
      "scikit learn"
    ]
  },
  {
    "id": 40,
    "category": "Detail Workshop Machine Learning",
    "question": "Apakah peserta Workshop ML mendapatkan sertifikat?",
    "answer": "Ya, peserta yang hadir dan melakukan scan absensi akan mendapatkan e-sertifikat resmi dari FILKOM UNKLAB.",
    "keywords": [
      "sertifikat ml",
      "sertif ml"
    ]
  },
  {
    "id": 41,
    "category": "Detail Workshop Machine Learning",
    "question": "Berapa lama durasi Workshop Machine Learning?",
    "answer": "Durasinya adalah 3 jam, mulai pukul 13:30 sampai 16:30 WITA.",
    "keywords": [
      "durasi ml",
      "berapa jam ml"
    ]
  },
  {
    "id": 42,
    "category": "Detail Workshop Machine Learning",
    "question": "Siapa pembicara di Workshop Machine Learning?",
    "answer": "Informasi nama pemateri/narasumber spesifik belum dicantumkan secara detail pada sistem pengumuman resmi. Silakan pantau pengumuman terbaru.",
    "keywords": [
      "pembicara ml",
      "narasumber ml",
      "siapa pemateri ml"
    ]
  },
  {
    "id": 43,
    "category": "Detail Workshop Machine Learning",
    "question": "Apakah disediakan komputer di lab atau harus bawa laptop?",
    "answer": "Meskipun bertempat di Lab Komputer FILKOM, peserta tetap diwajibkan membawa laptop pribadi agar proyek dan model dapat langsung disimpan.",
    "keywords": [
      "harus bawa laptop ml",
      "komputer lab"
    ]
  },
  {
    "id": 44,
    "category": "Detail Workshop Machine Learning",
    "question": "Apakah ada konsumsi di Workshop Machine Learning?",
    "answer": "Tidak ada pilihan konsumsi yang tercantum pada event ini. Peserta disarankan mempersiapkan air minum pribadi.",
    "keywords": [
      "makan ml",
      "konsumsi ml",
      "snack ml"
    ]
  },
  {
    "id": 45,
    "category": "Detail Workshop Machine Learning",
    "question": "Bagaimana cara mendaftar Workshop Machine Learning?",
    "answer": "Masuk ke menu \"Daftar Event\", pilih \"Workshop Machine Learning dengan Python\", klik \"Daftar Event\", lalu konfirmasi pendaftaran Anda.",
    "keywords": [
      "cara daftar ml",
      "daftar workshop python"
    ]
  },
  {
    "id": 46,
    "category": "Detail Workshop Machine Learning",
    "question": "Kategori apa untuk event Workshop Machine Learning?",
    "answer": "Event ini masuk dalam kategori \"Workshop\".",
    "keywords": [
      "kategori ml"
    ]
  },
  {
    "id": 47,
    "category": "Detail Workshop Machine Learning",
    "question": "Apakah Workshop Machine Learning cocok untuk mahasiswa peminat Data Science?",
    "answer": "Sangat cocok! Materi implementasi algoritma prediksi Machine Learning dengan scikit-learn merupakan fondasi penting dalam Data Science.",
    "keywords": [
      "rekomendasi data science",
      "cocok data science"
    ]
  },
  {
    "id": 48,
    "category": "Detail Workshop Machine Learning",
    "question": "Apakah Workshop ML ini diadakan secara online atau tatap muka?",
    "answer": "Workshop ini diselenggarakan secara tatap muka (luring / offline) di Lab Komputer FILKOM Lantai 2.",
    "keywords": [
      "online atau offline ml",
      "apakah zoom"
    ]
  },
  {
    "id": 49,
    "category": "Detail Workshop Machine Learning",
    "question": "Apakah ada tugas atau ujian di akhir workshop?",
    "answer": "Workshop ini bersifat pelatihan langsung (hands-on) membangun model prediksi, tidak ada ujian formal yang dicantumkan pada sistem.",
    "keywords": [
      "tugas ml",
      "ujian ml"
    ]
  },
  {
    "id": 50,
    "category": "Detail Workshop Machine Learning",
    "question": "Jika kuota Workshop Machine Learning penuh, apakah bisa daftar?",
    "answer": "Jika kuota 50 peserta telah terpenuhi, pendaftaran otomatis ditutup. Segera daftar selagi sisa 14 kursi masih tersedia.",
    "keywords": [
      "kuota habis ml",
      "bisa daftar kalau penuh"
    ]
  },
  {
    "id": 51,
    "category": "Detail Pelatihan UI/UX Figma",
    "question": "Apa yang dipelajari pada Pelatihan Desain UI/UX dengan Figma?",
    "answer": "Peserta belajar prinsip-prinsip desain antarmuka pengguna (UI/UX) modern menggunakan Figma serta membuat prototype aplikasi mobile dari awal hingga siap dipresentasikan.",
    "keywords": [
      "materi ui ux",
      "belajar apa figma",
      "isi pelatihan figma"
    ]
  },
  {
    "id": 52,
    "category": "Detail Pelatihan UI/UX Figma",
    "question": "Kapan Pelatihan UI/UX Figma diadakan?",
    "answer": "Pelatihan diadakan pada hari Kamis, 10 Desember 2026, mulai pukul 09:00 hingga 16:00 WITA.",
    "keywords": [
      "jadwal ui ux",
      "kapan figma",
      "tanggal figma"
    ]
  },
  {
    "id": 53,
    "category": "Detail Pelatihan UI/UX Figma",
    "question": "Di mana lokasi Pelatihan UI/UX Figma?",
    "answer": "Lokasinya di Ruang Seminar FILKOM Lt. 3, Kampus UNKLAB.",
    "keywords": [
      "lokasi ui ux",
      "ruangan seminar figma",
      "tempat figma"
    ]
  },
  {
    "id": 54,
    "category": "Detail Pelatihan UI/UX Figma",
    "question": "Berapa biaya pendaftaran Pelatihan UI/UX Figma?",
    "answer": "Pelatihan ini Gratis (Rp 0) untuk mahasiswa FILKOM.",
    "keywords": [
      "biaya ui ux",
      "apakah figma bayar",
      "gratis figma"
    ]
  },
  {
    "id": 55,
    "category": "Detail Pelatihan UI/UX Figma",
    "question": "Berapa kuota peserta Pelatihan UI/UX Figma?",
    "answer": "Kuota peserta adalah 40 orang.",
    "keywords": [
      "kuota figma",
      "kapasitas ui ux"
    ]
  },
  {
    "id": 56,
    "category": "Detail Pelatihan UI/UX Figma",
    "question": "Berapa sisa kuota Pelatihan UI/UX Figma saat ini?",
    "answer": "Saat ini sudah terdaftar 39 peserta dari 40 kuota, sehingga tersisa 1 kursi terakhir!",
    "keywords": [
      "sisa kuota figma",
      "apakah figma masih ada"
    ]
  },
  {
    "id": 57,
    "category": "Detail Pelatihan UI/UX Figma",
    "question": "Apakah saya harus punya akun Figma sebelum ikut?",
    "answer": "Ya, peserta disarankan telah memiliki akun Figma aktif (bisa menggunakan akun gratis atau Figma for Education) dan membawa laptop.",
    "keywords": [
      "akun figma",
      "syarat figma"
    ]
  },
  {
    "id": 58,
    "category": "Detail Pelatihan UI/UX Figma",
    "question": "Apakah peserta harus mahir menggambar untuk ikut UI/UX?",
    "answer": "Tidak, pelatihan ini fokus pada prinsip desain antarmuka, tata letak, hierarki visual, dan prototyping aplikasi, bukan keahlian melukis manual.",
    "keywords": [
      "mahir gambar",
      "bisa desain"
    ]
  },
  {
    "id": 59,
    "category": "Detail Pelatihan UI/UX Figma",
    "question": "Berapa lama durasi Pelatihan UI/UX Figma?",
    "answer": "Durasi pelatihan adalah 7 jam (09:00 - 16:00 WITA), termasuk istirahat.",
    "keywords": [
      "durasi figma",
      "berapa lama ui ux"
    ]
  },
  {
    "id": 60,
    "category": "Detail Pelatihan UI/UX Figma",
    "question": "Apakah pelatihan Figma ini online atau offline?",
    "answer": "Pelatihan diselenggarakan secara offline / tatap muka di Ruang Seminar FILKOM Lt. 3.",
    "keywords": [
      "online figma",
      "tatap muka figma"
    ]
  },
  {
    "id": 61,
    "category": "Detail Pelatihan UI/UX Figma",
    "question": "Apakah peserta mendapat sertifikat?",
    "answer": "Ya, peserta yang hadir penuh dan melakukan absensi akan memperoleh e-sertifikat resmi dari FILKOM.",
    "keywords": [
      "sertifikat figma",
      "sertif ui ux"
    ]
  },
  {
    "id": 62,
    "category": "Detail Pelatihan UI/UX Figma",
    "question": "Apakah disediakan template desain selama pelatihan?",
    "answer": "Ya, peserta akan mempraktikkan pembuatan prototype mobile app dengan bimbingan komponen UI modern.",
    "keywords": [
      "template figma",
      "komponen ui"
    ]
  },
  {
    "id": 63,
    "category": "Detail Pelatihan UI/UX Figma",
    "question": "Siapa pembicara pada Pelatihan UI/UX Figma?",
    "answer": "Nama narasumber/mentor belum dicantumkan secara spesifik pada data sistem resmi. Silakan nantikan pengumuman panitia.",
    "keywords": [
      "pembicara figma",
      "mentor ui ux"
    ]
  },
  {
    "id": 64,
    "category": "Detail Pelatihan UI/UX Figma",
    "question": "Apakah pelatihan ini cocok untuk peminat Front-End Development?",
    "answer": "Sangat cocok! Pemahaman UI/UX dan Figma sangat berharga bagi developer front-end dalam mengimplementasikan desain ke kode aplikasi.",
    "keywords": [
      "cocok front end",
      "developer figma"
    ]
  },
  {
    "id": 65,
    "category": "Detail Pelatihan UI/UX Figma",
    "question": "Apakah ada makan siang di Pelatihan UI/UX?",
    "answer": "Fasilitas makanan khusus tidak tercantum pada data pendaftaran event ini. Peserta dapat memanfaatkan jam istirahat untuk makan siang mandiri.",
    "keywords": [
      "makan siang figma",
      "konsumsi figma"
    ]
  },
  {
    "id": 66,
    "category": "Detail Pelatihan UI/UX Figma",
    "question": "Kategori apa untuk event Pelatihan UI/UX Figma?",
    "answer": "Event ini terdaftar dalam kategori \"Pelatihan\".",
    "keywords": [
      "kategori ui ux"
    ]
  },
  {
    "id": 67,
    "category": "Detail Pelatihan UI/UX Figma",
    "question": "Bagaimana jika sisa 1 kuota sudah terisi?",
    "answer": "Jika kuota 40 peserta telah penuh, status kuota akan ditutup. Segera lakukan registrasi di menu \"Daftar Event\".",
    "keywords": [
      "kuota penuh figma",
      "sisa 1"
    ]
  },
  {
    "id": 68,
    "category": "Detail Pelatihan UI/UX Figma",
    "question": "Apakah software Figma harus diinstal di laptop?",
    "answer": "Figma dapat diakses langsung lewat web browser modern (seperti Chrome) atau aplikasi desktop Figma. Keduanya bisa digunakan.",
    "keywords": [
      "instal figma",
      "figma browser"
    ]
  },
  {
    "id": 69,
    "category": "Detail Pelatihan UI/UX Figma",
    "question": "Apakah peserta wajib membawa mouse?",
    "answer": "Membawa mouse sangat disarankan untuk memudahkan proses desain antarmuka di Figma.",
    "keywords": [
      "mouse figma"
    ]
  },
  {
    "id": 70,
    "category": "Detail Pelatihan UI/UX Figma",
    "question": "Bagaimana cara konfirmasi kehadiran di Pelatihan UI/UX?",
    "answer": "Tunjukkan barcode tiket Anda dari menu \"Riwayat Pendaftaran\" kepada panitia di lokasi saat registrasi dibuka.",
    "keywords": [
      "absensi figma",
      "barcode figma"
    ]
  },
  {
    "id": 71,
    "category": "Detail Malam Apresiasi Mahasiswa",
    "question": "Apa itu Malam Apresiasi Mahasiswa FILKOM 2026?",
    "answer": "Malam Apresiasi Mahasiswa FILKOM 2026 adalah perayaan tahunan fakultas untuk memberikan penghargaan kepada mahasiswa berprestasi, pertunjukan seni mahasiswa, serta penganugerahan akademik semester ganjil 2026.",
    "keywords": [
      "apa itu malam apresiasi",
      "tentang malam apresiasi"
    ]
  },
  {
    "id": 72,
    "category": "Detail Malam Apresiasi Mahasiswa",
    "question": "Kapan Malam Apresiasi Mahasiswa diselenggarakan?",
    "answer": "Acara diselenggarakan pada hari Jumat, 18 Desember 2026, pukul 18:00 hingga 22:00 WITA.",
    "keywords": [
      "kapan malam apresiasi",
      "jadwal malam apresiasi",
      "jam malam apresiasi"
    ]
  },
  {
    "id": 73,
    "category": "Detail Malam Apresiasi Mahasiswa",
    "question": "Di mana tempat pelaksanaan Malam Apresiasi Mahasiswa?",
    "answer": "Bertempat di Gedung Olahraga UNKLAB (Gymnasium Universitas Klabat).",
    "keywords": [
      "lokasi malam apresiasi",
      "tempat malam apresiasi",
      "gedung olahraga unklab"
    ]
  },
  {
    "id": 74,
    "category": "Detail Malam Apresiasi Mahasiswa",
    "question": "Berapa harga tiket masuk Malam Apresiasi Mahasiswa?",
    "answer": "Tiket masuk Malam Apresiasi Mahasiswa adalah Gratis (Rp 0).",
    "keywords": [
      "biaya malam apresiasi",
      "tiket malam apresiasi gratis"
    ]
  },
  {
    "id": 75,
    "category": "Detail Malam Apresiasi Mahasiswa",
    "question": "Berapa total kuota peserta Malam Apresiasi?",
    "answer": "Total kuota adalah 300 peserta.",
    "keywords": [
      "kuota malam apresiasi"
    ]
  },
  {
    "id": 76,
    "category": "Detail Malam Apresiasi Mahasiswa",
    "question": "Berapa sisa kuota Malam Apresiasi saat ini?",
    "answer": "Dari kuota 300 orang, sudah terdaftar 127 mahasiswa sehingga sisa kuota saat ini adalah 173 kursi.",
    "keywords": [
      "sisa kuota malam apresiasi"
    ]
  },
  {
    "id": 77,
    "category": "Detail Malam Apresiasi Mahasiswa",
    "question": "Apa dress code atau aturan pakaian untuk Malam Apresiasi?",
    "answer": "Pakaian yang digunakan adalah pakaian rapi, sopan, dan formal/smart casual sesuai tata tertib kampus UNKLAB.",
    "keywords": [
      "dresscode malam apresiasi",
      "baju apa malam apresiasi",
      "aturan pakaian"
    ]
  },
  {
    "id": 78,
    "category": "Detail Malam Apresiasi Mahasiswa",
    "question": "Siapa saja yang boleh datang ke Malam Apresiasi?",
    "answer": "Seluruh mahasiswa aktif Fakultas Ilmu Komputer UNKLAB dari semua angkatan dan program studi.",
    "keywords": [
      "siapa boleh ikut malam apresiasi",
      "peserta malam apresiasi"
    ]
  },
  {
    "id": 79,
    "category": "Detail Malam Apresiasi Mahasiswa",
    "question": "Apakah ada penganugerahan penghargaan bagi mahasiswa berprestasi?",
    "answer": "Ya, salah satu agenda utama adalah apresiasi dan penganugerahan bagi mahasiswa yang menorehkan prestasi akademik maupun non-akademik.",
    "keywords": [
      "penghargaan malam apresiasi",
      "award mahasiswa"
    ]
  },
  {
    "id": 80,
    "category": "Detail Malam Apresiasi Mahasiswa",
    "question": "Apakah ada pertunjukan musik atau seni?",
    "answer": "Ya, acara dimeriahkan dengan penampilan seni dan musik dari perwakilan mahasiswa FILKOM.",
    "keywords": [
      "penampilan seni",
      "musik malam apresiasi"
    ]
  },
  {
    "id": 81,
    "category": "Detail Malam Apresiasi Mahasiswa",
    "question": "Apakah peserta mendapatkan e-sertifikat kehadiran?",
    "answer": "Ya, mahasiswa yang hadir dan discan barcode tiketnya akan mendapatkan e-sertifikat resmi.",
    "keywords": [
      "sertifikat malam apresiasi"
    ]
  },
  {
    "id": 82,
    "category": "Detail Malam Apresiasi Mahasiswa",
    "question": "Apakah harus mendaftar terlebih dahulu?",
    "answer": "Ya, pendaftaran wajib dilakukan melalui sistem portal agar nama Anda tercatat dan barcode tiket diterbitkan.",
    "keywords": [
      "wajib daftar malam apresiasi"
    ]
  },
  {
    "id": 83,
    "category": "Detail Malam Apresiasi Mahasiswa",
    "question": "Apakah disediakan makanan pada Malam Apresiasi?",
    "answer": "Acara malam apresiasi tahunan biasanya menyajikan jamuan kebersamaan mahasiswa dan dosen.",
    "keywords": [
      "konsumsi malam apresiasi",
      "makan malam apresiasi"
    ]
  },
  {
    "id": 84,
    "category": "Detail Malam Apresiasi Mahasiswa",
    "question": "Kategori apa event Malam Apresiasi ini?",
    "answer": "Event ini terdaftar dalam kategori \"Sosial & Budaya\".",
    "keywords": [
      "kategori malam apresiasi"
    ]
  },
  {
    "id": 85,
    "category": "Detail Malam Apresiasi Mahasiswa",
    "question": "Berapa lama durasi Malam Apresiasi Mahasiswa?",
    "answer": "Acara berlangsung selama 4 jam, dari pukul 18:00 sampai 22:00 WITA.",
    "keywords": [
      "durasi malam apresiasi"
    ]
  },
  {
    "id": 86,
    "category": "Detail Malam Apresiasi Mahasiswa",
    "question": "Apakah boleh mengajak teman dari luar fakultas?",
    "answer": "Pendaftaran sistem resmi ini diprioritaskan khusus bagi mahasiswa Fakultas Ilmu Komputer Universitas Klabat.",
    "keywords": [
      "ajak teman luar fakultas"
    ]
  },
  {
    "id": 87,
    "category": "Detail Malam Apresiasi Mahasiswa",
    "question": "Bagaimana cara masuk ke Gedung Olahraga saat acara?",
    "answer": "Tunjukkan QR Code pendaftaran dari menu \"Riwayat Pendaftaran\" kepada panitia absensi di pintu masuk.",
    "keywords": [
      "masuk gedung olahraga",
      "absen malam apresiasi"
    ]
  },
  {
    "id": 88,
    "category": "Detail Malam Apresiasi Mahasiswa",
    "question": "Apakah dosen-dosen FILKOM akan hadir?",
    "answer": "Ya, dekanat, dosen, dan staf pengajar FILKOM turut hadir untuk memberikan apresiasi kepada mahasiswa.",
    "keywords": [
      "dosen hadir malam apresiasi"
    ]
  },
  {
    "id": 89,
    "category": "Detail Malam Apresiasi Mahasiswa",
    "question": "Apakah ada pengumuman nilai semester di acara ini?",
    "answer": "Acara ini merayakan pencapaian akademik berprestasi semester ganjil 2026, bukan pembagian transkrip nilai pribadi.",
    "keywords": [
      "pengumuman nilai"
    ]
  },
  {
    "id": 90,
    "category": "Detail Malam Apresiasi Mahasiswa",
    "question": "Kapan batas akhir pendaftaran Malam Apresiasi?",
    "answer": "Pendaftaran dibuka hingga kuota 300 terpenuhi atau sampai menjelang hari H acara pada 18 Desember 2026.",
    "keywords": [
      "batas pendaftaran malam apresiasi"
    ]
  },
  {
    "id": 91,
    "category": "Detail FILKOM Day",
    "question": "Apa itu kegiatan FILKOM Day?",
    "answer": "FILKOM Day adalah agenda tahunan akbar seluruh keluarga besar Fakultas Ilmu Komputer UNKLAB yang wajib diikuti oleh seluruh mahasiswa aktif untuk membangun solidaritas, kebersamaan, dan wawasan fakultas.",
    "keywords": [
      "apa itu filkom day",
      "kegiatan filkom day"
    ]
  },
  {
    "id": 92,
    "category": "Detail FILKOM Day",
    "question": "Kapan FILKOM Day dilaksanakan?",
    "answer": "FILKOM Day dilaksanakan pada hari Jumat, 20 November 2026, mulai pukul 08:00 pagi hingga 19:00 WITA.",
    "keywords": [
      "kapan filkom day",
      "jadwal filkom day",
      "jam filkom day"
    ]
  },
  {
    "id": 93,
    "category": "Detail FILKOM Day",
    "question": "Di mana lokasi FILKOM Day?",
    "answer": "Lokasi kegiatan berpusat di Kampus Universitas Klabat.",
    "keywords": [
      "lokasi filkom day",
      "tempat filkom day"
    ]
  },
  {
    "id": 94,
    "category": "Detail FILKOM Day",
    "question": "Apakah FILKOM Day wajib diikuti?",
    "answer": "Ya, keterangan resmi event menyatakan bahwa FILKOM Day \"Wajib diikuti\" oleh seluruh mahasiswa Fakultas Ilmu Komputer.",
    "keywords": [
      "apakah filkom day wajib",
      "wajib filkom day"
    ]
  },
  {
    "id": 95,
    "category": "Detail FILKOM Day",
    "question": "Berapa biaya pendaftaran FILKOM Day?",
    "answer": "Biaya pendaftaran FILKOM Day adalah sebesar Rp 225.000.",
    "keywords": [
      "biaya filkom day",
      "harga filkom day",
      "berapa bayar filkom day"
    ]
  },
  {
    "id": 96,
    "category": "Detail FILKOM Day",
    "question": "Ke rekening mana pembayaran FILKOM Day ditransfer?",
    "answer": "Pembayaran ditransfer ke rekening Bank BNI: 0000000000 atas nama Gledial.",
    "keywords": [
      "rekening filkom day",
      "transfer filkom day",
      "bank filkom day"
    ]
  },
  {
    "id": 97,
    "category": "Detail FILKOM Day",
    "question": "Berapa kuota peserta yang dibuka untuk FILKOM Day?",
    "answer": "Kuota yang tercatat pada sistem adalah 100 peserta.",
    "keywords": [
      "kuota filkom day"
    ]
  },
  {
    "id": 98,
    "category": "Detail FILKOM Day",
    "question": "Apa saja fasilitas yang didapatkan dari biaya Rp 225.000?",
    "answer": "Fasilitas meliputi konsumsi makanan (pilihan menu), baju kaos resmi event FILKOM Day, e-sertifikat kegiatan, dan seluruh rangkaian acara.",
    "keywords": [
      "fasilitas filkom day",
      "dapat apa saja filkom day"
    ]
  },
  {
    "id": 99,
    "category": "Detail FILKOM Day",
    "question": "Pilihan menu makanan apa saja yang tersedia di FILKOM Day?",
    "answer": "Tersedia 3 pilihan menu konsumsi: Ayam, Ikan, dan Vegetarian.",
    "keywords": [
      "pilihan makanan filkom day",
      "menu makan filkom day",
      "vegetarian filkom day"
    ]
  },
  {
    "id": 100,
    "category": "Detail FILKOM Day",
    "question": "Ukuran baju kaos apa saja yang tersedia untuk FILKOM Day?",
    "answer": "Ukuran baju kaos yang disediakan mencakup: S, M, L, XL, dan XXL.",
    "keywords": [
      "ukuran kaos filkom day",
      "size baju filkom day",
      "ukuran baju"
    ]
  },
  {
    "id": 101,
    "category": "Detail FILKOM Day",
    "question": "Kapan saya memilih ukuran baju dan menu makanan?",
    "answer": "Pilihan ukuran baju dan menu makanan dipilih langsung pada formulir saat Anda melakukan pendaftaran event FILKOM Day di portal.",
    "keywords": [
      "cara pilih ukuran baju",
      "pilih menu"
    ]
  },
  {
    "id": 102,
    "category": "Detail FILKOM Day",
    "question": "Bagaimana cara membayar pendaftaran FILKOM Day?",
    "answer": "Lakukan transfer bank sebesar Rp 225.000 ke rekening BNI yang tertera, simpan bukti struk/screenshot transfer, lalu unggah bukti tersebut pada sistem.",
    "keywords": [
      "cara bayar filkom day",
      "upload bukti bayar"
    ]
  },
  {
    "id": 103,
    "category": "Detail FILKOM Day",
    "question": "Bagaimana jika saya belum mengunggah bukti transfer?",
    "answer": "Status pendaftaran Anda akan bertanda \"Menunggu verifikasi\" sampai bukti transfer diunggah dan diverifikasi oleh panitia atau bendahara event.",
    "keywords": [
      "menunggu verifikasi filkom day",
      "belum upload"
    ]
  },
  {
    "id": 104,
    "category": "Detail FILKOM Day",
    "question": "Berapa nomor rekening panitia FILKOM Day?",
    "answer": "Nomor rekening: 0000000000, Bank: BNI, atas nama: Gledial.",
    "keywords": [
      "nomor rekening",
      "no rek bni"
    ]
  },
  {
    "id": 105,
    "category": "Detail FILKOM Day",
    "question": "Berapa lama durasi FILKOM Day berlangsung?",
    "answer": "Acara berlangsung sepanjang hari selama 11 jam, dari pukul 08:00 hingga 19:00 WITA.",
    "keywords": [
      "durasi filkom day"
    ]
  },
  {
    "id": 106,
    "category": "Detail FILKOM Day",
    "question": "Apakah mahasiswa baru wajib ikut FILKOM Day?",
    "answer": "Ya, seluruh mahasiswa FILKOM dari seluruh angkatan wajib berpartisipasi dalam FILKOM Day.",
    "keywords": [
      "maba filkom day",
      "angkatan berapa"
    ]
  },
  {
    "id": 107,
    "category": "Detail FILKOM Day",
    "question": "Apakah ada sertifikat untuk FILKOM Day?",
    "answer": "Ya, seluruh peserta yang hadir dan terverifikasi absensinya akan mendapatkan e-sertifikat resmi FILKOM Day.",
    "keywords": [
      "sertifikat filkom day"
    ]
  },
  {
    "id": 108,
    "category": "Detail FILKOM Day",
    "question": "Kategori apa untuk event FILKOM Day?",
    "answer": "Event ini terdaftar dalam kategori \"Lainnya\" (Kegiatan Akbar Fakultas).",
    "keywords": [
      "kategori filkom day"
    ]
  },
  {
    "id": 109,
    "category": "Detail FILKOM Day",
    "question": "Bolehkah memilih menu vegetarian di FILKOM Day?",
    "answer": "Boleh, panitia secara khusus menyediakan opsi menu Vegetarian pada formulir pendaftaran.",
    "keywords": [
      "bisa vegetarian"
    ]
  },
  {
    "id": 110,
    "category": "Detail FILKOM Day",
    "question": "Siapa panitia penanggung jawab FILKOM Day?",
    "answer": "FILKOM Day diselenggarakan oleh BEM Fakultas Ilmu Komputer UNKLAB.",
    "keywords": [
      "penanggung jawab filkom day"
    ]
  },
  {
    "id": 111,
    "category": "Pertanyaan Pendaftaran",
    "question": "Bagaimana cara mendaftar event di FILKOM Events?",
    "answer": "Alur pendaftaran:\n1. Buka menu \"Daftar Event\" di portal mahasiswa.\n2. Pilih event yang ingin diikuti lalu klik tombol \"Daftar\".\n3. Isi opsi jika ada (seperti ukuran kaos atau menu makanan).\n4. Jika event berbayar, lakukan transfer dan unggah bukti transfer.\n5. Tiket QR pendaftaran Anda akan langsung tersedia di menu \"Riwayat Pendaftaran\".",
    "keywords": [
      "cara mendaftar",
      "alur pendaftaran",
      "bagaimana daftar"
    ]
  },
  {
    "id": 112,
    "category": "Pertanyaan Pendaftaran",
    "question": "Apakah pendaftaran event memerlukan biaya?",
    "answer": "Sebagian besar event FILKOM seperti workshop, pelatihan, dan seminar adalah Gratis. Event tertentu seperti FILKOM Day dikenakan biaya pendaftaran sesuai fasilitas yang disediakan.",
    "keywords": [
      "apakah bayar",
      "biaya pendaftaran event"
    ]
  },
  {
    "id": 113,
    "category": "Pertanyaan Pendaftaran",
    "question": "Apakah saya bisa mendaftar jika kuota sudah habis?",
    "answer": "Jika kuota sudah penuh, tombol pendaftaran akan dinonaktifkan secara otomatis oleh sistem.",
    "keywords": [
      "kuota habis",
      "kuota penuh daftar"
    ]
  },
  {
    "id": 114,
    "category": "Pertanyaan Pendaftaran",
    "question": "Di mana saya bisa melihat status pendaftaran saya?",
    "answer": "Status pendaftaran dapat dilihat di menu \"Riwayat Pendaftaran\".",
    "keywords": [
      "status pendaftaran",
      "cek pendaftaran"
    ]
  },
  {
    "id": 115,
    "category": "Pertanyaan Pendaftaran",
    "question": "Apakah saya bisa membatalkan pendaftaran event?",
    "answer": "Anda dapat membatalkan pendaftaran melalui portal selama acara belum berlangsung atau menghubungi panitia BEM.",
    "keywords": [
      "batal daftar",
      "cancel pendaftaran"
    ]
  },
  {
    "id": 116,
    "category": "Pertanyaan Pendaftaran",
    "question": "Apakah pendaftaran event langsung disetujui?",
    "answer": "Untuk event gratis, pendaftaran langsung terkonfirmasi otomatis dan tiket QR langsung terbit. Untuk event berbayar, status akan \"Lunas\" setelah bukti transfer diverifikasi.",
    "keywords": [
      "langsung disetujui",
      "konfirmasi otomatis"
    ]
  },
  {
    "id": 117,
    "category": "Pertanyaan Pendaftaran",
    "question": "Bisakah mahasiswa luar UNKLAB mendaftar lewat sistem ini?",
    "answer": "Tidak, sistem pendaftaran ini khusus diperuntukkan bagi mahasiswa aktif dengan akun resmi @student.unklab.ac.id.",
    "keywords": [
      "luar unklab",
      "kampus lain"
    ]
  },
  {
    "id": 118,
    "category": "Pertanyaan Pendaftaran",
    "question": "Apa yang harus dilakukan setelah berhasil mendaftar event gratis?",
    "answer": "Simpan tiket QR Anda yang ada di menu \"Riwayat Pendaftaran\", catat jadwal dan lokasinya, lalu hadir tepat waktu saat kegiatan berlangsung.",
    "keywords": [
      "setelah daftar",
      "langkah selanjutnya"
    ]
  },
  {
    "id": 119,
    "category": "Pertanyaan Pendaftaran",
    "question": "Apakah saya akan menerima konfirmasi email setelah mendaftar?",
    "answer": "Ya, sistem akan mengirimkan ringkasan bukti pendaftaran ke email resmi mahasiswa Anda.",
    "keywords": [
      "konfirmasi email",
      "email pendaftaran"
    ]
  },
  {
    "id": 120,
    "category": "Pertanyaan Pendaftaran",
    "question": "Mengapa tombol daftar tidak bisa diklik?",
    "answer": "Tombol tidak bisa diklik jika Anda belum login, kuota event sudah penuh, event sudah selesai, atau Anda sudah terdaftar pada event tersebut.",
    "keywords": [
      "tombol daftar tidak bisa",
      "tidak bisa klik"
    ]
  },
  {
    "id": 121,
    "category": "Pertanyaan Pendaftaran",
    "question": "Bolehkah mendaftarkan teman saya dengan akun saya?",
    "answer": "Tidak boleh. Satu akun hanya dapat mendaftarkan pemilik akun tersebut karena tiket QR terikat pada NIM dan identitas Anda.",
    "keywords": [
      "daftarkan teman",
      "pakai akun teman"
    ]
  },
  {
    "id": 122,
    "category": "Pertanyaan Pendaftaran",
    "question": "Format file apa yang didukung untuk mengunggah bukti transfer?",
    "answer": "Sistem mendukung file bukti transfer dalam format JPG, PNG, WEBP, atau PDF dengan ukuran maksimal 1.5 MB.",
    "keywords": [
      "format bukti transfer",
      "ukuran file bukti"
    ]
  },
  {
    "id": 123,
    "category": "Pertanyaan Pendaftaran",
    "question": "Berapa ukuran maksimal file bukti pembayaran?",
    "answer": "Maksimal ukuran file bukti transfer adalah 1.5 MB.",
    "keywords": [
      "ukuran maksimal bukti",
      "maksimal upload"
    ]
  },
  {
    "id": 124,
    "category": "Pertanyaan Pendaftaran",
    "question": "Apakah bukti transfer bisa diunggah belakangan?",
    "answer": "Ya, Anda dapat mengunggah bukti transfer melalui menu \"Riwayat Pendaftaran\" pada kartu event yang bersangkutan.",
    "keywords": [
      "upload bukti belakangan"
    ]
  },
  {
    "id": 125,
    "category": "Pertanyaan Pendaftaran",
    "question": "Apakah saya mendapatkan kwitansi pendaftaran resmi?",
    "answer": "Ya, untuk event berbayar yang telah disetujui, kwitansi resmi dengan nomor bukti pembayaran dapat diunduh dalam format PDF.",
    "keywords": [
      "kwitansi resmi",
      "unduh kwitansi"
    ]
  },
  {
    "id": 126,
    "category": "Biaya dan Kuota",
    "question": "Event apa saja yang gratis saat ini?",
    "answer": "Event gratis saat ini meliputi:\n1. Workshop Machine Learning dengan Python (Rp 0)\n2. Pelatihan Desain UI/UX dengan Figma (Rp 0)\n3. Malam Apresiasi Mahasiswa FILKOM (Rp 0).",
    "keywords": [
      "event apa yang gratis",
      "daftar event gratis"
    ]
  },
  {
    "id": 127,
    "category": "Biaya dan Kuota",
    "question": "Event apa yang memerlukan biaya?",
    "answer": "Event yang berbayar saat ini adalah FILKOM Day dengan biaya pendaftaran Rp 225.000.",
    "keywords": [
      "event apa yang bayar"
    ]
  },
  {
    "id": 128,
    "category": "Biaya dan Kuota",
    "question": "Berapa biaya pendaftaran Workshop Machine Learning?",
    "answer": "Biayanya adalah Rp 0 (Gratis).",
    "keywords": [
      "biaya workshop ml"
    ]
  },
  {
    "id": 129,
    "category": "Biaya dan Kuota",
    "question": "Berapa biaya pendaftaran Pelatihan UI/UX Figma?",
    "answer": "Biayanya adalah Rp 0 (Gratis).",
    "keywords": [
      "biaya pelatihan ui ux"
    ]
  },
  {
    "id": 130,
    "category": "Biaya dan Kuota",
    "question": "Berapa biaya Malam Apresiasi Mahasiswa?",
    "answer": "Biayanya adalah Rp 0 (Gratis).",
    "keywords": [
      "biaya malam apresiasi"
    ]
  },
  {
    "id": 131,
    "category": "Biaya dan Kuota",
    "question": "Berapa biaya FILKOM Day?",
    "answer": "Biayanya adalah Rp 225.000.",
    "keywords": [
      "biaya filkom day"
    ]
  },
  {
    "id": 132,
    "category": "Biaya dan Kuota",
    "question": "Berapa sisa kuota Workshop Machine Learning?",
    "answer": "Sisa kuota Workshop Machine Learning saat ini adalah 14 kursi (dari total 50).",
    "keywords": [
      "sisa kuota ml"
    ]
  },
  {
    "id": 133,
    "category": "Biaya dan Kuota",
    "question": "Berapa sisa kuota Pelatihan UI/UX Figma?",
    "answer": "Sisa kuota Pelatihan UI/UX saat ini adalah 1 kursi (dari total 40).",
    "keywords": [
      "sisa kuota ui ux"
    ]
  },
  {
    "id": 134,
    "category": "Biaya dan Kuota",
    "question": "Berapa sisa kuota Malam Apresiasi Mahasiswa?",
    "answer": "Sisa kuota Malam Apresiasi saat ini adalah 173 kursi (dari total 300).",
    "keywords": [
      "sisa kuota malam apresiasi"
    ]
  },
  {
    "id": 135,
    "category": "Biaya dan Kuota",
    "question": "Berapa sisa kuota FILKOM Day?",
    "answer": "Sisa kuota FILKOM Day saat ini adalah 100 kursi.",
    "keywords": [
      "sisa kuota filkom day"
    ]
  },
  {
    "id": 136,
    "category": "Biaya dan Kuota",
    "question": "Metode pembayaran apa yang didukung untuk event berbayar?",
    "answer": "Sistem mendukung pembayaran melalui Transfer Bank (BNI) dan konfirmasi tunai melalui panitia.",
    "keywords": [
      "metode bayar",
      "cara transfer"
    ]
  },
  {
    "id": 137,
    "category": "Biaya dan Kuota",
    "question": "Apakah bisa bayar via e-wallet (GoPay, OVO, Dana)?",
    "answer": "Rekening resmi yang disediakan sistem saat ini adalah Bank BNI. Jika melakukan transfer dari e-wallet, gunakan fitur transfer ke rekening BNI tersebut.",
    "keywords": [
      "gopay",
      "ovo",
      "dana",
      "ewallet"
    ]
  },
  {
    "id": 138,
    "category": "Biaya dan Kuota",
    "question": "Apakah ada biaya tambahan admin sistem?",
    "answer": "Tidak ada biaya admin tambahan dari sistem portal FILKOM Events.",
    "keywords": [
      "biaya admin"
    ]
  },
  {
    "id": 139,
    "category": "Biaya dan Kuota",
    "question": "Event mana yang kuotanya paling sedikit?",
    "answer": "Pelatihan Desain UI/UX dengan Figma memiliki kuota terkecil (40 orang) dan saat ini hanya tersisa 1 kursi.",
    "keywords": [
      "kuota paling sedikit",
      "paling cepat habis"
    ]
  },
  {
    "id": 140,
    "category": "Biaya dan Kuota",
    "question": "Event mana yang kuotanya paling banyak?",
    "answer": "Malam Apresiasi Mahasiswa FILKOM 2026 memiliki kuota terbesar, yaitu 300 peserta.",
    "keywords": [
      "kuota paling banyak",
      "kapasitas terbesar"
    ]
  },
  {
    "id": 141,
    "category": "Riwayat Pendaftaran & Tiket",
    "question": "Di mana saya bisa melihat tiket barcode QR saya?",
    "answer": "Tiket barcode QR Anda dapat diakses di menu \"Riwayat Pendaftaran\" pada dashboard mahasiswa.",
    "keywords": [
      "lihat tiket barcode",
      "dimana tiket"
    ]
  },
  {
    "id": 142,
    "category": "Riwayat Pendaftaran & Tiket",
    "question": "Bagaimana cara menggunakan barcode saat hari H event?",
    "answer": "Buka menu \"Riwayat Pendaftaran\", tampilkan barcode event kepada panitia di pintu masuk untuk discan.",
    "keywords": [
      "cara pakai barcode",
      "scan barcode"
    ]
  },
  {
    "id": 143,
    "category": "Riwayat Pendaftaran & Tiket",
    "question": "Apakah barcode tiket boleh dicetak di kertas?",
    "answer": "Boleh, Anda bisa mencetaknya atau cukup menunjukkan barcode langsung dari layar smartphone.",
    "keywords": [
      "cetak barcode",
      "print tiket"
    ]
  },
  {
    "id": 144,
    "category": "Riwayat Pendaftaran & Tiket",
    "question": "Apakah AI Assistant bisa mengecek apakah saya sudah terdaftar?",
    "answer": "AI Assistant tidak memiliki akses ke data riwayat privat Anda. Silakan cek langsung pada menu \"Riwayat Pendaftaran\".",
    "keywords": [
      "apakah saya sudah daftar",
      "cek nama saya"
    ]
  },
  {
    "id": 145,
    "category": "Riwayat Pendaftaran & Tiket",
    "question": "Bisa tolong batalkan tiket event saya?",
    "answer": "AI Assistant tidak dapat membatalkan pendaftaran. Anda dapat mengelolanya langsung di portal atau menghubungi panitia BEM.",
    "keywords": [
      "batalkan tiket saya"
    ]
  },
  {
    "id": 146,
    "category": "Riwayat Pendaftaran & Tiket",
    "question": "Apakah tiket barcode saya bisa digunakan oleh orang lain?",
    "answer": "Tidak bisa. Setiap barcode pendaftaran unik dan terikat langsung pada akun dan NIM Anda.",
    "keywords": [
      "tiket dipakai orang lain"
    ]
  },
  {
    "id": 147,
    "category": "Riwayat Pendaftaran & Tiket",
    "question": "Bagaimana jika barcode tidak bisa discan oleh panitia?",
    "answer": "Panitia dapat memasukkan kode pendaftaran atau NIM Anda secara manual melalui sistem absensi panitia.",
    "keywords": [
      "barcode tidak terbaca",
      "scan gagal"
    ]
  },
  {
    "id": 148,
    "category": "Riwayat Pendaftaran & Tiket",
    "question": "Apa arti status \"Confirmed\" pada tiket saya?",
    "answer": "Status \"Confirmed\" berarti pendaftaran Anda sudah sah dan Anda resmi terdaftar sebagai peserta kegiatan.",
    "keywords": [
      "status confirmed"
    ]
  },
  {
    "id": 149,
    "category": "Riwayat Pendaftaran & Tiket",
    "question": "Apa arti status \"Menunggu verifikasi\"?",
    "answer": "Status ini menandakan bukti pembayaran Anda sedang dalam proses pengecekan oleh panitia event.",
    "keywords": [
      "arti menunggu verifikasi"
    ]
  },
  {
    "id": 150,
    "category": "Riwayat Pendaftaran & Tiket",
    "question": "Di mana saya mengunduh kwitansi PDF?",
    "answer": "Kwitansi PDF dapat diunduh pada kartu pendaftaran di menu \"Riwayat Pendaftaran\" setelah pembayaran terverifikasi.",
    "keywords": [
      "unduh kwitansi pdf"
    ]
  },
  {
    "id": 151,
    "category": "Riwayat Pendaftaran & Tiket",
    "question": "Apakah chatbot bisa mengirimkan tiket ke WhatsApp saya?",
    "answer": "Tidak, chatbot tidak memiliki integrasi ke WhatsApp. Seluruh tiket tersimpan aman di portal web Anda.",
    "keywords": [
      "kirim wa",
      "whatsapp tiket"
    ]
  },
  {
    "id": 152,
    "category": "Riwayat Pendaftaran & Tiket",
    "question": "Berapa kali barcode absensi bisa discan?",
    "answer": "Barcode hanya valid untuk 1 kali pencatatan kehadiran per event.",
    "keywords": [
      "scan berkali kali"
    ]
  },
  {
    "id": 153,
    "category": "Riwayat Pendaftaran & Tiket",
    "question": "Apakah ada status absensi Terlambat?",
    "answer": "Ya, panitia dapat menandai kehadiran sebagai \"Hadir\" atau \"Terlambat\" sesuai waktu kedatangan Anda.",
    "keywords": [
      "status terlambat"
    ]
  },
  {
    "id": 154,
    "category": "Riwayat Pendaftaran & Tiket",
    "question": "Apakah status terlambat tetap mendapatkan sertifikat?",
    "answer": "Ya, peserta dengan status Hadir maupun Terlambat berhak mendapatkan e-sertifikat kegiatan.",
    "keywords": [
      "terlambat dapat sertif"
    ]
  },
  {
    "id": 155,
    "category": "Riwayat Pendaftaran & Tiket",
    "question": "Di mana sertifikat kegiatan saya bisa diunduh?",
    "answer": "E-sertifikat yang telah terbit dapat diunduh langsung melalui menu \"Riwayat Pendaftaran\" pada kartu event terkait.",
    "keywords": [
      "unduh sertifikat"
    ]
  },
  {
    "id": 156,
    "category": "Pengumuman Fakultas",
    "question": "Apa saja pengumuman terbaru di fakultas?",
    "answer": "Pengumuman resmi yang tercatat di sistem antara lain:\n1. Pendaftaran Asisten Lab Semester Genap Telah Dibuka (Syarat IPK >= 3.00)\n2. Jadwal Evaluasi Tengah Semester (ETS)\n3. Pengumuman seputar kegiatan fakultas.",
    "keywords": [
      "pengumuman terbaru",
      "info fakultas",
      "edaran"
    ]
  },
  {
    "id": 157,
    "category": "Pengumuman Fakultas",
    "question": "Kapan pendaftaran asisten lab semester genap ditutup?",
    "answer": "Pendaftaran asisten lab komputer semester genap dibuka hingga 15 November 2026.",
    "keywords": [
      "asisten lab",
      "aslab"
    ]
  },
  {
    "id": 158,
    "category": "Pengumuman Fakultas",
    "question": "Apa syarat mendaftar asisten laboratorium komputer?",
    "answer": "Syaratnya: Mahasiswa tingkat 3 atau 4, IPK minimal 3.00, telah lulus mata kuliah terkait, dan mendapat rekomendasi dosen.",
    "keywords": [
      "syarat asisten lab",
      "syarat aslab"
    ]
  },
  {
    "id": 159,
    "category": "Pengumuman Fakultas",
    "question": "Di mana saya bisa membaca isi lengkap pengumuman?",
    "answer": "Isi lengkap dapat dibaca pada menu \"Pengumuman Fakultas\" di dashboard mahasiswa Anda.",
    "keywords": [
      "baca pengumuman"
    ]
  },
  {
    "id": 160,
    "category": "Pengumuman Fakultas",
    "question": "Apakah pengumuman ada yang disematkan (pin)?",
    "answer": "Ya, pengumuman penting yang dipin akan selalu berada di urutan teratas daftar pengumuman.",
    "keywords": [
      "pengumuman penting",
      "pinned"
    ]
  },
  {
    "id": 161,
    "category": "Pengumuman Fakultas",
    "question": "Apakah ada pengumuman beasiswa di portal?",
    "answer": "Pengumuman beasiswa akan dipublikasikan oleh pihak dekanat pada menu Pengumuman Fakultas jika periode pendaftaran dibuka.",
    "keywords": [
      "beasiswa"
    ]
  },
  {
    "id": 162,
    "category": "Pengumuman Fakultas",
    "question": "Apakah ada pengumuman libur semester?",
    "answer": "Informasi kalender akademik dan libur perkuliahan mengacu pada pengumuman resmi Universitas Klabat.",
    "keywords": [
      "libur"
    ]
  },
  {
    "id": 163,
    "category": "Pengumuman Fakultas",
    "question": "Bagaimana jika pengumuman terkait dengan event tertentu?",
    "answer": "Pengumuman yang berkaitan langsung dengan suatu event akan menampilkan label judul event bersangkutan.",
    "keywords": [
      "pengumuman event"
    ]
  },
  {
    "id": 164,
    "category": "Pengumuman Fakultas",
    "question": "Apakah ada notifikasi email untuk pengumuman baru?",
    "answer": "Ya, publikasi pengumuman baru otomatis diteruskan ke email mahasiswa yang terdaftar.",
    "keywords": [
      "email pengumuman"
    ]
  },
  {
    "id": 165,
    "category": "Pengumuman Fakultas",
    "question": "Siapa yang berhak membuat pengumuman di sistem?",
    "answer": "Hanya pihak Dekanat, Dosen, Admin FILKOM, dan pengurus BEM FILKOM yang memiliki otorisasi membuat pengumuman.",
    "keywords": [
      "siapa buat pengumuman"
    ]
  },
  {
    "id": 166,
    "category": "Pengumuman Fakultas",
    "question": "Apakah ada pengumuman tentang jadwal ETS?",
    "answer": "Ya, jadwal Evaluasi Tengah Semester (ETS) tercantum pada daftar pengumuman fakultas.",
    "keywords": [
      "jadwal ets",
      "ujian tengah semester"
    ]
  },
  {
    "id": 167,
    "category": "Pengumuman Fakultas",
    "question": "Apakah ada pengumuman lowongan magang atau kerja?",
    "answer": "Fakultas secara berkala mempublikasikan informasi kemitraan magang melalui pengumuman portal.",
    "keywords": [
      "magang",
      "internship",
      "lowongan"
    ]
  },
  {
    "id": 168,
    "category": "Pengumuman Fakultas",
    "question": "Bagaimana mencari pengumuman yang sudah lama?",
    "answer": "Gunakan fitur pencarian judul pada halaman menu \"Pengumuman Fakultas\".",
    "keywords": [
      "cari pengumuman"
    ]
  },
  {
    "id": 169,
    "category": "Pengumuman Fakultas",
    "question": "Apakah pengumuman di portal ini resmi?",
    "answer": "Ya, seluruh pengumuman yang tampil adalah rilis resmi dari Fakultas Ilmu Komputer UNKLAB.",
    "keywords": [
      "apakah resmi"
    ]
  },
  {
    "id": 170,
    "category": "Pengumuman Fakultas",
    "question": "Kapan pengumuman diperbarui?",
    "answer": "Pengumuman diperbarui secara real-time setiap kali pihak fakultas atau BEM menerbitkan informasi baru.",
    "keywords": [
      "update pengumuman"
    ]
  },
  {
    "id": 171,
    "category": "Akun Mahasiswa",
    "question": "Domain email apa yang wajib digunakan untuk mendaftar akun mahasiswa?",
    "answer": "Pendaftaran akun mahasiswa WAJIB menggunakan domain email resmi Universitas Klabat: @student.unklab.ac.id.",
    "keywords": [
      "domain email",
      "student unklab ac id",
      "daftar akun email"
    ]
  },
  {
    "id": 172,
    "category": "Akun Mahasiswa",
    "question": "Apakah bisa mendaftar dengan email Gmail pribadi (@gmail.com)?",
    "answer": "Tidak bisa. Sistem menolak pendaftaran akun mahasiswa jika tidak menggunakan domain @student.unklab.ac.id.",
    "keywords": [
      "bisa pakai gmail",
      "daftar gmail"
    ]
  },
  {
    "id": 173,
    "category": "Akun Mahasiswa",
    "question": "Di mana saya bisa mengedit profil saya?",
    "answer": "Profil mahasiswa dapat dilihat dan dikelola melalui menu \"Akun Mahasiswa\" di portal.",
    "keywords": [
      "profil",
      "edit profil"
    ]
  },
  {
    "id": 174,
    "category": "Akun Mahasiswa",
    "question": "Data apa saja yang tersimpan pada akun mahasiswa saya?",
    "answer": "Data akun mencakup nama lengkap, NIM, email student UNKLAB, program studi/jurusan, nomor telepon, dan riwayat kegiatan.",
    "keywords": [
      "data akun"
    ]
  },
  {
    "id": 175,
    "category": "Akun Mahasiswa",
    "question": "Bagaimana jika saya lupa password akun saya?",
    "answer": "Silakan hubungi admin sistem FILKOM di ruang administrasi fakultas untuk mereset kata sandi Anda.",
    "keywords": [
      "lupa password"
    ]
  },
  {
    "id": 176,
    "category": "Akun Mahasiswa",
    "question": "Apakah satu email bisa digunakan untuk beberapa role?",
    "answer": "Berdasarkan pembaruan sistem, akun mahasiswa, admin, dan panitia dipisahkan berdasarkan hak akses perannya masing-masing.",
    "keywords": [
      "satu email multi role"
    ]
  },
  {
    "id": 177,
    "category": "Akun Mahasiswa",
    "question": "Berapa digit NIM mahasiswa UNKLAB?",
    "answer": "NIM mahasiswa UNKLAB biasanya terdiri dari kombinasi digit angka unik (misalnya: 105022410082).",
    "keywords": [
      "nim"
    ]
  },
  {
    "id": 178,
    "category": "Akun Mahasiswa",
    "question": "Apakah NIM saya bisa diubah sendiri?",
    "answer": "NIM terikat pada identitas akademik resmi Anda dan tidak dapat diubah sembarangan tanpa verifikasi admin.",
    "keywords": [
      "ubah nim"
    ]
  },
  {
    "id": 179,
    "category": "Akun Mahasiswa",
    "question": "Program studi apa saja yang ada di FILKOM UNKLAB?",
    "answer": "Fakultas Ilmu Komputer UNKLAB menaungi program studi Informatika, Sistem Informasi, dan Teknologi Informasi.",
    "keywords": [
      "jurusan filkom",
      "prodi unklab"
    ]
  },
  {
    "id": 180,
    "category": "Akun Mahasiswa",
    "question": "Apakah nomor HP pada profil digunakan untuk notifikasi?",
    "answer": "Nomor HP disimpan sebagai kontak darurat panitia jika diperlukan koordinasi langsung terkait kegiatan.",
    "keywords": [
      "no hp profil"
    ]
  },
  {
    "id": 181,
    "category": "Akun Mahasiswa",
    "question": "Apakah akun mahasiswa saya aktif selamanya?",
    "answer": "Akun aktif selama masa studi Anda sebagai mahasiswa di Fakultas Ilmu Komputer Universitas Klabat.",
    "keywords": [
      "masa aktif akun"
    ]
  },
  {
    "id": 182,
    "category": "Akun Mahasiswa",
    "question": "Bagaimana cara keluar (logout) dari sesi portal?",
    "answer": "Klik tombol \"Keluar Sesi\" pada bagian bawah sidebar sebelah kiri.",
    "keywords": [
      "logout",
      "keluar sesi"
    ]
  },
  {
    "id": 183,
    "category": "Akun Mahasiswa",
    "question": "Apakah ada konfirmasi sebelum logout?",
    "answer": "Ya, sistem akan memunculkan modal dialog konfirmasi sebelum mengeluarkan sesi Anda.",
    "keywords": [
      "konfirmasi logout"
    ]
  },
  {
    "id": 184,
    "category": "Akun Mahasiswa",
    "question": "Mengapa email saya ditolak saat registrasi?",
    "answer": "Pastikan email yang Anda masukkan berakhiran \"@student.unklab.ac.id\" tanpa spasi atau kesalahan penulisan.",
    "keywords": [
      "email ditolak"
    ]
  },
  {
    "id": 185,
    "category": "Akun Mahasiswa",
    "question": "Apakah foto profil bisa diganti?",
    "answer": "Saat ini avatar profil menampilkan inisial nama resmi Anda dengan desain badge modern.",
    "keywords": [
      "foto profil"
    ]
  },
  {
    "id": 186,
    "category": "Rekomendasi Event",
    "question": "Saya tertarik pada Artificial Intelligence dan Coding, event apa yang cocok?",
    "answer": "Sangat disarankan mendaftar \"Workshop Machine Learning dengan Python\" pada 25 November 2026 untuk praktik langsung membangun model AI!",
    "keywords": [
      "rekomendasi ai",
      "minat coding",
      "machine learning"
    ]
  },
  {
    "id": 187,
    "category": "Rekomendasi Event",
    "question": "Saya suka desain grafis dan UI/UX, event mana yang cocok?",
    "answer": "Pilihan terbaik untuk Anda adalah \"Pelatihan Desain UI/UX dengan Figma\" pada 10 Desember 2026. Anda akan belajar memvalidasi dan memprototipe aplikasi mobile.",
    "keywords": [
      "rekomendasi ui ux",
      "suka desain",
      "figma"
    ]
  },
  {
    "id": 188,
    "category": "Rekomendasi Event",
    "question": "Saya ingin acara kebersamaan dan hiburan, ada saran?",
    "answer": "Jangan lewatkan \"Malam Apresiasi Mahasiswa FILKOM\" (18 Des 2026) dan perayaan \"FILKOM Day\" (20 Nov 2026) untuk menjalin keakraban dengan seluruh rekan dan dosen!",
    "keywords": [
      "hiburan",
      "kebersamaan",
      "seni",
      "apresiasi"
    ]
  },
  {
    "id": 189,
    "category": "Rekomendasi Event",
    "question": "Event apa yang wajib diikuti oleh seluruh mahasiswa FILKOM?",
    "answer": "\"FILKOM Day\" pada 20 November 2026 adalah kegiatan akbar yang wajib diikuti oleh seluruh mahasiswa aktif fakultas.",
    "keywords": [
      "event wajib"
    ]
  },
  {
    "id": 190,
    "category": "Rekomendasi Event",
    "question": "Bagaimana cara menggunakan fitur rekomendasi personal di chatbot ini?",
    "answer": "Pada panel sebelah kiri halaman AI Assistant, pilih topik minat Anda (misal: UI/UX, AI, Data Science), lalu klik \"Cari Rekomendasi\".",
    "keywords": [
      "fitur rekomendasi"
    ]
  },
  {
    "id": 191,
    "category": "Rekomendasi Event",
    "question": "Event apa yang cocok untuk mahasiswa pemula?",
    "answer": "Workshop Machine Learning dan Pelatihan UI/UX keduanya dirancang hands-on dan ramah bagi mahasiswa yang baru memulai.",
    "keywords": [
      "pemula"
    ]
  },
  {
    "id": 192,
    "category": "Rekomendasi Event",
    "question": "Event mana yang cocok untuk memperluas networking kampus?",
    "answer": "Malam Apresiasi Mahasiswa FILKOM 2026 di Gymnasium sangat cocok untuk networking dengan mahasiswa berprestasi, alumni, dan dosen.",
    "keywords": [
      "networking",
      "koneksi"
    ]
  },
  {
    "id": 193,
    "category": "Rekomendasi Event",
    "question": "Apakah ada event untuk peminat Web Development?",
    "answer": "Meskipun tidak ada judul khusus web dev, Pelatihan UI/UX Figma sangat penting bagi web developer dalam merancang tampilan sebelum ngoding.",
    "keywords": [
      "web dev"
    ]
  },
  {
    "id": 194,
    "category": "Rekomendasi Event",
    "question": "Saya ingin mengasah portofolio desain saya, ikut apa ya?",
    "answer": "Ikuti Pelatihan Desain UI/UX dengan Figma, karena hasilnya berupa prototype aplikasi nyata yang bisa langsung dijadikan studi kasus portofolio.",
    "keywords": [
      "portofolio"
    ]
  },
  {
    "id": 195,
    "category": "Rekomendasi Event",
    "question": "Saya ingin belajar Python lebih dalam, ikut yang mana?",
    "answer": "Daftarlah pada Workshop Machine Learning dengan Python pada 25 November 2026.",
    "keywords": [
      "belajar python"
    ]
  },
  {
    "id": 196,
    "category": "Rekomendasi Event",
    "question": "Event apa yang cocok untuk menambah poin sertifikat keaktifan?",
    "answer": "Semua event yang tersedia (Workshop ML, Pelatihan UI/UX, Malam Apresiasi, dan FILKOM Day) menerbitkan e-sertifikat resmi.",
    "keywords": [
      "poin keaktifan",
      "sertifikat"
    ]
  },
  {
    "id": 197,
    "category": "Rekomendasi Event",
    "question": "Bisa rekomendasikan event di bulan November saja?",
    "answer": "Di bulan November terdapat FILKOM Day (20 Nov 2026) dan Workshop Machine Learning dengan Python (25 Nov 2026).",
    "keywords": [
      "rekomendasi november"
    ]
  },
  {
    "id": 198,
    "category": "Rekomendasi Event",
    "question": "Bisa rekomendasikan event di bulan Desember saja?",
    "answer": "Di bulan Desember terdapat Pelatihan Desain UI/UX dengan Figma (10 Des 2026) dan Malam Apresiasi Mahasiswa (18 Des 2026).",
    "keywords": [
      "rekomendasi desember"
    ]
  },
  {
    "id": 199,
    "category": "Rekomendasi Event",
    "question": "Saya mahasiswa tingkat akhir, event mana yang relevan?",
    "answer": "Workshop Machine Learning sangat relevan untuk ide skripsi/tugas akhir bidang data dan kecerdasan buatan.",
    "keywords": [
      "tingkat akhir",
      "skripsi"
    ]
  },
  {
    "id": 200,
    "category": "Rekomendasi Event",
    "question": "Saya suka kegiatan outdoor dan dinamika kelompok, event apa?",
    "answer": "FILKOM Day adalah agenda paling tepat karena mencakup rangkaian aktivitas kebersamaan antar kelompok mahasiswa.",
    "keywords": [
      "outdoor",
      "dinamika kelompok"
    ]
  },
  {
    "id": 201,
    "category": "Bantuan Umum & Sertifikat",
    "question": "Bagaimana cara kerja absensi di lokasi event?",
    "answer": "Panitia akan menggunakan scanner barcode pada sistem untuk memindai kode QR yang ada pada tiket Anda di menu \"Riwayat Pendaftaran\".",
    "keywords": [
      "cara absensi",
      "absen qr"
    ]
  },
  {
    "id": 202,
    "category": "Bantuan Umum & Sertifikat",
    "question": "Kapan sertifikat otomatis diterbitkan?",
    "answer": "Sertifikat otomatis diterbitkan segera setelah status absensi Anda dicatat sebagai Hadir atau Terlambat oleh panitia.",
    "keywords": [
      "kapan sertifikat terbit"
    ]
  },
  {
    "id": 203,
    "category": "Bantuan Umum & Sertifikat",
    "question": "Apakah sertifikat memiliki nomor seri resmi?",
    "answer": "Ya, setiap sertifikat memiliki nomor seri resmi berformat unik FILKOM (misal: FILKOM-2026-XXXXXXXX).",
    "keywords": [
      "nomor sertifikat",
      "validasi sertifikat"
    ]
  },
  {
    "id": 204,
    "category": "Bantuan Umum & Sertifikat",
    "question": "Bagaimana format file sertifikat yang diunduh?",
    "answer": "Sertifikat diunduh dalam format PDF siap cetak dengan ukuran standar A4 Landscape.",
    "keywords": [
      "format sertifikat",
      "pdf sertifikat"
    ]
  },
  {
    "id": 205,
    "category": "Bantuan Umum & Sertifikat",
    "question": "Apakah sertifikat bisa diverifikasi keasliannya?",
    "answer": "Ya, nomor sertifikat terdaftar pada database sistem dan mencantumkan tanggal terbit resmi.",
    "keywords": [
      "keaslian sertifikat"
    ]
  },
  {
    "id": 206,
    "category": "Bantuan Umum & Sertifikat",
    "question": "Jika saya mendaftar tapi tidak hadir, apakah dapat sertifikat?",
    "answer": "Tidak. Sertifikat HANYA diterbitkan untuk peserta yang hadir dan terdata pada absensi kegiatan.",
    "keywords": [
      "tidak hadir sertifikat"
    ]
  },
  {
    "id": 207,
    "category": "Bantuan Umum & Sertifikat",
    "question": "Bagaimana jika nama saya di sertifikat salah eja?",
    "answer": "Sertifikat mencetak nama sesuai nama pada akun mahasiswa Anda. Pastikan nama profil Anda sudah benar sebelum sertifikat dicetak.",
    "keywords": [
      "salah nama di sertifikat"
    ]
  },
  {
    "id": 208,
    "category": "Bantuan Umum & Sertifikat",
    "question": "Apakah sertifikat dikenakan biaya tambahan?",
    "answer": "Tidak, penerbitan e-sertifikat tidak dipungut biaya apapun.",
    "keywords": [
      "biaya sertifikat"
    ]
  },
  {
    "id": 209,
    "category": "Bantuan Umum & Sertifikat",
    "question": "Apakah sertifikat bisa diunduh kapan saja?",
    "answer": "Ya, selama akun mahasiswa Anda aktif, sertifikat pada menu Riwayat Pendaftaran dapat diunduh kapan saja.",
    "keywords": [
      "unduh kapan saja"
    ]
  },
  {
    "id": 210,
    "category": "Bantuan Umum & Sertifikat",
    "question": "Berapa resolusi sertifikat yang diterbitkan?",
    "answer": "Sertifikat diproses dengan kualitas vektor PDF tajam standar dokumen akademik Universitas Klabat.",
    "keywords": [
      "kualitas sertifikat"
    ]
  },
  {
    "id": 211,
    "category": "Bantuan Umum & Sertifikat",
    "question": "Apakah sertifikat mencantumkan nama dekan atau fakultas?",
    "answer": "Ya, sertifikat resmi diterbitkan oleh Fakultas Ilmu Komputer Universitas Klabat.",
    "keywords": [
      "ttd dekan",
      "instansi sertifikat"
    ]
  },
  {
    "id": 212,
    "category": "Bantuan Umum & Sertifikat",
    "question": "Bagaimana jika email sertifikat tidak masuk ke inbox?",
    "answer": "Periksa folder Spam/Promotions pada email Anda, atau unduh langsung file PDF dari menu \"Riwayat Pendaftaran\".",
    "keywords": [
      "email sertifikat tidak masuk"
    ]
  },
  {
    "id": 213,
    "category": "Bantuan Umum & Sertifikat",
    "question": "Apakah sertifikat bisa dicetak sendiri?",
    "answer": "Tentu saja, file PDF dapat dicetak menggunakan kertas sertifikat (misal: Concorde atau Linen) ukuran A4.",
    "keywords": [
      "print sertifikat"
    ]
  },
  {
    "id": 214,
    "category": "Bantuan Umum & Sertifikat",
    "question": "Apakah absensi bisa dititip ke teman?",
    "answer": "Tidak bisa. Absensi dilakukan dengan memindai barcode masing-masing di lokasi kegiatan.",
    "keywords": [
      "titip absen"
    ]
  },
  {
    "id": 215,
    "category": "Bantuan Umum & Sertifikat",
    "question": "Jika ada kendala saat scan tiket, siapa yang dihubungi?",
    "answer": "Silakan datangi meja panitia pelaksana/BEM FILKOM di lokasi kegiatan untuk verifikasi manual.",
    "keywords": [
      "kendala absensi"
    ]
  },
  {
    "id": 216,
    "category": "Variasi Pertanyaan Sehari-hari",
    "question": "Halo min!",
    "answer": "Halo! Senang bisa menyapa Anda. Ada yang bisa saya bantu seputar event, jadwal, pendaftaran, atau pengumuman FILKOM hari ini?",
    "keywords": [
      "halo",
      "hai",
      "pagi",
      "siang",
      "sore",
      "malam"
    ]
  },
  {
    "id": 217,
    "category": "Variasi Pertanyaan Sehari-hari",
    "question": "P",
    "answer": "Halo! Ada yang bisa saya bantu mengenai kegiatan dan event di FILKOM UNKLAB? Silakan tanyakan jadwal, lokasi, kuota, atau alur pendaftaran ya!",
    "keywords": [
      "p",
      "ping",
      "tes"
    ]
  },
  {
    "id": 218,
    "category": "Variasi Pertanyaan Sehari-hari",
    "question": "Event apa aja nih yang buka pendaftaran?",
    "answer": "Saat ini ada 4 event yang buka:\n1. FILKOM Day (20 Nov 2026)\n2. Workshop Machine Learning dengan Python (25 Nov 2026)\n3. Pelatihan Desain UI/UX dengan Figma (10 Des 2026)\n4. Malam Apresiasi Mahasiswa FILKOM (18 Des 2026).",
    "keywords": [
      "event apa aja nih",
      "kegiatan buka",
      "lagi ada apa"
    ]
  },
  {
    "id": 219,
    "category": "Variasi Pertanyaan Sehari-hari",
    "question": "Brp bayar filkom day?",
    "answer": "Biaya pendaftaran FILKOM Day adalah Rp 225.000, sudah dapat kaos resmi dan konsumsi makanan.",
    "keywords": [
      "brp bayar",
      "biaya brp",
      "harganya brp"
    ]
  },
  {
    "id": 220,
    "category": "Variasi Pertanyaan Sehari-hari",
    "question": "Ml dmn lokasinya?",
    "answer": "Workshop Machine Learning diadakan di Lab Komputer FILKOM Lantai 2 pada 25 November 2026 pukul 13:30 WITA.",
    "keywords": [
      "ml dmn",
      "lokasi ml dmn"
    ]
  },
  {
    "id": 221,
    "category": "Variasi Pertanyaan Sehari-hari",
    "question": "Figma bayar ga sih?",
    "answer": "Pelatihan Desain UI/UX dengan Figma 100% Gratis! Namun kuota sisa 1 kursi lagi, jadi buruan daftar ya.",
    "keywords": [
      "figma bayar ga",
      "gratis ga"
    ]
  },
  {
    "id": 222,
    "category": "Variasi Pertanyaan Sehari-hari",
    "question": "Bisa liatin tiket gue ga?",
    "answer": "Sebagai AI Assistant, saya tidak bisa mengakses data tiket pribadi Anda demi privasi. Silakan buka menu \"Riwayat Pendaftaran\" untuk melihat tiket barcode Anda ya!",
    "keywords": [
      "liatin tiket",
      "liat tiket gue",
      "cek tiket"
    ]
  },
  {
    "id": 223,
    "category": "Variasi Pertanyaan Sehari-hari",
    "question": "Kalo telat masih dpt sertif ga ya?",
    "answer": "Masih dapat! Panitia bisa menandai status absensi Anda sebagai \"Terlambat\", dan sertifikat tetap akan diterbitkan setelah absensi tercatat.",
    "keywords": [
      "kalo telat",
      "telat absen"
    ]
  },
  {
    "id": 224,
    "category": "Variasi Pertanyaan Sehari-hari",
    "question": "Gimana cara daftarnya brok?",
    "answer": "Gampang banget:\n1. Buka menu \"Daftar Event\"\n2. Pilih event yang Anda mau\n3. Klik \"Daftar Event\"\n4. Cek tiket barcode Anda di menu \"Riwayat Pendaftaran\".",
    "keywords": [
      "gimana cara daftar",
      "cara regis"
    ]
  },
  {
    "id": 225,
    "category": "Variasi Pertanyaan Sehari-hari",
    "question": "Kuota figma masih ada gk?",
    "answer": "Kuota Figma tinggal 1 kursi lagi (39 terdaftar dari total 40). Buruan daftar sebelum kehabisan!",
    "keywords": [
      "kuota figma masih ada"
    ]
  },
  {
    "id": 226,
    "category": "Variasi Pertanyaan Sehari-hari",
    "question": "Filkom day wajib g?",
    "answer": "Iya, FILKOM Day wajib diikuti oleh seluruh mahasiswa aktif Fakultas Ilmu Komputer UNKLAB.",
    "keywords": [
      "filkom day wajib g",
      "apakah wajib"
    ]
  },
  {
    "id": 227,
    "category": "Variasi Pertanyaan Sehari-hari",
    "question": "Makasih infonya min!",
    "answer": "Sama-sama! Sukses selalu untuk perkuliahan dan kegiatannya di FILKOM UNKLAB. Jangan ragu bertanya lagi jika butuh info lain ya!",
    "keywords": [
      "makasih",
      "terima kasih",
      "thanks",
      "tq"
    ]
  },
  {
    "id": 228,
    "category": "Variasi Pertanyaan Sehari-hari",
    "question": "Malam apresiasi itu ngapain aja?",
    "answer": "Malam Apresiasi adalah acara penghargaan untuk mahasiswa berprestasi, ramah tamah, makan malam bersama, dan ada penampilan seni musik dari mahasiswa.",
    "keywords": [
      "ngapain aja malam apresiasi",
      "ngapain"
    ]
  },
  {
    "id": 229,
    "category": "Variasi Pertanyaan Sehari-hari",
    "question": "Ada lomba koding ga?",
    "answer": "Saat ini belum ada pengumuman lomba koding resmi yang terdaftar di sistem. Pantau terus menu Pengumuman Fakultas ya!",
    "keywords": [
      "lomba koding",
      "lomba"
    ]
  },
  {
    "id": 230,
    "category": "Variasi Pertanyaan Sehari-hari",
    "question": "Siapa pemateri workshop ml?",
    "answer": "Untuk nama pemateri/narasumber spesifik Workshop Machine Learning belum dicantumkan pada sistem pengumuman resmi. Silakan nantikan rilis panitia BEM.",
    "keywords": [
      "siapa pemateri",
      "siapa narasumber",
      "speaker"
    ]
  }
];

/**
 * Mencari jawaban paling relevan dari 230 Knowledge Base FAQ berdasarkan query pengguna
 */
export function searchKnowledgeBase(query) {
  if (!query || typeof query !== 'string') return null;
  const clean = query.trim().toLowerCase();
  const words = clean.split(/\s+/).filter((w) => w.length > 1);

  let bestMatch = null;
  let highestScore = 0;

  for (const item of EVENT_KNOWLEDGE_BASE) {
    let score = 0;
    const qLower = item.question.toLowerCase();
    
    if (qLower === clean) {
      score += 100;
    } else if (qLower.includes(clean) || clean.includes(qLower)) {
      score += 40;
    }

    for (const keyword of item.keywords) {
      const kw = keyword.toLowerCase();
      if (clean === kw) {
        score += 35;
      } else if (clean.includes(kw)) {
        score += 20;
      }
    }

    for (const w of words) {
      if (qLower.includes(w)) score += 5;
      for (const kw of item.keywords) {
        if (kw.includes(w)) score += 4;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  return highestScore >= 12 ? { match: bestMatch, score: highestScore } : null;
}

export default {
  OFFICIAL_EVENTS,
  EVENT_KNOWLEDGE_BASE,
  searchKnowledgeBase,
};
