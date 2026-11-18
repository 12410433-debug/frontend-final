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
    password: 'panitia123',
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

    const emailMatches = users.filter(
      (candidate) => String(candidate.email || '').trim().toLowerCase() === normalizedEmail
    );

    if (emailMatches.length === 0) {
      throw new Error('Alamat email belum terdaftar di sistem. Periksa kembali email Anda.');
    }

    const normalizedExpected = expectedRole === 'committee' ? 'bem' : expectedRole;

    // Cari akun yang sesuai dengan role portal yang sedang diakses
    let matchedUser = normalizedExpected
      ? emailMatches.find(
          (candidate) => (candidate.role === 'committee' ? 'bem' : candidate.role) === normalizedExpected
        )
      : null;

    if (!matchedUser) {
      if (normalizedExpected) {
        const roleLabels = {
          admin: 'Administrator',
          bem: 'Panitia Event / BEM',
          committee: 'Panitia Event / BEM',
          student: 'Mahasiswa',
        };
        const existingRoles = emailMatches
          .map((c) => roleLabels[c.role] || c.role)
          .join(', ');
        const portalRole = roleLabels[normalizedExpected] || normalizedExpected;
        throw new Error(
          `Akun dengan email ini belum terdaftar untuk portal ${portalRole} (terdaftar sebagai: ${existingRoles}). Silakan masuk melalui portal yang sesuai.`
        );
      }
      matchedUser = emailMatches[0];
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

    // Hanya profil yang diperlukan disimpan di sesi browser; password tidak disimpan.
    const cleanUserData = { ...userData };
    delete cleanUserData.password;
    setAccount(cleanUserData);
    localStorage.setItem('filkom_user', JSON.stringify(cleanUserData));
    return cleanUserData;
  };

  const registerStudent = async ({ name, nim, email, phone, major, password }) => {
    const cleanName = String(name || '').trim();
    const cleanNim = String(nim || '').trim();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPhone = String(phone || '').trim();
    const cleanMajor = String(major || '').trim();
    const cleanPassword = String(password || '').trim();

    if (!cleanName || !cleanNim || !cleanEmail || !cleanPhone || !cleanMajor || !cleanPassword) {
      throw new Error('Semua data wajib diisi: Nama lengkap, NIM, Email, No. Telp, Jurusan, dan Kata sandi.');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      throw new Error('Format alamat email tidak valid.');
    }

    if (!cleanEmail.endsWith('@student.unklab.ac.id')) {
      throw new Error('Pendaftaran akun mahasiswa hanya dapat menggunakan email resmi @student.unklab.ac.id.');
    }

    if (cleanPassword.length < 6) {
      throw new Error('Kata sandi minimal 6 karakter.');
    }

    let users;
    try {
      const { data } = await jsonServerApi.get('/users');
      users = Array.isArray(data) ? data : [];
    } catch {
      users = [];
    }

    const emailOwner = users.find(
      (u) => u.role === 'student' && String(u.email || '').trim().toLowerCase() === cleanEmail
    );
    if (emailOwner) {
      throw new Error('Alamat email ini sudah terdaftar sebagai akun mahasiswa. Silakan masuk ke akun Anda.');
    }

    const nimOwner = users.find(
      (u) => u.role === 'student' && String(u.nim || '').trim() === cleanNim
    );
    if (nimOwner) {
      throw new Error('NIM ini sudah terdaftar pada akun mahasiswa lain. Periksa kembali NIM Anda.');
    }

    const newId = `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    const newStudent = {
      id: newId,
      name: cleanName,
      nim: cleanNim,
      email: cleanEmail,
      phone: cleanPhone,
      major: cleanMajor,
      password: cleanPassword,
      role: 'student',
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    const { data: createdUser } = await jsonServerApi.post('/users', newStudent);

    const cleanUserData = { ...createdUser };
    delete cleanUserData.password;
    setAccount(cleanUserData);
    setStudentProfileState(cleanUserData);
    localStorage.setItem('filkom_user', JSON.stringify(cleanUserData));
    localStorage.setItem('filkom_student_profile', JSON.stringify(cleanUserData));

    return cleanUserData;
  };

  const updateStudentProfile = async (updatedData) => {
    const studentId = user?.id || studentProfile?.id;
    if (!studentId) throw new Error('ID mahasiswa tidak ditemukan.');

    const cleanData = {
      ...(user || {}),
      ...updatedData,
      role: 'student',
      status: 'active',
    };

    delete cleanData.password;

    try {
      await jsonServerApi.patch(`/users/${studentId}`, cleanData);
    } catch {
      // jika patch server gagal, tetap perbarui data sesi lokal
    }

    setAccount(cleanData);
    setStudentProfileState(cleanData);
    localStorage.setItem('filkom_user', JSON.stringify(cleanData));
    localStorage.setItem('filkom_student_profile', JSON.stringify(cleanData));
    return cleanData;
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
    updateStudentProfile,
    role: user?.role || null,
    isAuthenticated: !!account,
    loading,
    login,
    registerStudent,
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
