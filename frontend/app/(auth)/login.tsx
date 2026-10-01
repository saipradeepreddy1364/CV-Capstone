import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { ShieldCheck, Eye, EyeOff, Lock, Mail, Users, Sparkles } from 'lucide-react-native';
import { useAuth } from '../../src/store/authContext';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState<string>('admin@abc.edu');
  const [password, setPassword] = useState<string>('Password123!');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      await login(email.trim(), password);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please verify credentials.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('Password123!');
    setErrorMessage(null);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#090d16' }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 24,
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1.5,
              borderColor: '#6366f1',
              marginBottom: 16,
            }}
          >
            <ShieldCheck size={44} color="#818cf8" />
          </View>
          <Text style={{ color: '#f8fafc', fontSize: 26, fontWeight: '900', letterSpacing: 0.5 }}>
            Smart Attendance
          </Text>
          <Text style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>
            Face Recognition Biometric Attendance System
          </Text>
        </View>

        <Card style={{ padding: 24, borderColor: '#334155' }}>
          <Text style={{ color: '#f8fafc', fontSize: 18, fontWeight: '800', marginBottom: 20 }}>
            Sign In to Organization
          </Text>

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

          {/* Email Input */}
          <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '700', marginBottom: 6 }}>
            INSTITUTION EMAIL
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#0f172a',
              borderRadius: 12,
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
              placeholder="e.g. admin@abc.edu"
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
              borderRadius: 12,
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
              placeholder="••••••••••••"
              placeholderTextColor="#475569"
              secureTextEntry={!showPassword}
              style={{ flex: 1, paddingVertical: 12, color: '#f8fafc', fontSize: 14 }}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
              {showPassword ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
            </TouchableOpacity>
          </View>

          <Button title="Sign In" onPress={handleLogin} loading={isLoading} size="lg" />

          {/* Quick Demo Credentials */}
          <View style={{ marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#334155' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Sparkles size={16} color="#818cf8" style={{ marginRight: 6 }} />
              <Text style={{ color: '#818cf8', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' }}>
                Quick Demo Role Presets
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              <TouchableOpacity
                onPress={() => fillCredentials('admin@abc.edu')}
                style={{
                  backgroundColor: '#0f172a',
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#334155',
                }}
              >
                <Text style={{ color: '#f8fafc', fontSize: 12, fontWeight: '600' }}>Admin Demo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => fillCredentials('faculty1@abc.edu')}
                style={{
                  backgroundColor: '#0f172a',
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#334155',
                }}
              >
                <Text style={{ color: '#f8fafc', fontSize: 12, fontWeight: '600' }}>Faculty Demo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => fillCredentials('stu001@abc.edu')}
                style={{
                  backgroundColor: '#0f172a',
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#334155',
                }}
              >
                <Text style={{ color: '#f8fafc', fontSize: 12, fontWeight: '600' }}>Student Demo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
