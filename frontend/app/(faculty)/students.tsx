import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../src/api/client';
import { useAuth } from '../../src/store/authContext';
import { StudentDto } from '../../src/types';
import { Header } from '../../src/components/Header';
import { Card } from '../../src/components/Card';
import { GraduationCap, Mail, ChevronRight, CheckCircle2, XCircle } from 'lucide-react-native';

export default function FacultyStudentsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const facultyId = user?.facultyId;

  const { data: students = [], isLoading, refetch, isRefetching } = useQuery<StudentDto[]>({
    queryKey: ['faculty_assigned_students', facultyId],
    queryFn: async () => {
      if (!facultyId) return [];
      const res = await apiClient.get(`/faculty/${facultyId}/students`);
      return res.data.data;
    },
    enabled: !!facultyId,
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#090d16' }}>
      <Header title="Enrolled Students" subtitle="Students attending your assigned subjects" />

      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366f1" />}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/(faculty)/students/${item.id}`)}
            activeOpacity={0.7}
          >
            <Card style={{ marginBottom: 12, padding: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#f8fafc', fontSize: 16, fontWeight: '700' }}>
                    {item.fullName}
                  </Text>
                  <Text style={{ color: '#38bdf8', fontSize: 12, fontWeight: '600', marginTop: 2 }}>
                    ID: {item.studentNumber} • Sem {item.semester}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Mail size={12} color="#64748b" style={{ marginRight: 4 }} />
                    <Text style={{ color: '#64748b', fontSize: 12 }}>{item.email}</Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {item.faceRegistered ? (
                    <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                      <Text style={{ color: '#10b981', fontSize: 11, fontWeight: '700' }}>Face Active</Text>
                    </View>
                  ) : (
                    <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                      <Text style={{ color: '#ef4444', fontSize: 11, fontWeight: '700' }}>No Face</Text>
                    </View>
                  )}
                  <ChevronRight size={18} color="#64748b" />
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
