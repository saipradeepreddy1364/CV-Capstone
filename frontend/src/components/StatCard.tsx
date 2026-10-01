import React from 'react';
import { View, Text } from 'react-native';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  accentColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  accentColor = '#6366f1',
}) => {
  return (
    <View
      style={{
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#334155',
        flex: 1,
        minWidth: 140,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          backgroundColor: accentColor,
        }}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '600' }}>{title}</Text>
        {icon && <View style={{ opacity: 0.9 }}>{icon}</View>}
      </View>
      <Text style={{ color: '#f8fafc', fontSize: 24, fontWeight: '800', marginTop: 8 }}>
        {value}
      </Text>
      {subtitle && (
        <Text style={{ color: '#64748b', fontSize: 11, marginTop: 4, fontWeight: '500' }}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};
