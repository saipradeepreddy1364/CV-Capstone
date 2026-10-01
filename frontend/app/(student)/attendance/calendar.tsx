import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../src/api/client';
import { useAuth } from '../../../src/store/authContext';
import { StudentAttendanceStatsDto, AttendanceRecordDto } from '../../../src/types';
import { Header } from '../../../src/components/Header';
import { Card } from '../../../src/components/Card';
import { Badge } from '../../../src/components/Badge';
import { colors } from '../../../src/theme/colors';
import { Calendar as CalendarIcon, Clock, User, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react-native';

export default function StudentAttendanceCalendarScreen() {
  const { user } = useAuth();
  const studentId = user?.studentId;

  // Selected date state
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDateStr, setSelectedDateStr] = useState<string>(today.toISOString().split('T')[0]);

  const { data: stats, isLoading, refetch, isRefetching } = useQuery<StudentAttendanceStatsDto>({
    queryKey: ['student_calendar_records', studentId],
    queryFn: async () => {
      if (!studentId) return null;
      const res = await apiClient.get(`/attendance/student/${studentId}`);
      return res.data.data;
    },
    enabled: !!studentId,
  });

  // Map records by date string YYYY-MM-DD
  const recordMap = new Map<string, AttendanceRecordDto>();
  if (stats?.recentRecords) {
    stats.recentRecords.forEach((r) => {
      recordMap.set(r.attendanceDate, r);
    });
  }

  // Generate days in month
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const selectedRecord = recordMap.get(selectedDateStr);

  return (
    <View style={{ flex: 1, backgroundColor: '#090d16' }}>
      <Header title="Attendance Calendar" subtitle="Monthly lecture attendance and check-in timeline" />

      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366f1" />}
      >
        {/* Month Navigation & Legend Header */}
        <Card style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <TouchableOpacity onPress={prevMonth} style={{ padding: 8, backgroundColor: '#0f172a', borderRadius: 8 }}>
              <ChevronLeft size={20} color="#f8fafc" />
            </TouchableOpacity>
            <Text style={{ color: '#f8fafc', fontSize: 17, fontWeight: '800' }}>
              {monthNames[month]} {year}
            </Text>
            <TouchableOpacity onPress={nextMonth} style={{ padding: 8, backgroundColor: '#0f172a', borderRadius: 8 }}>
              <ChevronRight size={20} color="#f8fafc" />
            </TouchableOpacity>
          </View>

          {/* Color Legend (Requirement 30) */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#334155', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.status.present, marginRight: 6 }} />
              <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '600' }}>Present</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.status.late, marginRight: 6 }} />
              <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '600' }}>Late</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.status.absent, marginRight: 6 }} />
              <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '600' }}>Absent</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.status.noclass, marginRight: 6 }} />
              <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '600' }}>No Class</Text>
            </View>
          </View>

          {/* Day of Week Headers */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 }}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
              <Text key={idx} style={{ width: 36, textAlign: 'center', color: '#64748b', fontSize: 12, fontWeight: '700' }}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {/* Empty offset padding for days before 1st of month */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <View key={`empty-${idx}`} style={{ width: '14.28%', height: 44 }} />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const record = recordMap.get(dateStr);
              const isSelected = selectedDateStr === dateStr;

              let dotColor = colors.status.noclass;
              if (record) {
                if (record.status === 'PRESENT') dotColor = colors.status.present;
                else if (record.status === 'LATE') dotColor = colors.status.late;
                else if (record.status === 'ABSENT') dotColor = colors.status.absent;
              }

              return (
                <TouchableOpacity
                  key={`day-${dayNum}`}
                  onPress={() => setSelectedDateStr(dateStr)}
                  style={{
                    width: '14.28%',
                    height: 44,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 10,
                    backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                    borderWidth: isSelected ? 1.5 : 0,
                    borderColor: '#6366f1',
                  }}
                >
                  <Text
                    style={{
                      color: isSelected ? '#ffffff' : '#f8fafc',
                      fontSize: 13,
                      fontWeight: isSelected ? '800' : '500',
                    }}
                  >
                    {dayNum}
                  </Text>
                  {/* Status Indicator Dot */}
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: dotColor,
                      marginTop: 3,
                    }}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Selected Date Details Box (Requirement 30) */}
        <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '800', textTransform: 'uppercase', marginBottom: 10, marginTop: 4 }}>
          Class Log for {selectedDateStr}
        </Text>

        {selectedRecord ? (
          <Card style={{ padding: 18 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#f8fafc', fontSize: 18, fontWeight: '800' }}>
                  {selectedRecord.subjectName}
                </Text>
                <Text style={{ color: '#818cf8', fontSize: 13, fontWeight: '700', marginTop: 2 }}>
                  {selectedRecord.subjectCode}
                </Text>
              </View>
              <Badge status={selectedRecord.status} size="lg" />
            </View>

            <View style={{ gap: 10, borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <User size={16} color="#94a3b8" style={{ marginRight: 10 }} />
                <Text style={{ color: '#94a3b8', fontSize: 13 }}>Faculty: </Text>
                <Text style={{ color: '#f8fafc', fontSize: 13, fontWeight: '600' }}>{selectedRecord.facultyName}</Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <CalendarIcon size={16} color="#94a3b8" style={{ marginRight: 10 }} />
                <Text style={{ color: '#94a3b8', fontSize: 13 }}>Date: </Text>
                <Text style={{ color: '#f8fafc', fontSize: 13, fontWeight: '600' }}>{selectedRecord.attendanceDate}</Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Clock size={16} color="#94a3b8" style={{ marginRight: 10 }} />
                <Text style={{ color: '#94a3b8', fontSize: 13 }}>Check-in Time: </Text>
                <Text style={{ color: '#f8fafc', fontSize: 13, fontWeight: '600' }}>
                  {selectedRecord.checkInTime ? selectedRecord.checkInTime.substring(11, 16) : 'Not Checked In'}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <BookOpen size={16} color="#94a3b8" style={{ marginRight: 10 }} />
                <Text style={{ color: '#94a3b8', fontSize: 13 }}>Duration: </Text>
                <Text style={{ color: '#f8fafc', fontSize: 13, fontWeight: '600' }}>60 Minutes</Text>
              </View>
            </View>
          </Card>
        ) : (
          <Card style={{ padding: 24, alignItems: 'center' }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(100, 116, 139, 0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
              <CalendarIcon size={20} color="#64748b" />
            </View>
            <Text style={{ color: '#f8fafc', fontSize: 16, fontWeight: '700', marginBottom: 4 }}>
              No Class Scheduled
            </Text>
            <Text style={{ color: '#94a3b8', fontSize: 12, textAlign: 'center' }}>
              There were no recorded lectures or biometric sessions on {selectedDateStr}.
            </Text>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}
