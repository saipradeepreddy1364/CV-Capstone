import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Building2,
  GraduationCap,
  BookOpen,
  ArrowRight,
  Info,
} from 'lucide-react-native';
import { useAuth } from '../../src/store/authContext';
import { Card } from '../../src/components/Card';

export default function LoginScreen() {
  const { login, register } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);

  // Sign In & Registration form states
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [organizationName, setOrganizationName] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      if (isRegisterMode) {
        if (!firstName.trim() || !lastName.trim()) {
          setErrorMessage('Please enter your first and last name.');
          return;
        }

        // Only Admin can register an institution
        await register({
          email: email.trim(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          organizationName: organizationName.trim() || undefined,
        });
      } else {
        // Universal login: dashboard automatically routes based on user's role in database
        await login(email.trim(), password);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Operation failed. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#090d16' }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: 24,
          maxWidth: 520,
          width: '100%',
          alignSelf: 'center',
        }}
      >
        {/* App Hero Branding */}
        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 22,
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: '#818cf8',
              marginBottom: 16,
              shadowColor: '#6366f1',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.35,
              shadowRadius: 14,
            }}
          >
            <ShieldCheck size={38} color="#818cf8" />
          </View>
          <Text style={{ color: '#f8fafc', fontSize: 26, fontWeight: '900', letterSpacing: 0.5 }}>
            Smart Attendance
          </Text>
          <Text style={{ color: '#94a3b8', fontSize: 13, marginTop: 4, textAlign: 'center' }}>
            Face Recognition Biometric Attendance System
          </Text>
        </View>

        <Card style={{ padding: 24, borderColor: '#1e293b', backgroundColor: '#0f172a' }}>
          {/* Top Switcher: Sign In vs Admin Signup */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: '#090d16',
              borderRadius: 12,
              padding: 4,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: '#1e293b',
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setIsRegisterMode(false);
                setErrorMessage(null);
              }}
              style={{
                flex: 1,
                paddingVertical: 10,
                alignItems: 'center',
                backgroundColor: !isRegisterMode ? '#6366f1' : 'transparent',
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  color: !isRegisterMode ? '#ffffff' : '#94a3b8',
                  fontSize: 13,
                  fontWeight: '700',
                }}
              >
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setIsRegisterMode(true);
                setErrorMessage(null);
              }}
              style={{
                flex: 1,
                paddingVertical: 10,
                alignItems: 'center',
                backgroundColor: isRegisterMode ? '#6366f1' : 'transparent',
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  color: isRegisterMode ? '#ffffff' : '#94a3b8',
                  fontSize: 13,
                  fontWeight: '700',
                }}
              >
                Admin Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          {/* Mode Description Banner */}
          {!isRegisterMode ? (
            <View
              style={{
                backgroundColor: 'rgba(99, 102, 241, 0.08)',
                borderWidth: 1,
                borderColor: '#334155',
                borderRadius: 10,
                padding: 12,
                marginBottom: 20,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Building2 size={14} color="#818cf8" />
                <Text style={{ color: '#818cf8', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 }}>
                  UNIVERSAL ROLE-BASED LOGIN
                </Text>
              </View>
              <Text style={{ color: '#cbd5e1', fontSize: 12, lineHeight: 17 }}>
                Enter your registered email and password. Your role (Administrator, Faculty, or Student) will be detected automatically and you will be routed to your respective dashboard.
              </Text>
            </View>
          ) : (
            <View
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                borderWidth: 1,
                borderColor: 'rgba(16, 185, 129, 0.3)',
                borderRadius: 10,
                padding: 12,
                marginBottom: 20,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Building2 size={14} color="#34d399" />
                <Text style={{ color: '#34d399', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 }}>
                  INSTITUTION ADMIN REGISTRATION
                </Text>
              </View>
              <Text style={{ color: '#cbd5e1', fontSize: 12, lineHeight: 17 }}>
                Create a new institution administrator account. Faculty and Student accounts can only be added later by the administrator from inside the Admin Dashboard.
              </Text>
            </View>
          )}

          {errorMessage && (
            <View
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                borderWidth: 1,
                borderColor: '#ef4444',
                padding: 12,
                borderRadius: 10,
                marginBottom: 16,
              }}
            >
              <Text style={{ color: '#f87171', fontSize: 13, fontWeight: '600' }}>{errorMessage}</Text>
            </View>
          )}

          {/* Admin Registration Fields */}
          {isRegisterMode && (
            <>
              <View style={{ marginBottom: 14 }}>
                <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '700', marginBottom: 6 }}>
                  INSTITUTION / UNIVERSITY NAME
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#090d16',
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: '#334155',
                    paddingHorizontal: 12,
                  }}
                >
                  <Building2 size={18} color="#64748b" style={{ marginRight: 8 }} />
                  <TextInput
                    value={organizationName}
                    onChangeText={setOrganizationName}
                    placeholder="e.g. Apex Institute of Technology"
                    placeholderTextColor="#475569"
                    style={{ flex: 1, paddingVertical: 12, color: '#f8fafc', fontSize: 14 }}
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '700', marginBottom: 6 }}>
                    ADMIN FIRST NAME
                  </Text>
                  <TextInput
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="e.g. John"
                    placeholderTextColor="#475569"
                    style={{
                      backgroundColor: '#090d16',
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: '#334155',
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                      color: '#f8fafc',
                      fontSize: 14,
                    }}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '700', marginBottom: 6 }}>
                    ADMIN LAST NAME
                  </Text>
                  <TextInput
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="e.g. Doe"
                    placeholderTextColor="#475569"
                    style={{
                      backgroundColor: '#090d16',
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: '#334155',
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                      color: '#f8fafc',
                      fontSize: 14,
                    }}
                  />
                </View>
              </View>
            </>
          )}

          {/* Email Input */}
          <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '700', marginBottom: 6 }}>
            {isRegisterMode ? 'ADMIN WORK EMAIL' : 'EMAIL ADDRESS'}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#090d16',
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#334155',
              paddingHorizontal: 12,
              marginBottom: 16,
            }}
          >
            <Mail size={18} color="#64748b" style={{ marginRight: 8 }} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder={isRegisterMode ? 'admin@university.edu' : 'name@institution.edu'}
              placeholderTextColor="#475569"
              autoCapitalize="none"
              keyboardType="email-address"
              style={{ flex: 1, paddingVertical: 12, color: '#f8fafc', fontSize: 14 }}
            />
          </View>

          {/* Password Input */}
          <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '700', marginBottom: 6 }}>
            PASSWORD
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#090d16',
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#334155',
              paddingHorizontal: 12,
              marginBottom: 24,
            }}
          >
            <Lock size={18} color="#64748b" style={{ marginRight: 8 }} />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="#475569"
              secureTextEntry={!showPassword}
              style={{ flex: 1, paddingVertical: 12, color: '#f8fafc', fontSize: 14 }}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
              {showPassword ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
            </TouchableOpacity>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            style={{
              backgroundColor: '#6366f1',
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 8,
              shadowColor: '#6366f1',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.35,
              shadowRadius: 8,
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '800', letterSpacing: 0.5 }}>
              {isLoading
                ? 'Authenticating...'
                : isRegisterMode
                ? 'Register Institution & Admin'
                : 'Sign In'}
            </Text>
            {!isLoading && <ArrowRight size={18} color="#ffffff" />}
          </TouchableOpacity>
        </Card>

        {/* Roles Indicator Card */}
        {!isRegisterMode && (
          <View
            style={{
              marginTop: 20,
              backgroundColor: '#0f172a',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#1e293b',
              padding: 16,
            }}
          >
            <Text
              style={{
                color: '#64748b',
                fontSize: 11,
                fontWeight: '800',
                letterSpacing: 0.8,
                marginBottom: 12,
                textAlign: 'center',
              }}
            >
              PORTAL ACCESS DESTINATIONS
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    backgroundColor: 'rgba(99, 102, 241, 0.15)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 6,
                  }}
                >
                  <Building2 size={18} color="#818cf8" />
                </View>
                <Text style={{ color: '#f8fafc', fontSize: 12, fontWeight: '700' }}>Admin</Text>
                <Text style={{ color: '#64748b', fontSize: 10, textAlign: 'center', marginTop: 2 }}>
                  Institutional Mgmt
                </Text>
              </View>

              <View style={{ flex: 1, alignItems: 'center' }}>
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    backgroundColor: 'rgba(2, 132, 199, 0.15)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 6,
                  }}
                >
                  <BookOpen size={18} color="#38bdf8" />
                </View>
                <Text style={{ color: '#f8fafc', fontSize: 12, fontWeight: '700' }}>Faculty</Text>
                <Text style={{ color: '#64748b', fontSize: 10, textAlign: 'center', marginTop: 2 }}>
                  Live Attendance
                </Text>
              </View>

              <View style={{ flex: 1, alignItems: 'center' }}>
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 6,
                  }}
                >
                  <GraduationCap size={18} color="#34d399" />
                </View>
                <Text style={{ color: '#f8fafc', fontSize: 12, fontWeight: '700' }}>Student</Text>
                <Text style={{ color: '#64748b', fontSize: 10, textAlign: 'center', marginTop: 2 }}>
                  Face & Records
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Note for Faculty & Students */}
        <View style={{ marginTop: 16, alignItems: 'center', paddingHorizontal: 12 }}>
          <Text style={{ color: '#64748b', fontSize: 12, textAlign: 'center', lineHeight: 18 }}>
            Faculty and Student accounts are created strictly by your Institution Administrator from within the Admin Dashboard.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
