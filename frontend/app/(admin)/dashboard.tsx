import React from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../src/api/client';
import { OrganizationAnalyticsDto } from '../../src/types';
import { Header } from '../../src/components/Header';
import { Card } from '../../src/components/Card';
import { StatCard } from '../../src/components/StatCard';
import {
  Users,
  GraduationCap,
  Building2,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  FileSpreadsheet,
  Settings,
  History,
  TrendingUp,
} from 'lucide-react-native';

export default function AdminDashboardScreen() {
  const router = useRouter();

  const { data, isLoading, refetch, isRefetching } = useQuery<OrganizationAnalyticsDto>({
    queryKey: ['admin_analytics'],
    queryFn: async () => {
      const res = await apiClient.get('/analytics/organization');
      return res.data.data;
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#090d16' }}>
      <Header title="Institution Overview" subtitle="Real-time biometric attendance metrics" />

      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366f1" />}
      >
        {/* Metric Cards Row 1 */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
          <StatCard
            title="Total Faculty"
            value={isLoading ? '...' : (data?.totalFaculty ?? 0)}
            icon={<Users size={20} color="#818cf8" />}
            accentColor="#6366f1"
          />
          <StatCard
            title="Total Students"
            value={isLoading ? '...' : (data?.totalStudents ?? 0)}
            icon={<GraduationCap size={20} color="#38bdf8" />}
            accentColor="#38bdf8"
          />
        </View>

        {/* Metric Cards Row 2 */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
          <StatCard
            title="Departments"
            value={isLoading ? '...' : (data?.totalDepartments ?? 0)}
            icon={<Building2 size={20} color="#a855f7" />}
            accentColor="#a855f7"
          />
          <StatCard
            title="Today's Sessions"
            value={isLoading ? '...' : (data?.todaySessions ?? 0)}
            icon={<CalendarCheck size={20} color="#ec4899" />}
            accentColor="#ec4899"
          />
        </View>

        {/* Today's Attendance Real-time Tally */}
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <Text style={{ color: '#f8fafc', fontSize: 16, fontWeight: '800' }}>Today's Attendance</Text>
            <View style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
              <Text style={{ color: '#818cf8', fontSize: 11, fontWeight: '700' }}>Live Updates</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(16, 185, 129, 0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 6 }}>
                <CheckCircle2 size={22} color="#10b981" />
              </View>
              <Text style={{ color: '#10b981', fontSize: 18, fontWeight: '800' }}>{data?.presentToday ?? 0}</Text>
              <Text style={{ color: '#94a3b8', fontSize: 12 }}>Present</Text>
            </View>

            <View style={{ alignItems: 'center' }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(245, 158, 11, 0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 6 }}>
                <Clock size={22} color="#f59e0b" />
              </View>
              <Text style={{ color: '#f59e0b', fontSize: 18, fontWeight: '800' }}>{data?.lateToday ?? 0}</Text>
              <Text style={{ color: '#94a3b8', fontSize: 12 }}>Late</Text>
            </View>

            <View style={{ alignItems: 'center' }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(239, 68, 68, 0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 6 }}>
                <XCircle size={22} color="#ef4444" />
              </View>
              <Text style={{ color: '#ef4444', fontSize: 18, fontWeight: '800' }}>{data?.absentToday ?? 0}</Text>
              <Text style={{ color: '#94a3b8', fontSize: 12 }}>Absent</Text>
            </View>

            <View style={{ alignItems: 'center' }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(99, 102, 241, 0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 6 }}>
                <TrendingUp size={22} color="#818cf8" />
              </View>
              <Text style={{ color: '#818cf8', fontSize: 18, fontWeight: '800' }}>
                {data?.averageAttendancePercentage ?? 0}%
              </Text>
              <Text style={{ color: '#94a3b8', fontSize: 12 }}>Average</Text>
            </View>
          </View>
        </Card>

        {/* Weekly Trend Bar Representation */}
        <Card>
          <Text style={{ color: '#f8fafc', fontSize: 16, fontWeight: '800', marginBottom: 12 }}>
            Weekly Attendance Trends (Last 7 Days)
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120, paddingTop: 10 }}>
            {data?.weeklyTrends && data.weeklyTrends.length > 0 ? (
              data.weeklyTrends.map((item, idx) => {
                const total = item.present + item.absent;
                const heightPct = total > 0 ? Math.min(100, Math.max(15, (item.present / Math.max(1, total)) * 100)) : 10;
                return (
                  <View key={idx} style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={{ color: '#818cf8', fontSize: 10, fontWeight: '700', marginBottom: 4 }}>
                      {item.present}
                    </Text>
                    <View
                      style={{
                        width: 18,
                        height: `${heightPct}%`,
                        backgroundColor: '#6366f1',
                        borderRadius: 6,
                        minHeight: 12,
                      }}
                    />
                    <Text style={{ color: '#94a3b8', fontSize: 11, marginTop: 6, fontWeight: '600' }}>
                      {item.day}
                    </Text>
                  </View>
                );
              })
            ) : (
              <Text style={{ color: '#64748b', textAlign: 'center', width: '100%' }}>No trend history yet</Text>
            )}
          </View>
        </Card>

        {/* Quick Management Shortcuts */}
        <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '800', textTransform: 'uppercase', marginBottom: 12, marginTop: 4 }}>
          Administrative Actions
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 30 }}>
          <TouchableOpacity
            onPress={() => router.push('/(admin)/organization')}
            style={{
              backgroundColor: '#1e293b',
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#334155',
              flexDirection: 'row',
              alignItems: 'center',
              flex: 1,
              minWidth: 150,
            }}
          >
            <Building2 size={18} color="#818cf8" style={{ marginRight: 8 }} />
            <Text style={{ color: '#f8fafc', fontWeight: '700', fontSize: 13 }}>Organization Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(admin)/departments')}
            style={{
              backgroundColor: '#1e293b',
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#334155',
              flexDirection: 'row',
              alignItems: 'center',
              flex: 1,
              minWidth: 150,
            }}
          >
            <BookOpen size={18} color="#38bdf8" style={{ marginRight: 8 }} />
            <Text style={{ color: '#f8fafc', fontWeight: '700', fontSize: 13 }}>Departments & Courses</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(admin)/subjects')}
            style={{
              backgroundColor: '#1e293b',
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#334155',
              flexDirection: 'row',
              alignItems: 'center',
              flex: 1,
              minWidth: 150,
            }}
          >
            <FileSpreadsheet size={18} color="#a855f7" style={{ marginRight: 8 }} />
            <Text style={{ color: '#f8fafc', fontWeight: '700', fontSize: 13 }}>Academic Subjects</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(admin)/audit-logs')}
            style={{
              backgroundColor: '#1e293b',
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#334155',
              flexDirection: 'row',
              alignItems: 'center',
              flex: 1,
              minWidth: 150,
            }}
          >
            <History size={18} color="#f59e0b" style={{ marginRight: 8 }} />
            <Text style={{ color: '#f8fafc', fontWeight: '700', fontSize: 13 }}>Security Audit Logs</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
