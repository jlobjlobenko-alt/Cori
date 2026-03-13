import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../src/store/appStore';
import { getTranslation } from '../../src/i18n/translations';
import { StreakBadge } from '../../src/components/StreakBadge';
import { StatCard } from '../../src/components/StatCard';
import {
  formatDuration,
  formatCurrency,
  getTotalDeliveries,
  getTotalEarnings,
  getAverageDailyEarnings,
  getMonthlyRank,
} from '../../src/utils/helpers';

export default function HomeScreen() {
  const store = useAppStore();
  const [showEndShiftModal, setShowEndShiftModal] = useState(false);
  const [deliveries, setDeliveries] = useState('');
  const [earnings, setEarnings] = useState('');
  const [duration, setDuration] = useState('0h 0m');

  const t = (key: any) => getTranslation(store.language, key);

  useEffect(() => {
    store.loadState();
  }, []);

  useEffect(() => {
    store.checkStreakStatus();
  }, [store.disciplineMode]);

  // Update duration every minute when shift is active
  useEffect(() => {
    if (store.currentShift) {
      const updateDuration = () => {
        setDuration(formatDuration(store.currentShift!.startTime));
      };
      updateDuration();
      const interval = setInterval(updateDuration, 60000);
      return () => clearInterval(interval);
    }
  }, [store.currentShift]);

  const handleStartShift = () => {
    store.startShift();
  };

  const handleEndShiftPress = () => {
    setShowEndShiftModal(true);
  };

  const handleConfirmEndShift = () => {
    const deliveriesNum = parseInt(deliveries) || 0;
    const earningsNum = parseFloat(earnings) || 0;
    
    store.endShift(deliveriesNum, earningsNum);
    setShowEndShiftModal(false);
    setDeliveries('');
    setEarnings('');
  };

  const todayShifts = store.shifts.filter(
    s => s.date === new Date().toISOString().split('T')[0]
  );
  const todayEarnings = todayShifts.reduce((sum, s) => sum + s.earnings, 0);
  const todayDeliveries = todayShifts.reduce((sum, s) => sum + s.deliveries, 0);

  const totalDeliveries = getTotalDeliveries(store.shifts);
  const totalEarnings = getTotalEarnings(store.shifts);
  const monthlyRank = getMonthlyRank(totalDeliveries, store.longestStreak);
  const avgDailyEarnings = getAverageDailyEarnings(store.shifts);

  // Check if user skipped today (for lost earnings feature)
  const today = new Date().toISOString().split('T')[0];
  const workedToday = store.lastWorkDate === today || store.currentShift !== null;
  const showLostEarnings = !workedToday && store.shifts.length > 0 && store.disciplineMode;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>{t('welcome')}</Text>
            <Text style={styles.displayName}>{store.displayName}</Text>
          </View>
          <View style={styles.rankBadge}>
            <Ionicons name="shield" size={24} color="#FF6B35" />
            <Text style={styles.rankText}>{t(monthlyRank)}</Text>
          </View>
        </View>

        {/* Streak Lost Warning */}
        {store.disciplineMode && store.currentStreak === 0 && store.longestStreak > 0 && (
          <View style={styles.warningCard}>
            <Ionicons name="warning" size={24} color="#FF4444" />
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>{t('streakLost')}</Text>
              <Text style={styles.warningText}>{t('streakLostMsg')}</Text>
            </View>
          </View>
        )}

        {/* Lost Earnings */}
        {showLostEarnings && (
          <View style={styles.lostEarningsCard}>
            <Ionicons name="trending-down" size={24} color="#FF4444" />
            <View style={styles.lostEarningsContent}>
              <Text style={styles.lostEarningsLabel}>{t('lostEarnings')}</Text>
              <Text style={styles.lostEarningsValue}>
                {formatCurrency(avgDailyEarnings, store.currency)}
              </Text>
            </View>
          </View>
        )}

        {/* Shift Control */}
        <View style={styles.shiftCard}>
          {store.currentShift ? (
            <>
              <View style={styles.shiftActive}>
                <View style={styles.pulseIndicator} />
                <Text style={styles.shiftActiveText}>{t('shiftActive')}</Text>
              </View>
              <Text style={styles.shiftDuration}>{duration}</Text>
              <Text style={styles.shiftLabel}>{t('shiftDuration')}</Text>
              <TouchableOpacity
                style={styles.endShiftButton}
                onPress={handleEndShiftPress}
              >
                <Ionicons name="stop-circle" size={24} color="#FFFFFF" />
                <Text style={styles.buttonText}>{t('endShift')}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.startShiftButton}
              onPress={handleStartShift}
            >
              <Ionicons name="play-circle" size={32} color="#FFFFFF" />
              <Text style={styles.startButtonText}>{t('startShift')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Streak Badges */}
        <View style={styles.streakContainer}>
          <StreakBadge
            streak={store.currentStreak}
            label={t('currentStreak')}
          />
          <StreakBadge
            streak={store.longestStreak}
            label={t('longestStreak')}
            isLongest
          />
        </View>

        {/* Today's Stats */}
        <Text style={styles.sectionTitle}>{t('todayEarnings')}</Text>
        <View style={styles.statsRow}>
          <StatCard
            icon="cash-outline"
            label={t('earnings')}
            value={formatCurrency(todayEarnings, store.currency)}
            color="#4CAF50"
          />
          <View style={{ width: 12 }} />
          <StatCard
            icon="bicycle"
            label={t('deliveries')}
            value={todayDeliveries}
            color="#00D9FF"
          />
        </View>

        {/* Total Stats */}
        <Text style={styles.sectionTitle}>{t('totalDeliveries')}</Text>
        <View style={styles.statsRow}>
          <StatCard
            icon="cube-outline"
            label={t('totalDeliveries')}
            value={totalDeliveries}
            color="#FF6B35"
            small
          />
          <View style={{ width: 8 }} />
          <StatCard
            icon="wallet-outline"
            label={t('totalEarnings')}
            value={formatCurrency(totalEarnings, store.currency)}
            color="#4CAF50"
            small
          />
        </View>
      </ScrollView>

      {/* End Shift Modal */}
      <Modal
        visible={showEndShiftModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEndShiftModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('endShiftTitle')}</Text>
            
            <Text style={styles.inputLabel}>{t('deliveries')}</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor="#8892B0"
              value={deliveries}
              onChangeText={setDeliveries}
            />
            
            <Text style={styles.inputLabel}>{t('earnings')} ({store.currency})</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#8892B0"
              value={earnings}
              onChangeText={setEarnings}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowEndShiftModal(false)}
              >
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmEndShift}
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
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    color: '#8892B0',
    fontSize: 14,
  },
  displayName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  rankText: {
    color: '#FF6B35',
    marginLeft: 6,
    fontWeight: '600',
    fontSize: 12,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A1A1A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  warningContent: {
    marginLeft: 12,
    flex: 1,
  },
  warningTitle: {
    color: '#FF4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
  warningText: {
    color: '#8892B0',
    fontSize: 12,
    marginTop: 4,
  },
  lostEarningsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A1A1A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  lostEarningsContent: {
    marginLeft: 12,
  },
  lostEarningsLabel: {
    color: '#8892B0',
    fontSize: 12,
  },
  lostEarningsValue: {
    color: '#FF4444',
    fontSize: 24,
    fontWeight: 'bold',
  },
  shiftCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  shiftActive: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pulseIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  shiftActiveText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  shiftDuration: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: 'bold',
  },
  shiftLabel: {
    color: '#8892B0',
    fontSize: 14,
    marginBottom: 20,
  },
  startShiftButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 30,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  endShiftButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4444',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 25,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  streakContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 20,
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
