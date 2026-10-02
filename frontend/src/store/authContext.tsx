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
  register: (payload: {
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    role: RoleType;
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
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) throw new Error('Please enter your email address');

    // 1. Check user directly in Supabase
    try {
      const { data: userRow, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (userError) {
        console.warn('Supabase query error:', userError);
      }

      if (userRow) {
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
        return;
      }
    } catch (e: any) {
      console.warn('Supabase login check:', e.message);
    }

    // 2. Try backend login API if configured
    try {
      const res = await apiClient.post('/auth/login', { email: cleanEmail, password });
      const { accessToken, refreshToken, user: authUser } = res.data.data;

      await storage.setItem('smart_attendance_access_token', accessToken);
      await storage.setItem('smart_attendance_refresh_token', refreshToken);
      await storage.setItem('smart_attendance_user', JSON.stringify(authUser));

      setToken(accessToken);
      setUser(authUser);
      navigateByRole(authUser.role);
      return;
    } catch (err: any) {
      // If no user found in Supabase or backend
      throw new Error(`No account found for "${cleanEmail}" in your Supabase database. Please create a user or register.`);
    }
  };

  const register = async (payload: {
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    role: RoleType;
    organizationName?: string;
  }) => {
    const cleanEmail = payload.email.toLowerCase().trim();

    // Ensure organization exists in Supabase
    let orgId = '11111111-1111-1111-1111-111111111111';
    const { data: orgs } = await supabase.from('organizations').select('id').limit(1);
    if (orgs && orgs.length > 0) {
      orgId = orgs[0].id;
    } else {
      const { data: newOrg } = await supabase
        .from('organizations')
        .insert([{ name: payload.organizationName || 'My University', code: 'ORG_' + Date.now() }])
        .select()
        .single();
      if (newOrg) orgId = newOrg.id;
    }

    // Insert user into Supabase
    const { data: newUser, error: userErr } = await supabase
      .from('users')
      .insert([
        {
          organization_id: orgId,
          email: cleanEmail,
          password_hash: payload.password || 'default_hash',
          first_name: payload.firstName,
          last_name: payload.lastName,
          role: payload.role,
          is_active: true,
        },
      ])
      .select()
      .single();

    if (userErr || !newUser) {
      throw new Error(userErr?.message || 'Failed to create user in Supabase');
    }

    let facultyId: string | undefined = undefined;
    let studentId: string | undefined = undefined;

    if (payload.role === 'FACULTY') {
      const { data: fac } = await supabase.from('faculty').insert([
        {
          organization_id: orgId,
          user_id: newUser.id,
          faculty_number: 'FAC_' + Math.floor(100 + Math.random() * 900),
          designation: 'Professor',
        },
      ]).select().single();
      if (fac) facultyId = fac.id;
    } else if (payload.role === 'STUDENT') {
      const { data: std } = await supabase.from('students').insert([
        {
          organization_id: orgId,
          user_id: newUser.id,
          student_number: 'STU_' + Math.floor(1000 + Math.random() * 9000),
          batch_year: '2024',
          semester: '1',
          has_face_registered: false,
        },
      ]).select().single();
      if (std) studentId = std.id;
    }

    const authUser: UserDto = {
      id: newUser.id,
      organizationId: orgId,
      email: newUser.email,
      firstName: newUser.first_name,
      lastName: newUser.last_name,
      fullName: `${newUser.first_name} ${newUser.last_name}`.trim(),
      role: newUser.role as RoleType,
      facultyId,
      studentId,
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
