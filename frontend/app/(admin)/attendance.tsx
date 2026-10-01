import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../src/api/client';
import { AttendanceSessionDto } from '../../src/types';
import { Header } from '../../src/components/Header';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { Play, Square, Calendar, Clock, BookOpen, User, Eye } from 'lucide-react-native';

export default function AdminAttendanceScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading, refetch, isRefetching } = useQuery<AttendanceSessionDto[]>({
    queryKey: ['admin_attendance_sessions'],
    queryFn: async () => {
      const res = await apiClient.get('/attendance/sessions');
      return res.data.data;
    },
  });

  const startMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post(`/attendance/sessions/${id}/start`);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_attendance_sessions'] });
      queryClient.invalidateQueries({ queryKey: ['admin_analytics'] });
    },
  });

  const stopMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post(`/attendance/sessions/${id}/stop`);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_attendance_sessions'] });
      queryClient.invalidateQueries({ queryKey: ['admin_analytics'] });
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#090d16' }}>
      <Header title="Attendance Sessions" subtitle="Monitor active and scheduled lecture attendance" />

      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366f1" />}
        renderItem={({ item }) => (
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#f8fafc', fontSize: 17, fontWeight: '800' }}>
                  {item.subjectName}
                </Text>
                <Text style={{ color: '#818cf8', fontSize: 12, fontWeight: '700', marginTop: 2 }}>
                  {item.subjectCode}
                </Text>
              </View>
              <Badge status={item.status} />
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <User size={14} color="#94a3b8" style={{ marginRight: 6 }} />
              <Text style={{ color: '#94a3b8', fontSize: 13 }}>Faculty: {item.facultyName || 'Staff'}</Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Calendar size={14} color="#94a3b8" style={{ marginRight: 6 }} />
              <Text style={{ color: '#94a3b8', fontSize: 13 }}>Date: {item.sessionDate}</Text>
              <Clock size={14} color="#94a3b8" style={{ marginLeft: 16, marginRight: 6 }} />
              <Text style={{ color: '#94a3b8', fontSize: 13 }}>
                {item.startTime ? item.startTime.substring(11, 16) : '--:--'}
              </Text>
            </View>

            {/* Attendance Tally */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                backgroundColor: '#0f172a',
                padding: 12,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#334155',
                marginBottom: 14,
              }}
            >
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '600' }}>Enrolled</Text>
                <Text style={{ color: '#f8fafc', fontSize: 16, fontWeight: '800' }}>{item.totalEnrolledStudents}</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: '#10b981', fontSize: 11, fontWeight: '600' }}>Present</Text>
                <Text style={{ color: '#10b981', fontSize: 16, fontWeight: '800' }}>{item.presentCount}</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: '#f59e0b', fontSize: 11, fontWeight: '600' }}>Late</Text>
                <Text style={{ color: '#f59e0b', fontSize: 16, fontWeight: '800' }}>{item.lateCount}</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: '#818cf8', fontSize: 11, fontWeight: '600' }}>Turnout</Text>
                <Text style={{ color: '#818cf8', fontSize: 16, fontWeight: '800' }}>{item.attendancePercentage}%</Text>
              </View>
            </View>

            {/* Actions */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {item.status === 'SCHEDULED' && (
                <Button
                  title="Start Session"
                  onPress={() => startMutation.mutate(item.id)}
                  loading={startMutation.isPending}
                  size="sm"
                  variant="success"
                  icon={<Play size={14} color="#ffffff" />}
                  style={{ flex: 1 }}
                />
              )}
              {item.status === 'ACTIVE' && (
                <Button
                  title="End Session"
                  onPress={() => stopMutation.mutate(item.id)}
                  loading={stopMutation.isPending}
                  size="sm"
                  variant="danger"
                  icon={<Square size={14} color="#ffffff" />}
                  style={{ flex: 1 }}
                />
              )}
              <Button
                title="View Live"
                onPress={() => router.push(`/(faculty)/attendance/${item.id}`)}
                size="sm"
                variant="outline"
                icon={<Eye size={14} color="#818cf8" />}
                style={{ flex: 1 }}
              />
            </View>
          </Card>
        )}
      />
    </View>
  );
}
