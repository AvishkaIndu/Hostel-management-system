import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationsProvider } from './context/NotificationsContext';
import LoginForm from './components/Auth/LoginForm';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import RoomInventory from './pages/RoomInventory';
import Students from './pages/Students';
import Reports from './pages/Reports';
import Requests from './pages/Requests';
import KeyManagement from './pages/KeyManagement';
import Announcements from './pages/Announcements';
import Settings from './pages/Settings';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppContent: React.FC = () => {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <LoginForm /> : <Navigate to="/dashboard" replace />} />
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="room-inventory" element={<RoomInventory />} />
          <Route path="students" element={<Students />} />
          <Route path="reports" element={<Reports />} />
          <Route path="requests" element={<Requests />} />
          <Route path="keys" element={<KeyManagement />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <ThemeProvider>
      <NotificationsProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </NotificationsProvider>
    </ThemeProvider>
  );
}

export default App;