import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast/Toast';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Auth pages
import LoginPage from './pages/Auth/LoginPage';
import SignupResident from './pages/Auth/SignupResident';
import SignupAdmin from './pages/Auth/SignupAdmin';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';

// Manager pages
import ManagerDashboard from './pages/Manager/ManagerDashboard';
import DuesManagement from './pages/Manager/DuesManagement';
import MaintenanceManagement from './pages/Manager/MaintenanceManagement';
import AnnouncementManagement from './pages/Manager/AnnouncementManagement';
import ReservationManagement from './pages/Manager/ReservationManagement';
import ParkingManagement from './pages/Manager/ParkingManagement';
import UserManagement from './pages/Manager/UserManagement';
import CommonAreasManagement from './pages/Manager/CommonAreasManagement';

// Resident pages
import ResidentDashboard from './pages/Resident/ResidentDashboard';
import DuesPayment from './pages/Resident/DuesPayment';
import MaintenanceRequests from './pages/Resident/MaintenanceRequests';
import Announcements from './pages/Resident/Announcements';
import Reservations from './pages/Resident/Reservations';
import ResidentParking from './pages/Resident/Parking';

// Security pages
import SecurityDashboard from './pages/Security/SecurityDashboard';
import VisitorManagement from './pages/Security/VisitorManagement';

// Settings
import Settings from './pages/Settings/Settings';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup/resident" element={<SignupResident />} />
            <Route path="/signup/admin" element={<SignupAdmin />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Manager routes */}
            <Route path="/manager" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManagerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/manager/dues" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DuesManagement />
              </ProtectedRoute>
            } />
            <Route path="/manager/maintenance" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <MaintenanceManagement />
              </ProtectedRoute>
            } />
            <Route path="/manager/announcements" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AnnouncementManagement />
              </ProtectedRoute>
            } />
            <Route path="/manager/reservations" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ReservationManagement />
              </ProtectedRoute>
            } />
            <Route path="/manager/parking" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ParkingManagement />
              </ProtectedRoute>
            } />
            <Route path="/manager/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="/manager/common-areas" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CommonAreasManagement />
              </ProtectedRoute>
            } />
            
            {/* Resident routes */}
            <Route path="/resident" element={
              <ProtectedRoute allowedRoles={['resident']}>
                <ResidentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/resident/dues" element={
              <ProtectedRoute allowedRoles={['resident']}>
                <DuesPayment />
              </ProtectedRoute>
            } />
            <Route path="/resident/maintenance" element={
              <ProtectedRoute allowedRoles={['resident']}>
                <MaintenanceRequests />
              </ProtectedRoute>
            } />
            <Route path="/resident/announcements" element={
              <ProtectedRoute allowedRoles={['resident']}>
                <Announcements />
              </ProtectedRoute>
            } />
            <Route path="/resident/reservations" element={
              <ProtectedRoute allowedRoles={['resident']}>
                <Reservations />
              </ProtectedRoute>
            } />
            <Route path="/resident/parking" element={
              <ProtectedRoute allowedRoles={['resident']}>
                <ResidentParking />
              </ProtectedRoute>
            } />
            
            {/* Security routes */}
            <Route path="/security" element={
              <ProtectedRoute allowedRoles={['security']}>
                <SecurityDashboard />
              </ProtectedRoute>
            } />
            <Route path="/security/visitors" element={
              <ProtectedRoute allowedRoles={['security']}>
                <VisitorManagement />
              </ProtectedRoute>
            } />
            
            {/* Settings route - accessible to all authenticated users */}
            <Route path="/settings" element={
              <ProtectedRoute allowedRoles={['admin', 'resident', 'security']}>
                <Settings />
              </ProtectedRoute>
            } />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
