import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  color?: string;
  small?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  icon, 
  label, 
  value, 
  color = '#FF6B35',
  small = false 
}) => {
  return (
    <View style={[styles.container, small && styles.containerSmall]}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={small ? 20 : 24} color={color} />
      </View>
      <Text style={[styles.value, small && styles.valueSmall]}>{value}</Text>
      <Text style={[styles.label, small && styles.labelSmall]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    minWidth: 100,
    flex: 1,
  },
  containerSmall: {
    padding: 12,
    minWidth: 80,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  value: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  valueSmall: {
    fontSize: 18,
  },
  label: {
    color: '#8892B0',
    fontSize: 12,
    textAlign: 'center',
  },
  labelSmall: {
    fontSize: 10,
  },
});
