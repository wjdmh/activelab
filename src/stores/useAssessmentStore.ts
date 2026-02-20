"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";

export interface UserProfile {
  nickname: string;
  age: number | null;
  height: number | null;
  weight: number | null;
  sport: string;
  sportLabel: string;
  subSports: string[];       // 부종목 목록
  experience: string;
  goal: string;
  painAreas: string[];
  // 운동수행능력 테스트 결과
  fitnessTest: {
    flexibility: number | null;
    balance: number | null;
    power: number | null;
    agility: number | null;
  };
  fitnessTestCompleted: boolean;
}

export interface AssessmentResult {
  profile: UserProfile;
  sportsAge: number;
  chronologicalAge: number;
  radarData: { label: string; value: number }[];
  peerAverage: number;
  aiComment: string;
  recommendations: {
    id: string;
    name: string;
    description: string;
    targetArea: string;
    sets: number;
    reps: number;
    benefit: string;
  }[];
  completedAt: string;
}

// 선제 질문 시스템
export interface ProactiveQuestion {
  id: string;
  question: string;
  createdAt: string;
  read: boolean;
}

// 주간 운동 기록 (캘린더용)
export interface WeeklyRecord {
  weekStart: string; // ISO date of Monday
  days: boolean[];   // [Mon, Tue, ... Sun]
}

interface AssessmentState {
  currentStep: number;
  chatHistory: { role: "user" | "assistant"; content: string }[];
  userProfile: UserProfile;
  result: AssessmentResult | null;

  // 운동 상태
  todayWorkoutCompleted: boolean;
  streak: number;
  activeMinutes: number;
  lastWorkoutDate: string | null;
  bonusScore: number;          // 운동으로 획득한 보너스 점수
  totalWorkoutsCompleted: number; // 총 완료 운동 수
  bonusWorkoutsToday: number;  // 오늘 보너스 운동 수

  // 주간 기록
  weeklyRecord: WeeklyRecord | null;

  // Supabase 저장 여부
  savedToSupabase: boolean;

  // 선제 질문
  proactiveQuestion: ProactiveQuestion | null;

  // actions
  setCurrentStep: (step: number) => void;
  addChatMessage: (msg: { role: "user" | "assistant"; content: string }) => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
  setResult: (result: AssessmentResult) => void;
  saveToSupabase: () => Promise<void>;
  setTodayWorkoutCompleted: (v: boolean) => void;
  addActiveMinutes: (mins: number) => void;
  incrementStreak: () => void;
  addBonusScore: (points: number) => void;
  completeBonusWorkout: () => void;
  markTodayInCalendar: () => void;
  setProactiveQuestion: (q: ProactiveQuestion | null) => void;
  markProactiveRead: () => void;
  resetAssessment: () => void;

  // computed helpers
  getEffectiveScore: () => number;
  getEffectiveSportsAge: () => number;
}

const EMPTY_PROFILE: UserProfile = {
  nickname: "",
  age: null,
  height: null,
  weight: null,
  sport: "",
  sportLabel: "",
  subSports: [],
  experience: "",
  goal: "",
  painAreas: [],
  fitnessTest: {
    flexibility: null,
    balance: null,
    power: null,
    agility: null,
  },
  fitnessTestCompleted: false,
};

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1; // Monday = 0
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  return monday.toISOString().split("T")[0];
}

function getTodayDayIndex(): number {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1; // Mon=0, Sun=6
}

export const useAssessmentStore = create<AssessmentState>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      chatHistory: [],
      userProfile: { ...EMPTY_PROFILE },
      result: null,
      todayWorkoutCompleted: false,
      streak: 0,
      activeMinutes: 0,
      lastWorkoutDate: null,
      bonusScore: 0,
      totalWorkoutsCompleted: 0,
      bonusWorkoutsToday: 0,
      savedToSupabase: false,
      weeklyRecord: null,
      proactiveQuestion: null,

      setCurrentStep: (step) => set({ currentStep: step }),
      addChatMessage: (msg) =>
        set((state) => ({ chatHistory: [...state.chatHistory, msg] })),
      updateProfile: (partial) =>
        set((state) => ({ userProfile: { ...state.userProfile, ...partial } })),

      setResult: async (result) => {
        set({ result, savedToSupabase: false });

        // 로그인 상태면 바로 저장
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from("assessments").insert({
              user_id: user.id,
              profile: get().userProfile,
              result: result,
            });
            set({ savedToSupabase: true });
          }
        } catch {
          // 비로그인이면 나중에 저장
        }
      },

      saveToSupabase: async () => {
        const state = get();
        if (state.savedToSupabase || !state.result) return;
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from("assessments").insert({
              user_id: user.id,
              profile: state.userProfile,
              result: state.result,
            });
            set({ savedToSupabase: true });
          }
        } catch (err) {
          console.warn("[AssessmentStore] saveToSupabase failed:", err);
        }
      },

      setTodayWorkoutCompleted: (v) => {
        set({ todayWorkoutCompleted: v, lastWorkoutDate: v ? new Date().toDateString() : null });
        if (v) {
          // 운동 완료 시 보너스 점수 추가
          const state = get();
          const streakBonus = state.streak >= 3 ? 0.3 : 0;
          set({
            bonusScore: Math.min(state.bonusScore + 0.5 + streakBonus, 20),
            totalWorkoutsCompleted: state.totalWorkoutsCompleted + 1,
          });
        }
      },
      addActiveMinutes: (mins) => set((state) => ({ activeMinutes: state.activeMinutes + mins })),
      incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),
      addBonusScore: (points) => set((state) => ({ bonusScore: Math.min(state.bonusScore + points, 20) })),
      completeBonusWorkout: () => {
        const state = get();
        set({
          bonusWorkoutsToday: state.bonusWorkoutsToday + 1,
          bonusScore: Math.min(state.bonusScore + 0.3, 20),
          totalWorkoutsCompleted: state.totalWorkoutsCompleted + 1,
        });
      },
      markTodayInCalendar: () => {
        const weekStart = getWeekStart();
        const dayIdx = getTodayDayIndex();
        set((state) => {
          const record = state.weeklyRecord?.weekStart === weekStart
            ? { ...state.weeklyRecord, days: [...state.weeklyRecord.days] }
            : { weekStart, days: [false, false, false, false, false, false, false] };
          record.days[dayIdx] = true;
          return { weeklyRecord: record };
        });
      },
      setProactiveQuestion: (q) => set({ proactiveQuestion: q }),
      markProactiveRead: () =>
        set((state) => ({
          proactiveQuestion: state.proactiveQuestion ? { ...state.proactiveQuestion, read: true } : null,
        })),
      resetAssessment: () =>
        set({
          currentStep: 1,
          chatHistory: [],
          userProfile: { ...EMPTY_PROFILE },
          result: null,
          todayWorkoutCompleted: false,
          streak: 0,
          activeMinutes: 0,
          lastWorkoutDate: null,
          bonusScore: 0,
          totalWorkoutsCompleted: 0,
          bonusWorkoutsToday: 0,
          savedToSupabase: false,
          weeklyRecord: null,
          proactiveQuestion: null,
        }),

      // Computed: 기본 점수 + 보너스 점수
      getEffectiveScore: () => {
        const state = get();
        if (!state.result?.radarData?.length) return 0;
        const baseAvg = Math.round(
          state.result.radarData.reduce((a, b) => a + b.value, 0) / state.result.radarData.length
        );
        return Math.min(100, Math.round(baseAvg + state.bonusScore));
      },
      // Computed: 스포츠 나이 (점수 5점 상승 → 1세 감소)
      getEffectiveSportsAge: () => {
        const state = get();
        if (!state.result) return 0;
        const ageReduction = Math.floor(state.bonusScore / 5);
        return Math.max(30, state.result.sportsAge - ageReduction);
      },
    }),
    {
      name: "active-lab-assessment",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        result: state.result,
        userProfile: state.userProfile,
        todayWorkoutCompleted: state.todayWorkoutCompleted,
        streak: state.streak,
        activeMinutes: state.activeMinutes,
        lastWorkoutDate: state.lastWorkoutDate,
        bonusScore: state.bonusScore,
        totalWorkoutsCompleted: state.totalWorkoutsCompleted,
        bonusWorkoutsToday: state.bonusWorkoutsToday,
        savedToSupabase: state.savedToSupabase,
        weeklyRecord: state.weeklyRecord,
        proactiveQuestion: state.proactiveQuestion,
      }),
    }
  )
);
