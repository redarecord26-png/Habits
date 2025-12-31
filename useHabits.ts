import { useState, useEffect } from 'react';
import { Habit, AppState } from '@/types/habit';

const STORAGE_KEY = 'habit-tracker-data';

const generateId = () => Math.random().toString(36).substring(2, 15);

const getInitialState = (): AppState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Ensure uniqueId exists (migrate old data)
      if (!parsed.uniqueId) {
        parsed.uniqueId = generateId() + generateId();
      }
      if (!parsed.username) {
        parsed.username = '';
      }
      if (!parsed.claimedChallenges) {
        parsed.claimedChallenges = [];
      }
      return parsed;
    } catch {
      return createNewState();
    }
  }
  return createNewState();
};

const createNewState = (): AppState => ({
  habits: [],
  uniqueId: generateId() + generateId(), // Permanent ID generated at start
  username: '',
  hasCompletedOnboarding: false,
  claimedChallenges: [],
});

export const useHabits = () => {
  const [state, setState] = useState<AppState>(getInitialState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addHabit = (name: string, icon: string) => {
    const newHabit: Habit = {
      id: generateId(),
      name,
      icon,
      createdAt: new Date().toISOString(),
      completedDates: [],
    };
    setState(prev => ({ ...prev, habits: [...prev.habits, newHabit] }));
  };

  const toggleHabitForDate = (habitId: string, date: string) => {
    setState(prev => ({
      ...prev,
      habits: prev.habits.map(habit => {
        if (habit.id !== habitId) return habit;
        const isCompleted = habit.completedDates.includes(date);
        return {
          ...habit,
          completedDates: isCompleted
            ? habit.completedDates.filter(d => d !== date)
            : [...habit.completedDates, date],
        };
      }),
    }));
  };

  const deleteHabit = (habitId: string) => {
    setState(prev => ({
      ...prev,
      habits: prev.habits.filter(h => h.id !== habitId),
    }));
  };

  const completeOnboarding = () => {
    setState(prev => ({ ...prev, hasCompletedOnboarding: true }));
  };

  const setUsername = (username: string) => {
    setState(prev => ({ ...prev, username }));
  };

  const claimChallenge = (challengeId: string) => {
    setState(prev => ({
      ...prev,
      claimedChallenges: [...prev.claimedChallenges, challengeId],
    }));
  };

  const calculateStreak = (): number => {
    if (state.habits.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let streak = 0;
    let currentDate = new Date(today);

    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const allCompleted = state.habits.every(habit =>
        habit.completedDates.includes(dateStr)
      );

      if (!allCompleted) {
        if (currentDate.getTime() === today.getTime()) {
          currentDate.setDate(currentDate.getDate() - 1);
          continue;
        }
        break;
      }

      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  };

  const getMonthlyProgress = (habitId: string): number => {
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return 0;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();

    const completedThisMonth = habit.completedDates.filter(date => {
      const d = new Date(date);
      return d.getFullYear() === year && d.getMonth() === month;
    }).length;

    return Math.round((completedThisMonth / today) * 100);
  };

  const getWeekNumber = (date: Date): { week: number; year: number } => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return { week, year: d.getUTCFullYear() };
  };

  const getWeeklyCompletions = (weekOffset: number = 0): number => {
    if (state.habits.length === 0) return 0;

    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() - (weekOffset * 7));
    
    const { week, year } = getWeekNumber(targetDate);
    
    let completedDays = 0;
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - (weekOffset * 7) - today.getDay() + i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const allCompleted = state.habits.every(habit =>
        habit.completedDates.includes(dateStr)
      );
      if (allCompleted) completedDays++;
    }
    
    return completedDays;
  };

  return {
    habits: state.habits,
    uniqueId: state.uniqueId,
    username: state.username,
    hasCompletedOnboarding: state.hasCompletedOnboarding,
    claimedChallenges: state.claimedChallenges,
    addHabit,
    toggleHabitForDate,
    deleteHabit,
    completeOnboarding,
    setUsername,
    claimChallenge,
    calculateStreak,
    getMonthlyProgress,
    getWeekNumber,
    getWeeklyCompletions,
  };
};
