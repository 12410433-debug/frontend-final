import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Award, CalendarDays, Eye, ImagePlus, MapPin, Pencil, Plus, QrCode, Search, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { jsonServerApi } from '../services/api';
import eventApi from '../services/eventApi';
import notificationApi from '../services/notificationApi';
import Alert from './Alert';
import Badge from './Badge';
import Button from './Button';
import Card, { CardHeader } from './Card';
import Input from './Input';
import Modal from './Modal';
import AttendanceManagement from './AttendanceManagement';
import CertificateTemplateManagement from './CertificateTemplateManagement';

const CATEGORIES = ['Seminar', 'Workshop', 'Kompetisi', 'Pelatihan', 'Organisasi', 'Lainnya'];
const STATUSES = ['draft', 'published', 'ongoing', 'completed', 'cancelled'];
const STATUS_LABELS = {
  draft: 'Draft',
  published: 'Published',
  ongoing: 'Ongoing',
  completed: 'Completed',
  cancelled: 'Cancelled',
};
const SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
const DEFAULT_SHIRT_SIZES = ['S', 'M', 'L', 'XL'];
const EMPTY_FORM = {
  title: '', description: '', category: 'Seminar', poster: '', date: '',
  startTime: '', endTime: '', location: '', quota: '100', status: 'draft', organizerId: '',
  feeMode: 'free', registrationFee: '', paymentBankName: '', paymentAccountNumber: '', paymentAccountName: '',
  mealEnabled: false, mealOptionsText: '', shirtEnabled: false, shirtSizes: [],
};

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

function formatDate(date) {
  if (!date) return '-';
  return new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function statusVariant(status) {
  if (status === 'published' || status === 'ongoing') return 'green';
  if (status === 'cancelled') return 'red';
  if (status === 'completed') return 'gray';
  return 'yellow';
}

const MAX_POSTER_FILE_SIZE = 10 * 1024 * 1024;
const MAX_POSTER_DATA_SIZE = 320 * 1024;

function parseRupiahAmount(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits ? Number(digits) : 0;
}

function formatRupiahInput(value) {
  const amount = Number(value) || 0;
  return amount > 0 ? new Intl.NumberFormat('id-ID').format(amount) : '';
}

function formatRegistrationFee(value) {
  const amount = Number(value) || 0;
  return amount > 0 ? `Rp ${new Intl.NumberFormat('id-ID').format(amount)}` : 'Gratis';
}

async function compressPosterImage(file) {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('Gambar poster tidak dapat dibaca.'));
      element.src = objectUrl;
    });
    const scale = Math.min(1, 1600 / image.width, 1800 / image.height);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Browser tidak dapat memproses gambar poster.');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    let blob = null;
    for (let quality = 0.88; quality >= 0.32; quality -= 0.08) {
      blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
      if (blob && blob.size <= MAX_POSTER_DATA_SIZE) break;
    }
    if (!blob || blob.size > MAX_POSTER_DATA_SIZE) {
      throw new Error('Poster terlalu besar setelah dikompres. Gunakan gambar yang lebih sederhana atau lebih kecil.');
    }
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Poster terkompres gagal dibaca.'));
      reader.readAsDataURL(blob);
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function EventManagement({ assignedOnly = false }) {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [posterLoading, setPosterLoading] = useState(false);
  const [savingStatusId, setSavingStatusId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [detailsEvent, setDetailsEvent] = useState(null);
  const [deleteEvent, setDeleteEvent] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [activeEventSubView, setActiveEventSubView] = useState(null);

  const loadEvents = async () => {
    try {
      setError('');
      const data = await eventApi.list();
      setEvents(Array.isArray(data) ? data : []);
    } catch {
      setError('Daftar event gagal dimuat. Pastikan JSON Server berjalan dan endpoint /events tersedia.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    eventApi.list()
      .then((data) => {
        if (active) setEvents(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setError('Daftar event gagal dimuat. Pastikan JSON Server berjalan dan endpoint /events tersedia.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!['bem', 'admin', 'committee'].includes(user?.role)) return;
    jsonServerApi.get('/users')
      .then(({ data }) => setOrganizers(data.filter((item) => ['bem', 'admin', 'committee'].includes(item.role))))
      .catch(() => setError('Data pengguna BEM tidak dapat dimuat.'));
  }, [user?.role]);

  const visibleEvents = useMemo(() => events
    .filter((event) => !assignedOnly || String(event.organizerId) === String(user?.id))
    .filter((event) => event.title?.toLowerCase().includes(search.trim().toLowerCase()))
    .filter((event) => !categoryFilter || event.category === categoryFilter)
    .filter((event) => !statusFilter || event.status === statusFilter)
    .sort((a, b) => String(a.date).localeCompare(String(b.date))),
  [events, assignedOnly, user?.id, search, categoryFilter, statusFilter]);

  const openCreate = useCallback(() => {
    setEditingEvent(null);
    setForm({ ...EMPTY_FORM, organizerId: assignedOnly ? String(user?.id || '') : '' });
    setFormOpen(true);
  }, [assignedOnly, user?.id]);

  useEffect(() => {
    if (!['bem', 'admin', 'committee'].includes(user?.role)) return undefined;
    const createTimer = window.location.hash === '#create-event' ? window.setTimeout(openCreate, 0) : null;
    const openCreateFromSidebar = () => openCreate();
    window.addEventListener('filkom:create-event', openCreateFromSidebar);
    return () => {
      if (createTimer) window.clearTimeout(createTimer);
      window.removeEventListener('filkom:create-event', openCreateFromSidebar);
    };
  }, [user?.role, openCreate]);
  const openEdit = (event) => {
    if (assignedOnly && String(event.organizerId) !== String(user?.id)) return;
    setEditingEvent(event);
    setForm({
      ...EMPTY_FORM,
      ...event,
      category: CATEGORIES.includes(event.category) ? event.category : 'Lainnya',
      status: STATUSES.includes(event.status) ? event.status : 'draft',
      quota: String(event.quota ?? 100),
      feeMode: Number(event.registrationFee) > 0 ? 'paid' : 'free',
      registrationFee: formatRupiahInput(event.registrationFee),
      mealEnabled: Array.isArray(event.mealOptions) && event.mealOptions.length > 0,
      mealOptionsText: Array.isArray(event.mealOptions) ? event.mealOptions.join('\n') : '',
      shirtEnabled: Array.isArray(event.shirtSizes) && event.shirtSizes.length > 0,
      shirtSizes: Array.isArray(event.shirtSizes) ? event.shirtSizes : [],
      organizerId: String(event.organizerId ?? user?.id ?? ''),
    });
    setFormOpen(true);
  };

  const updateStatus = async (event, status) => {
    if (!STATUSES.includes(status) || status === event.status) return;
    if (assignedOnly && String(event.organizerId) !== String(user?.id)) return;
    setSavingStatusId(event.id);
    setError('');
    setNotice('');
    try {
      const updatedEvent = await eventApi.updateStatus(event.id, status);
      if (status === 'published' && event.status !== 'published') {
        try {
          const emailResult = await notificationApi.sendPublishedEvent(updatedEvent.id, user?.id);
          if (emailResult.failed) setError(emailResult.failed + ' email event gagal dikirim.');
        } catch (emailError) {
          setError('Status event tersimpan, tetapi email event gagal dikirim: ' + (emailError.response?.data?.error || emailError.message));
        }
      }
      setEvents((current) => current.map((item) => (
        String(item.id) === String(event.id) ? { ...item, ...updatedEvent } : item
      )));
      setNotice(`Status â€œ${event.title}â€ berhasil diubah menjadi ${STATUS_LABELS[updatedEvent.status] || status}.`);
    } catch (requestError) {
      const detail = requestError.response?.data?.message || requestError.response?.data?.error;
      setError(detail
        ? `Status event ${event.id} gagal disimpan: ${detail}`
        : `Status event ${event.id} gagal disimpan ke JSON Server. Pastikan server aktif di ${import.meta.env.VITE_JSON_SERVER_URL || 'http://localhost:3001'} lalu coba lagi.`);
    } finally {
      setSavingStatusId(null);
    }
  };

  const uploadPoster = async (uploadEvent) => {
    const file = uploadEvent.target.files?.[0];
    uploadEvent.target.value = '';
    if (!file) return;
    setError('');
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('Pilih gambar PNG, JPG, atau WebP.');
      return;
    }
    if (file.size > MAX_POSTER_FILE_SIZE) {
      setError('Ukuran gambar maksimal 10 MB sebelum dikompres.');
      return;
    }
    try {
      setPosterLoading(true);
      const poster = await compressPosterImage(file);
      setForm((current) => ({ ...current, poster }));
      setNotice('Poster siap disimpan bersama event.');
    } catch (uploadError) {
      setError(uploadError.message || 'Poster gagal diproses.');
    } finally {
      setPosterLoading(false);
    }
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setNotice('');
    setError('');
    const quota = Number(form.quota);
    if (!Number.isInteger(quota) || quota < 1) {
      setError('Kuota harus berupa bilangan bulat minimal 1.');
      return;
    }
    if (editingEvent && quota < Number(editingEvent.registeredCount || 0)) {
      setError(`Kuota tidak boleh kurang dari ${editingEvent.registeredCount} pendaftar yang sudah tercatat.`);
      return;
    }
    const registrationFee = form.feeMode === 'paid' ? parseRupiahAmount(form.registrationFee) : 0;
    if (form.feeMode === 'paid' && (!Number.isInteger(registrationFee) || registrationFee < 1)) {
      setError('Biaya pendaftaran harus berupa angka bulat lebih dari 0, atau pilih Gratis.');
      return;
    }
    const paymentAccountNumber = String(form.paymentAccountNumber || '').replace(/\D/g, '');
    if (registrationFee > 0 && (!form.paymentBankName.trim() || paymentAccountNumber.length < 5 || !form.paymentAccountName.trim())) {
      setError('Lengkapi nama bank, nomor rekening (minimal 5 digit), dan nama pemilik rekening untuk event berbayar.');
      return;
    }
    const mealOptions = form.mealEnabled
      ? [...new Map(form.mealOptionsText.split(/[\n,;]+/).map((item) => item.trim()).filter(Boolean).map((item) => [item.toLocaleLowerCase(), item])).values()]
      : [];
    if (form.mealEnabled && mealOptions.length === 0) {
      setError('Tambahkan minimal satu pilihan makanan atau nonaktifkan pilihan makanan.');
      return;
    }
    if (mealOptions.some((item) => item.length > 80)) {
      setError('Nama pilihan makanan maksimal 80 karakter.');
      return;
    }
    const shirtSizes = form.shirtEnabled ? SHIRT_SIZES.filter((size) => form.shirtSizes.includes(size)) : [];
    if (form.shirtEnabled && shirtSizes.length === 0) {
      setError('Pilih minimal satu ukuran baju atau nonaktifkan pilihan baju.');
      return;
    }


    const organizerId = assignedOnly ? String(user.id) : String(form.organizerId);
    if (!organizerId) {
      setError('Pilih penanggung jawab BEM untuk event.');
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      poster: form.poster,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      location: form.location.trim(),
      quota,
      registrationFee,
      paymentBankName: registrationFee > 0 ? form.paymentBankName.trim() : '',
      paymentAccountNumber: registrationFee > 0 ? paymentAccountNumber : '',
      paymentAccountName: registrationFee > 0 ? form.paymentAccountName.trim() : '',
      mealOptions,
      shirtSizes,
      status: form.status,
      organizerId,
      registeredCount: editingEvent?.registeredCount || 0,
      ...(editingEvent ? {} : { createdAt: new Date().toISOString() }),
    };

    try {
      setSaving(true);
      let savedEvent;
      let successMessage;
      if (editingEvent) {
        savedEvent = await eventApi.update(editingEvent.id, payload);
        successMessage = 'Perubahan event berhasil disimpan.';
      } else {
        savedEvent = await eventApi.create(payload);
        successMessage = 'Event berhasil ditambahkan ke JSON Server.';
      }
      if (savedEvent.status === 'published' && (!editingEvent || editingEvent.status !== 'published')) {
        try {
          const emailResult = await notificationApi.sendPublishedEvent(savedEvent.id, user?.id);
          if (emailResult.failed) setError(emailResult.failed + ' email event gagal dikirim.');
        } catch (emailError) {
          setError('Event tersimpan, tetapi email event gagal dikirim: ' + (emailError.response?.data?.error || emailError.message));
        }
      }
      setNotice(successMessage);
      setFormOpen(false);
      await loadEvents();
    } catch {
      setError('Perubahan gagal disimpan ke JSON Server. Periksa koneksi lalu coba kembali.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteEvent || (assignedOnly && String(deleteEvent.organizerId) !== String(user?.id))) return;
    try {
      setError('');
      await eventApi.remove(deleteEvent.id);
      setDeleteEvent(null);
      setNotice(`Event â€œ${deleteEvent.title}â€ berhasil dihapus.`);
      await loadEvents();
    } catch {
      setError('Event gagal dihapus dari JSON Server.');
      setDeleteEvent(null);
    }
  };

  const setField = (name) => (e) => setForm((current) => ({ ...current, [name]: e.target.value }));

  if (activeEventSubView) {
    return (
      <div className="space-y-5 text-[#172554]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#BFDBFE] bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              icon={ArrowLeft}
              onClick={() => {
                setActiveEventSubView(null);
                loadEvents();
              }}
            >
              Kembali ke Kelola Event
            </Button>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                {activeEventSubView.type === 'attendance'
                  ? 'Kelola Peserta & Rekap Absensi Event'
                  : 'Kelola Template & Sertifikat Event'}
              </p>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#172554]">
                {activeEventSubView.event.title}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="blue">{activeEventSubView.event.category}</Badge>
            <Badge variant={statusVariant(activeEventSubView.event.status)} dot>
              {STATUS_LABELS[activeEventSubView.event.status] || activeEventSubView.event.status}
            </Badge>
          </div>
        </div>

        {activeEventSubView.type === 'attendance' && (
          <AttendanceManagement
            assignedOnly={assignedOnly}
            initialEventId={String(activeEventSubView.event.id)}
          />
        )}

        {activeEventSubView.type === 'certificates' && (
          <CertificateTemplateManagement
            initialEventId={String(activeEventSubView.event.id)}
          />
        )}
      </div>
    );
  }

  return (
    <section id="events" className="space-y-5 text-[#172554]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#BFDBFE] bg-white p-5 sm:p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold">{assignedOnly ? 'Event yang Ditugaskan' : 'Manajemen Event'}</h2>
          <p className="mt-1 text-sm text-[#1E40AF]">{assignedOnly ? 'Kelola event yang ditugaskan kepada akun BEM ini.' : 'BEM Fakultas dapat mengelola seluruh event FILKOM dari JSON Server.'}</p>
        </div>
        <Button icon={Plus} onClick={openCreate}>Tambah Event</Button>
      </div>

      {notice && <Alert type="success" message={notice} onClose={() => setNotice('')} />}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <Card className="border border-[#BFDBFE] bg-white">
        <CardHeader className="flex-col items-stretch gap-3 border-b border-[#BFDBFE] sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-800" />
            <input aria-label="Cari judul event" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari berdasarkan judul..." className="w-full rounded-xl border border-[#BFDBFE] bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <select aria-label="Filter kategori" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-xl border border-[#BFDBFE] bg-white px-3 py-2 text-sm">
            <option value="">Semua kategori</option>{CATEGORIES.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select aria-label="Filter status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-[#BFDBFE] bg-white px-3 py-2 text-sm">
            <option value="">Semua status</option>{STATUSES.map((item) => <option key={item} value={item}>{STATUS_LABELS[item]}</option>)}
          </select>
        </CardHeader>
        {isLoading ? <p className="p-8 text-center text-sm text-blue-800">Memuat event...</p> : visibleEvents.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-600"><CalendarDays className="mx-auto mb-2 h-8 w-8 text-blue-500" />Tidak ada event yang cocok dengan pencarian atau filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="bg-[#EFF6FF] text-xs uppercase text-[#1E3A8A] font-extrabold tracking-wider border-b border-blue-100">
                <tr>
                  <th className="px-5 py-3.5 min-w-[240px]">Event</th>
                  <th className="px-4 py-3.5 min-w-[160px]">Jadwal</th>
                  <th className="px-4 py-3.5 min-w-[150px]">Lokasi</th>
                  <th className="px-4 py-3.5 min-w-[110px]">Kuota</th>
                  <th className="px-4 py-3.5 min-w-[130px]">Status</th>
                  <th className="px-5 py-3.5 text-right min-w-[310px]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                {visibleEvents.map((event) => {
                  const canManage = !assignedOnly || String(event.organizerId) === String(user?.id);
                  const isFull = (event.registeredCount || 0) >= (event.quota || 1);
                  const quotaPercent = Math.min(100, Math.round(((event.registeredCount || 0) / (event.quota || 1)) * 100));
                  return (
                    <tr key={event.id} className="hover:bg-blue-50/50 transition-colors">
                      {/* Kolom Event */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {event.poster ? (
                            <img src={event.poster} alt="" className="h-11 w-11 rounded-xl border border-blue-100 object-cover shadow-2xs shrink-0" />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-500 border border-blue-100 shadow-2xs shrink-0">
                              <CalendarDays className="h-5 w-5" />
                            </div>
                          )}
                          <div className="min-w-0 max-w-[230px]">
                            <p className="font-extrabold text-sm text-[#172554] leading-snug line-clamp-1" title={event.title}>
                              {event.title}
                            </p>
                            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                                {event.category}
                              </span>
                              {Number(event.registrationFee) > 0 ? (
                                <span className="inline-flex items-center rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                                  Rp {new Intl.NumberFormat('id-ID').format(event.registrationFee)}
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                                  Gratis
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Kolom Jadwal */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-bold text-xs text-[#172554]">{formatDate(event.date)}</div>
                        <div className="mt-0.5 text-[11px] text-slate-500 font-medium">
                          {formatEventTimeRange(event.startTime, event.endTime)}
                        </div>
                      </td>

                      {/* Kolom Lokasi */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-start gap-1.5 text-xs text-slate-700 max-w-[150px]" title={event.location}>
                          <MapPin className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-2 font-medium">{event.location || '-'}</span>
                        </div>
                      </td>

                      {/* Kolom Kuota */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="text-xs font-bold text-[#172554]">
                          {event.registeredCount || 0} <span className="font-normal text-slate-500">/ {event.quota}</span>
                        </div>
                        <div className="mt-1.5 w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              isFull ? 'bg-rose-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${quotaPercent}%` }}
                          />
                        </div>
                      </td>

                      {/* Kolom Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {canManage ? (
                            <div className="relative inline-block">
                              <select
                                aria-label={`Ubah status ${event.title}`}
                                value={event.status}
                                disabled={savingStatusId === event.id}
                                onChange={(e) => updateStatus(event, e.target.value)}
                                className={`rounded-xl pl-2.5 pr-6 py-1 text-xs font-bold border transition cursor-pointer appearance-none shadow-2xs ${
                                  event.status === 'published' || event.status === 'ongoing'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                    : event.status === 'cancelled'
                                    ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                    : event.status === 'completed'
                                    ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                    : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                }`}
                              >
                                {STATUSES.map((status) => (
                                  <option key={status} value={status} className="bg-white text-slate-900 font-medium">
                                    {STATUS_LABELS[status] || status}
                                  </option>
                                ))}
                              </select>
                              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-current text-[9px] opacity-70">▼</span>
                            </div>
                          ) : (
                            <Badge variant={statusVariant(event.status)} size="sm" dot>
                              {STATUS_LABELS[event.status] || event.status}
                            </Badge>
                          )}
                          {savingStatusId === event.id && (
                            <span role="status" className="text-[10px] text-blue-700 animate-pulse font-semibold">Menyimpan...</span>
                          )}
                        </div>
                      </td>

                      {/* Kolom Aksi */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setActiveEventSubView({ type: 'attendance', event })}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-800 transition hover:bg-blue-600 hover:text-white hover:border-blue-600 cursor-pointer shadow-2xs shrink-0"
                            title={`Kelola Peserta & Absensi untuk ${event.title}`}
                          >
                            <QrCode className="h-3.5 w-3.5" />
                            <span>Peserta & Absen</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveEventSubView({ type: 'certificates', event })}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-bold text-indigo-800 transition hover:bg-indigo-600 hover:text-white hover:border-indigo-600 cursor-pointer shadow-2xs shrink-0"
                            title={`Kelola Sertifikat untuk ${event.title}`}
                          >
                            <Award className="h-3.5 w-3.5" />
                            <span>Sertifikat</span>
                          </button>
                          <div className="flex items-center gap-0.5 ml-1 border-l border-slate-200 pl-1 shrink-0">
                            <button
                              type="button"
                              aria-label={`Detail ${event.title}`}
                              title="Lihat detail"
                              onClick={() => setDetailsEvent(event)}
                              className="rounded-lg p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition cursor-pointer"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {canManage && (
                              <>
                                <button
                                  type="button"
                                  aria-label={`Edit ${event.title}`}
                                  title="Edit event"
                                  onClick={() => openEdit(event)}
                                  className="rounded-lg p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition cursor-pointer"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  aria-label={`Hapus ${event.title}`}
                                  title="Hapus event"
                                  onClick={() => setDeleteEvent(event)}
                                  className="rounded-lg p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={editingEvent ? 'Edit Event' : 'Tambah Event'} maxWidth="max-w-3xl">
        <form id="event-form" onSubmit={submitForm} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Judul event" value={form.title} onChange={setField('title')} required maxLength={120} placeholder="Judul kegiatan" />
            <label className="block text-xs font-bold">Kategori<select required value={form.category} onChange={setField('category')} className="mt-1.5 w-full rounded-xl border border-[#BFDBFE] bg-white px-3 py-2.5 text-sm">{CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label>
            <Input label="Tanggal" type="date" value={form.date} onChange={setField('date')} required />
            <div className="grid grid-cols-2 gap-3"><Input label="Waktu mulai" type="time" value={form.startTime} onChange={setField('startTime')} required /><Input label="Waktu selesai" type="time" value={form.endTime} onChange={setField('endTime')} required /></div>
            <Input label="Lokasi" value={form.location} onChange={setField('location')} required maxLength={160} />
            <Input label="Kuota" type="number" min="1" step="1" value={form.quota} onChange={setField('quota')} required />
            <div className="space-y-2">
              <label className="block text-xs font-bold">Poster event (opsional)<span className="mt-1.5 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-[#93C5FD] bg-blue-50 px-3 py-3 text-sm font-semibold text-blue-800 transition hover:border-blue-500 hover:bg-blue-100"><ImagePlus className="h-5 w-5 shrink-0" />{posterLoading ? 'Mengompres gambar...' : 'Pilih gambar poster'}<input type="file" accept="image/png,image/jpeg,image/webp" disabled={posterLoading || saving} onChange={uploadPoster} className="sr-only" /></span></label>
              <p className="text-[11px] text-slate-600">PNG, JPG, atau WebP; maksimal 10 MB. Gambar dikompres sebelum disimpan.</p>
              {posterLoading && <p role="status" className="text-xs font-semibold text-blue-700">Mengoptimalkan poster...</p>}
              {form.poster && <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-white p-2"><img src={form.poster} alt="Pratinjau poster event" className="h-24 w-20 rounded-lg object-cover" /><div className="flex-1"><p className="text-xs font-bold text-blue-900">Poster terpilih</p><button type="button" disabled={posterLoading || saving} onClick={() => setForm((current) => ({ ...current, poster: '' }))} className="mt-2 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-rose-700 transition hover:bg-rose-50 disabled:opacity-50"><Trash2 className="h-3.5 w-3.5" />Hapus poster</button></div></div>}
            </div>
            <label className="block text-xs font-bold">Status<select required value={form.status} onChange={setField('status')} className="mt-1.5 w-full rounded-xl border border-[#BFDBFE] bg-white px-3 py-2.5 text-sm">{STATUSES.map((item) => <option key={item} value={item}>{STATUS_LABELS[item]}</option>)}</select></label>
            {!assignedOnly && <label className="block text-xs font-bold">Penanggung jawab BEM<select required value={form.organizerId} onChange={setField('organizerId')} className="mt-1.5 w-full rounded-xl border border-[#BFDBFE] bg-white px-3 py-2.5 text-sm"><option value="">Pilih penanggung jawab</option>{organizers.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.id})</option>)}</select></label>}
          </div>
          <section className="space-y-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 sm:col-span-2">
            <div><h3 className="text-sm font-extrabold text-[#172554]">Biaya dan pilihan peserta</h3><p className="mt-1 text-xs font-medium text-slate-600">Atur biaya pendaftaran, pilihan menu, dan ukuran baju untuk event ini.</p></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-bold">Biaya pendaftaran<select value={form.feeMode} onChange={setField('feeMode')} className="mt-1.5 w-full rounded-xl border border-[#BFDBFE] bg-white px-3 py-2.5 text-sm"><option value="free">Gratis</option><option value="paid">Berbayar</option></select></label>
              {form.feeMode === 'paid' && <Input label="Jumlah biaya (Rupiah)" type="text" inputMode="numeric" pattern="[0-9.,]*" value={form.registrationFee} onChange={(event) => setForm((current) => ({ ...current, registrationFee: event.target.value.replace(/[^0-9.,]/g, '') }))} onBlur={(event) => setForm((current) => ({ ...current, registrationFee: formatRupiahInput(parseRupiahAmount(event.target.value)) }))} required placeholder="Contoh: 225.000" helperText="Masukkan nominal Rupiah; titik atau koma boleh digunakan sebagai pemisah ribuan." />}
              {form.feeMode === 'paid' && <div className="space-y-3 rounded-xl border border-blue-100 bg-white p-3 sm:col-span-2"><div><h4 className="text-xs font-extrabold text-blue-900">Rekening tujuan transfer</h4><p className="mt-1 text-[11px] font-normal text-slate-600">Detail ini ditampilkan kepada mahasiswa saat memilih transfer.</p></div><div className="grid gap-3 sm:grid-cols-3"><Input label="Nama bank" value={form.paymentBankName} onChange={setField('paymentBankName')} required maxLength={60} placeholder="Contoh: BCA" /><Input label="Nomor rekening" type="text" inputMode="numeric" value={form.paymentAccountNumber} onChange={(event) => setForm((current) => ({ ...current, paymentAccountNumber: event.target.value.replace(/\D/g, '') }))} required maxLength={30} placeholder="Masukkan nomor rekening" /><Input label="Nama pemilik rekening" value={form.paymentAccountName} onChange={setField('paymentAccountName')} required maxLength={120} placeholder="Nama penerima transfer" /></div></div>}
            </div>
            <div className="space-y-3 rounded-xl border border-white bg-white p-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-bold"><input type="checkbox" checked={form.mealEnabled} onChange={(event) => setForm((current) => ({ ...current, mealEnabled: event.target.checked }))} className="h-4 w-4 accent-blue-700" />Sediakan pilihan makanan</label>
              {form.mealEnabled && <label className="block text-xs font-bold">Pilihan menu<textarea required rows={3} value={form.mealOptionsText} onChange={setField('mealOptionsText')} placeholder={'Nasi ayam\nVegetarian\nTidak memilih makanan'} className="mt-1.5 w-full rounded-xl border border-[#BFDBFE] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /><span className="mt-1 block font-normal text-slate-600">Pisahkan setiap pilihan dengan baris baru atau koma.</span></label>}
            </div>
            <div className="space-y-3 rounded-xl border border-white bg-white p-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-bold"><input type="checkbox" checked={form.shirtEnabled} onChange={(event) => setForm((current) => ({ ...current, shirtEnabled: event.target.checked, shirtSizes: event.target.checked ? (current.shirtSizes.length ? current.shirtSizes : DEFAULT_SHIRT_SIZES) : [] }))} className="h-4 w-4 accent-blue-700" />Sediakan baju event dan pilihan ukuran</label>
              {form.shirtEnabled && <div><p className="mb-2 text-xs font-bold">Ukuran yang tersedia</p><div className="flex flex-wrap gap-2">{SHIRT_SIZES.map((size) => <label key={size} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-blue-100 px-2.5 py-1.5 text-xs font-semibold"><input type="checkbox" checked={form.shirtSizes.includes(size)} onChange={(event) => setForm((current) => ({ ...current, shirtSizes: event.target.checked ? [...new Set([...current.shirtSizes, size])] : current.shirtSizes.filter((item) => item !== size) }))} className="accent-blue-700" />{size}</label>)}</div></div>}
            </div>
          </section>          <label className="block text-xs font-bold">Deskripsi<textarea required rows={4} maxLength={3000} value={form.description} onChange={setField('description')} placeholder="Jelaskan kegiatan, sasaran, dan informasi penting event." className="mt-1.5 w-full rounded-xl border border-[#BFDBFE] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></label>

          <div className="flex justify-end gap-2 border-t border-blue-100 pt-4"><Button variant="ghost" onClick={() => setFormOpen(false)}>Batal</Button><Button type="submit" isLoading={saving || posterLoading}>{editingEvent ? 'Simpan Perubahan' : 'Simpan Event'}</Button></div>
        </form>
      </Modal>

      <Modal isOpen={!!detailsEvent} onClose={() => setDetailsEvent(null)} title="Detail Event" maxWidth="max-w-2xl" footer={<Button onClick={() => setDetailsEvent(null)}>Tutup</Button>}>
        {detailsEvent && <div className="space-y-4">{detailsEvent.poster && <img src={detailsEvent.poster} alt={`Poster ${detailsEvent.title}`} className="max-h-[28rem] w-full rounded-xl bg-slate-50 object-contain p-2" />}<div className="flex items-center justify-between gap-3"><Badge variant="blue">{detailsEvent.category}</Badge><Badge variant={statusVariant(detailsEvent.status)}>{STATUS_LABELS[detailsEvent.status] || detailsEvent.status}</Badge></div><h3 className="text-xl font-extrabold">{detailsEvent.title}</h3><p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{detailsEvent.description}</p><dl className="grid grid-cols-2 gap-3 rounded-xl bg-blue-50 p-4 text-sm"><div><dt className="text-xs text-slate-500">Tanggal</dt><dd className="font-semibold">{formatDate(detailsEvent.date)}</dd></div><div><dt className="text-xs text-slate-500">Waktu</dt><dd className="font-semibold">{formatEventTimeRange(detailsEvent.startTime, detailsEvent.endTime)}</dd></div><div><dt className="text-xs text-slate-500">Lokasi</dt><dd className="font-semibold">{detailsEvent.location}</dd></div><div><dt className="text-xs text-slate-500">Kuota</dt><dd className="font-semibold">{detailsEvent.registeredCount || 0} / {detailsEvent.quota}</dd></div><div><dt className="text-xs text-slate-500">Biaya pendaftaran</dt><dd className="font-semibold">{formatRegistrationFee(detailsEvent.registrationFee)}</dd></div>{Number(detailsEvent.registrationFee) > 0 && <div className="col-span-2 rounded-xl border border-blue-100 bg-white p-3"><dt className="text-xs text-slate-500">Rekening tujuan transfer</dt><dd className="mt-1 font-bold">{detailsEvent.paymentBankName || 'Belum diatur'} · {detailsEvent.paymentAccountNumber || '—'}</dd><dd className="text-xs text-slate-600">a.n. {detailsEvent.paymentAccountName || 'Belum diatur'}</dd></div>}{detailsEvent.mealOptions?.length > 0 && <div className="col-span-2"><dt className="text-xs text-slate-500">Pilihan makanan</dt><dd className="font-semibold">{detailsEvent.mealOptions.join(", ")}</dd></div>}{detailsEvent.shirtSizes?.length > 0 && <div className="col-span-2"><dt className="text-xs text-slate-500">Ukuran baju</dt><dd className="font-semibold">{detailsEvent.shirtSizes.join(", ")}</dd></div>}</dl></div>}
      </Modal>

      <Modal isOpen={!!deleteEvent} onClose={() => setDeleteEvent(null)} title="Konfirmasi Hapus Event" footer={<><Button variant="ghost" onClick={() => setDeleteEvent(null)}>Batal</Button><Button variant="danger" onClick={confirmDelete}>Hapus Event</Button></>}>
        <p className="text-sm text-slate-700">Hapus event <strong>{deleteEvent?.title}</strong>? Data event akan dihapus dari JSON Server.</p>
      </Modal>
    </section>
  );
}
