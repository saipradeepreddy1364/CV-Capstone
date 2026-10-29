import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, Switch, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../src/api/client';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/store/authContext';
import { AttendanceSettingsDto, UpdateAttendanceSettingsRequest } from '../../src/types';
import { Header } from '../../src/components/Header';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { Sliders, Shield, Clock, Save } from 'lucide-react-native';

export default function AdminSettingsScreen() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [thresholdMinutes, setThresholdMinutes] = useState<string>('10');
  const [lateEnabled, setLateEnabled] = useState<boolean>(true);
  const [minConfidence, setMinConfidence] = useState<string>('0.75');
  const [sessionDuration, setSessionDuration] = useState<string>('60');

  const { data: settings, isLoading } = useQuery<AttendanceSettingsDto>({
    queryKey: ['attendance_settings'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from('attendance_settings').select('*').limit(1).maybeSingle();
        if (!error && data) {
          return {
            id: data.id,
            organizationId: data.organization_id,
            thresholdMinutes: data.threshold_minutes ?? 10,
            lateEnabled: data.late_enabled ?? true,
            lateStatus: data.late_status || 'LATE',
            minimumRecognitionConfidence: data.minimum_recognition_confidence ?? 0.75,
            sessionDurationMinutes: data.session_duration_minutes ?? 60,
          };
        }
      } catch (e) {}

      try {
        const res = await apiClient.get('/attendance/settings');
        return res.data.data;
      } catch {
        return {
          id: 'default',
          organizationId: user?.organizationId || '',
          thresholdMinutes: 10,
          lateEnabled: true,
          lateStatus: 'LATE',
          minimumRecognitionConfidence: 0.75,
          sessionDurationMinutes: 60,
        };
      }
    },
  });

  useEffect(() => {
    if (settings) {
      setThresholdMinutes(String(settings.thresholdMinutes ?? 10));
      setLateEnabled(settings.lateEnabled ?? true);
      setMinConfidence(String(settings.minimumRecognitionConfidence ?? 0.75));
      setSessionDuration(String(settings.sessionDurationMinutes ?? 60));
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (payload: UpdateAttendanceSettingsRequest) => {
      try {
        const { data: orgs } = await supabase.from('organizations').select('id').limit(1);
        const orgId = orgs && orgs.length > 0 ? orgs[0].id : user?.organizationId;

        const updateData: any = {
          threshold_minutes: payload.thresholdMinutes,
          late_enabled: payload.lateEnabled,
          late_status: payload.lateStatus || 'LATE',
          minimum_recognition_confidence: payload.minimumRecognitionConfidence,
          session_duration_minutes: payload.sessionDurationMinutes,
          updated_at: new Date().toISOString(),
        };

        const { data: existing } = await supabase.from('attendance_settings').select('id').limit(1).maybeSingle();
        if (existing) {
          const { data, error } = await supabase.from('attendance_settings').update(updateData).eq('id', existing.id).select().single();
          if (!error && data) return data;
        } else if (orgId) {
          updateData.organization_id = orgId;
          const { data, error } = await supabase.from('attendance_settings').insert([updateData]).select().single();
          if (!error && data) return data;
        }
      } catch (e) {}

      const res = await apiClient.put('/attendance/settings', payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance_settings'] });
      Alert.alert('Saved', 'Attendance policies updated successfully.');
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || err.message || 'Failed to update settings');
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      thresholdMinutes: parseInt(thresholdMinutes) || 10,
      lateEnabled,
      lateStatus: 'LATE',
      minimumRecognitionConfidence: parseFloat(minConfidence) || 0.75,
      sessionDurationMinutes: parseInt(sessionDuration) || 60,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#090d16' }}>
      <Header title="Attendance Policies" subtitle="Configure organization biometric rules and thresholds" />

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Clock size={20} color="#818cf8" style={{ marginRight: 8 }} />
            <Text style={{ color: '#f8fafc', fontSize: 16, fontWeight: '800' }}>
              Timing & Grace Periods
            </Text>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '700', marginBottom: 6 }}>
              LATE THRESHOLD (MINUTES)
            </Text>
            <TextInput
              value={thresholdMinutes}
              onChangeText={setThresholdMinutes}
              keyboardType="numeric"
              style={{
                backgroundColor: '#0f172a',
                color: '#f8fafc',
                padding: 12,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#334155',
              }}
            />
            <Text style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>
              Students recognized after this threshold will be marked LATE instead of PRESENT.
            </Text>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '700', marginBottom: 6 }}>
              DEFAULT SESSION DURATION (MINUTES)
            </Text>
            <TextInput
              value={sessionDuration}
              onChangeText={setSessionDuration}
              keyboardType="numeric"
              style={{
                backgroundColor: '#0f172a',
                color: '#f8fafc',
                padding: 12,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#334155',
              }}
            />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={{ color: '#f8fafc', fontSize: 14, fontWeight: '700' }}>Enable Late Status</Text>
              <Text style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>
                When disabled, all check-ins before session end are marked PRESENT.
              </Text>
            </View>
            <Switch
              value={lateEnabled}
              onValueChange={setLateEnabled}
              trackColor={{ false: '#334155', true: '#6366f1' }}
              thumbColor="#ffffff"
            />
          </View>
        </Card>

        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Shield size={20} color="#10b981" style={{ marginRight: 8 }} />
            <Text style={{ color: '#f8fafc', fontSize: 16, fontWeight: '800' }}>
              Biometric Accuracy & Security
            </Text>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '700', marginBottom: 6 }}>
              MINIMUM FACE MATCH CONFIDENCE THRESHOLD (0.50 - 0.95)
            </Text>
            <TextInput
              value={minConfidence}
              onChangeText={setMinConfidence}
              keyboardType="numeric"
              style={{
                backgroundColor: '#0f172a',
                color: '#f8fafc',
                padding: 12,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#334155',
              }}
            />
            <Text style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>
              Higher values (e.g. 0.80) require stricter similarity; lower values allow wider variances.
            </Text>
          </View>
        </Card>

        <Button
          title="Save Configuration"
          onPress={handleSave}
          loading={updateMutation.isPending}
          icon={<Save size={16} color="#ffffff" />}
          size="lg"
        />
      </ScrollView>
    </View>
  );
}
