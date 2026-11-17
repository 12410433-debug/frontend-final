import { createContext, useContext, useEffect, useState } from 'react';
import { jsonServerApi } from '../services/api';

export const AuthContext = createContext(null);

const FALLBACK_USERS = [
  {
    id: 'u1',
    name: 'Admin FILKOM',
    email: 'admin.filkom@unklab.ac.id',
    password: 'admin123',
    role: 'admin',
    status: 'active',
  },
  {
    id: 'u2',
    name: 'Reynaldi Sumampouw (HMP TI)',
    email: 'hmp.ti@unklab.ac.id',
    password: 'panitia123',
    role: 'committee',
    status: 'active',
  },
  {
    id: 'u3',
    name: 'Gratia Lomban',
    email: 'filkomputer.ormawa@unklab.ac.id',
    password: 'panitia123',
    role: 'bem',
    status: 'active',
  },
  {
    id: 'ZT4lcKY42yU',
    name: 'BEM FILKOM',
    email: 'bemfilkomm@gmail.com',
    password: 'bemfilkom',
    role: 'bem',
    status: 'active',
  },
  {
    id: 'u4',
    name: 'Christo Rawung',
    nim: '10502210001',
    email: 's2210001@student.unklab.ac.id',
    password: 'mahasiswa123',
    role: 'student',
    status: 'active',
  },
];

const normalizeUserRole = (user) => {
  if (!user) return user;
  return { ...user, role: user.role === 'committee' ? 'bem' : user.role };
};

export const AuthProvider = ({ children }) => {
  const [account, setAccount] = useState(() => {
    try {
      const savedUser = localStorage.getItem('filkom_user');
      return savedUser ? normalizeUserRole(JSON.parse(savedUser)) : null;
    } catch (error) {
      console.error('Gagal membaca data sesi user:', error);
      return null;
    }
  });
  const [studentProfile, setStudentProfileState] = useState(() => {
    try {
      const savedProfile = localStorage.getItem('filkom_student_profile');
      if (savedProfile) return JSON.parse(savedProfile);
      const previousStudent = JSON.parse(localStorage.getItem('filkom_user') || 'null');
      return previousStudent?.role === 'student' ? previousStudent : null;
    } catch {
      return null;
    }
  });
  const user = account || studentProfile;

  const [loading] = useState(false);

  useEffect(() => {
    if (!account?.id) return undefined;
    let active = true;
    jsonServerApi.get(`/users/${account.id}`)
      .then(({ data }) => {
        if (!active || data.status !== 'active') return;
        const refreshedUser = normalizeUserRole(data);
        delete refreshedUser.password;
        setAccount(refreshedUser);
        localStorage.setItem('filkom_user', JSON.stringify(refreshedUser));
      })
      .catch(() => {});
    return () => { active = false; };
  }, [account?.id]);

  const setStudentProfile = (profile) => {
    const safeProfile = { ...profile, role: 'student' };
    delete safeProfile.password;
    setStudentProfileState(safeProfile);
    localStorage.setItem('filkom_student_profile', JSON.stringify(safeProfile));
    return safeProfile;
  };

  const login = async (email, password, expectedRole) => {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const cleanPassword = String(password || '').trim();

    let users;
    try {
      const { data } = await jsonServerApi.get('/users');
      users = Array.isArray(data) && data.length > 0 ? data : FALLBACK_USERS;
    } catch {
      users = FALLBACK_USERS;
    }

    const matchedUser = users.find(
      (candidate) => String(candidate.email || '').trim().toLowerCase() === normalizedEmail
    );

    if (!matchedUser) {
      throw new Error('Alamat email belum terdaftar di sistem. Periksa kembali email Anda.');
    }

    const expectedPassword = String(
      matchedUser.password || (matchedUser.role === 'student' ? 'mahasiswa123' : '')
    ).trim();

    if (expectedPassword !== cleanPassword) {
      throw new Error('Kata sandi yang Anda masukkan salah. Periksa kembali kata sandi Anda.');
    }

    if (matchedUser.status && matchedUser.status !== 'active') {
      throw new Error('Akun ini sedang dinonaktifkan. Hubungi administrator FILKOM.');
    }

    const userData = normalizeUserRole(matchedUser);

    if (expectedRole) {
      const normalizedExpected = expectedRole === 'committee' ? 'bem' : expectedRole;
      if (userData.role !== normalizedExpected) {
        const roleLabels = {
          admin: 'Administrator',
          bem: 'Panitia Event / BEM',
          committee: 'Panitia Event / BEM',
          student: 'Mahasiswa',
        };
        const akunRole = roleLabels[userData.role] || userData.role;
        const portalRole = roleLabels[normalizedExpected] || normalizedExpected;
        throw new Error(
          `Akun Anda memiliki hak akses sebagai ${akunRole}, bukan ${portalRole}. Silakan masuk melalui portal yang sesuai.`
        );
      }
    }

    // Hanya profil yang diperlukan disimpan di sesi browser; password tidak disimpan.
    const cleanUserData = { ...userData };
    delete cleanUserData.password;
    setAccount(cleanUserData);
    localStorage.setItem('filkom_user', JSON.stringify(cleanUserData));
    return cleanUserData;
  };

  const logout = () => {
    setAccount(null);
    setStudentProfileState(null);
    localStorage.removeItem('filkom_user');
    localStorage.removeItem('filkom_student_profile');
    localStorage.removeItem('token');
  };

  const value = {
    user,
    studentProfile,
    setStudentProfile,
    role: user?.role || null,
    isAuthenticated: !!account,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
};

export default AuthContext;
