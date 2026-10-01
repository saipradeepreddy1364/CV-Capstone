import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Alert,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../src/api/client';
import { AttendanceRecordDto, AttendanceStatus } from '../../src/types';
import { Header } from '../../src/components/Header';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { FileSpreadsheet, FileText, Filter, Calendar, Download } from 'lucide-react-native';

export default function AdminReportsScreen() {
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | undefined>(undefined);

  const { data: records = [], isLoading, refetch, isRefetching } = useQuery<AttendanceRecordDto[]>({
    queryKey: ['attendance_reports', statusFilter],
    queryFn: async () => {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      const res = await apiClient.get('/attendance/reports', { params });
      return res.data.data;
    },
  });

  const handleExportCsv = async () => {
    try {
      const url = `${apiClient.defaults.baseURL}/attendance/reports/export/csv`;
      if (Platform.OS === 'web') {
        window.open(url, '_blank');
      } else {
        Alert.alert('CSV Report', `Download available at: ${url}`);
      }
    } catch (e: any) {
      Alert.alert('Export Failed', e.message);
    }
  };

  const handleExportPdf = async () => {
    try {
      const url = `${apiClient.defaults.baseURL}/attendance/reports/export/pdf`;
      if (Platform.OS === 'web') {
        window.open(url, '_blank');
      } else {
        Alert.alert('PDF Report', `Download available at: ${url}`);
      }
    } catch (e: any) {
      Alert.alert('Export Failed', e.message);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#090d16' }}>
      <Header title="Attendance Reports" subtitle="Historical audit trails and compliance exports" />

      <View style={{ padding: 20, flex: 1 }}>
        {/* Export Buttons */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <Button
            title="Export CSV"
            onPress={handleExportCsv}
            icon={<FileSpreadsheet size={16} color="#ffffff" />}
            size="sm"
            style={{ flex: 1 }}
          />
          <Button
            title="Export PDF"
            onPress={handleExportPdf}
            variant="secondary"
            icon={<FileText size={16} color="#f8fafc" />}
            size="sm"
            style={{ flex: 1 }}
          />
        </View>

        {/* Filter Chips */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16, alignItems: 'center' }}>
          <Filter size={16} color="#94a3b8" />
          <TouchableOpacity
            onPress={() => setStatusFilter(undefined)}
            style={{
              backgroundColor: statusFilter === undefined ? '#6366f1' : '#1e293b',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: '#f8fafc', fontSize: 12, fontWeight: '700' }}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setStatusFilter('PRESENT')}
            style={{
              backgroundColor: statusFilter === 'PRESENT' ? '#10b981' : '#1e293b',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: '#f8fafc', fontSize: 12, fontWeight: '700' }}>Present</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setStatusFilter('LATE')}
            style={{
              backgroundColor: statusFilter === 'LATE' ? '#f59e0b' : '#1e293b',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: '#f8fafc', fontSize: 12, fontWeight: '700' }}>Late</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setStatusFilter('ABSENT')}
            style={{
              backgroundColor: statusFilter === 'ABSENT' ? '#ef4444' : '#1e293b',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: '#f8fafc', fontSize: 12, fontWeight: '700' }}>Absent</Text>
          </TouchableOpacity>
        </View>

        {/* Reports Records List */}
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
                    {item.subjectName} ({item.subjectCode})
                  </Text>
                  <Text style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>
                    Faculty: {item.facultyName} • {item.attendanceDate} {item.checkInTime ? item.checkInTime.substring(11, 16) : ''}
                  </Text>
                </View>
                <Badge status={item.status} size="sm" />
              </View>
            </Card>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Text style={{ color: '#94a3b8' }}>No attendance records match filter</Text>
            </View>
          }
        />
      </View>
    </View>
  );
}
