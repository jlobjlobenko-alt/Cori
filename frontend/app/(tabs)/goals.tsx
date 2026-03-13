import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../src/store/appStore';
import { getTranslation } from '../../src/i18n/translations';
import { getTotalDeliveries, getTotalEarnings, getTotalHours, formatCurrency } from '../../src/utils/helpers';

export default function GoalsScreen() {
  const store = useAppStore();
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [tempGoals, setTempGoals] = useState(store.dailyGoals);

  const t = (key: any) => getTranslation(store.language, key);

  // Today's progress
  const todayShifts = store.shifts.filter(
    s => s.date === new Date().toISOString().split('T')[0]
  );
  const todayDeliveries = todayShifts.reduce((sum, s) => sum + s.deliveries, 0);
  const todayEarnings = todayShifts.reduce((sum, s) => sum + s.earnings, 0);
  const todayHours = getTotalHours(todayShifts);

  // Calculate progress percentages
  const deliveryProgress = Math.min((todayDeliveries / store.dailyGoals.deliveryTarget) * 100, 100);
  const earningsProgress = Math.min((todayEarnings / store.dailyGoals.earningsTarget) * 100, 100);
  const hoursProgress = Math.min((todayHours / store.dailyGoals.hoursTarget) * 100, 100);

  const totalDeliveries = getTotalDeliveries(store.shifts);
  const totalEarnings = getTotalEarnings(store.shifts);

  const handleSaveGoals = () => {
    store.setDailyGoals(tempGoals);
    setShowGoalsModal(false);
  };

  const getAchievementIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'streak':
        return 'flame';
      case 'delivery':
        return 'bicycle';
      case 'earnings':
        return 'cash';
      default:
        return 'star';
    }
  };

  const getAchievementProgress = (achievement: any): number => {
    if (achievement.unlockedAt) return 100;
    
    switch (achievement.type) {
      case 'streak':
        return Math.min((store.longestStreak / achievement.requirement) * 100, 99);
      case 'delivery':
        return Math.min((totalDeliveries / achievement.requirement) * 100, 99);
      case 'earnings':
        return Math.min((totalEarnings / achievement.requirement) * 100, 99);
      default:
        return 0;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Daily Goals Section */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>{t('dailyGoals')}</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              setTempGoals(store.dailyGoals);
              setShowGoalsModal(true);
            }}
          >
            <Ionicons name="settings-outline" size={20} color="#FF6B35" />
          </TouchableOpacity>
        </View>

        {/* Goals Progress */}
        <View style={styles.goalsCard}>
          {/* Delivery Goal */}
          <View style={styles.goalItem}>
            <View style={styles.goalHeader}>
              <View style={styles.goalIconContainer}>
                <Ionicons name="bicycle" size={24} color="#00D9FF" />
              </View>
              <View style={styles.goalInfo}>
                <Text style={styles.goalLabel}>{t('deliveryTarget')}</Text>
                <Text style={styles.goalValue}>
                  {todayDeliveries} / {store.dailyGoals.deliveryTarget}
                </Text>
              </View>
              <Text style={styles.goalPercent}>{Math.round(deliveryProgress)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${deliveryProgress}%`, backgroundColor: '#00D9FF' },
                ]}
              />
            </View>
          </View>

          {/* Earnings Goal */}
          <View style={styles.goalItem}>
            <View style={styles.goalHeader}>
              <View style={styles.goalIconContainer}>
                <Ionicons name="cash-outline" size={24} color="#4CAF50" />
              </View>
              <View style={styles.goalInfo}>
                <Text style={styles.goalLabel}>{t('earningsTarget')}</Text>
                <Text style={styles.goalValue}>
                  {formatCurrency(todayEarnings, store.currency)} / {formatCurrency(store.dailyGoals.earningsTarget, store.currency)}
                </Text>
              </View>
              <Text style={styles.goalPercent}>{Math.round(earningsProgress)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${earningsProgress}%`, backgroundColor: '#4CAF50' },
                ]}
              />
            </View>
          </View>

          {/* Hours Goal */}
          <View style={styles.goalItem}>
            <View style={styles.goalHeader}>
              <View style={styles.goalIconContainer}>
                <Ionicons name="time-outline" size={24} color="#9C27B0" />
              </View>
              <View style={styles.goalInfo}>
                <Text style={styles.goalLabel}>{t('hoursTarget')}</Text>
                <Text style={styles.goalValue}>
                  {todayHours.toFixed(1)}h / {store.dailyGoals.hoursTarget}h
                </Text>
              </View>
              <Text style={styles.goalPercent}>{Math.round(hoursProgress)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${hoursProgress}%`, backgroundColor: '#9C27B0' },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Achievements Section */}
        <Text style={styles.sectionTitle}>{t('achievements')}</Text>
        <View style={styles.achievementsGrid}>
          {store.achievements.map(achievement => {
            const progress = getAchievementProgress(achievement);
            const isUnlocked = !!achievement.unlockedAt;

            return (
              <View
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  isUnlocked && styles.achievementUnlocked,
                ]}
              >
                <View
                  style={[
                    styles.achievementIcon,
                    isUnlocked && styles.achievementIconUnlocked,
                  ]}
                >
                  <Ionicons
                    name={getAchievementIcon(achievement.type)}
                    size={28}
                    color={isUnlocked ? '#FFD700' : '#8892B0'}
                  />
                </View>
                <Text
                  style={[
                    styles.achievementName,
                    isUnlocked && styles.achievementNameUnlocked,
                  ]}
                >
                  {t(achievement.name as any)}
                </Text>
                <Text style={styles.achievementDesc}>{achievement.description}</Text>
                {!isUnlocked && (
                  <View style={styles.achievementProgressBar}>
                    <View
                      style={[
                        styles.achievementProgressFill,
                        { width: `${progress}%` },
                      ]}
                    />
                  </View>
                )}
                <Text style={styles.achievementStatus}>
                  {isUnlocked ? t('unlocked') : `${Math.round(progress)}%`}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Goals Modal */}
      <Modal
        visible={showGoalsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGoalsModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('setGoals')}</Text>

            <Text style={styles.inputLabel}>{t('deliveryTarget')}</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={String(tempGoals.deliveryTarget)}
              onChangeText={text =>
                setTempGoals({ ...tempGoals, deliveryTarget: parseInt(text) || 0 })
              }
            />

            <Text style={styles.inputLabel}>{t('earningsTarget')} ({store.currency})</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              value={String(tempGoals.earningsTarget)}
              onChangeText={text =>
                setTempGoals({ ...tempGoals, earningsTarget: parseFloat(text) || 0 })
              }
            />

            <Text style={styles.inputLabel}>{t('hoursTarget')}</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              value={String(tempGoals.hoursTarget)}
              onChangeText={text =>
                setTempGoals({ ...tempGoals, hoursTarget: parseFloat(text) || 0 })
              }
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowGoalsModal(false)}
              >
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleSaveGoals}
              >
                <Text style={styles.confirmButtonText}>{t('confirm')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D1A',
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  editButton: {
    padding: 8,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
  },
  goalsCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  goalItem: {
    marginBottom: 20,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0D0D1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalInfo: {
    flex: 1,
    marginLeft: 12,
  },
  goalLabel: {
    color: '#8892B0',
    fontSize: 12,
  },
  goalValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  goalPercent: {
    color: '#FF6B35',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#0D0D1A',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: '48%',
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementUnlocked: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0D0D1A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  achievementIconUnlocked: {
    backgroundColor: '#3D3D00',
  },
  achievementName: {
    color: '#8892B0',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementNameUnlocked: {
    color: '#FFD700',
  },
  achievementDesc: {
    color: '#8892B0',
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 8,
  },
  achievementProgressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#0D0D1A',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  achievementProgressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 2,
  },
  achievementStatus: {
    color: '#8892B0',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputLabel: {
    color: '#8892B0',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0D0D1A',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8892B0',
  },
  cancelButtonText: {
    color: '#8892B0',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    marginLeft: 8,
    borderRadius: 12,
    backgroundColor: '#FF6B35',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
