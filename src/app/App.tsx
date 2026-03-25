import React, { useState } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { StudentDashboard } from './components/dashboards/StudentDashboard';
import { EmployeeDashboard } from './components/dashboards/EmployeeDashboard';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Toaster } from './components/ui/sonner';

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  // If not authenticated, show login or register
  if (!isAuthenticated) {
    return (
      <>
        {showRegister ? (
          <RegisterPage onSwitchToLogin={() => setShowRegister(false)} />
        ) : (
          <LoginPage onSwitchToRegister={() => setShowRegister(true)} />
        )}
      </>
    );
  }

  // Render dashboard based on user role
  const renderDashboard = () => {
    switch (user?.role) {
      case 'ADMIN':
        return <AdminDashboard />;
      case 'STUDENT':
        return <StudentDashboard />;
      case 'EMPLOYEE':
        return <EmployeeDashboard />;
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-700">Unknown Role</h2>
            <p className="text-gray-500 mt-2">
              Your account role is not recognized. Please contact support.
            </p>
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      {renderDashboard()}
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  );
}
