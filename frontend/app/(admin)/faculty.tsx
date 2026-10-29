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
import { supabase } from '../../src/lib/supabase';
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
      try {
        const { data, error } = await supabase
          .from('faculty')
          .select('*, users(first_name, last_name, email, phone), departments(name)');
        if (!error && data) {
          return data.map((f: any) => {
            const first = f.users?.first_name || '';
            const last = f.users?.last_name || '';
            const fullName = `${first} ${last}`.trim() || f.users?.email || 'Faculty Member';
            return {
              id: f.id,
              userId: f.user_id,
              organizationId: f.organization_id,
              facultyNumber: f.faculty_number || '',
              designation: f.designation || 'Faculty',
              departmentId: f.department_id,
              departmentName: f.departments?.name || '',
              firstName: first,
              lastName: last,
              fullName: fullName,
              email: f.users?.email || '',
              phone: f.users?.phone || '',
              isActive: true,
              createdAt: f.created_at || new Date().toISOString(),
            };
          });
        }
      } catch (e) {
        console.warn('Supabase fetch faculty error:', e);
      }

      if (!orgId) return [];
      try {
        const res = await apiClient.get(`/organizations/${orgId}/faculty`);
        return (res.data.data || []).map((f: any) => ({
          ...f,
          fullName: f.fullName || `${f.firstName || ''} ${f.lastName || ''}`.trim() || f.email || 'Faculty Member',
        }));
      } catch {
        return [];
      }
    },
  });

  // 2. Fetch Departments for assignment
  const { data: departments = [] } = useQuery<DepartmentDto[]>({
    queryKey: ['departments', orgId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from('departments').select('*');
        if (!error && data) {
          return data.map((d: any) => ({
            id: d.id,
            name: d.name,
            code: d.code,
            organizationId: d.organization_id,
            createdAt: d.created_at,
          }));
        }
      } catch (e) {
        console.warn('Supabase fetch departments error:', e);
      }

      try {
        const res = await apiClient.get('/departments');
        return res.data.data || [];
      } catch {
        return [];
      }
    },
  });

  // 3. Create Faculty Mutation
  const createMutation = useMutation({
    mutationFn: async (payload: CreateFacultyRequest) => {
      try {
        const { data: orgs } = await supabase.from('organizations').select('id').limit(1);
        const actualOrgId = orgs && orgs.length > 0 ? orgs[0].id : orgId;

        const { data: userRow, error: userError } = await supabase.from('users').insert([
          {
            organization_id: actualOrgId,
            email: payload.email.toLowerCase().trim(),
            password_hash: payload.password || 'Faculty@123',
            first_name: payload.firstName.trim(),
            last_name: payload.lastName.trim(),
            phone: payload.phone || null,
            role: 'FACULTY',
            is_active: true,
          }
        ]).select().single();

        if (userError) {
          console.warn('User insert error in Supabase:', userError);
          if (userError.code === '23505' || userError.message?.toLowerCase().includes('duplicate') || userError.message?.toLowerCase().includes('unique')) {
            throw new Error('A user with this email address already exists.');
          }
          throw new Error(userError.message || 'Failed to create user account');
        }

        if (userRow) {
          const { data: facRow, error: facError } = await supabase.from('faculty').insert([
            {
              organization_id: actualOrgId,
              user_id: userRow.id,
              faculty_number: payload.facultyNumber.trim(),
              designation: payload.designation,
              department_id: payload.departmentId || null,
            }
          ]).select().single();

          if (facError) {
            console.warn('Faculty insert error in Supabase:', facError);
            if (facError.code === '23505' || facError.message?.toLowerCase().includes('duplicate') || facError.message?.toLowerCase().includes('unique')) {
              throw new Error('A faculty member with this ID number already exists.');
            }
            throw new Error(facError.message || 'Failed to register faculty profile');
          }

          if (facRow) {
            return facRow;
          }
        }

        const res = await apiClient.post(`/organizations/${actualOrgId}/faculty`, payload);
        return res.data.data;
      } catch (err: any) {
        if (err.message && !err.response) {
          throw err;
        }
        try {
          const res = await apiClient.post(`/organizations/${orgId}/faculty`, payload);
          return res.data.data;
        } catch (apiErr: any) {
          throw new Error(err.message || apiErr.response?.data?.message || 'Failed to create faculty');
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_faculty'] });
      queryClient.invalidateQueries({ queryKey: ['admin_analytics'] });
      setModalVisible(false);
      resetForm();
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || err.message || 'Failed to create faculty');
    },
  });

  // 4. Delete Faculty Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        const { data: fac } = await supabase.from('faculty').select('user_id').eq('id', id).maybeSingle();
        await supabase.from('faculty').delete().eq('id', id);
        if (fac?.user_id) {
          await supabase.from('users').delete().eq('id', fac.user_id);
        }
      } catch (e) {
        console.warn('Supabase delete error:', e);
      }
      try {
        await apiClient.delete(`/faculty/${id}`);
      } catch {}
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_faculty'] });
      queryClient.invalidateQueries({ queryKey: ['admin_analytics'] });
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || err.message || 'Failed to delete faculty');
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
      (f.fullName || `${f.firstName || ''} ${f.lastName || ''}`).toLowerCase().includes(search.toLowerCase()) ||
      (f.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (f.facultyNumber || '').toLowerCase().includes(search.toLowerCase())
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
                      {item.fullName || `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.email || 'Faculty'}
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
                    Alert.alert('Delete Faculty', `Delete ${item.fullName || item.email || 'this faculty member'}?`, [
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
                <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '700', marginBottom: 4 }}>INITIAL LOGIN PASSWORD *</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="e.g. Faculty@123"
                  placeholderTextColor="#475569"
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
