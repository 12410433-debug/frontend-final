import { useState } from 'react';
import {
  QrCode,
  ScanLine,
} from 'lucide-react';
import Card, { CardHeader } from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import EventManagement from '../../components/EventManagement';

export default function CommitteeDashboard() {
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [scanResult, setScanResult] = useState('');
  const [attendanceList, setAttendanceList] = useState([
    {
      ticketCode: 'TECHFEST-2026-001',
      name: 'Mahasiswa FILKOM',
      nim: '10502210001',
      event: 'FILKOM TechFest 2026',
      time: '08:45 WITA',
      status: 'Hadir',
    },
    {
      ticketCode: 'TECHFEST-2026-002',
      name: 'Garry Timothy',
      nim: '10502210045',
      event: 'FILKOM TechFest 2026',
      time: '08:52 WITA',
      status: 'Hadir',
    },
  ]);

  const handleSimulateScan = () => {
    setScanResult('Tiket #TECHFEST-2026-003 valid! Peserta atas nama Brenda Lumintang (NIM: 10502210078) berhasil diabsen.');
    setAttendanceList((prev) => [
      {
        ticketCode: 'TECHFEST-2026-003',
        name: 'Brenda Lumintang',
        nim: '10502210078',
        event: 'FILKOM TechFest 2026',
        time: 'Baru saja',
        status: 'Hadir',
      },
      ...prev,
    ]);
  };

  return (
    <div className="space-y-6 w-full text-[#172554]">
      <EventManagement assignedOnly />
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-2xl border border-[#BFDBFE] shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] mb-2.5">
            Organisasi Mahasiswa &bull; HMP Informatika
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#172554] tracking-tight">
            Panel Operasional Panitia Event
          </h1>
          <p className="text-xs sm:text-sm text-[#1E40AF] font-medium mt-1">
            Kelola pendaftaran peserta, pantau kuota, dan lakukan presensi kehadiran berbasis QR Code.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="md"
            icon={QrCode}
            onClick={() => {
              setScanResult('');
              setIsScanModalOpen(true);
            }}
          >
            Scan Presensi QR
          </Button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-6 bg-white border border-[#BFDBFE]">
          <div className="text-xs font-bold text-[#1E3A8A] uppercase tracking-wider">
            Event Aktif Dikelola
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#2563EB] mt-2">2 Event</div>
          <p className="text-xs text-[#1E40AF] font-bold mt-1">TechFest & Workshop Python</p>
        </Card>

        <Card className="p-6 bg-white border border-[#BFDBFE]">
          <div className="text-xs font-bold text-[#1E3A8A] uppercase tracking-wider">
            Total Pendaftar Terkonfirmasi
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#172554] mt-2">187 Peserta</div>
          <p className="text-xs text-emerald-800 font-bold mt-1">93.5% dari target kuota</p>
        </Card>

        <Card className="p-6 bg-white border border-[#BFDBFE]">
          <div className="text-xs font-bold text-[#1E3A8A] uppercase tracking-wider">
            Presensi Check-In Hari Ini
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#172554] mt-2">{attendanceList.length} Mahasiswa</div>
          <p className="text-xs text-[#1D4ED8] font-bold mt-1">Terverifikasi sistem</p>
        </Card>
      </div>

      {/* Tabel Riwayat Presensi Masuk */}
      <Card className="bg-white border border-[#BFDBFE]">
        <CardHeader className="border-b border-[#BFDBFE]">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#172554]">
              Presensi Peserta Terakhir (Live Check-In)
            </h2>
            <p className="text-xs sm:text-sm text-[#1E40AF] font-medium">
              Data peserta yang telah memindai tiket di meja registrasi.
            </p>
          </div>
          <Badge variant="blue" size="sm">
            Live Monitoring
          </Badge>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-[#172554]">
            <thead className="bg-[#EFF6FF] text-[11px] uppercase tracking-wider text-[#1E3A8A] border-b border-[#BFDBFE] font-extrabold">
              <tr>
                <th className="px-5 py-3.5">Kode Tiket</th>
                <th className="px-5 py-3.5">Nama Mahasiswa</th>
                <th className="px-5 py-3.5">NIM</th>
                <th className="px-5 py-3.5">Kegiatan</th>
                <th className="px-5 py-3.5">Waktu Presensi</th>
                <th className="px-5 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#BFDBFE]">
              {attendanceList.map((row) => (
                <tr key={row.ticketCode} className="hover:bg-[#EFF6FF]/50 transition-colors">
                  <td className="px-5 py-4 font-mono font-bold text-[#1D4ED8]">
                    {row.ticketCode}
                  </td>
                  <td className="px-5 py-4 font-bold text-[#172554]">
                    {row.name}
                  </td>
                  <td className="px-5 py-4 font-medium text-[#1E3A8A]">{row.nim}</td>
                  <td className="px-5 py-4 font-medium text-[#172554]">{row.event}</td>
                  <td className="px-5 py-4 font-medium text-[#1E40AF]">{row.time}</td>
                  <td className="px-5 py-4 text-right">
                    <Badge variant="green" size="sm" dot>
                      {row.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Simulasi Scan Presensi QR */}
      <Modal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        title="Pemindai QR Code Tiket Mahasiswa"
        footer={
          <Button variant="primary" size="sm" onClick={() => setIsScanModalOpen(false)}>
            Tutup Scanner
          </Button>
        }
      >
        <div className="text-center space-y-4 text-[#172554]">
          <div className="w-52 h-52 mx-auto rounded-2xl border-2 border-dashed border-[#2563EB] bg-[#EFF6FF] flex flex-col items-center justify-center p-4">
            <ScanLine className="w-14 h-14 text-[#2563EB] animate-pulse mb-2.5" />
            <p className="text-xs font-bold text-[#1E3A8A]">
              Arahkan kamera ke QR Code tiket peserta
            </p>
          </div>

          <Button variant="primary" size="sm" onClick={handleSimulateScan}>
            Simulasi Scan Tiket Mahasiswa
          </Button>

          {scanResult && (
            <div className="mt-4">
              <Alert type="success" message={scanResult} />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
