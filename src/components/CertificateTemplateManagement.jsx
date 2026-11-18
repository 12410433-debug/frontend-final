import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Award, FileImage, Save, Trash2, Upload } from 'lucide-react';
import { jsonServerApi } from '../services/api';
import certificateTemplateService from '../services/certificateTemplateService';
import certificateService from '../services/certificateService';
import Alert from './Alert';
import Button from './Button';
import Card from './Card';
import CertificateManagement from './CertificateManagement';

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const MAX_JSON_IMAGE_SIZE = 70 * 1024;

async function compressAsDataUrl(file) {
  const imageUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('File template gagal dibaca sebagai gambar.'));
      element.src = imageUrl;
    });
    const scale = Math.min(1, 1600 / image.width, 1131 / image.height);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    let blob = null;
    for (let quality = 0.82; quality >= 0.12; quality -= 0.08) {
      blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
      if (blob && blob.size <= MAX_JSON_IMAGE_SIZE) break;
    }
    if (!blob || blob.size > MAX_JSON_IMAGE_SIZE) {
      throw new Error('Template tidak dapat dikompres cukup kecil untuk JSON Server. Gunakan desain yang lebih sederhana.');
    }
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Template terkompres gagal dibaca.'));
      reader.readAsDataURL(blob);
    });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

export default function CertificateTemplateManagement({ initialEventId = 'default' }) {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [prevInitialId, setPrevInitialId] = useState(initialEventId);
  const [eventId, setEventId] = useState(initialEventId || 'default');
  const [templateDraft, setTemplateDraft] = useState({ eventId: initialEventId || 'default', value: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [certificateRefreshKey, setCertificateRefreshKey] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (initialEventId !== prevInitialId) {
    setPrevInitialId(initialEventId);
    setEventId(initialEventId || 'default');
    setTemplateDraft({ eventId: initialEventId || 'default', value: null });
  }

  useEffect(() => {
    let active = true;
    Promise.all([jsonServerApi.get('/events'), certificateTemplateService.list()])
      .then(([eventResult, rows]) => {
        if (!active) return;
        setEvents(eventResult.data);
        setTemplates(rows);
      })
      .catch(() => { if (active) setError('Event atau template gagal dimuat dari JSON Server.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const selectedTemplate = useMemo(() => templates.find((item) => String(item.eventId || 'default') === eventId) || null, [templates, eventId]);
  const template = templateDraft.eventId === eventId ? templateDraft.value : selectedTemplate;
  const updateTemplate = (update) => setTemplateDraft((current) => {
    const currentValue = current.eventId === eventId ? current.value : selectedTemplate;
    return { eventId, value: typeof update === 'function' ? update(currentValue) : update };
  });

  const upload = async (file) => {
    setError('');
    setSuccess('');
    if (!file) return;
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      setError('Template harus berupa gambar PNG atau JPG.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('Ukuran file maksimal 8 MB sebelum kompresi.');
      return;
    }
    try {
      const imageDataUrl = await compressAsDataUrl(file);
      updateTemplate((current) => ({
        ...(current || {}),
        eventId,
        imageDataUrl,
        mimeType: 'image/jpeg',
        fileName: file.name,
        nameX: current?.nameX ?? 50,
        nameY: current?.nameY ?? 55,
        fontSize: current?.fontSize ?? 28,
        nameColor: current?.nameColor ?? '#1e3a8a',
      }));
    } catch (uploadError) {
      setError(uploadError.message);
    }
  };

  const save = async () => {
    setError('');
    setSuccess('');
    if (!template?.imageDataUrl) {
      setError('Unggah gambar template sertifikat terlebih dahulu.');
      return;
    }
    try {
      setSaving(true);
      const saved = await certificateTemplateService.save({
        eventId: eventId === 'default' ? null : eventId,
        imageDataUrl: template.imageDataUrl,
        mimeType: template.mimeType,
        fileName: template.fileName,
        nameX: Number(template.nameX ?? 50),
        nameY: Number(template.nameY ?? 55),
        fontSize: Number(template.fontSize ?? 28),
        nameColor: template.nameColor || '#1e3a8a',
        updatedAt: new Date().toISOString(),
      });
      setTemplates((current) => [...current.filter((item) => String(item.eventId || 'default') !== eventId), saved]);
      setTemplateDraft({ eventId, value: saved });
      try {
        const result = await certificateService.issueForEligible(eventId, user?.id);
        if (result.emailFailed) setError(result.emailFailed + ' email sertifikat gagal dikirim. Periksa Gmail SMTP.');
        setCertificateRefreshKey((current) => current + 1);
        setSuccess(result.issued > 0
          ? `Template tersimpan. ${result.issued} sertifikat otomatis diterbitkan untuk peserta yang sudah hadir.`
          : 'Template tersimpan. Belum ada peserta dengan absensi Hadir; sertifikat akan terbit otomatis setelah kehadiran dicatat.');
      } catch (issueError) {
        setCertificateRefreshKey((current) => current + 1);
        setError(issueError.response?.data?.message || 'Template tersimpan, tetapi sebagian sertifikat gagal diterbitkan otomatis. Coba simpan template kembali.');
      }
    } catch (saveError) {
      setError(saveError.response?.data?.message || 'Template gagal disimpan. Pastikan JSON Server memiliki endpoint /certificateTemplates.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!selectedTemplate) return;
    try {
      setError('');
      await certificateTemplateService.remove(selectedTemplate.id);
      setTemplates((current) => current.filter((item) => String(item.id) !== String(selectedTemplate.id)));
      setTemplateDraft({ eventId, value: null });
      setSuccess('Template berhasil dihapus. Sertifikat akan memakai desain bawaan.');
    } catch {
      setError('Template gagal dihapus dari JSON Server.');
    }
  };

  const setField = (field, value) => updateTemplate((current) => ({ ...current, [field]: value }));
  const eventName = events.find((item) => String(item.id) === eventId)?.title;

  return (
    <section className="space-y-5 text-[#172554]">
      <div><p className="text-xs font-bold uppercase tracking-wide text-blue-700">BEM Fakultas</p><h1 className="mt-1 text-2xl font-extrabold">Template Sertifikat</h1><p className="mt-1 max-w-3xl text-sm text-blue-900">Unggah desain A4 landscape dan atur posisi nama. Sistem hanya menambahkan nama mahasiswa dari akun peserta yang tervalidasi hadir.</p></div>
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {loading ? <Card className="p-6 text-sm text-blue-800">Memuat template...</Card> : <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)]">
        <Card className="space-y-5 p-5 sm:p-6">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/70 px-5 py-8 text-center transition hover:border-blue-500">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm"><Upload className="h-5 w-5" /></span>
            <span className="mt-3 text-sm font-extrabold">{template?.fileName || 'Unggah desain sertifikat'}</span>
            <span className="mt-1 text-xs text-slate-600">PNG atau JPG, maksimal 8 MB. Gambar dikompres agar tersimpan di JSON Server. A4 landscape.</span>
            <input type="file" accept="image/png,image/jpeg" className="sr-only" onChange={(event) => upload(event.target.files?.[0])} />
          </label>
          {template?.imageDataUrl && <div className="space-y-4 rounded-2xl border border-blue-100 p-4">
            <label className="block text-xs font-bold">Posisi nama horizontal: {template.nameX ?? 50}%<input type="range" min="10" max="90" value={template.nameX ?? 50} onChange={(event) => setField('nameX', Number(event.target.value))} className="mt-2 w-full accent-blue-600" /></label>
            <label className="block text-xs font-bold">Posisi nama vertikal: {template.nameY ?? 55}%<input type="range" min="15" max="70" value={template.nameY ?? 55} onChange={(event) => setField('nameY', Number(event.target.value))} className="mt-2 w-full accent-blue-600" /></label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-bold">Ukuran nama: {template.fontSize ?? 28} pt<input type="range" min="14" max="42" value={template.fontSize ?? 28} onChange={(event) => setField('fontSize', Number(event.target.value))} className="mt-2 w-full accent-blue-600" /></label>
              <label className="block text-xs font-bold">Warna nama<input type="color" value={template.nameColor || '#1e3a8a'} onChange={(event) => setField('nameColor', event.target.value)} className="mt-2 h-9 w-full cursor-pointer rounded-lg border border-blue-100 p-1" /></label>
            </div>
          </div>}
          <div className="flex flex-wrap justify-end gap-2"><Button variant="danger" icon={Trash2} disabled={!selectedTemplate || saving} onClick={remove}>Hapus Template</Button><Button icon={Save} isLoading={saving} disabled={!template?.imageDataUrl} onClick={save}>Simpan Template</Button></div>
        </Card>
        <Card className="p-5 sm:p-6">
          <div className="mb-3 flex items-center gap-2 text-sm font-extrabold"><FileImage className="h-4 w-4 text-blue-700" />Pratinjau {eventName ? `· ${eventName}` : '· Default'}</div>
          <div className="relative aspect-[297/210] overflow-hidden rounded-lg border border-blue-200 bg-[#EFF6FF] shadow-inner">
            {template?.imageDataUrl ? <img src={template.imageDataUrl} alt="Pratinjau template sertifikat" className="absolute inset-0 h-full w-full object-fill" /> : <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-blue-800"><Award className="h-10 w-10" /><p className="mt-3 text-sm font-bold">Desain bawaan FILKOM akan digunakan</p><p className="mt-1 text-xs">Unggah gambar untuk menggantinya.</p></div>}
            {template?.imageDataUrl && <div className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-center font-serif font-bold drop-shadow-sm" style={{ left: `${template.nameX ?? 50}%`, top: `${template.nameY ?? 55}%`, color: template.nameColor || '#1e3a8a', fontSize: `clamp(9px, ${Number(template.fontSize ?? 28) / 1.5}px, 26px)` }}>Nama Mahasiswa</div>}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-600">Posisi nama pada pratinjau juga dipakai saat PDF dibuat. Template khusus event mengungguli template default.</p>
        </Card>
      </div>}
      {!loading && <CertificateManagement refreshKey={certificateRefreshKey} eventId={eventId} />}
    </section>
  );
}
