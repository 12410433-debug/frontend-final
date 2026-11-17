import { Link } from 'react-router-dom';
import { Calendar, MapPin, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Kolom 1: Identitas FILKOM */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-lg text-slate-900 block leading-tight">
                  FILKOM Event Management
                </span>
                <span className="text-xs text-blue-600 font-medium">
                  Fakultas Ilmu Komputer &bull; Universitas Klabat
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl leading-relaxed">
              Platform terpadu untuk publikasi kegiatan, pendaftaran event akademik & organisasi, sistem e-ticket, serta distribusi pengumuman resmi di lingkungan Fakultas Ilmu Komputer Universitas Klabat.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Jl. Arnold Mononutu, Airmadidi Bawah, Minahasa Utara, Sulawesi Utara 95371</span>
            </div>
          </div>

          {/* Kolom 2: Navigasi Cepat */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Navigasi Cepat
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/" className="hover:text-blue-600 transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <a href="#portal-selection" className="hover:text-blue-600 transition-colors">
                  Pilihan Hak Akses Portal
                </a>
              </li>
              <li>
                <a href="#events-section" className="hover:text-blue-600 transition-colors">
                  Jelajahi Event
                </a>
              </li>
              <li>
                <a href="#announcements-section" className="hover:text-blue-600 transition-colors">
                  Pengumuman Fakultas
                </a>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Program Studi FILKOM */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Program Studi
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-500">
              <li>Informatika (S1)</li>
              <li>Sistem Informasi (S1)</li>
              <li>Teknologi Informasi (S1)</li>
              <li className="pt-2 text-xs text-blue-600 flex items-center gap-1.5 font-medium">
                <Globe className="w-3.5 h-3.5" />
                <a href="https://unklab.ac.id" target="_blank" rel="noreferrer" className="hover:underline">
                  unklab.ac.id
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>
            &copy; {new Date().getFullYear()} Fakultas Ilmu Komputer, Universitas Klabat. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span>Privasi & Keamanan</span>
            <span>&bull;</span>
            <span>Bantuan Mahasiswa</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
