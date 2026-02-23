import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DeveloperDashboard from './pages/developer/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import InchargeDashboard from './pages/incharge/Dashboard';
import Leaderboard from './pages/Leaderboard';
import PublicRegistration from './pages/PublicRegistration';

// Placeholder Pages
const Unauthorized = () => <div className="p-8">Unauthorized Access</div>;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes without Layout */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/register-team" element={<PublicRegistration />} />

          {/* Protected Routes with Sidebar Layout */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Navigate to="/developer" replace />} /> {/* Temporary redirect */}

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="dashboard" element={<div>General Dashboard Wrapper</div>} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['DEVELOPER']} />}>
              <Route path="developer" element={<DeveloperDashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="admin" element={<AdminDashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['INCHARGE']} />}>
              <Route path="incharge" element={<InchargeDashboard />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
