import React from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../src/api/client';
import { useAuth } from '../../src/store/authContext';
import { StudentAttendanceStatsDto } from '../../src/types';
import { Header } from '../../src/components/Header';
import { Card } from '../../src/components/Card';
import { StatCard } from '../../src/components/StatCard';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import {
  GraduationCap,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Calendar,
  Camera,
  ShieldCheck,
} from 'lucide-react-native';

export default function StudentDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const studentId = user?.studentId;

  const { data: stats, isLoading, refetch, isRefetching } = useQuery<StudentAttendanceStatsDto>({
    queryKey: ['student_dashboard_stats', studentId],
    queryFn: async () => {
      if (!studentId) return null;
      const res = await apiClient.get(`/attendance/student/${studentId}`);
      return res.data.data;
    },
    enabled: !!studentId,
  });

  const rate = stats?.attendancePercentage ?? 0;
  const rateColor = rate >= 75 ? '#10b981' : rate >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <View style={{ flex: 1, backgroundColor: '#090d16' }}>
      <Header
        title={`Hi, ${user?.firstName || 'Student'}`}
        subtitle={`Student ID: ${user?.identificationNumber || 'STU'}`}
      />

      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366f1" />}
      >
        {/* Attendance Percentage Main Ring Card */}
        <Card style={{ alignItems: 'center', padding: 24, marginBottom: 16 }}>
          <View
            style={{
              width: 130,
              height: 130,
              borderRadius: 65,
              borderWidth: 8,
              borderColor: rateColor,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 14,
              backgroundColor: 'rgba(99, 102, 241, 0.05)',
            }}
          >
            <Text style={{ color: '#f8fafc', fontSize: 32, fontWeight: '900' }}>
              {rate}%
            </Text>
            <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>
              Overall
            </Text>
          </View>

          <Text style={{ color: rate >= 75 ? '#10b981' : '#f59e0b', fontSize: 14, fontWeight: '700' }}>
            {rate >= 75
              ? '✓ Attendance criteria fulfilled'
              : '⚠ Below minimum attendance threshold (75%)'}
          </Text>
        </Card>

        {/* Attendance Counters Grid (Section 29) */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
          <StatCard
            title="Total Classes"
            value={isLoading ? '...' : (stats?.totalClasses ?? 0)}
            icon={<GraduationCap size={18} color="#818cf8" />}
            accentColor="#6366f1"
          />
          <StatCard
            title="Attended"
            value={isLoading ? '...' : (stats?.attendedClasses ?? 0)}
            icon={<CheckCircle2 size={18} color="#10b981" />}
            accentColor="#10b981"
          />
        </View>

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
          <StatCard
            title="Late Check-ins"
            value={isLoading ? '...' : (stats?.lateClasses ?? 0)}
            icon={<Clock size={18} color="#f59e0b" />}
            accentColor="#f59e0b"
          />
          <StatCard
            title="Absent Classes"
            value={isLoading ? '...' : (stats?.absentClasses ?? 0)}
            icon={<XCircle size={18} color="#ef4444" />}
            accentColor="#ef4444"
          />
        </View>

        {/* Hours Logged */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <StatCard
            title="Total Hours"
            value={isLoading ? '...' : `${stats?.totalHours ?? 0} hrs`}
            accentColor="#38bdf8"
          />
          <StatCard
            title="Attended Hours"
            value={isLoading ? '...' : `${stats?.attendedHours ?? 0} hrs`}
            accentColor="#a855f7"
          />
        </View>

        {/* Quick Links */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          <Button
            title="View Attendance Calendar"
            onPress={() => router.push('/(student)/attendance/calendar')}
            icon={<Calendar size={16} color="#ffffff" />}
            style={{ flex: 1 }}
          />
          <Button
            title="Face ID Profile"
            onPress={() => router.push('/(student)/face-registration')}
            variant="outline"
            icon={<Camera size={16} color="#818cf8" />}
            style={{ flex: 1 }}
          />
        </View>

        {/* Recent Activity */}
        <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '800', textTransform: 'uppercase', marginBottom: 10 }}>
          Recent Class History
        </Text>

        {stats?.recentRecords && stats.recentRecords.length > 0 ? (
          stats.recentRecords.slice(0, 5).map((r) => (
            <Card key={r.id} style={{ marginBottom: 10, padding: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#f8fafc', fontSize: 14, fontWeight: '700' }}>
                    {r.subjectName}
                  </Text>
                  <Text style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>
                    {r.attendanceDate} • Check-in: {r.checkInTime ? r.checkInTime.substring(11, 16) : 'N/A'}
                  </Text>
                </View>
                <Badge status={r.status} size="sm" />
              </View>
            </Card>
          ))
        ) : (
          <Card>
            <Text style={{ color: '#94a3b8', textAlign: 'center' }}>No attendance activity recorded yet</Text>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}
