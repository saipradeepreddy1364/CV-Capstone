import React from 'react';
import { View, Text } from 'react-native';
import { AttendanceStatus } from '../types';
import { colors } from '../theme/colors';

interface BadgeProps {
  status: AttendanceStatus | 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({ status, size = 'md' }) => {
  let bg = colors.statusBg.noclass;
  let text = colors.status.noclass;
  let label = status as string;

  switch (status) {
    case 'PRESENT':
      bg = colors.statusBg.present;
      text = colors.status.present;
      label = 'Present';
      break;
    case 'LATE':
      bg = colors.statusBg.late;
      text = colors.status.late;
      label = 'Late';
      break;
    case 'ABSENT':
      bg = colors.statusBg.absent;
      text = colors.status.absent;
      label = 'Absent';
      break;
    case 'ACTIVE':
      bg = 'rgba(99, 102, 241, 0.2)';
      text = '#818cf8';
      label = 'Live Active';
      break;
    case 'COMPLETED':
      bg = 'rgba(100, 116, 139, 0.2)';
      text = '#94a3b8';
      label = 'Completed';
      break;
    case 'SCHEDULED':
      bg = 'rgba(56, 189, 248, 0.2)';
      text = '#38bdf8';
      label = 'Scheduled';
      break;
  }

  const px = size === 'sm' ? 8 : size === 'lg' ? 14 : 10;
  const py = size === 'sm' ? 2 : size === 'lg' ? 6 : 4;
  const fontSize = size === 'sm' ? 11 : size === 'lg' ? 14 : 12;

  return (
    <View
      style={{
        backgroundColor: bg,
        paddingHorizontal: px,
        paddingVertical: py,
        borderRadius: 9999,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: text + '40',
      }}
    >
      <Text style={{ color: text, fontWeight: '700', fontSize, textTransform: 'capitalize' }}>
        {label}
      </Text>
    </View>
  );
};
