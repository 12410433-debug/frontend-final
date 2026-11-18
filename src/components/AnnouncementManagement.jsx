import { useEffect, useMemo, useState } from 'react';
import { Bell, CalendarDays, Eye, Mail, Pencil, Pin, PinOff, Plus, Search, Trash2 } from 'lucide-react';
import Alert from './Alert';
import Badge from './Badge';
import Button from './Button';
import Card, { CardHeader } from './Card';
import Input from './Input';
import Modal from './Modal';
import announcementApi from '../services/announcementApi';
import eventApi from '../services/eventApi';
import notificationApi from '../services/notificationApi';
import { useAuth } from '../context/AuthContext';

const EMPTY_FORM = { title: '', content: '', status: 'draft', isPinned: false, eventId: '' };

function formatPublishedAt(value) {
  if (!value) return 'Belum dipublikasikan';
  return new Date(value).toLocaleString('id-ID', {
    dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Makassar',
  });
}

function requestErrorMessage(error, fallback) {
  return error.response?.data?.error || error.response?.data?.message || fallback;
}

export default function AnnouncementManagement({ assignedOnly = false }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isBemOfficial = String(user?.email || '').trim().toLowerCase() === 'bemfilkomm@gmail.com';
  const isFullAccess = isAdmin || isBemOfficial;
  const effectiveAssignedOnly = !isFullAccess || assignedOnly;

  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPinId, setSavingPinId] = useState(null);
  const [sendingId, setSendingId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [details, setDetails] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([announcementApi.list(), eventApi.list()])
      .then(([announcementRows, eventRows]) => {
        if (active) {
          setAnnouncements(announcementRows);
          setEvents(eventRows);
        }
      })
      .catch(() => {
        if (active) setError('Pengumuman atau event gagal dimuat. Pastikan JSON Server aktif di port 3001.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const eventById = useMemo(() => new Map(events.map((event) => [String(event.id), event])), [events]);
  const accessibleEvents = useMemo(() => events.filter((event) => (
    !effectiveAssignedOnly || String(event.organizerId) === String(user?.id)
  )), [events, effectiveAssignedOnly, user?.id]);
  const visibleAnnouncements = useMemo(() => announcements
    .filter((item) => item.title?.toLowerCase().includes(search.trim().toLowerCase()))
    .filter((item) => !statusFilter || item.status === statusFilter)
    .filter((item) => !eventFilter
      || (eventFilter === 'general' ? !item.eventId : String(item.eventId || '') === eventFilter))
    .sort((a, b) => Number(b.isPinned) - Number(a.isPinned)
      || String(b.publishedAt || b.createdAt).localeCompare(String(a.publishedAt || a.createdAt))),
  [announcements, search, statusFilter, eventFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title || '',
      content: item.content || '',
      status: item.status === 'published' ? 'published' : 'draft',
      isPinned: Boolean(item.isPinned),
      eventId: item.eventId ? String(item.eventId) : '',
    });
    setFormOpen(true);
  };

  const sendAnnouncementEmail = async (item) => {
    if (!item?.id) return;
    setSendingId(item.id);
    setError('');
    setSuccess('');
    try {
      const result = await notificationApi.sendAnnouncement(item.id, user?.id);
      setSuccess(result.message + '. Terkirim: ' + result.sent + ', dilewati: ' + result.skipped + '.');
      if (result.failed) setError(result.failed + ' email gagal dikirim. Periksa konfigurasi atau status SMTP lalu coba kirim ulang.');
    } catch (sendError) {
      setError(requestErrorMessage(sendError, 'Pengumuman tersimpan, tetapi email gagal dikirim. Pastikan Gmail SMTP sudah dikonfigurasi.'));
    } finally {
      setSendingId(null);
    }
  };

  const saveAnnouncement = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    const title = form.title.trim();
    const content = form.content.trim();
    if (!title || !content) {
      setError('Judul dan isi pengumuman harus diisi.');
      return;
    }

    const publishedAt = form.status === 'published'
      ? (editing?.publishedAt || new Date().toISOString())
      : null;
    const payload = {
      title,
      content,
      category: 'Umum',
      status: form.status,
      isPinned: Boolean(form.isPinned),
      eventId: form.eventId || null,
      publishedAt,
      ...(editing ? {} : { createdAt: new Date().toISOString() }),
    };
    const shouldNotify = form.status === 'published'
      && (!editing || editing.status !== 'published'
        || String(editing.eventId || '') !== String(form.eventId || ''));

    try {
      setSaving(true);
      let saved;
      if (editing) {
        saved = await announcementApi.update(editing.id, payload);
        setAnnouncements((current) => current.map((item) => String(item.id) === String(editing.id) ? saved : item));
        setSuccess('Pengumuman berhasil diperbarui.');
      } else {
        saved = await announcementApi.create(payload);
        setAnnouncements((current) => [saved, ...current]);
        setSuccess('Pengumuman berhasil ditambahkan.');
      }
      setFormOpen(false);
      if (shouldNotify) await sendAnnouncementEmail(saved);
    } catch (saveError) {
      setError(requestErrorMessage(saveError, 'Perubahan gagal disimpan. Pastikan JSON Server aktif di http://localhost:3001.'));
    } finally {
      setSaving(false);
    }
  };

  const togglePin = async (item) => {
    setSavingPinId(item.id);
    setError('');
    setSuccess('');
    try {
      const updated = await announcementApi.updatePinned(item.id, !item.isPinned);
      setAnnouncements((current) => current.map((announcement) => String(announcement.id) === String(item.id) ? updated : announcement));
      setSuccess('Pengumuman ' + (updated.isPinned ? 'disematkan.' : 'dilepas dari pin.'));
    } catch (requestError) {
      setError(requestErrorMessage(requestError, 'Status pin gagal disimpan ke JSON Server.'));
    } finally {
      setSavingPinId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      setError('');
      await announcementApi.remove(deleting.id);
      setAnnouncements((current) => current.filter((item) => String(item.id) !== String(deleting.id)));
      setSuccess('Pengumuman "' + deleting.title + '" berhasil dihapus.');
      setDeleting(null);
    } catch (requestError) {
      setError(requestErrorMessage(requestError, 'Pengumuman gagal dihapus dari JSON Server.'));
      setDeleting(null);
    }
  };

  const setField = (name) => (event) => setForm((current) => ({ ...current, [name]: event.target.value }));
  const eventName = (eventId) => eventById.get(String(eventId))?.title || (eventId ? 'Event tidak ditemukan' : 'Umum FILKOM');

  return (
    <section id="announcements" className="space-y-5 text-[#172554]">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#172554] via-blue-700 to-indigo-500 p-6 text-white shadow-lg shadow-blue-100 sm:p-7">
        <div className="pointer-events-none absolute -right-10 -top-14 h-44 w-44 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-wider text-blue-100">BEM Fakultas</p><h1 className="mt-1 text-2xl font-extrabold">Pengumuman per Event</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-blue-100">Pisahkan informasi umum dan pengumuman untuk event tertentu. Publikasi dapat dikirim ke email mahasiswa atau peserta event.</p></div>
          <div className="flex flex-wrap items-center gap-2">
            <Button icon={Plus} onClick={openCreate}>Tambah Pengumuman</Button>
          </div>
        </div>
      </div>

      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <Card className="overflow-hidden border border-[#BFDBFE] bg-white">
        <CardHeader className="flex-col items-stretch gap-3 border-b border-[#BFDBFE] sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-800" /><input aria-label="Cari judul pengumuman" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari judul pengumuman..." className="w-full rounded-xl border border-[#BFDBFE] bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <select aria-label="Filter event pengumuman" value={eventFilter} onChange={(event) => setEventFilter(event.target.value)} className="rounded-xl border border-[#BFDBFE] bg-white px-3 py-2 text-sm"><option value="">Semua event</option><option value="general">Umum FILKOM</option>{accessibleEvents.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select>
          <select aria-label="Filter status pengumuman" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-[#BFDBFE] bg-white px-3 py-2 text-sm"><option value="">Semua status</option><option value="draft">Draft</option><option value="published">Published</option></select>
        </CardHeader>
        {loading ? <p className="p-8 text-center text-sm text-blue-800">Memuat pengumuman...</p> : visibleAnnouncements.length === 0 ? <div className="p-10 text-center text-sm text-slate-600"><Bell className="mx-auto mb-2 h-8 w-8 text-blue-500" />Tidak ada pengumuman yang sesuai filter.</div> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-[#EFF6FF] text-xs uppercase text-[#1E3A8A]"><tr><th className="px-5 py-3">Judul</th><th className="px-4 py-3">Event</th><th className="px-4 py-3">Publikasi</th><th className="px-4 py-3">Pin</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Aksi</th></tr></thead>
            <tbody className="divide-y divide-blue-100">{visibleAnnouncements.map((item) => <tr key={item.id} className="hover:bg-blue-50/50">
              <td className="px-5 py-4"><p className="font-bold">{item.title}</p><p className="mt-1 line-clamp-2 max-w-md text-xs text-slate-600">{item.content}</p></td>
              <td className="px-4 py-4"><span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800"><CalendarDays className="h-3.5 w-3.5" />{eventName(item.eventId)}</span></td>
              <td className="whitespace-nowrap px-4 py-4">{formatPublishedAt(item.publishedAt)}</td>
              <td className="px-4 py-4"><button type="button" onClick={() => togglePin(item)} disabled={savingPinId === item.id} aria-label={item.isPinned ? 'Lepas pin ' + item.title : 'Pin ' + item.title} title={item.isPinned ? 'Lepas pin' : 'Sematkan'} className="rounded-lg p-2 text-amber-700 hover:bg-amber-50 disabled:opacity-50">{savingPinId === item.id ? <span className="text-xs">...</span> : item.isPinned ? <Pin className="h-4 w-4 fill-current" /> : <PinOff className="h-4 w-4" />}</button></td>
              <td className="px-4 py-4"><Badge variant={item.status === 'published' ? 'green' : 'yellow'} size="sm" dot>{item.status === 'published' ? 'Published' : 'Draft'}</Badge></td>
              <td className="px-4 py-4"><div className="flex justify-end gap-1">
                {item.status === 'published' && <button type="button" title="Kirim ulang notifikasi email" aria-label={'Kirim ulang notifikasi untuk ' + item.title} onClick={() => sendAnnouncementEmail(item)} disabled={!!sendingId} className="rounded-lg p-2 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50">{sendingId === item.id ? <span className="text-xs">...</span> : <Mail className="h-4 w-4" />}</button>}
                <button type="button" title="Detail" aria-label={'Detail ' + item.title} onClick={() => setDetails(item)} className="rounded-lg p-2 text-blue-700 hover:bg-blue-50"><Eye className="h-4 w-4" /></button><button type="button" title="Edit" aria-label={'Edit ' + item.title} onClick={() => openEdit(item)} className="rounded-lg p-2 text-blue-700 hover:bg-blue-50"><Pencil className="h-4 w-4" /></button><button type="button" title="Hapus" aria-label={'Hapus ' + item.title} onClick={() => setDeleting(item)} className="rounded-lg p-2 text-rose-700 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
              </div></td>
            </tr>)}</tbody>
          </table></div>
        )}
      </Card>

      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit Pengumuman' : 'Tambah Pengumuman'} maxWidth="max-w-2xl">
        <form onSubmit={saveAnnouncement} className="space-y-4">
          <Input label="Judul" value={form.title} onChange={setField('title')} required maxLength={140} placeholder="Judul pengumuman" />
          <label className="block text-xs font-bold">Isi Pengumuman<textarea value={form.content} onChange={setField('content')} required maxLength={5000} rows={7} placeholder="Tulis isi pengumuman dengan jelas." className="mt-1.5 w-full rounded-xl border border-[#BFDBFE] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-bold">Terkait Event<select value={form.eventId} onChange={setField('eventId')} className="mt-1.5 w-full rounded-xl border border-[#BFDBFE] bg-white px-3 py-2.5 text-sm"><option value="">Umum FILKOM (semua mahasiswa)</option>{accessibleEvents.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
            <label className="block text-xs font-bold">Status<select value={form.status} onChange={setField('status')} required className="mt-1.5 w-full rounded-xl border border-[#BFDBFE] bg-white px-3 py-2.5 text-sm"><option value="draft">Draft</option><option value="published">Published</option></select></label>
          </div>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm font-semibold"><input type="checkbox" checked={form.isPinned} onChange={(event) => setForm((current) => ({ ...current, isPinned: event.target.checked }))} className="h-4 w-4 accent-blue-600" /><Pin className="h-4 w-4 text-amber-700" />Tandai sebagai pengumuman penting (Pin)</label>
          <p className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs leading-relaxed text-blue-900">Saat dipublikasikan, pengumuman umum dikirim ke mahasiswa aktif. Pengumuman terkait event dikirim ke peserta yang terdaftar pada event tersebut.</p>
          <div className="flex justify-end gap-2 border-t border-blue-100 pt-4"><Button variant="ghost" onClick={() => setFormOpen(false)}>Batal</Button><Button type="submit" isLoading={saving}>{editing ? 'Simpan Perubahan' : 'Simpan Pengumuman'}</Button></div>
        </form>
      </Modal>

      <Modal isOpen={!!details} onClose={() => setDetails(null)} title="Detail Pengumuman" maxWidth="max-w-2xl" footer={<Button onClick={() => setDetails(null)}>Tutup</Button>}>
        {details && <article className="space-y-4"><div className="flex flex-wrap items-center gap-2"><Badge variant={details.status === 'published' ? 'green' : 'yellow'}>{details.status === 'published' ? 'Published' : 'Draft'}</Badge>{details.isPinned && <Badge variant="yellow" icon={Pin}>Penting</Badge>}<Badge variant="blue" icon={CalendarDays}>{eventName(details.eventId)}</Badge></div><h3 className="text-xl font-extrabold">{details.title}</h3><p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{details.content}</p><p className="border-t border-blue-100 pt-3 text-xs text-slate-500">Tanggal publikasi: {formatPublishedAt(details.publishedAt)}</p></article>}
      </Modal>

      <Modal isOpen={!!deleting} onClose={() => setDeleting(null)} title="Hapus Pengumuman" footer={<><Button variant="ghost" onClick={() => setDeleting(null)}>Batal</Button><Button variant="danger" onClick={confirmDelete}>Hapus</Button></>}><p className="text-sm text-slate-700">Hapus pengumuman <strong>{deleting?.title}</strong>? Penghapusan akan tersimpan di JSON Server.</p></Modal>
    </section>
  );
}
