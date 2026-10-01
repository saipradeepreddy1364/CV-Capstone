import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LogOut, ArrowLeft, UserCircle } from 'lucide-react-native';
import { useAuth } from '../store/authContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, showBack = false }) => {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <View
      style={{
        backgroundColor: '#0f172a',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        {showBack && (
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              padding: 8,
              marginRight: 10,
              backgroundColor: '#1e293b',
              borderRadius: 8,
            }}
          >
            <ArrowLeft size={20} color="#f8fafc" />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#f8fafc', fontSize: 20, fontWeight: '800', letterSpacing: 0.2 }}>
            {title}
          </Text>
          {subtitle && (
            <Text style={{ color: '#94a3b8', fontSize: 13, marginTop: 2 }}>{subtitle}</Text>
          )}
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {user && (
          <View
            style={{
              backgroundColor: '#1e293b',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#475569',
            }}
          >
            <Text style={{ color: '#818cf8', fontSize: 11, fontWeight: '700' }}>
              {user.role === 'ORGANIZATION_ADMIN'
                ? 'ADMIN'
                : user.role}
            </Text>
          </View>
        )}

        <TouchableOpacity
          onPress={logout}
          style={{
            padding: 8,
            backgroundColor: '#1e293b',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#334155',
          }}
        >
          <LogOut size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
