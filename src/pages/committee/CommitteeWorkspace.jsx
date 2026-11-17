import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, ClipboardCheck, PlusCircle, QrCode, Sparkles } from 'lucide-react';
import EventManagement from '../../components/EventManagement';
import AttendanceManagement from '../../components/AttendanceManagement';

const modules = [
  { title: 'Event Kelolaan', description: 'Kelola detail dan status event yang ditugaskan kepada Anda.', path: '/committee/events', icon: CalendarDays, color: 'from-blue-600 to-indigo-600', detail: 'Event khusus penugasan Anda' },
  { title: 'Scan & Presensi', description: 'Validasi tiket peserta dan pantau kehadiran secara langsung.', path: '/committee/attendance', icon: QrCode, color: 'from-cyan-500 to-blue-600', detail: 'QR · Kode manual · Ringkasan' },
];

export default function CommitteeWorkspace() {
  const location = useLocation();
  const view = location.pathname.split('/')[2] || 'overview';
  if (view === 'events') return <EventManagement assignedOnly />;
  if (view === 'attendance') return <AttendanceManagement assignedOnly />;

  return (
    <div className="space-y-7 text-[#172554]">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#172554] via-blue-700 to-cyan-600 p-7 text-white shadow-xl shadow-blue-200 sm:p-9">
        <div className="pointer-events-none absolute -right-10 -top-12 h-52 w-52 rounded-full bg-cyan-200/20 blur-3xl" />
        <div className="relative"><span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold"><Sparkles className="h-3.5 w-3.5 text-amber-300" />Ruang kerja panitia</span><h1 className="mt-4 text-2xl font-extrabold sm:text-3xl">Dashboard Panitia</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-blue-100">Fokus pada event yang ditugaskan kepada Anda dan kelola proses kehadiran peserta.</p></div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2">
        {modules.map(({ title, description, path, icon: Icon, color, detail }) => <Link key={path} to={path} className="group rounded-3xl border border-blue-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-100/70 sm:p-6">
          <div className="flex items-start justify-between"><span className={'flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ' + color + ' text-white shadow-lg'}><Icon className="h-5 w-5" /></span><ArrowUpRight className="h-5 w-5 text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-700" /></div>
          <h2 className="mt-5 text-lg font-extrabold">{title}</h2><p className="mt-1 text-sm leading-relaxed text-slate-600">{description}</p><p className="mt-4 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-700">{path.endsWith('events') ? <PlusCircle className="h-3.5 w-3.5" /> : <ClipboardCheck className="h-3.5 w-3.5" />}{detail}</p>
        </Link>)}
      </section>
    </div>
  );
}