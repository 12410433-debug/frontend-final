import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-medium text-slate-700">
            Fakultas Ilmu Komputer (FILKOM) — Universitas Klabat
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Sistem Informasi Manajemen Event, Kegiatan Akademik, dan Publikasi Pengumuman &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
