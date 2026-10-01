import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '../src/store/authContext';
import { ShieldCheck } from 'lucide-react-native';

export default function Index() {
  const { isLoading } = useAuth();

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
    </View>
  );
}
