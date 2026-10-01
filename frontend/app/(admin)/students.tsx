import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../src/api/client';
import { useAuth } from '../../src/store/authContext';
import { StudentDto, DepartmentDto, CourseDto, CreateStudentRequest } from '../../src/types';
import { Header } from '../../src/components/Header';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { Plus, Search, Trash2, Mail, GraduationCap, CheckCircle2, XCircle } from 'lucide-react-native';

export default function AdminStudentsScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // Form states
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('Password123!');
  const [studentNumber, setStudentNumber] = useState<string>('');
  const [batchYear, setBatchYear] = useState<string>('2024');
  const [semester, setSemester] = useState<string>('4');
  const [departmentId, setDepartmentId] = useState<string>('');
  const [courseId, setCourseId] = useState<string>('');

  const orgId = user?.organizationId;

  // 1. Fetch Students
  const { data: studentList = [], isLoading, refetch, isRefetching } = useQuery<StudentDto[]>({
    queryKey: ['admin_students', orgId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from('students').select('*, users(first_name, last_name, email), departments(name), courses(name)');
        if (!error && data && data.length > 0) {
          return data.map((s: any) => ({
            id: s.id,
            userId: s.user_id,
            organizationId: s.organization_id,
            studentNumber: s.student_number,
            batchYear: s.batch_year,
            semester: s.semester,
            departmentId: s.department_id,
            departmentName: s.departments?.name || '',
            courseId: s.course_id,
            courseName: s.courses?.name || '',
            hasFaceRegistered: s.has_face_registered || false,
            firstName: s.users?.first_name || '',
            lastName: s.users?.last_name || '',
            email: s.users?.email || '',
            isActive: true,
          }));
        }
      } catch (e) {}

      if (!orgId) return [];
      try {
        const res = await apiClient.get(`/organizations/${orgId}/students`);
        return res.data.data;
      } catch {
        return [];
      }
    },
  });

  // 2. Fetch Departments & Courses
  const { data: departments = [] } = useQuery<DepartmentDto[]>({
    queryKey: ['departments', orgId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from('departments').select('*');
        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({ id: d.id, name: d.name, code: d.code }));
        }
      } catch (e) {}

      try {
        const res = await apiClient.get('/departments');
        return res.data.data;
      } catch {
        return [];
      }
    },
  });

  const { data: courses = [] } = useQuery<CourseDto[]>({
    queryKey: ['courses', orgId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from('courses').select('*, departments(name)');
        if (!error && data && data.length > 0) {
          return data.map((c: any) => ({
            id: c.id,
            name: c.name,
            code: c.code,
            departmentId: c.department_id,
            departmentName: c.departments?.name || '',
            studentCount: 0,
          }));
        }
      } catch (e) {}

      try {
        const res = await apiClient.get('/courses');
        return res.data.data;
      } catch {
        return [];
      }
    },
  });

  // 3. Create Student Mutation
  const createMutation = useMutation({
    mutationFn: async (payload: CreateStudentRequest) => {
      try {
        // Create user in users table
        const { data: orgs } = await supabase.from('organizations').select('id').limit(1);
        const actualOrgId = orgs && orgs.length > 0 ? orgs[0].id : orgId;

        const { data: userRow, error: userError } = await supabase.from('users').insert([
          {
            organization_id: actualOrgId,
            email: payload.email,
            password_hash: 'placeholder_hash',
            first_name: payload.firstName,
            last_name: payload.lastName,
            role: 'STUDENT',
            is_active: true,
          }
        ]).select().single();

        if (!userError && userRow) {
          const { data: studentRow, error: studentError } = await supabase.from('students').insert([
            {
              organization_id: actualOrgId,
              user_id: userRow.id,
              student_number: payload.studentNumber,
              batch_year: payload.batchYear,
              semester: payload.semester,
              department_id: payload.departmentId || null,
              course_id: payload.courseId || null,
              has_face_registered: false,
            }
          ]).select().single();

          if (!studentError && studentRow) {
            return studentRow;
          }
        }

        const res = await apiClient.post(`/organizations/${actualOrgId}/students`, payload);
        return res.data.data;
      } catch {
        const res = await apiClient.post(`/organizations/${orgId}/students`, payload);
        return res.data.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_students'] });
      queryClient.invalidateQueries({ queryKey: ['admin_analytics'] });
      setModalVisible(false);
      resetForm();
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || err.message || 'Failed to create student');
    },
  });

  // 4. Delete Student Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        await supabase.from('students').delete().eq('id', id);
      } catch {}
      try {
        await apiClient.delete(`/students/${id}`);
      } catch {}
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_students'] });
      queryClient.invalidateQueries({ queryKey: ['admin_analytics'] });
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || err.message || 'Failed to delete student');
    },
  });

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('Password123!');
    setStudentNumber('');
    setBatchYear('2024');
    setSemester('4');
    setDepartmentId('');
    setCourseId('');
  };

  const handleCreate = () => {
    if (!firstName || !lastName || !email || !studentNumber) {
      Alert.alert('Validation', 'Please fill in required fields.');
      return;
    }
    createMutation.mutate({
      firstName,
      lastName,
      email,
      password,
      studentNumber,
      batchYear: parseInt(batchYear) || 2024,
      semester: parseInt(semester) || 1,
      departmentId: departmentId || undefined,
      courseId: courseId || undefined,
    });
  };

  const filteredStudents = studentList.filter(
    (s) =>
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.studentNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#090d16' }}>
      <Header title="Enrolled Students" subtitle="Manage registered student biometric profiles" />

      <View style={{ padding: 20, flex: 1 }}>
        {/* Search & Add Action Bar */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: '#1e293b',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#334155',
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12,
            }}
          >
            <Search size={18} color="#94a3b8" style={{ marginRight: 8 }} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search by student ID, name..."
              placeholderTextColor="#64748b"
              style={{ flex: 1, color: '#f8fafc', paddingVertical: 10, fontSize: 13 }}
            />
          </View>
          <Button
            title="Add Student"
            onPress={() => setModalVisible(true)}
            icon={<Plus size={16} color="#ffffff" />}
          />
        </View>

        {/* Student List */}
        <FlatList
          data={filteredStudents}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366f1" />}
          renderItem={({ item }) => (
            <Card style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Text style={{ color: '#f8fafc', fontSize: 16, fontWeight: '800' }}>
                      {item.fullName}
                    </Text>
                    <View style={{ backgroundColor: 'rgba(56, 189, 248, 0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                      <Text style={{ color: '#38bdf8', fontSize: 11, fontWeight: '700' }}>
                        {item.studentNumber}
                      </Text>
                    </View>
                  </View>

                  <Text style={{ color: '#94a3b8', fontSize: 13 }}>
                    {item.courseName || item.departmentName || 'Computer Science'} • Sem {item.semester}
                  </Text>

                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Mail size={13} color="#64748b" style={{ marginRight: 4 }} />
                    <Text style={{ color: '#64748b', fontSize: 12 }}>{item.email}</Text>
                  </View>

                  {/* Biometric Status Tag */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                    {item.faceRegistered ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                        <CheckCircle2 size={12} color="#10b981" style={{ marginRight: 4 }} />
                        <Text style={{ color: '#10b981', fontSize: 11, fontWeight: '700' }}>Face Registered</Text>
                      </View>
                    ) : (
                      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                        <XCircle size={12} color="#ef4444" style={{ marginRight: 4 }} />
                        <Text style={{ color: '#ef4444', fontSize: 11, fontWeight: '700' }}>Face Missing</Text>
                      </View>
                    )}
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    Alert.alert('Delete Student', `Delete ${item.fullName}?`, [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(item.id) },
                    ]);
                  }}
                  style={{
                    padding: 8,
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    borderRadius: 8,
                  }}
                >
                  <Trash2 size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </Card>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <GraduationCap size={48} color="#475569" style={{ marginBottom: 12 }} />
              <Text style={{ color: '#94a3b8', fontSize: 15, fontWeight: '600' }}>
                {isLoading ? 'Loading student roster...' : 'No students found.'}
              </Text>
            </View>
          }
        />
      </View>

      {/* Add Student Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 }}>
          <Card style={{ maxHeight: '90%', padding: 20 }}>
            <Text style={{ color: '#f8fafc', fontSize: 18, fontWeight: '800', marginBottom: 16 }}>
              Register New Student
            </Text>

            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '700', marginBottom: 4 }}>FIRST NAME *</Text>
                  <TextInput
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="e.g. John"
                    placeholderTextColor="#475569"
                    style={{ backgroundColor: '#0f172a', color: '#f8fafc', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#334155' }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '700', marginBottom: 4 }}>LAST NAME *</Text>
                  <TextInput
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="e.g. Doe"
                    placeholderTextColor="#475569"
                    style={{ backgroundColor: '#0f172a', color: '#f8fafc', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#334155' }}
                  />
                </View>
              </View>

              <View>
                <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '700', marginBottom: 4 }}>STUDENT ID NUMBER *</Text>
                <TextInput
                  value={studentNumber}
                  onChangeText={setStudentNumber}
                  placeholder="e.g. STU006"
                  placeholderTextColor="#475569"
                  style={{ backgroundColor: '#0f172a', color: '#f8fafc', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#334155' }}
                />
              </View>

              <View>
                <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '700', marginBottom: 4 }}>STUDENT EMAIL *</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="e.g. stu006@abc.edu"
                  placeholderTextColor="#475569"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={{ backgroundColor: '#0f172a', color: '#f8fafc', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#334155' }}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '700', marginBottom: 4 }}>BATCH YEAR</Text>
                  <TextInput
                    value={batchYear}
                    onChangeText={setBatchYear}
                    placeholder="2024"
                    keyboardType="numeric"
                    placeholderTextColor="#475569"
                    style={{ backgroundColor: '#0f172a', color: '#f8fafc', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#334155' }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '700', marginBottom: 4 }}>SEMESTER</Text>
                  <TextInput
                    value={semester}
                    onChangeText={setSemester}
                    placeholder="4"
                    keyboardType="numeric"
                    placeholderTextColor="#475569"
                    style={{ backgroundColor: '#0f172a', color: '#f8fafc', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#334155' }}
                  />
                </View>
              </View>

              {/* Department Selector */}
              <View>
                <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '700', marginBottom: 4 }}>DEPARTMENT</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {departments.map((d) => (
                    <TouchableOpacity
                      key={d.id}
                      onPress={() => setDepartmentId(d.id)}
                      style={{
                        backgroundColor: departmentId === d.id ? '#6366f1' : '#0f172a',
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: departmentId === d.id ? '#6366f1' : '#334155',
                      }}
                    >
                      <Text style={{ color: '#f8fafc', fontSize: 11, fontWeight: '600' }}>{d.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                <Button
                  title="Cancel"
                  variant="secondary"
                  onPress={() => setModalVisible(false)}
                  style={{ flex: 1 }}
                />
                <Button
                  title="Create Student"
                  onPress={handleCreate}
                  loading={createMutation.isPending}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </Card>
        </View>
      </Modal>
    </View>
  );
}
