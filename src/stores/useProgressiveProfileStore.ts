"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type ProfilePromptType =
  | "age-gender"       // 첫 운동 완료 후
  | "health-detail"    // 3회 운동 후
  | "environment-time" // 1주 완료 후
  | "sarcf";           // 2주 완료 후

interface ProfilePromptStatus {
  type: ProfilePromptType;
  shown: boolean;
  completed: boolean;
  shownAt?: string;
  completedAt?: string;
}

interface ProgressiveProfileState {
  prompts: ProfilePromptStatus[];
  totalWorkoutsCompleted: number;

  incrementWorkouts: () => void;
  getNextPrompt: () => ProfilePromptType | null;
  markPromptShown: (type: ProfilePromptType) => void;
  markPromptCompleted: (type: ProfilePromptType) => void;
  dismissPrompt: (type: ProfilePromptType) => void;
  shouldShowPrompt: () => boolean;
}

const PROMPT_SCHEDULE: Array<{ type: ProfilePromptType; minWorkouts: number }> = [
  { type: "age-gender", minWorkouts: 1 },
  { type: "health-detail", minWorkouts: 3 },
  { type: "environment-time", minWorkouts: 7 },
  { type: "sarcf", minWorkouts: 14 },
];

const INITIAL_PROMPTS: ProfilePromptStatus[] = PROMPT_SCHEDULE.map((s) => ({
  type: s.type,
  shown: false,
  completed: false,
}));

export const useProgressiveProfileStore = create<ProgressiveProfileState>()(
  persist(
    (set, get) => ({
      prompts: INITIAL_PROMPTS,
      totalWorkoutsCompleted: 0,

      incrementWorkouts: () => {
        set((state) => ({
          totalWorkoutsCompleted: state.totalWorkoutsCompleted + 1,
        }));
      },

      getNextPrompt: () => {
        const { prompts, totalWorkoutsCompleted } = get();
        for (const schedule of PROMPT_SCHEDULE) {
          if (totalWorkoutsCompleted >= schedule.minWorkouts) {
            const prompt = prompts.find((p) => p.type === schedule.type);
            if (prompt && !prompt.completed && !prompt.shown) {
              return schedule.type;
            }
          }
        }
        return null;
      },

      markPromptShown: (type) => {
        set((state) => ({
          prompts: state.prompts.map((p) =>
            p.type === type ? { ...p, shown: true, shownAt: new Date().toISOString() } : p
          ),
        }));
      },

      markPromptCompleted: (type) => {
        set((state) => ({
          prompts: state.prompts.map((p) =>
            p.type === type ? { ...p, completed: true, completedAt: new Date().toISOString() } : p
          ),
        }));
      },

      dismissPrompt: (type) => {
        // Treat dismiss as completed (don't show again)
        set((state) => ({
          prompts: state.prompts.map((p) =>
            p.type === type ? { ...p, shown: true, completed: true } : p
          ),
        }));
      },

      shouldShowPrompt: () => {
        return get().getNextPrompt() !== null;
      },
    }),
    {
      name: "active-lab-progressive-profile",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
