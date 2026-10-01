import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../src/api/client';
import { useAuth } from '../../src/store/authContext';
import { StudentDto } from '../../src/types';
import { Header } from '../../src/components/Header';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { FaceCameraModal } from '../../src/components/FaceCameraModal';
import { Camera, CheckCircle2, XCircle, Search, Trash2 } from 'lucide-react-native';

export default function FacultyFaceRegistrationScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const facultyId = user?.facultyId;

  const [selectedStudent, setSelectedStudent] = useState<StudentDto | null>(null);
  const [cameraVisible, setCameraVisible] = useState<boolean>(false);

  // Fetch Assigned Students
  const { data: students = [], isLoading, refetch, isRefetching } = useQuery<StudentDto[]>({
    queryKey: ['faculty_assigned_students', facultyId],
    queryFn: async () => {
      if (!facultyId) return [];
      const res = await apiClient.get(`/faculty/${facultyId}/students`);
      return res.data.data;
    },
    enabled: !!facultyId,
  });

  // Register Face Mutation
  const registerMutation = useMutation({
    mutationFn: async (imageBase64: string) => {
      if (!selectedStudent) throw new Error('No student selected');
      const res = await apiClient.post('/face/register', {
        studentId: selectedStudent.id,
        imageBase64,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty_assigned_students'] });
      Alert.alert('Registration Successful', `Biometric face profile registered for ${selectedStudent?.fullName}.`);
      setSelectedStudent(null);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Face registration failed';
      Alert.alert('Registration Error', msg);
    },
  });

  // Delete Face Profile Mutation
  const deleteMutation = useMutation({
    mutationFn: async (studentId: string) => {
      await apiClient.delete(`/face/${studentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty_assigned_students'] });
      Alert.alert('Profile Deleted', 'Biometric data removed.');
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#090d16' }}>
      <Header title="Biometric Face Enrollment" subtitle="Enroll and update student face embeddings" />

      <View style={{ padding: 20, flex: 1 }}>
        <Text style={{ color: '#94a3b8', fontSize: 13, marginBottom: 14 }}>
          Select an enrolled student to capture and register their biometric template using the camera.
        </Text>

        <FlatList
          data={students}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366f1" />}
          renderItem={({ item }) => (
            <Card style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#f8fafc', fontSize: 16, fontWeight: '700' }}>
                    {item.fullName}
                  </Text>
                  <Text style={{ color: '#818cf8', fontSize: 12, marginTop: 2 }}>
                    ID: {item.studentNumber}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                    {item.faceRegistered ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                        <CheckCircle2 size={12} color="#10b981" style={{ marginRight: 4 }} />
                        <Text style={{ color: '#10b981', fontSize: 11, fontWeight: '700' }}>Enrolled</Text>
                      </View>
                    ) : (
                      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                        <XCircle size={12} color="#ef4444" style={{ marginRight: 4 }} />
                        <Text style={{ color: '#ef4444', fontSize: 11, fontWeight: '700' }}>Not Enrolled</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Button
                    title={item.faceRegistered ? 'Update Face' : 'Enroll Face'}
                    onPress={() => {
                      setSelectedStudent(item);
                      setCameraVisible(true);
                    }}
                    icon={<Camera size={14} color="#ffffff" />}
                    size="sm"
                    variant={item.faceRegistered ? 'outline' : 'primary'}
                  />

                  {item.faceRegistered && (
                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert('Delete Biometric', `Delete biometric template for ${item.fullName}?`, [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(item.id) },
                        ]);
                      }}
                      style={{ padding: 8, backgroundColor: 'rgba(239, 68, 68, 0.15)', borderRadius: 8 }}
                    >
                      <Trash2 size={16} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </Card>
          )}
        />
      </View>

      <FaceCameraModal
        visible={cameraVisible}
        onClose={() => {
          setCameraVisible(false);
          setSelectedStudent(null);
        }}
        onCapture={async (base64) => {
          await registerMutation.mutateAsync(base64);
        }}
        title={`Enroll Face: ${selectedStudent?.fullName || 'Student'}`}
        subtitle="Maintain front-facing posture with even lighting"
      />
    </View>
  );
}
