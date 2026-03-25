import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import type { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);
      const response = await authAPI.login({ email, password });
      console.log('Login response:', response);
      
      // Create user object from login response
      const userData: User = {
        email: response.email,
        username: email.split('@')[0], // Extract username from email
        role: response.role as 'ADMIN' | 'EMPLOYEE' | 'STUDENT',
      };

      setToken(response.token);
      setUser(userData);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('Login successful, user set:', userData);
    } catch (error: any) {
      console.error('Login error:', error);
      // Pass the error object directly instead of creating a new Error
      throw error;
    }
  };

  const register = async (userData: User) => {
    try {
      console.log('Attempting registration for:', userData.email);
      const response = await authAPI.register(userData);
      console.log('Registration response:', response);
      
      // After registration, automatically log in
      if (userData.password) {
        await login(userData.email, userData.password);
      } else {
        throw new Error('Password is required for login after registration');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      // Pass the error object directly instead of creating a new Error
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
