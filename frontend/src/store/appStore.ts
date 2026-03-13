import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language } from '../i18n/translations';

export interface Shift {
  id: string;
  startTime: string;
  endTime?: string;
  deliveries: number;
  earnings: number;
  date: string;
}

export interface Achievement {
  id: string;
  type: string;
  name: string;
  description: string;
  unlockedAt?: string;
  icon: string;
  requirement: number;
}

export interface DailyGoal {
  deliveryTarget: number;
  earningsTarget: number;
  hoursTarget: number;
}

export interface AppState {
  // User Settings
  displayName: string;
  language: Language;
  currency: string;
  disciplineMode: boolean;
  notificationsEnabled: boolean;
  leaderboardId: string | null;
  
  // Shift Data
  currentShift: Shift | null;
  shifts: Shift[];
  
  // Streak Data
  currentStreak: number;
  longestStreak: number;
  lastWorkDate: string | null;
  streakHistory: { date: string; worked: boolean }[];
  
  // Goals
  dailyGoals: DailyGoal;
  
  // Achievements
  achievements: Achievement[];
  
  // Actions
  setLanguage: (lang: Language) => void;
  setCurrency: (currency: string) => void;
  setDisciplineMode: (enabled: boolean) => void;
  setDisplayName: (name: string) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  startShift: () => void;
  endShift: (deliveries: number, earnings: number) => void;
  setDailyGoals: (goals: DailyGoal) => void;
  checkStreakStatus: () => void;
  unlockAchievement: (achievementId: string) => void;
  loadState: () => Promise<void>;
  saveState: () => Promise<void>;
  setLeaderboardId: (id: string) => void;
}

const STORAGE_KEY = 'iron_courier_state';

const defaultAchievements: Achievement[] = [
  // Streak achievements
  { id: 'first_day', type: 'streak', name: 'firstWorkDay', description: 'Complete your first work day', icon: 'star', requirement: 1 },
  { id: 'streak_3', type: 'streak', name: 'streak3', description: '3 consecutive work days', icon: 'flame', requirement: 3 },
  { id: 'streak_7', type: 'streak', name: 'streak7', description: '7 consecutive work days', icon: 'flame', requirement: 7 },
  { id: 'streak_14', type: 'streak', name: 'streak14', description: '14 consecutive work days', icon: 'flame', requirement: 14 },
  { id: 'streak_30', type: 'streak', name: 'streak30', description: '30 consecutive work days', icon: 'trophy', requirement: 30 },
  { id: 'streak_50', type: 'streak', name: 'streak50', description: '50 days of discipline', icon: 'trophy', requirement: 50 },
  { id: 'streak_100', type: 'streak', name: 'streak100', description: '100 days iron discipline', icon: 'medal', requirement: 100 },
  // Delivery achievements
  { id: 'deliveries_100', type: 'delivery', name: 'deliveries100', description: 'Complete 100 deliveries', icon: 'bicycle', requirement: 100 },
  { id: 'deliveries_500', type: 'delivery', name: 'deliveries500', description: 'Complete 500 deliveries', icon: 'bicycle', requirement: 500 },
  { id: 'deliveries_1000', type: 'delivery', name: 'deliveries1000', description: 'Complete 1000 deliveries', icon: 'bicycle', requirement: 1000 },
  // Earnings achievements
  { id: 'earnings_100', type: 'earnings', name: 'earnings100', description: 'Earn your first $100', icon: 'cash', requirement: 100 },
  { id: 'earnings_1000', type: 'earnings', name: 'earnings1000', description: 'Earn $1000 total', icon: 'cash', requirement: 1000 },
  { id: 'earnings_5000', type: 'earnings', name: 'earnings5000', description: 'Earn $5000 total', icon: 'cash', requirement: 5000 },
];

const getToday = () => new Date().toISOString().split('T')[0];

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  displayName: 'Courier',
  language: 'en',
  currency: '$',
  disciplineMode: false,
  notificationsEnabled: true,
  leaderboardId: null,
  currentShift: null,
  shifts: [],
  currentStreak: 0,
  longestStreak: 0,
  lastWorkDate: null,
  streakHistory: [],
  dailyGoals: { deliveryTarget: 20, earningsTarget: 100, hoursTarget: 8 },
  achievements: defaultAchievements,

  setLanguage: (lang) => {
    set({ language: lang });
    get().saveState();
  },

  setCurrency: (currency) => {
    set({ currency });
    get().saveState();
  },

  setDisciplineMode: (enabled) => {
    set({ disciplineMode: enabled });
    get().saveState();
  },

  setDisplayName: (name) => {
    set({ displayName: name });
    get().saveState();
  },

  setNotificationsEnabled: (enabled) => {
    set({ notificationsEnabled: enabled });
    get().saveState();
  },

  setLeaderboardId: (id) => {
    set({ leaderboardId: id });
    get().saveState();
  },

  startShift: () => {
    const shift: Shift = {
      id: Date.now().toString(),
      startTime: new Date().toISOString(),
      deliveries: 0,
      earnings: 0,
      date: getToday(),
    };
    set({ currentShift: shift });
    get().saveState();
  },

  endShift: (deliveries, earnings) => {
    const state = get();
    if (!state.currentShift) return;

    const endedShift: Shift = {
      ...state.currentShift,
      endTime: new Date().toISOString(),
      deliveries,
      earnings,
    };

    const today = getToday();
    const isNewWorkDay = state.lastWorkDate !== today;
    
    let newStreak = state.currentStreak;
    let newLongestStreak = state.longestStreak;
    let streakHistory = [...state.streakHistory];
    
    if (isNewWorkDay) {
      // Check if yesterday was worked (for streak continuation)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (state.lastWorkDate === yesterdayStr || state.lastWorkDate === null) {
        newStreak = state.currentStreak + 1;
      } else if (state.disciplineMode) {
        // Streak broken in discipline mode
        newStreak = 1;
      } else {
        newStreak = state.currentStreak + 1;
      }
      
      newLongestStreak = Math.max(newStreak, state.longestStreak);
      
      // Update streak history
      const existingIndex = streakHistory.findIndex(h => h.date === today);
      if (existingIndex >= 0) {
        streakHistory[existingIndex].worked = true;
      } else {
        streakHistory.push({ date: today, worked: true });
      }
    }

    // Check and unlock achievements
    const achievements = [...state.achievements];
    const totalDeliveries = state.shifts.reduce((sum, s) => sum + s.deliveries, 0) + deliveries;
    const totalEarnings = state.shifts.reduce((sum, s) => sum + s.earnings, 0) + earnings;

    achievements.forEach((ach, index) => {
      if (ach.unlockedAt) return;
      
      let shouldUnlock = false;
      if (ach.type === 'streak' && newStreak >= ach.requirement) shouldUnlock = true;
      if (ach.type === 'delivery' && totalDeliveries >= ach.requirement) shouldUnlock = true;
      if (ach.type === 'earnings' && totalEarnings >= ach.requirement) shouldUnlock = true;
      
      if (shouldUnlock) {
        achievements[index] = { ...ach, unlockedAt: new Date().toISOString() };
      }
    });

    set({
      currentShift: null,
      shifts: [...state.shifts, endedShift],
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      lastWorkDate: today,
      streakHistory,
      achievements,
    });
    
    get().saveState();
  },

  setDailyGoals: (goals) => {
    set({ dailyGoals: goals });
    get().saveState();
  },

  checkStreakStatus: () => {
    const state = get();
    if (!state.disciplineMode || !state.lastWorkDate) return;
    
    const today = getToday();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // If last work date is before yesterday, streak is broken
    if (state.lastWorkDate < yesterdayStr && state.currentStreak > 0) {
      set({
        currentStreak: 0,
        streakHistory: [...state.streakHistory, { date: yesterdayStr, worked: false }],
      });
      get().saveState();
    }
  },

  unlockAchievement: (achievementId) => {
    const state = get();
    const achievements = state.achievements.map(ach => 
      ach.id === achievementId && !ach.unlockedAt
        ? { ...ach, unlockedAt: new Date().toISOString() }
        : ach
    );
    set({ achievements });
    get().saveState();
  },

  loadState: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set({
          displayName: parsed.displayName || 'Courier',
          language: parsed.language || 'en',
          currency: parsed.currency || '$',
          disciplineMode: parsed.disciplineMode || false,
          notificationsEnabled: parsed.notificationsEnabled ?? true,
          leaderboardId: parsed.leaderboardId || null,
          currentShift: parsed.currentShift || null,
          shifts: parsed.shifts || [],
          currentStreak: parsed.currentStreak || 0,
          longestStreak: parsed.longestStreak || 0,
          lastWorkDate: parsed.lastWorkDate || null,
          streakHistory: parsed.streakHistory || [],
          dailyGoals: parsed.dailyGoals || { deliveryTarget: 20, earningsTarget: 100, hoursTarget: 8 },
          achievements: parsed.achievements || defaultAchievements,
        });
      }
    } catch (error) {
      console.error('Failed to load state:', error);
    }
  },

  saveState: async () => {
    try {
      const state = get();
      const toSave = {
        displayName: state.displayName,
        language: state.language,
        currency: state.currency,
        disciplineMode: state.disciplineMode,
        notificationsEnabled: state.notificationsEnabled,
        leaderboardId: state.leaderboardId,
        currentShift: state.currentShift,
        shifts: state.shifts,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        lastWorkDate: state.lastWorkDate,
        streakHistory: state.streakHistory,
        dailyGoals: state.dailyGoals,
        achievements: state.achievements,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  },
}));
