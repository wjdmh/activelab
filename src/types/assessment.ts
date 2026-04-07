import type { Gender } from "./user";

// 트랙 타입
export type AssessmentTrack = "vitality" | "wellness";

// 진단 모드: minimal(4단계) vs full(기존 15~17단계)
export type AssessmentMode = "minimal" | "full";

// ACSM 신체활동 수준 (지난 3개월 기준)
export type ActivityLevel = "active" | "inactive";

// ACSM 처방 위험도 분류
// green: 정상 처방 / yellow: 제한적 처방(고강도 금지) / red: 처방 보류(의사 상담 필요) / emergency: 즉시 중단
export type AcsmRiskLevel = "green" | "yellow" | "red" | "emergency";

// 목표 활동 카테고리
export type GoalActivity =
  | "walking"
  | "running"
  | "golf"
  | "hiking"
  | "swimming"
  | "general"
  | "pain-management"
  | "other";

// SARC-F 난이도 척도
export type SarcFDifficulty = "none" | "some" | "a_lot" | "unable";

// SARC-F 낙상 횟수
export type SarcFFallCount = "none" | "1-3" | "4-plus";

// 기능 체력 수준
export type FitnessLevel = "good" | "moderate" | "poor";

export interface AssessmentData {
  // === 진단 모드 ===
  mode: AssessmentMode;

  // === ACSM 사전 선별 ===
  activityLevel: ActivityLevel | null;        // Step 1: 현재 활동 수준
  acsmSymptoms: string[];                      // Step 2: 9대 위험 증상
  acsmRiskLevel: AcsmRiskLevel | null;         // Step 3: AI 처방 분기 결과

  // === 공통 (Common) ===
  nickname: string;
  gender: Gender | null;
  birthYear: number | null;
  height: number | null; // cm
  weight: number | null; // kg
  track: AssessmentTrack | null;

  // === Minimal Flow (신규) ===
  goalActivities: GoalActivity[]; // 선택한 목표 활동들
  specificGoals: string[]; // 활동별 구체적 목표

  // === Track A: Vitality (스포츠·퍼포먼스) ===
  sports: string[]; // 선택한 스포츠/활동
  performanceConcerns: string[]; // 퍼포먼스 고민
  customPerformanceConcern: string;
  flexibilityLevel: FitnessLevel | null; // 상체 유연성
  lowerStrengthLevel: FitnessLevel | null; // 하체 근지구력
  balanceLevel: FitnessLevel | null; // 평형성

  // === Track B: Wellness (건강 관리) ===
  conditions: string[];
  customCondition: string;
  sarcfLift: SarcFDifficulty | null;
  sarcfChair: SarcFDifficulty | null;
  sarcfStair: SarcFDifficulty | null;
  sarcfFall: SarcFFallCount | null;

  // === 공통 (Shared) ===
  painAreas: string[];
  customPainArea: string;
  motivation: string[];
  customMotivation: string;
  environment: "home" | "park" | "gym" | "senior-center" | null;
  customEnvironment: string;
  exerciseHistory: string[];
  customExerciseHistory: string;
  availableTime: "10min" | "30min" | "60min" | null;
  freeNote: string;

  // 레거시 호환
  ageGroup: string | null;
  goals: string[];
}

export const INITIAL_ASSESSMENT: AssessmentData = {
  mode: "minimal",

  // ACSM
  activityLevel: null,
  acsmSymptoms: [],
  acsmRiskLevel: null,

  nickname: "",
  gender: null,
  birthYear: null,
  height: null,
  weight: null,
  track: null,

  // Minimal
  goalActivities: [],
  specificGoals: [],

  // Track A
  sports: [],
  performanceConcerns: [],
  customPerformanceConcern: "",
  flexibilityLevel: null,
  lowerStrengthLevel: null,
  balanceLevel: null,

  // Track B
  conditions: [],
  customCondition: "",
  sarcfLift: null,
  sarcfChair: null,
  sarcfStair: null,
  sarcfFall: null,

  // Shared
  painAreas: [],
  customPainArea: "",
  motivation: [],
  customMotivation: "",
  environment: null,
  customEnvironment: "",
  exerciseHistory: [],
  customExerciseHistory: "",
  availableTime: null,
  freeNote: "",

  ageGroup: null,
  goals: [],
};

// === Minimal Flow 스텝 ===
export const MINIMAL_STEPS = [
  "nickname",
  "goalSelection",
  "healthSafety",
  "fitnessCheck",
] as const;

// === Full Flow 스텝 (기존) ===
export const COMMON_STEPS = ["nickname", "gender", "vitals", "trackSelection"] as const;

export const VITALITY_STEPS = [
  "sportSelection",
  "performanceConcern",
  "fitnessCheck",
  "painAreas",
  "exerciseHistoryTime",
] as const;

export const WELLNESS_STEPS = [
  "conditions",
  "sarcf",
  "fitnessCheck",
  "painAreas",
  "motivationEnv",
  "exerciseHistoryTime",
] as const;

export function getStepsForMode(mode: AssessmentMode, track: AssessmentTrack | null): string[] {
  if (mode === "minimal") {
    return [...MINIMAL_STEPS];
  }
  return getStepsForTrack(track);
}

export function getStepsForTrack(track: AssessmentTrack | null): string[] {
  const common = [...COMMON_STEPS];
  if (track === "vitality") return [...common, ...VITALITY_STEPS];
  if (track === "wellness") return [...common, ...WELLNESS_STEPS];
  return common;
}

export function getTotalSteps(track: AssessmentTrack | null): number {
  return getStepsForTrack(track).length;
}

// 목표 활동 옵션
export const GOAL_ACTIVITY_OPTIONS = [
  { id: "walking" as GoalActivity, label: "걷기·산책", icon: "🚶", description: "가볍게 걸으며 건강 관리" },
  { id: "running" as GoalActivity, label: "러닝·조깅", icon: "🏃", description: "달리기를 시작하고 싶어요" },
  { id: "golf" as GoalActivity, label: "골프", icon: "⛳", description: "라운드 체력과 스윙 개선" },
  { id: "hiking" as GoalActivity, label: "등산·하이킹", icon: "🏔️", description: "산을 더 편하게 오르고 싶어요" },
  { id: "swimming" as GoalActivity, label: "수영", icon: "🏊", description: "수영 체력과 지구력 향상" },
  { id: "general" as GoalActivity, label: "전신 근력", icon: "💪", description: "전반적인 근력과 체력 강화" },
  { id: "pain-management" as GoalActivity, label: "통증 관리", icon: "🩹", description: "통증 완화와 재활 운동" },
  { id: "other" as GoalActivity, label: "기타", icon: "✏️", description: "직접 입력" },
] as const;

// 활동별 구체적 목표 옵션
export const SPECIFIC_GOAL_OPTIONS: Record<GoalActivity, Array<{ id: string; label: string }>> = {
  walking: [
    { id: "walk-30min", label: "30분 쉬지 않고 걷기" },
    { id: "walk-daily", label: "매일 동네 산책" },
    { id: "walk-errands", label: "장보기가 편해지기" },
  ],
  running: [
    { id: "run-start", label: "가볍게 달리기 시작" },
    { id: "run-5k", label: "5km 완주" },
    { id: "run-stamina", label: "달리기 체력 키우기" },
  ],
  golf: [
    { id: "golf-18hole", label: "18홀 라운드 체력" },
    { id: "golf-swing", label: "스윙 유연성 개선" },
    { id: "golf-no-pain", label: "허리 통증 없이 라운드" },
  ],
  hiking: [
    { id: "hike-easy", label: "동네 뒷산 가볍게" },
    { id: "hike-3hr", label: "3시간 등산 가능 체력" },
    { id: "hike-knee", label: "무릎 부담 줄이기" },
  ],
  swimming: [
    { id: "swim-endurance", label: "오래 수영하기" },
    { id: "swim-shoulder", label: "어깨 가동 범위 넓히기" },
    { id: "swim-breath", label: "호흡 조절 능력 향상" },
  ],
  general: [
    { id: "general-strength", label: "전반적인 근력 강화" },
    { id: "general-daily", label: "일상생활이 편해지기" },
    { id: "general-energy", label: "활력 있는 하루" },
  ],
  "pain-management": [
    { id: "pain-knee", label: "무릎 통증 관리" },
    { id: "pain-back", label: "허리 통증 관리" },
    { id: "pain-shoulder", label: "어깨 통증 관리" },
  ],
  other: [
    { id: "other-health", label: "전반적인 건강 개선" },
    { id: "other-custom", label: "기타 (직접 입력)" },
  ],
};
