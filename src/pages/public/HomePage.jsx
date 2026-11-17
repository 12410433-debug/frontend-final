import { Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck, Users, Calendar, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const roles = [
    {
      title: 'MAHASISWA FILKOM',
      description:
        'Akses katalog event, daftar kegiatan, periksa status pendaftaran, tiket QR code, dan sertifikat resmi.',
      buttonText: 'Masuk sebagai Mahasiswa',
      path: '/login/student',
      icon: GraduationCap,
      badge: 'Portal Mahasiswa',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      iconColor: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'PANITIA EVENT / ORMAWA',
      description:
        'Kelola seluruh kegiatan fakultas, publikasi pengumuman, daftar peserta, absensi kehadiran, dan sertifikat.',
      buttonText: 'Masuk sebagai Panitia',
      path: '/login/committee',
      icon: ShieldCheck,
      badge: 'Portal Panitia / BEM',
      badgeColor: 'bg-blue-50 text-blue-800 border-blue-300',
      iconColor: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'ADMINISTRATOR FILKOM',
      description: 'Kelola seluruh sistem fakultas, data akun pengguna (Admin, Panitia, Mahasiswa), dan master data.',
      buttonText: 'Masuk sebagai Admin',
      path: '/login/admin',
      icon: Users,
      badge: 'Portal Admin',
      badgeColor: 'bg-violet-50 text-violet-800 border-violet-300',
      iconColor: 'bg-violet-50 text-violet-600',
    },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center px-4 sm:px-8 lg:px-12 py-12 bg-gradient-to-b from-[#EFF6FF] via-white to-[#EFF6FF] text-[#172554]">
      {/* Header Halaman Utama */}
      <div className="w-full text-center max-w-4xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#2563EB] text-white shadow-md shadow-blue-500/20 mb-5 ring-4 ring-blue-100">
          <Calendar className="w-8 h-8" />
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#172554] tracking-tight mb-2">
          FILKOM EVENT MANAGEMENT
        </h1>

        <h2 className="text-lg sm:text-2xl font-bold text-[#1D4ED8] mb-4">
          Fakultas Ilmu Komputer &bull; Universitas Klabat
        </h2>

        <p className="text-sm sm:text-base text-[#1E3A8A] max-w-2xl mx-auto font-medium leading-relaxed">
          Platform digital untuk mengakses kegiatan dan pengumuman Fakultas Ilmu Komputer Universitas Klabat.
        </p>
      </div>

      {/* Portal Mahasiswa, BEM, dan Admin */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
        {roles.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="bg-white rounded-2xl border border-[#BFDBFE] p-7 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-[#2563EB] transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className={`p-3.5 rounded-xl ${item.iconColor} shadow-2xs`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-[#172554] mb-3 tracking-tight">
                  {item.title}
                </h3>

                <p className="text-sm text-[#1E40AF] leading-relaxed mb-6 font-medium">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#BFDBFE]">
                <Link to={item.path} className="w-full block">
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E3A8A] transition-colors shadow-sm cursor-pointer"
                  >
                    <span>{item.buttonText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
