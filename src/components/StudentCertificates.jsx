import { useEffect, useState } from 'react';
import { Award, Download } from 'lucide-react';
import certificateService from '../services/certificateService';
import { downloadCertificatePdf } from '../utils/certificatePdf';
import Alert from './Alert';
import Badge from './Badge';
import Button from './Button';
import Card from './Card';

function eventDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Makassar',
  });
}

function issuedDate(value) {
  if (!value) return 'Belum diterbitkan';
  return new Date(value).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Makassar',
  });
}

export default function StudentCertificates({ studentId }) {
  const [eligible, setEligible] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!studentId) return undefined;
    let active = true;
    certificateService.getForStudent(studentId)
      .then((data) => { if (active) setEligible(data); })
      .catch(() => { if (active) setError('Daftar sertifikat gagal dimuat dari JSON Server.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [studentId]);

  const handleDownload = async (item) => {
    setBusyId(item.registration.id);
    setError('');
    setSuccess('');
    try {
      const certificate = await certificateService.issueForStudent(studentId, item.registration.id);
      setEligible((current) => current.map((row) => String(row.registration.id) === String(item.registration.id)
        ? { ...row, certificate }
        : row));
      downloadCertificatePdf(certificate);
      if (certificate.emailNotification?.failed || certificate.emailNotification?.success === false) {
        setError('Sertifikat berhasil diunduh, tetapi email notifikasi gagal: ' + (certificate.emailNotification.error || 'periksa Gmail SMTP.'));
      } else {
        setSuccess(item.certificate ? 'Sertifikat berhasil diunduh.' : 'Sertifikat berhasil diterbitkan dan diunduh. Notifikasi email diproses.');
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Sertifikat gagal diterbitkan. Pastikan absensi berstatus Hadir.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section id="certificates" className="space-y-5 border-t border-[#BFDBFE] pt-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-blue-700">Dokumen Akademik</p>
        <h2 className="mt-1 text-xl font-extrabold text-[#172554]">Sertifikat Saya</h2>
        <p className="mt-1 text-sm text-blue-900">Sertifikat tersedia hanya untuk pendaftaran dengan absensi Hadir.</p>
      </div>
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {loading ? <Card className="p-6 text-sm text-blue-800">Memuat sertifikat...</Card> : eligible.length === 0 ? (
        <Card className="p-6 text-sm text-slate-600">Belum ada sertifikat. Sertifikat dapat diterbitkan setelah absensi event tercatat Hadir.</Card>
      ) : <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {eligible.map((item) => <Card key={item.registration.id} className="border border-[#BFDBFE] bg-white p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div className="flex gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Award className="h-6 w-6" /></div><div><Badge variant="green" size="sm" dot>Hadir</Badge><h3 className="mt-2 font-extrabold text-[#172554]">{item.event.title}</h3><p className="mt-1 text-xs text-slate-600">{eventDate(item.event.date)} · {item.event.location}</p>{item.certificate && <p className="mt-2 text-xs font-semibold text-blue-800">No. {item.certificate.certificateNumber} · Terbit {issuedDate(item.certificate.issuedAt)}</p>}</div></div>
            <Button icon={Download} isLoading={busyId === item.registration.id} disabled={!!busyId} onClick={() => handleDownload(item)}>{item.certificate ? 'Unduh PDF' : 'Terbitkan & Unduh'}</Button>
          </div>
        </Card>)}
      </div>}
    </section>
  );
}
