"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile, UserPreferences } from "@/types/user";
import type { PostureResult } from "@/types/posture";

interface UserState {
  profile: UserProfile | null;
  preferences: UserPreferences;
  hasCompletedAssessment: boolean;
  /** true: 스캔 완료, false: 스캔 안 함/건너뜀 (배너 표시 여부 기준) */
  visionScanCompleted: boolean;
  /** 최근 자세 분석 결과 */
  postureResult: PostureResult | null;

  // Actions
  setProfile: (profile: UserProfile) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  setAssessmentComplete: () => void;
  setVisionScanCompleted: (result: PostureResult | null) => void;
  resetAll: () => void;

  // Supabase Sync
  syncWithSupabase: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: null,
      preferences: {
        theme: "light",
        fontSize: "large",
      },
      hasCompletedAssessment: false,
      visionScanCompleted: false,
      postureResult: null,

      setProfile: (profile) => set({ profile }),

      updatePreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),

      setAssessmentComplete: () => set({ hasCompletedAssessment: true }),
      setVisionScanCompleted: (result: PostureResult | null) => set({ visionScanCompleted: true, postureResult: result }),

      resetAll: () =>
        set({
          profile: null,
          hasCompletedAssessment: false,
          visionScanCompleted: false,
          postureResult: null,
          preferences: { theme: "light", fontSize: "large" },
        }),

      syncWithSupabase: async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        // 1. Fetch from DB
        const { data: dbUser } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (dbUser) {
          // If DB has data, merge it (DB wins priority for profile)
          // Note: In a real app, you might want deeper merge logic or timestamps
          const currentProfile = get().profile;
          if (!currentProfile && dbUser.nickname) {
            set({
              profile: {
                nickname: dbUser.nickname,
                createdAt: dbUser.created_at,
              } as UserProfile,
            });
          }
        }

        // 2. Check for assessment
        const { data: assessments } = await supabase
          .from("assessments")
          .select("profile, result")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1);

        if (assessments && assessments.length > 0) {
          const latest = assessments[0];
          // Update store with latest assessment data
          set({
            hasCompletedAssessment: true,
            profile: latest.profile as UserProfile,
          });
          // We also need to update useAssessmentStore but that's a separate store.
          // Ideally, we handle this in a unified initializer.
        }
      }
    }),
    {
      name: "active-lab-user",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        profile: state.profile,
        preferences: state.preferences,
        hasCompletedAssessment: state.hasCompletedAssessment,
        visionScanCompleted: state.visionScanCompleted,
        postureResult: state.postureResult,
      }),
    }
  )
);
