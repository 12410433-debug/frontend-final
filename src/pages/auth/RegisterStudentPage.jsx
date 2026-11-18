import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  User,
  Mail,
  Phone,
  BookOpen,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import Badge from '../../components/Badge';
import Card from '../../components/Card';

const MAJORS = [
  'Informatika',
  'Sistem Informasi',
  'Teknologi Informasi',
];

export default function RegisterStudentPage() {
  const navigate = useNavigate();
  const { registerStudent, isAuthenticated, user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    nim: '',
    email: '',
    phone: '',
    major: 'Informatika',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Jika pengguna sudah login, arahkan ke dashboard mahasiswa
  if (isAuthenticated && user?.role === 'student') {
    return <Navigate to="/student" replace />;
  }

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const { name, nim, email, phone, major, password, confirmPassword } = formData;

    if (!name.trim()) {
      setErrorMessage('Silakan masukkan nama lengkap Anda.');
      return;
    }
    if (!nim.trim()) {
      setErrorMessage('Silakan masukkan NIM (Nomor Induk Mahasiswa).');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Silakan masukkan alamat email mahasiswa Anda.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Silakan masukkan nomor telepon / WhatsApp.');
      return;
    }
    if (!major.trim()) {
      setErrorMessage('Silakan pilih program studi / jurusan Anda.');
      return;
    }
    if (!password) {
      setErrorMessage('Silakan buat kata sandi akun.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Kata sandi minimal 6 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok. Periksa kembali.');
      return;
    }

    setIsLoading(true);
    try {
      await registerStudent({
        name,
        nim,
        email,
        phone,
        major,
        password,
      });

      setSuccessMessage('Registrasi akun berhasil! Anda akan dialihkan ke Portal Mahasiswa...');
      setTimeout(() => {
        navigate('/student', { replace: true });
      }, 1200);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
        error.message ||
        'Registrasi gagal. Pastikan JSON Server berjalan di http://localhost:3001.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#EFF6FF] via-white to-[#EFF6FF] flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 text-[#172554]">
      {/* Tombol Navigasi Kembali */}
      <div className="w-full max-w-xl mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#1E3A8A] hover:text-[#2563EB] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Halaman Utama</span>
        </Link>
      </div>

      {/* Header Registrasi */}
      <div className="w-full max-w-xl text-center mb-6">
        <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center shadow-md mb-3 ring-4 ring-emerald-100 bg-emerald-50 text-emerald-600">
          <GraduationCap className="w-8 h-8" />
        </div>

        <div className="mb-2">
          <Badge variant="green" size="sm">
            Portal Mahasiswa
          </Badge>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172554] tracking-tight">
          Registrasi Akun Mahasiswa FILKOM
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#1E40AF] font-medium">
          Fakultas Ilmu Komputer &bull; Universitas Klabat
        </p>
      </div>

      {/* Card Form Registrasi */}
      <div className="w-full max-w-xl">
        <Card className="p-6 sm:p-8 shadow-md border border-[#BFDBFE] bg-white">
          {/* Informasi Sinkronisasi Data ke Pendaftaran Event */}
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50/80 p-3.5 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
            <div className="text-xs text-[#1E3A8A] leading-relaxed">
              <strong className="text-[#172554] block mb-0.5">Otomatisasi Pendaftaran Event:</strong>
              Data diri yang Anda isi di bawah (Nama, NIM, Email, No. Telp, Jurusan) akan otomatis terhubung dan terisi saat Anda mendaftar event kegiatan fakultas.
            </div>
          </div>

          {errorMessage && (
            <div className="mb-5">
              <Alert
                type="error"
                message={errorMessage}
                onClose={() => setErrorMessage('')}
              />
            </div>
          )}

          {successMessage && (
            <div className="mb-5">
              <Alert
                type="success"
                message={successMessage}
              />
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nama Lengkap */}
              <div className="sm:col-span-2">
                <Input
                  label="Nama Lengkap"
                  id="reg-name"
                  type="text"
                  required
                  placeholder="Contoh: Gledial Ribka Tewu"
                  startIcon={User}
                  value={formData.name}
                  onChange={handleChange('name')}
                />
              </div>

              {/* NIM */}
              <div>
                <Input
                  label="NIM (Nomor Induk Mahasiswa)"
                  id="reg-nim"
                  type="text"
                  required
                  placeholder="Contoh: 105022410082"
                  startIcon={GraduationCap}
                  value={formData.nim}
                  onChange={handleChange('nim')}
                />
              </div>

              {/* Program Studi / Jurusan */}
              <div className="text-left">
                <label
                  htmlFor="reg-major"
                  className="block text-xs font-bold text-[#172554] mb-1.5 tracking-wide"
                >
                  Program Studi / Jurusan <span className="text-rose-600">*</span>
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#1E3A8A]">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <select
                    id="reg-major"
                    required
                    value={formData.major}
                    onChange={handleChange('major')}
                    className="block w-full rounded-xl text-sm transition-colors border border-[#BFDBFE] text-[#172554] focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] pl-10 pr-4 py-2.5 bg-white cursor-pointer"
                  >
                    {MAJORS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Email Mahasiswa */}
              <div className="sm:col-span-2">
                <Input
                  label="Alamat Email Mahasiswa"
                  id="reg-email"
                  type="email"
                  required
                  placeholder="nama@student.unklab.ac.id"
                  startIcon={Mail}
                  value={formData.email}
                  onChange={handleChange('email')}
                  helperText="Gunakan email kampus Universitas Klabat Anda."
                />
              </div>

              {/* Nomor Telepon / WhatsApp */}
              <div className="sm:col-span-2">
                <Input
                  label="Nomor Telepon / WhatsApp"
                  id="reg-phone"
                  type="tel"
                  required
                  placeholder="Contoh: 081242310642"
                  startIcon={Phone}
                  value={formData.phone}
                  onChange={handleChange('phone')}
                />
              </div>

              {/* Kata Sandi */}
              <div>
                <Input
                  label="Kata Sandi (Password)"
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Minimal 6 karakter"
                  startIcon={Lock}
                  endIcon={showPassword ? EyeOff : Eye}
                  onEndIconClick={() => setShowPassword(!showPassword)}
                  value={formData.password}
                  onChange={handleChange('password')}
                />
              </div>

              {/* Konfirmasi Kata Sandi */}
              <div>
                <Input
                  label="Konfirmasi Kata Sandi"
                  id="reg-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Ulangi kata sandi"
                  startIcon={Lock}
                  endIcon={showConfirmPassword ? EyeOff : Eye}
                  onEndIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  value={formData.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                />
              </div>
            </div>

            <div className="pt-3">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                icon={ArrowRight}
                iconPosition="right"
                className="w-full justify-center shadow-sm py-2.5 text-sm"
              >
                Daftar Akun Mahasiswa
              </Button>
            </div>
          </form>

          {/* Footer Card */}
          <div className="mt-6 pt-5 border-t border-[#BFDBFE] text-center text-xs text-[#1E3A8A]">
            Sudah memiliki akun mahasiswa?{' '}
            <Link
              to="/login/student"
              className="font-bold text-[#2563EB] hover:text-[#1D4ED8] hover:underline"
            >
              Masuk di sini
            </Link>
          </div>

          <p className="mt-4 text-[11px] leading-relaxed text-slate-500 text-center">
            Untuk demonstrasi akademik, akun disimpan di basis data simulasi JSON Server.
          </p>
        </Card>
      </div>
    </div>
  );
}
