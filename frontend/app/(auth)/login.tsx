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
import { ShieldCheck, Eye, EyeOff, Lock, Mail, User, Building2 } from 'lucide-react-native';
import { useAuth } from '../../src/store/authContext';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { RoleType } from '../../src/types';

export default function LoginScreen() {
  const { login, register } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);

  // Form states
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [role, setRole] = useState<RoleType>('ORGANIZATION_ADMIN');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      if (isRegisterMode) {
        if (!firstName.trim() || !lastName.trim()) {
          setErrorMessage('Please enter both your first and last name.');
          return;
        }
        await register({
          email: email.trim(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          role,
        });
      } else {
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
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1.5,
              borderColor: '#6366f1',
              marginBottom: 14,
            }}
          >
            <ShieldCheck size={40} color="#818cf8" />
          </View>
          <Text style={{ color: '#f8fafc', fontSize: 24, fontWeight: '900', letterSpacing: 0.5 }}>
            Smart Attendance
          </Text>
          <Text style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>
            Face Recognition Biometric Attendance System
          </Text>
        </View>

        <Card style={{ padding: 24, borderColor: '#334155' }}>
          {/* Mode Switcher Tabs */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: '#0f172a',
              borderRadius: 10,
              padding: 4,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: '#334155',
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setIsRegisterMode(false);
                setErrorMessage(null);
              }}
              style={{
                flex: 1,
                paddingVertical: 8,
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
                paddingVertical: 8,
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
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

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
              <Text style={{ color: '#ef4444', fontSize: 13, fontWeight: '600' }}>{errorMessage}</Text>
            </View>
          )}

          {/* Registration Extra Fields */}
          {isRegisterMode && (
            <>
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
                      backgroundColor: '#0f172a',
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
                      backgroundColor: '#0f172a',
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

              <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '700', marginBottom: 6 }}>
                ROLE TYPE
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                {(['ORGANIZATION_ADMIN', 'FACULTY', 'STUDENT'] as RoleType[]).map((r) => (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setRole(r)}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      alignItems: 'center',
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: role === r ? '#6366f1' : '#334155',
                      backgroundColor: role === r ? 'rgba(99, 102, 241, 0.2)' : '#0f172a',
                    }}
                  >
                    <Text
                      style={{
                        color: role === r ? '#818cf8' : '#94a3b8',
                        fontSize: 11,
                        fontWeight: '700',
                      }}
                    >
                      {r === 'ORGANIZATION_ADMIN' ? 'Admin' : r === 'FACULTY' ? 'Faculty' : 'Student'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Email Input */}
          <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '700', marginBottom: 6 }}>
            EMAIL ADDRESS
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#0f172a',
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
              placeholder="Enter your email"
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
              backgroundColor: '#0f172a',
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

          <Button
            title={isRegisterMode ? 'Create Account & Sign In' : 'Sign In'}
            onPress={handleSubmit}
            loading={isLoading}
            size="lg"
          />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
