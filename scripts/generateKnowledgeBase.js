import fs from 'fs';
import path from 'path';

const OFFICIAL_EVENTS = [
  {
    id: 'e2',
    title: 'Workshop Machine Learning dengan Python',
    date: '2026-11-25',
    formattedDate: 'Rabu, 25 November 2026',
    startTime: '13:30',
    endTime: '16:30',
    timeZone: 'WITA',
    location: 'Lab Komputer FILKOM Lantai 2',
    category: 'Workshop',
    quota: 50,
    registeredCount: 36,
    remainingQuota: 14,
    fee: 0,
    feeLabel: 'Gratis',
    organizer: 'BEM FILKOM',
    description: 'Workshop hands-on implementasi model Machine Learning menggunakan Python dan library scikit-learn. Peserta akan belajar membangun model prediksi dari data nyata. Wajib membawa laptop.',
    requirements: ['Membawa laptop pribadi', 'Python 3.x dan scikit-learn terpasang'],
    benefits: ['Ilmu implementasi ML praktis', 'Dataset proyek nyata', 'E-Sertifikat resmi kehadiran'],
  },
  {
    id: 'e4',
    title: 'Pelatihan Desain UI/UX dengan Figma',
    date: '2026-12-10',
    formattedDate: 'Kamis, 10 Desember 2026',
    startTime: '09:00',
    endTime: '16:00',
    timeZone: 'WITA',
    location: 'Ruang Seminar FILKOM Lt. 3',
    category: 'Pelatihan',
    quota: 40,
    registeredCount: 39,
    remainingQuota: 1,
    fee: 0,
    feeLabel: 'Gratis',
    organizer: 'BEM FILKOM',
    description: 'Pelatihan intensif tentang prinsip desain antarmuka pengguna menggunakan Figma. Peserta akan membuat prototype aplikasi mobile dari awal hingga siap presentasi.',
    requirements: ['Membawa laptop', 'Akun Figma aktif'],
    benefits: ['Template UI kit mobile', 'Teknik prototyping interaktif', 'E-Sertifikat resmi kehadiran'],
  },
  {
    id: 'e5',
    title: 'Malam Apresiasi Mahasiswa FILKOM 2026',
    date: '2026-12-18',
    formattedDate: 'Jumat, 18 Desember 2026',
    startTime: '18:00',
    endTime: '22:00',
    timeZone: 'WITA',
    location: 'Gedung Olahraga UNKLAB',
    category: 'Sosial & Budaya',
    quota: 300,
    registeredCount: 127,
    remainingQuota: 173,
    fee: 0,
    feeLabel: 'Gratis',
    organizer: 'BEM FILKOM',
    description: 'Acara tahunan Fakultas Ilmu Komputer sebagai bentuk apresiasi kepada mahasiswa berprestasi, penampilan seni, dan pengumuman penghargaan akademik semester ganjil 2026.',
    requirements: ['Pakaian rapi dan sopan (smart casual / formal)', 'Membawa tiket QR pendaftaran'],
    benefits: ['Makan malam bersama', 'Penganugerahan mahasiswa berprestasi', 'Pertunjukan seni & networking'],
  },
  {
    id: '93Z74tr8Cew',
    title: 'FILKOM Day',
    date: '2026-11-20',
    formattedDate: 'Jumat, 20 November 2026',
    startTime: '08:00',
    endTime: '19:00',
    timeZone: 'WITA',
    location: 'Kampus UNKLAB',
    category: 'Lainnya',
    quota: 100,
    registeredCount: 0,
    remainingQuota: 100,
    fee: 225000,
    feeLabel: 'Rp 225.000 (Berbayar)',
    paymentInfo: {
      bank: 'BNI',
      accountNumber: '0000000000',
      accountName: 'a.n. Gledial',
    },
    mealOptions: ['Ayam', 'Ikan', 'Vegetarian'],
    shirtSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    organizer: 'BEM FILKOM',
    description: 'Kegiatan tahunan akbar seluruh civitas akademika Fakultas Ilmu Komputer. Wajib diikuti oleh seluruh mahasiswa FILKOM.',
    requirements: ['Wajib diikuti seluruh mahasiswa aktif FILKOM', 'Menyelesaikan pembayaran Rp 225.000 dan mengunggah bukti transfer'],
    benefits: ['Baju kaos resmi FILKOM Day', 'Konsumsi makanan (pilihan Ayam/Ikan/Vegetarian)', 'E-Sertifikat resmi kegiatan'],
  },
];

const faqs = [];
let currentId = 1;

function addFaq(category, question, answer, keywords) {
  faqs.push({
    id: currentId++,
    category,
    question,
    answer,
    keywords,
  });
}

// 1. Pertanyaan Umum Sistem (15 items)
addFaq('Pertanyaan Umum Sistem', 'Apa itu sistem FILKOM Event Management?', 'FILKOM Event Management adalah sistem informasi resmi Fakultas Ilmu Komputer Universitas Klabat untuk mengelola event, pendaftaran mahasiswa, absensi berbasis QR code, serta penerbitan sertifikat digital.', ['sistem', 'filkom event management', 'aplikasi', 'portal']);
addFaq('Pertanyaan Umum Sistem', 'Siapa saja yang bisa menggunakan sistem ini?', 'Sistem ini dapat diakses oleh mahasiswa aktif FILKOM (@student.unklab.ac.id), panitia pelaksana/BEM FILKOM, dan Administrator fakultas.', ['pengguna', 'siapa saja', 'akses']);
addFaq('Pertanyaan Umum Sistem', 'Apakah saya harus login untuk melihat dan mendaftar event?', 'Ya, Anda harus login menggunakan akun mahasiswa FILKOM dengan email resmi @student.unklab.ac.id untuk dapat mendaftar event dan mengakses tiket absensi.', ['login', 'masuk', 'wajib login']);
addFaq('Pertanyaan Umum Sistem', 'Apa fungsi AI Event Assistant ini?', 'AI Event Assistant ini bertugas membantu menjawab pertanyaan seputar jadwal kegiatan, detail event, alur pendaftaran, kuota, pengumuman fakultas, serta memberikan rekomendasi event yang cocok untuk Anda.', ['fungsi ai', 'chatbot', 'bisa apa saja']);
addFaq('Pertanyaan Umum Sistem', 'Apakah AI Assistant ini bisa mendaftarkan event untuk saya?', 'Tidak, AI Assistant tidak dapat mendaftarkan atau membatalkan event secara otomatis. Untuk mendaftar, silakan buka menu "Daftar Event", pilih event yang diinginkan, lalu klik tombol "Daftar".', ['daftar otomatis', 'daftarkan saya', 'bisa daftarin']);
addFaq('Pertanyaan Umum Sistem', 'Apakah AI Assistant bisa melihat tiket atau data pribadi saya?', 'Tidak, AI Assistant tidak terhubung langsung ke database privat pendaftaran Anda demi keamanan. Anda dapat memeriksa tiket dan barcode pribadi di menu "Riwayat Pendaftaran".', ['lihat data saya', 'lihat tiket saya', 'bisa lihat riwayat']);
addFaq('Pertanyaan Umum Sistem', 'Di mana saya bisa melihat daftar event yang tersedia?', 'Daftar seluruh event yang sedang dibuka dapat dilihat pada menu "Daftar Event" di panel navigasi sebelah kiri portal mahasiswa.', ['daftar event', 'menu event', 'lihat kegiatan']);
addFaq('Pertanyaan Umum Sistem', 'Bagaimana cara melihat tiket dan barcode yang sudah saya daftarkan?', 'Anda dapat melihat tiket, barcode QR absensi, serta kwitansi pendaftaran di menu "Riwayat Pendaftaran".', ['tiket', 'barcode', 'qr', 'riwayat pendaftaran']);
addFaq('Pertanyaan Umum Sistem', 'Di mana saya bisa membaca pengumuman resmi fakultas?', 'Pengumuman resmi fakultas dapat diakses melalui menu "Pengumuman Fakultas" di sidebar portal mahasiswa.', ['pengumuman', 'menu pengumuman', 'info kampus']);
addFaq('Pertanyaan Umum Sistem', 'Apakah sistem ini terhubung dengan email mahasiswa?', 'Ya, notifikasi pendaftaran, verifikasi pembayaran, pengumuman kegiatan, dan pengiriman sertifikat dikirimkan langsung ke email resmi mahasiswa.', ['notifikasi email', 'terhubung email']);
addFaq('Pertanyaan Umum Sistem', 'Jam berapa saja event biasanya dilaksanakan?', 'Waktu pelaksanaan bervariasi sesuai jadwal masing-masing event (WITA), yang dapat dilihat langsung pada detail event di portal ini.', ['jam berapa', 'waktu pelaksanaan', 'zona waktu']);
addFaq('Pertanyaan Umum Sistem', 'Zona waktu apa yang digunakan pada sistem FILKOM Events?', 'Sistem FILKOM Events menggunakan zona waktu Waktu Indonesia Tengah (WITA / UTC+8).', ['zona waktu', 'wita', 'timezone']);
addFaq('Pertanyaan Umum Sistem', 'Apakah sistem ini bisa diakses lewat smartphone?', 'Ya, tampilan portal FILKOM Events responsif dan dapat diakses dengan nyaman melalui browser ponsel maupun laptop.', ['hp', 'mobile', 'smartphone', 'tampilan']);
addFaq('Pertanyaan Umum Sistem', 'Ke mana saya harus melapor jika sistem mengalami kendala teknis?', 'Silakan hubungi administrator fakultas melalui ruang admin FILKOM atau sampaikan kepada pengurus BEM FILKOM.', ['kendala teknis', 'lapor bug', 'error']);
addFaq('Pertanyaan Umum Sistem', 'Apakah data pendaftaran saya tersimpan aman?', 'Ya, data pendaftaran dan absensi Anda tersimpan pada basis data resmi sistem FILKOM Event Management.', ['keamanan data', 'aman']);

// 2. Informasi Seluruh Event Mendatang (15 items)
addFaq('Informasi Seluruh Event Mendatang', 'Event apa saja yang akan datang di FILKOM?', 'Saat ini terdapat 4 event resmi mendatang di FILKOM UNKLAB:\n1. FILKOM Day (20 Nov 2026)\n2. Workshop Machine Learning dengan Python (25 Nov 2026)\n3. Pelatihan Desain UI/UX dengan Figma (10 Des 2026)\n4. Malam Apresiasi Mahasiswa FILKOM 2026 (18 Des 2026).', ['event mendatang', 'jadwal event', 'ada event apa saja', 'daftar kegiatan']);
addFaq('Informasi Seluruh Event Mendatang', 'Apa event terdekat yang akan diadakan?', 'Event terdekat adalah FILKOM Day yang akan diadakan pada Jumat, 20 November 2026 di Kampus UNKLAB mulai pukul 08:00 WITA.', ['event terdekat', 'yang paling dekat', 'kapan terdekat']);
addFaq('Informasi Seluruh Event Mendatang', 'Kapan FILKOM Day dilaksanakan?', 'FILKOM Day diselenggarakan pada Jumat, 20 November 2026, pukul 08:00 - 19:00 WITA di Kampus UNKLAB.', ['kapan filkom day', 'tanggal filkom day']);
addFaq('Informasi Seluruh Event Mendatang', 'Kapan Workshop Machine Learning diadakan?', 'Workshop Machine Learning dengan Python diselenggarakan pada Rabu, 25 November 2026, pukul 13:30 - 16:30 WITA di Lab Komputer FILKOM Lantai 2.', ['kapan workshop ml', 'tanggal workshop machine learning']);
addFaq('Informasi Seluruh Event Mendatang', 'Kapan Pelatihan UI/UX Figma diadakan?', 'Pelatihan Desain UI/UX dengan Figma diselenggarakan pada Kamis, 10 Desember 2026, pukul 09:00 - 16:00 WITA di Ruang Seminar FILKOM Lt. 3.', ['kapan pelatihan ui ux', 'tanggal ui ux']);
addFaq('Informasi Seluruh Event Mendatang', 'Kapan Malam Apresiasi Mahasiswa FILKOM dilaksanakan?', 'Malam Apresiasi Mahasiswa FILKOM 2026 dilaksanakan pada Jumat, 18 Desember 2026, pukul 18:00 - 22:00 WITA di Gedung Olahraga UNKLAB.', ['kapan malam apresiasi', 'tanggal malam apresiasi']);
addFaq('Informasi Seluruh Event Mendatang', 'Apakah ada kegiatan di bulan November 2026?', 'Ada dua kegiatan di bulan November 2026, yaitu:\n1. FILKOM Day pada 20 November 2026\n2. Workshop Machine Learning dengan Python pada 25 November 2026.', ['event november', 'bulan november']);
addFaq('Informasi Seluruh Event Mendatang', 'Apakah ada kegiatan di bulan Desember 2026?', 'Ada dua kegiatan di bulan Desember 2026, yaitu:\n1. Pelatihan Desain UI/UX dengan Figma pada 10 Desember 2026\n2. Malam Apresiasi Mahasiswa FILKOM pada 18 Desember 2026.', ['event desember', 'bulan desember']);
addFaq('Informasi Seluruh Event Mendatang', 'Dari seluruh event mendatang, mana yang gratis?', 'Tiga event diselenggarakan secara Gratis: Workshop Machine Learning dengan Python, Pelatihan Desain UI/UX dengan Figma, dan Malam Apresiasi Mahasiswa FILKOM 2026.', ['event gratis', 'tanpa bayar', 'free']);
addFaq('Informasi Seluruh Event Mendatang', 'Event mana yang berbayar?', 'Hanya FILKOM Day yang berbayar dengan biaya pendaftaran sebesar Rp 225.000 (sudah termasuk baju kaos dan konsumsi).', ['event berbayar', 'bayar']);
addFaq('Informasi Seluruh Event Mendatang', 'Apakah semua event memberikan sertifikat?', 'Ya, peserta yang hadir pada kegiatan dan tercatat absensinya akan diterbitkan e-sertifikat resmi.', ['sertifikat', 'apakah dapat sertif']);
addFaq('Informasi Seluruh Event Mendatang', 'Apakah saya boleh mendaftar lebih dari satu event?', 'Tentu saja! Mahasiswa diperbolehkan mendaftar lebih dari satu event selama kuota pendaftaran masih tersedia dan jadwal tidak bentrok.', ['daftar banyak', 'lebih dari satu']);
addFaq('Informasi Seluruh Event Mendatang', 'Apakah ada seminar tentang cybersecurity yang dibuka saat ini?', 'Saat ini belum ada event khusus Cyber Security yang berstatus Published di sistem resmi. Pantau terus pengumuman fakultas untuk update kegiatan mendatang.', ['cyber security', 'keamanan siber']);
addFaq('Informasi Seluruh Event Mendatang', 'Apakah ada kompetisi programming atau hackathon?', 'Saat ini belum ada jadwal kompetisi programming yang terdaftar. Kegiatan yang tersedia saat ini meliputi workshop, pelatihan, FILKOM Day, dan malam apresiasi.', ['lomba', 'kompetisi', 'hackathon']);
addFaq('Informasi Seluruh Event Mendatang', 'Siapa yang mengorganisir seluruh event ini?', 'Seluruh kegiatan resmi ini dikoordinasikan oleh Badan Eksekutif Mahasiswa (BEM) FILKOM bersama panitia pelaksana di bawah naungan Fakultas Ilmu Komputer UNKLAB.', ['panitia', 'penyelenggara', 'organizer']);

// 3. Detail Workshop Machine Learning dengan Python (20 items)
addFaq('Detail Workshop Machine Learning', 'Apa topik utama Workshop Machine Learning?', 'Topik utama workshop ini adalah hands-on implementasi model Machine Learning menggunakan bahasa Python dan library scikit-learn untuk membangun model prediksi data nyata.', ['topik machine learning', 'materi ml', 'belajar apa di ml']);
addFaq('Detail Workshop Machine Learning', 'Kapan Workshop Machine Learning dilaksanakan?', 'Workshop Machine Learning dilaksanakan pada hari Rabu, 25 November 2026, pukul 13:30 hingga 16:30 WITA.', ['kapan ml', 'jadwal ml', 'jam ml']);
addFaq('Detail Workshop Machine Learning', 'Di mana lokasi Workshop Machine Learning?', 'Lokasinya berada di Lab Komputer FILKOM Lantai 2, Kampus Universitas Klabat.', ['lokasi ml', 'tempat workshop ml', 'ruangan ml']);
addFaq('Detail Workshop Machine Learning', 'Berapa biaya pendaftaran Workshop Machine Learning?', 'Pendaftaran Workshop Machine Learning adalah Gratis (Rp 0).', ['biaya ml', 'harga ml', 'apakah ml bayar']);
addFaq('Detail Workshop Machine Learning', 'Berapa total kuota peserta Workshop Machine Learning?', 'Total kuota yang disediakan adalah 50 peserta.', ['kuota ml', 'kapasitas ml']);
addFaq('Detail Workshop Machine Learning', 'Berapa sisa kuota Workshop Machine Learning saat ini?', 'Saat ini sudah terdaftar 36 peserta dari kuota 50, sehingga tersisa 14 kursi lagi.', ['sisa kuota ml', 'apakah ml masih ada kuota']);
addFaq('Detail Workshop Machine Learning', 'Apa saja persyaratan untuk mengikuti Workshop Machine Learning?', 'Peserta diwajibkan membawa laptop pribadi dan sudah menginstal Python 3.x beserta pustaka pendukung seperti scikit-learn.', ['syarat ml', 'persyaratan ml', 'bawa apa ml']);
addFaq('Detail Workshop Machine Learning', 'Apakah pemula boleh ikut Workshop Machine Learning?', 'Boleh. Workshop ini dirancang hands-on sehingga mahasiswa yang baru tertarik pada kecerdasan buatan dapat mengikuti pembelajarannya.', ['pemula ml', 'apakah pemula boleh ikut']);
addFaq('Detail Workshop Machine Learning', 'Library apa saja yang dipelajari pada Workshop ML?', 'Workshop ini berfokus pada scikit-learn serta library pendukung analisis data dengan Python.', ['library ml', 'scikit learn']);
addFaq('Detail Workshop Machine Learning', 'Apakah peserta Workshop ML mendapatkan sertifikat?', 'Ya, peserta yang hadir dan melakukan scan absensi akan mendapatkan e-sertifikat resmi dari FILKOM UNKLAB.', ['sertifikat ml', 'sertif ml']);
addFaq('Detail Workshop Machine Learning', 'Berapa lama durasi Workshop Machine Learning?', 'Durasinya adalah 3 jam, mulai pukul 13:30 sampai 16:30 WITA.', ['durasi ml', 'berapa jam ml']);
addFaq('Detail Workshop Machine Learning', 'Siapa pembicara di Workshop Machine Learning?', 'Informasi nama pemateri/narasumber spesifik belum dicantumkan secara detail pada sistem pengumuman resmi. Silakan pantau pengumuman terbaru.', ['pembicara ml', 'narasumber ml', 'siapa pemateri ml']);
addFaq('Detail Workshop Machine Learning', 'Apakah disediakan komputer di lab atau harus bawa laptop?', 'Meskipun bertempat di Lab Komputer FILKOM, peserta tetap diwajibkan membawa laptop pribadi agar proyek dan model dapat langsung disimpan.', ['harus bawa laptop ml', 'komputer lab']);
addFaq('Detail Workshop Machine Learning', 'Apakah ada konsumsi di Workshop Machine Learning?', 'Tidak ada pilihan konsumsi yang tercantum pada event ini. Peserta disarankan mempersiapkan air minum pribadi.', ['makan ml', 'konsumsi ml', 'snack ml']);
addFaq('Detail Workshop Machine Learning', 'Bagaimana cara mendaftar Workshop Machine Learning?', 'Masuk ke menu "Daftar Event", pilih "Workshop Machine Learning dengan Python", klik "Daftar Event", lalu konfirmasi pendaftaran Anda.', ['cara daftar ml', 'daftar workshop python']);
addFaq('Detail Workshop Machine Learning', 'Kategori apa untuk event Workshop Machine Learning?', 'Event ini masuk dalam kategori "Workshop".', ['kategori ml']);
addFaq('Detail Workshop Machine Learning', 'Apakah Workshop Machine Learning cocok untuk mahasiswa peminat Data Science?', 'Sangat cocok! Materi implementasi algoritma prediksi Machine Learning dengan scikit-learn merupakan fondasi penting dalam Data Science.', ['rekomendasi data science', 'cocok data science']);
addFaq('Detail Workshop Machine Learning', 'Apakah Workshop ML ini diadakan secara online atau tatap muka?', 'Workshop ini diselenggarakan secara tatap muka (luring / offline) di Lab Komputer FILKOM Lantai 2.', ['online atau offline ml', 'apakah zoom']);
addFaq('Detail Workshop Machine Learning', 'Apakah ada tugas atau ujian di akhir workshop?', 'Workshop ini bersifat pelatihan langsung (hands-on) membangun model prediksi, tidak ada ujian formal yang dicantumkan pada sistem.', ['tugas ml', 'ujian ml']);
addFaq('Detail Workshop Machine Learning', 'Jika kuota Workshop Machine Learning penuh, apakah bisa daftar?', 'Jika kuota 50 peserta telah terpenuhi, pendaftaran otomatis ditutup. Segera daftar selagi sisa 14 kursi masih tersedia.', ['kuota habis ml', 'bisa daftar kalau penuh']);

// 4. Detail Pelatihan Desain UI/UX dengan Figma (20 items)
addFaq('Detail Pelatihan UI/UX Figma', 'Apa yang dipelajari pada Pelatihan Desain UI/UX dengan Figma?', 'Peserta belajar prinsip-prinsip desain antarmuka pengguna (UI/UX) modern menggunakan Figma serta membuat prototype aplikasi mobile dari awal hingga siap dipresentasikan.', ['materi ui ux', 'belajar apa figma', 'isi pelatihan figma']);
addFaq('Detail Pelatihan UI/UX Figma', 'Kapan Pelatihan UI/UX Figma diadakan?', 'Pelatihan diadakan pada hari Kamis, 10 Desember 2026, mulai pukul 09:00 hingga 16:00 WITA.', ['jadwal ui ux', 'kapan figma', 'tanggal figma']);
addFaq('Detail Pelatihan UI/UX Figma', 'Di mana lokasi Pelatihan UI/UX Figma?', 'Lokasinya di Ruang Seminar FILKOM Lt. 3, Kampus UNKLAB.', ['lokasi ui ux', 'ruangan seminar figma', 'tempat figma']);
addFaq('Detail Pelatihan UI/UX Figma', 'Berapa biaya pendaftaran Pelatihan UI/UX Figma?', 'Pelatihan ini Gratis (Rp 0) untuk mahasiswa FILKOM.', ['biaya ui ux', 'apakah figma bayar', 'gratis figma']);
addFaq('Detail Pelatihan UI/UX Figma', 'Berapa kuota peserta Pelatihan UI/UX Figma?', 'Kuota peserta adalah 40 orang.', ['kuota figma', 'kapasitas ui ux']);
addFaq('Detail Pelatihan UI/UX Figma', 'Berapa sisa kuota Pelatihan UI/UX Figma saat ini?', 'Saat ini sudah terdaftar 39 peserta dari 40 kuota, sehingga tersisa 1 kursi terakhir!', ['sisa kuota figma', 'apakah figma masih ada']);
addFaq('Detail Pelatihan UI/UX Figma', 'Apakah saya harus punya akun Figma sebelum ikut?', 'Ya, peserta disarankan telah memiliki akun Figma aktif (bisa menggunakan akun gratis atau Figma for Education) dan membawa laptop.', ['akun figma', 'syarat figma']);
addFaq('Detail Pelatihan UI/UX Figma', 'Apakah peserta harus mahir menggambar untuk ikut UI/UX?', 'Tidak, pelatihan ini fokus pada prinsip desain antarmuka, tata letak, hierarki visual, dan prototyping aplikasi, bukan keahlian melukis manual.', ['mahir gambar', 'bisa desain']);
addFaq('Detail Pelatihan UI/UX Figma', 'Berapa lama durasi Pelatihan UI/UX Figma?', 'Durasi pelatihan adalah 7 jam (09:00 - 16:00 WITA), termasuk istirahat.', ['durasi figma', 'berapa lama ui ux']);
addFaq('Detail Pelatihan UI/UX Figma', 'Apakah pelatihan Figma ini online atau offline?', 'Pelatihan diselenggarakan secara offline / tatap muka di Ruang Seminar FILKOM Lt. 3.', ['online figma', 'tatap muka figma']);
addFaq('Detail Pelatihan UI/UX Figma', 'Apakah peserta mendapat sertifikat?', 'Ya, peserta yang hadir penuh dan melakukan absensi akan memperoleh e-sertifikat resmi dari FILKOM.', ['sertifikat figma', 'sertif ui ux']);
addFaq('Detail Pelatihan UI/UX Figma', 'Apakah disediakan template desain selama pelatihan?', 'Ya, peserta akan mempraktikkan pembuatan prototype mobile app dengan bimbingan komponen UI modern.', ['template figma', 'komponen ui']);
addFaq('Detail Pelatihan UI/UX Figma', 'Siapa pembicara pada Pelatihan UI/UX Figma?', 'Nama narasumber/mentor belum dicantumkan secara spesifik pada data sistem resmi. Silakan nantikan pengumuman panitia.', ['pembicara figma', 'mentor ui ux']);
addFaq('Detail Pelatihan UI/UX Figma', 'Apakah pelatihan ini cocok untuk peminat Front-End Development?', 'Sangat cocok! Pemahaman UI/UX dan Figma sangat berharga bagi developer front-end dalam mengimplementasikan desain ke kode aplikasi.', ['cocok front end', 'developer figma']);
addFaq('Detail Pelatihan UI/UX Figma', 'Apakah ada makan siang di Pelatihan UI/UX?', 'Fasilitas makanan khusus tidak tercantum pada data pendaftaran event ini. Peserta dapat memanfaatkan jam istirahat untuk makan siang mandiri.', ['makan siang figma', 'konsumsi figma']);
addFaq('Detail Pelatihan UI/UX Figma', 'Kategori apa untuk event Pelatihan UI/UX Figma?', 'Event ini terdaftar dalam kategori "Pelatihan".', ['kategori ui ux']);
addFaq('Detail Pelatihan UI/UX Figma', 'Bagaimana jika sisa 1 kuota sudah terisi?', 'Jika kuota 40 peserta telah penuh, status kuota akan ditutup. Segera lakukan registrasi di menu "Daftar Event".', ['kuota penuh figma', 'sisa 1']);
addFaq('Detail Pelatihan UI/UX Figma', 'Apakah software Figma harus diinstal di laptop?', 'Figma dapat diakses langsung lewat web browser modern (seperti Chrome) atau aplikasi desktop Figma. Keduanya bisa digunakan.', ['instal figma', 'figma browser']);
addFaq('Detail Pelatihan UI/UX Figma', 'Apakah peserta wajib membawa mouse?', 'Membawa mouse sangat disarankan untuk memudahkan proses desain antarmuka di Figma.', ['mouse figma']);
addFaq('Detail Pelatihan UI/UX Figma', 'Bagaimana cara konfirmasi kehadiran di Pelatihan UI/UX?', 'Tunjukkan barcode tiket Anda dari menu "Riwayat Pendaftaran" kepada panitia di lokasi saat registrasi dibuka.', ['absensi figma', 'barcode figma']);

// 5. Detail Malam Apresiasi Mahasiswa FILKOM 2026 (20 items)
addFaq('Detail Malam Apresiasi Mahasiswa', 'Apa itu Malam Apresiasi Mahasiswa FILKOM 2026?', 'Malam Apresiasi Mahasiswa FILKOM 2026 adalah perayaan tahunan fakultas untuk memberikan penghargaan kepada mahasiswa berprestasi, pertunjukan seni mahasiswa, serta penganugerahan akademik semester ganjil 2026.', ['apa itu malam apresiasi', 'tentang malam apresiasi']);
addFaq('Detail Malam Apresiasi Mahasiswa', 'Kapan Malam Apresiasi Mahasiswa diselenggarakan?', 'Acara diselenggarakan pada hari Jumat, 18 Desember 2026, pukul 18:00 hingga 22:00 WITA.', ['kapan malam apresiasi', 'jadwal malam apresiasi', 'jam malam apresiasi']);
addFaq('Detail Malam Apresiasi Mahasiswa', 'Di mana tempat pelaksanaan Malam Apresiasi Mahasiswa?', 'Bertempat di Gedung Olahraga UNKLAB (Gymnasium Universitas Klabat).', ['lokasi malam apresiasi', 'tempat malam apresiasi', 'gedung olahraga unklab']);
addFaq('Detail Malam Apresiasi Mahasiswa', 'Berapa harga tiket masuk Malam Apresiasi Mahasiswa?', 'Tiket masuk Malam Apresiasi Mahasiswa adalah Gratis (Rp 0).', ['biaya malam apresiasi', 'tiket malam apresiasi gratis']);
addFaq('Detail Malam Apresiasi Mahasiswa', 'Berapa total kuota peserta Malam Apresiasi?', 'Total kuota adalah 300 peserta.', ['kuota malam apresiasi']);
addFaq('Detail Malam Apresiasi Mahasiswa', 'Berapa sisa kuota Malam Apresiasi saat ini?', 'Dari kuota 300 orang, sudah terdaftar 127 mahasiswa sehingga sisa kuota saat ini adalah 173 kursi.', ['sisa kuota malam apresiasi']);
addFaq('Detail Malam Apresiasi Mahasiswa', 'Apa dress code atau aturan pakaian untuk Malam Apresiasi?', 'Pakaian yang digunakan adalah pakaian rapi, sopan, dan formal/smart casual sesuai tata tertib kampus UNKLAB.', ['dresscode malam apresiasi', 'baju apa malam apresiasi', 'aturan pakaian']);
addFaq('Detail Malam Apresiasi Mahasiswa', 'Siapa saja yang boleh datang ke Malam Apresiasi?', 'Seluruh mahasiswa aktif Fakultas Ilmu Komputer UNKLAB dari semua angkatan dan program studi.', ['siapa boleh ikut malam apresiasi', 'peserta malam apresiasi']);
addFaq('Detail Malam Apresiasi Mahasiswa', 'Apakah ada penganugerahan penghargaan bagi mahasiswa berprestasi?', 'Ya, salah satu agenda utama adalah apresiasi dan penganugerahan bagi mahasiswa yang menorehkan prestasi akademik maupun non-akademik.', ['penghargaan malam apresiasi', 'award mahasiswa']);
addFaq('Detail Malam Apresiasi Mahasiswa', 'Apakah ada pertunjukan musik atau seni?', 'Ya, acara dimeriahkan dengan penampilan seni dan musik dari perwakilan mahasiswa FILKOM.', ['penampilan seni', 'musik malam apresiasi']);
addFaq('Detail Malam Apresiasi Mahasiswa', 'Apakah peserta mendapatkan e-sertifikat kehadiran?', 'Ya, mahasiswa yang hadir dan discan barcode tiketnya akan mendapatkan e-sertifikat resmi.', ['sertifikat malam apresiasi']);
addFaq('Detail Malam Apresiasi Mahasiswa', 'Apakah harus mendaftar terlebih dahulu?', 'Ya, pendaftaran wajib dilakukan melalui sistem portal agar nama Anda tercatat dan barcode tiket diterbitkan.', ['wajib daftar malam apresiasi']);
addFaq('Detail Malam Apresiasi Mahasiswa', 'Apakah disediakan makanan pada Malam Apresiasi?', 'Acara malam apresiasi tahunan biasanya menyajikan jamuan kebersamaan mahasiswa dan dosen.', ['konsumsi malam apresiasi', 'makan malam apresiasi']);
addFaq('Detail Malam Apresiasi Mahasiswa', 'Kategori apa event Malam Apresiasi ini?', 'Event ini terdaftar dalam kategori "Sosial & Budaya".', ['kategori malam apresiasi']);
addFaq('Detail Malam Apresiasi Mahasiswa', 'Berapa lama durasi Malam Apresiasi Mahasiswa?', 'Acara berlangsung selama 4 jam, dari pukul 18:00 sampai 22:00 WITA.', ['durasi malam apresiasi']);
addFaq('Detail Malam Apresiasi Mahasiswa', 'Apakah boleh mengajak teman dari luar fakultas?', 'Pendaftaran sistem resmi ini diprioritaskan khusus bagi mahasiswa Fakultas Ilmu Komputer Universitas Klabat.', ['ajak teman luar fakultas']);
addFaq('Detail Malam Apresiasi Mahasiswa', 'Bagaimana cara masuk ke Gedung Olahraga saat acara?', 'Tunjukkan QR Code pendaftaran dari menu "Riwayat Pendaftaran" kepada panitia absensi di pintu masuk.', ['masuk gedung olahraga', 'absen malam apresiasi']);
addFaq('Detail Malam Apresiasi Mahasiswa', 'Apakah dosen-dosen FILKOM akan hadir?', 'Ya, dekanat, dosen, dan staf pengajar FILKOM turut hadir untuk memberikan apresiasi kepada mahasiswa.', ['dosen hadir malam apresiasi']);
addFaq('Detail Malam Apresiasi Mahasiswa', 'Apakah ada pengumuman nilai semester di acara ini?', 'Acara ini merayakan pencapaian akademik berprestasi semester ganjil 2026, bukan pembagian transkrip nilai pribadi.', ['pengumuman nilai']);
addFaq('Detail Malam Apresiasi Mahasiswa', 'Kapan batas akhir pendaftaran Malam Apresiasi?', 'Pendaftaran dibuka hingga kuota 300 terpenuhi atau sampai menjelang hari H acara pada 18 Desember 2026.', ['batas pendaftaran malam apresiasi']);

// 6. Detail FILKOM Day 2026 (20 items)
addFaq('Detail FILKOM Day', 'Apa itu kegiatan FILKOM Day?', 'FILKOM Day adalah agenda tahunan akbar seluruh keluarga besar Fakultas Ilmu Komputer UNKLAB yang wajib diikuti oleh seluruh mahasiswa aktif untuk membangun solidaritas, kebersamaan, dan wawasan fakultas.', ['apa itu filkom day', 'kegiatan filkom day']);
addFaq('Detail FILKOM Day', 'Kapan FILKOM Day dilaksanakan?', 'FILKOM Day dilaksanakan pada hari Jumat, 20 November 2026, mulai pukul 08:00 pagi hingga 19:00 WITA.', ['kapan filkom day', 'jadwal filkom day', 'jam filkom day']);
addFaq('Detail FILKOM Day', 'Di mana lokasi FILKOM Day?', 'Lokasi kegiatan berpusat di Kampus Universitas Klabat.', ['lokasi filkom day', 'tempat filkom day']);
addFaq('Detail FILKOM Day', 'Apakah FILKOM Day wajib diikuti?', 'Ya, keterangan resmi event menyatakan bahwa FILKOM Day "Wajib diikuti" oleh seluruh mahasiswa Fakultas Ilmu Komputer.', ['apakah filkom day wajib', 'wajib filkom day']);
addFaq('Detail FILKOM Day', 'Berapa biaya pendaftaran FILKOM Day?', 'Biaya pendaftaran FILKOM Day adalah sebesar Rp 225.000.', ['biaya filkom day', 'harga filkom day', 'berapa bayar filkom day']);
addFaq('Detail FILKOM Day', 'Ke rekening mana pembayaran FILKOM Day ditransfer?', 'Pembayaran ditransfer ke rekening Bank BNI: 0000000000 atas nama Gledial.', ['rekening filkom day', 'transfer filkom day', 'bank filkom day']);
addFaq('Detail FILKOM Day', 'Berapa kuota peserta yang dibuka untuk FILKOM Day?', 'Kuota yang tercatat pada sistem adalah 100 peserta.', ['kuota filkom day']);
addFaq('Detail FILKOM Day', 'Apa saja fasilitas yang didapatkan dari biaya Rp 225.000?', 'Fasilitas meliputi konsumsi makanan (pilihan menu), baju kaos resmi event FILKOM Day, e-sertifikat kegiatan, dan seluruh rangkaian acara.', ['fasilitas filkom day', 'dapat apa saja filkom day']);
addFaq('Detail FILKOM Day', 'Pilihan menu makanan apa saja yang tersedia di FILKOM Day?', 'Tersedia 3 pilihan menu konsumsi: Ayam, Ikan, dan Vegetarian.', ['pilihan makanan filkom day', 'menu makan filkom day', 'vegetarian filkom day']);
addFaq('Detail FILKOM Day', 'Ukuran baju kaos apa saja yang tersedia untuk FILKOM Day?', 'Ukuran baju kaos yang disediakan mencakup: S, M, L, XL, dan XXL.', ['ukuran kaos filkom day', 'size baju filkom day', 'ukuran baju']);
addFaq('Detail FILKOM Day', 'Kapan saya memilih ukuran baju dan menu makanan?', 'Pilihan ukuran baju dan menu makanan dipilih langsung pada formulir saat Anda melakukan pendaftaran event FILKOM Day di portal.', ['cara pilih ukuran baju', 'pilih menu']);
addFaq('Detail FILKOM Day', 'Bagaimana cara membayar pendaftaran FILKOM Day?', 'Lakukan transfer bank sebesar Rp 225.000 ke rekening BNI yang tertera, simpan bukti struk/screenshot transfer, lalu unggah bukti tersebut pada sistem.', ['cara bayar filkom day', 'upload bukti bayar']);
addFaq('Detail FILKOM Day', 'Bagaimana jika saya belum mengunggah bukti transfer?', 'Status pendaftaran Anda akan bertanda "Menunggu verifikasi" sampai bukti transfer diunggah dan diverifikasi oleh panitia atau bendahara event.', ['menunggu verifikasi filkom day', 'belum upload']);
addFaq('Detail FILKOM Day', 'Berapa nomor rekening panitia FILKOM Day?', 'Nomor rekening: 0000000000, Bank: BNI, atas nama: Gledial.', ['nomor rekening', 'no rek bni']);
addFaq('Detail FILKOM Day', 'Berapa lama durasi FILKOM Day berlangsung?', 'Acara berlangsung sepanjang hari selama 11 jam, dari pukul 08:00 hingga 19:00 WITA.', ['durasi filkom day']);
addFaq('Detail FILKOM Day', 'Apakah mahasiswa baru wajib ikut FILKOM Day?', 'Ya, seluruh mahasiswa FILKOM dari seluruh angkatan wajib berpartisipasi dalam FILKOM Day.', ['maba filkom day', 'angkatan berapa']);
addFaq('Detail FILKOM Day', 'Apakah ada sertifikat untuk FILKOM Day?', 'Ya, seluruh peserta yang hadir dan terverifikasi absensinya akan mendapatkan e-sertifikat resmi FILKOM Day.', ['sertifikat filkom day']);
addFaq('Detail FILKOM Day', 'Kategori apa untuk event FILKOM Day?', 'Event ini terdaftar dalam kategori "Lainnya" (Kegiatan Akbar Fakultas).', ['kategori filkom day']);
addFaq('Detail FILKOM Day', 'Bolehkah memilih menu vegetarian di FILKOM Day?', 'Boleh, panitia secara khusus menyediakan opsi menu Vegetarian pada formulir pendaftaran.', ['bisa vegetarian']);
addFaq('Detail FILKOM Day', 'Siapa panitia penanggung jawab FILKOM Day?', 'FILKOM Day diselenggarakan oleh BEM Fakultas Ilmu Komputer UNKLAB.', ['penanggung jawab filkom day']);

// 7. Pertanyaan Pendaftaran & Alur Registrasi (15 items)
addFaq('Pertanyaan Pendaftaran', 'Bagaimana cara mendaftar event di FILKOM Events?', 'Alur pendaftaran:\n1. Buka menu "Daftar Event" di portal mahasiswa.\n2. Pilih event yang ingin diikuti lalu klik tombol "Daftar".\n3. Isi opsi jika ada (seperti ukuran kaos atau menu makanan).\n4. Jika event berbayar, lakukan transfer dan unggah bukti transfer.\n5. Tiket QR pendaftaran Anda akan langsung tersedia di menu "Riwayat Pendaftaran".', ['cara mendaftar', 'alur pendaftaran', 'bagaimana daftar']);
addFaq('Pertanyaan Pendaftaran', 'Apakah pendaftaran event memerlukan biaya?', 'Sebagian besar event FILKOM seperti workshop, pelatihan, dan seminar adalah Gratis. Event tertentu seperti FILKOM Day dikenakan biaya pendaftaran sesuai fasilitas yang disediakan.', ['apakah bayar', 'biaya pendaftaran event']);
addFaq('Pertanyaan Pendaftaran', 'Apakah saya bisa mendaftar jika kuota sudah habis?', 'Jika kuota sudah penuh, tombol pendaftaran akan dinonaktifkan secara otomatis oleh sistem.', ['kuota habis', 'kuota penuh daftar']);
addFaq('Pertanyaan Pendaftaran', 'Di mana saya bisa melihat status pendaftaran saya?', 'Status pendaftaran dapat dilihat di menu "Riwayat Pendaftaran".', ['status pendaftaran', 'cek pendaftaran']);
addFaq('Pertanyaan Pendaftaran', 'Apakah saya bisa membatalkan pendaftaran event?', 'Anda dapat membatalkan pendaftaran melalui portal selama acara belum berlangsung atau menghubungi panitia BEM.', ['batal daftar', 'cancel pendaftaran']);
addFaq('Pertanyaan Pendaftaran', 'Apakah pendaftaran event langsung disetujui?', 'Untuk event gratis, pendaftaran langsung terkonfirmasi otomatis dan tiket QR langsung terbit. Untuk event berbayar, status akan "Lunas" setelah bukti transfer diverifikasi.', ['langsung disetujui', 'konfirmasi otomatis']);
addFaq('Pertanyaan Pendaftaran', 'Bisakah mahasiswa luar UNKLAB mendaftar lewat sistem ini?', 'Tidak, sistem pendaftaran ini khusus diperuntukkan bagi mahasiswa aktif dengan akun resmi @student.unklab.ac.id.', ['luar unklab', 'kampus lain']);
addFaq('Pertanyaan Pendaftaran', 'Apa yang harus dilakukan setelah berhasil mendaftar event gratis?', 'Simpan tiket QR Anda yang ada di menu "Riwayat Pendaftaran", catat jadwal dan lokasinya, lalu hadir tepat waktu saat kegiatan berlangsung.', ['setelah daftar', 'langkah selanjutnya']);
addFaq('Pertanyaan Pendaftaran', 'Apakah saya akan menerima konfirmasi email setelah mendaftar?', 'Ya, sistem akan mengirimkan ringkasan bukti pendaftaran ke email resmi mahasiswa Anda.', ['konfirmasi email', 'email pendaftaran']);
addFaq('Pertanyaan Pendaftaran', 'Mengapa tombol daftar tidak bisa diklik?', 'Tombol tidak bisa diklik jika Anda belum login, kuota event sudah penuh, event sudah selesai, atau Anda sudah terdaftar pada event tersebut.', ['tombol daftar tidak bisa', 'tidak bisa klik']);
addFaq('Pertanyaan Pendaftaran', 'Bolehkah mendaftarkan teman saya dengan akun saya?', 'Tidak boleh. Satu akun hanya dapat mendaftarkan pemilik akun tersebut karena tiket QR terikat pada NIM dan identitas Anda.', ['daftarkan teman', 'pakai akun teman']);
addFaq('Pertanyaan Pendaftaran', 'Format file apa yang didukung untuk mengunggah bukti transfer?', 'Sistem mendukung file bukti transfer dalam format JPG, PNG, WEBP, atau PDF dengan ukuran maksimal 1.5 MB.', ['format bukti transfer', 'ukuran file bukti']);
addFaq('Pertanyaan Pendaftaran', 'Berapa ukuran maksimal file bukti pembayaran?', 'Maksimal ukuran file bukti transfer adalah 1.5 MB.', ['ukuran maksimal bukti', 'maksimal upload']);
addFaq('Pertanyaan Pendaftaran', 'Apakah bukti transfer bisa diunggah belakangan?', 'Ya, Anda dapat mengunggah bukti transfer melalui menu "Riwayat Pendaftaran" pada kartu event yang bersangkutan.', ['upload bukti belakangan']);
addFaq('Pertanyaan Pendaftaran', 'Apakah saya mendapatkan kwitansi pendaftaran resmi?', 'Ya, untuk event berbayar yang telah disetujui, kwitansi resmi dengan nomor bukti pembayaran dapat diunduh dalam format PDF.', ['kwitansi resmi', 'unduh kwitansi']);

// 8. Biaya, Pembayaran, dan Kuota (15 items)
addFaq('Biaya dan Kuota', 'Event apa saja yang gratis saat ini?', 'Event gratis saat ini meliputi:\n1. Workshop Machine Learning dengan Python (Rp 0)\n2. Pelatihan Desain UI/UX dengan Figma (Rp 0)\n3. Malam Apresiasi Mahasiswa FILKOM (Rp 0).', ['event apa yang gratis', 'daftar event gratis']);
addFaq('Biaya dan Kuota', 'Event apa yang memerlukan biaya?', 'Event yang berbayar saat ini adalah FILKOM Day dengan biaya pendaftaran Rp 225.000.', ['event apa yang bayar']);
addFaq('Biaya dan Kuota', 'Berapa biaya pendaftaran Workshop Machine Learning?', 'Biayanya adalah Rp 0 (Gratis).', ['biaya workshop ml']);
addFaq('Biaya dan Kuota', 'Berapa biaya pendaftaran Pelatihan UI/UX Figma?', 'Biayanya adalah Rp 0 (Gratis).', ['biaya pelatihan ui ux']);
addFaq('Biaya dan Kuota', 'Berapa biaya Malam Apresiasi Mahasiswa?', 'Biayanya adalah Rp 0 (Gratis).', ['biaya malam apresiasi']);
addFaq('Biaya dan Kuota', 'Berapa biaya FILKOM Day?', 'Biayanya adalah Rp 225.000.', ['biaya filkom day']);
addFaq('Biaya dan Kuota', 'Berapa sisa kuota Workshop Machine Learning?', 'Sisa kuota Workshop Machine Learning saat ini adalah 14 kursi (dari total 50).', ['sisa kuota ml']);
addFaq('Biaya dan Kuota', 'Berapa sisa kuota Pelatihan UI/UX Figma?', 'Sisa kuota Pelatihan UI/UX saat ini adalah 1 kursi (dari total 40).', ['sisa kuota ui ux']);
addFaq('Biaya dan Kuota', 'Berapa sisa kuota Malam Apresiasi Mahasiswa?', 'Sisa kuota Malam Apresiasi saat ini adalah 173 kursi (dari total 300).', ['sisa kuota malam apresiasi']);
addFaq('Biaya dan Kuota', 'Berapa sisa kuota FILKOM Day?', 'Sisa kuota FILKOM Day saat ini adalah 100 kursi.', ['sisa kuota filkom day']);
addFaq('Biaya dan Kuota', 'Metode pembayaran apa yang didukung untuk event berbayar?', 'Sistem mendukung pembayaran melalui Transfer Bank (BNI) dan konfirmasi tunai melalui panitia.', ['metode bayar', 'cara transfer']);
addFaq('Biaya dan Kuota', 'Apakah bisa bayar via e-wallet (GoPay, OVO, Dana)?', 'Rekening resmi yang disediakan sistem saat ini adalah Bank BNI. Jika melakukan transfer dari e-wallet, gunakan fitur transfer ke rekening BNI tersebut.', ['gopay', 'ovo', 'dana', 'ewallet']);
addFaq('Biaya dan Kuota', 'Apakah ada biaya tambahan admin sistem?', 'Tidak ada biaya admin tambahan dari sistem portal FILKOM Events.', ['biaya admin']);
addFaq('Biaya dan Kuota', 'Event mana yang kuotanya paling sedikit?', 'Pelatihan Desain UI/UX dengan Figma memiliki kuota terkecil (40 orang) dan saat ini hanya tersisa 1 kursi.', ['kuota paling sedikit', 'paling cepat habis']);
addFaq('Biaya dan Kuota', 'Event mana yang kuotanya paling banyak?', 'Malam Apresiasi Mahasiswa FILKOM 2026 memiliki kuota terbesar, yaitu 300 peserta.', ['kuota paling banyak', 'kapasitas terbesar']);

// 9. Riwayat Pendaftaran, Tiket QR, & Batasan Chatbot (15 items)
addFaq('Riwayat Pendaftaran & Tiket', 'Di mana saya bisa melihat tiket barcode QR saya?', 'Tiket barcode QR Anda dapat diakses di menu "Riwayat Pendaftaran" pada dashboard mahasiswa.', ['lihat tiket barcode', 'dimana tiket']);
addFaq('Riwayat Pendaftaran & Tiket', 'Bagaimana cara menggunakan barcode saat hari H event?', 'Buka menu "Riwayat Pendaftaran", tampilkan barcode event kepada panitia di pintu masuk untuk discan.', ['cara pakai barcode', 'scan barcode']);
addFaq('Riwayat Pendaftaran & Tiket', 'Apakah barcode tiket boleh dicetak di kertas?', 'Boleh, Anda bisa mencetaknya atau cukup menunjukkan barcode langsung dari layar smartphone.', ['cetak barcode', 'print tiket']);
addFaq('Riwayat Pendaftaran & Tiket', 'Apakah AI Assistant bisa mengecek apakah saya sudah terdaftar?', 'AI Assistant tidak memiliki akses ke data riwayat privat Anda. Silakan cek langsung pada menu "Riwayat Pendaftaran".', ['apakah saya sudah daftar', 'cek nama saya']);
addFaq('Riwayat Pendaftaran & Tiket', 'Bisa tolong batalkan tiket event saya?', 'AI Assistant tidak dapat membatalkan pendaftaran. Anda dapat mengelolanya langsung di portal atau menghubungi panitia BEM.', ['batalkan tiket saya']);
addFaq('Riwayat Pendaftaran & Tiket', 'Apakah tiket barcode saya bisa digunakan oleh orang lain?', 'Tidak bisa. Setiap barcode pendaftaran unik dan terikat langsung pada akun dan NIM Anda.', ['tiket dipakai orang lain']);
addFaq('Riwayat Pendaftaran & Tiket', 'Bagaimana jika barcode tidak bisa discan oleh panitia?', 'Panitia dapat memasukkan kode pendaftaran atau NIM Anda secara manual melalui sistem absensi panitia.', ['barcode tidak terbaca', 'scan gagal']);
addFaq('Riwayat Pendaftaran & Tiket', 'Apa arti status "Confirmed" pada tiket saya?', 'Status "Confirmed" berarti pendaftaran Anda sudah sah dan Anda resmi terdaftar sebagai peserta kegiatan.', ['status confirmed']);
addFaq('Riwayat Pendaftaran & Tiket', 'Apa arti status "Menunggu verifikasi"?', 'Status ini menandakan bukti pembayaran Anda sedang dalam proses pengecekan oleh panitia event.', ['arti menunggu verifikasi']);
addFaq('Riwayat Pendaftaran & Tiket', 'Di mana saya mengunduh kwitansi PDF?', 'Kwitansi PDF dapat diunduh pada kartu pendaftaran di menu "Riwayat Pendaftaran" setelah pembayaran terverifikasi.', ['unduh kwitansi pdf']);
addFaq('Riwayat Pendaftaran & Tiket', 'Apakah chatbot bisa mengirimkan tiket ke WhatsApp saya?', 'Tidak, chatbot tidak memiliki integrasi ke WhatsApp. Seluruh tiket tersimpan aman di portal web Anda.', ['kirim wa', 'whatsapp tiket']);
addFaq('Riwayat Pendaftaran & Tiket', 'Berapa kali barcode absensi bisa discan?', 'Barcode hanya valid untuk 1 kali pencatatan kehadiran per event.', ['scan berkali kali']);
addFaq('Riwayat Pendaftaran & Tiket', 'Apakah ada status absensi Terlambat?', 'Ya, panitia dapat menandai kehadiran sebagai "Hadir" atau "Terlambat" sesuai waktu kedatangan Anda.', ['status terlambat']);
addFaq('Riwayat Pendaftaran & Tiket', 'Apakah status terlambat tetap mendapatkan sertifikat?', 'Ya, peserta dengan status Hadir maupun Terlambat berhak mendapatkan e-sertifikat kegiatan.', ['terlambat dapat sertif']);
addFaq('Riwayat Pendaftaran & Tiket', 'Di mana sertifikat kegiatan saya bisa diunduh?', 'E-sertifikat yang telah terbit dapat diunduh langsung melalui menu "Riwayat Pendaftaran" pada kartu event terkait.', ['unduh sertifikat']);

// 10. Pengumuman Fakultas & Akademik (15 items)
addFaq('Pengumuman Fakultas', 'Apa saja pengumuman terbaru di fakultas?', 'Pengumuman resmi yang tercatat di sistem antara lain:\n1. Pendaftaran Asisten Lab Semester Genap Telah Dibuka (Syarat IPK >= 3.00)\n2. Jadwal Evaluasi Tengah Semester (ETS)\n3. Pengumuman seputar kegiatan fakultas.', ['pengumuman terbaru', 'info fakultas', 'edaran']);
addFaq('Pengumuman Fakultas', 'Kapan pendaftaran asisten lab semester genap ditutup?', 'Pendaftaran asisten lab komputer semester genap dibuka hingga 15 November 2026.', ['asisten lab', 'aslab']);
addFaq('Pengumuman Fakultas', 'Apa syarat mendaftar asisten laboratorium komputer?', 'Syaratnya: Mahasiswa tingkat 3 atau 4, IPK minimal 3.00, telah lulus mata kuliah terkait, dan mendapat rekomendasi dosen.', ['syarat asisten lab', 'syarat aslab']);
addFaq('Pengumuman Fakultas', 'Di mana saya bisa membaca isi lengkap pengumuman?', 'Isi lengkap dapat dibaca pada menu "Pengumuman Fakultas" di dashboard mahasiswa Anda.', ['baca pengumuman']);
addFaq('Pengumuman Fakultas', 'Apakah pengumuman ada yang disematkan (pin)?', 'Ya, pengumuman penting yang dipin akan selalu berada di urutan teratas daftar pengumuman.', ['pengumuman penting', 'pinned']);
addFaq('Pengumuman Fakultas', 'Apakah ada pengumuman beasiswa di portal?', 'Pengumuman beasiswa akan dipublikasikan oleh pihak dekanat pada menu Pengumuman Fakultas jika periode pendaftaran dibuka.', ['beasiswa']);
addFaq('Pengumuman Fakultas', 'Apakah ada pengumuman libur semester?', 'Informasi kalender akademik dan libur perkuliahan mengacu pada pengumuman resmi Universitas Klabat.', ['libur']);
addFaq('Pengumuman Fakultas', 'Bagaimana jika pengumuman terkait dengan event tertentu?', 'Pengumuman yang berkaitan langsung dengan suatu event akan menampilkan label judul event bersangkutan.', ['pengumuman event']);
addFaq('Pengumuman Fakultas', 'Apakah ada notifikasi email untuk pengumuman baru?', 'Ya, publikasi pengumuman baru otomatis diteruskan ke email mahasiswa yang terdaftar.', ['email pengumuman']);
addFaq('Pengumuman Fakultas', 'Siapa yang berhak membuat pengumuman di sistem?', 'Hanya pihak Dekanat, Dosen, Admin FILKOM, dan pengurus BEM FILKOM yang memiliki otorisasi membuat pengumuman.', ['siapa buat pengumuman']);
addFaq('Pengumuman Fakultas', 'Apakah ada pengumuman tentang jadwal ETS?', 'Ya, jadwal Evaluasi Tengah Semester (ETS) tercantum pada daftar pengumuman fakultas.', ['jadwal ets', 'ujian tengah semester']);
addFaq('Pengumuman Fakultas', 'Apakah ada pengumuman lowongan magang atau kerja?', 'Fakultas secara berkala mempublikasikan informasi kemitraan magang melalui pengumuman portal.', ['magang', 'internship', 'lowongan']);
addFaq('Pengumuman Fakultas', 'Bagaimana mencari pengumuman yang sudah lama?', 'Gunakan fitur pencarian judul pada halaman menu "Pengumuman Fakultas".', ['cari pengumuman']);
addFaq('Pengumuman Fakultas', 'Apakah pengumuman di portal ini resmi?', 'Ya, seluruh pengumuman yang tampil adalah rilis resmi dari Fakultas Ilmu Komputer UNKLAB.', ['apakah resmi']);
addFaq('Pengumuman Fakultas', 'Kapan pengumuman diperbarui?', 'Pengumuman diperbarui secara real-time setiap kali pihak fakultas atau BEM menerbitkan informasi baru.', ['update pengumuman']);

// 11. Akun Mahasiswa, Domain Email, & Profil (15 items)
addFaq('Akun Mahasiswa', 'Domain email apa yang wajib digunakan untuk mendaftar akun mahasiswa?', 'Pendaftaran akun mahasiswa WAJIB menggunakan domain email resmi Universitas Klabat: @student.unklab.ac.id.', ['domain email', 'student unklab ac id', 'daftar akun email']);
addFaq('Akun Mahasiswa', 'Apakah bisa mendaftar dengan email Gmail pribadi (@gmail.com)?', 'Tidak bisa. Sistem menolak pendaftaran akun mahasiswa jika tidak menggunakan domain @student.unklab.ac.id.', ['bisa pakai gmail', 'daftar gmail']);
addFaq('Akun Mahasiswa', 'Di mana saya bisa mengedit profil saya?', 'Profil mahasiswa dapat dilihat dan dikelola melalui menu "Akun Mahasiswa" di portal.', ['profil', 'edit profil']);
addFaq('Akun Mahasiswa', 'Data apa saja yang tersimpan pada akun mahasiswa saya?', 'Data akun mencakup nama lengkap, NIM, email student UNKLAB, program studi/jurusan, nomor telepon, dan riwayat kegiatan.', ['data akun']);
addFaq('Akun Mahasiswa', 'Bagaimana jika saya lupa password akun saya?', 'Silakan hubungi admin sistem FILKOM di ruang administrasi fakultas untuk mereset kata sandi Anda.', ['lupa password']);
addFaq('Akun Mahasiswa', 'Apakah satu email bisa digunakan untuk beberapa role?', 'Berdasarkan pembaruan sistem, akun mahasiswa, admin, dan panitia dipisahkan berdasarkan hak akses perannya masing-masing.', ['satu email multi role']);
addFaq('Akun Mahasiswa', 'Berapa digit NIM mahasiswa UNKLAB?', 'NIM mahasiswa UNKLAB biasanya terdiri dari kombinasi digit angka unik (misalnya: 105022410082).', ['nim']);
addFaq('Akun Mahasiswa', 'Apakah NIM saya bisa diubah sendiri?', 'NIM terikat pada identitas akademik resmi Anda dan tidak dapat diubah sembarangan tanpa verifikasi admin.', ['ubah nim']);
addFaq('Akun Mahasiswa', 'Program studi apa saja yang ada di FILKOM UNKLAB?', 'Fakultas Ilmu Komputer UNKLAB menaungi program studi Informatika, Sistem Informasi, dan Teknologi Informasi.', ['jurusan filkom', 'prodi unklab']);
addFaq('Akun Mahasiswa', 'Apakah nomor HP pada profil digunakan untuk notifikasi?', 'Nomor HP disimpan sebagai kontak darurat panitia jika diperlukan koordinasi langsung terkait kegiatan.', ['no hp profil']);
addFaq('Akun Mahasiswa', 'Apakah akun mahasiswa saya aktif selamanya?', 'Akun aktif selama masa studi Anda sebagai mahasiswa di Fakultas Ilmu Komputer Universitas Klabat.', ['masa aktif akun']);
addFaq('Akun Mahasiswa', 'Bagaimana cara keluar (logout) dari sesi portal?', 'Klik tombol "Keluar Sesi" pada bagian bawah sidebar sebelah kiri.', ['logout', 'keluar sesi']);
addFaq('Akun Mahasiswa', 'Apakah ada konfirmasi sebelum logout?', 'Ya, sistem akan memunculkan modal dialog konfirmasi sebelum mengeluarkan sesi Anda.', ['konfirmasi logout']);
addFaq('Akun Mahasiswa', 'Mengapa email saya ditolak saat registrasi?', 'Pastikan email yang Anda masukkan berakhiran "@student.unklab.ac.id" tanpa spasi atau kesalahan penulisan.', ['email ditolak']);
addFaq('Akun Mahasiswa', 'Apakah foto profil bisa diganti?', 'Saat ini avatar profil menampilkan inisial nama resmi Anda dengan desain badge modern.', ['foto profil']);

// 12. Rekomendasi Event Berdasarkan Minat (15 items)
addFaq('Rekomendasi Event', 'Saya tertarik pada Artificial Intelligence dan Coding, event apa yang cocok?', 'Sangat disarankan mendaftar "Workshop Machine Learning dengan Python" pada 25 November 2026 untuk praktik langsung membangun model AI!', ['rekomendasi ai', 'minat coding', 'machine learning']);
addFaq('Rekomendasi Event', 'Saya suka desain grafis dan UI/UX, event mana yang cocok?', 'Pilihan terbaik untuk Anda adalah "Pelatihan Desain UI/UX dengan Figma" pada 10 Desember 2026. Anda akan belajar memvalidasi dan memprototipe aplikasi mobile.', ['rekomendasi ui ux', 'suka desain', 'figma']);
addFaq('Rekomendasi Event', 'Saya ingin acara kebersamaan dan hiburan, ada saran?', 'Jangan lewatkan "Malam Apresiasi Mahasiswa FILKOM" (18 Des 2026) dan perayaan "FILKOM Day" (20 Nov 2026) untuk menjalin keakraban dengan seluruh rekan dan dosen!', ['hiburan', 'kebersamaan', 'seni', 'apresiasi']);
addFaq('Rekomendasi Event', 'Event apa yang wajib diikuti oleh seluruh mahasiswa FILKOM?', '"FILKOM Day" pada 20 November 2026 adalah kegiatan akbar yang wajib diikuti oleh seluruh mahasiswa aktif fakultas.', ['event wajib']);
addFaq('Rekomendasi Event', 'Bagaimana cara menggunakan fitur rekomendasi personal di chatbot ini?', 'Pada panel sebelah kiri halaman AI Assistant, pilih topik minat Anda (misal: UI/UX, AI, Data Science), lalu klik "Cari Rekomendasi".', ['fitur rekomendasi']);
addFaq('Rekomendasi Event', 'Event apa yang cocok untuk mahasiswa pemula?', 'Workshop Machine Learning dan Pelatihan UI/UX keduanya dirancang hands-on dan ramah bagi mahasiswa yang baru memulai.', ['pemula']);
addFaq('Rekomendasi Event', 'Event mana yang cocok untuk memperluas networking kampus?', 'Malam Apresiasi Mahasiswa FILKOM 2026 di Gymnasium sangat cocok untuk networking dengan mahasiswa berprestasi, alumni, dan dosen.', ['networking', 'koneksi']);
addFaq('Rekomendasi Event', 'Apakah ada event untuk peminat Web Development?', 'Meskipun tidak ada judul khusus web dev, Pelatihan UI/UX Figma sangat penting bagi web developer dalam merancang tampilan sebelum ngoding.', ['web dev']);
addFaq('Rekomendasi Event', 'Saya ingin mengasah portofolio desain saya, ikut apa ya?', 'Ikuti Pelatihan Desain UI/UX dengan Figma, karena hasilnya berupa prototype aplikasi nyata yang bisa langsung dijadikan studi kasus portofolio.', ['portofolio']);
addFaq('Rekomendasi Event', 'Saya ingin belajar Python lebih dalam, ikut yang mana?', 'Daftarlah pada Workshop Machine Learning dengan Python pada 25 November 2026.', ['belajar python']);
addFaq('Rekomendasi Event', 'Event apa yang cocok untuk menambah poin sertifikat keaktifan?', 'Semua event yang tersedia (Workshop ML, Pelatihan UI/UX, Malam Apresiasi, dan FILKOM Day) menerbitkan e-sertifikat resmi.', ['poin keaktifan', 'sertifikat']);
addFaq('Rekomendasi Event', 'Bisa rekomendasikan event di bulan November saja?', 'Di bulan November terdapat FILKOM Day (20 Nov 2026) dan Workshop Machine Learning dengan Python (25 Nov 2026).', ['rekomendasi november']);
addFaq('Rekomendasi Event', 'Bisa rekomendasikan event di bulan Desember saja?', 'Di bulan Desember terdapat Pelatihan Desain UI/UX dengan Figma (10 Des 2026) dan Malam Apresiasi Mahasiswa (18 Des 2026).', ['rekomendasi desember']);
addFaq('Rekomendasi Event', 'Saya mahasiswa tingkat akhir, event mana yang relevan?', 'Workshop Machine Learning sangat relevan untuk ide skripsi/tugas akhir bidang data dan kecerdasan buatan.', ['tingkat akhir', 'skripsi']);
addFaq('Rekomendasi Event', 'Saya suka kegiatan outdoor dan dinamika kelompok, event apa?', 'FILKOM Day adalah agenda paling tepat karena mencakup rangkaian aktivitas kebersamaan antar kelompok mahasiswa.', ['outdoor', 'dinamika kelompok']);

// 13. Bantuan Umum, Kehadiran, & Sertifikat (15 items)
addFaq('Bantuan Umum & Sertifikat', 'Bagaimana cara kerja absensi di lokasi event?', 'Panitia akan menggunakan scanner barcode pada sistem untuk memindai kode QR yang ada pada tiket Anda di menu "Riwayat Pendaftaran".', ['cara absensi', 'absen qr']);
addFaq('Bantuan Umum & Sertifikat', 'Kapan sertifikat otomatis diterbitkan?', 'Sertifikat otomatis diterbitkan segera setelah status absensi Anda dicatat sebagai Hadir atau Terlambat oleh panitia.', ['kapan sertifikat terbit']);
addFaq('Bantuan Umum & Sertifikat', 'Apakah sertifikat memiliki nomor seri resmi?', 'Ya, setiap sertifikat memiliki nomor seri resmi berformat unik FILKOM (misal: FILKOM-2026-XXXXXXXX).', ['nomor sertifikat', 'validasi sertifikat']);
addFaq('Bantuan Umum & Sertifikat', 'Bagaimana format file sertifikat yang diunduh?', 'Sertifikat diunduh dalam format PDF siap cetak dengan ukuran standar A4 Landscape.', ['format sertifikat', 'pdf sertifikat']);
addFaq('Bantuan Umum & Sertifikat', 'Apakah sertifikat bisa diverifikasi keasliannya?', 'Ya, nomor sertifikat terdaftar pada database sistem dan mencantumkan tanggal terbit resmi.', ['keaslian sertifikat']);
addFaq('Bantuan Umum & Sertifikat', 'Jika saya mendaftar tapi tidak hadir, apakah dapat sertifikat?', 'Tidak. Sertifikat HANYA diterbitkan untuk peserta yang hadir dan terdata pada absensi kegiatan.', ['tidak hadir sertifikat']);
addFaq('Bantuan Umum & Sertifikat', 'Bagaimana jika nama saya di sertifikat salah eja?', 'Sertifikat mencetak nama sesuai nama pada akun mahasiswa Anda. Pastikan nama profil Anda sudah benar sebelum sertifikat dicetak.', ['salah nama di sertifikat']);
addFaq('Bantuan Umum & Sertifikat', 'Apakah sertifikat dikenakan biaya tambahan?', 'Tidak, penerbitan e-sertifikat tidak dipungut biaya apapun.', ['biaya sertifikat']);
addFaq('Bantuan Umum & Sertifikat', 'Apakah sertifikat bisa diunduh kapan saja?', 'Ya, selama akun mahasiswa Anda aktif, sertifikat pada menu Riwayat Pendaftaran dapat diunduh kapan saja.', ['unduh kapan saja']);
addFaq('Bantuan Umum & Sertifikat', 'Berapa resolusi sertifikat yang diterbitkan?', 'Sertifikat diproses dengan kualitas vektor PDF tajam standar dokumen akademik Universitas Klabat.', ['kualitas sertifikat']);
addFaq('Bantuan Umum & Sertifikat', 'Apakah sertifikat mencantumkan nama dekan atau fakultas?', 'Ya, sertifikat resmi diterbitkan oleh Fakultas Ilmu Komputer Universitas Klabat.', ['ttd dekan', 'instansi sertifikat']);
addFaq('Bantuan Umum & Sertifikat', 'Bagaimana jika email sertifikat tidak masuk ke inbox?', 'Periksa folder Spam/Promotions pada email Anda, atau unduh langsung file PDF dari menu "Riwayat Pendaftaran".', ['email sertifikat tidak masuk']);
addFaq('Bantuan Umum & Sertifikat', 'Apakah sertifikat bisa dicetak sendiri?', 'Tentu saja, file PDF dapat dicetak menggunakan kertas sertifikat (misal: Concorde atau Linen) ukuran A4.', ['print sertifikat']);
addFaq('Bantuan Umum & Sertifikat', 'Apakah absensi bisa dititip ke teman?', 'Tidak bisa. Absensi dilakukan dengan memindai barcode masing-masing di lokasi kegiatan.', ['titip absen']);
addFaq('Bantuan Umum & Sertifikat', 'Jika ada kendala saat scan tiket, siapa yang dihubungi?', 'Silakan datangi meja panitia pelaksana/BEM FILKOM di lokasi kegiatan untuk verifikasi manual.', ['kendala absensi']);

// 14. Variasi Pertanyaan Sehari-hari, Bahasa Gaul, & Informal (15 items)
addFaq('Variasi Pertanyaan Sehari-hari', 'Halo min!', 'Halo! Senang bisa menyapa Anda. Ada yang bisa saya bantu seputar event, jadwal, pendaftaran, atau pengumuman FILKOM hari ini?', ['halo', 'hai', 'pagi', 'siang', 'sore', 'malam']);
addFaq('Variasi Pertanyaan Sehari-hari', 'P', 'Halo! Ada yang bisa saya bantu mengenai kegiatan dan event di FILKOM UNKLAB? Silakan tanyakan jadwal, lokasi, kuota, atau alur pendaftaran ya!', ['p', 'ping', 'tes']);
addFaq('Variasi Pertanyaan Sehari-hari', 'Event apa aja nih yang buka pendaftaran?', 'Saat ini ada 4 event yang buka:\n1. FILKOM Day (20 Nov 2026)\n2. Workshop Machine Learning dengan Python (25 Nov 2026)\n3. Pelatihan Desain UI/UX dengan Figma (10 Des 2026)\n4. Malam Apresiasi Mahasiswa FILKOM (18 Des 2026).', ['event apa aja nih', 'kegiatan buka', 'lagi ada apa']);
addFaq('Variasi Pertanyaan Sehari-hari', 'Brp bayar filkom day?', 'Biaya pendaftaran FILKOM Day adalah Rp 225.000, sudah dapat kaos resmi dan konsumsi makanan.', ['brp bayar', 'biaya brp', 'harganya brp']);
addFaq('Variasi Pertanyaan Sehari-hari', 'Ml dmn lokasinya?', 'Workshop Machine Learning diadakan di Lab Komputer FILKOM Lantai 2 pada 25 November 2026 pukul 13:30 WITA.', ['ml dmn', 'lokasi ml dmn']);
addFaq('Variasi Pertanyaan Sehari-hari', 'Figma bayar ga sih?', 'Pelatihan Desain UI/UX dengan Figma 100% Gratis! Namun kuota sisa 1 kursi lagi, jadi buruan daftar ya.', ['figma bayar ga', 'gratis ga']);
addFaq('Variasi Pertanyaan Sehari-hari', 'Bisa liatin tiket gue ga?', 'Sebagai AI Assistant, saya tidak bisa mengakses data tiket pribadi Anda demi privasi. Silakan buka menu "Riwayat Pendaftaran" untuk melihat tiket barcode Anda ya!', ['liatin tiket', 'liat tiket gue', 'cek tiket']);
addFaq('Variasi Pertanyaan Sehari-hari', 'Kalo telat masih dpt sertif ga ya?', 'Masih dapat! Panitia bisa menandai status absensi Anda sebagai "Terlambat", dan sertifikat tetap akan diterbitkan setelah absensi tercatat.', ['kalo telat', 'telat absen']);
addFaq('Variasi Pertanyaan Sehari-hari', 'Gimana cara daftarnya brok?', 'Gampang banget:\n1. Buka menu "Daftar Event"\n2. Pilih event yang Anda mau\n3. Klik "Daftar Event"\n4. Cek tiket barcode Anda di menu "Riwayat Pendaftaran".', ['gimana cara daftar', 'cara regis']);
addFaq('Variasi Pertanyaan Sehari-hari', 'Kuota figma masih ada gk?', 'Kuota Figma tinggal 1 kursi lagi (39 terdaftar dari total 40). Buruan daftar sebelum kehabisan!', ['kuota figma masih ada']);
addFaq('Variasi Pertanyaan Sehari-hari', 'Filkom day wajib g?', 'Iya, FILKOM Day wajib diikuti oleh seluruh mahasiswa aktif Fakultas Ilmu Komputer UNKLAB.', ['filkom day wajib g', 'apakah wajib']);
addFaq('Variasi Pertanyaan Sehari-hari', 'Makasih infonya min!', 'Sama-sama! Sukses selalu untuk perkuliahan dan kegiatannya di FILKOM UNKLAB. Jangan ragu bertanya lagi jika butuh info lain ya!', ['makasih', 'terima kasih', 'thanks', 'tq']);
addFaq('Variasi Pertanyaan Sehari-hari', 'Malam apresiasi itu ngapain aja?', 'Malam Apresiasi adalah acara penghargaan untuk mahasiswa berprestasi, ramah tamah, makan malam bersama, dan ada penampilan seni musik dari mahasiswa.', ['ngapain aja malam apresiasi', 'ngapain']);
addFaq('Variasi Pertanyaan Sehari-hari', 'Ada lomba koding ga?', 'Saat ini belum ada pengumuman lomba koding resmi yang terdaftar di sistem. Pantau terus menu Pengumuman Fakultas ya!', ['lomba koding', 'lomba']);
addFaq('Variasi Pertanyaan Sehari-hari', 'Siapa pemateri workshop ml?', 'Untuk nama pemateri/narasumber spesifik Workshop Machine Learning belum dicantumkan pada sistem pengumuman resmi. Silakan nantikan rilis panitia BEM.', ['siapa pemateri', 'siapa narasumber', 'speaker']);

console.log(`Successfully compiled EXACTLY ${faqs.length} FAQs!`);

const fileContent = `/**
 * Knowledge Base Resmi FILKOM Event Management - Universitas Klabat
 * Berisi data resmi 4 event utama serta 230 Pertanyaan dan Jawaban (FAQ)
 * yang komprehensif untuk mendasari jawaban Gemini AI Event Assistant.
 */

export const OFFICIAL_EVENTS = ${JSON.stringify(OFFICIAL_EVENTS, null, 2)};

export const EVENT_KNOWLEDGE_BASE = ${JSON.stringify(faqs, null, 2)};

/**
 * Mencari jawaban paling relevan dari 230 Knowledge Base FAQ berdasarkan query pengguna
 */
export function searchKnowledgeBase(query) {
  if (!query || typeof query !== 'string') return null;
  const clean = query.trim().toLowerCase();
  const words = clean.split(/\\s+/).filter((w) => w.length > 1);

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
`;

const outputPath = path.resolve(process.cwd(), 'src/data/eventKnowledgeBase.js');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, fileContent, 'utf8');
console.log('Saved to:', outputPath);
