import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useAuth } from '../../src/store/authContext';
import { Header } from '../../src/components/Header';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { User, Mail, Phone, Building2, ShieldCheck, LogOut } from 'lucide-react-native';

export default function FacultyProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={{ flex: 1, backgroundColor: '#090d16' }}>
      <Header title="Faculty Profile" subtitle="Your academic staff credentials" />

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Card style={{ alignItems: 'center', padding: 24, marginBottom: 16 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 12,
              borderWidth: 2,
              borderColor: '#6366f1',
            }}
          >
            <User size={36} color="#818cf8" />
          </View>
          <Text style={{ color: '#f8fafc', fontSize: 20, fontWeight: '800' }}>
            {user?.fullName}
          </Text>
          <View style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 6 }}>
            <Text style={{ color: '#818cf8', fontSize: 12, fontWeight: '700' }}>
              Faculty ID: {user?.identificationNumber || 'FAC001'}
            </Text>
          </View>
        </Card>

        <Card>
          <Text style={{ color: '#f8fafc', fontSize: 16, fontWeight: '800', marginBottom: 16 }}>
            Account & Institution Information
          </Text>

          <View style={{ gap: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Mail size={18} color="#64748b" style={{ marginRight: 12 }} />
              <View>
                <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '600' }}>EMAIL</Text>
                <Text style={{ color: '#f8fafc', fontSize: 14, fontWeight: '500' }}>{user?.email}</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Building2 size={18} color="#64748b" style={{ marginRight: 12 }} />
              <View>
                <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '600' }}>ORGANIZATION</Text>
                <Text style={{ color: '#f8fafc', fontSize: 14, fontWeight: '500' }}>{user?.organizationName || 'ABC University'}</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ShieldCheck size={18} color="#64748b" style={{ marginRight: 12 }} />
              <View>
                <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '600' }}>AUTHORIZATION ROLE</Text>
                <Text style={{ color: '#10b981', fontSize: 14, fontWeight: '700' }}>{user?.role}</Text>
              </View>
            </View>
          </View>
        </Card>

        <Button
          title="Sign Out"
          onPress={logout}
          variant="danger"
          icon={<LogOut size={16} color="#ffffff" />}
          size="lg"
        />
      </ScrollView>
    </View>
  );
}
