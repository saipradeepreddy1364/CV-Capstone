import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../src/api/client';
import { useAuth } from '../../src/store/authContext';
import { OrganizationDto, UpdateOrganizationRequest } from '../../src/types';
import { Header } from '../../src/components/Header';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { Building2, Mail, Phone, MapPin, Save } from 'lucide-react-native';

export default function AdminOrganizationScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');

  const orgId = user?.organizationId;

  const { data: org, isLoading } = useQuery<OrganizationDto>({
    queryKey: ['organization_details', orgId],
    queryFn: async () => {
      if (!orgId) return null;
      const res = await apiClient.get(`/organizations/${orgId}`);
      return res.data.data;
    },
    enabled: !!orgId,
  });

  useEffect(() => {
    if (org) {
      setName(org.name || '');
      setEmail(org.email || '');
      setPhone(org.phone || '');
      setAddress(org.address || '');
    }
  }, [org]);

  const updateMutation = useMutation({
    mutationFn: async (payload: UpdateOrganizationRequest) => {
      const res = await apiClient.put(`/organizations/${orgId}`, payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization_details'] });
      Alert.alert('Success', 'Organization profile updated.');
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update profile');
    },
  });

  const handleSave = () => {
    if (!name) {
      Alert.alert('Validation', 'Organization name is required.');
      return;
    }
    updateMutation.mutate({ name, email, phone, address });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#090d16' }}>
      <Header title="Institution Profile" subtitle="University profile & tenant parameters" showBack />

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Building2 size={22} color="#818cf8" style={{ marginRight: 8 }} />
            <View>
              <Text style={{ color: '#f8fafc', fontSize: 17, fontWeight: '800' }}>
                {org?.name || 'Institution'}
              </Text>
              <Text style={{ color: '#64748b', fontSize: 12 }}>Code: {org?.code}</Text>
            </View>
          </View>

          <View style={{ gap: 14 }}>
            <View>
              <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '700', marginBottom: 4 }}>
                INSTITUTION NAME *
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                style={{ backgroundColor: '#0f172a', color: '#f8fafc', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#334155' }}
              />
            </View>

            <View>
              <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '700', marginBottom: 4 }}>
                ADMINISTRATIVE EMAIL
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                style={{ backgroundColor: '#0f172a', color: '#f8fafc', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#334155' }}
              />
            </View>

            <View>
              <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '700', marginBottom: 4 }}>
                CONTACT PHONE
              </Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                style={{ backgroundColor: '#0f172a', color: '#f8fafc', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#334155' }}
              />
            </View>

            <View>
              <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '700', marginBottom: 4 }}>
                CAMPUS PHYSICAL ADDRESS
              </Text>
              <TextInput
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={3}
                style={{ backgroundColor: '#0f172a', color: '#f8fafc', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#334155', minHeight: 70 }}
              />
            </View>
          </View>
        </Card>

        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={updateMutation.isPending}
          icon={<Save size={16} color="#ffffff" />}
          size="lg"
        />
      </ScrollView>
    </View>
  );
}
