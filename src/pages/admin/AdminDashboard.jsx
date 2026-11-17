import { useState } from 'react';
import {
  CalendarDays,
  Bell,
  Users,
  CheckCircle,
  Plus,
  Search,
  Eye,
  FileSpreadsheet,
  Sparkles,
} from 'lucide-react';
import Card, { CardHeader } from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import { aiService } from '../../services/aiService';

export default function AdminDashboard() {
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [successAlert, setSuccessAlert] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Form State untuk Tambah Event
  const [eventTitle, setEventTitle] = useState('');
  const [eventCategory, setEventCategory] = useState('Workshop');
  const [eventOrganizer, setEventOrganizer] = useState('Dekanat FILKOM');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('09:00 WITA');
  const [eventLocation, setEventLocation] = useState('');
  const [eventQuota, setEventQuota] = useState('100');
  const [eventDescription, setEventDescription] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const stats = [
    {
      title: 'Total Event Aktif',
      value: '12',
      change: '+3 bulan ini',
      icon: CalendarDays,
      iconColor: 'bg-blue-50 text-[#2563EB]',
    },
    {
      title: 'Total Pendaftar',
      value: '428',
      change: '85% tingkat kehadiran',
      icon: Users,
      iconColor: 'bg-emerald-50 text-emerald-700',
    },
    {
      title: 'Pengumuman Diterbitkan',
      value: '18',
      change: '2 minggu ini',
      icon: Bell,
      iconColor: 'bg-purple-50 text-purple-700',
    },
    {
      title: 'Ormawa & Panitia',
      value: '6',
      change: 'HMP & BEM FILKOM',
      icon: CheckCircle,
      iconColor: 'bg-amber-50 text-amber-700',
    },
  ];

  const [adminEvents, setAdminEvents] = useState([
    {
      id: 'EVT-01',
      title: 'FILKOM TechFest 2026',
      category: 'Teknologi & Kompetisi',
      organizer: 'HMP Informatika',
      date: '20 Nov 2026',
      quota: '145 / 200',
      status: 'open',
      statusText: 'Aktif / Dibuka',
    },
    {
      id: 'EVT-02',
      title: 'Workshop Machine Learning with Python',
      category: 'Workshop',
      organizer: 'FILKOM AI Club',
      date: '25 Nov 2026',
      quota: '42 / 50',
      status: 'open',
      statusText: 'Aktif / Dibuka',
    },
    {
      id: 'EVT-03',
      title: 'Seminar Cybersecurity & Ethical Hacking',
      category: 'Seminar Nasional',
      organizer: 'HMP Sistem Informasi',
      date: '10 Nov 2026',
      quota: '150 / 150',
      status: 'closed',
      statusText: 'Selesai / Ditutup',
    },
  ]);

  const handleGenerateAI = async () => {
    if (!eventTitle.trim()) {
      alert('Silakan isi Nama / Judul Event terlebih dahulu agar AI dapat menyusun deskripsi yang sesuai.');
      return;
    }

    try {
      setIsGeneratingAI(true);
      const generated = await aiService.generateEventDescription({
        title: eventTitle,
        category: eventCategory,
        organizer: eventOrganizer,
      });
      setEventDescription(generated);
    } catch {
      alert('Gagal menyusun deskripsi dengan AI.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleCreateEvent = (e) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    const newEvent = {
      id: `EVT-0${adminEvents.length + 1}`,
      title: eventTitle,
      category: eventCategory,
      organizer: eventOrganizer,
      date: eventDate || '15 Des 2026',
      quota: `0 / ${eventQuota || '100'}`,
      status: 'open',
      statusText: 'Aktif / Dibuka',
    };

    setAdminEvents([newEvent, ...adminEvents]);
    setIsEventModalOpen(false);
    setEventTitle('');
    setEventDescription('');
    setSuccessAlert('Event baru berhasil disetujui dan diterbitkan ke portal mahasiswa!');
    setTimeout(() => setSuccessAlert(''), 4000);
  };

  return (
    <div className="space-y-6 w-full text-[#172554]">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-2xl border border-[#BFDBFE] shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#172554] tracking-tight">
            Panel Administrator Fakultas
          </h1>
          <p className="text-xs sm:text-sm text-[#1E40AF] font-medium mt-1">
            Pantau dan kelola seluruh publikasi kegiatan serta pengumuman resmi FILKOM UNKLAB.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setIsEventModalOpen(true)}
          >
            Buat Event Baru
          </Button>
        </div>
      </div>

      {successAlert && (
        <Alert
          type="success"
          message={successAlert}
          onClose={() => setSuccessAlert('')}
        />
      )}

      {/* 4 Cards Ringkasan Metrik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="p-5 bg-white border border-[#BFDBFE]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1E3A8A] uppercase tracking-wider">
                  {item.title}
                </span>
                <div className={`p-2.5 rounded-xl ${item.iconColor} shadow-2xs`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-extrabold text-[#172554]">
                {item.value}
              </div>
              <div className="mt-1 text-xs text-[#1D4ED8] font-bold">
                {item.change}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Tabel Manajemen Event Terpadu */}
      <Card className="bg-white border border-[#BFDBFE]">
        <CardHeader className="flex-col sm:flex-row items-start sm:items-center gap-3 border-b border-[#BFDBFE]">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#172554]">
              Daftar Seluruh Kegiatan Fakultas
            </h2>
            <p className="text-xs sm:text-sm text-[#1E40AF] font-medium">
              Monitoring pendaftaran peserta dan status operasional event secara real-time.
            </p>
          </div>

          <div className="w-full sm:w-auto flex items-center gap-2.5">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#1E3A8A]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari event..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#BFDBFE] text-[#172554] placeholder-[#475569] bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
            <Button variant="secondary" size="sm" icon={FileSpreadsheet}>
              Export
            </Button>
          </div>
        </CardHeader>

        {/* Tabel Data Kontras Tinggi */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-[#172554]">
            <thead className="bg-[#EFF6FF] text-[11px] uppercase tracking-wider text-[#1E3A8A] border-b border-[#BFDBFE] font-extrabold">
              <tr>
                <th className="px-5 py-3.5">Nama Kegiatan</th>
                <th className="px-5 py-3.5">Penyelenggara</th>
                <th className="px-5 py-3.5">Jadwal</th>
                <th className="px-5 py-3.5">Kapasitas</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#BFDBFE]">
              {adminEvents
                .filter((r) =>
                  r.title.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((row) => (
                  <tr key={row.id} className="hover:bg-[#EFF6FF]/50 transition-colors">
                    <td className="px-5 py-4 font-bold text-[#172554]">
                      <div>{row.title}</div>
                      <span className="text-xs text-[#1E40AF] font-medium">
                        ID: {row.id} &bull; {row.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-medium text-[#1E3A8A]">{row.organizer}</td>
                    <td className="px-5 py-4 font-medium text-[#172554]">{row.date}</td>
                    <td className="px-5 py-4 font-bold text-[#172554]">{row.quota}</td>
                    <td className="px-5 py-4">
                      <Badge
                        variant={row.status === 'open' ? 'green' : 'gray'}
                        size="sm"
                        dot
                      >
                        {row.statusText}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        className="p-2 rounded-xl text-[#2563EB] hover:text-white hover:bg-[#2563EB] transition-colors cursor-pointer"
                        title="Lihat Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Tambah Event Baru */}
      <Modal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        title="Formulir Publikasi Event Baru (Dekanat)"
        maxWidth="max-w-2xl"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEventModalOpen(false)}
            >
              Batal
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateEvent}>
              Simpan & Terbitkan Event
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateEvent} className="space-y-4 text-left">
          <Input
            label="Nama / Judul Event"
            placeholder="Contoh: Seminar Nasional Artificial Intelligence 2026"
            required
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Kategori Kegiatan"
              placeholder="Workshop / Seminar / Lomba"
              required
              value={eventCategory}
              onChange={(e) => setEventCategory(e.target.value)}
            />
            <Input
              label="Organisasi Penyelenggara"
              placeholder="Dekanat FILKOM / HMP TI"
              required
              value={eventOrganizer}
              onChange={(e) => setEventOrganizer(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Tanggal Pelaksanaan"
              type="date"
              required
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
            <Input
              label="Waktu (WITA)"
              placeholder="09:00 WITA"
              required
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Lokasi / Ruangan"
              placeholder="Contoh: Auditorium Pioneer Chapel"
              required
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value)}
            />
            <Input
              label="Kuota Peserta"
              type="number"
              placeholder="200"
              required
              value={eventQuota}
              onChange={(e) => setEventQuota(e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#172554]">
                Deskripsi Lengkap Kegiatan
              </label>
              <Button
                variant="secondary"
                size="sm"
                icon={Sparkles}
                isLoading={isGeneratingAI}
                onClick={handleGenerateAI}
                className="text-xs"
              >
                Susun dengan Gemini AI
              </Button>
            </div>
            <textarea
              rows={4}
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              placeholder="Tulis deskripsi atau klik tombol 'Susun dengan Gemini AI' di atas untuk menyusun secara otomatis..."
              className="w-full p-3 text-xs sm:text-sm rounded-xl border border-[#BFDBFE] text-[#172554] placeholder-[#475569] focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] bg-white font-medium"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
