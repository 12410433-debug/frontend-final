import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import * as XLSX from 'xlsx';
import { CalendarCheck, Camera, CheckCircle2, Download, Eye, Percent, Trash2, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import attendanceService from '../services/attendanceService';
import certificateService from '../services/certificateService';
import registrationService from '../services/registrationService';
import Alert from './Alert';
import Badge from './Badge';
import Button from './Button';
import Card, { CardHeader } from './Card';
import Modal from './Modal';

function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('id-ID', {
    dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Makassar',
  });
}

export default function AttendanceManagement({ assignedOnly = false, canScan = true }) {
  const { user } = useAuth();
  const userId = user?.id;
  const scannerId = `attendance-qr-reader-${useId().replace(/:/g, '')}`;
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState('');
  const selectedEventId = selectedId || String(events[0]?.id || '');
  const selectedEvent = events.find((event) => String(event.id) === selectedEventId);
  const [participants, setParticipants] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(true);
  const [rosterError, setRosterError] = useState('');
  const [notice, setNotice] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentBusyId, setPaymentBusyId] = useState('');
  const [proofTarget, setProofTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingRegistrationId, setDeletingRegistrationId] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const scannerCallback = useRef(null);
  const scanLock = useRef(false);

  useEffect(() => {
    let active = true;
    attendanceService.getEvents({ organizerId: userId, assignedOnly })
      .then((data) => { if (active) setEvents(data); })
      .catch(() => { if (active) setRosterError('Daftar event absensi gagal dimuat dari JSON Server.'); })
      .finally(() => { if (active) setEventsLoading(false); });
    return () => { active = false; };
  }, [userId, assignedOnly]);

  useEffect(() => {
    if (!selectedEventId) return undefined;
    let active = true;
    attendanceService.getRoster(selectedEventId, { organizerId: userId, assignedOnly })
      .then(({ participants: rows }) => { if (active) setParticipants(rows); })
      .catch((error) => { if (active) setRosterError(error.message || 'Daftar peserta gagal dimuat.'); })
      .finally(() => { if (active) setRosterLoading(false); });
    return () => { active = false; };
  }, [selectedEventId, userId, assignedOnly, refreshKey]);

  const presentCount = useMemo(() => participants.filter((item) => item.status === 'hadir').length, [participants]);
  const absentCount = participants.length - presentCount;
  const attendancePercent = participants.length ? Math.round((presentCount / participants.length) * 100) : 0;

  const processCode = useCallback(async (rawCode) => {
    if (scanLock.current || !selectedEventId || !canScan) return;
    scanLock.current = true;
    setProcessing(true);
    setRosterError('');
    setNotice('');
    try {
      const result = await attendanceService.checkIn(rawCode, selectedEventId, {
        organizerId: userId,
        assignedOnly,
      });
      let certificateNotice = '';
      try {
        const issuedCertificates = await certificateService.issueForEligible(String(result.event.id), userId);
        if (issuedCertificates.issued) certificateNotice = ' ' + issuedCertificates.issued + ' sertifikat otomatis diterbitkan.';
        if (issuedCertificates.emailFailed) setRosterError(issuedCertificates.emailFailed + ' email sertifikat gagal dikirim. Periksa Gmail SMTP.');
      } catch {
        setRosterError('Absensi berhasil disimpan, tetapi sertifikat otomatis gagal diterbitkan. Periksa template lalu coba simpan ulang.');
      }
      setNotice(`${result.student.name} (${result.student.nim || 'NIM tidak tersedia'}) berhasil diabsen untuk ${result.event.title}.${certificateNotice}`);
      setManualCode('');
      setRosterLoading(true);
      setRefreshKey((current) => current + 1);
      setCameraOpen(false);
    } catch (error) {
      setRosterError(error.response?.data?.message || error.message || 'Kode QR gagal divalidasi.');
    } finally {
      setProcessing(false);
      window.setTimeout(() => { scanLock.current = false; }, 900);
    }
  }, [selectedEventId, assignedOnly, canScan, userId]);

  useEffect(() => {
    scannerCallback.current = processCode;
  }, [processCode]);

  useEffect(() => {
    if (!cameraOpen || !selectedEventId) return undefined;
    let active = true;
    let started = false;
    const scanner = new Html5Qrcode(scannerId);
    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1 },
      (decodedText) => scannerCallback.current?.(decodedText),
      () => {},
    ).then(() => {
      started = true;
      if (!active) return scanner.stop().then(() => scanner.clear());
      return undefined;
    }).catch(() => {
      if (active) setCameraError('Kamera tidak dapat dibuka. Izinkan akses kamera atau gunakan input kode manual.');
    });
    return () => {
      active = false;
      if (started) scanner.stop().then(() => scanner.clear()).catch(() => {});
    };
  }, [cameraOpen, selectedEventId, scannerId]);

  const confirmRegistrationPayment = async (registration) => {
    const id = String(registration.id);
    setPaymentBusyId(id);
    setRosterError('');
    setNotice('');
    try {
      const updated = await registrationService.verifyPayment(registration.id, user);
      setParticipants((current) => current.map((item) => String(item.registration.id) === id ? { ...item, registration: updated } : item));
      const emailNotice = updated.emailNotification?.failed
        ? ' Email gagal dikirim kepada ' + updated.emailNotification.failed + ' mahasiswa.'
        : updated.emailNotification?.success && updated.emailNotification.sent
          ? ' Email persetujuan sudah dikirim ke mahasiswa.'
          : updated.emailNotification?.success && updated.emailNotification.skipped
            ? ' Email persetujuan sudah pernah dikirim.'
            : updated.emailNotification?.error
              ? ' Email gagal dikirim: ' + updated.emailNotification.error
              : '';
      setNotice('Pembayaran dikonfirmasi. Kwitansi ' + updated.receiptNumber + ' telah diterbitkan.' + emailNotice);
    } catch (error) {
      setRosterError(error.response?.data?.message || error.response?.data?.error || error.message || 'Pembayaran gagal diverifikasi.');
    } finally {
      setPaymentBusyId('');
    }
  };

  const deleteParticipant = async () => {
    const registration = deleteTarget?.registration;
    if (!registration) return;
    const registrationId = String(registration.id);
    const participantName = deleteTarget.student?.name || 'peserta';
    setDeletingRegistrationId(registrationId);
    setRosterError('');
    setNotice('');
    try {
      const result = await attendanceService.removeParticipant(registration.id, {
        role: user?.role,
        organizerId: userId,
        assignedOnly,
      });
      setParticipants((current) => current.filter((item) => String(item.registration.id) !== registrationId));
      setEvents((current) => current.map((item) => String(item.id) === String(result.event.id) ? result.event : item));
      setNotice('Pendaftaran ' + participantName + ' telah dihapus. Kuota event diperbarui.');
      setDeleteTarget(null);
    } catch (error) {
      setRosterError(error.response?.data?.message || error.response?.data?.error || error.message || 'Pendaftar gagal dihapus.');
      setRosterLoading(true);
      setRefreshKey((current) => current + 1);
    } finally {
      setDeletingRegistrationId('');
    }
  };

  const handleManualSubmit = (event) => {
    event.preventDefault();
    processCode(manualCode);
  };

  const exportRoster = () => {
    if (!selectedEvent) return;
    const rows = participants.map((item) => ({
      'Nama Peserta': item.student?.name || 'Data mahasiswa tidak ditemukan',
      NIM: item.student?.nim || '',
      Event: item.event.title,
      'Biaya Pendaftaran (Rp)': Number(item.registration.registrationFee) || 0,
      'Metode Pembayaran': item.registration.paymentMethod === 'transfer' ? 'Transfer' : item.registration.paymentMethod === 'cash' ? 'Cash' : 'Gratis',
      'Status Pembayaran': item.registration.paymentStatus === 'paid' ? 'Lunas' : item.registration.paymentStatus === 'not_required' ? 'Gratis' : 'Menunggu verifikasi',
      'Nomor Kwitansi': item.registration.receiptNumber || '',
      'Pilihan Makanan': item.registration.mealChoice || '',
      'Ukuran Baju': item.registration.shirtSize || '',
      'Tanggal Event': item.event.date || '',
      Lokasi: item.event.location || '',
      'Tanggal Pendaftaran': item.registration.createdAt || item.registration.registeredAt || '',
      'Waktu Absensi': item.attendanceTime ? formatDateTime(item.attendanceTime) : '',
      'Status Kehadiran': item.status === 'hadir' ? 'Hadir' : 'Belum Hadir',
    }));
    const sheet = XLSX.utils.json_to_sheet(rows);
    sheet['!cols'] = [{ wch: 28 }, { wch: 16 }, { wch: 34 }, { wch: 20 }, { wch: 20 }, { wch: 22 }, { wch: 28 }, { wch: 16 }, { wch: 28 }, { wch: 22 }, { wch: 24 }, { wch: 20 }, { wch: 20 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, 'Rekap Absensi');
    const safeName = selectedEvent.title.replace(/[^a-z0-9-_]/gi, '_').slice(0, 60);
    XLSX.writeFile(workbook, `rekap-absensi-${safeName}.xlsx`);
  };

  return (
    <section id="attendance" className="space-y-5 text-[#172554]">
      <div className="flex flex-col gap-4 rounded-2xl border border-[#BFDBFE] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div><p className="text-xs font-bold uppercase tracking-wide text-blue-700">BEM Fakultas</p><h2 className="mt-1 text-xl font-extrabold">Absensi QR Code</h2><p className="mt-1 text-sm text-blue-900">Pindai peserta, pantau rekap, dan unduh data absensi seluruh event.</p></div>
        <label className="w-full text-xs font-bold sm:max-w-sm">Pilih Event<select value={selectedEventId} onChange={(event) => { setSelectedId(event.target.value); setRosterLoading(true); setRosterError(''); setNotice(''); }} disabled={eventsLoading || events.length === 0} className="mt-1.5 w-full rounded-xl border border-[#BFDBFE] bg-white px-3 py-2.5 text-sm"><option value="">{eventsLoading ? 'Memuat event...' : 'Pilih event'}</option>{events.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}</select></label>
      </div>

      {notice && <Alert type="success" message={notice} onClose={() => setNotice('')} />}
      {rosterError && <Alert type="error" message={rosterError} onClose={() => setRosterError('')} />}

      {canScan && selectedEvent && <div className="flex flex-wrap gap-2"><Button icon={Camera} onClick={() => { setCameraError(''); setCameraOpen(true); }}>Pindai dengan Kamera</Button><span className="self-center text-xs text-slate-600">atau masukkan kode secara manual di panel pemindaian.</span></div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border border-[#BFDBFE] bg-white p-5"><div className="flex items-center justify-between text-xs font-bold uppercase text-blue-900"><span>Total Peserta</span><Users className="h-5 w-5 text-blue-600" /></div><div className="mt-3 text-2xl font-extrabold">{participants.length}</div></Card>
        <Card className="border border-[#BFDBFE] bg-white p-5"><div className="flex items-center justify-between text-xs font-bold uppercase text-blue-900"><span>Jumlah Hadir</span><CheckCircle2 className="h-5 w-5 text-emerald-600" /></div><div className="mt-3 text-2xl font-extrabold">{presentCount}</div></Card>
        <Card className="border border-[#BFDBFE] bg-white p-5"><div className="flex items-center justify-between text-xs font-bold uppercase text-blue-900"><span>Belum Hadir</span><CalendarCheck className="h-5 w-5 text-amber-600" /></div><div className="mt-3 text-2xl font-extrabold">{absentCount}</div></Card>
        <Card className="border border-[#BFDBFE] bg-white p-5"><div className="flex items-center justify-between text-xs font-bold uppercase text-blue-900"><span>Persentase Kehadiran</span><Percent className="h-5 w-5 text-blue-600" /></div><div className="mt-3 text-2xl font-extrabold">{attendancePercent}%</div></Card>
      </div>

      <Card className="overflow-hidden border border-[#BFDBFE] bg-white">
        <CardHeader className="gap-3 border-b border-[#BFDBFE]"><div><h3 className="text-base font-extrabold">Daftar Absensi {selectedEvent ? `· ${selectedEvent.title}` : ''}</h3><p className="mt-1 text-xs text-blue-800">Peserta diambil dari pendaftaran event yang dipilih.</p></div><Button size="sm" variant="secondary" icon={Download} disabled={!selectedEvent || rosterLoading || participants.length === 0} onClick={exportRoster}>Unduh Excel</Button></CardHeader>
        {eventsLoading || (selectedEvent && rosterLoading) ? <p className="p-8 text-center text-sm text-blue-800">Memuat absensi...</p> : !selectedEvent ? <p className="p-8 text-center text-sm text-slate-600">{assignedOnly ? 'Belum ada event yang ditugaskan ke akun panitia ini.' : 'Pilih event untuk melihat absensi.'}</p> : participants.length === 0 ? <p className="p-8 text-center text-sm text-slate-600">Belum ada peserta terdaftar pada event ini.</p> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[1320px] text-left text-sm">
            <thead className="bg-[#EFF6FF] text-xs uppercase tracking-wide text-[#1E3A8A]"><tr><th className="px-5 py-3">Nama Peserta</th><th className="px-4 py-3">NIM</th><th className="px-4 py-3">Nama Event</th><th className="px-4 py-3">Pembayaran</th><th className="px-4 py-3">Bukti</th><th className="px-4 py-3">Kwitansi</th><th className="px-4 py-3">Waktu Absensi</th><th className="px-4 py-3">Status Kehadiran</th><th className="px-4 py-3 text-right">Aksi</th></tr></thead>
            <tbody className="divide-y divide-blue-100">{participants.map((item) => <tr key={item.registration.id}>
              <td className="px-5 py-4 font-bold">{item.student?.name || 'Data mahasiswa tidak ditemukan'}</td><td className="px-4 py-4">{item.student?.nim || '—'}</td><td className="px-4 py-4">{item.event.title}</td>
              <td className="px-4 py-4"><div className="space-y-1"><Badge variant={item.registration.paymentStatus === 'paid' ? 'green' : Number(item.registration.registrationFee) > 0 ? 'yellow' : 'gray'} size="sm" dot>{Number(item.registration.registrationFee) > 0 ? item.registration.paymentStatus === 'paid' ? 'Lunas' : 'Menunggu' : 'Gratis'}</Badge>{Number(item.registration.registrationFee) > 0 && <p className="text-xs text-slate-600">{item.registration.paymentMethod === 'transfer' ? 'Transfer' : 'Cash'} · Rp {new Intl.NumberFormat('id-ID').format(Number(item.registration.registrationFee) || 0)}</p>}</div></td>
              <td className="px-4 py-4">{item.registration.paymentMethod === 'transfer' && item.registration.paymentProof ? <Button size="sm" variant="secondary" icon={Eye} onClick={() => setProofTarget(item.registration)}>Lihat Bukti</Button> : <span className="text-xs text-slate-500">—</span>}</td>
              <td className="px-4 py-4">{item.registration.receiptNumber ? <div className="space-y-1"><Badge variant="green" size="sm">Terbit</Badge><p className="text-xs font-semibold">{item.registration.receiptNumber}</p></div> : Number(item.registration.registrationFee) > 0 ? <Button size="sm" isLoading={paymentBusyId === String(item.registration.id)} disabled={!!paymentBusyId || item.registration.paymentStatus !== 'pending'} onClick={() => confirmRegistrationPayment(item.registration)}>Konfirmasi bayar</Button> : <span className="text-xs text-slate-500">Tidak diperlukan</span>}</td><td className="px-4 py-4">{formatDateTime(item.attendanceTime)}</td><td className="px-4 py-4"><Badge variant={item.status === 'hadir' ? 'green' : 'yellow'} size="sm" dot>{item.status === 'hadir' ? 'Hadir' : 'Belum Hadir'}</Badge></td><td className="px-4 py-4 text-right"><Button size="sm" variant="danger" icon={Trash2} disabled={!!deletingRegistrationId || !['admin', 'bem'].includes(user?.role)} onClick={() => setDeleteTarget(item)}>Hapus</Button></td>
            </tr>)}</tbody>
          </table></div>
        )}
      </Card>

      <Modal isOpen={!!deleteTarget} onClose={() => { if (!deletingRegistrationId) setDeleteTarget(null); }} title="Hapus Pendaftaran" maxWidth="max-w-lg" footer={<><Button variant="ghost" disabled={!!deletingRegistrationId} onClick={() => setDeleteTarget(null)}>Batal</Button><Button variant="danger" isLoading={!!deletingRegistrationId} onClick={deleteParticipant}>Hapus pendaftar</Button></>}>
        <p className="text-sm leading-relaxed text-slate-700">Hapus pendaftaran <strong>{deleteTarget?.student?.name || 'peserta ini'}</strong> pada event <strong>{deleteTarget?.event?.title || selectedEvent?.title}</strong>? Data absensi dan sertifikat terkait juga akan dihapus, lalu kuota event diperbarui.</p>
      </Modal>

      <Modal isOpen={!!proofTarget} onClose={() => setProofTarget(null)} title="Bukti Transfer" maxWidth="max-w-3xl">
        {proofTarget?.paymentProof?.startsWith('data:application/pdf') ? <iframe title="Bukti transfer PDF" src={proofTarget.paymentProof} className="h-[70vh] w-full rounded-xl border border-blue-100" /> : proofTarget?.paymentProof ? <img src={proofTarget.paymentProof} alt="Bukti transfer pendaftaran" className="mx-auto max-h-[70vh] max-w-full rounded-xl border border-blue-100 object-contain" /> : <p className="text-sm text-slate-600">Bukti pembayaran tidak tersedia.</p>}
      </Modal>

      <Modal isOpen={cameraOpen} onClose={() => setCameraOpen(false)} title={`Pindai QR · ${selectedEvent?.title || ''}`} maxWidth="max-w-2xl">
        <div className="space-y-4">
          <div id={scannerId} className="min-h-24 overflow-hidden rounded-xl border border-blue-100 bg-white" />
          {cameraError && <Alert type="error" message={cameraError} />}
          <div className="flex items-center gap-3"><span className="h-px flex-1 bg-blue-100" /><span className="text-xs font-semibold text-slate-500">INPUT MANUAL</span><span className="h-px flex-1 bg-blue-100" /></div>
          <form onSubmit={handleManualSubmit} className="flex flex-col gap-2 sm:flex-row"><input value={manualCode} onChange={(event) => setManualCode(event.target.value)} required autoComplete="off" placeholder="Masukkan kode pendaftaran dari QR..." className="min-w-0 flex-1 rounded-xl border border-[#BFDBFE] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /><Button type="submit" isLoading={processing}>Validasi & Absen</Button></form>
        </div>
      </Modal>
    </section>
  );
}
