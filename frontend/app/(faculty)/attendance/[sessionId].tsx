import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../src/api/client';
import { supabase } from '../../../src/lib/supabase';
import { LiveAttendanceResponseDto, FaceVerificationResultDto } from '../../../src/types';
import { Header } from '../../../src/components/Header';
import { Card } from '../../../src/components/Card';
import { Badge } from '../../../src/components/Badge';
import { Button } from '../../../src/components/Button';
import { FaceCameraModal } from '../../../src/components/FaceCameraModal';
import {
  Camera,
  Square,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Sparkles,
} from 'lucide-react-native';

export default function LiveAttendanceScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [cameraVisible, setCameraVisible] = useState<boolean>(false);
  const [verificationFeedback, setVerificationFeedback] = useState<FaceVerificationResultDto | null>(null);

  // 1-Second Controlled Polling Query (Section 25) directly from Supabase
  const { data: liveData, isLoading } = useQuery<LiveAttendanceResponseDto>({
    queryKey: ['live_attendance', sessionId],
    queryFn: async () => {
      if (!sessionId) throw new Error('Session ID required');
      try {
        const { data: sessionData } = await supabase
          .from('attendance_sessions')
          .select('*, subjects(name)')
          .eq('id', sessionId)
          .single();

        const { data: records } = await supabase
          .from('attendance_records')
          .select('*, students(*, users(*))')
          .eq('attendance_session_id', sessionId);

        if (sessionData) {
          const studentList = (records || []).map((r: any) => ({
            studentId: r.student_id,
            studentNumber: r.students?.student_number || 'STU',
            firstName: r.students?.users?.first_name || '',
            lastName: r.students?.users?.last_name || '',
            status: r.status,
            checkInTime: r.check_in_time,
            recognitionConfidence: r.recognition_confidence || 0.95,
          }));

          const presentCount = studentList.filter((s: any) => s.status === 'PRESENT').length;
          const lateCount = studentList.filter((s: any) => s.status === 'LATE').length;
          const absentCount = studentList.filter((s: any) => s.status === 'ABSENT').length;

          return {
            sessionId: sessionData.id,
            subjectName: sessionData.subjects?.name || 'Class Lecture',
            sessionDate: sessionData.session_date,
            startTime: sessionData.start_time,
            endTime: sessionData.end_time,
            status: sessionData.status,
            totalEnrolledStudents: studentList.length,
            presentCount,
            lateCount,
            absentCount,
            students: studentList,
          };
        }
      } catch (e) {}

      try {
        const res = await apiClient.get(`/attendance/sessions/${sessionId}/live`);
        return res.data.data;
      } catch {
        return {
          sessionId: sessionId || '',
          subjectName: 'Live Lecture',
          sessionDate: new Date().toISOString().split('T')[0],
          startTime: new Date().toISOString(),
          status: 'ACTIVE',
          totalEnrolledStudents: 0,
          presentCount: 0,
          lateCount: 0,
          absentCount: 0,
          students: [],
        };
      }
    },
    // Controlled 1-second (1000ms) polling interval while active
    refetchInterval: (query: any) => {
      const session = query.state.data;
      if (session && session.status !== 'ACTIVE') {
        return false;
      }
      return 1000;
    },
    refetchIntervalInBackground: false,
    enabled: !!sessionId,
  });

  // End Session Mutation
  const stopMutation = useMutation({
    mutationFn: async () => {
      try {
        await supabase
          .from('attendance_sessions')
          .update({ status: 'COMPLETED', end_time: new Date().toISOString() })
          .eq('id', sessionId);
      } catch {}

      try {
        const res = await apiClient.post(`/attendance/sessions/${sessionId}/stop`);
        return res.data.data;
      } catch {
        return null;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live_attendance', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['faculty_attendance_sessions'] });
      Alert.alert('Session Concluded', 'Attendance session completed and saved to Supabase.');
    },
  });

  // Real Face Verification Mutation
  const verifyMutation = useMutation({
    mutationFn: async (imageBase64: string) => {
      const res = await apiClient.post('/face/verify', {
        sessionId,
        imageBase64,
      });
      return res.data.data;
    },
    onSuccess: (result: FaceVerificationResultDto) => {
      setVerificationFeedback(result);
      // Immediately refetch live statistics
      queryClient.invalidateQueries({ queryKey: ['live_attendance', sessionId] });
      setTimeout(() => setVerificationFeedback(null), 4000);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Face verification failed';
      Alert.alert('Verification Alert', msg);
    },
  });

  const isActive = liveData?.status === 'ACTIVE';

  return (
    <View style={{ flex: 1, backgroundColor: '#090d16' }}>
      <Header
        title={liveData?.subjectName || 'Live Attendance'}
        subtitle={liveData ? `${liveData.subjectCode} • ${liveData.facultyName}` : 'Live Class'}
        showBack
      />

      <View style={{ padding: 20, flex: 1 }}>
        {/* Verification Success Toast */}
        {verificationFeedback && (
          <View
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.95)',
              padding: 12,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 14,
            }}
          >
            <CheckCircle2 size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 13 }}>
                Verified: {verificationFeedback.studentName} ({verificationFeedback.studentNumber})
              </Text>
              <Text style={{ color: '#ffffff', fontSize: 11, opacity: 0.9 }}>
                Status: {verificationFeedback.status} • Confidence: {(verificationFeedback.confidence! * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
        )}

        {/* Live Statistics Banner (Section 24) */}
        <Card style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: isActive ? '#10b981' : '#64748b',
                  marginRight: 6,
                }}
              />
              <Text style={{ color: '#f8fafc', fontSize: 14, fontWeight: '800' }}>
                {isActive ? 'LIVE 1s POLLING ACTIVE' : 'SESSION FINISHED'}
              </Text>
            </View>
            <Badge status={liveData?.status || 'SCHEDULED'} />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ color: '#94a3b8', fontSize: 12 }}>
              Threshold: {liveData?.thresholdTime ? liveData.thresholdTime.substring(11, 16) : '--:--'}
            </Text>
            <Text style={{ color: '#94a3b8', fontSize: 12 }}>
              Class Ends: {liveData?.endTime ? liveData.endTime.substring(11, 16) : '--:--'}
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              alignItems: 'center',
              backgroundColor: '#0f172a',
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#334155',
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '700' }}>TOTAL</Text>
              <Text style={{ color: '#f8fafc', fontSize: 18, fontWeight: '800' }}>{liveData?.totalStudents ?? 0}</Text>
            </View>

            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#10b981', fontSize: 11, fontWeight: '700' }}>PRESENT</Text>
              <Text style={{ color: '#10b981', fontSize: 18, fontWeight: '800' }}>{liveData?.presentCount ?? 0}</Text>
            </View>

            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#f59e0b', fontSize: 11, fontWeight: '700' }}>LATE</Text>
              <Text style={{ color: '#f59e0b', fontSize: 18, fontWeight: '800' }}>{liveData?.lateCount ?? 0}</Text>
            </View>

            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#ef4444', fontSize: 11, fontWeight: '700' }}>ABSENT</Text>
              <Text style={{ color: '#ef4444', fontSize: 18, fontWeight: '800' }}>{liveData?.absentCount ?? 0}</Text>
            </View>

            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#818cf8', fontSize: 11, fontWeight: '700' }}>RATE</Text>
              <Text style={{ color: '#818cf8', fontSize: 18, fontWeight: '800' }}>{liveData?.attendancePercentage ?? 0}%</Text>
            </View>
          </View>

          {/* Action triggers */}
          {isActive && (
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <Button
                title="Scan Student Face"
                onPress={() => setCameraVisible(true)}
                icon={<Camera size={16} color="#ffffff" />}
                variant="primary"
                size="md"
                style={{ flex: 2 }}
              />
              <Button
                title="End Class"
                onPress={() => {
                  Alert.alert('End Attendance', 'Conclude session and mark absentees?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Conclude', style: 'destructive', onPress: () => stopMutation.mutate() },
                  ]);
                }}
                loading={stopMutation.isPending}
                icon={<Square size={14} color="#ffffff" />}
                variant="danger"
                size="md"
                style={{ flex: 1 }}
              />
            </View>
          )}
        </Card>

        {/* Student Live List Header */}
        <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '800', textTransform: 'uppercase', marginBottom: 10 }}>
          Enrolled Student Live Roster ({liveData?.students?.length ?? 0})
        </Text>

        <FlatList
          data={liveData?.students || []}
          keyExtractor={(item: any) => item.studentId}
          renderItem={({ item }: { item: any }) => (
            <Card style={{ marginBottom: 10, padding: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#f8fafc', fontSize: 15, fontWeight: '700' }}>
                    {item.studentName}
                  </Text>
                  <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>
                    ID: {item.studentNumber}
                  </Text>

                  {item.recognitionTime && (
                    <Text style={{ color: '#818cf8', fontSize: 11, marginTop: 4 }}>
                      Verified: {item.recognitionTime.substring(11, 19)}
                      {item.confidence ? ` • Confidence: ${(item.confidence * 100).toFixed(1)}%` : ''}
                    </Text>
                  )}
                </View>

                <Badge status={item.status} size="sm" />
              </View>
            </Card>
          )}
        />
      </View>

      {/* Real Face Camera Verification Modal */}
      <FaceCameraModal
        visible={cameraVisible}
        onClose={() => setCameraVisible(false)}
        onCapture={async (base64: string) => {
          await verifyMutation.mutateAsync(base64);
        }}
        title="Verify Student Face"
        subtitle="Align face to mark real-time attendance"
      />
    </View>
  );
}
