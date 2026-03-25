import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../ui/button';
import { LogOut, User, Shield, Briefcase, Car } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'ADMIN':
        return <Shield className="size-5" />;
      case 'EMPLOYEE':
        return <Briefcase className="size-5" />;
      case 'STUDENT':
        return <User className="size-5" />;
      default:
        return <User className="size-5" />;
    }
  };

  const getRoleColor = () => {
    switch (user?.role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-700';
      case 'EMPLOYEE':
        return 'bg-blue-100 text-blue-700';
      case 'STUDENT':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${getRoleColor()}`}>
                {getRoleIcon()}
              </div>
              <div>
                <h1 className="text-xl font-bold">Online Job Portal</h1>
                <p className="text-sm text-gray-500">{user?.role} Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{user?.username}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <Button variant="outline" onClick={logout} className="gap-2">
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>© 2026 Online Job Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
