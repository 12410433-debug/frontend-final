import { useEffect, useMemo, useState } from 'react';
import { Award, Search } from 'lucide-react';
import certificateService from '../services/certificateService';
import Alert from './Alert';
import Badge from './Badge';
import Card, { CardHeader } from './Card';

function dateLabel(value) {
  if (!value) return '—';
  return new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Makassar',
  });
}

export default function CertificateManagement({ refreshKey = 0 }) {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;
    certificateService.getAllIssued()
      .then((data) => { if (active) setCertificates(data); })
      .catch(() => { if (active) setError('Sertifikat gagal dimuat dari JSON Server.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [refreshKey]);

  const visible = useMemo(() => certificates.filter(({ certificate, student, event }) => {
    const query = search.trim().toLowerCase();
    return !query || student.name.toLowerCase().includes(query)
      || student.nim?.toLowerCase().includes(query)
      || event.title.toLowerCase().includes(query)
      || certificate.certificateNumber.toLowerCase().includes(query);
  }), [certificates, search]);

  return (
    <section id="certificates" className="space-y-5 text-[#172554]">
      <div><p className="text-xs font-bold uppercase tracking-wide text-blue-700">BEM Fakultas</p><h2 className="mt-1 text-xl font-extrabold">Sertifikat Digital</h2><p className="mt-1 text-sm text-blue-900">Daftar sertifikat yang diterbitkan untuk peserta dengan absensi Hadir.</p></div>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      <Card className="overflow-hidden border border-[#BFDBFE] bg-white">
        <CardHeader className="flex-col items-stretch gap-3 border-b border-[#BFDBFE] sm:flex-row sm:items-center"><div className="flex items-center gap-2 font-bold"><Award className="h-5 w-5 text-blue-700" />{certificates.length} Sertifikat Terbit</div><div className="relative min-w-0 flex-1 sm:max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-800" /><input aria-label="Cari sertifikat" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari mahasiswa, NIM, event, nomor..." className="w-full rounded-xl border border-[#BFDBFE] bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div></CardHeader>
        {loading ? <p className="p-8 text-center text-sm text-blue-800">Memuat sertifikat...</p> : visible.length === 0 ? <div className="p-10 text-center text-sm text-slate-600">{certificates.length ? 'Tidak ada sertifikat yang cocok dengan pencarian.' : 'Belum ada sertifikat valid yang diterbitkan.'}</div> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-[#EFF6FF] text-xs uppercase tracking-wide text-[#1E3A8A]"><tr><th className="px-5 py-3">Mahasiswa</th><th className="px-4 py-3">Event</th><th className="px-4 py-3">Tanggal Event</th><th className="px-4 py-3">Nomor Sertifikat</th><th className="px-4 py-3">Tanggal Terbit</th><th className="px-4 py-3">Validasi</th></tr></thead>
            <tbody className="divide-y divide-blue-100">{visible.map(({ certificate, student, event }) => <tr key={certificate.id}>
              <td className="px-5 py-4"><p className="font-bold">{student.name}</p><p className="text-xs text-slate-500">{student.nim}</p></td><td className="px-4 py-4">{event.title}</td><td className="px-4 py-4">{dateLabel(event.date)}</td><td className="px-4 py-4 font-mono text-xs font-bold">{certificate.certificateNumber}</td><td className="px-4 py-4">{new Date(certificate.issuedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Makassar' })}</td><td className="px-4 py-4"><Badge variant="green" size="sm" dot>Hadir</Badge></td>
            </tr>)}</tbody>
          </table></div>
        )}
      </Card>
    </section>
  );
}
