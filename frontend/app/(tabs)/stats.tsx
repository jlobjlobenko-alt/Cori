import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from 'react-native-gifted-charts';
import { useAppStore } from '../../src/store/appStore';
import { getTranslation } from '../../src/i18n/translations';
import { StatCard } from '../../src/components/StatCard';
import {
  formatCurrency,
  getTotalHours,
  getTotalDeliveries,
  getTotalEarnings,
  getWeeklyEarnings,
  getMonthlyEarnings,
  getProductivityScore,
  getConsistencyPercentage,
  getProfitableHours,
  getCalendarData,
} from '../../src/utils/helpers';

const { width } = Dimensions.get('window');

export default function StatsScreen() {
  const store = useAppStore();
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const t = (key: any) => getTranslation(store.language, key);

  const totalDaysWorked = new Set(store.shifts.map(s => s.date)).size;
  const totalDeliveries = getTotalDeliveries(store.shifts);
  const totalEarnings = getTotalEarnings(store.shifts);
  const totalHours = getTotalHours(store.shifts);
  const weeklyEarnings = getWeeklyEarnings(store.shifts);
  const monthlyEarnings = getMonthlyEarnings(store.shifts);
  const productivityScore = getProductivityScore(store.shifts, store.currentStreak);
  const consistency = getConsistencyPercentage(store.shifts);
  const profitableHours = getProfitableHours(store.shifts);
  const calendarData = getCalendarData(store.shifts, store.streakHistory);

  // Calculate skipped days
  const skippedDays = store.streakHistory.filter(h => !h.worked).length;

  // Prepare bar chart data for profitable hours
  const chartData = profitableHours.slice(0, 8).map(item => ({
    value: item.earnings,
    label: `${item.hour}:00`,
    frontColor: item.earnings > 15 ? '#FF6B35' : '#00D9FF',
  }));

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push({ day: null, status: null });
    }

    // Add days of the month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const status = calendarData[dateStr] || null;
      days.push({ day: d, status, dateStr });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'worked':
        return '#4CAF50';
      case 'skipped':
        return '#FF4444';
      case 'partial':
        return '#FFD700';
      default:
        return '#1A1A2E';
    }
  };

  const changeMonth = (delta: number) => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + delta);
    setSelectedMonth(newMonth);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('statistics')}</Text>

        {/* Main Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard
              icon="calendar-outline"
              label={t('totalDaysWorked')}
              value={totalDaysWorked}
              color="#4CAF50"
              small
            />
            <View style={{ width: 8 }} />
            <StatCard
              icon="close-circle-outline"
              label={t('skippedDays')}
              value={skippedDays}
              color="#FF4444"
              small
            />
          </View>

          <View style={styles.statsRow}>
            <StatCard
              icon="flame"
              label={t('currentStreak')}
              value={`${store.currentStreak} ${t('days')}`}
              color="#FF6B35"
              small
            />
            <View style={{ width: 8 }} />
            <StatCard
              icon="trophy"
              label={t('longestStreak')}
              value={`${store.longestStreak} ${t('days')}`}
              color="#FFD700"
              small
            />
          </View>

          <View style={styles.statsRow}>
            <StatCard
              icon="bicycle"
              label={t('totalDeliveries')}
              value={totalDeliveries}
              color="#00D9FF"
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

          <View style={styles.statsRow}>
            <StatCard
              icon="time-outline"
              label={t('totalHours')}
              value={`${totalHours.toFixed(1)}h`}
              color="#9C27B0"
              small
            />
            <View style={{ width: 8 }} />
            <StatCard
              icon="trending-up"
              label={t('weeklyIncome')}
              value={formatCurrency(weeklyEarnings, store.currency)}
              color="#4CAF50"
              small
            />
          </View>

          <View style={styles.statsRow}>
            <StatCard
              icon="calendar"
              label={t('monthlyIncome')}
              value={formatCurrency(monthlyEarnings, store.currency)}
              color="#FF6B35"
              small
            />
            <View style={{ width: 8 }} />
            <StatCard
              icon="speedometer"
              label={t('productivityScore')}
              value={`${productivityScore}%`}
              color="#00D9FF"
              small
            />
          </View>

          <View style={styles.consistencyCard}>
            <Text style={styles.consistencyLabel}>{t('consistency')}</Text>
            <View style={styles.consistencyBar}>
              <View
                style={[
                  styles.consistencyFill,
                  { width: `${consistency}%` },
                ]}
              />
            </View>
            <Text style={styles.consistencyValue}>{consistency}%</Text>
          </View>
        </View>

        {/* Calendar */}
        <Text style={styles.sectionTitle}>{t('calendar')}</Text>
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={() => changeMonth(-1)}>
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.calendarMonth}>
              {selectedMonth.toLocaleDateString(store.language, {
                month: 'long',
                year: 'numeric',
              })}
            </Text>
            <TouchableOpacity onPress={() => changeMonth(1)}>
              <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.weekDaysRow}>
            {weekDays.map((day, i) => (
              <Text key={i} style={styles.weekDay}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {calendarDays.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.calendarDay,
                  { backgroundColor: getStatusColor(item.status) },
                ]}
              >
                {item.day && (
                  <Text
                    style={[
                      styles.calendarDayText,
                      item.status && styles.calendarDayTextActive,
                    ]}
                  >
                    {item.day}
                  </Text>
                )}
              </View>
            ))}
          </View>

          <View style={styles.calendarLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.legendText}>Worked</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FF4444' }]} />
              <Text style={styles.legendText}>Skipped</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FFD700' }]} />
              <Text style={styles.legendText}>Partial</Text>
            </View>
          </View>
        </View>

        {/* Profitable Hours Chart */}
        {chartData.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{t('profitableHours')}</Text>
            <View style={styles.chartCard}>
              <BarChart
                data={chartData}
                width={width - 80}
                height={200}
                barWidth={28}
                spacing={12}
                roundedTop
                roundedBottom
                hideRules
                xAxisThickness={0}
                yAxisThickness={0}
                yAxisTextStyle={{ color: '#8892B0', fontSize: 10 }}
                xAxisLabelTextStyle={{ color: '#8892B0', fontSize: 10 }}
                noOfSections={4}
                maxValue={Math.max(...chartData.map(d => d.value)) * 1.2}
                isAnimated
              />
              {profitableHours.length > 0 && (
                <View style={styles.bestHoursInfo}>
                  <Ionicons name="star" size={20} color="#FFD700" />
                  <Text style={styles.bestHoursText}>
                    Best: {profitableHours[0].hour}:00 - {profitableHours[0].hour + 1}:00
                    ({formatCurrency(profitableHours[0].earnings, store.currency)}/hr)
                  </Text>
                </View>
              )}
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D1A',
    padding: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  statsGrid: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  consistencyCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 16,
  },
  consistencyLabel: {
    color: '#8892B0',
    fontSize: 12,
    marginBottom: 8,
  },
  consistencyBar: {
    height: 8,
    backgroundColor: '#0D0D1A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  consistencyFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 4,
  },
  consistencyValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'right',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  calendarCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarMonth: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    color: '#8892B0',
    fontSize: 12,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  calendarDayText: {
    color: '#8892B0',
    fontSize: 14,
  },
  calendarDayTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  calendarLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    color: '#8892B0',
    fontSize: 12,
  },
  chartCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  bestHoursInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: '#0D0D1A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bestHoursText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 14,
  },
});
