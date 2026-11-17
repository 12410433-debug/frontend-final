import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Menu, X, LogIn, LayoutDashboard } from 'lucide-react';
import Button from './Button';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const getDashboardPath = () => {
    if (!user) return '/#portal-selection';
    return `/${user.role}`;
  };

  const navLinks = [
    { label: 'Beranda', href: '/' },
    { label: 'Pilihan Akses Portal', href: '/#portal-selection' },
    { label: 'Event', href: '/#events-section' },
    { label: 'Pengumuman', href: '/#announcements-section' },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs w-full">
      <div className="w-full px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Identity */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition-colors">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base sm:text-lg text-slate-900 leading-tight block">
                FILKOM Event Management
              </span>
              <span className="text-[11px] font-medium text-blue-600 leading-none block">
                Universitas Klabat
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Action Button (Pilih Portal / Dashboard) */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link to={getDashboardPath()}>
                <Button variant="primary" size="sm" icon={LayoutDashboard}>
                  Dashboard ({user?.name ? user.name.split(' ')[0] : 'Akun'})
                </Button>
              </Link>
            ) : (
              <a href="/#portal-selection">
                <Button variant="primary" size="sm" icon={LogIn}>
                  Pilih Portal Masuk
                </Button>
              </a>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100">
            {isAuthenticated ? (
              <Link
                to={getDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Buka Dashboard</span>
              </Link>
            ) : (
              <a
                href="/#portal-selection"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Pilih Portal Masuk</span>
              </a>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
