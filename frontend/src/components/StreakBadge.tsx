import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StreakBadgeProps {
  streak: number;
  label: string;
  isLongest?: boolean;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({ streak, label, isLongest = false }) => {
  const getColor = () => {
    if (streak >= 100) return '#FFD700';
    if (streak >= 30) return '#FF6B35';
    if (streak >= 7) return '#00D9FF';
    return '#8892B0';
  };

  return (
    <View style={[styles.container, { borderColor: getColor() }]}>
      <Ionicons 
        name={isLongest ? 'trophy' : 'flame'} 
        size={32} 
        color={getColor()} 
      />
      <Text style={[styles.streak, { color: getColor() }]}>{streak}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    flex: 1,
    marginHorizontal: 6,
  },
  streak: {
    fontSize: 36,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  label: {
    color: '#8892B0',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
