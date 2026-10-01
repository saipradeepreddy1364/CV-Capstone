import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { storage } from '../lib/storage';
import { apiClient } from '../api/client';
import { UserDto, RoleType } from '../types';

interface AuthContextType {
  user: UserDto | null;
  role: RoleType | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  token: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await storage.getItem('smart_attendance_access_token');
      const storedUser = await storage.getItem('smart_attendance_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to restore session:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await apiClient.post('/auth/login', { email, password });
    const { accessToken, refreshToken, user: authUser } = res.data.data;

    await storage.setItem('smart_attendance_access_token', accessToken);
    await storage.setItem('smart_attendance_refresh_token', refreshToken);
    await storage.setItem('smart_attendance_user', JSON.stringify(authUser));

    setToken(accessToken);
    setUser(authUser);

    // Route based on role
    navigateByRole(authUser.role);
  };

  const logout = async () => {
    await storage.removeItem('smart_attendance_access_token');
    await storage.removeItem('smart_attendance_refresh_token');
    await storage.removeItem('smart_attendance_user');
    setToken(null);
    setUser(null);
    router.replace('/(auth)/login');
  };

  const refreshUser = async () => {
    try {
      const res = await apiClient.get('/auth/me');
      const updatedUser = res.data.data;
      setUser(updatedUser);
      await storage.setItem('smart_attendance_user', JSON.stringify(updatedUser));
    } catch (e) {
      console.error('Failed to refresh user:', e);
    }
  };

  const navigateByRole = (userRole: RoleType) => {
    switch (userRole) {
      case 'ORGANIZATION_ADMIN':
        router.replace('/(admin)/dashboard');
        break;
      case 'FACULTY':
        router.replace('/(faculty)/dashboard');
        break;
      case 'STUDENT':
        router.replace('/(student)/dashboard');
        break;
      default:
        router.replace('/(auth)/login');
    }
  };

  // Route protection
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    if (!token && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (token && inAuthGroup && user) {
      navigateByRole(user.role);
    }
  }, [token, segments, isLoading, user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        token,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
