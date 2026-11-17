import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from '../components/ProtectedRoute';

import HomePage from '../pages/public/HomePage';
import LoginPage from '../pages/auth/LoginPage';
import EventManagementPage from '../pages/admin/EventManagementPage';
import StudentDashboard from '../pages/student/StudentDashboard';
import StudentAIAssistant from '../pages/student/StudentAIAssistant';

function ProtectedPage({ role, children }) {
  return <ProtectedRoute requiredRole={role}>{children}</ProtectedRoute>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login/committee" element={<Navigate to="/login/bem" replace />} />
      <Route path="/login/:role" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/committee/*" element={<Navigate to="/bem" replace />} />
      <Route element={<DashboardLayout />}>
        <Route path="/student" element={<ProtectedPage role="student"><StudentDashboard /></ProtectedPage>} />
        <Route path="/student/events" element={<ProtectedPage role="student"><StudentDashboard /></ProtectedPage>} />
        <Route path="/student/registrations" element={<ProtectedPage role="student"><StudentDashboard /></ProtectedPage>} />
        <Route path="/student/announcements" element={<ProtectedPage role="student"><StudentDashboard /></ProtectedPage>} />
        <Route path="/student/certificates" element={<ProtectedPage role="student"><StudentDashboard /></ProtectedPage>} />
        <Route path="/student/ai" element={<ProtectedPage role="student"><StudentAIAssistant /></ProtectedPage>} />

        <Route path="/bem" element={<ProtectedPage role="bem"><EventManagementPage /></ProtectedPage>} />
        <Route path="/bem/events" element={<ProtectedPage role="bem"><EventManagementPage /></ProtectedPage>} />
        <Route path="/bem/announcements" element={<ProtectedPage role="bem"><EventManagementPage /></ProtectedPage>} />
        <Route path="/bem/attendance" element={<ProtectedPage role="bem"><EventManagementPage /></ProtectedPage>} />
        <Route path="/bem/certificates" element={<ProtectedPage role="bem"><EventManagementPage /></ProtectedPage>} />
        <Route path="/bem/certificate-templates" element={<ProtectedPage role="bem"><EventManagementPage /></ProtectedPage>} />

        <Route path="/admin" element={<ProtectedPage role="admin"><EventManagementPage /></ProtectedPage>} />
        <Route path="/admin/events" element={<ProtectedPage role="admin"><EventManagementPage /></ProtectedPage>} />
        <Route path="/admin/announcements" element={<ProtectedPage role="admin"><EventManagementPage /></ProtectedPage>} />
        <Route path="/admin/attendance" element={<ProtectedPage role="admin"><EventManagementPage /></ProtectedPage>} />
        <Route path="/admin/certificates" element={<ProtectedPage role="admin"><EventManagementPage /></ProtectedPage>} />
        <Route path="/admin/certificate-templates" element={<ProtectedPage role="admin"><EventManagementPage /></ProtectedPage>} />
        <Route path="/admin/users" element={<ProtectedPage role="admin"><EventManagementPage /></ProtectedPage>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
