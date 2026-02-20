"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface CommunityState {
  clapCounts: Record<string, number>;
  userCompletions: Array<{
    id: string;
    nickname: string;
    completedAt: string;
  }>;

  addClap: (entryId: string) => void;
  addUserCompletion: (nickname: string) => void;
}

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set, get) => ({
      clapCounts: {},
      userCompletions: [],

      addClap: (entryId) =>
        set((state) => ({
          clapCounts: {
            ...state.clapCounts,
            [entryId]: (state.clapCounts[entryId] || 0) + 1,
          },
        })),

      addUserCompletion: (nickname) => {
        const today = new Date().toDateString();
        const alreadyToday = get().userCompletions.some(
          (c) => new Date(c.completedAt).toDateString() === today
        );
        if (alreadyToday) return;

        set((state) => ({
          userCompletions: [
            {
              id: `user-${Date.now()}`,
              nickname,
              completedAt: new Date().toISOString(),
            },
            ...state.userCompletions,
          ].slice(0, 30),
        }));
      },
    }),
    {
      name: "active-lab-community",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
