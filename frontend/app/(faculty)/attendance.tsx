import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../src/api/client';
import { useAuth } from '../../src/store/authContext';
import { AttendanceSessionDto, SubjectDto } from '../../src/types';
import { Header } from '../../src/components/Header';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { Plus, Play, Square, Eye, Calendar, Clock, BookOpen } from 'lucide-react-native';

export default function FacultyAttendanceScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

  // 1. Fetch Sessions
  const { data: sessions = [], isLoading, refetch, isRefetching } = useQuery<AttendanceSessionDto[]>({
    queryKey: ['faculty_attendance_sessions'],
    queryFn: async () => {
      const res = await apiClient.get('/attendance/sessions');
      return res.data.data;
    },
  });

  // 2. Fetch Subjects
  const { data: subjects = [] } = useQuery<SubjectDto[]>({
    queryKey: ['subjects'],
    queryFn: async () => {
      const res = await apiClient.get('/subjects');
      return res.data.data;
    },
  });

  // 3. Create Session Mutation
  const createMutation = useMutation({
    mutationFn: async (subjectId: string) => {
      const res = await apiClient.post('/attendance/sessions', {
        subjectId,
        facultyId: user?.facultyId,
        durationMinutes: 60,
        thresholdMinutes: 10,
      });
      return res.data.data;
    },
    onSuccess: (newSession) => {
      queryClient.invalidateQueries({ queryKey: ['faculty_attendance_sessions'] });
      setModalVisible(false);
      // Auto-start and navigate to live session
      startMutation.mutate(newSession.id);
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create session');
    },
  });

  // 4. Start Session Mutation
  const startMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post(`/attendance/sessions/${id}/start`);
      return res.data.data;
    },
    onSuccess: (startedSession) => {
      queryClient.invalidateQueries({ queryKey: ['faculty_attendance_sessions'] });
      router.push(`/(faculty)/attendance/${startedSession.id}`);
    },
  });

  // 5. Stop Session Mutation
  const stopMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post(`/attendance/sessions/${id}/stop`);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty_attendance_sessions'] });
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#090d16' }}>
      <Header title="Attendance Sessions" subtitle="Launch and supervise facial verification sessions" />

      <View style={{ padding: 20, flex: 1 }}>
        <Button
          title="Create New Attendance Session"
          onPress={() => setModalVisible(true)}
          icon={<Plus size={16} color="#ffffff" />}
          size="lg"
          style={{ marginBottom: 16 }}
        />

        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366f1" />}
          renderItem={({ item }) => (
            <Card style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
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
                <Calendar size={14} color="#94a3b8" style={{ marginRight: 6 }} />
                <Text style={{ color: '#94a3b8', fontSize: 13 }}>{item.sessionDate}</Text>
                <Clock size={14} color="#94a3b8" style={{ marginLeft: 16, marginRight: 6 }} />
                <Text style={{ color: '#94a3b8', fontSize: 13 }}>
                  {item.startTime ? item.startTime.substring(11, 16) : '--:--'}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  backgroundColor: '#0f172a',
                  padding: 10,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: '#334155',
                  marginVertical: 10,
                }}
              >
                <Text style={{ color: '#94a3b8', fontSize: 12 }}>
                  Enrolled: <Text style={{ color: '#f8fafc', fontWeight: '700' }}>{item.totalEnrolledStudents}</Text>
                </Text>
                <Text style={{ color: '#10b981', fontSize: 12 }}>
                  Present: <Text style={{ fontWeight: '700' }}>{item.presentCount}</Text>
                </Text>
                <Text style={{ color: '#f59e0b', fontSize: 12 }}>
                  Late: <Text style={{ fontWeight: '700' }}>{item.lateCount}</Text>
                </Text>
                <Text style={{ color: '#818cf8', fontSize: 12, fontWeight: '700' }}>
                  {item.attendancePercentage}%
                </Text>
              </View>

              {/* Actions */}
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {item.status === 'SCHEDULED' && (
                  <Button
                    title="Start Live"
                    onPress={() => startMutation.mutate(item.id)}
                    loading={startMutation.isPending}
                    size="sm"
                    variant="success"
                    icon={<Play size={14} color="#ffffff" />}
                    style={{ flex: 1 }}
                  />
                )}
                {item.status === 'ACTIVE' && (
                  <>
                    <Button
                      title="Open Live Scanner"
                      onPress={() => router.push(`/(faculty)/attendance/${item.id}`)}
                      size="sm"
                      variant="primary"
                      icon={<Play size={14} color="#ffffff" />}
                      style={{ flex: 2 }}
                    />
                    <Button
                      title="End"
                      onPress={() => stopMutation.mutate(item.id)}
                      loading={stopMutation.isPending}
                      size="sm"
                      variant="danger"
                      icon={<Square size={14} color="#ffffff" />}
                      style={{ flex: 1 }}
                    />
                  </>
                )}
                {item.status === 'COMPLETED' && (
                  <Button
                    title="View Summary"
                    onPress={() => router.push(`/(faculty)/attendance/${item.id}`)}
                    size="sm"
                    variant="outline"
                    icon={<Eye size={14} color="#818cf8" />}
                    style={{ flex: 1 }}
                  />
                )}
              </View>
            </Card>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 50 }}>
              <BookOpen size={48} color="#475569" style={{ marginBottom: 12 }} />
              <Text style={{ color: '#94a3b8', fontSize: 15, fontWeight: '600' }}>
                {isLoading ? 'Loading attendance sessions...' : 'No sessions created yet.'}
              </Text>
            </View>
          }
        />
      </View>

      {/* Select Subject Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 }}>
          <Card style={{ padding: 20 }}>
            <Text style={{ color: '#f8fafc', fontSize: 18, fontWeight: '800', marginBottom: 6 }}>
              Select Teaching Subject
            </Text>
            <Text style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>
              Choose which module session you want to initiate:
            </Text>

            <View style={{ gap: 8, marginBottom: 16 }}>
              {subjects.map((sub) => (
                <TouchableOpacity
                  key={sub.id}
                  onPress={() => setSelectedSubjectId(sub.id)}
                  style={{
                    backgroundColor: selectedSubjectId === sub.id ? 'rgba(99, 102, 241, 0.25)' : '#0f172a',
                    padding: 12,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: selectedSubjectId === sub.id ? '#6366f1' : '#334155',
                  }}
                >
                  <Text style={{ color: '#f8fafc', fontSize: 14, fontWeight: '700' }}>{sub.name}</Text>
                  <Text style={{ color: '#818cf8', fontSize: 12 }}>Code: {sub.code}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setModalVisible(false)}
                style={{ flex: 1 }}
              />
              <Button
                title="Start Class"
                onPress={() => {
                  if (selectedSubjectId) createMutation.mutate(selectedSubjectId);
                  else Alert.alert('Validation', 'Please pick a subject');
                }}
                loading={createMutation.isPending}
                style={{ flex: 1 }}
              />
            </View>
          </Card>
        </View>
      </Modal>
    </View>
  );
}
