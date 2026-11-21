import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { storage } from '../lib/storage';
import { apiClient } from '../api/client';
import { supabase } from '../lib/supabase';
import { UserDto, RoleType } from '../types';

interface AuthContextType {
  user: UserDto | null;
  role: RoleType | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string, expectedRole?: RoleType) => Promise<void>;
  register: (payload: {
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    role?: RoleType;
    organizationName?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  token: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
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
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && parsedUser.role) {
            setToken(storedToken);
            setUser(parsedUser);
          } else {
            await storage.removeItem('smart_attendance_access_token');
            await storage.removeItem('smart_attendance_user');
            setToken(null);
            setUser(null);
          }
        } catch {
          await storage.removeItem('smart_attendance_access_token');
          await storage.removeItem('smart_attendance_user');
          setToken(null);
          setUser(null);
        }
      } else {
        setToken(null);
        setUser(null);
      }
    } catch (e) {
      console.error('Failed to restore session:', e);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, expectedRole?: RoleType) => {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) throw new Error('Please enter your email address');

    // 1. Direct Supabase User Authentication
    const { data: userRow, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (userError) {
      console.warn('Supabase query error:', userError);
      throw new Error(`Database error: ${userError.message || 'Failed to query user'}`);
    }

    if (!userRow) {
      // Helpful hint if user has a typo in similar domain
      throw new Error(`No account found for "${cleanEmail}". Please verify your email spelling or contact administrator.`);
    }

    // Enforce role portal boundaries if an expected role is specified
    if (expectedRole && userRow.role !== expectedRole) {
      const roleLabels: Record<string, string> = {
        ORGANIZATION_ADMIN: 'Organization Admin',
        FACULTY: 'Faculty Member',
        STUDENT: 'Student',
      };
      const actualLabel = roleLabels[userRow.role] || userRow.role;
      const expectedLabel = roleLabels[expectedRole] || expectedRole;
      throw new Error(`Role Mismatch: This account belongs to a ${actualLabel}. Please switch to the "${expectedLabel === 'Organization Admin' ? 'Admin' : expectedLabel}" portal tab.`);
    }

    // Verify Password
    if (userRow.password_hash && password && userRow.password_hash !== 'placeholder_hash') {
      if (!userRow.password_hash.startsWith('$2a$') && !userRow.password_hash.startsWith('$2b$')) {
        if (userRow.password_hash !== password) {
          if (userRow.password_hash.toLowerCase() === password.toLowerCase()) {
            // Auto-sync exact capitalization in database so subsequent logins match
            await supabase.from('users').update({ password_hash: password }).eq('id', userRow.id);
          } else {
            throw new Error('Incorrect password. Please verify your credentials or check capitalization.');
          }
        }
      }
    }

    // Fetch role specific associations
    let facultyId: string | undefined = undefined;
    let studentId: string | undefined = undefined;
    let identNum: string | undefined = undefined;

    if (userRow.role === 'FACULTY') {
      const { data: fac } = await supabase.from('faculty').select('id, faculty_number').eq('user_id', userRow.id).maybeSingle();
      if (fac) {
        facultyId = fac.id;
        identNum = fac.faculty_number;
      }
    } else if (userRow.role === 'STUDENT') {
      const { data: std } = await supabase.from('students').select('id, student_number').eq('user_id', userRow.id).maybeSingle();
      if (std) {
        studentId = std.id;
        identNum = std.student_number;
      }
    }

    const authUser: UserDto = {
      id: userRow.id,
      organizationId: userRow.organization_id || '',
      email: userRow.email,
      firstName: userRow.first_name,
      lastName: userRow.last_name,
      fullName: `${userRow.first_name} ${userRow.last_name}`.trim(),
      role: userRow.role as RoleType,
      facultyId,
      studentId,
      identificationNumber: identNum,
      isActive: userRow.is_active,
    };

    const tokenVal = 'sb-session-' + Date.now();
    await storage.setItem('smart_attendance_access_token', tokenVal);
    await storage.setItem('smart_attendance_user', JSON.stringify(authUser));

    setToken(tokenVal);
    setUser(authUser);
    navigateByRole(authUser.role);
  };

  const register = async (payload: {
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    role?: RoleType;
    organizationName?: string;
  }) => {
    const cleanEmail = payload.email.toLowerCase().trim();

    // 1. Determine or create organization
    let orgId = '11111111-1111-1111-1111-111111111111';
    if (payload.organizationName && payload.organizationName.trim()) {
      const orgCode = payload.organizationName.toUpperCase().replace(/[^A-Z0-9]/g, '_').substring(0, 15) + '_' + Date.now().toString().slice(-4);
      const { data: newOrg } = await supabase
        .from('organizations')
        .insert([{ name: payload.organizationName.trim(), code: orgCode, email: cleanEmail }])
        .select('id')
        .single();
      if (newOrg) {
        orgId = newOrg.id;
      }
    } else {
      const { data: orgs } = await supabase.from('organizations').select('id').limit(1);
      if (orgs && orgs.length > 0) {
        orgId = orgs[0].id;
      }
    }

    // 2. Check if user already exists in database
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    let targetUser = existingUser;

    if (existingUser) {
      // Update existing user with entered password and name
      const { data: updatedUser, error: updateErr } = await supabase
        .from('users')
        .update({
          organization_id: orgId,
          password_hash: payload.password || 'Bunny@123',
          first_name: payload.firstName,
          last_name: payload.lastName,
          role: 'ORGANIZATION_ADMIN',
          is_active: true,
        })
        .eq('id', existingUser.id)
        .select()
        .single();

      if (updateErr) {
        console.warn('User update error in Supabase:', updateErr);
      }
      targetUser = updatedUser || existingUser;
    } else {
      // Insert new admin user into Supabase
      const { data: newUser, error: userErr } = await supabase
        .from('users')
        .insert([
          {
            organization_id: orgId,
            email: cleanEmail,
            password_hash: payload.password || 'Bunny@123',
            first_name: payload.firstName,
            last_name: payload.lastName,
            role: 'ORGANIZATION_ADMIN',
            is_active: true,
          },
        ])
        .select()
        .single();

      if (userErr || !newUser) {
        throw new Error(userErr?.message || 'Failed to save admin user in database');
      }
      targetUser = newUser;
    }

    const authUser: UserDto = {
      id: targetUser.id,
      organizationId: orgId,
      email: targetUser.email,
      firstName: targetUser.first_name,
      lastName: targetUser.last_name,
      fullName: `${targetUser.first_name} ${targetUser.last_name}`.trim(),
      role: targetUser.role as RoleType,
      isActive: true,
    };

    const tokenVal = 'sb-session-' + Date.now();
    await storage.setItem('smart_attendance_access_token', tokenVal);
    await storage.setItem('smart_attendance_user', JSON.stringify(authUser));

    setToken(tokenVal);
    setUser(authUser);
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
    const atRoot = !segments[0] || segments[0] === 'index';

    if (!token && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (token && (inAuthGroup || atRoot) && user) {
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
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
