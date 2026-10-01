import React from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../src/api/client';
import { useAuth } from '../../src/store/authContext';
import { FacultyAnalyticsDto } from '../../src/types';
import { Header } from '../../src/components/Header';
import { Card } from '../../src/components/Card';
import { StatCard } from '../../src/components/StatCard';
import { Button } from '../../src/components/Button';
import {
  Users,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Play,
  FileSpreadsheet,
  User,
  Camera,
} from 'lucide-react-native';

export default function FacultyDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const facultyId = user?.facultyId;

  const { data, isLoading, refetch, isRefetching } = useQuery<FacultyAnalyticsDto>({
    queryKey: ['faculty_analytics', facultyId],
    queryFn: async () => {
      if (!facultyId) return null;
      const res = await apiClient.get(`/analytics/faculty/${facultyId}`);
      return res.data.data;
    },
    enabled: !!facultyId,
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#090d16' }}>
      <Header
        title={`Welcome, ${user?.firstName || 'Professor'}`}
        subtitle="Faculty attendance management console"
      />

      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366f1" />}
      >
        {/* Metric Cards Row 1 */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
          <StatCard
            title="Assigned Students"
            value={isLoading ? '...' : (data?.assignedStudents ?? 0)}
            icon={<Users size={20} color="#818cf8" />}
            accentColor="#6366f1"
          />
          <StatCard
            title="Today's Classes"
            value={isLoading ? '...' : (data?.todayClasses ?? 0)}
            icon={<CalendarCheck size={20} color="#38bdf8" />}
            accentColor="#38bdf8"
          />
        </View>

        {/* Metric Cards Row 2 */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <StatCard
            title="Present Today"
            value={isLoading ? '...' : (data?.presentCount ?? 0)}
            icon={<CheckCircle2 size={20} color="#10b981" />}
            accentColor="#10b981"
          />
          <StatCard
            title="Average Attendance"
            value={isLoading ? '...' : `${data?.averageAttendance ?? 0}%`}
            icon={<TrendingUp size={20} color="#a855f7" />}
            accentColor="#a855f7"
          />
        </View>

        {/* Shortcuts as per Requirement 28 */}
        <Card>
          <Text style={{ color: '#f8fafc', fontSize: 16, fontWeight: '800', marginBottom: 14 }}>
            Faculty Shortcuts
          </Text>

          <View style={{ gap: 10 }}>
            <Button
              title="Start Live Attendance Session"
              onPress={() => router.push('/(faculty)/attendance')}
              icon={<Play size={16} color="#ffffff" />}
              variant="primary"
              size="lg"
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button
                title="Face Registration"
                onPress={() => router.push('/(faculty)/face-registration')}
                icon={<Camera size={14} color="#818cf8" />}
                variant="outline"
                size="md"
                style={{ flex: 1 }}
              />

              <Button
                title="View Students"
                onPress={() => router.push('/(faculty)/students')}
                icon={<Users size={14} color="#f8fafc" />}
                variant="secondary"
                size="md"
                style={{ flex: 1 }}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button
                title="Attendance Reports"
                onPress={() => router.push('/(faculty)/reports')}
                icon={<FileSpreadsheet size={14} color="#f8fafc" />}
                variant="secondary"
                size="md"
                style={{ flex: 1 }}
              />

              <Button
                title="My Profile"
                onPress={() => router.push('/(faculty)/profile')}
                icon={<User size={14} color="#f8fafc" />}
                variant="secondary"
                size="md"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </Card>

        {/* Assigned Subject Breakdowns */}
        {data?.subjectBreakdowns && data.subjectBreakdowns.length > 0 && (
          <Card>
            <Text style={{ color: '#f8fafc', fontSize: 16, fontWeight: '800', marginBottom: 12 }}>
              Teaching Modules
            </Text>
            {data.subjectBreakdowns.map((sb, idx) => (
              <View
                key={idx}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 10,
                  borderBottomWidth: idx < data.subjectBreakdowns.length - 1 ? 1 : 0,
                  borderBottomColor: '#334155',
                }}
              >
                <Text style={{ color: '#f8fafc', fontSize: 14, fontWeight: '600' }}>
                  {sb.subjectName}
                </Text>
                <View style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                  <Text style={{ color: '#818cf8', fontSize: 12, fontWeight: '700' }}>
                    {sb.enrolledCount} Students Enrolled
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>
    </View>
  );
}
