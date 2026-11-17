import { api } from './api';

export const aiService = {
  /**
   * Menghasilkan draf deskripsi event otomatis menggunakan Gemini AI
   * @param {Object} params
   * @param {string} params.title - Judul event
   * @param {string} params.category - Kategori event
   * @param {string} params.organizer - Penyelenggara event
   */
  async generateEventDescription({ title, category, organizer }) {
    const prompt = `Anda adalah asisten AI resmi Fakultas Ilmu Komputer (FILKOM) Universitas Klabat.
Buatkan deskripsi kegiatan yang profesional, menarik, dan informatif untuk event berikut:
- Judul Kegiatan: ${title}
- Kategori: ${category || 'Workshop/Seminar'}
- Penyelenggara: ${organizer || 'Organisasi Mahasiswa FILKOM'}
- Bahasa: Bahasa Indonesia yang baku dan elegan.

Format deskripsi:
1. Paragraf pembuka yang menjelaskan tujuan kegiatan.
2. Poin-poin topik utama atau manfaat bagi mahasiswa FILKOM.
3. Ajakan singkat untuk segera mendaftar sebelum kuota habis.
Panjang: Maksimal 3 paragraf singkat. Jangan sertakan markdown heading (#) atau placeholder kurung siku.`;

    try {
      const response = await api.post('/gemini/generate', { prompt });
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      }
      throw new Error('Respon AI kosong');
    } catch {
      // Fallback deskripsi cerdas jika server Express atau Gemini belum aktif
      return `Kegiatan "${title}" diselenggarakan oleh ${organizer || 'FILKOM UNKLAB'} sebagai wadah pengembangan wawasan dan kompetensi mahasiswa di bidang ${category || 'teknologi informasi'}.\n\nMelalui sesi ini, peserta akan mendapatkan pemahaman mendalam mengenai implementasi teknologi terkini, studi kasus industri, dan kesempatan berdiskusi langsung dengan praktisi.\n\nDaftarkan diri Anda sekarang melalui portal FILKOM Event Management untuk mengamankan kursi dan mendapatkan tiket elektronik resmi!`;
    }
  },

  /**
   * Menghasilkan draf pengumuman resmi fakultas menggunakan Gemini AI
   * @param {Object} params
   * @param {string} params.title - Judul pengumuman
   * @param {string} params.targetAudience - Sasaran pengumuman (mahasiswa, dosen, ormawa)
   */
  async generateAnnouncement({ title, targetAudience = 'seluruh mahasiswa FILKOM' }) {
    const prompt = `Anda adalah staf humas Dekanat Fakultas Ilmu Komputer Universitas Klabat.
Tuliskan draf pengumuman resmi akademik berdasarkan judul berikut:
- Judul Pengumuman: ${title}
- Target Pembaca: ${targetAudience}
- Bahasa: Bahasa Indonesia resmi akademik.

Format:
- Salam pembuka formal.
- Inti informasi penting dengan bahasa lugas dan jelas.
- Batas waktu / instruksi tindak lanjut bila ada.
- Penutup formal dari Dekanat FILKOM UNKLAB.`;

    try {
      const response = await api.post('/gemini/generate', { prompt });
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      }
      throw new Error('Respon AI kosong');
    } catch {
      return `Diberitahukan kepada ${targetAudience} sehubungan dengan agenda "${title}".\n\nDiharapkan seluruh pihak terkait dapat memperhatikan jadwal, ketentuan, dan panduan yang berlaku. Untuk informasi lebih lanjut, silakan menghubungi sekretariat Dekanat FILKOM UNKLAB pada jam kerja.\n\nDemikian pengumuman ini disampaikan untuk menjadi perhatian bersama. Terima kasih.`;
    }
  },
};

export default aiService;
