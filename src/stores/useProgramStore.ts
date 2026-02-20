"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Program, WeeklyAchievement } from "@/types/program";
import type { WeeklyPlan } from "@/types/workout";

interface ProgramState {
  activeProgram: Program | null;
  completedPrograms: Program[];

  startProgram: (program: Omit<Program, "weeklyAchievements" | "adaptationHistory" | "startedAt" | "completedAt">, initialPlan: WeeklyPlan) => void;
  advanceWeek: (newPlan: WeeklyPlan, achievement: WeeklyAchievement) => void;
  completeProgram: () => void;
  resetProgram: () => void;

  getCurrentPhase: () => { name: string; description: string } | null;
  getWeekProgress: () => { current: number; total: number };
  getPhaseProgress: () => { phaseName: string; weekInPhase: number; phaseWeeks: number } | null;
}

export const useProgramStore = create<ProgramState>()(
  persist(
    (set, get) => ({
      activeProgram: null,
      completedPrograms: [],

      startProgram: (programData, initialPlan) => {
        const program: Program = {
          ...programData,
          weeklyPlans: [initialPlan],
          weeklyAchievements: [],
          adaptationHistory: [],
          startedAt: new Date().toISOString(),
        };
        set({ activeProgram: program });
      },

      advanceWeek: (newPlan, achievement) => {
        const program = get().activeProgram;
        if (!program) return;

        const updated: Program = {
          ...program,
          currentWeek: program.currentWeek + 1,
          weeklyPlans: [...program.weeklyPlans, newPlan],
          weeklyAchievements: [...program.weeklyAchievements, achievement],
        };

        set({ activeProgram: updated });
      },

      completeProgram: () => {
        const program = get().activeProgram;
        if (!program) return;

        const completed: Program = {
          ...program,
          completedAt: new Date().toISOString(),
        };

        set((state) => ({
          activeProgram: null,
          completedPrograms: [...state.completedPrograms, completed],
        }));
      },

      resetProgram: () => {
        set({ activeProgram: null });
      },

      getCurrentPhase: () => {
        const program = get().activeProgram;
        if (!program) return null;

        const week = program.currentWeek;
        const phase = program.phases.find(
          (p) => week >= p.weekStart && week <= p.weekEnd
        );
        return phase ? { name: phase.name, description: phase.description } : null;
      },

      getWeekProgress: () => {
        const program = get().activeProgram;
        if (!program) return { current: 0, total: 0 };
        return { current: program.currentWeek, total: program.durationWeeks };
      },

      getPhaseProgress: () => {
        const program = get().activeProgram;
        if (!program) return null;

        const week = program.currentWeek;
        const phase = program.phases.find(
          (p) => week >= p.weekStart && week <= p.weekEnd
        );
        if (!phase) return null;

        return {
          phaseName: phase.name,
          weekInPhase: week - phase.weekStart + 1,
          phaseWeeks: phase.weekEnd - phase.weekStart + 1,
        };
      },
    }),
    {
      name: "active-lab-program",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeProgram: state.activeProgram,
        completedPrograms: state.completedPrograms,
      }),
    }
  )
);
