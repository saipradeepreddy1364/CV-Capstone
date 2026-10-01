import React from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../src/api/client';
import { useAuth } from '../../src/store/authContext';
import { StudentAttendanceStatsDto } from '../../src/types';
import { Header } from '../../src/components/Header';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';
import { Clock, Calendar, BookOpen } from 'lucide-react-native';

export default function StudentAttendanceHistoryScreen() {
  const { user } = useAuth();
  const studentId = user?.studentId;

  const { data: stats, isLoading, refetch, isRefetching } = useQuery<StudentAttendanceStatsDto>({
    queryKey: ['student_attendance_history', studentId],
    queryFn: async () => {
      if (!studentId) return null;
      const res = await apiClient.get(`/attendance/student/${studentId}`);
      return res.data.data;
    },
    enabled: !!studentId,
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#090d16' }}>
      <Header title="Attendance History" subtitle="Chronological list of all attended lectures" />

      <FlatList
        data={stats?.recentRecords || []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366f1" />}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 12, padding: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#f8fafc', fontSize: 16, fontWeight: '700' }}>
                  {item.subjectName}
                </Text>
                <Text style={{ color: '#818cf8', fontSize: 12, fontWeight: '600', marginTop: 2 }}>
                  {item.subjectCode} • {item.facultyName}
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                  <Calendar size={13} color="#64748b" style={{ marginRight: 4 }} />
                  <Text style={{ color: '#64748b', fontSize: 12 }}>{item.attendanceDate}</Text>
                  <Clock size={13} color="#64748b" style={{ marginLeft: 12, marginRight: 4 }} />
                  <Text style={{ color: '#64748b', fontSize: 12 }}>
                    Check-in: {item.checkInTime ? item.checkInTime.substring(11, 16) : 'N/A'}
                  </Text>
                </View>
              </View>

              <Badge status={item.status} size="md" />
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Clock size={48} color="#475569" style={{ marginBottom: 12 }} />
            <Text style={{ color: '#94a3b8', fontSize: 15, fontWeight: '600' }}>
              {isLoading ? 'Loading attendance records...' : 'No attendance history available.'}
            </Text>
          </View>
        }
      />
    </View>
  );
}
