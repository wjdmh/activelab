"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { WeeklyPlan, WorkoutLog, RPELevel, ActiveSession } from "@/types/workout";

interface WorkoutState {
  weeklyPlan: WeeklyPlan | null;
  logs: WorkoutLog[];
  isRestMode: boolean;
  activeSession: ActiveSession | null;

  setWeeklyPlan: (plan: WeeklyPlan) => void;
  completeExercise: (dayIndex: number, exerciseId: string) => void;
  logRPE: (dayIndex: number, rpe: RPELevel) => void;
  toggleRestMode: () => void;
  setRestMode: (value: boolean) => void;
  resetPlan: () => void;
  isExerciseCompleted: (dayIndex: number, exerciseId: string) => boolean;
  getDayCompletedCount: (dayIndex: number) => number;

  // Session management
  startSession: (dayIndex: number) => void;
  advanceSet: () => void;
  setSessionPhase: (phase: ActiveSession["phase"]) => void;
  completeExerciseInSession: () => void;
  finishSession: (rpe: RPELevel) => void;
  cancelSession: () => void;

  // Records & stats
  getStreak: () => number;
  getMaxStreak: () => number;
  getCompletedDates: () => string[];
  getTotalWorkoutDays: () => number;
  getAverageRPE: () => number;
  getRecentSessions: () => Array<{
    date: string;
    dayIndex: number;
    theme: string;
    exerciseCount: number;
    rpe: RPELevel | null;
  }>;
}

function toDateKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      weeklyPlan: null,
      logs: [],
      isRestMode: false,
      activeSession: null,

      setWeeklyPlan: (plan) => set({ weeklyPlan: plan }),

      completeExercise: (dayIndex, exerciseId) => {
        const today = new Date().toDateString();
        const alreadyDone = get().logs.some(
          (log) =>
            log.dayIndex === dayIndex &&
            log.exerciseId === exerciseId &&
            new Date(log.completedAt).toDateString() === today
        );
        if (alreadyDone) return;

        // Find exercise details from plan
        const { weeklyPlan } = get();
        const exercise = weeklyPlan?.weeklyPlan?.[dayIndex]?.exercises?.find(
          (e) => e.id === exerciseId
        );

        set((state) => ({
          logs: [
            ...state.logs,
            {
              dayIndex,
              exerciseId,
              completedAt: new Date().toISOString(),
              source: "daily" as const,
              exerciseName: exercise?.name,
              exerciseType: exercise?.type,
              sets: exercise?.sets,
              reps: exercise?.reps,
            },
          ],
        }));
      },

      logRPE: (dayIndex, rpe) =>
        set((state) => ({
          logs: [
            ...state.logs,
            {
              dayIndex,
              rpe,
              completedAt: new Date().toISOString(),
            },
          ],
        })),

      toggleRestMode: () =>
        set((state) => ({ isRestMode: !state.isRestMode })),
      setRestMode: (value) => set({ isRestMode: value }),

      resetPlan: () => set({ weeklyPlan: null, logs: [], isRestMode: false, activeSession: null }),

      isExerciseCompleted: (dayIndex, exerciseId) => {
        const today = new Date().toDateString();
        return get().logs.some(
          (log) =>
            log.dayIndex === dayIndex &&
            log.exerciseId === exerciseId &&
            new Date(log.completedAt).toDateString() === today
        );
      },

      getDayCompletedCount: (dayIndex) => {
        const today = new Date().toDateString();
        return get().logs.filter(
          (log) =>
            log.dayIndex === dayIndex &&
            log.exerciseId &&
            new Date(log.completedAt).toDateString() === today
        ).length;
      },

      // === Session management ===
      startSession: (dayIndex) => {
        set({
          activeSession: {
            dayIndex,
            exerciseIndex: 0,
            currentSet: 1,
            phase: "intro",
            startedAt: new Date().toISOString(),
          },
          isRestMode: false,
        });
      },

      advanceSet: () => {
        const session = get().activeSession;
        if (!session) return;
        set({
          activeSession: {
            ...session,
            currentSet: session.currentSet + 1,
            phase: "active",
          },
        });
      },

      setSessionPhase: (phase) => {
        const session = get().activeSession;
        if (!session) return;
        set({ activeSession: { ...session, phase } });
      },

      completeExerciseInSession: () => {
        const session = get().activeSession;
        if (!session) return;
        const { weeklyPlan } = get();
        const exercises = weeklyPlan?.weeklyPlan?.[session.dayIndex]?.exercises ?? [];
        const exercise = exercises[session.exerciseIndex];

        if (exercise) {
          get().completeExercise(session.dayIndex, exercise.id);
        }

        const nextIndex = session.exerciseIndex + 1;
        if (nextIndex >= exercises.length) {
          set({ activeSession: { ...session, phase: "complete" } });
        } else {
          set({
            activeSession: {
              ...session,
              exerciseIndex: nextIndex,
              currentSet: 1,
              phase: "exercise-done",
            },
          });
        }
      },

      finishSession: (rpe) => {
        const session = get().activeSession;
        if (!session) return;
        get().logRPE(session.dayIndex, rpe);
        set({ activeSession: null });
      },

      cancelSession: () => {
        set({ activeSession: null });
      },

      // === Records & stats ===
      getStreak: () => {
        const dates = get().getCompletedDates();
        if (dates.length === 0) return 0;

        const sorted = [...dates].sort().reverse();
        const today = toDateKey(new Date().toISOString());
        const yesterday = toDateKey(new Date(Date.now() - 86400000).toISOString());

        if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

        let streak = 1;
        for (let i = 1; i < sorted.length; i++) {
          const prev = new Date(sorted[i - 1]);
          const curr = new Date(sorted[i]);
          const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86400000);
          if (diffDays === 1) {
            streak++;
          } else {
            break;
          }
        }
        return streak;
      },

      getMaxStreak: () => {
        const dates = get().getCompletedDates();
        if (dates.length === 0) return 0;

        const sorted = [...dates].sort();
        let maxStreak = 1;
        let currentStreak = 1;

        for (let i = 1; i < sorted.length; i++) {
          const prev = new Date(sorted[i - 1]);
          const curr = new Date(sorted[i]);
          const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
          if (diffDays === 1) {
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
          } else {
            currentStreak = 1;
          }
        }
        return maxStreak;
      },

      getCompletedDates: () => {
        const { logs } = get();
        const dateSet = new Set<string>();
        logs.forEach((log) => {
          if (log.exerciseId) {
            dateSet.add(toDateKey(log.completedAt));
          }
        });
        return Array.from(dateSet).sort();
      },

      getTotalWorkoutDays: () => {
        return get().getCompletedDates().length;
      },

      getAverageRPE: () => {
        const { logs } = get();
        const rpeLogs = logs.filter((l) => l.rpe != null);
        if (rpeLogs.length === 0) return 0;
        const sum = rpeLogs.reduce((acc, l) => acc + (l.rpe ?? 0), 0);
        return Math.round((sum / rpeLogs.length) * 10) / 10;
      },

      getRecentSessions: () => {
        const { logs, weeklyPlan } = get();
        if (!weeklyPlan) return [];

        // Group RPE logs by date
        const rpeLogs = logs.filter((l) => l.rpe != null);
        const dateMap = new Map<string, { dayIndex: number; rpe: RPELevel | null; exerciseCount: number }>();

        // Count exercises per date
        logs.forEach((log) => {
          if (!log.exerciseId) return;
          const dateKey = toDateKey(log.completedAt);
          const existing = dateMap.get(dateKey);
          if (existing) {
            existing.exerciseCount++;
          } else {
            dateMap.set(dateKey, { dayIndex: log.dayIndex, rpe: null, exerciseCount: 1 });
          }
        });

        // Attach RPE
        rpeLogs.forEach((log) => {
          const dateKey = toDateKey(log.completedAt);
          const existing = dateMap.get(dateKey);
          if (existing && log.rpe) {
            existing.rpe = log.rpe;
          }
        });

        return Array.from(dateMap.entries())
          .sort(([a], [b]) => b.localeCompare(a))
          .slice(0, 14)
          .map(([date, data]) => ({
            date,
            dayIndex: data.dayIndex,
            theme: weeklyPlan.weeklyPlan?.[data.dayIndex]?.theme ?? "",
            exerciseCount: data.exerciseCount,
            rpe: data.rpe,
          }));
      },
    }),
    {
      name: "active-lab-workout",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        weeklyPlan: state.weeklyPlan,
        logs: state.logs,
        isRestMode: state.isRestMode,
      }),
    }
  )
);
