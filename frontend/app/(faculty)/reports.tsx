import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Platform, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../src/api/client';
import { useAuth } from '../../src/store/authContext';
import { AttendanceRecordDto } from '../../src/types';
import { Header } from '../../src/components/Header';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { FileSpreadsheet, FileText, Download } from 'lucide-react-native';

export default function FacultyReportsScreen() {
  const { user } = useAuth();
  const facultyId = user?.facultyId;

  const { data: records = [], isLoading, refetch, isRefetching } = useQuery<AttendanceRecordDto[]>({
    queryKey: ['faculty_reports', facultyId],
    queryFn: async () => {
      if (!facultyId) return [];
      const res = await apiClient.get('/attendance/reports', { params: { facultyId } });
      return res.data.data;
    },
    enabled: !!facultyId,
  });

  const handleExportCsv = () => {
    const url = `${apiClient.defaults.baseURL}/attendance/reports/export/csv?facultyId=${facultyId}`;
    if (Platform.OS === 'web') window.open(url, '_blank');
    else Alert.alert('Export Link', url);
  };

  const handleExportPdf = () => {
    const url = `${apiClient.defaults.baseURL}/attendance/reports/export/pdf?facultyId=${facultyId}`;
    if (Platform.OS === 'web') window.open(url, '_blank');
    else Alert.alert('Export Link', url);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#090d16' }}>
      <Header title="Class Attendance Reports" subtitle="Export and review lecture attendance logs" />

      <View style={{ padding: 20, flex: 1 }}>
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <Button
            title="Download CSV"
            onPress={handleExportCsv}
            icon={<FileSpreadsheet size={16} color="#ffffff" />}
            size="sm"
            style={{ flex: 1 }}
          />
          <Button
            title="Download PDF"
            onPress={handleExportPdf}
            variant="secondary"
            icon={<FileText size={16} color="#f8fafc" />}
            size="sm"
            style={{ flex: 1 }}
          />
        </View>

        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366f1" />}
          renderItem={({ item }) => (
            <Card style={{ marginBottom: 10, padding: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#f8fafc', fontSize: 15, fontWeight: '700' }}>
                    {item.studentName} ({item.studentNumber})
                  </Text>
                  <Text style={{ color: '#818cf8', fontSize: 12, marginTop: 2 }}>
                    {item.subjectName}
                  </Text>
                  <Text style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>
                    {item.attendanceDate} • {item.checkInTime ? item.checkInTime.substring(11, 16) : 'N/A'}
                  </Text>
                </View>
                <Badge status={item.status} size="sm" />
              </View>
            </Card>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Text style={{ color: '#94a3b8' }}>No attendance records found</Text>
            </View>
          }
        />
      </View>
    </View>
  );
}
