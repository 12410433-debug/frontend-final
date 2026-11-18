import { useEffect, useMemo, useState } from 'react';
import { Award, Download, Search } from 'lucide-react';
import certificateService from '../services/certificateService';
import certificateTemplateService from '../services/certificateTemplateService';
import { downloadCertificatePdf } from '../utils/certificatePdf';
import Alert from './Alert';
import Badge from './Badge';
import Button from './Button';
import Card, { CardHeader } from './Card';

function dateLabel(value) {
  if (!value) return '—';
  return new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Makassar',
  });
}

export default function CertificateManagement({ refreshKey = 0, eventId = '' }) {
  const [certificates, setCertificates] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      certificateService.getAllIssued(),
      certificateTemplateService.list(),
    ])
      .then(([certData, tplData]) => {
        if (!active) return;
        setCertificates(certData || []);
        setTemplates(tplData || []);
      })
      .catch(() => { if (active) setError('Sertifikat gagal dimuat dari JSON Server.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [refreshKey]);

  const visible = useMemo(() => certificates.filter(({ certificate, student, event }) => {
    if (eventId && eventId !== 'default' && String(event?.id) !== String(eventId)) {
      return false;
    }
    const query = search.trim().toLowerCase();
    return !query || student.name.toLowerCase().includes(query)
      || student.nim?.toLowerCase().includes(query)
      || event.title.toLowerCase().includes(query)
      || certificate.certificateNumber.toLowerCase().includes(query);
  }), [certificates, search, eventId]);

  const handleDownload = (certItem) => {
    try {
      const { certificate, student, event } = certItem;
      const tpl = templates.find((t) => String(t.eventId || '') === String(event?.id))
        || templates.find((t) => !t.eventId)
        || null;
      downloadCertificatePdf({ ...certificate, student, event, template: tpl });
    } catch (downloadErr) {
      setError(downloadErr.message || 'Gagal mengunduh file PDF sertifikat.');
    }
  };

  return (
    <section id="certificates" className="space-y-5 text-[#172554]">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-blue-700">Daftar Penerbitan</p>
        <h2 className="mt-1 text-xl font-extrabold">Sertifikat Digital Terbit</h2>
        <p className="mt-1 text-sm text-blue-900">
          Daftar sertifikat resmi yang telah diterbitkan untuk peserta dengan absensi Hadir / Terlambat.
        </p>
      </div>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      <Card className="overflow-hidden border border-[#BFDBFE] bg-white">
        <CardHeader className="flex-col items-stretch gap-3 border-b border-[#BFDBFE] sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 font-bold">
            <Award className="h-5 w-5 text-blue-700" />
            {visible.length} Sertifikat Terbit
          </div>
          <div className="relative min-w-0 flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-800" />
            <input
              aria-label="Cari sertifikat"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari mahasiswa, NIM, event, nomor..."
              className="w-full rounded-xl border border-[#BFDBFE] bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </CardHeader>
        {loading ? (
          <p className="p-8 text-center text-sm text-blue-800">Memuat sertifikat...</p>
        ) : visible.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-600">
            {certificates.length ? 'Tidak ada sertifikat yang cocok dengan pencarian.' : 'Belum ada sertifikat valid yang diterbitkan untuk event ini.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-[#EFF6FF] text-xs uppercase tracking-wide text-[#1E3A8A]">
                <tr>
                  <th className="px-5 py-3">Mahasiswa</th>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Tanggal Event</th>
                  <th className="px-4 py-3">Nomor Sertifikat</th>
                  <th className="px-4 py-3">Tanggal Terbit</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                {visible.map((item) => {
                  const { certificate, student, event } = item;
                  return (
                    <tr key={certificate.id} className="hover:bg-blue-50/50">
                      <td className="px-5 py-4">
                        <p className="font-bold text-blue-950">{student.name}</p>
                        <p className="text-xs text-slate-500">{student.nim}</p>
                      </td>
                      <td className="px-4 py-4 font-medium">{event.title}</td>
                      <td className="px-4 py-4">{dateLabel(event.date)}</td>
                      <td className="px-4 py-4 font-mono text-xs font-bold text-blue-800">{certificate.certificateNumber}</td>
                      <td className="px-4 py-4 text-xs text-slate-600">
                        {new Date(certificate.issuedAt).toLocaleDateString('id-ID', {
                          day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Makassar',
                        })}
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="green" size="sm" dot>Hadir</Badge>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={Download}
                          onClick={() => handleDownload(item)}
                        >
                          Unduh PDF
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </section>
  );
}
