import type { AssessmentTrack } from "./assessment";

export type AgeGroup = "under-60" | "60-64" | "65-69" | "70-74" | "75-plus";
export type Gender = "male" | "female";
export type FontSize = "large" | "x-large";

export interface UserProfile {
  nickname: string;
  gender: Gender;
  birthYear: number | null;
  height: number | null;
  weight: number | null;
  track: AssessmentTrack;

  // Track A: Vitality
  sports: string[];
  performanceConcerns: string[];
  flexibilityLevel: string;
  lowerStrengthLevel: string;
  balanceLevel: string;

  // Track B: Wellness
  conditions: string[];
  customCondition: string;
  sarcfLift: string;
  sarcfChair: string;
  sarcfStair: string;
  sarcfFall: string;

  // Shared
  painAreas: string[];
  customPainArea?: string;
  motivation: string | string[];
  customMotivation?: string;
  environment: string;
  customEnvironment?: string;
  exerciseHistory: string | string[];
  customExerciseHistory?: string;
  availableTime: string;
  freeNote?: string;

  // Minimal flow
  goalActivities?: string[];
  specificGoals?: string[];

  // Legacy
  ageGroup: string;
  goals: string[];
  createdAt: string;
}

export interface UserPreferences {
  theme: "light";
  fontSize: FontSize;
}
