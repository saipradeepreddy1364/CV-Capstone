import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../src/api/client';
import { DepartmentDto } from '../../src/types';
import { Header } from '../../src/components/Header';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { Building2, Plus, Trash2 } from 'lucide-react-native';

export default function AdminDepartmentsScreen() {
  const queryClient = useQueryClient();
  const [name, setName] = useState<string>('');
  const [code, setCode] = useState<string>('');

  const { data: departments = [], isLoading, refetch, isRefetching } = useQuery<DepartmentDto[]>({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await apiClient.get('/departments');
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: { name: string; code: string }) => {
      const res = await apiClient.post('/departments', payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setName('');
      setCode('');
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create department');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/departments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'Failed to delete department');
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#090d16' }}>
      <Header title="Departments" subtitle="Academic faculties and university divisions" showBack />

      <View style={{ padding: 20, flex: 1 }}>
        {/* Create Department Form */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ color: '#f8fafc', fontSize: 15, fontWeight: '800', marginBottom: 12 }}>
            Add Department
          </Text>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Name (e.g. Mechanical Eng)"
              placeholderTextColor="#64748b"
              style={{ flex: 2, backgroundColor: '#0f172a', color: '#f8fafc', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#334155', fontSize: 13 }}
            />
            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder="Code (ME)"
              placeholderTextColor="#64748b"
              style={{ flex: 1, backgroundColor: '#0f172a', color: '#f8fafc', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#334155', fontSize: 13 }}
            />
          </View>
          <Button
            title="Create"
            onPress={() => {
              if (name && code) createMutation.mutate({ name, code });
            }}
            loading={createMutation.isPending}
            size="sm"
            icon={<Plus size={14} color="#ffffff" />}
          />
        </Card>

        {/* List */}
        <FlatList
          data={departments}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366f1" />}
          renderItem={({ item }) => (
            <Card style={{ marginBottom: 10, padding: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(99, 102, 241, 0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                    <Building2 size={18} color="#818cf8" />
                  </View>
                  <View>
                    <Text style={{ color: '#f8fafc', fontSize: 15, fontWeight: '700' }}>{item.name}</Text>
                    <Text style={{ color: '#64748b', fontSize: 12 }}>Code: {item.code}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => deleteMutation.mutate(item.id)}
                  style={{ padding: 8, backgroundColor: 'rgba(239, 68, 68, 0.15)', borderRadius: 8 }}
                >
                  <Trash2 size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </Card>
          )}
        />
      </View>
    </View>
  );
}
