import { Shift } from '../store/appStore';

export const formatDuration = (startTime: string, endTime?: string): string => {
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : new Date();
  const diff = end.getTime() - start.getTime();
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
};

export const formatCurrency = (amount: number, currency: string): string => {
  return `${currency}${amount.toFixed(2)}`;
};

export const getTotalHours = (shifts: Shift[]): number => {
  return shifts.reduce((total, shift) => {
    if (!shift.endTime) return total;
    const start = new Date(shift.startTime);
    const end = new Date(shift.endTime);
    return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }, 0);
};

export const getTotalDeliveries = (shifts: Shift[]): number => {
  return shifts.reduce((sum, shift) => sum + shift.deliveries, 0);
};

export const getTotalEarnings = (shifts: Shift[]): number => {
  return shifts.reduce((sum, shift) => sum + shift.earnings, 0);
};

export const getAverageDailyEarnings = (shifts: Shift[]): number => {
  if (shifts.length === 0) return 0;
  const uniqueDays = new Set(shifts.map(s => s.date));
  const total = getTotalEarnings(shifts);
  return total / uniqueDays.size;
};

export const getWeeklyEarnings = (shifts: Shift[]): number => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  return shifts
    .filter(shift => new Date(shift.date) >= oneWeekAgo)
    .reduce((sum, shift) => sum + shift.earnings, 0);
};

export const getMonthlyEarnings = (shifts: Shift[]): number => {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
  return shifts
    .filter(shift => new Date(shift.date) >= oneMonthAgo)
    .reduce((sum, shift) => sum + shift.earnings, 0);
};

export const getProductivityScore = (shifts: Shift[], currentStreak: number): number => {
  if (shifts.length === 0) return 0;
  
  const avgEarnings = getAverageDailyEarnings(shifts);
  const avgDeliveries = getTotalDeliveries(shifts) / shifts.length;
  const streakBonus = Math.min(currentStreak * 2, 30);
  
  // Score based on earnings (max 40), deliveries (max 30), streak (max 30)
  const earningsScore = Math.min((avgEarnings / 150) * 40, 40);
  const deliveriesScore = Math.min((avgDeliveries / 25) * 30, 30);
  
  return Math.round(earningsScore + deliveriesScore + streakBonus);
};

export const getConsistencyPercentage = (shifts: Shift[]): number => {
  if (shifts.length === 0) return 0;
  
  const uniqueDays = new Set(shifts.map(s => s.date));
  const firstShiftDate = new Date(Math.min(...shifts.map(s => new Date(s.date).getTime())));
  const today = new Date();
  
  const totalPossibleDays = Math.ceil((today.getTime() - firstShiftDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  return Math.round((uniqueDays.size / totalPossibleDays) * 100);
};

export const getProfitableHours = (shifts: Shift[]): { hour: number; earnings: number }[] => {
  const hourlyEarnings: { [key: number]: { total: number; count: number } } = {};
  
  shifts.forEach(shift => {
    if (!shift.endTime) return;
    const startHour = new Date(shift.startTime).getHours();
    const endHour = new Date(shift.endTime).getHours();
    const hoursWorked = Math.max(1, endHour - startHour);
    const earningsPerHour = shift.earnings / hoursWorked;
    
    for (let h = startHour; h < endHour; h++) {
      if (!hourlyEarnings[h]) hourlyEarnings[h] = { total: 0, count: 0 };
      hourlyEarnings[h].total += earningsPerHour;
      hourlyEarnings[h].count += 1;
    }
  });
  
  return Object.entries(hourlyEarnings)
    .map(([hour, data]) => ({
      hour: parseInt(hour),
      earnings: data.total / data.count,
    }))
    .sort((a, b) => b.earnings - a.earnings);
};

export const getMonthlyRank = (totalDeliveries: number, longestStreak: number): string => {
  const score = totalDeliveries + (longestStreak * 10);
  if (score >= 1000) return 'ironCourier';
  if (score >= 500) return 'goldCourier';
  if (score >= 200) return 'silverCourier';
  return 'bronzeCourier';
};

export const getCalendarData = (shifts: Shift[], streakHistory: { date: string; worked: boolean }[]): { [key: string]: 'worked' | 'skipped' | 'partial' } => {
  const calendar: { [key: string]: 'worked' | 'skipped' | 'partial' } = {};
  
  // Mark worked days
  shifts.forEach(shift => {
    const existing = calendar[shift.date];
    if (!existing) {
      calendar[shift.date] = 'worked';
    }
  });
  
  // Mark skipped days from streak history
  streakHistory.forEach(entry => {
    if (!entry.worked && !calendar[entry.date]) {
      calendar[entry.date] = 'skipped';
    }
  });
  
  return calendar;
};
