import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../src/api/client';
import { SubjectDto, DepartmentDto, CourseDto } from '../../src/types';
import { Header } from '../../src/components/Header';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { FileSpreadsheet, Plus, Trash2 } from 'lucide-react-native';

export default function AdminSubjectsScreen() {
  const queryClient = useQueryClient();
  const [name, setName] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [credits, setCredits] = useState<string>('3');
  const [departmentId, setDepartmentId] = useState<string>('');

  const { data: subjects = [], isLoading, refetch, isRefetching } = useQuery<SubjectDto[]>({
    queryKey: ['subjects'],
    queryFn: async () => {
      const res = await apiClient.get('/subjects');
      return res.data.data;
    },
  });

  const { data: departments = [] } = useQuery<DepartmentDto[]>({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await apiClient.get('/departments');
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: { name: string; code: string; credits: number; departmentId: string }) => {
      const res = await apiClient.post('/subjects', payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      setName('');
      setCode('');
      setCredits('3');
      setDepartmentId('');
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create subject');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/subjects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'Failed to delete subject');
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#090d16' }}>
      <Header title="Subjects & Modules" subtitle="Manage course subjects and curriculum credits" showBack />

      <View style={{ padding: 20, flex: 1 }}>
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ color: '#f8fafc', fontSize: 15, fontWeight: '800', marginBottom: 12 }}>
            Add Subject
          </Text>
          <View style={{ gap: 10 }}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Subject Name (e.g. Cloud Computing)"
              placeholderTextColor="#64748b"
              style={{ backgroundColor: '#0f172a', color: '#f8fafc', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#334155', fontSize: 13 }}
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput
                value={code}
                onChangeText={setCode}
                placeholder="Code (CS401)"
                placeholderTextColor="#64748b"
                style={{ flex: 2, backgroundColor: '#0f172a', color: '#f8fafc', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#334155', fontSize: 13 }}
              />
              <TextInput
                value={credits}
                onChangeText={setCredits}
                placeholder="Credits"
                keyboardType="numeric"
                placeholderTextColor="#64748b"
                style={{ flex: 1, backgroundColor: '#0f172a', color: '#f8fafc', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#334155', fontSize: 13 }}
              />
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {departments.map((d) => (
                <TouchableOpacity
                  key={d.id}
                  onPress={() => setDepartmentId(d.id)}
                  style={{
                    backgroundColor: departmentId === d.id ? '#6366f1' : '#0f172a',
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: departmentId === d.id ? '#6366f1' : '#334155',
                  }}
                >
                  <Text style={{ color: '#f8fafc', fontSize: 11, fontWeight: '600' }}>{d.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title="Create Subject"
              onPress={() => {
                if (name && code) createMutation.mutate({ name, code, credits: parseInt(credits) || 3, departmentId });
              }}
              loading={createMutation.isPending}
              size="sm"
              icon={<Plus size={14} color="#ffffff" />}
            />
          </View>
        </Card>

        <FlatList
          data={subjects}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366f1" />}
          renderItem={({ item }) => (
            <Card style={{ marginBottom: 10, padding: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(168, 85, 247, 0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                    <FileSpreadsheet size={18} color="#a855f7" />
                  </View>
                  <View>
                    <Text style={{ color: '#f8fafc', fontSize: 15, fontWeight: '700' }}>{item.name}</Text>
                    <Text style={{ color: '#64748b', fontSize: 12 }}>{item.code} • {item.credits} Credits</Text>
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
