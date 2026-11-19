import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useAuth } from '../src/store/authContext';
import { ShieldCheck, ArrowRight } from 'lucide-react-native';

export default function Index() {
  const { isLoading, token, user } = useAuth();
  const router = useRouter();
  const [showFallback, setShowFallback] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFallback(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    if (!token || !user) {
      router.replace('/(auth)/login');
    } else {
      switch (user.role) {
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
    }
  }, [isLoading, token, user]);

  if (!isLoading) {
    if (token && user) {
      switch (user.role) {
        case 'ORGANIZATION_ADMIN':
          return <Redirect href="/(admin)/dashboard" />;
        case 'FACULTY':
          return <Redirect href="/(faculty)/dashboard" />;
        case 'STUDENT':
          return <Redirect href="/(student)/dashboard" />;
        default:
          return <Redirect href="/(auth)/login" />;
      }
    }
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#090d16',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
      }}
    >
      <View
        style={{
          width: 84,
          height: 84,
          borderRadius: 24,
          backgroundColor: 'rgba(99, 102, 241, 0.15)',
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1.5,
          borderColor: '#6366f1',
          marginBottom: 20,
        }}
      >
        <ShieldCheck size={48} color="#818cf8" />
      </View>
      <Text style={{ color: '#f8fafc', fontSize: 24, fontWeight: '900', letterSpacing: 0.5 }}>
        Smart Attendance
      </Text>
      <Text style={{ color: '#94a3b8', fontSize: 13, marginTop: 6, marginBottom: 24 }}>
        AI Face Biometric Verification Platform
      </Text>
      <ActivityIndicator size="large" color="#6366f1" />

      {showFallback && (
        <TouchableOpacity
          onPress={() => router.replace('/(auth)/login')}
          style={{
            marginTop: 28,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#6366f1',
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 14, marginRight: 8 }}>
            Continue to Login
          </Text>
          <ArrowRight size={16} color="#ffffff" />
        </TouchableOpacity>
      )}
    </View>
  );
}
