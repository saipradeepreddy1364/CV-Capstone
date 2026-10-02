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
  Building2,
  BookOpen,
  GraduationCap,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Info,
} from 'lucide-react-native';
import { useAuth } from '../../src/store/authContext';
import { Card } from '../../src/components/Card';
import { RoleType } from '../../src/types';

interface PortalConfig {
  role: RoleType;
  title: string;
  badge: string;
  subtitle: string;
  primaryColor: string;
  lightColor: string;
  bgLight: string;
  icon: any;
}

const PORTALS: PortalConfig[] = [
  {
    role: 'ORGANIZATION_ADMIN',
    title: 'Organization Admin',
    badge: 'ADMINISTRATION',
    subtitle: 'Institutional control, departments, courses & faculty management',
    primaryColor: '#6366f1',
    lightColor: '#818cf8',
    bgLight: 'rgba(99, 102, 241, 0.15)',
    icon: Building2,
  },
  {
    role: 'FACULTY',
    title: 'Faculty Portal',
    badge: 'FACULTY MEMBER',
    subtitle: 'Conduct live biometric attendance, review student roll & subject classes',
    primaryColor: '#0284c7',
    lightColor: '#38bdf8',
    bgLight: 'rgba(2, 132, 199, 0.15)',
    icon: BookOpen,
  },
  {
    role: 'STUDENT',
    title: 'Student Portal',
    badge: 'STUDENT ACCESS',
    subtitle: 'Check biometric attendance, percentage analytics & register face profile',
    primaryColor: '#059669',
    lightColor: '#34d399',
    bgLight: 'rgba(5, 150, 105, 0.15)',
    icon: GraduationCap,
  },
];

export default function LoginScreen() {
  const { login, register } = useAuth();
  const [selectedRole, setSelectedRole] = useState<RoleType>('ORGANIZATION_ADMIN');
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);

  // Common form states
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Admin registration field
  const [organizationName, setOrganizationName] = useState<string>('');

  const currentPortal = PORTALS.find((p) => p.role === selectedRole) || PORTALS[0];
  const PortalIcon = currentPortal.icon;

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

      if (isRegisterMode && selectedRole === 'ORGANIZATION_ADMIN') {
        if (!firstName.trim() || !lastName.trim()) {
          setErrorMessage('Please enter both your first and last name.');
          return;
        }

        await register({
          email: email.trim(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          role: 'ORGANIZATION_ADMIN',
          organizationName: organizationName.trim() || undefined,
        });
      } else {
        // Enforce portal-specific role login
        await login(email.trim(), password, selectedRole);
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
          maxWidth: 540,
          width: '100%',
          alignSelf: 'center',
        }}
      >
        {/* Dynamic Portal Hero */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 22,
              backgroundColor: currentPortal.bgLight,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: currentPortal.lightColor,
              marginBottom: 14,
              shadowColor: currentPortal.primaryColor,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
            }}
          >
            <PortalIcon size={38} color={currentPortal.lightColor} />
          </View>
          <View
            style={{
              backgroundColor: currentPortal.bgLight,
              paddingHorizontal: 12,
              paddingVertical: 3,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: currentPortal.lightColor,
              marginBottom: 6,
            }}
          >
            <Text
              style={{
                color: currentPortal.lightColor,
                fontSize: 10,
                fontWeight: '800',
                letterSpacing: 1,
              }}
            >
              {currentPortal.badge}
            </Text>
          </View>
          <Text style={{ color: '#f8fafc', fontSize: 24, fontWeight: '900', letterSpacing: 0.5 }}>
            {currentPortal.title}
          </Text>
          <Text
            style={{
              color: '#94a3b8',
              fontSize: 13,
              marginTop: 4,
              textAlign: 'center',
              paddingHorizontal: 16,
            }}
          >
            {currentPortal.subtitle}
          </Text>
        </View>

        {/* 3 Distinct Portal Selectors */}
        <View style={{ marginBottom: 18 }}>
          <Text
            style={{
              color: '#64748b',
              fontSize: 11,
              fontWeight: '800',
              letterSpacing: 0.8,
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            SELECT LOGIN PORTAL
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {PORTALS.map((portal) => {
              const isSelected = selectedRole === portal.role;
              const TabIcon = portal.icon;
              return (
                <TouchableOpacity
                  key={portal.role}
                  onPress={() => {
                    setSelectedRole(portal.role);
                    setIsRegisterMode(false);
                    setErrorMessage(null);
                  }}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    paddingHorizontal: 6,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 12,
                    borderWidth: 1.5,
                    borderColor: isSelected ? portal.lightColor : '#1e293b',
                    backgroundColor: isSelected ? portal.bgLight : '#0f172a',
                  }}
                >
                  <TabIcon
                    size={20}
                    color={isSelected ? portal.lightColor : '#64748b'}
                    style={{ marginBottom: 4 }}
                  />
                  <Text
                    style={{
                      color: isSelected ? '#ffffff' : '#94a3b8',
                      fontSize: 12,
                      fontWeight: isSelected ? '800' : '600',
                      textAlign: 'center',
                    }}
                    numberOfLines={1}
                  >
                    {portal.role === 'ORGANIZATION_ADMIN'
                      ? 'Admin'
                      : portal.role === 'FACULTY'
                      ? 'Faculty'
                      : 'Student'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Card style={{ padding: 24, borderColor: '#1e293b', backgroundColor: '#0f172a' }}>
          {/* Mode Switcher: Only Organization Admin can self-register an institution */}
          {selectedRole === 'ORGANIZATION_ADMIN' ? (
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: '#090d16',
                borderRadius: 10,
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
                  paddingVertical: 9,
                  alignItems: 'center',
                  backgroundColor: !isRegisterMode ? currentPortal.primaryColor : 'transparent',
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
                  Admin Sign In
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setIsRegisterMode(true);
                  setErrorMessage(null);
                }}
                style={{
                  flex: 1,
                  paddingVertical: 9,
                  alignItems: 'center',
                  backgroundColor: isRegisterMode ? currentPortal.primaryColor : 'transparent',
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
                  Register Institution
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Faculty and Student Informational Banner */
            <View
              style={{
                backgroundColor: currentPortal.bgLight,
                borderWidth: 1,
                borderColor: currentPortal.lightColor,
                borderRadius: 10,
                padding: 12,
                marginBottom: 20,
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 10,
              }}
            >
              <ShieldCheck size={20} color={currentPortal.lightColor} style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: '800',
                    marginBottom: 2,
                  }}
                >
                  Admin-Provisioned Account Only
                </Text>
                <Text
                  style={{
                    color: '#cbd5e1',
                    fontSize: 12,
                    lineHeight: 17,
                  }}
                >
                  {selectedRole === 'FACULTY'
                    ? 'Faculty accounts are created exclusively by your Institution Administrator. Please sign in with the credentials assigned to you.'
                    : 'Student accounts are created exclusively by your Institution Administrator. Please sign in with your student email and password.'}
                </Text>
              </View>
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

          {/* Registration Fields (Organization Admin Only) */}
          {isRegisterMode && selectedRole === 'ORGANIZATION_ADMIN' && (
            <>
              <View style={{ marginBottom: 14 }}>
                <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '700', marginBottom: 6 }}>
                  ORGANIZATION / INSTITUTION NAME
                </Text>
                <TextInput
                  value={organizationName}
                  onChangeText={setOrganizationName}
                  placeholder="e.g. Apex Institute of Technology"
                  placeholderTextColor="#475569"
                  style={{
                    backgroundColor: '#090d16',
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: '#334155',
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    color: '#f8fafc',
                    fontSize: 14,
                  }}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '700', marginBottom: 6 }}>
                    FIRST NAME
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
                      paddingVertical: 10,
                      color: '#f8fafc',
                      fontSize: 14,
                    }}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '700', marginBottom: 6 }}>
                    LAST NAME
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
                      paddingVertical: 10,
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
            {selectedRole === 'ORGANIZATION_ADMIN'
              ? 'ADMIN EMAIL ADDRESS'
              : selectedRole === 'FACULTY'
              ? 'FACULTY EMAIL ADDRESS'
              : 'STUDENT EMAIL ADDRESS'}
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
              placeholder={
                selectedRole === 'ORGANIZATION_ADMIN'
                  ? 'admin@university.edu'
                  : selectedRole === 'FACULTY'
                  ? 'faculty@university.edu'
                  : 'student@university.edu'
              }
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
              backgroundColor: currentPortal.primaryColor,
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: currentPortal.primaryColor,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '800', letterSpacing: 0.5 }}>
              {isLoading
                ? 'Processing...'
                : isRegisterMode
                ? 'Register Institution & Admin'
                : `Sign In to ${currentPortal.title}`}
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Footer Note */}
        {selectedRole !== 'ORGANIZATION_ADMIN' && (
          <View style={{ marginTop: 16, alignItems: 'center' }}>
            <Text style={{ color: '#64748b', fontSize: 12, textAlign: 'center' }}>
              Don't have an account yet? Please request your college or university administrator to enroll you.
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
