import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../src/store/appStore';
import { getTranslation, Language } from '../../src/i18n/translations';
import { getTotalDeliveries, getTotalEarnings, getWeeklyEarnings, formatCurrency } from '../../src/utils/helpers';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface LeaderboardEntry {
  id: string;
  display_name: string;
  longest_streak: number;
  total_deliveries: number;
  weekly_earnings: number;
  monthly_rank: string;
}

export default function MoreScreen() {
  const store = useAppStore();
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'settings'>('leaderboard');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [sortBy, setSortBy] = useState<'longest_streak' | 'total_deliveries' | 'weekly_earnings'>('longest_streak');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState(store.displayName);
  const [isLoading, setIsLoading] = useState(false);

  const t = (key: any) => getTranslation(store.language, key);

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'uk', name: 'Українська', flag: '🇺🇦' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  ];

  const currencies = [
    { symbol: '$', name: 'USD' },
    { symbol: '€', name: 'EUR' },
    { symbol: '£', name: 'GBP' },
    { symbol: '₴', name: 'UAH' },
    { symbol: '₽', name: 'RUB' },
    { symbol: '¥', name: 'JPY' },
  ];

  useEffect(() => {
    fetchLeaderboard();
  }, [sortBy]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/leaderboard?sort_by=${sortBy}&limit=50`);
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const syncToLeaderboard = async () => {
    try {
      const totalDeliveries = getTotalDeliveries(store.shifts);
      const weeklyEarnings = getWeeklyEarnings(store.shifts);

      if (store.leaderboardId) {
        // Update existing entry
        await fetch(`${BACKEND_URL}/api/leaderboard/${store.leaderboardId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            display_name: store.displayName,
            longest_streak: store.longestStreak,
            total_deliveries: totalDeliveries,
            weekly_earnings: weeklyEarnings,
          }),
        });
      } else {
        // Create new entry
        const response = await fetch(`${BACKEND_URL}/api/leaderboard`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            display_name: store.displayName,
            longest_streak: store.longestStreak,
            total_deliveries: totalDeliveries,
            weekly_earnings: weeklyEarnings,
          }),
        });
        const data = await response.json();
        store.setLeaderboardId(data.id);
      }
      fetchLeaderboard();
      Alert.alert('Success', 'Your stats have been synced to the leaderboard!');
    } catch (error) {
      console.error('Failed to sync to leaderboard:', error);
      Alert.alert('Error', 'Failed to sync to leaderboard');
    }
  };

  const handleSaveDisplayName = () => {
    if (displayNameInput.trim()) {
      store.setDisplayName(displayNameInput.trim());
    }
  };

  const getRankColor = (rank: string) => {
    if (rank.includes('Iron')) return '#FFD700';
    if (rank.includes('Gold')) return '#FFD700';
    if (rank.includes('Silver')) return '#C0C0C0';
    return '#CD7F32';
  };

  const renderLeaderboard = () => (
    <View style={styles.leaderboardContainer}>
      {/* Sort Tabs */}
      <View style={styles.sortTabs}>
        <TouchableOpacity
          style={[styles.sortTab, sortBy === 'longest_streak' && styles.sortTabActive]}
          onPress={() => setSortBy('longest_streak')}
        >
          <Text style={[styles.sortTabText, sortBy === 'longest_streak' && styles.sortTabTextActive]}>
            {t('byStreak')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortTab, sortBy === 'total_deliveries' && styles.sortTabActive]}
          onPress={() => setSortBy('total_deliveries')}
        >
          <Text style={[styles.sortTabText, sortBy === 'total_deliveries' && styles.sortTabTextActive]}>
            {t('byDeliveries')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortTab, sortBy === 'weekly_earnings' && styles.sortTabActive]}
          onPress={() => setSortBy('weekly_earnings')}
        >
          <Text style={[styles.sortTabText, sortBy === 'weekly_earnings' && styles.sortTabTextActive]}>
            {t('byEarnings')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sync Button */}
      <TouchableOpacity style={styles.syncButton} onPress={syncToLeaderboard}>
        <Ionicons name="cloud-upload" size={20} color="#FFFFFF" />
        <Text style={styles.syncButtonText}>Sync My Stats</Text>
      </TouchableOpacity>

      {/* Leaderboard List */}
      {leaderboard.map((entry, index) => (
        <View key={entry.id} style={styles.leaderboardItem}>
          <View style={styles.rankContainer}>
            <Text style={[
              styles.rankNumber,
              index < 3 && { color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32' }
            ]}>
              #{index + 1}
            </Text>
          </View>
          <View style={styles.entryInfo}>
            <Text style={styles.entryName}>{entry.display_name}</Text>
            <Text style={[styles.entryRank, { color: getRankColor(entry.monthly_rank) }]}>
              {entry.monthly_rank}
            </Text>
          </View>
          <View style={styles.entryStats}>
            {sortBy === 'longest_streak' && (
              <Text style={styles.entryValue}>{entry.longest_streak} 🔥</Text>
            )}
            {sortBy === 'total_deliveries' && (
              <Text style={styles.entryValue}>{entry.total_deliveries} 🚴</Text>
            )}
            {sortBy === 'weekly_earnings' && (
              <Text style={styles.entryValue}>{formatCurrency(entry.weekly_earnings, store.currency)}</Text>
            )}
          </View>
        </View>
      ))}

      {leaderboard.length === 0 && !isLoading && (
        <View style={styles.emptyState}>
          <Ionicons name="trophy-outline" size={48} color="#8892B0" />
          <Text style={styles.emptyText}>No entries yet. Be the first!</Text>
        </View>
      )}
    </View>
  );

  const renderSettings = () => (
    <View style={styles.settingsContainer}>
      {/* Display Name */}
      <View style={styles.settingItem}>
        <View style={styles.settingHeader}>
          <Ionicons name="person-outline" size={24} color="#FF6B35" />
          <Text style={styles.settingLabel}>{t('displayName')}</Text>
        </View>
        <View style={styles.nameInputContainer}>
          <TextInput
            style={styles.nameInput}
            value={displayNameInput}
            onChangeText={setDisplayNameInput}
            placeholder="Your name"
            placeholderTextColor="#8892B0"
            onBlur={handleSaveDisplayName}
          />
        </View>
      </View>

      {/* Language */}
      <TouchableOpacity style={styles.settingItem} onPress={() => setShowLanguageModal(true)}>
        <View style={styles.settingHeader}>
          <Ionicons name="language-outline" size={24} color="#FF6B35" />
          <Text style={styles.settingLabel}>{t('language')}</Text>
        </View>
        <View style={styles.settingValue}>
          <Text style={styles.settingValueText}>
            {languages.find(l => l.code === store.language)?.flag}{' '}
            {languages.find(l => l.code === store.language)?.name}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#8892B0" />
        </View>
      </TouchableOpacity>

      {/* Currency */}
      <TouchableOpacity style={styles.settingItem} onPress={() => setShowCurrencyModal(true)}>
        <View style={styles.settingHeader}>
          <Ionicons name="cash-outline" size={24} color="#FF6B35" />
          <Text style={styles.settingLabel}>{t('currency')}</Text>
        </View>
        <View style={styles.settingValue}>
          <Text style={styles.settingValueText}>
            {store.currency} ({currencies.find(c => c.symbol === store.currency)?.name})
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#8892B0" />
        </View>
      </TouchableOpacity>

      {/* Discipline Mode */}
      <View style={styles.settingItem}>
        <View style={styles.settingHeader}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#FF6B35" />
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingLabel}>{t('disciplineMode')}</Text>
            <Text style={styles.settingDesc}>{t('disciplineModeDesc')}</Text>
          </View>
        </View>
        <Switch
          value={store.disciplineMode}
          onValueChange={store.setDisciplineMode}
          trackColor={{ false: '#1A1A2E', true: '#FF6B35' }}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* Notifications */}
      <View style={styles.settingItem}>
        <View style={styles.settingHeader}>
          <Ionicons name="notifications-outline" size={24} color="#FF6B35" />
          <Text style={styles.settingLabel}>{t('notifications')}</Text>
        </View>
        <Switch
          value={store.notificationsEnabled}
          onValueChange={store.setNotificationsEnabled}
          trackColor={{ false: '#1A1A2E', true: '#FF6B35' }}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* About */}
      <View style={styles.aboutSection}>
        <Text style={styles.aboutTitle}>Iron Courier</Text>
        <Text style={styles.aboutVersion}>Version 1.0.0</Text>
        <Text style={styles.aboutDesc}>
          Discipline & Delivery Tracker for gig workers
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Header */}
      <View style={styles.tabHeader}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'leaderboard' && styles.tabActive]}
          onPress={() => setActiveTab('leaderboard')}
        >
          <Ionicons
            name="trophy"
            size={24}
            color={activeTab === 'leaderboard' ? '#FF6B35' : '#8892B0'}
          />
          <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.tabTextActive]}>
            {t('leaderboard')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && styles.tabActive]}
          onPress={() => setActiveTab('settings')}
        >
          <Ionicons
            name="settings"
            size={24}
            color={activeTab === 'settings' ? '#FF6B35' : '#8892B0'}
          />
          <Text style={[styles.tabText, activeTab === 'settings' && styles.tabTextActive]}>
            {t('settings')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {activeTab === 'leaderboard' ? renderLeaderboard() : renderSettings()}
      </ScrollView>

      {/* Language Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('language')}</Text>
            {languages.map(lang => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.modalOption,
                  store.language === lang.code && styles.modalOptionActive,
                ]}
                onPress={() => {
                  store.setLanguage(lang.code);
                  setShowLanguageModal(false);
                }}
              >
                <Text style={styles.modalOptionText}>
                  {lang.flag} {lang.name}
                </Text>
                {store.language === lang.code && (
                  <Ionicons name="checkmark" size={24} color="#FF6B35" />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={styles.modalCloseText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Currency Modal */}
      <Modal
        visible={showCurrencyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('currency')}</Text>
            {currencies.map(curr => (
              <TouchableOpacity
                key={curr.symbol}
                style={[
                  styles.modalOption,
                  store.currency === curr.symbol && styles.modalOptionActive,
                ]}
                onPress={() => {
                  store.setCurrency(curr.symbol);
                  setShowCurrencyModal(false);
                }}
              >
                <Text style={styles.modalOptionText}>
                  {curr.symbol} - {curr.name}
                </Text>
                {store.currency === curr.symbol && (
                  <Ionicons name="checkmark" size={24} color="#FF6B35" />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowCurrencyModal(false)}
            >
              <Text style={styles.modalCloseText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D1A',
  },
  tabHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A2E',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B35',
  },
  tabText: {
    color: '#8892B0',
    fontSize: 16,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FF6B35',
  },
  leaderboardContainer: {
    padding: 20,
  },
  sortTabs: {
    flexDirection: 'row',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  sortTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  sortTabActive: {
    backgroundColor: '#FF6B35',
  },
  sortTabText: {
    color: '#8892B0',
    fontSize: 12,
    fontWeight: '600',
  },
  sortTabTextActive: {
    color: '#FFFFFF',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  rankContainer: {
    width: 40,
  },
  rankNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  entryInfo: {
    flex: 1,
  },
  entryName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  entryRank: {
    fontSize: 12,
    marginTop: 2,
  },
  entryStats: {
    alignItems: 'flex-end',
  },
  entryValue: {
    color: '#FF6B35',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#8892B0',
    marginTop: 16,
    fontSize: 16,
  },
  settingsContainer: {
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A2E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 12,
  },
  settingTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  settingDesc: {
    color: '#8892B0',
    fontSize: 12,
    marginTop: 2,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValueText: {
    color: '#8892B0',
    fontSize: 14,
    marginRight: 8,
  },
  nameInputContainer: {
    flex: 1,
    marginLeft: 12,
  },
  nameInput: {
    backgroundColor: '#0D0D1A',
    borderRadius: 8,
    padding: 10,
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'right',
  },
  aboutSection: {
    alignItems: 'center',
    paddingVertical: 32,
    marginTop: 20,
  },
  aboutTitle: {
    color: '#FF6B35',
    fontSize: 24,
    fontWeight: 'bold',
  },
  aboutVersion: {
    color: '#8892B0',
    fontSize: 14,
    marginTop: 4,
  },
  aboutDesc: {
    color: '#8892B0',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
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
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#0D0D1A',
  },
  modalOptionActive: {
    backgroundColor: '#2A2A3E',
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  modalOptionText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  modalClose: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  modalCloseText: {
    color: '#8892B0',
    fontSize: 16,
  },
});
