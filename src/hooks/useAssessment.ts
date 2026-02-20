"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import type { AssessmentData, AssessmentMode } from "@/types/assessment";
import { INITIAL_ASSESSMENT, getStepsForMode, getStepsForTrack } from "@/types/assessment";

const SESSION_KEY = "active-lab-assessment";

// 챕터 정의 (full flow용)
const CHAPTERS = {
  basics: { name: "기본 정보", steps: ["nickname", "gender", "vitals", "trackSelection"] },
  vitalityAnalysis: { name: "퍼포먼스 분석", steps: ["sportSelection", "performanceConcern", "fitnessCheck"] },
  wellnessAnalysis: { name: "체력 검사", steps: ["conditions", "sarcf", "fitnessCheck"] },
  vitalityFinish: { name: "마무리", steps: ["painAreas", "exerciseHistoryTime"] },
  wellnessFinish: { name: "마무리", steps: ["painAreas", "motivationEnv", "exerciseHistoryTime"] },
};

// 챕터 정의 (minimal flow용)
const MINIMAL_CHAPTERS = {
  setup: { name: "시작하기", steps: ["nickname", "goalSelection", "healthSafety", "fitnessCheck"] },
};

function migrateData(data: AssessmentData): AssessmentData {
  const migrated = { ...data };
  if (typeof migrated.motivation === "string") {
    migrated.motivation = migrated.motivation ? [migrated.motivation] : [];
  }
  if (typeof migrated.exerciseHistory === "string") {
    migrated.exerciseHistory = migrated.exerciseHistory ? [migrated.exerciseHistory] : [];
  }
  if (!migrated.customMotivation) migrated.customMotivation = "";
  if (!migrated.customExerciseHistory) migrated.customExerciseHistory = "";
  if (!migrated.mode) migrated.mode = "minimal";
  if (!migrated.goalActivities) migrated.goalActivities = [];
  if (!migrated.specificGoals) migrated.specificGoals = [];
  if (!migrated.customPainArea) migrated.customPainArea = "";
  if (!migrated.customEnvironment) migrated.customEnvironment = "";
  if (!migrated.customPerformanceConcern) migrated.customPerformanceConcern = "";
  if (!migrated.freeNote) migrated.freeNote = "";
  return migrated;
}

function loadSession(): { step: number; data: AssessmentData } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed.step === "number" && parsed.data) {
      return { step: parsed.step, data: migrateData(parsed.data) };
    }
  } catch {}
  return null;
}

export function hasSavedAssessment(): boolean {
  return loadSession() !== null;
}

export function clearSavedAssessment() {
  try { localStorage.removeItem(SESSION_KEY); } catch {}
}

export function useAssessment() {
  const saved = loadSession();
  const [currentStep, setCurrentStep] = useState(saved?.step ?? 0);
  const [data, setData] = useState<AssessmentData>(saved?.data ?? { ...INITIAL_ASSESSMENT });
  const [direction, setDirection] = useState<1 | -1>(1);

  // localStorage에 진행 상태 저장
  useEffect(() => {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ step: currentStep, data }));
    } catch {}
  }, [currentStep, data]);

  const mode: AssessmentMode = data.mode || "minimal";

  const steps = useMemo(() => {
    if (mode === "minimal") {
      return getStepsForMode("minimal", null);
    }
    return getStepsForTrack(data.track);
  }, [mode, data.track]);

  const totalSteps = steps.length;
  const currentStepId = steps[currentStep] ?? "";

  const canProceed = useCallback(() => {
    switch (currentStepId) {
      // === Minimal & shared ===
      case "nickname":
        return data.nickname.trim().length >= 2;
      case "goalSelection":
        return data.goalActivities.length > 0;
      case "healthSafety":
        return data.conditions.length > 0 && data.painAreas.length > 0;
      // fitnessCheck는 minimal과 full 모두에서 사용되므로 아래 case에서 처리

      // === Full flow ===
      case "gender":
        return data.gender !== null;
      case "vitals":
        return data.birthYear !== null && data.birthYear >= 1930 && data.birthYear <= 2010;
      case "trackSelection":
        return data.track !== null;
      case "sportSelection":
        return data.sports.length > 0;
      case "performanceConcern":
        return data.performanceConcerns.length > 0;
      case "fitnessCheck":
        return (
          data.flexibilityLevel !== null &&
          data.lowerStrengthLevel !== null &&
          data.balanceLevel !== null
        );
      case "conditions":
        return data.conditions.length > 0;
      case "sarcf":
        return (
          data.sarcfLift !== null &&
          data.sarcfChair !== null &&
          data.sarcfStair !== null &&
          data.sarcfFall !== null
        );
      case "painAreas":
        return data.painAreas.length > 0;
      case "motivationEnv":
        return data.motivation.length > 0 && data.environment !== null;
      case "exerciseHistoryTime":
        return data.exerciseHistory.length > 0 && data.availableTime !== null;

      default:
        return false;
    }
  }, [currentStepId, data]);

  const next = useCallback(() => {
    if (currentStep < totalSteps - 1 && canProceed()) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep, totalSteps, canProceed]);

  const skipStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep, totalSteps]);

  const back = useCallback(() => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  const updateField = useCallback(
    <K extends keyof AssessmentData>(field: K, value: AssessmentData[K]) => {
      setData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // 챕터 계산
  const chapter = useMemo(() => {
    if (mode === "minimal") {
      const setupIdx = MINIMAL_CHAPTERS.setup.steps.indexOf(currentStepId);
      if (setupIdx !== -1) {
        return {
          name: MINIMAL_CHAPTERS.setup.name,
          current: setupIdx + 1,
          total: MINIMAL_CHAPTERS.setup.steps.length,
          index: 0,
        };
      }
      return { name: "시작하기", current: 1, total: 3, index: 0 };
    }

    // Full flow 챕터 계산 (기존)
    const basicsIdx = CHAPTERS.basics.steps.indexOf(currentStepId);
    if (basicsIdx !== -1) {
      return { name: CHAPTERS.basics.name, current: basicsIdx + 1, total: CHAPTERS.basics.steps.length, index: 0 };
    }

    if (data.track === "vitality") {
      const analysisIdx = CHAPTERS.vitalityAnalysis.steps.indexOf(currentStepId);
      if (analysisIdx !== -1) {
        return { name: CHAPTERS.vitalityAnalysis.name, current: analysisIdx + 1, total: CHAPTERS.vitalityAnalysis.steps.length, index: 1 };
      }
      const finishIdx = CHAPTERS.vitalityFinish.steps.indexOf(currentStepId);
      if (finishIdx !== -1) {
        return { name: CHAPTERS.vitalityFinish.name, current: finishIdx + 1, total: CHAPTERS.vitalityFinish.steps.length, index: 2 };
      }
    }
    if (data.track === "wellness") {
      const analysisIdx = CHAPTERS.wellnessAnalysis.steps.indexOf(currentStepId);
      if (analysisIdx !== -1) {
        return { name: CHAPTERS.wellnessAnalysis.name, current: analysisIdx + 1, total: CHAPTERS.wellnessAnalysis.steps.length, index: 1 };
      }
      const finishIdx = CHAPTERS.wellnessFinish.steps.indexOf(currentStepId);
      if (finishIdx !== -1) {
        return { name: CHAPTERS.wellnessFinish.name, current: finishIdx + 1, total: CHAPTERS.wellnessFinish.steps.length, index: 2 };
      }
    }

    return { name: "기본 정보", current: 1, total: 4, index: 0 };
  }, [currentStepId, data.track, mode]);

  return {
    currentStep,
    currentStepId,
    totalSteps,
    steps,
    data,
    direction,
    chapter,
    mode,
    canProceed: canProceed(),
    next,
    skipStep,
    back,
    updateField,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === totalSteps - 1,
  };
}
