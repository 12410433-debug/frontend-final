import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Komponen pembungkus untuk membatasi akses route secara ketat berdasarkan role pengguna.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} props.requiredRole - Role yang wajib dimiliki ('student', 'bem', atau 'admin')
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Jika belum login, alihkan ke halaman login sesuai role yang dibutuhkan
  if (!isAuthenticated || !user) {
    const targetLogin = requiredRole ? `/login/${requiredRole}` : '/login';
    return <Navigate to={targetLogin} state={{ from: location }} replace />;
  }

  // VALIDASI KETAT: Jika role akun tidak sama dengan role route yang dituju,
  // alihkan langsung ke dashboard yang sah milik role pengguna tersebut.
  const userRole = user.role === 'committee' ? 'bem' : user.role;
  const targetRequired = requiredRole === 'committee' ? 'bem' : requiredRole;
  if (targetRequired && userRole !== targetRequired) {
    return <Navigate to={`/${userRole}`} replace />;
  }

  return children;
}
