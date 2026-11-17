import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Award, Bell, Calendar, CalendarDays, ChevronRight, FileImage, GraduationCap,
  LayoutDashboard, LogOut, PlusCircle, ShieldCheck, Sparkles,
  Ticket, Users, X, AlertTriangle,
} from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

function roleDetails(role) {
  if (role === 'admin') return { label: 'ADMIN FILKOM', icon: ShieldCheck, color: 'text-violet-700' };
  if (role === 'bem' || role === 'committee') return { label: 'BEM FAKULTAS FILKOM', icon: ShieldCheck, color: 'text-blue-700' };
  return { label: 'MAHASISWA FILKOM', icon: GraduationCap, color: 'text-emerald-700' };
}

function navItemsFor(role) {
  if (role === 'bem' || role === 'admin' || role === 'committee') {
    const root = role === 'admin' ? '/admin' : '/bem';
    return [
      { label: `Dashboard ${role === 'admin' ? 'Admin' : 'BEM'}`, path: root, icon: LayoutDashboard },
      { label: 'Kelola Event', path: `${root}/events`, icon: CalendarDays },
      { label: 'Buat Event Baru', path: `${root}/events#create-event`, icon: PlusCircle, action: 'create-event' },
      { label: 'Pengumuman', path: `${root}/announcements`, icon: Bell },
      { label: 'Peserta & Rekap Absensi', path: `${root}/attendance`, icon: Users },
      { label: 'Template & Sertifikat', path: `${root}/certificates`, icon: FileImage },
      ...(role === 'admin' ? [{ label: 'Kelola Pengguna', path: `${root}/users`, icon: Users }] : []),
    ];
  }
  return [
    { label: 'Daftar Event', path: '/student', icon: LayoutDashboard },
    { label: 'AI Event Assistant', path: '/student/ai', icon: Sparkles },
    { label: 'Riwayat Pendaftaran', path: '/student/registrations', icon: Ticket },
    { label: 'Pengumuman Fakultas', path: '/student/announcements', icon: Bell },
    { label: 'Sertifikat Saya', path: '/student/certificates', icon: Award },
  ];
}

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const role = roleDetails(user?.role);
  const RoleIcon = role.icon;
  const navItems = navItemsFor(user?.role);

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate('/', { replace: true });
  };

  return (
    <>
      {isOpen && <button type="button" aria-label="Tutup navigasi" className="fixed inset-0 z-40 bg-[#172554]/55 backdrop-blur-sm lg:hidden" onClick={onClose} />}
      <aside aria-label="Navigasi utama" className={'fixed inset-y-0 left-0 z-50 flex h-screen w-[278px] shrink-0 flex-col border-r border-blue-100 bg-gradient-to-b from-white via-white to-blue-50/80 shadow-2xl transition-transform duration-300 ease-out lg:static lg:translate-x-0 lg:shadow-none ' + (isOpen ? 'translate-x-0' : '-translate-x-full')}>
        <div className="relative overflow-hidden border-b border-blue-100 px-5 pb-5 pt-5">
          <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-blue-100/80 blur-2xl" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-200"><Calendar className="h-5 w-5" /></div><div><span className="block text-sm font-extrabold tracking-tight text-[#172554]">FILKOM Events</span><span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">Universitas Klabat</span></div></div>
            <button type="button" aria-label="Tutup navigasi" onClick={onClose} className="rounded-xl p-2 text-blue-800 transition hover:bg-blue-100 lg:hidden"><X className="h-5 w-5" /></button>
          </div>
          <div className="relative mt-4 flex items-center gap-2 rounded-xl border border-blue-100 bg-white/80 px-3 py-2 text-[11px] font-semibold text-blue-800"><span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.13)]" />Portal kegiatan FILKOM</div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5" aria-label="Menu fitur">
          <p className="mb-3 px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Menu {user?.role === 'student' ? 'Mahasiswa' : user?.role === 'admin' ? 'Admin' : 'BEM Fakultas'}</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname + location.hash === item.path || (location.pathname === item.path && !item.path.includes('#'));
            return <Link key={item.label} to={item.path} onClick={(event) => {
              if (item.action === 'create-event' && location.pathname === item.path.split('#')[0]) {
                event.preventDefault();
                window.dispatchEvent(new Event('filkom:create-event'));
              }
              onClose();
            }} aria-current={isActive ? 'page' : undefined} className={'group relative flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold transition-all duration-200 ' + (isActive ? 'bg-gradient-to-r from-blue-700 to-indigo-600 text-white shadow-lg shadow-blue-200/80' : 'text-slate-600 hover:translate-x-0.5 hover:bg-blue-50 hover:text-blue-800')}>
              <span className={'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ' + (isActive ? 'bg-white/15 text-white' : 'bg-slate-100 text-blue-700 group-hover:bg-white')}><Icon className="h-[18px] w-[18px]" /></span>
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {isActive ? <span className="h-2 w-2 rounded-full bg-white shadow-[0_0_0_3px_rgba(255,255,255,0.15)]" /> : <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-500" />}
            </Link>;
          })}
        </nav>
        <div className="space-y-3 border-t border-blue-100 bg-white/70 p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white p-3 shadow-sm"><div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-sm font-extrabold text-white shadow-md shadow-blue-100">{user?.name ? user.name.charAt(0).toUpperCase() : 'M'}<span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" /></div><div className="min-w-0 flex-1"><p className="truncate text-xs font-extrabold text-[#172554]">{user?.name || 'Mahasiswa FILKOM'}</p><p className={'mt-1 flex items-center gap-1.5 text-[10px] font-bold tracking-wide ' + role.color}><RoleIcon className="h-3.5 w-3.5" />{role.label}</p></div></div>
          {user && (
            <button
              type="button"
              onClick={() => setShowLogoutModal(true)}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-3 py-3 text-xs font-extrabold text-rose-700 transition-all hover:border-rose-600 hover:bg-rose-600 hover:text-white cursor-pointer shadow-2xs"
            >
              <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              Keluar Sesi
            </button>
          )}
        </div>
      </aside>

      {/* Modal Validasi / Konfirmasi Sebelum Keluar Sistem */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Konfirmasi Keluar Sesi"
        maxWidth="max-w-md"
        footer={
          <div className="flex w-full items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowLogoutModal(false)}
              className="px-4 py-2 text-xs font-bold"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              icon={LogOut}
              onClick={handleConfirmLogout}
              className="px-4 py-2 text-xs font-bold shadow-sm"
            >
              Ya, Keluar Sesi
            </Button>
          </div>
        }
      >
        <div className="flex items-start gap-3.5 py-1 text-left">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-4 ring-rose-100/70">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-extrabold text-[#172554]">
              Apakah Anda yakin ingin keluar dari sistem?
            </h4>
            <p className="text-xs leading-relaxed text-slate-600">
              Sesi aktif Anda atas nama{' '}
              <span className="font-extrabold text-[#172554]">{user?.name || 'Pengguna'}</span>{' '}
              (<span className="font-bold text-blue-700">{role.label}</span>) akan diakhiri.
            </p>
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-2.5 text-[11px] font-medium leading-relaxed text-amber-900">
              ⚠️ Anda perlu masuk kembali menggunakan email dan kata sandi akun Anda untuk mengakses fitur sistem ini.
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
