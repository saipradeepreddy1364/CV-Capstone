import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
  return (
    <View
      style={[
        {
          backgroundColor: '#1e293b',
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: '#334155',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 4,
          marginBottom: 16,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};
