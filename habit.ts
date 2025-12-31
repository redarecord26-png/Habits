export interface Habit {
  id: string;
  name: string;
  icon: string;
  createdAt: string;
  completedDates: string[];
}

export interface WeeklyChallenge {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  requiredDays: number;
  weekNumber: number;
  year: number;
  claimed: boolean;
}

export interface AppState {
  habits: Habit[];
  uniqueId: string;
  username: string;
  hasCompletedOnboarding: boolean;
  claimedChallenges: string[];
}

export const HABIT_ICONS = [
  { icon: "💧", label: "Water" },
  { icon: "🏃", label: "Exercise" },
  { icon: "📚", label: "Reading" },
  { icon: "🧘", label: "Meditation" },
  { icon: "💤", label: "Sleep" },
  { icon: "🥗", label: "Healthy eating" },
  { icon: "✍️", label: "Writing" },
  { icon: "🎯", label: "Goals" },
  { icon: "💪", label: "Strength" },
  { icon: "🧠", label: "Learning" },
  { icon: "🚭", label: "No smoking" },
  { icon: "🍷", label: "No alcohol" },
  { icon: "📱", label: "Screen time" },
  { icon: "🌅", label: "Wake early" },
  { icon: "💊", label: "Medicine" },
  { icon: "🎨", label: "Creative" },
];
