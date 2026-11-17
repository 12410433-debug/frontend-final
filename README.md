# FILKOM Event Management

## Menjalankan aplikasi dan AI Event Assistant

1. Salin .env.example menjadi .env, lalu isi GEMINI_API_KEY dengan API key dari Google AI Studio. Jangan gunakan awalan VITE_; key hanya dibaca backend. GEMINI_MODEL dapat diubah sesuai model Gemini yang tersedia untuk akun Anda.

   PowerShell: Copy-Item .env.example .env

2. Jalankan satu perintah dari folder proyek:

   npm run dev

Perintah tersebut memastikan JSON Server aktif di port 3001, backend Express aktif di port 5000, lalu menjalankan Vite. Jika layanan sudah berjalan, launcher akan memakai proses yang ada. Backend tetap dapat aktif tanpa key untuk memeriksa kesehatan server, tetapi permintaan Gemini memerlukan GEMINI_API_KEY di .env.

Buka alamat Vite yang ditampilkan. Mahasiswa dapat membuka daftar event tanpa akun; data nama, email, NIM, dan program studi diisi saat mendaftar. Admin dan BEM masuk melalui portal masing-masing. AI Assistant tersedia dari sidebar mahasiswa.

Backend menyediakan GET /api/health, POST /api/ai/recommendations, dan POST /api/ai/chat. Rekomendasi dan chat membaca ulang event dan pengumuman Published dari JSON Server sebelum memanggil Gemini. Data Draft tidak dikirim ke model, dan jawaban faktual ditautkan ke record publik yang tersedia.

Riwayat percakapan disimpan di state halaman selama sesi. Tombol Hapus mengosongkan percakapan tersebut.
## Email notifikasi Gmail SMTP

Isi SMTP_USER dengan alamat Gmail pengirim dan SMTP_APP_PASSWORD dengan Google App Password. Jangan gunakan password utama Gmail. Aktifkan Verifikasi 2 Langkah pada akun Google untuk membuat App Password, lalu simpan kredensial hanya di file .env. SMTP_HOST, SMTP_PORT, dan SMTP_SECURE memakai default Gmail pada file contoh.

Pengumuman umum yang dipublikasikan dikirim kepada mahasiswa aktif. Pengumuman yang terkait event dikirim kepada mahasiswa yang terdaftar pada event tersebut. Konfirmasi pendaftaran juga dikirim ke email mahasiswa. Status SMTP dapat dicek dari halaman BEM > Pengumuman dengan tombol Tes SMTP. Email gagal dapat dikirim ulang dari daftar pengumuman Published. Riwayat pengiriman dicatat di collection /notifications JSON Server.

Gunakan satu kata sandi aplikasi Gmail untuk backend lokal akademik ini; jangan commit .env dan jangan memasukkan kredensial SMTP ke variabel VITE_.

## Role dan pendaftaran mahasiswa

Portal memiliki tiga role: `student`, `bem` (BEM Fakultas), dan `admin` (Admin FILKOM). Mahasiswa tidak perlu login atau membuat akun. Form registrasi event meminta nama, email, NIM, dan program studi; profilnya disimpan di `/users` tanpa kata sandi agar tetap dapat terhubung ke QR, absensi, dan sertifikat. Riwayat tersimpan pada browser yang digunakan untuk mendaftar.

Admin memiliki semua fitur BEM ditambah menu Kelola Pengguna. Daftar dan pembuatan akun Admin/BEM dipisahkan dari profil mahasiswa yang dibuat melalui pendaftaran event. Akun lama dengan role `committee` dinormalisasi sebagai BEM.

Pada menu gabungan **Template & Sertifikat**, unggah gambar PNG/JPG, pilih template default atau khusus event, lalu atur posisi, ukuran, dan warna nama peserta. Gambar dikompres sebelum disimpan di `/certificateTemplates` JSON Server. Setelah template tersimpan, sertifikat langsung dibuat untuk peserta yang sudah hadir; peserta yang hadir kemudian juga mendapat sertifikat otomatis saat absensinya dicatat. PDF hanya menambahkan nama mahasiswa dari akun. JSON Server tetap penyimpanan demonstrasi; penyimpanan gambar dan password di sana belum sesuai untuk produksi.

Menu **Peserta & Rekap Absensi** menyediakan unduhan `.xlsx` untuk event terpilih, berisi nama, NIM, waktu pendaftaran, waktu hadir, dan status kehadiran.
