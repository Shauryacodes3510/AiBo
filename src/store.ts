import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

interface UserState {
  user: User | null;
  xp: number;
  coins: number;
  streak: number;
  lastActivityDate: string | null;
  level: number;
  energy: number;
  gradeLevel: number;
  completedLessons: string[];
  onboarded: boolean;
  isAdmin: boolean;
  setUser: (user: User | null) => void;
  setAdmin: (val: boolean) => void;
  addXp: (amount: number) => void;
  addCoins: (amount: number) => void;
  useEnergy: (amount: number) => void;
  completeLesson: (lessonId: string) => void;
  setOnboarded: (val: boolean) => void;
  setGradeLevel: (level: number) => void;
  reset: () => void;
}

export const useStore = create<UserState>((set) => ({
  user: null,
  xp: 0,
  coins: 0,
  streak: 0,
  lastActivityDate: null,
  level: 1,
  energy: 25,
  gradeLevel: 6, // Default grade level
  completedLessons: [],
  onboarded: false,
  isAdmin: false,
  setUser: (user) => set({ user }),
  setAdmin: (val) => set({ isAdmin: val }),
  addXp: (amount) => set((state) => {
    const newXp = state.xp + amount;
    const newLevel = Math.floor(newXp / 100) + 1;
    return { xp: newXp, level: newLevel };
  }),
  addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
  useEnergy: (amount) => set((state) => ({ energy: Math.max(0, state.energy - amount) })),
  completeLesson: (lessonId) => set((state) => {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = state.lastActivityDate;
    let newStreak = state.streak;

    if (!lastDate) {
      newStreak = 1;
    } else {
      const last = new Date(lastDate);
      const current = new Date(today);
      const diffTime = Math.abs(current.getTime() - last.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    }

    return {
      completedLessons: [...state.completedLessons, lessonId],
      streak: newStreak,
      lastActivityDate: today
    };
  }),
  setOnboarded: (val) => set({ onboarded: val }),
  setGradeLevel: (level) => set({ gradeLevel: level }),
  reset: () => set({
    user: null,
    xp: 0,
    coins: 0,
    streak: 0,
    lastActivityDate: null,
    level: 1,
    energy: 25,
    gradeLevel: 6,
    completedLessons: [],
    onboarded: false,
  }),
}));
