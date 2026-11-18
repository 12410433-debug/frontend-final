import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Badge from '../components/Badge';
import { Menu, ShieldCheck, GraduationCap } from 'lucide-react';

function HeaderRoleBadge({ role }) {
  if (role === 'admin') {
    return <Badge variant="purple" size="sm" icon={ShieldCheck}>ADMIN FILKOM</Badge>;
  }
  if (role === 'bem' || role === 'committee') {
    return (
      <Badge variant="blue" size="sm" icon={ShieldCheck}>
        BEM FAKULTAS
      </Badge>
    );
  }
  return (
    <Badge variant="green" size="sm" icon={GraduationCap}>
      MAHASISWA
    </Badge>
  );
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  useEffect(() => {
    const sectionId = decodeURIComponent(location.hash.slice(1));
    if (!sectionId || sectionId === 'create-event') return undefined;

    const timer = window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);

    return () => window.clearTimeout(timer);
  }, [location.pathname, location.hash]);


  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#EFF6FF]/40 text-[#172554]">
      {/* Sidebar: Selalu di sisi kiri, tinggi 100vh, scroll mandiri */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Area Konten Utama: Menggunakan 100% sisa lebar layar, scroll mandiri */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Header Dashboard: Sticky di posisi atas */}
        <header className="h-16 w-full flex-shrink-0 bg-white border-b border-[#BFDBFE] px-4 sm:px-6 lg:px-8 flex items-center justify-between z-30 shadow-xs">
          {/* Sisi Kiri: Hamburger Menu Mobile & Nama Sistem */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-xl text-[#1E3A8A] hover:text-[#172554] hover:bg-[#EFF6FF] lg:hidden cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>

            <span className="font-extrabold text-base sm:text-lg text-[#172554] tracking-tight">
              FILKOM Event Management
            </span>
          </div>

          {/* Sisi Kanan: Hanya Nama Pengguna, Badge Role, dan Avatar (Tidak Ada Tombol Keluar di Header) */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs sm:text-sm font-bold text-[#172554] leading-tight">
                {user?.name || 'Pengguna FILKOM'}
              </div>
              <div className="mt-0.5">
                <HeaderRoleBadge role={user?.role} />
              </div>
            </div>

            {/* Avatar Pengguna */}
            <div className="w-10 h-10 rounded-full bg-[#2563EB] text-white font-extrabold text-sm flex items-center justify-center shadow-xs border-2 border-white ring-2 ring-[#BFDBFE] shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </header>

        {/* Konten Halaman Dashboard: Full Width (100%), scroll vertikal mandiri */}
        <main className="flex-1 w-full overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
