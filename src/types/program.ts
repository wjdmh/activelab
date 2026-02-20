import type { WeeklyPlan } from "./workout";

export type ProgramCategory =
  | "walking"
  | "running"
  | "golf"
  | "hiking"
  | "swimming"
  | "general"
  | "pain-management";

export interface ProgramPhase {
  weekStart: number;
  weekEnd: number;
  name: string;
  description: string;
}

export interface WeeklyAchievement {
  weekNumber: number;
  completedDays: number;
  totalDays: number;
  averageRPE: number;
  isCompleted: boolean;
  completedAt?: string;
  encouragementMessage: string;
}

export interface AdaptationEvent {
  weekNumber: number;
  type: "intensity-up" | "intensity-down" | "exercise-swap" | "phase-advance";
  reason: string;
  appliedAt: string;
}

export interface Program {
  id: string;
  name: string;
  category: ProgramCategory;
  goal: string;
  durationWeeks: number;
  currentWeek: number;
  phases: ProgramPhase[];
  weeklyPlans: WeeklyPlan[];
  weeklyAchievements: WeeklyAchievement[];
  adaptationHistory: AdaptationEvent[];
  startedAt: string;
  completedAt?: string;
}

export const PROGRAM_TEMPLATES: Array<{
  id: string;
  name: string;
  category: ProgramCategory;
  goal: string;
  durationWeeks: number;
  icon: string;
  description: string;
  phases: ProgramPhase[];
}> = [
  {
    id: "walking-health",
    name: "건강 걷기",
    category: "walking",
    goal: "30분 쉬지 않고 걷기",
    durationWeeks: 4,
    icon: "🚶",
    description: "가볍게 시작해서 30분 연속 걷기까지",
    phases: [
      { weekStart: 1, weekEnd: 2, name: "기초 다지기", description: "10~15분 걷기 + 기본 스트레칭" },
      { weekStart: 3, weekEnd: 4, name: "체력 키우기", description: "20~30분 걷기 + 근력 운동" },
    ],
  },
  {
    id: "running-beginner",
    name: "러닝 입문",
    category: "running",
    goal: "20분 연속 조깅",
    durationWeeks: 8,
    icon: "🏃",
    description: "걷기에서 조깅으로, 천천히 시작해요",
    phases: [
      { weekStart: 1, weekEnd: 3, name: "걷기 체력", description: "빠르게 걷기 + 하체 강화" },
      { weekStart: 4, weekEnd: 6, name: "걷기-조깅", description: "걷기와 조깅을 번갈아" },
      { weekStart: 7, weekEnd: 8, name: "연속 조깅", description: "15~20분 연속 조깅" },
    ],
  },
  {
    id: "golf-fitness",
    name: "골프 체력",
    category: "golf",
    goal: "18홀 체력 + 스윙 유연성",
    durationWeeks: 6,
    icon: "⛳",
    description: "라운드 체력과 스윙 개선을 위한 프로그램",
    phases: [
      { weekStart: 1, weekEnd: 2, name: "기초 체력", description: "코어 안정성 + 기본 유연성" },
      { weekStart: 3, weekEnd: 4, name: "스윙 강화", description: "회전력 + 하체 파워" },
      { weekStart: 5, weekEnd: 6, name: "라운드 체력", description: "지구력 + 종합 컨디셔닝" },
    ],
  },
  {
    id: "hiking-prep",
    name: "등산 준비",
    category: "hiking",
    goal: "3시간 등산 가능 체력",
    durationWeeks: 6,
    icon: "🏔️",
    description: "무릎 보호하면서 산행 체력 만들기",
    phases: [
      { weekStart: 1, weekEnd: 2, name: "하체 기초", description: "무릎 주변 근력 + 밸런스" },
      { weekStart: 3, weekEnd: 4, name: "지구력 향상", description: "심폐 지구력 + 계단 훈련" },
      { weekStart: 5, weekEnd: 6, name: "종합 체력", description: "장시간 산행 대비 종합 훈련" },
    ],
  },
  {
    id: "general-strength",
    name: "전신 근력",
    category: "general",
    goal: "일상이 편해지는 근력",
    durationWeeks: 4,
    icon: "💪",
    description: "전반적인 근력과 체력을 키워요",
    phases: [
      { weekStart: 1, weekEnd: 2, name: "기초 근력", description: "주요 근육군 기본 운동" },
      { weekStart: 3, weekEnd: 4, name: "근력 강화", description: "세트/횟수 증가 + 복합 동작" },
    ],
  },
  {
    id: "pain-management",
    name: "통증 관리",
    category: "pain-management",
    goal: "통증 완화 + 주변 근력 강화",
    durationWeeks: 4,
    icon: "🩹",
    description: "아픈 곳을 보호하면서 근력을 키워요",
    phases: [
      { weekStart: 1, weekEnd: 2, name: "통증 완화", description: "부드러운 스트레칭 + 가동성" },
      { weekStart: 3, weekEnd: 4, name: "근력 보강", description: "통증 부위 주변 근력 강화" },
    ],
  },
];
