export interface Exercise {
  id: string;
  name: string;
  description: string;
  type?: "근력(Power)" | "유산소" | "유연성" | "균형" | string;
  sets: number;
  reps: number;
  durationSeconds?: number;
  restSeconds: number;
  safetyNote: string;
  requiresSupport: boolean;
  targetArea: string;
  benefit?: string;
}

export interface DailyPlan {
  day: string;
  dayIndex: number;
  theme: string;
  exercises: Exercise[];
}

export interface RestDayAlternative {
  name: string;
  description: string;
  sets: number;
  reps: number;
}

export interface WeeklyPlan {
  weeklyPlan: DailyPlan[];
  restDayAlternative: RestDayAlternative;
  generatedAt: string;
}

export type RPELevel = 1 | 2 | 3 | 4 | 5;

export type WorkoutSource = 'onboarding' | 'loading' | 'daily' | 'coach';

export interface WorkoutLog {
  dayIndex: number;
  exerciseId?: string;
  rpe?: RPELevel;
  completedAt: string;
  // Extended fields (Phase 4)
  source?: WorkoutSource;
  exerciseName?: string;
  exerciseType?: string;
  sets?: number;
  reps?: number;
}

export type SessionPhase = 'intro' | 'active' | 'resting' | 'exercise-done' | 'complete' | 'feedback';

export interface ActiveSession {
  dayIndex: number;
  exerciseIndex: number;
  currentSet: number;
  phase: SessionPhase;
  startedAt: string;
}
