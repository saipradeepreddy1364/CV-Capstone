import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
}) => {
  let bgColor = '#6366f1';
  let textColor = '#ffffff';
  let borderColor = 'transparent';

  switch (variant) {
    case 'secondary':
      bgColor = '#334155';
      textColor = '#f8fafc';
      break;
    case 'danger':
      bgColor = '#ef4444';
      textColor = '#ffffff';
      break;
    case 'success':
      bgColor = '#10b981';
      textColor = '#ffffff';
      break;
    case 'outline':
      bgColor = 'transparent';
      textColor = '#818cf8';
      borderColor = '#6366f1';
      break;
  }

  const py = size === 'sm' ? 8 : size === 'lg' ? 16 : 12;
  const px = size === 'sm' ? 12 : size === 'lg' ? 24 : 18;
  const fontSize = size === 'sm' ? 13 : size === 'lg' ? 16 : 14;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        {
          backgroundColor: disabled ? '#475569' : bgColor,
          paddingVertical: py,
          paddingHorizontal: px,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon && <span style={{ marginRight: 8 }}>{icon}</span>}
          <Text style={{ color: textColor, fontWeight: '700', fontSize, textAlign: 'center' }}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};
