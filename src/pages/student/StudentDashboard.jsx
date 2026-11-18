import { useLocation } from 'react-router-dom';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  CalendarDays,
  MapPin,
  Sparkles,
  Search,
  Bell,
  Pin,
  QrCode,
  Receipt,
  Download,
  User,
  Save,
  Award,
} from 'lucide-react';
import QRCode from 'qrcode';
import Card, { CardBody, CardFooter } from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import eventApi from '../../services/eventApi';
import registrationService from '../../services/registrationService';
import announcementApi from '../../services/announcementApi';
import certificateService from '../../services/certificateService';
import StudentCertificates from '../../components/StudentCertificates';
import { downloadPaymentReceiptPdf } from '../../utils/paymentReceiptPdf';
import { downloadCertificatePdf } from '../../utils/certificatePdf';


const ANNOUNCEMENT_CATEGORIES = ['Akademik', 'Event', 'Organisasi', 'Informasi Fakultas', 'Lainnya'];
const EMPTY_REGISTRATION_FORM = { name: '', email: '', nim: '', major: '', phone: '', mealChoice: '', shirtSize: '', paymentMethod: 'cash', paymentProof: '', paymentProofName: '' };
function formatRegistrationFee(value) {
  const amount = Number(value) || 0;
  return amount > 0 ? `Rp ${new Intl.NumberFormat('id-ID').format(amount)}` : 'Gratis';
}
function formatAnnouncementDate(value) {
  if (!value) return 'Tanggal publikasi belum tersedia';
  return new Date(value).toLocaleString('id-ID', {
    dateStyle: 'long', timeZone: 'Asia/Makassar',
  });
}

function formatTimeAMPM(timeStr) {
  if (!timeStr) return '';
  const trimmed = String(timeStr).trim();
  if (/am|pm/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  const match = trimmed.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return trimmed;
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  if (Number.isNaN(hours)) return trimmed;
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const formattedHour = String(hours).padStart(2, '0');
  return `${formattedHour}:${minutes} ${period}`;
}

function formatEventTimeRange(startTime, endTime) {
  if (!startTime && !endTime) return '';
  const start = formatTimeAMPM(startTime);
  const end = formatTimeAMPM(endTime);
  if (start && end) return `${start} - ${end} WITA`;
  if (start) return `${start} WITA`;
  return `${end} WITA`;
}

export default function StudentDashboard() {
  const { user, studentProfile: savedStudentProfile, setStudentProfile, updateStudentProfile } = useAuth();
  const student = user?.role === 'student' ? user : savedStudentProfile;
  const location = useLocation();
  const view = location.pathname.split('/')[2] || 'events';
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrationTarget, setRegistrationTarget] = useState(null);
  const [registrationFormOpen, setRegistrationFormOpen] = useState(false);
  const [registrationConfirmOpen, setRegistrationConfirmOpen] = useState(false);
  const [pendingRegistrationData, setPendingRegistrationData] = useState(null);
  const [registrationForm, setRegistrationForm] = useState(EMPTY_REGISTRATION_FORM);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [selectedQrRegistration, setSelectedQrRegistration] = useState(null);
  const [selectedReceiptRegistration, setSelectedReceiptRegistration] = useState(null);
  const [proofUploading, setProofUploading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrError, setQrError] = useState('');
  const [registrationMessage, setRegistrationMessage] = useState('');
  const [registrationError, setRegistrationError] = useState('');
  const [registeringEventId, setRegisteringEventId] = useState(null);
  const registerInFlight = useRef(new Set());
  const [registrations, setRegistrations] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState('');
  const [downloadingCertId, setDownloadingCertId] = useState(null);

  const handleDownloadCertificate = async (registration) => {
    if (!student?.id) return;
    setDownloadingCertId(registration.id);
    setRegistrationError('');
    setRegistrationMessage('');
    try {
      const cert = await certificateService.issueForStudent(student.id, registration.id);
      downloadCertificatePdf(cert);
      setRegistrationMessage(`Sertifikat "${registration.event?.title || 'Event'}" berhasil diunduh dan notifikasi email telah diproses.`);
    } catch (err) {
      setRegistrationError(err.response?.data?.message || err.message || 'Sertifikat belum dapat diunduh. Pastikan kehadiran Anda telah tervalidasi.');
    } finally {
      setDownloadingCertId(null);
    }
  };
  const [searchEvent, setSearchEvent] = useState('');
  const [announcementSearch, setAnnouncementSearch] = useState('');
  const [announcementCategoryFilter, setAnnouncementCategoryFilter] = useState('');
  const [publishedAnnouncements, setPublishedAnnouncements] = useState([]);
  const [announcementEvents, setAnnouncementEvents] = useState([]);
  const [announcementEventFilter, setAnnouncementEventFilter] = useState('');
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [announcementsError, setAnnouncementsError] = useState('');
  const [publishedEvents, setPublishedEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState('');

  // State untuk Akun / Profil Mahasiswa
  const [profileForm, setProfileForm] = useState(() => ({
    name: student?.name || '',
    nim: student?.nim || '',
    email: student?.email || '',
    phone: student?.phone || '',
    major: student?.major || 'Informatika',
  }));
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    if (!student) return undefined;
    let active = true;
    queueMicrotask(() => {
      if (active) {
        setProfileForm({
          name: student.name || '',
          nim: student.nim || '',
          email: student.email || '',
          phone: student.phone || '',
          major: student.major || 'Informatika',
        });
      }
    });
    return () => { active = false; };
  }, [student]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    if (!profileForm.name.trim() || !profileForm.nim.trim() || !profileForm.email.trim()) {
      setProfileError('Nama, NIM, dan Email wajib diisi.');
      return;
    }
    setProfileSaving(true);
    try {
      await updateStudentProfile(profileForm);
      setProfileSuccess('Data profil akun berhasil disimpan! Perubahan ini otomatis terhubung pada formulir event.');
    } catch (err) {
      setProfileError(err.message || 'Gagal menyimpan data akun mahasiswa.');
    } finally {
      setProfileSaving(false);
    }
  };

  useEffect(() => {
    if (view !== 'events') return undefined;
    let active = true;
    queueMicrotask(() => { if (active) setEventsLoading(true); });
    eventApi.listPublished()
      .then((data) => {
        if (active) setPublishedEvents(data);
      })
      .catch(() => {
        if (active) setEventsError('Katalog event tidak dapat dimuat. Pastikan JSON Server berjalan di http://localhost:3001.');
      })
      .finally(() => {
        if (active) setEventsLoading(false);
      });
    return () => { active = false; };
  }, [view]);

  useEffect(() => {
    if (!selectedQrRegistration?.qrCode) return undefined;
    let active = true;
    QRCode.toDataURL(selectedQrRegistration.qrCode, {
      width: 280,
      margin: 1,
      color: { dark: '#172554', light: '#ffffff' },
    })
      .then((dataUrl) => { if (active) setQrDataUrl(dataUrl); })
      .catch(() => { if (active) setQrError('QR Code tidak dapat dibuat. Gunakan kode pendaftaran yang tertera.'); });
    return () => { active = false; };
  }, [selectedQrRegistration?.qrCode]);

  useEffect(() => {
    if (view !== 'announcements') return undefined;
    let active = true;
    queueMicrotask(() => { if (active) setAnnouncementsLoading(true); });
    Promise.all([announcementApi.listPublished(), eventApi.list()])
      .then(([rows, eventRows]) => {
        if (!active) return;
        const eventById = new Map(eventRows.map((event) => [String(event.id), event]));
        setAnnouncementEvents(eventRows.filter((event) => event.status !== 'draft'));
        setPublishedAnnouncements(rows
          .filter((item) => {
            if (!item.eventId) return true;
            const relatedEvent = eventById.get(String(item.eventId));
            return relatedEvent && relatedEvent.status !== 'draft';
          })
          .map((item) => ({
            ...item,
            eventTitle: item.eventId ? eventById.get(String(item.eventId))?.title || 'Event FILKOM' : '',
          })));
      })
      .catch(() => {
        if (active) setAnnouncementsError('Pengumuman gagal dimuat. Pastikan JSON Server berjalan di http://localhost:3001.');
      })
      .finally(() => {
        if (active) setAnnouncementsLoading(false);
      });
    return () => { active = false; };
  }, [view]);

  useEffect(() => {
    if (!['events', 'registrations'].includes(view)) return undefined;
    let active = true;
    if (!student?.id) {
      queueMicrotask(() => {
        if (!active) return;
        setRegistrations([]);
        setHistoryLoading(false);
      });
      return () => { active = false; };
    }
    queueMicrotask(() => { if (active) setHistoryLoading(true); });
    registrationService.getForStudent(student.id)
      .then((data) => {
        if (active) setRegistrations(data);
      })
      .catch((error) => {
        if (active) setHistoryError(error.response?.data?.message || error.response?.data?.error || (error.response
          ? error.message
          : 'Riwayat pendaftaran gagal dimuat. Pastikan JSON Server berjalan di http://localhost:3001.'));
      })
      .finally(() => {
        if (active) setHistoryLoading(false);
      });
    return () => {
      active = false;
    };
  }, [student?.id, view]);

  const openRegistrationForm = (event) => {
    const profile = student || null;
    setRegistrationTarget(event);
    setRegistrationForm({
      name: profile?.name || '',
      email: profile?.email || '',
      nim: profile?.nim || '',
      major: profile?.major || '',
      phone: profile?.phone || '',
      mealChoice: '',
      shirtSize: '',
      paymentMethod: 'cash',
      paymentProof: '',
      paymentProofName: '',
    });
    setRegistrationError('');
    setRegistrationFormOpen(true);
    setSelectedEvent(null);
  };

  const handleRegisterEvent = async (formEvent) => {
    formEvent.preventDefault();
    const event = registrationTarget;
    if (!event) return;
    // Simpan data form ke state, lalu buka modal konfirmasi
    setPendingRegistrationData({
      form: { ...registrationForm },
      event,
    });
    setRegistrationFormOpen(false);
    setRegistrationConfirmOpen(true);
  };

  const handleConfirmRegistration = async () => {
    const { form, event } = pendingRegistrationData || {};
    if (!event) return;
    const eventId = String(event.id);
    if (registerInFlight.current.has(eventId)) return;
    registerInFlight.current.add(eventId);
    setRegisteringEventId(eventId);
    setRegistrationError('');
    setRegistrationMessage('');
    try {
      const result = await registrationService.register(form, event.id, {
        mealChoice: form.mealChoice,
        shirtSize: form.shirtSize,
        paymentMethod: form.paymentMethod,
        paymentProof: form.paymentProof,
        paymentProofName: form.paymentProofName,
      });
      setStudentProfile(result.student);
      setRegistrations((current) => [
        { ...result.registration, event: result.event },
        ...current,
      ]);
      setPublishedEvents((current) => current.map((item) => (
        String(item.id) === eventId ? { ...item, ...result.event } : item
      )));
      setSelectedEvent((current) => (
        current && String(current.id) === eventId ? { ...current, ...result.event } : current
      ));
      // Tidak perlu ada pesan konfirmasi lagi ketika sudah selesai loading
      setRegistrationMessage('');
      setRegistrationConfirmOpen(false);
      setRegistrationFormOpen(false);
      setRegistrationTarget(null);
      setPendingRegistrationData(null);
    } catch (error) {
      const serverError = error.response?.data?.message || error.response?.data?.error;
      const isNetworkFailure = error.isAxiosError && !error.response;
      setRegistrationError(serverError || (isNetworkFailure
        ? `JSON Server tidak dapat dijangkau melalui aplikasi. Pastikan jalankan npm run dev. (${error.code || error.message})`
        : error.message || 'Pendaftaran gagal. Silakan coba kembali.'));
    } finally {
      registerInFlight.current.delete(eventId);
      setRegisteringEventId(null);
    }
  };

  const downloadReceipt = (registration) => {
    try {
      downloadPaymentReceiptPdf(registration, student);
    } catch (error) {
      setRegistrationError(error.message || 'Kwitansi gagal dibuat.');
    }
  };

  const setRegistrationField = (field) => (event) => setRegistrationForm((current) => ({ ...current, [field]: event.target.value }));

  const handlePaymentProofUpload = (file) => {
    setRegistrationError('');
    setRegistrationForm((current) => ({ ...current, paymentProof: '', paymentProofName: '' }));
    if (!file) {
      setRegistrationForm((current) => ({ ...current, paymentProof: '', paymentProofName: '' }));
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type)) {
      setRegistrationError('Bukti transfer harus berupa gambar JPG, PNG, WEBP, atau PDF.');
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      setRegistrationError('Ukuran bukti transfer maksimal 1,5 MB.');
      return;
    }
    setProofUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setRegistrationForm((current) => ({ ...current, paymentProof: String(reader.result || ''), paymentProofName: file.name }));
      setProofUploading(false);
    };
    reader.onerror = () => {
      setRegistrationError('File bukti transfer gagal dibaca. Coba pilih file lain.');
      setProofUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const registrationsByEvent = useMemo(() => new Map(
    registrations.map((registration) => [String(registration.eventId), registration])
  ), [registrations]);

  const visibleAnnouncements = useMemo(() => publishedAnnouncements
    .filter((item) => item.status === 'published')
    .filter((item) => item.title.toLowerCase().includes(announcementSearch.trim().toLowerCase()))
    .filter((item) => !announcementCategoryFilter || item.category === announcementCategoryFilter)
    .filter((item) => !announcementEventFilter || (announcementEventFilter === 'general' ? !item.eventId : String(item.eventId || '') === announcementEventFilter))
    .sort((a, b) => Number(b.isPinned) - Number(a.isPinned)
      || String(b.publishedAt || '').localeCompare(String(a.publishedAt || ''))),
  [publishedAnnouncements, announcementSearch, announcementCategoryFilter, announcementEventFilter]);
  const pinnedAnnouncements = visibleAnnouncements.filter((item) => item.isPinned);
  const regularAnnouncements = visibleAnnouncements.filter((item) => !item.isPinned);

  const todayParts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Makassar', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const todayInWita = `${todayParts.find((part) => part.type === 'year').value}-${todayParts.find((part) => part.type === 'month').value}-${todayParts.find((part) => part.type === 'day').value}`;
  const filteredEvents = publishedEvents
    .filter((event) => event.status === 'published' && event.date >= todayInWita)
    .filter((event) => event.title.toLowerCase().includes(searchEvent.toLowerCase()))
    .map((event) => ({
      ...event,
      displayDate: new Date(`${event.date}T00:00:00`).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
      displayTime: formatEventTimeRange(event.startTime, event.endTime),
      organizer: `Panitia FILKOM (${event.organizerId})`,
      quotaLabel: `${event.registeredCount || 0} / ${event.quota}`,
    }));

  return (
    <div className="space-y-8 w-full text-[#172554]">
      {/* 1. Header Salam Mahasiswa */}
      <div className="bg-gradient-to-r from-[#1E3A8A] via-[#1D4ED8] to-[#2563EB] text-white p-6 sm:p-8 rounded-2xl shadow-sm relative overflow-hidden w-full">
        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-white mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Portal Resmi Mahasiswa FILKOM
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{view === 'overview' ? 'Selamat Datang, ' + (student?.name || 'Mahasiswa FILKOM') : view === 'events' ? 'Jelajahi Event' : view === 'registrations' ? 'Riwayat Pendaftaran' : view === 'announcements' ? 'Pengumuman FILKOM' : view === 'profile' ? 'Akun & Profil Mahasiswa' : 'Sertifikat Saya'}</h1>
          <p className="mt-2 text-xs sm:text-sm text-blue-100 font-medium leading-relaxed">
            NIM: <strong>{student?.nim || 'Diisi saat pendaftaran'}</strong> &bull; Program Studi <strong>{student?.major || 'Diisi saat pendaftaran'}</strong> &bull; Fakultas Ilmu Komputer, Universitas Klabat
          </p>
        </div>
      </div>

      {['events', 'registrations'].includes(view) && registrationMessage && (
        <Alert
          type="success"
          message={registrationMessage}
          onClose={() => setRegistrationMessage('')}
        />
      )}
      {['events', 'registrations'].includes(view) && registrationError && <Alert type="error" message={registrationError} onClose={() => setRegistrationError('')} />}
      {view === 'events' && eventsError && <Alert type="error" message={eventsError} onClose={() => setEventsError('')} />}

      {view === 'registrations' && !student?.id && <Card className="p-6 text-sm text-slate-600">Belum ada profil mahasiswa pada browser ini. Daftar event dan isi data diri untuk melihat riwayat pendaftaran.</Card>}

      {view === 'registrations' && student?.id && (

      <div id="my-tickets" className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div>
            <h2 className="text-xl font-extrabold text-[#172554] tracking-tight">
              Riwayat Pendaftaran
            </h2>
            <p className="text-xs sm:text-sm text-[#1E40AF] font-medium">
              Daftar event yang Anda ikuti, dimuat dari akun mahasiswa ini.
            </p>
          </div>
          <Badge variant="green" size="md">
            {registrations.filter((r) => r.event).length} Pendaftaran
          </Badge>
        </div>

        {historyError && <Alert type="error" message={historyError} onClose={() => setHistoryError('')} />}
        {historyLoading ? <Card className="p-6 text-sm text-blue-800">Memuat riwayat pendaftaran...</Card> : registrations.length === 0 ? (
          <Card className="p-6 text-sm text-slate-600">Belum ada riwayat pendaftaran untuk akun ini.</Card>
        ) : (
          <Card className="overflow-hidden border border-[#BFDBFE] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="bg-[#EFF6FF] text-xs uppercase tracking-wide text-[#1E3A8A]">
                  <tr>
                    <th className="px-5 py-3">Nama Event</th>
                    <th className="px-4 py-3">Tanggal Event</th>
                    <th className="px-4 py-3">Lokasi</th>
                    <th className="px-4 py-3">Tanggal Pendaftaran</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Pembayaran & Kwitansi</th>
                    <th className="px-4 py-3 text-right">QR Code / Sertifikat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100">
                  {registrations.filter((r) => r.event).map((registration) => {
                    const event = registration.event;
                    const registrationStatus = registration.status || 'pending';
                    const statusVariant = registrationStatus === 'confirmed' ? 'green' : registrationStatus === 'cancelled' ? 'red' : 'yellow';
                    const canDownloadCert = Boolean(
                      registration.isAttended ||
                      registration.certificate ||
                      (registration.attendance && ['hadir', 'terlambat'].includes(registration.attendance.status)) ||
                      event?.status === 'completed'
                    );
                    return <tr key={registration.id}>
                      <td className="px-5 py-4"><p className="font-bold">{event?.title || `Event ${registration.eventId}`}</p><div className="mt-1 space-y-0.5 text-xs text-slate-600"><p>Biaya: {formatRegistrationFee(registration.registrationFee)}</p>{registration.mealChoice && <p>Menu: {registration.mealChoice}</p>}{registration.shirtSize && <p>Ukuran baju: {registration.shirtSize}</p>}</div></td>
                      <td className="px-4 py-4">{event?.date ? new Date(`${event.date}T00:00:00`).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}{(event?.startTime || event?.endTime) && <div className="text-xs text-slate-500 font-medium mt-0.5">{formatEventTimeRange(event.startTime, event.endTime)}</div>}</td>
                      <td className="px-4 py-4">{event?.location || 'Lokasi tidak tersedia'}</td>
                      <td className="px-4 py-4">{registration.registrationDate ? new Date(registration.registrationDate).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Makassar' }) : '-'}</td>
                      <td className="px-4 py-4"><Badge variant={statusVariant} size="sm" dot>{registrationStatus === 'confirmed' ? 'Terkonfirmasi' : registrationStatus === 'cancelled' ? 'Dibatalkan' : 'Menunggu'}</Badge></td>
                      <td className="px-4 py-4">
                        {Number(registration.registrationFee) <= 0 ? <Badge variant="green" size="sm">Gratis</Badge> : registration.paymentStatus === 'paid' && registration.receiptNumber ? <div className="space-y-2"><Badge variant="green" size="sm" dot>Lunas</Badge><div className="flex flex-wrap gap-2"><Button variant="secondary" size="sm" icon={Receipt} onClick={() => setSelectedReceiptRegistration(registration)}>Lihat</Button><Button variant="secondary" size="sm" icon={Download} onClick={() => downloadReceipt(registration)}>Unduh PDF</Button></div></div> : <div className="space-y-1"><Badge variant="yellow" size="sm" dot>Menunggu verifikasi</Badge><p className="text-xs text-slate-600">Metode: {registration.paymentMethod === 'transfer' ? 'Transfer' : 'Cash'}</p></div>}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        {canDownloadCert ? (
                          <Button
                            variant="primary"
                            size="sm"
                            icon={Award}
                            isLoading={downloadingCertId === registration.id}
                            disabled={!!downloadingCertId}
                            onClick={() => handleDownloadCertificate(registration)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs cursor-pointer"
                            title="Unduh Sertifikat Resmi"
                          >
                            Unduh Sertifikat
                          </Button>
                        ) : registration.qrCode ? (
                          <Button variant="secondary" size="sm" icon={QrCode} onClick={() => { setQrDataUrl(''); setQrError(''); setSelectedQrRegistration(registration); }}>
                            Lihat QR
                          </Button>
                        ) : (
                          <span className="text-xs text-slate-500">Belum tersedia</span>
                        )}
                      </td>
                    </tr>;
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      )}

      {view === 'events' && (

      <div id="events" className="w-full pt-4 border-t border-[#BFDBFE]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-[#172554] tracking-tight">
              Katalog Event & Pendaftaran Kegiatan
            </h2>
            <p className="text-xs sm:text-sm text-[#1E40AF] font-medium">
              Pilih kegiatan yang ingin Anda ikuti dan klik tombol daftar untuk mendapatkan tiket.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#1E3A8A]" />
            <input
              type="text"
              value={searchEvent}
              onChange={(e) => setSearchEvent(e.target.value)}
              placeholder="Cari event seminar / workshop..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#BFDBFE] text-[#172554] placeholder-[#475569] bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {eventsLoading && <p className="col-span-full rounded-xl border border-blue-100 bg-white p-6 text-sm text-blue-800">Memuat katalog event...</p>}
          {!eventsLoading && filteredEvents.length === 0 && <p className="col-span-full rounded-xl border border-blue-100 bg-white p-6 text-sm text-slate-600">Belum ada event Published yang sesuai.</p>}
          {filteredEvents.map((event) => (
            <Card
              key={event.id}
              hoverEffect
              className="p-6 flex flex-col justify-between bg-white"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="blue" size="sm">
                    {event.category}
                  </Badge>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Kuota: {event.quotaLabel}
                  </span>
                </div>

                <button type="button" onClick={() => setSelectedEvent(event)} className="text-left font-extrabold text-base sm:text-lg text-[#172554] mb-2 leading-snug hover:text-blue-700">
                  {event.title}
                </button>

                <p className="text-xs sm:text-sm text-[#1E40AF] font-medium leading-relaxed mb-2">
                  {event.description}
                </p>
                <p className="mb-3 text-xs font-extrabold text-blue-800">Biaya pendaftaran: {formatRegistrationFee(event.registrationFee)}</p>

                <div className="space-y-1.5 text-xs text-[#172554] font-medium mb-4 pt-2 border-t border-[#BFDBFE]">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>{event.displayDate} &bull; {event.displayTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#BFDBFE] flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#1E3A8A]">
                  Oleh: {event.organizer}
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setSelectedEvent(event)}>Detail</Button>
                  {registrationsByEvent.has(String(event.id)) ? (
                    <Button variant="secondary" size="sm" disabled>Sudah Terdaftar</Button>
                  ) : Number(event.registeredCount || 0) >= Number(event.quota || 0) ? (
                    <Button variant="secondary" size="sm" disabled>Pendaftaran Ditutup</Button>
                  ) : (
                    <Button variant="primary" size="sm" disabled={!!registeringEventId} onClick={() => openRegistrationForm(event)}>Daftar Event</Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      )}

      {view === 'announcements' && (

      <div id="announcements" className="w-full pt-4 border-t border-[#BFDBFE]">
        <div className="mb-4">
          <h2 className="text-xl font-extrabold text-[#172554] tracking-tight">Papan Pengumuman Resmi Fakultas</h2>
          <p className="text-xs sm:text-sm text-[#1E40AF] font-medium">Pengumuman terbaru dan informasi penting FILKOM.</p>
        </div>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-800" />
            <input type="search" value={announcementSearch} onChange={(event) => setAnnouncementSearch(event.target.value)} placeholder="Cari judul pengumuman..." aria-label="Cari pengumuman" className="w-full rounded-xl border border-[#BFDBFE] bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <select value={announcementEventFilter} onChange={(event) => setAnnouncementEventFilter(event.target.value)} aria-label="Filter event pengumuman" className="rounded-xl border border-[#BFDBFE] bg-white px-3 py-2 text-sm">
            <option value="">Semua event</option><option value="general">Umum FILKOM</option>{announcementEvents.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
          <select value={announcementCategoryFilter} onChange={(event) => setAnnouncementCategoryFilter(event.target.value)} aria-label="Filter kategori pengumuman" className="rounded-xl border border-[#BFDBFE] bg-white px-3 py-2 text-sm">
            <option value="">Semua kategori</option>{ANNOUNCEMENT_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
          </select>
        </div>

        {announcementsError && <Alert type="error" message={announcementsError} onClose={() => setAnnouncementsError('')} />}
        {announcementsLoading ? <Card className="p-6 text-sm text-blue-800">Memuat pengumuman...</Card> : visibleAnnouncements.length === 0 ? (
          <Card className="p-6 text-sm text-slate-600">Tidak ada pengumuman Published yang cocok dengan pencarian atau kategori.</Card>
        ) : <div className="space-y-6">
          {pinnedAnnouncements.length > 0 && <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-amber-900"><Pin className="h-4 w-4 fill-current" />Pengumuman Penting</h3>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {pinnedAnnouncements.map((item) => <Card key={item.id} hoverEffect className="cursor-pointer border-2 border-amber-300 bg-amber-50/40" onClick={() => setSelectedAnnouncement(item)}>
                <CardBody>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><div className="flex flex-wrap gap-2"><Badge variant="blue" size="sm">{item.category}</Badge>{item.eventTitle && <Badge variant="purple" size="sm" icon={CalendarDays}>{item.eventTitle}</Badge>}</div><Badge variant="yellow" size="sm" icon={Pin}>Di-pin</Badge></div>
                  <h3 className="mb-2 text-base font-extrabold leading-snug text-[#172554]">{item.title}</h3>
                  <p className="mb-3 line-clamp-3 text-xs font-medium leading-relaxed text-[#1E40AF]">{item.content}</p>
                  <div className="flex items-center gap-1.5 border-t border-amber-200 pt-2 text-xs font-bold text-[#1D4ED8]"><Bell className="h-3.5 w-3.5 text-[#2563EB]" /><span>Dipublikasikan {formatAnnouncementDate(item.publishedAt)}</span></div>
                </CardBody>
                <CardFooter><span className="text-xs font-bold text-[#2563EB]">Baca selengkapnya &rarr;</span></CardFooter>
              </Card>)}
            </div>
          </div>}
          {regularAnnouncements.length > 0 && <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {regularAnnouncements.map((item) => <Card key={item.id} hoverEffect className="flex cursor-pointer flex-col justify-between bg-white" onClick={() => setSelectedAnnouncement(item)}>
              <CardBody>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[#1E3A8A]"><span className="flex flex-wrap items-center gap-2"><Badge variant="blue" size="sm">{item.category}</Badge>{item.eventTitle && <Badge variant="purple" size="sm" icon={CalendarDays}>{item.eventTitle}</Badge>}</span><span>{formatAnnouncementDate(item.publishedAt)}</span></div>
                <h3 className="mb-2 text-base font-extrabold leading-snug text-[#172554]">{item.title}</h3>
                <p className="mb-3 line-clamp-3 text-xs font-medium leading-relaxed text-[#1E40AF]">{item.content}</p>
              </CardBody>
              <CardFooter><span className="text-xs font-bold text-[#2563EB]">Baca selengkapnya &rarr;</span></CardFooter>
            </Card>)}
          </div>}
        </div>}
      </div>

      )}

      {view === 'certificates' && (student?.id ? <StudentCertificates studentId={student.id} /> : <Card className="p-6 text-sm text-slate-600">Daftar event dan isi data diri untuk melihat sertifikat di browser ini.</Card>)}

      {view === 'profile' && (
        <div className="w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#BFDBFE] pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-[#172554] tracking-tight flex items-center gap-2">
                <User className="w-5 h-5 text-[#2563EB]" />
                Pengaturan Akun & Profil Mahasiswa
              </h2>
              <p className="text-xs sm:text-sm text-[#1E40AF] font-medium mt-1">
                Kelola data diri akun mahasiswa Anda. Data yang diubah di sini akan otomatis terhubung saat mendaftar event.
              </p>
            </div>
          </div>

          {profileSuccess && (
            <Alert type="success" message={profileSuccess} onClose={() => setProfileSuccess('')} />
          )}
          {profileError && (
            <Alert type="error" message={profileError} onClose={() => setProfileError('')} />
          )}

          <Card className="p-6 sm:p-8 bg-white border border-[#BFDBFE] shadow-sm max-w-2xl">
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="flex items-center gap-4 pb-5 border-b border-blue-100">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1E3A8A] to-[#2563EB] text-white flex items-center justify-center font-bold text-xl shadow-md">
                  {profileForm.name ? profileForm.name.charAt(0).toUpperCase() : 'M'}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#172554]">{profileForm.name || 'Mahasiswa FILKOM'}</h3>
                  <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block mt-1 border border-emerald-200">
                    Akun Mahasiswa Aktif
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#172554] mb-1.5">
                    Nama Lengkap <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full rounded-xl border border-[#BFDBFE] px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none bg-white text-[#172554]"
                    placeholder="Nama sesuai identitas"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172554] mb-1.5">
                    NIM (Nomor Induk Mahasiswa) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.nim}
                    onChange={(e) => setProfileForm({ ...profileForm, nim: e.target.value })}
                    className="w-full rounded-xl border border-[#BFDBFE] px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none bg-white text-[#172554]"
                    placeholder="Contoh: 105022410082"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172554] mb-1.5">
                    Program Studi / Jurusan <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={profileForm.major}
                    onChange={(e) => setProfileForm({ ...profileForm, major: e.target.value })}
                    className="w-full rounded-xl border border-[#BFDBFE] px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none bg-white text-[#172554] cursor-pointer"
                  >
                    <option value="Informatika">Informatika</option>
                    <option value="Sistem Informasi">Sistem Informasi</option>
                    <option value="Teknologi Informasi">Teknologi Informasi</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#172554] mb-1.5">
                    Alamat Email Mahasiswa <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full rounded-xl border border-[#BFDBFE] px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none bg-white text-[#172554]"
                    placeholder="nama@student.unklab.ac.id"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#172554] mb-1.5">
                    Nomor Telepon / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-[#BFDBFE] px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none bg-white text-[#172554]"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-blue-100 flex items-center justify-end gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={profileSaving}
                  icon={Save}
                >
                  Simpan Perubahan Akun
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <Modal
        isOpen={view === 'registrations' && !!selectedReceiptRegistration}
        onClose={() => setSelectedReceiptRegistration(null)}
        title="Kwitansi Pembayaran Digital"
        maxWidth="max-w-xl"
        footer={<><Button variant="secondary" icon={Download} onClick={() => downloadReceipt(selectedReceiptRegistration)}>Unduh PDF</Button><Button variant="ghost" onClick={() => setSelectedReceiptRegistration(null)}>Tutup</Button></>}
      >
        {selectedReceiptRegistration && <div className="space-y-4">
          <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50 p-6 text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-blue-700">FILKOM Event Management</p>
            <h3 className="mt-2 text-xl font-extrabold text-[#172554]">Kwitansi Pembayaran</h3>
            <p className="mt-1 text-xs text-slate-600">Nomor: {selectedReceiptRegistration.receiptNumber}</p>
            <div className="my-5 border-t border-dashed border-blue-200" />
            <p className="text-xs text-slate-500">Diterima dari</p>
            <p className="mt-1 text-lg font-extrabold">{student?.name || 'Mahasiswa FILKOM'}</p>
            <p className="text-sm text-slate-600">NIM {student?.nim || '—'}</p>
            <p className="mt-4 text-xs text-slate-500">Pembayaran untuk</p>
            <p className="mt-1 font-bold">{selectedReceiptRegistration.event?.title || 'Event ' + selectedReceiptRegistration.eventId}</p>
            <p className="mt-4 text-2xl font-extrabold text-blue-800">{formatRegistrationFee(selectedReceiptRegistration.registrationFee)}</p>
            <p className="mt-1 text-xs text-slate-600">Metode: {selectedReceiptRegistration.paymentMethod === 'transfer' ? 'Transfer bank' : 'Cash'}</p>
            <p className="mt-1 text-xs text-slate-600">Dikonfirmasi: {selectedReceiptRegistration.paymentVerifiedAt ? new Date(selectedReceiptRegistration.paymentVerifiedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Makassar' }) : '—'}</p>
            {(selectedReceiptRegistration.mealChoice || selectedReceiptRegistration.shirtSize) && <div className="mt-4 rounded-xl bg-white p-3 text-left text-xs"><p className="font-bold text-blue-900">Pilihan pengambilan</p>{selectedReceiptRegistration.mealChoice && <p className="mt-1">Makanan: {selectedReceiptRegistration.mealChoice}</p>}{selectedReceiptRegistration.shirtSize && <p className="mt-1">Ukuran baju: {selectedReceiptRegistration.shirtSize}</p>}</div>}
          </div>
          <p className="text-center text-xs leading-relaxed text-slate-600">Tunjukkan kwitansi ini kepada panitia saat mengambil konsumsi atau baju yang tercatat pada pendaftaran.</p>
        </div>}
      </Modal>

      <Modal
        isOpen={view === 'registrations' && !!selectedQrRegistration}
        onClose={() => setSelectedQrRegistration(null)}
        title="QR Code Pendaftaran"
        footer={<Button variant="ghost" onClick={() => setSelectedQrRegistration(null)}>Tutup</Button>}
      >
        {selectedQrRegistration && <div className="space-y-4 text-center">
          <p className="text-sm font-bold text-[#172554]">{selectedQrRegistration.event?.title || `Event ${selectedQrRegistration.eventId}`}</p>
          {qrDataUrl ? <img src={qrDataUrl} alt={`QR pendaftaran ${selectedQrRegistration.event?.title || selectedQrRegistration.eventId}`} className="mx-auto h-64 w-64 rounded-xl border border-blue-100 bg-white p-2" /> : <div className="mx-auto flex h-64 w-64 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-sm text-blue-800">Menyiapkan QR Code...</div>}
          {qrError && <Alert type="error" message={qrError} />}
          <p className="text-xs text-slate-600">Tunjukkan QR ini kepada panitia saat check-in. Kode pendaftaran:</p>
          <code className="block break-all rounded-lg bg-slate-100 p-3 text-xs font-bold text-slate-800">{selectedQrRegistration.qrCode}</code>
        </div>}
      </Modal>

      <Modal
        isOpen={view === 'events' && !!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title="Detail Event"
        maxWidth="max-w-2xl"
        footer={selectedEvent && (
          <>
            <Button variant="ghost" onClick={() => setSelectedEvent(null)}>Tutup</Button>
            {registrationsByEvent.has(String(selectedEvent.id)) ? (
              <Button variant="secondary" disabled>Sudah Terdaftar</Button>
            ) : Number(selectedEvent.registeredCount || 0) >= Number(selectedEvent.quota || 0) ? (
              <Button variant="secondary" disabled>Pendaftaran Ditutup &bull; Kuota Penuh</Button>
            ) : (
              <Button disabled={!!registeringEventId} onClick={() => openRegistrationForm(selectedEvent)}>Daftar Event</Button>
            )}
          </>
        )}
      >
        {selectedEvent && <div className="space-y-4 text-left">
          {selectedEvent.poster && <img src={selectedEvent.poster} alt={`Poster ${selectedEvent.title}`} className="max-h-[28rem] w-full rounded-xl bg-slate-50 object-contain p-2" />}
          <div className="flex items-center justify-between gap-3"><Badge variant="blue">{selectedEvent.category}</Badge><Badge variant="green">Published</Badge></div>
          <h3 className="text-xl font-extrabold">{selectedEvent.title}</h3>
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{selectedEvent.description}</p>
          <dl className="grid grid-cols-2 gap-3 rounded-xl bg-blue-50 p-4 text-sm">
            <div><dt className="text-xs text-slate-500">Tanggal</dt><dd className="font-semibold">{selectedEvent.displayDate}</dd></div>
            <div><dt className="text-xs text-slate-500">Waktu</dt><dd className="font-semibold">{selectedEvent.displayTime}</dd></div>
            <div><dt className="text-xs text-slate-500">Lokasi</dt><dd className="font-semibold">{selectedEvent.location}</dd></div>
            <div><dt className="text-xs text-slate-500">Kuota terisi</dt><dd className="font-semibold">{selectedEvent.registeredCount || 0} / {selectedEvent.quota}</dd></div><div><dt className="text-xs text-slate-500">Biaya pendaftaran</dt><dd className="font-semibold">{formatRegistrationFee(selectedEvent.registrationFee)}</dd></div>{selectedEvent.mealOptions?.length > 0 && <div className="col-span-2"><dt className="text-xs text-slate-500">Pilihan makanan</dt><dd className="font-semibold">{selectedEvent.mealOptions.join(", ")}</dd></div>}{selectedEvent.shirtSizes?.length > 0 && <div className="col-span-2"><dt className="text-xs text-slate-500">Ukuran baju</dt><dd className="font-semibold">{selectedEvent.shirtSizes.join(", ")}</dd></div>}
          </dl>
        </div>}
      </Modal>

      <Modal
        isOpen={registrationFormOpen}
        onClose={() => { if (!registeringEventId) setRegistrationFormOpen(false); }}
        title="Formulir Pendaftaran Event"
        maxWidth="max-w-2xl"
        footer={<><Button variant="ghost" disabled={!!registeringEventId} onClick={() => setRegistrationFormOpen(false)}>Batal</Button><Button type="submit" form="student-registration-form" disabled={proofUploading || (registrationTarget && registrationForm.paymentMethod === 'transfer' && !(registrationTarget.paymentBankName && registrationTarget.paymentAccountNumber && registrationTarget.paymentAccountName))} isLoading={proofUploading}>{proofUploading ? 'Membaca bukti...' : 'Lanjut ke Konfirmasi →'}</Button></>}
      >
        <form id="student-registration-form" onSubmit={handleRegisterEvent} className="space-y-4">
          {registrationError && <Alert type="error" message={registrationError} onClose={() => setRegistrationError('')} />}
          <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-3.5 text-sm space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-extrabold text-[#172554] text-base">{registrationTarget?.title}</p>
              {registrationTarget?.category && <Badge variant="blue" size="sm">{registrationTarget.category}</Badge>}
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Data pendaftaran diambil otomatis dari profil akun mahasiswa Anda.</span>
            </div>
            <p className="border-t border-blue-100 pt-2 text-xs font-extrabold text-blue-900">
              Biaya pendaftaran: {formatRegistrationFee(registrationTarget?.registrationFee)}
            </p>
            {Number(registrationTarget?.registrationFee) > 0 && (
              <p className="text-[11px] text-blue-800">
                Pilih cash atau transfer. Kwitansi digital aktif setelah pembayaran diverifikasi BEM/Admin.
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="text-left">
              <label className="block text-xs font-bold text-[#172554] mb-1.5">
                Nama Lengkap
              </label>
              <input
                type="text"
                readOnly
                value={registrationForm.name}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-500 italic select-none focus:outline-none"
              />
            </div>

            <div className="text-left">
              <label className="block text-xs font-bold text-[#172554] mb-1.5">
                Email Mahasiswa
              </label>
              <input
                type="text"
                readOnly
                value={registrationForm.email}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-500 italic select-none focus:outline-none"
              />
            </div>

            <div className="text-left">
              <label className="block text-xs font-bold text-[#172554] mb-1.5">
                NIM (Nomor Induk Mahasiswa)
              </label>
              <input
                type="text"
                readOnly
                value={registrationForm.nim}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-500 italic select-none focus:outline-none"
              />
            </div>

            <div className="text-left">
              <label className="block text-xs font-bold text-[#172554] mb-1.5">
                Program Studi / Jurusan
              </label>
              <input
                type="text"
                readOnly
                value={registrationForm.major}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-500 italic select-none focus:outline-none"
              />
            </div>

            <div className="text-left sm:col-span-2">
              <label className="block text-xs font-bold text-[#172554] mb-1.5">
                Nomor Telepon / WhatsApp
              </label>
              <input
                type="text"
                readOnly
                value={registrationForm.phone || '-'}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-500 italic select-none focus:outline-none"
              />
            </div>
            {Number(registrationTarget?.registrationFee) > 0 && <div className="space-y-3 rounded-xl border border-blue-100 bg-blue-50 p-4 sm:col-span-2">
              <label className="block text-xs font-bold">Metode pembayaran<select required value={registrationForm.paymentMethod} onChange={(event) => { setRegistrationField('paymentMethod')(event); if (event.target.value !== 'transfer') setRegistrationForm((current) => ({ ...current, paymentProof: '', paymentProofName: '' })); }} className="mt-1.5 w-full rounded-xl border border-[#BFDBFE] bg-white px-3 py-2.5 text-sm"><option value="cash">Cash (bayar langsung ke panitia)</option><option value="transfer">Transfer bank</option></select></label>
              {registrationForm.paymentMethod === 'cash' ? <p className="text-xs leading-relaxed text-blue-900">Pembayaran cash menunggu konfirmasi penerimaan BEM/Admin. Kwitansi digital terbit setelah dikonfirmasi.</p> : <div className="space-y-2">
                {registrationTarget?.paymentBankName && registrationTarget?.paymentAccountNumber && registrationTarget?.paymentAccountName ? <div className="rounded-xl border border-blue-200 bg-white p-3 text-sm"><p className="text-xs font-extrabold uppercase tracking-wide text-blue-700">Transfer ke rekening ini</p><p className="mt-2 font-extrabold text-[#172554]">{registrationTarget.paymentBankName}</p><p className="text-lg font-extrabold tracking-wider text-blue-900">{registrationTarget.paymentAccountNumber}</p><p className="text-xs text-slate-600">a.n. {registrationTarget.paymentAccountName}</p><p className="mt-2 text-xs text-slate-600">Jumlah transfer: <strong>{formatRegistrationFee(registrationTarget.registrationFee)}</strong></p></div> : <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-900">Rekening tujuan transfer belum diatur pengelola event. Pendaftaran transfer belum dapat dikirim; pilih cash atau hubungi Admin/BEM.</p>}
                <label className="block text-xs font-bold">Unggah bukti transfer<input type="file" required accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => handlePaymentProofUpload(event.target.files?.[0])} className="mt-1.5 block w-full rounded-xl border border-[#BFDBFE] bg-white px-3 py-2.5 text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-blue-100 file:px-3 file:py-2 file:font-bold file:text-blue-800" /></label><p className="text-[11px] text-slate-600">Format JPG, PNG, WEBP, atau PDF; maksimal 1,5 MB.</p>{registrationForm.paymentProofName && <p className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-emerald-800">Bukti siap diunggah: {registrationForm.paymentProofName}</p>}</div>}
              <p className="text-[11px] leading-relaxed text-blue-900">Setelah diverifikasi, buka Riwayat Pendaftaran untuk menunjukkan kwitansi saat mengambil konsumsi atau baju.</p>
            </div>}
            {registrationTarget?.mealOptions?.length > 0 && <label className="block text-xs font-bold sm:col-span-2">Pilihan makanan<select required value={registrationForm.mealChoice} onChange={setRegistrationField('mealChoice')} className="mt-1.5 w-full rounded-xl border border-[#BFDBFE] bg-white px-3 py-2.5 text-sm"><option value="">Pilih menu</option>{registrationTarget.mealOptions.map((meal) => <option key={meal} value={meal}>{meal}</option>)}</select></label>}
            {registrationTarget?.shirtSizes?.length > 0 && <label className="block text-xs font-bold sm:col-span-2">Ukuran baju<select required value={registrationForm.shirtSize} onChange={setRegistrationField('shirtSize')} className="mt-1.5 w-full rounded-xl border border-[#BFDBFE] bg-white px-3 py-2.5 text-sm"><option value="">Pilih ukuran</option>{registrationTarget.shirtSizes.map((size) => <option key={size} value={size}>{size}</option>)}</select></label>}
          </div>
        </form>
      </Modal>

      {/* Modal Konfirmasi Pendaftaran (Validasi Tindakan) */}
      <Modal
        isOpen={registrationConfirmOpen}
        onClose={() => { if (!registeringEventId) setRegistrationConfirmOpen(false); }}
        title="Konfirmasi Pendaftaran Event"
        maxWidth="max-w-lg"
        footer={
          <>
            <Button
              variant="ghost"
              disabled={!!registeringEventId}
              onClick={() => {
                setRegistrationConfirmOpen(false);
                setRegistrationFormOpen(true);
              }}
            >
              Lihat Data
            </Button>
            <Button
              variant="primary"
              disabled={!!registeringEventId}
              isLoading={!!registeringEventId}
              onClick={handleConfirmRegistration}
            >
              Ya, Kirim Pendaftaran
            </Button>
          </>
        }
      >
        {pendingRegistrationData && (
          <div className="space-y-4 text-left text-sm text-[#172554]">
            {registrationError && (
              <Alert type="error" message={registrationError} onClose={() => setRegistrationError('')} />
            )}
            <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed font-medium">
                <strong>Verifikasi Informasi:</strong> Pastikan seluruh data diri dan pilihan pendaftaran Anda di bawah ini sudah benar sebelum melanjutkan.
              </div>
            </div>

            {/* Ringkasan Event */}
            <div className="rounded-xl border border-blue-100 bg-[#EFF6FF] p-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A]">Kegiatan yang Diikuti</p>
              <h4 className="font-extrabold text-[#172554] text-base">{pendingRegistrationData.event.title}</h4>
              <p className="text-xs text-[#1E40AF]">
                {pendingRegistrationData.event.displayDate || pendingRegistrationData.event.date} &bull; {pendingRegistrationData.event.location}
              </p>
              <p className="text-xs font-bold text-blue-900">
                Biaya: {formatRegistrationFee(pendingRegistrationData.event.registrationFee)}
              </p>
            </div>

            {/* Ringkasan Data Mahasiswa */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 text-xs">
              <p className="font-bold uppercase tracking-wider text-slate-500 mb-2">Data Mahasiswa Pendaftar</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block">Nama Lengkap</span>
                  <strong className="text-slate-800 text-sm">{pendingRegistrationData.form.name}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">NIM</span>
                  <strong className="text-slate-800 text-sm">{pendingRegistrationData.form.nim}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Email</span>
                  <span className="text-slate-800 font-semibold">{pendingRegistrationData.form.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Program Studi</span>
                  <span className="text-slate-800 font-semibold">{pendingRegistrationData.form.major}</span>
                </div>
                {pendingRegistrationData.form.phone && (
                  <div className="col-span-2">
                    <span className="text-slate-500 block">No. Telepon / WhatsApp</span>
                    <span className="text-slate-800 font-semibold">{pendingRegistrationData.form.phone}</span>
                  </div>
                )}
                {pendingRegistrationData.form.mealChoice && (
                  <div>
                    <span className="text-slate-500 block">Pilihan Menu</span>
                    <span className="text-slate-800 font-semibold">{pendingRegistrationData.form.mealChoice}</span>
                  </div>
                )}
                {pendingRegistrationData.form.shirtSize && (
                  <div>
                    <span className="text-slate-500 block">Ukuran Baju</span>
                    <span className="text-slate-800 font-semibold">{pendingRegistrationData.form.shirtSize}</span>
                  </div>
                )}
                {Number(pendingRegistrationData.event.registrationFee) > 0 && (
                  <div className="col-span-2">
                    <span className="text-slate-500 block">Metode Pembayaran</span>
                    <span className="text-slate-800 font-semibold">
                      {pendingRegistrationData.form.paymentMethod === 'transfer' ? 'Transfer Bank' : 'Cash (Bayar Langsung)'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Detail Pengumuman */}
      <Modal
        isOpen={view === 'announcements' && !!selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
        title={selectedAnnouncement?.title || 'Detail Pengumuman'}
        footer={
          <Button variant="primary" size="sm" onClick={() => setSelectedAnnouncement(null)}>
            Tutup Pengumuman
          </Button>
        }
      >
        {selectedAnnouncement && (
          <div className="space-y-4 text-left text-[#172554]">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[#1E3A8A]">
              <Badge variant="blue">{selectedAnnouncement.category}</Badge>
              <div className="flex items-center gap-2">
                {selectedAnnouncement.isPinned && <Badge variant="yellow" icon={Pin}>Penting</Badge>}{selectedAnnouncement.eventTitle && <Badge variant="purple" icon={CalendarDays}>{selectedAnnouncement.eventTitle}</Badge>}
                <span>{formatAnnouncementDate(selectedAnnouncement.publishedAt)}</span>
              </div>
            </div>
            <p className="text-sm text-[#172554] font-medium leading-relaxed whitespace-pre-line">
              {selectedAnnouncement.content}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
