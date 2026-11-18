import { useState } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  ArrowLeft,
} from 'lucide-react';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import Badge from '../../components/Badge';
import Card from '../../components/Card';

const ROLE_METADATA = {
  student: {
    role: 'student',
    title: 'Login Mahasiswa FILKOM',
    badge: 'Portal Mahasiswa',
    badgeVariant: 'green',
    icon: GraduationCap,
    iconColor: 'bg-emerald-50 text-emerald-600',
    placeholderEmail: 's2210001@student.unklab.ac.id',
    dashboardPath: '/student',
  },
  committee: {
    role: 'committee',
    title: 'Login Panitia Event / BEM',
    badge: 'Portal Panitia / BEM',
    badgeVariant: 'blue',
    icon: ShieldCheck,
    iconColor: 'bg-blue-50 text-blue-600',
    placeholderEmail: 'hmp.ti@unklab.ac.id',
    dashboardPath: '/bem',
  },
  bem: {
    role: 'bem',
    title: 'Login BEM Fakultas FILKOM',
    badge: 'Portal BEM Fakultas',
    badgeVariant: 'blue',
    icon: ShieldCheck,
    iconColor: 'bg-blue-50 text-blue-600',
    placeholderEmail: 'hmp.ti@unklab.ac.id',
    dashboardPath: '/bem',
  },
  admin: {
    role: 'admin',
    title: 'Login Admin FILKOM',
    badge: 'Portal Admin',
    badgeVariant: 'purple',
    icon: ShieldCheck,
    iconColor: 'bg-purple-50 text-purple-600',
    placeholderEmail: 'admin.filkom@unklab.ac.id',
    dashboardPath: '/admin',
  },
};

export default function LoginPage() {
  const { role } = useParams();
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (role && !ROLE_METADATA[role]) {
    return <Navigate to="/" replace />;
  }

  if (isAuthenticated && user) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  const currentRole = ROLE_METADATA[role] || {
    title: 'Masuk ke FILKOM Event Management',
    badge: 'Login Pengguna FILKOM',
    badgeVariant: 'blue',
    icon: ShieldCheck,
    iconColor: 'bg-blue-50 text-blue-600',
    placeholderEmail: 'nama@unklab.ac.id',
  };
  const IconComponent = currentRole.icon;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Silakan masukkan alamat email akun Anda.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Silakan masukkan kata sandi Anda.');
      return;
    }

    setIsLoading(true);
    try {
      const account = await login(email, password, role);
      navigate(ROLE_METADATA[account.role].dashboardPath, { replace: true });
    } catch (error) {
      setErrorMessage(
        error.response || error.request
          ? 'JSON Server tidak dapat dihubungi. Pastikan server berjalan di port 3001.'
          : error.message || 'Login gagal. Silakan coba kembali.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#EFF6FF] via-white to-[#EFF6FF] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 text-[#172554]">
      {/* Tombol Kembali ke Halaman Awal */}
      <div className="w-full max-w-md mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#1E3A8A] hover:text-[#2563EB] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Halaman Utama</span>
        </Link>
      </div>

      {/* Header Form Login */}
      <div className="w-full max-w-md text-center">
        <div
          className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center shadow-md mb-4 ring-4 ring-blue-100 ${currentRole.iconColor}`}
        >
          <IconComponent className="w-8 h-8" />
        </div>

        <div className="mb-2">
          <Badge variant={currentRole.badgeVariant} size="sm">
            {currentRole.badge}
          </Badge>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172554] tracking-tight">
          {currentRole.title}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#1E40AF] font-medium">
          Fakultas Ilmu Komputer &bull; Universitas Klabat
        </p>
        {!role && <p className="mt-2 text-xs text-blue-700">Role akun akan ditentukan dari data pengguna.</p>}
      </div>

      {/* Form Login Sederhana (Hanya Email & Password) */}
      <div className="mt-8 w-full max-w-md">
        <Card className="p-6 sm:p-8 shadow-md border border-[#BFDBFE] bg-white">
          <p className="mb-5 text-sm text-slate-600">Masukkan email dan kata sandi akun FILKOM Anda.</p>
          {errorMessage && (
            <div className="mb-5">
              <Alert
                type="error"
                message={errorMessage}
                onClose={() => setErrorMessage('')}
              />
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <Input
              label="Alamat Email"
              id="login-email"
              type="email"
              required
              placeholder={currentRole.placeholderEmail}
              startIcon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Kata Sandi / Password"
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Masukkan password Anda..."
              startIcon={Lock}
              endIcon={showPassword ? EyeOff : Eye}
              onEndIconClick={() => setShowPassword(!showPassword)}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                icon={ArrowRight}
                iconPosition="right"
                className="w-full justify-center shadow-sm"
              >
                Masuk
              </Button>
            </div>
          </form>

          {/* Link Registrasi Akun Mahasiswa */}
          {(!role || currentRole.role === 'student') && (
            <div className="mt-5 pt-4 border-t border-[#BFDBFE] text-center text-xs text-[#1E3A8A]">
              Belum memiliki akun mahasiswa?{' '}
              <Link
                to="/register/student"
                className="font-bold text-[#2563EB] hover:text-[#1D4ED8] hover:underline"
              >
                Daftar Mahasiswa di sini &rarr;
              </Link>
            </div>
          )}

          {/* Informasi Akun Demo */}
          <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-xs text-[#1E3A8A]">
            <p className="font-bold text-[#172554]">Akun Demo {currentRole.badge}:</p>
            <div className="mt-1.5 flex flex-col gap-1 text-[11px] font-mono text-blue-900">
              <div>Email: <strong className="select-all font-bold text-blue-950">{currentRole.placeholderEmail}</strong></div>
              <div>Password: <strong className="select-all font-bold text-blue-950">{currentRole.role === 'admin' ? 'admin123' : currentRole.role === 'student' ? 'mahasiswa123' : 'panitia123'}</strong></div>
            </div>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            Untuk demonstrasi akademik, data password dibaca dari JSON Server. Sistem simulasi ini belum aman untuk produksi.
          </p>
        </Card>
      </div>
    </div>
  );
}
