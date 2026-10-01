import React from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../src/api/client';
import { AuditLogDto } from '../../src/types';
import { Header } from '../../src/components/Header';
import { Card } from '../../src/components/Card';
import { History, Shield, Globe, Clock } from 'lucide-react-native';

export default function AdminAuditLogsScreen() {
  const { data: logs = [], isLoading, refetch, isRefetching } = useQuery<AuditLogDto[]>({
    queryKey: ['audit_logs'],
    queryFn: async () => {
      const res = await apiClient.get('/audit-logs');
      return res.data.data;
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#090d16' }}>
      <Header title="Security Audit Logs" subtitle="Tamper-evident trail of administrative and biometric events" showBack />

      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366f1" />}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 12, padding: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    backgroundColor:
                      item.action.includes('VERIFICATION') || item.action.includes('REGISTRATION')
                        ? 'rgba(16, 185, 129, 0.15)'
                        : 'rgba(99, 102, 241, 0.15)',
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 6,
                    marginRight: 8,
                  }}
                >
                  <Text
                    style={{
                      color:
                        item.action.includes('VERIFICATION') || item.action.includes('REGISTRATION')
                          ? '#10b981'
                          : '#818cf8',
                      fontSize: 11,
                      fontWeight: '800',
                    }}
                  >
                    {item.action}
                  </Text>
                </View>
                <Text style={{ color: '#94a3b8', fontSize: 12 }}>{item.entity}</Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Clock size={12} color="#64748b" style={{ marginRight: 4 }} />
                <Text style={{ color: '#64748b', fontSize: 11 }}>
                  {item.timestamp ? item.timestamp.substring(0, 19).replace('T', ' ') : ''}
                </Text>
              </View>
            </View>

            {item.metadata && (
              <Text style={{ color: '#f8fafc', fontSize: 13, marginBottom: 6, fontWeight: '500' }}>
                {item.metadata}
              </Text>
            )}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#64748b', fontSize: 11 }}>
                By: {item.userName || item.userEmail || 'System'}
              </Text>
              {item.ipAddress && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Globe size={11} color="#64748b" style={{ marginRight: 3 }} />
                  <Text style={{ color: '#64748b', fontSize: 11 }}>{item.ipAddress}</Text>
                </View>
              )}
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <History size={48} color="#475569" style={{ marginBottom: 12 }} />
            <Text style={{ color: '#94a3b8', fontSize: 15, fontWeight: '600' }}>
              {isLoading ? 'Loading audit records...' : 'No audit events recorded yet.'}
            </Text>
          </View>
        }
      />
    </View>
  );
}
