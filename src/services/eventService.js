import { jsonServerApi } from './api';

// Data fallback default jika JSON Server belum dijalankan
export const DEFAULT_EVENTS = [
  {
    id: '1',
    title: 'FILKOM TechFest 2026',
    category: 'Technology & Competition',
    date: '2026-11-20',
    displayDate: '20 November 2026',
    time: '09:00 WITA',
    location: 'Auditorium Pioneer Chapel UNKLAB',
    organizer: 'HMP Informatika',
    quota: 200,
    registeredCount: 145,
    status: 'open',
    statusLabel: 'Pendaftaran Dibuka',
    isUpcoming: true,
    isRecent: true,
    description:
      'Festival teknologi tahunan Fakultas Ilmu Komputer Universitas Klabat yang menghadirkan kompetisi coding, UI/UX, dan seminar Artificial Intelligence terapan.',
    tags: ['Coding', 'Seminar', 'AI'],
  },
  {
    id: '2',
    title: 'Workshop Machine Learning with Python',
    category: 'Workshop',
    date: '2026-11-25',
    displayDate: '25 November 2026',
    time: '13:30 WITA',
    location: 'Lab Komputer FILKOM Lt. 2',
    organizer: 'FILKOM AI Student Club',
    quota: 50,
    registeredCount: 42,
    status: 'open',
    statusLabel: 'Sisa Kuota Terbatas',
    isUpcoming: true,
    isRecent: false,
    description:
      'Pelatihan intensif pengembangan model klasifikasi dan computer vision menggunakan pustaka scikit-learn dan TensorFlow untuk mahasiswa FILKOM.',
    tags: ['Python', 'Machine Learning', 'Lab'],
  },
  {
    id: '3',
    title: 'Seminar Cybersecurity & Ethical Hacking',
    category: 'Seminar Nasional',
    date: '2026-11-10',
    displayDate: '10 November 2026',
    time: '10:00 WITA',
    location: 'GK2 Lt. 4 Hall Room',
    organizer: 'HMP Sistem Informasi',
    quota: 150,
    registeredCount: 150,
    status: 'closed',
    statusLabel: 'Kuota Penuh',
    isUpcoming: false,
    isRecent: true,
    description:
      'Memahami arsitektur pertahanan siber modern, analisis vulnerability aplikasi web, dan etika profesional di industri cybersecurity.',
    tags: ['Security', 'Network', 'Web'],
  },
  {
    id: '4',
    title: 'UI/UX Design Bootcamp: From Figma to Code',
    category: 'Bootcamp',
    date: '2026-12-02',
    displayDate: '02 Desember 2026',
    time: '14:00 WITA',
    location: 'Ruang Seminar FILKOM Lt. 1',
    organizer: 'HMP Teknologi Informasi',
    quota: 60,
    registeredCount: 28,
    status: 'open',
    statusLabel: 'Pendaftaran Dibuka',
    isUpcoming: true,
    isRecent: false,
    description:
      'Pelajari dasar human-centered design, pembuatan prototype interaktif di Figma, dan konversinya ke komponen React & Tailwind CSS.',
    tags: ['UI/UX', 'Figma', 'Frontend'],
  },
];

export const eventService = {
  /**
   * Mengambil semua daftar event
   */
  async getAllEvents() {
    try {
      const response = await jsonServerApi.get('/events');
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
      return DEFAULT_EVENTS;
    } catch {
      // Jika JSON server offline, kembalikan data mock fallback
      return DEFAULT_EVENTS;
    }
  },

  /**
   * Mengambil event berdasarkan ID
   */
  async getEventById(id) {
    try {
      const response = await jsonServerApi.get(`/events/${id}`);
      return response.data;
    } catch {
      const found = DEFAULT_EVENTS.find((e) => String(e.id) === String(id));
      return found || null;
    }
  },

  /**
   * Menambahkan event baru
   */
  async createEvent(eventData) {
    try {
      const response = await jsonServerApi.post('/events', eventData);
      return response.data;
    } catch {
      return {
        ...eventData,
        id: String(Date.now()),
      };
    }
  },
};

export default eventService;
