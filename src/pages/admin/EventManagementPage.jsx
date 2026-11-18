import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, Bell, CalendarDays, Sparkles, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import EventManagement from '../../components/EventManagement';
import AnnouncementManagement from '../../components/AnnouncementManagement';
import AttendanceManagement from '../../components/AttendanceManagement';
import CertificateTemplateManagement from '../../components/CertificateTemplateManagement';
import UserManagement from '../../components/UserManagement';

function dashboardModules(basePath, isAdmin) {
  return [
    {
      title: 'Kelola Event',
      description: 'Kelola seluruh kegiatan FILKOM lengkap dengan daftar peserta, absensi QR code, dan sertifikat.',
      path: `${basePath}/events`,
      icon: CalendarDays,
      color: 'from-blue-600 to-indigo-600',
      detail: 'Event · Peserta & Absensi · Sertifikat',
    },
    {
      title: 'Pengumuman',
      description: 'Sampaikan informasi umum atau pengumuman khusus event kegiatan.',
      path: `${basePath}/announcements`,
      icon: Bell,
      color: 'from-cyan-500 to-blue-600',
      detail: 'Draft · Publikasi · Pin',
    },
    ...(isAdmin
      ? [{
          title: 'Kelola Pengguna',
          description: 'Lihat dan kelola akun pengguna (Admin, BEM Panitia, Mahasiswa).',
          path: `${basePath}/users`,
          icon: Users,
          color: 'from-violet-600 to-purple-700',
          detail: 'Admin · BEM · Mahasiswa',
        }]
      : []),
  ];
}

export default function EventManagementPage() {
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const basePath = isAdmin ? '/admin' : '/bem';
  const modules = dashboardModules(basePath, isAdmin);
  const view = location.pathname.split('/')[2] || 'overview';
  if (view === 'events') return <EventManagement />;
  if (view === 'announcements') return <AnnouncementManagement />;
  if (view === 'attendance') return <AttendanceManagement />;
  if (view === 'certificates' || view === 'certificate-templates') return <CertificateTemplateManagement />;
  if (view === 'users' && isAdmin) return <UserManagement />;

  return (
    <div className="space-y-7 text-[#172554]">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#172554] via-blue-700 to-indigo-500 p-7 text-white shadow-xl shadow-blue-200 sm:p-9">
        <div className="pointer-events-none absolute -right-12 -top-14 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div><span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold"><Sparkles className="h-3.5 w-3.5 text-amber-300" />Pusat kendali FILKOM</span><h1 className="mt-4 text-2xl font-extrabold sm:text-3xl">{isAdmin ? 'Dashboard Admin FILKOM' : 'Dashboard BEM Fakultas'}</h1><p className="mt-2 max-w-xl text-sm leading-relaxed text-blue-100">Kelola acara, pengumuman, peserta, absensi, dan sertifikat melalui ruang kerja yang terpisah.</p></div>
          <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold"><Users className="h-4 w-4" /> Portal {isAdmin ? 'Admin FILKOM' : 'BEM FILKOM'}</div>
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2">
        {modules.map(({ title, description, path, icon: Icon, color, detail }) => <Link key={path} to={path} className="group rounded-3xl border border-blue-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-100/70 sm:p-6">
          <div className="flex items-start justify-between"><span className={'flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ' + color + ' text-white shadow-lg'}><Icon className="h-5 w-5" /></span><ArrowUpRight className="h-5 w-5 text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-700" /></div>
          <h2 className="mt-5 text-lg font-extrabold">{title}</h2><p className="mt-1 text-sm leading-relaxed text-slate-600">{description}</p><p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-blue-700">{detail}</p>
        </Link>)}
      </section>
    </div>
  );
}
