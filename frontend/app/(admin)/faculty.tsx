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
import { FacultyDto, DepartmentDto, CreateFacultyRequest } from '../../src/types';
import { Header } from '../../src/components/Header';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { Plus, Search, Trash2, Mail, Phone, BookOpen, User, Building2 } from 'lucide-react-native';

export default function AdminFacultyScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // Form states
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('Password123!');
  const [phone, setPhone] = useState<string>('');
  const [facultyNumber, setFacultyNumber] = useState<string>('');
  const [designation, setDesignation] = useState<string>('Assistant Professor');
  const [departmentId, setDepartmentId] = useState<string>('');

  const orgId = user?.organizationId;

  // 1. Fetch Faculty
  const { data: facultyList = [], isLoading, refetch, isRefetching } = useQuery<FacultyDto[]>({
    queryKey: ['admin_faculty', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const res = await apiClient.get(`/organizations/${orgId}/faculty`);
      return res.data.data;
    },
    enabled: !!orgId,
  });

  // 2. Fetch Departments for assignment
  const { data: departments = [] } = useQuery<DepartmentDto[]>({
    queryKey: ['departments', orgId],
    queryFn: async () => {
      const res = await apiClient.get('/departments');
      return res.data.data;
    },
    enabled: !!orgId,
  });

  // 3. Create Faculty Mutation
  const createMutation = useMutation({
    mutationFn: async (payload: CreateFacultyRequest) => {
      const res = await apiClient.post(`/organizations/${orgId}/faculty`, payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_faculty'] });
      queryClient.invalidateQueries({ queryKey: ['admin_analytics'] });
      setModalVisible(false);
      resetForm();
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create faculty');
    },
  });

  // 4. Delete Faculty Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/faculty/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_faculty'] });
      queryClient.invalidateQueries({ queryKey: ['admin_analytics'] });
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'Failed to delete faculty');
    },
  });

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('Password123!');
    setPhone('');
    setFacultyNumber('');
    setDesignation('Assistant Professor');
    setDepartmentId('');
  };

  const handleCreate = () => {
    if (!firstName || !lastName || !email || !facultyNumber) {
      Alert.alert('Validation', 'Please fill in all required fields.');
      return;
    }
    createMutation.mutate({
      firstName,
      lastName,
      email,
      password,
      phone,
      facultyNumber,
      designation,
      departmentId: departmentId || undefined,
    });
  };

  const filteredFaculty = facultyList.filter(
    (f) =>
      f.fullName.toLowerCase().includes(search.toLowerCase()) ||
      f.email.toLowerCase().includes(search.toLowerCase()) ||
      f.facultyNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#090d16' }}>
      <Header title="Faculty Members" subtitle="Manage academic staff and teaching faculties" />

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
              placeholder="Search by name, ID or email..."
              placeholderTextColor="#64748b"
              style={{ flex: 1, color: '#f8fafc', paddingVertical: 10, fontSize: 13 }}
            />
          </View>
          <Button
            title="Add Faculty"
            onPress={() => setModalVisible(true)}
            icon={<Plus size={16} color="#ffffff" />}
          />
        </View>

        {/* Faculty List */}
        <FlatList
          data={filteredFaculty}
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
                    <View style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                      <Text style={{ color: '#818cf8', fontSize: 11, fontWeight: '700' }}>
                        {item.facultyNumber}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ color: '#94a3b8', fontSize: 13 }}>{item.designation || 'Faculty'}</Text>
                  {item.departmentName && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      <Building2 size={13} color="#64748b" style={{ marginRight: 4 }} />
                      <Text style={{ color: '#64748b', fontSize: 12 }}>{item.departmentName}</Text>
                    </View>
                  )}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Mail size={13} color="#64748b" style={{ marginRight: 4 }} />
                    <Text style={{ color: '#64748b', fontSize: 12 }}>{item.email}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    Alert.alert('Delete Faculty', `Delete ${item.fullName}?`, [
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

              {/* Assigned Subjects tags */}
              {item.assignedSubjects && item.assignedSubjects.length > 0 && (
                <View style={{ marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#334155', flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {item.assignedSubjects.map((sub) => (
                    <View key={sub.id} style={{ backgroundColor: '#0f172a', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: '#334155' }}>
                      <Text style={{ color: '#38bdf8', fontSize: 11, fontWeight: '600' }}>
                        {sub.code} - {sub.name}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <User size={48} color="#475569" style={{ marginBottom: 12 }} />
              <Text style={{ color: '#94a3b8', fontSize: 15, fontWeight: '600' }}>
                {isLoading ? 'Loading faculty list...' : 'No faculty members found.'}
              </Text>
            </View>
          }
        />
      </View>

      {/* Add Faculty Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 }}>
          <Card style={{ maxHeight: '90%', padding: 20 }}>
            <Text style={{ color: '#f8fafc', fontSize: 18, fontWeight: '800', marginBottom: 16 }}>
              Register New Faculty Member
            </Text>

            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '700', marginBottom: 4 }}>FIRST NAME *</Text>
                  <TextInput
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="e.g. Alan"
                    placeholderTextColor="#475569"
                    style={{ backgroundColor: '#0f172a', color: '#f8fafc', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#334155' }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '700', marginBottom: 4 }}>LAST NAME *</Text>
                  <TextInput
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="e.g. Turing"
                    placeholderTextColor="#475569"
                    style={{ backgroundColor: '#0f172a', color: '#f8fafc', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#334155' }}
                  />
                </View>
              </View>

              <View>
                <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '700', marginBottom: 4 }}>FACULTY ID NUMBER *</Text>
                <TextInput
                  value={facultyNumber}
                  onChangeText={setFacultyNumber}
                  placeholder="e.g. FAC004"
                  placeholderTextColor="#475569"
                  style={{ backgroundColor: '#0f172a', color: '#f8fafc', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#334155' }}
                />
              </View>

              <View>
                <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '700', marginBottom: 4 }}>EMAIL ADDRESS *</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="e.g. alan.turing@abc.edu"
                  placeholderTextColor="#475569"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={{ backgroundColor: '#0f172a', color: '#f8fafc', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#334155' }}
                />
              </View>

              <View>
                <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '700', marginBottom: 4 }}>DESIGNATION</Text>
                <TextInput
                  value={designation}
                  onChangeText={setDesignation}
                  placeholder="e.g. Associate Professor"
                  placeholderTextColor="#475569"
                  style={{ backgroundColor: '#0f172a', color: '#f8fafc', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#334155' }}
                />
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
                  title="Create Faculty"
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
