import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../src/api/client';
import { CourseDto, DepartmentDto } from '../../src/types';
import { Header } from '../../src/components/Header';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { BookOpen, Plus, Trash2 } from 'lucide-react-native';

export default function AdminCoursesScreen() {
  const queryClient = useQueryClient();
  const [name, setName] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [departmentId, setDepartmentId] = useState<string>('');

  const { data: courses = [], isLoading, refetch, isRefetching } = useQuery<CourseDto[]>({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await apiClient.get('/courses');
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
    mutationFn: async (payload: { name: string; code: string; departmentId: string }) => {
      const res = await apiClient.post('/courses', payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setName('');
      setCode('');
      setDepartmentId('');
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create course');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/courses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'Failed to delete course');
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#090d16' }}>
      <Header title="Degree Programs & Courses" subtitle="Manage university curricula" showBack />

      <View style={{ padding: 20, flex: 1 }}>
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ color: '#f8fafc', fontSize: 15, fontWeight: '800', marginBottom: 12 }}>
            Add Course
          </Text>
          <View style={{ gap: 10 }}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Course Name (e.g. B.Tech Computer Science)"
              placeholderTextColor="#64748b"
              style={{ backgroundColor: '#0f172a', color: '#f8fafc', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#334155', fontSize: 13 }}
            />
            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder="Course Code (e.g. BTECH_CS)"
              placeholderTextColor="#64748b"
              style={{ backgroundColor: '#0f172a', color: '#f8fafc', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#334155', fontSize: 13 }}
            />

            {/* Department selector */}
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
              title="Create Course"
              onPress={() => {
                if (name && code && departmentId) createMutation.mutate({ name, code, departmentId });
                else Alert.alert('Validation', 'Please provide name, code, and select department');
              }}
              loading={createMutation.isPending}
              size="sm"
              icon={<Plus size={14} color="#ffffff" />}
            />
          </View>
        </Card>

        <FlatList
          data={courses}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366f1" />}
          renderItem={({ item }) => (
            <Card style={{ marginBottom: 10, padding: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(56, 189, 248, 0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                    <BookOpen size={18} color="#38bdf8" />
                  </View>
                  <View>
                    <Text style={{ color: '#f8fafc', fontSize: 15, fontWeight: '700' }}>{item.name}</Text>
                    <Text style={{ color: '#64748b', fontSize: 12 }}>{item.code} • {item.departmentName}</Text>
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
