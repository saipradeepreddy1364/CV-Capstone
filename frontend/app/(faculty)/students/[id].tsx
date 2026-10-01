import React from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../src/api/client';
import { StudentAttendanceStatsDto } from '../../../src/types';
import { Header } from '../../../src/components/Header';
import { Card } from '../../../src/components/Card';
import { Badge } from '../../../src/components/Badge';
import { StatCard } from '../../../src/components/StatCard';
import { GraduationCap, CheckCircle2, Clock, XCircle, TrendingUp } from 'lucide-react-native';

export default function FacultyStudentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: stats, isLoading, refetch, isRefetching } = useQuery<StudentAttendanceStatsDto>({
    queryKey: ['student_attendance_stats', id],
    queryFn: async () => {
      const res = await apiClient.get(`/attendance/student/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#090d16' }}>
      <Header
        title={stats?.studentName || 'Student Profile'}
        subtitle={`ID: ${stats?.studentNumber || 'Student'}`}
        showBack
      />

      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366f1" />}
      >
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
          <StatCard
            title="Attendance Rate"
            value={`${stats?.attendancePercentage ?? 0}%`}
            icon={<TrendingUp size={20} color="#10b981" />}
            accentColor="#10b981"
          />
          <StatCard
            title="Total Classes"
            value={stats?.totalClasses ?? 0}
            icon={<GraduationCap size={20} color="#38bdf8" />}
            accentColor="#38bdf8"
          />
        </View>

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <StatCard
            title="Classes Attended"
            value={stats?.attendedClasses ?? 0}
            icon={<CheckCircle2 size={20} color="#6366f1" />}
            accentColor="#6366f1"
          />
          <StatCard
            title="Hours Logged"
            value={`${stats?.attendedHours ?? 0} hrs`}
            icon={<Clock size={20} color="#f59e0b" />}
            accentColor="#f59e0b"
          />
        </View>

        <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '800', textTransform: 'uppercase', marginBottom: 10 }}>
          Recent Class Check-ins
        </Text>

        {stats?.recentRecords && stats.recentRecords.length > 0 ? (
          stats.recentRecords.map((r) => (
            <Card key={r.id} style={{ marginBottom: 10, padding: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#f8fafc', fontSize: 15, fontWeight: '700' }}>
                    {r.subjectName}
                  </Text>
                  <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>
                    Date: {r.attendanceDate} • Check-in: {r.checkInTime ? r.checkInTime.substring(11, 16) : 'N/A'}
                  </Text>
                </View>
                <Badge status={r.status} size="sm" />
              </View>
            </Card>
          ))
        ) : (
          <Card>
            <Text style={{ color: '#94a3b8', textAlign: 'center' }}>No attendance records recorded yet</Text>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}
