"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { BadgeId, EarnedBadge } from "@/types/achievements";

interface AchievementState {
  earnedBadges: EarnedBadge[];
  pendingNotification: BadgeId | null;

  earnBadge: (badgeId: BadgeId) => boolean; // returns true if newly earned
  hasBadge: (badgeId: BadgeId) => boolean;
  dismissNotification: () => void;

  // Check conditions and award badges
  checkAchievements: (context: {
    totalWorkouts: number;
    streak: number;
    maxStreak: number;
    averageRPE: number;
    previousAverageRPE: number;
    programCompleted: boolean;
    weeklyCompleted: number;
  }) => void;
}

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      earnedBadges: [],
      pendingNotification: null,

      earnBadge: (badgeId) => {
        if (get().hasBadge(badgeId)) return false;
        set((state) => ({
          earnedBadges: [
            ...state.earnedBadges,
            { badgeId, earnedAt: new Date().toISOString() },
          ],
          pendingNotification: badgeId,
        }));
        return true;
      },

      hasBadge: (badgeId) => {
        return get().earnedBadges.some((b) => b.badgeId === badgeId);
      },

      dismissNotification: () => {
        set({ pendingNotification: null });
      },

      checkAchievements: (ctx) => {
        const { earnBadge } = get();

        // First step: first workout ever
        if (ctx.totalWorkouts >= 1) {
          earnBadge("first-step");
        }

        // 3-day streak
        if (ctx.streak >= 3 || ctx.maxStreak >= 3) {
          earnBadge("streak-3");
        }

        // First week complete (7 days in a week)
        if (ctx.weeklyCompleted >= 5) {
          earnBadge("first-week");
        }

        // 30-day streak
        if (ctx.streak >= 30 || ctx.maxStreak >= 30) {
          earnBadge("streak-30");
        }

        // Program complete
        if (ctx.programCompleted) {
          earnBadge("program-complete");
        }

        // Getting easier: RPE dropped by at least 0.5
        if (
          ctx.previousAverageRPE > 0 &&
          ctx.averageRPE > 0 &&
          ctx.averageRPE < ctx.previousAverageRPE - 0.4
        ) {
          earnBadge("getting-easier");
        }
      },
    }),
    {
      name: "active-lab-achievements",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        earnedBadges: state.earnedBadges,
      }),
    }
  )
);
