import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Award, Eye, FileImage, RotateCcw, Save, Trash2, Upload } from 'lucide-react';
import { jsonServerApi } from '../services/api';
import certificateTemplateService from '../services/certificateTemplateService';
import certificateService from '../services/certificateService';
import Alert from './Alert';
import Badge from './Badge';
import Button from './Button';
import Card from './Card';
import Modal from './Modal';
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

export default function CertificateTemplateManagement({ initialEventId = '', assignedOnly = false }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isBemOfficial = String(user?.email || '').trim().toLowerCase() === 'bemfilkomm@gmail.com';
  const isFullAccess = isAdmin || isBemOfficial;
  const effectiveAssignedOnly = !isFullAccess || assignedOnly;

  const [events, setEvents] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [prevInitialId, setPrevInitialId] = useState(initialEventId);
  const [eventId, setEventId] = useState(initialEventId || (effectiveAssignedOnly ? '' : 'default'));
  const [templateDraft, setTemplateDraft] = useState({ eventId: initialEventId || (effectiveAssignedOnly ? '' : 'default'), value: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [certificateRefreshKey, setCertificateRefreshKey] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (initialEventId !== prevInitialId) {
    setPrevInitialId(initialEventId);
    setEventId(initialEventId || (effectiveAssignedOnly ? '' : 'default'));
    setTemplateDraft({ eventId: initialEventId || (effectiveAssignedOnly ? '' : 'default'), value: null });
  }

  useEffect(() => {
    let active = true;
    Promise.all([jsonServerApi.get('/events'), certificateTemplateService.list()])
      .then(([eventResult, rows]) => {
        if (!active) return;
        const allEvents = eventResult.data || [];
        setEvents(allEvents);
        setTemplates(rows || []);

        const accessible = allEvents.filter((e) => !effectiveAssignedOnly || String(e.organizerId) === String(user?.id));
        if (initialEventId && accessible.some((e) => String(e.id) === String(initialEventId))) {
          setEventId(String(initialEventId));
        } else if (effectiveAssignedOnly) {
          if (accessible.length > 0) {
            setEventId((curr) => (accessible.some((e) => String(e.id) === String(curr)) ? curr : String(accessible[0].id)));
          } else {
            setEventId('');
          }
        } else if (!eventId) {
          setEventId('default');
        }
      })
      .catch(() => { if (active) setError('Event atau template gagal dimuat dari JSON Server.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [effectiveAssignedOnly, initialEventId, user?.id]);

  const accessibleEvents = useMemo(() => (
    events.filter((item) => !effectiveAssignedOnly || String(item.organizerId) === String(user?.id))
  ), [events, effectiveAssignedOnly, user?.id]);

  const selectedTemplate = useMemo(() => {
    if (!eventId) return null;
    return templates.find((item) => String(item.eventId || 'default') === String(eventId || 'default')) || null;
  }, [templates, eventId]);

  const template = (templateDraft.eventId === eventId && templateDraft.value !== null)
    ? templateDraft.value
    : selectedTemplate;

  const hasUnsavedChanges = useMemo(() => {
    if (templateDraft.eventId !== eventId || templateDraft.value === null) return false;
    return JSON.stringify(templateDraft.value) !== JSON.stringify(selectedTemplate);
  }, [templateDraft, eventId, selectedTemplate]);

  const updateTemplate = (update) => setTemplateDraft((current) => {
    const base = (current.eventId === eventId && current.value !== null) ? current.value : selectedTemplate;
    const next = typeof update === 'function' ? update(base) : update;
    return { eventId, value: next };
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
        eventId: (!eventId || eventId === 'default') ? null : eventId,
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
        eventId: (!eventId || eventId === 'default') ? null : eventId,
        imageDataUrl: template.imageDataUrl,
        mimeType: template.mimeType,
        fileName: template.fileName,
        nameX: Number(template.nameX ?? 50),
        nameY: Number(template.nameY ?? 55),
        fontSize: Number(template.fontSize ?? 28),
        nameColor: template.nameColor || '#1e3a8a',
        updatedAt: new Date().toISOString(),
      });
      setTemplates((current) => [...current.filter((item) => String(item.eventId || 'default') !== String(eventId || 'default')), saved]);
      setTemplateDraft({ eventId, value: saved });

      if (eventId && eventId !== 'default') {
        try {
          const result = await certificateService.issueForEligible(eventId, user?.id);
          if (result.emailFailed) setError(result.emailFailed + ' email sertifikat gagal dikirim. Periksa Gmail SMTP.');
          setCertificateRefreshKey((current) => current + 1);
          setSuccess(result.issued > 0
            ? `Template sertifikat berhasil disimpan! ${result.issued} sertifikat otomatis diterbitkan untuk peserta yang sudah hadir.`
            : 'Template sertifikat berhasil disimpan. Sertifikat akan terbit otomatis setelah kehadiran dicatat.');
        } catch (issueError) {
          setCertificateRefreshKey((current) => current + 1);
          setError(issueError.response?.data?.message || 'Template tersimpan, tetapi sebagian sertifikat gagal diterbitkan otomatis.');
        }
      } else {
        setCertificateRefreshKey((current) => current + 1);
        setSuccess('Template sertifikat umum berhasil disimpan.');
      }
    } catch (saveError) {
      setError(saveError.response?.data?.message || 'Template gagal disimpan.');
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
      setSuccess('Template khusus event ini berhasil dihapus. Sertifikat akan menggunakan desain bawaan FILKOM.');
    } catch {
      setError('Template gagal dihapus dari JSON Server.');
    }
  };

  const resetChanges = () => {
    setTemplateDraft({ eventId, value: null });
    setError('');
    setSuccess('Perubahan dibatalkan. Mengembalikan ke template yang tersimpan.');
  };

  const setField = (field, value) => updateTemplate((current) => ({ ...current, [field]: value }));
  const currentEvent = events.find((item) => String(item.id) === String(eventId));
  const eventName = currentEvent?.title;

  return (
    <section className="space-y-6 text-[#172554]">
      {/* Header Halaman */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#BFDBFE] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
            {effectiveAssignedOnly ? 'Panitia Penanggung Jawab' : 'Admin & BEM FILKOM'}
          </p>
          <h1 className="mt-1 text-2xl font-extrabold">
            {eventName ? `Template & Sertifikat · ${eventName}` : 'Template & Desain Sertifikat Event'}
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-blue-900">
            {effectiveAssignedOnly
              ? 'Kelola desain template sertifikat dan pantau sertifikat yang diterbitkan untuk event yang ditugaskan kepada Anda.'
              : 'Sesuaikan atau edit kembali desain template sertifikat per event, serta unduh sertifikat resmi peserta.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedTemplate ? (
            <Badge variant="green" dot>
              Template Khusus Aktif
            </Badge>
          ) : (
            <Badge variant="yellow" dot>
              Desain Bawaan Standar
            </Badge>
          )}
        </div>
      </div>

      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Selector Event Khusus: Hanya menampilkan event yang dapat diakses */}
      {effectiveAssignedOnly && accessibleEvents.length === 0 ? (
        <Card className="p-8 text-center text-sm text-slate-600">
          <Award className="mx-auto mb-2 h-10 w-10 text-blue-400" />
          <p className="font-bold text-base text-[#172554]">Belum Ada Event yang Ditugaskan</p>
          <p className="mt-1 text-xs text-slate-500">
            Akun panitia Anda belum ditugaskan untuk mengelola event apapun oleh Admin atau BEM.
          </p>
        </Card>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-white p-4 shadow-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold uppercase text-blue-900">Event yang Dikelola:</span>
              <select
                value={eventId}
                onChange={(e) => {
                  const newId = e.target.value;
                  setEventId(newId);
                  setTemplateDraft({ eventId: newId, value: null });
                  setError('');
                  setSuccess('');
                }}
                className="rounded-xl border border-blue-300 bg-blue-50/60 px-3 py-2 text-sm font-bold text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-md truncate"
              >
                {!effectiveAssignedOnly && (
                  <option value="default">Template Default (Semua Event Umum)</option>
                )}
                {accessibleEvents.map((evt) => {
                  const hasTpl = templates.some((t) => String(t.eventId) === String(evt.id));
                  return (
                    <option key={evt.id} value={evt.id}>
                      {evt.title} {hasTpl ? '✓ (Template Khusus)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {template?.imageDataUrl && (
              <Button size="sm" variant="secondary" icon={Eye} onClick={() => setPreviewOpen(true)}>
                Lihat Pratinjau Penuh
              </Button>
            )}
          </div>

          {loading ? (
            <Card className="p-6 text-sm text-blue-800">Memuat template sertifikat...</Card>
          ) : (
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
              {/* Panel Kontrol & Form Edit */}
              <Card className="space-y-5 p-5 sm:p-6">
                <div className="flex items-center justify-between border-b border-blue-100 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-[#172554]">
                      {selectedTemplate ? 'Edit Desain Template Sertifikat' : 'Unggah & Atur Template Baru'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {eventName ? `Khusus event: ${eventName}` : 'Template umum bawaan sistem'}
                    </p>
                  </div>
                  {selectedTemplate?.updatedAt && (
                    <span className="text-xs text-slate-500 font-medium">
                      Disimpan: {new Date(selectedTemplate.updatedAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                    </span>
                  )}
                </div>

                {/* Unggah atau Ganti Desain */}
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/70 px-5 py-6 text-center transition hover:border-blue-500 hover:bg-blue-50">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm">
                    <Upload className="h-5 w-5" />
                  </span>
                  <span className="mt-3 text-sm font-extrabold text-[#172554]">
                    {template?.fileName ? `Ganti Gambar: ${template.fileName}` : 'Pilih / Unggah Gambar Desain Sertifikat'}
                  </span>
                  <span className="mt-1 text-xs text-slate-600">
                    Format PNG atau JPG (A4 Landscape, maks. 8 MB). Sistem akan mengompres secara otomatis.
                  </span>
                  <input type="file" accept="image/png,image/jpeg" className="sr-only" onChange={(event) => upload(event.target.files?.[0])} />
                </label>

                {/* Slider Pengaturan Posisi & Tampilan Nama */}
                {template?.imageDataUrl ? (
                  <div className="space-y-4 rounded-2xl border border-blue-200 bg-slate-50/50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wide text-blue-900">
                        Posisi & Tampilan Nama Mahasiswa
                      </span>
                      <span className="text-xs text-slate-500">
                        Nama dicetak otomatis dari data mahasiswa.
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span>Posisi Horizontal (X)</span>
                          <span className="font-mono text-blue-700">{template.nameX ?? 50}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="90"
                          value={template.nameX ?? 50}
                          onChange={(event) => setField('nameX', Number(event.target.value))}
                          className="mt-1.5 w-full accent-blue-600 cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span>Posisi Vertikal (Y)</span>
                          <span className="font-mono text-blue-700">{template.nameY ?? 55}%</span>
                        </div>
                        <input
                          type="range"
                          min="15"
                          max="85"
                          value={template.nameY ?? 55}
                          onChange={(event) => setField('nameY', Number(event.target.value))}
                          className="mt-1.5 w-full accent-blue-600 cursor-pointer"
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 pt-1">
                        <div>
                          <div className="flex justify-between text-xs font-bold text-slate-700">
                            <span>Ukuran Font</span>
                            <span className="font-mono text-blue-700">{template.fontSize ?? 28} pt</span>
                          </div>
                          <input
                            type="range"
                            min="14"
                            max="48"
                            value={template.fontSize ?? 28}
                            onChange={(event) => setField('fontSize', Number(event.target.value))}
                            className="mt-1.5 w-full accent-blue-600 cursor-pointer"
                          />
                        </div>

                        <div>
                          <span className="block text-xs font-bold text-slate-700">Warna Nama Mahasiswa</span>
                          <div className="mt-1.5 flex items-center gap-2">
                            <input
                              type="color"
                              value={template.nameColor || '#1e3a8a'}
                              onChange={(event) => setField('nameColor', event.target.value)}
                              className="h-9 w-14 cursor-pointer rounded-lg border border-blue-200 p-0.5 bg-white"
                            />
                            <span className="font-mono text-xs font-semibold text-slate-700">
                              {template.nameColor || '#1e3a8a'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500">
                    Unggah desain gambar untuk membuka slider pengaturan tata letak teks nama.
                  </div>
                )}

                {/* Aksi Tombol Simpan & Hapus */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-blue-100 pt-4">
                  <div>
                    {hasUnsavedChanges && (
                      <Button size="sm" variant="ghost" icon={RotateCcw} onClick={resetChanges}>
                        Batal Perubahan
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate && (
                      <Button variant="danger" icon={Trash2} disabled={saving} onClick={remove}>
                        Hapus Desain Khusus
                      </Button>
                    )}
                    <Button icon={Save} isLoading={saving} disabled={!template?.imageDataUrl} onClick={save}>
                      {selectedTemplate ? 'Simpan Perubahan' : 'Simpan Template'}
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Panel Pratinjau Interaktif */}
              <Card className="flex flex-col justify-between p-5 sm:p-6">
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-extrabold text-[#172554]">
                      <FileImage className="h-4 w-4 text-blue-700" />
                      Pratinjau {eventName ? `· ${eventName}` : '· Default'}
                    </div>
                    {template?.imageDataUrl && (
                      <button
                        type="button"
                        onClick={() => setPreviewOpen(true)}
                        className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                      >
                        Perbesar
                      </button>
                    )}
                  </div>

                  <div
                    onClick={() => template?.imageDataUrl && setPreviewOpen(true)}
                    className={`relative aspect-[297/210] overflow-hidden rounded-xl border border-blue-200 bg-[#EFF6FF] shadow-inner ${
                      template?.imageDataUrl ? 'cursor-pointer group' : ''
                    }`}
                  >
                    {template?.imageDataUrl ? (
                      <>
                        <img
                          src={template.imageDataUrl}
                          alt="Pratinjau template sertifikat"
                          className="absolute inset-0 h-full w-full object-fill transition group-hover:scale-[1.01]"
                        />
                        <div
                          className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-center font-serif font-bold drop-shadow-sm pointer-events-none select-none"
                          style={{
                            left: `${template.nameX ?? 50}%`,
                            top: `${template.nameY ?? 55}%`,
                            color: template.nameColor || '#1e3a8a',
                            fontSize: `clamp(10px, ${Number(template.fontSize ?? 28) / 1.5}px, 28px)`,
                          }}
                        >
                          Nama Mahasiswa Lengkap
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-blue-800">
                        <Award className="h-12 w-12 text-blue-600/70" />
                        <p className="mt-3 text-sm font-bold">Desain Bawaan FILKOM</p>
                        <p className="mt-1 text-xs text-slate-500">
                          Sertifikat akan dicetak menggunakan template standar sistem. Unggah gambar untuk menggantinya dengan desain khusus.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <p className="mt-4 text-xs leading-relaxed text-slate-600 border-t border-blue-100 pt-3">
                  Posisi dan warna teks nama pada pratinjau ini akan menjadi acuan saat PDF sertifikat diterbitkan ke email atau diunduh oleh mahasiswa yang hadir.
                </p>
              </Card>
            </div>
          )}

          {/* Modal Pratinjau Resolusi Penuh */}
          <Modal isOpen={previewOpen} onClose={() => setPreviewOpen(false)} title={`Pratinjau Penuh · ${eventName || 'Template Default'}`} maxWidth="max-w-4xl">
            <div className="space-y-4">
              <div className="relative aspect-[297/210] overflow-hidden rounded-xl border border-blue-200 bg-white shadow-lg">
                {template?.imageDataUrl && (
                  <>
                    <img src={template.imageDataUrl} alt="Template sertifikat penuh" className="h-full w-full object-fill" />
                    <div
                      className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-center font-serif font-bold drop-shadow-md select-none"
                      style={{
                        left: `${template.nameX ?? 50}%`,
                        top: `${template.nameY ?? 55}%`,
                        color: template.nameColor || '#1e3a8a',
                        fontSize: `clamp(14px, ${(Number(template.fontSize ?? 28) * 1.6)}px, 48px)`,
                      }}
                    >
                      Nama Mahasiswa Lengkap
                    </div>
                  </>
                )}
              </div>
              <div className="flex justify-between items-center text-xs text-slate-600">
                <span>File: <strong>{template?.fileName || 'Sertifikat'}</strong></span>
                <span>Warna: <strong className="font-mono">{template?.nameColor || '#1e3a8a'}</strong> &bull; Ukuran: <strong>{template?.fontSize ?? 28} pt</strong></span>
              </div>
            </div>
          </Modal>

          {/* Daftar Sertifikat yang Sudah Terbit Khusus untuk Event ini */}
          {!loading && eventId && eventId !== 'default' && (
            <CertificateManagement refreshKey={certificateRefreshKey} eventId={eventId} />
          )}
        </>
      )}
    </section>
  );
}
