import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../src/api/client';
import { useAuth } from '../../src/store/authContext';
import { StudentDto } from '../../src/types';
import { Header } from '../../src/components/Header';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { FaceCameraModal } from '../../src/components/FaceCameraModal';
import { Camera, ShieldCheck, CheckCircle2, XCircle, Trash2, Info } from 'lucide-react-native';

export default function StudentFaceRegistrationScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [cameraVisible, setCameraVisible] = useState<boolean>(false);
  const studentId = user?.studentId;

  const { data: student, isLoading } = useQuery<StudentDto>({
    queryKey: ['student_profile', studentId],
    queryFn: async () => {
      if (!studentId) return null;
      const res = await apiClient.get(`/students/${studentId}`);
      return res.data.data;
    },
    enabled: !!studentId,
  });

  const registerMutation = useMutation({
    mutationFn: async (imageBase64: string) => {
      if (!studentId) throw new Error('Student ID is missing');
      const res = await apiClient.post('/face/register', {
        studentId,
        imageBase64,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student_profile', studentId] });
      Alert.alert('Success', 'Your face biometric profile has been registered securely.');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Face registration failed';
      Alert.alert('Registration Alert', msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!studentId) return;
      await apiClient.delete(`/face/${studentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student_profile', studentId] });
      Alert.alert('Deleted', 'Your biometric face profile has been deleted.');
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'Failed to delete face profile');
    },
  });

  const hasFace = student?.faceRegistered;

  return (
    <View style={{ flex: 1, backgroundColor: '#090d16' }}>
      <Header title="Face ID Registration" subtitle="Manage your biometric recognition template" />

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Status Card */}
        <Card style={{ alignItems: 'center', padding: 24, marginBottom: 16 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: hasFace ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16,
              borderWidth: 2,
              borderColor: hasFace ? '#10b981' : '#ef4444',
            }}
          >
            {hasFace ? (
              <CheckCircle2 size={40} color="#10b981" />
            ) : (
              <Camera size={40} color="#ef4444" />
            )}
          </View>

          <Text style={{ color: '#f8fafc', fontSize: 18, fontWeight: '800' }}>
            {hasFace ? 'Biometric Face ID Active' : 'Face ID Not Registered'}
          </Text>
          <Text style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', marginTop: 6, lineHeight: 18 }}>
            {hasFace
              ? 'Your face template is registered for automatic class attendance verification.'
              : 'Register your face to enable instantaneous AI check-ins during university lectures.'}
          </Text>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 20, width: '100%' }}>
            <Button
              title={hasFace ? 'Update Face Scan' : 'Register Face Now'}
              onPress={() => setCameraVisible(true)}
              icon={<Camera size={16} color="#ffffff" />}
              variant="primary"
              size="lg"
              style={{ flex: 1 }}
            />

            {hasFace && (
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    'Delete Face Profile',
                    'Are you sure you want to delete your biometric face data?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate() },
                    ]
                  );
                }}
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#ef4444',
                }}
              >
                <Trash2 size={20} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>
        </Card>

        {/* Biometric Privacy & Security Note (Section 17) */}
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <ShieldCheck size={20} color="#818cf8" style={{ marginRight: 8 }} />
            <Text style={{ color: '#f8fafc', fontSize: 16, fontWeight: '800' }}>
              Biometric Data Privacy
            </Text>
          </View>

          <Text style={{ color: '#94a3b8', fontSize: 12, lineHeight: 18, marginBottom: 10 }}>
            Your biometric security is protected by institutional policy:
          </Text>
          <Text style={{ color: '#64748b', fontSize: 12, lineHeight: 18 }}>
            • No raw photos are stored or served publicly.{'\n'}
            • Mathematical 128-dimensional vectors are isolated to your university tenant.{'\n'}
            • You may update or delete your biometric face template at any time.
          </Text>
        </Card>
      </ScrollView>

      {/* Face Camera Modal */}
      <FaceCameraModal
        visible={cameraVisible}
        onClose={() => setCameraVisible(false)}
        onCapture={async (base64) => {
          await registerMutation.mutateAsync(base64);
        }}
        title="Student Face Registration"
        subtitle="Align your face inside the oval frame"
      />
    </View>
  );
}
