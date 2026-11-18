import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import * as XLSX from 'xlsx';
import { CalendarCheck, Camera, CheckCircle2, Clock, Download, Eye, Percent, Trash2, Users } from 'lucide-react';
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

export default function AttendanceManagement({ assignedOnly = false, canScan = true, initialEventId = '' }) {
  const { user } = useAuth();
  const userId = user?.id;
  const scannerId = `attendance-qr-reader-${useId().replace(/:/g, '')}`;
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(initialEventId ? String(initialEventId) : '');
  const [prevInitialId, setPrevInitialId] = useState(initialEventId);
  if (initialEventId !== prevInitialId) {
    setPrevInitialId(initialEventId);
    setSelectedId(initialEventId ? String(initialEventId) : '');
  }
  const selectedEventId = selectedId || (initialEventId ? String(initialEventId) : String(events[0]?.id || ''));
  const selectedEvent = events.find((event) => String(event.id) === selectedEventId);
  const [participants, setParticipants] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(true);
  const [rosterError, setRosterError] = useState('');
  const [notice, setNotice] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [checkInStatus, setCheckInStatus] = useState('hadir');
  const [updatingStatusId, setUpdatingStatusId] = useState('');
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
      .then((data) => {
        if (active) {
          setEvents(data);
          if (initialEventId) {
            setSelectedId(String(initialEventId));
          } else if (data.length > 0) {
            setSelectedId((curr) => curr || String(data[0].id));
          }
        }
      })
      .catch(() => { if (active) setRosterError('Daftar event absensi gagal dimuat dari JSON Server.'); })
      .finally(() => { if (active) setEventsLoading(false); });
    return () => { active = false; };
  }, [userId, assignedOnly, initialEventId]);

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
  const lateCount = useMemo(() => participants.filter((item) => item.status === 'terlambat').length, [participants]);
  const absentCount = useMemo(() => participants.filter((item) => item.status === 'belum_hadir' || !item.status).length, [participants]);
  const totalAttended = presentCount + lateCount;
  const attendancePercent = participants.length ? Math.round((totalAttended / participants.length) * 100) : 0;

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
        status: checkInStatus,
      });
      let certificateNotice = '';
      try {
        const issuedCertificates = await certificateService.issueForEligible(String(result.event.id), userId);
        if (issuedCertificates.issued) certificateNotice = ' ' + issuedCertificates.issued + ' sertifikat otomatis diterbitkan.';
        if (issuedCertificates.emailFailed) setRosterError(issuedCertificates.emailFailed + ' email sertifikat gagal dikirim. Periksa Gmail SMTP.');
      } catch {
        setRosterError('Absensi berhasil disimpan, tetapi sertifikat otomatis gagal diterbitkan. Periksa template lalu coba simpan ulang.');
      }
      const statusLabel = checkInStatus === 'terlambat' ? 'Terlambat' : 'Hadir';
      setNotice(`${result.student.name} (${result.student.nim || 'NIM tidak tersedia'}) berhasil dicatat sebagai ${statusLabel} untuk ${result.event.title}.${certificateNotice}`);
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
  }, [selectedEventId, assignedOnly, canScan, userId, checkInStatus]);

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

  const handleStatusChange = async (participant, newStatus) => {
    if (!participant?.registration?.id || participant.status === newStatus) return;
    const regId = String(participant.registration.id);
    setUpdatingStatusId(regId);
    setRosterError('');
    setNotice('');
    try {
      await attendanceService.updateStatus(regId, newStatus, {
        organizerId: userId,
        assignedOnly,
      });

      let certificateNotice = '';
      if (newStatus === 'hadir' || newStatus === 'terlambat') {
        try {
          const issuedCertificates = await certificateService.issueForEligible(String(participant.event.id), userId);
          if (issuedCertificates.issued) certificateNotice = ' ' + issuedCertificates.issued + ' sertifikat otomatis diterbitkan.';
          if (issuedCertificates.emailFailed) setRosterError(issuedCertificates.emailFailed + ' email sertifikat gagal dikirim. Periksa Gmail SMTP.');
        } catch {
          // non-blocking
        }
      }

      setParticipants((current) => current.map((item) => {
        if (String(item.registration.id) !== regId) return item;
        return {
          ...item,
          status: newStatus,
          attendanceTime: newStatus === 'belum_hadir' ? null : (item.attendanceTime || new Date().toISOString()),
        };
      }));

      const statusLabel = newStatus === 'hadir' ? 'Hadir' : newStatus === 'terlambat' ? 'Terlambat' : 'Belum / Tidak Hadir';
      setNotice(`Status absensi ${participant.student?.name || 'peserta'} berhasil diubah menjadi "${statusLabel}".${certificateNotice}`);
    } catch (error) {
      setRosterError(error.response?.data?.message || error.message || 'Gagal mengubah status absensi.');
    } finally {
      setUpdatingStatusId('');
    }
  };

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
      'Status Kehadiran': item.status === 'hadir' ? 'Hadir' : item.status === 'terlambat' ? 'Terlambat' : 'Belum Hadir',
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
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-blue-700">BEM Fakultas</p>
          <h2 className="mt-1 text-xl font-extrabold">Absensi QR Code</h2>
          <p className="mt-1 text-sm text-blue-900">
            {selectedEvent
              ? `Pindai peserta, pantau rekap, dan unduh data absensi untuk event ${selectedEvent.title}.`
              : 'Pindai peserta, pantau rekap, dan unduh data absensi event.'}
          </p>
        </div>
      </div>

      {notice && <Alert type="success" message={notice} onClose={() => setNotice('')} />}
      {rosterError && <Alert type="error" message={rosterError} onClose={() => setRosterError('')} />}

      {canScan && selectedEvent && (
        <div className="flex flex-col gap-3 rounded-2xl border border-[#BFDBFE] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Button icon={Camera} onClick={() => { setCameraError(''); setCameraOpen(true); }}>
              Pindai dengan Kamera
            </Button>
            <span className="self-center text-xs text-slate-600">
              atau masukkan kode secara manual di panel pemindaian.
            </span>
          </div>

          <div className="flex items-center gap-1.5 self-start rounded-xl bg-blue-50/90 p-1 border border-blue-200 text-xs font-semibold sm:self-auto">
            <span className="px-2 text-slate-600 hidden sm:inline">Status Scan:</span>
            <button
              type="button"
              onClick={() => setCheckInStatus('hadir')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                checkInStatus === 'hadir'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-white'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              Hadir (Tepat)
            </button>
            <button
              type="button"
              onClick={() => setCheckInStatus('terlambat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                checkInStatus === 'terlambat'
                  ? 'bg-amber-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-amber-700 hover:bg-white'
              }`}
            >
              <Clock className="h-4 w-4" />
              Terlambat (Late)
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
        <Card className="border border-[#BFDBFE] bg-white p-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-blue-900">
            <span>Total Peserta</span>
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold">{participants.length}</div>
        </Card>

        <Card className="border border-[#BFDBFE] bg-white p-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-emerald-800">
            <span>Hadir (Tepat)</span>
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-600">{presentCount}</div>
        </Card>

        <Card className="border border-[#BFDBFE] bg-white p-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-amber-800">
            <span>Terlambat</span>
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-amber-600">{lateCount}</div>
        </Card>

        <Card className="border border-[#BFDBFE] bg-white p-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-700">
            <span>Belum Hadir</span>
            <CalendarCheck className="h-5 w-5 text-slate-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-600">{absentCount}</div>
        </Card>

        <Card className="col-span-2 sm:col-span-1 border border-[#BFDBFE] bg-white p-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-blue-900">
            <span>Persentase</span>
            <Percent className="h-5 w-5 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-blue-600">{attendancePercent}%</div>
        </Card>
      </div>

      <Card className="overflow-hidden border border-[#BFDBFE] bg-white">
        <CardHeader className="gap-3 border-b border-[#BFDBFE]">
          <div>
            <h3 className="text-base font-extrabold">Daftar Absensi {selectedEvent ? `· ${selectedEvent.title}` : ''}</h3>
            <p className="mt-1 text-xs text-blue-800">Peserta diambil dari pendaftaran event yang dipilih.</p>
          </div>
          <Button size="sm" variant="secondary" icon={Download} disabled={!selectedEvent || rosterLoading || participants.length === 0} onClick={exportRoster}>
            Unduh Excel
          </Button>
        </CardHeader>
        {eventsLoading || (selectedEvent && rosterLoading) ? (
          <p className="p-8 text-center text-sm text-blue-800">Memuat absensi...</p>
        ) : !selectedEvent ? (
          <p className="p-8 text-center text-sm text-slate-600">{assignedOnly ? 'Belum ada event yang ditugaskan ke akun panitia ini.' : 'Pilih event untuk melihat absensi.'}</p>
        ) : participants.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-600">Belum ada peserta terdaftar pada event ini.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1340px] text-left text-sm">
              <thead className="bg-[#EFF6FF] text-xs uppercase tracking-wide text-[#1E3A8A]">
                <tr>
                  <th className="px-5 py-3">Nama Peserta</th>
                  <th className="px-4 py-3">NIM</th>
                  <th className="px-4 py-3">Nama Event</th>
                  <th className="px-4 py-3">Pembayaran</th>
                  <th className="px-4 py-3">Bukti</th>
                  <th className="px-4 py-3">Kwitansi</th>
                  <th className="px-4 py-3">Waktu Absensi</th>
                  <th className="px-4 py-3">Status Kehadiran</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                {participants.map((item) => (
                  <tr key={item.registration.id}>
                    <td className="px-5 py-4 font-bold">{item.student?.name || 'Data mahasiswa tidak ditemukan'}</td>
                    <td className="px-4 py-4">{item.student?.nim || '—'}</td>
                    <td className="px-4 py-4">{item.event.title}</td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <Badge variant={item.registration.paymentStatus === 'paid' ? 'green' : Number(item.registration.registrationFee) > 0 ? 'yellow' : 'gray'} size="sm" dot>
                          {Number(item.registration.registrationFee) > 0 ? (item.registration.paymentStatus === 'paid' ? 'Lunas' : 'Menunggu') : 'Gratis'}
                        </Badge>
                        {Number(item.registration.registrationFee) > 0 && (
                          <p className="text-xs text-slate-600">
                            {item.registration.paymentMethod === 'transfer' ? 'Transfer' : 'Cash'} · Rp {new Intl.NumberFormat('id-ID').format(Number(item.registration.registrationFee) || 0)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {item.registration.paymentMethod === 'transfer' && item.registration.paymentProof ? (
                        <Button size="sm" variant="secondary" icon={Eye} onClick={() => setProofTarget(item.registration)}>
                          Lihat Bukti
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {item.registration.receiptNumber ? (
                        <div className="space-y-1">
                          <Badge variant="green" size="sm">Terbit</Badge>
                          <p className="text-xs font-semibold">{item.registration.receiptNumber}</p>
                        </div>
                      ) : Number(item.registration.registrationFee) > 0 ? (
                        <Button size="sm" isLoading={paymentBusyId === String(item.registration.id)} disabled={!!paymentBusyId || item.registration.paymentStatus !== 'pending'} onClick={() => confirmRegistrationPayment(item.registration)}>
                          Konfirmasi bayar
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-500">Tidak diperlukan</span>
                      )}
                    </td>
                    <td className="px-4 py-4">{formatDateTime(item.attendanceTime)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={item.status || 'belum_hadir'}
                          disabled={updatingStatusId === String(item.registration.id)}
                          onChange={(e) => handleStatusChange(item, e.target.value)}
                          className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                            item.status === 'hadir'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                              : item.status === 'terlambat'
                              ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                              : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          <option value="hadir">✓ Hadir</option>
                          <option value="terlambat">⏱ Terlambat</option>
                          <option value="belum_hadir">○ Belum / Tidak Hadir</option>
                        </select>
                        {updatingStatusId === String(item.registration.id) && (
                          <span className="text-[11px] font-semibold text-blue-600 animate-pulse">Menyimpan...</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button size="sm" variant="danger" icon={Trash2} disabled={!!deletingRegistrationId || !['admin', 'bem'].includes(user?.role)} onClick={() => setDeleteTarget(item)}>
                        Hapus
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
          <div className="flex items-center justify-between rounded-xl bg-blue-50 p-2.5 border border-blue-200">
            <span className="text-xs font-bold text-blue-900">Tandai Kehadiran Sebagai:</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setCheckInStatus('hadir')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  checkInStatus === 'hadir'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                Hadir
              </button>
              <button
                type="button"
                onClick={() => setCheckInStatus('terlambat')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  checkInStatus === 'terlambat'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Clock className="h-4 w-4" />
                Terlambat
              </button>
            </div>
          </div>
          <div id={scannerId} className="min-h-24 overflow-hidden rounded-xl border border-blue-100 bg-white" />
          {cameraError && <Alert type="error" message={cameraError} />}
          <div className="flex items-center gap-3"><span className="h-px flex-1 bg-blue-100" /><span className="text-xs font-semibold text-slate-500">INPUT MANUAL</span><span className="h-px flex-1 bg-blue-100" /></div>
          <form onSubmit={handleManualSubmit} className="flex flex-col gap-2 sm:flex-row">
            <input
              value={manualCode}
              onChange={(event) => setManualCode(event.target.value)}
              required
              autoComplete="off"
              placeholder="Masukkan kode pendaftaran dari QR..."
              className="min-w-0 flex-1 rounded-xl border border-[#BFDBFE] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button type="submit" isLoading={processing}>
              Validasi & Absen ({checkInStatus === 'terlambat' ? 'Terlambat' : 'Hadir'})
            </Button>
          </form>
        </div>
      </Modal>
    </section>
  );
}
