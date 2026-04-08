"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useAssessment } from "@/hooks/useAssessment";
import { useUserStore } from "@/stores/useUserStore";
import { useWorkoutStore } from "@/stores/useWorkoutStore";
import { useCoachStore } from "@/stores/useCoachStore";
import { Button } from "@/components/ui/Button";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { classifyAcsmRisk } from "@/lib/acsm";
import { NicknameStep } from "./steps/NicknameStep";
import { GoalSelectionStep } from "./steps/GoalSelectionStep";
import { HealthSafetyStep } from "./steps/HealthSafetyStep";
import { GenderStep } from "./steps/GenderStep";
import { VitalsStep } from "./steps/VitalsStep";
import { TrackSelectionStep } from "./steps/TrackSelectionStep";
import { SportSelectionStep } from "./steps/SportSelectionStep";
import { PerformanceConcernStep } from "./steps/PerformanceConcernStep";
import { FitnessCheckStep } from "./steps/FitnessCheckStep";
import { MedicalStep } from "./steps/MedicalStep";
import { SarcfStep } from "./steps/SarcfStep";
import { PainAreaStep } from "./steps/PainAreaStep";
import { MotivationEnvStep } from "./steps/MotivationEnvStep";
import { ExerciseHistoryTimeStep } from "./steps/ExerciseHistoryTimeStep";
import { VisionCameraStep } from "./steps/VisionCameraStep";
import type { UserProfile, Gender } from "@/types/user";
import type { AssessmentTrack, FitnessLevel, GoalActivity, ActivityLevel } from "@/types/assessment";

export function WizardContainer() {
  const router = useRouter();
  const {
    currentStep,
    currentStepId,
    totalSteps,
    data,
    direction,
    chapter,
    canProceed,
    next,
    skipStep,
    back,
    updateField,
    isFirstStep,
    isLastStep,
  } = useAssessment();

  const setProfile = useUserStore((s) => s.setProfile);
  const setAssessmentComplete = useUserStore((s) => s.setAssessmentComplete);
  const setVisionScanCompleted = useUserStore((s) => s.setVisionScanCompleted);
  const setWeeklyPlan = useWorkoutStore((s) => s.setWeeklyPlan);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVisionStep, setShowVisionStep] = useState(false);
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const autoAdvanceAfter = (fn: () => void, delay = 400) => {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    autoAdvanceTimer.current = setTimeout(() => {
      fn();
      autoAdvanceTimer.current = null;
    }, delay);
  };

  // Vision 스텝 완료 후 실제 플랜 생성
  const handleVisionComplete = async (result: import("@/types/posture").PostureResult | null, skipped: boolean) => {
    setVisionScanCompleted(skipped ? null : result);
    setShowVisionStep(false);
    await generatePlan(skipped);
  };

  // 마지막 스텝에서 Vision 유도 화면 먼저 표시
  const handleSubmit = async () => {
    if (!canProceed) return;
    setShowVisionStep(true);
  };

  const generatePlan = async (visionSkipped: boolean) => {
    const isMinimal = data.mode === "minimal";

    const currentYear = new Date().getFullYear();
    const age = data.birthYear ? currentYear - data.birthYear : 65;
    let ageGroup = "65-69";
    if (age < 60) ageGroup = "under-60";
    else if (age < 65) ageGroup = "60-64";
    else if (age < 70) ageGroup = "65-69";
    else if (age < 75) ageGroup = "70-74";
    else ageGroup = "75-plus";

    const profile: UserProfile = {
      nickname: data.nickname.trim(),
      gender: isMinimal ? ("male" as Gender) : (data.gender as Gender),
      birthYear: data.birthYear,
      height: data.height,
      weight: data.weight,
      track: (data.track || "wellness") as AssessmentTrack,
      sports: data.sports,
      performanceConcerns: data.performanceConcerns,
      flexibilityLevel: data.flexibilityLevel || "",
      lowerStrengthLevel: data.lowerStrengthLevel || "",
      balanceLevel: data.balanceLevel || "",
      conditions: data.conditions,
      customCondition: data.customCondition,
      sarcfLift: data.sarcfLift || "",
      sarcfChair: data.sarcfChair || "",
      sarcfStair: data.sarcfStair || "",
      sarcfFall: data.sarcfFall || "",
      painAreas: data.painAreas,
      customPainArea: data.customPainArea,
      motivation: data.motivation,
      customMotivation: data.customMotivation,
      environment: data.environment || "",
      customEnvironment: data.customEnvironment,
      exerciseHistory: data.exerciseHistory,
      customExerciseHistory: data.customExerciseHistory,
      availableTime: data.availableTime || "",
      freeNote: data.freeNote,
      ageGroup: isMinimal ? "" : ageGroup,
      goals: data.goals,
      goalActivities: data.goalActivities,
      specificGoals: data.specificGoals,
      createdAt: new Date().toISOString(),
    };

    // ACSM 최종 위험도 계산 (카메라 건너뛰기 시 안전 최우선 → 비활동자 처리)
    const effectiveActivityLevel = visionSkipped ? "inactive" : data.activityLevel;
    const acsmRiskLevel = classifyAcsmRisk({
      activityLevel: effectiveActivityLevel,
      conditions: data.conditions,
      acsmSymptoms: data.acsmSymptoms,
    });

    setProfile(profile);
    setIsLoading(true);
    setError(null);

    try {
      const apiPayload = {
        ...data,
        ageGroup: isMinimal ? "" : ageGroup,
        acsmRiskLevel,
        visionSkipped,
      };
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiPayload),
      });

      let plan;
      try {
        plan = await res.json();
      } catch {
        throw new Error("서버 응답을 처리할 수 없어요.");
      }

      if (!res.ok || plan.error) {
        const msg = Array.isArray(plan.error)
          ? plan.error.join(", ")
          : typeof plan.error === "string"
            ? plan.error
            : "운동 계획을 만드는 중 문제가 발생했어요.";
        throw new Error(msg);
      }

      if (!plan.weeklyPlan || !Array.isArray(plan.weeklyPlan)) {
        throw new Error("운동 계획 형식이 올바르지 않아요.");
      }

      setWeeklyPlan({
        ...plan,
        generatedAt: new Date().toISOString(),
      });

      setAssessmentComplete();

      // 채팅 내역 초기화 (새로운 시작을 위해)
      useCoachStore.getState().clearMessages();

      try { localStorage.removeItem("active-lab-assessment"); } catch { }
      await new Promise((resolve) => setTimeout(resolve, 2000));
      router.push("/report");
    } catch (err) {
      console.error("운동 생성 오류:", err);
      setIsLoading(false);
      setError(
        err instanceof Error
          ? err.message
          : "문제가 발생했어요. 다시 시도해주세요."
      );
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
  };

  const renderStep = () => {
    switch (currentStepId) {
      case "nickname":
        return (
          <NicknameStep
            value={data.nickname}
            onChange={(v) => updateField("nickname", v)}
            onSubmit={next}
          />
        );
      case "goalSelection":
        return (
          <GoalSelectionStep
            goalActivities={data.goalActivities}
            specificGoals={data.specificGoals}
            onActivitiesChange={(v) => updateField("goalActivities", v as GoalActivity[])}
            onSpecificGoalsChange={(v) => updateField("specificGoals", v)}
          />
        );
      case "healthSafety":
        return (
          <HealthSafetyStep
            activityLevel={data.activityLevel}
            conditions={data.conditions}
            customCondition={data.customCondition}
            acsmSymptoms={data.acsmSymptoms}
            painAreas={data.painAreas}
            customPainArea={data.customPainArea}
            freeNote={data.freeNote}
            onActivityLevelChange={(v: ActivityLevel) => {
              updateField("activityLevel", v);
            }}
            onConditionsChange={(v) => updateField("conditions", v)}
            onCustomConditionChange={(v) => updateField("customCondition", v)}
            onAcsmSymptomsChange={(v) => {
              updateField("acsmSymptoms", v);
              // ACSM 위험도 즉시 재계산
              const risk = classifyAcsmRisk({
                activityLevel: data.activityLevel,
                conditions: data.conditions,
                acsmSymptoms: v,
              });
              updateField("acsmRiskLevel", risk);
            }}
            onPainAreasChange={(v) => updateField("painAreas", v)}
            onCustomPainAreaChange={(v) => updateField("customPainArea", v)}
            onFreeNoteChange={(v) => updateField("freeNote", v)}
          />
        );
      case "gender":
        return (
          <GenderStep
            value={data.gender}
            onChange={(v) => {
              updateField("gender", v);
              autoAdvanceAfter(next);
            }}
          />
        );
      case "vitals":
        return (
          <VitalsStep
            birthYear={data.birthYear}
            height={data.height}
            weight={data.weight}
            onBirthYearChange={(v) => updateField("birthYear", v)}
            onHeightChange={(v) => updateField("height", v)}
            onWeightChange={(v) => updateField("weight", v)}
          />
        );
      case "trackSelection":
        return (
          <TrackSelectionStep
            value={data.track}
            onChange={(v) => updateField("track", v)}
          />
        );

      case "sportSelection":
        return (
          <SportSelectionStep
            selected={data.sports}
            onChange={(v) => updateField("sports", v)}
          />
        );
      case "performanceConcern":
        return (
          <PerformanceConcernStep
            sports={data.sports}
            selected={data.performanceConcerns}
            customConcern={data.customPerformanceConcern}
            onChange={(v) => updateField("performanceConcerns", v)}
            onCustomConcernChange={(v) => updateField("customPerformanceConcern", v)}
          />
        );
      case "fitnessCheck":
        return (
          <FitnessCheckStep
            flexibilityLevel={data.flexibilityLevel}
            lowerStrengthLevel={data.lowerStrengthLevel}
            balanceLevel={data.balanceLevel}
            onFlexibilityChange={(v) => updateField("flexibilityLevel", v as FitnessLevel)}
            onStrengthChange={(v) => updateField("lowerStrengthLevel", v as FitnessLevel)}
            onBalanceChange={(v) => updateField("balanceLevel", v as FitnessLevel)}
          />
        );

      case "conditions":
        return (
          <MedicalStep
            selected={data.conditions}
            customCondition={data.customCondition}
            onChange={(v) => updateField("conditions", v)}
            onCustomChange={(v) => updateField("customCondition", v)}
          />
        );
      case "sarcf":
        return (
          <SarcfStep
            sarcfLift={data.sarcfLift}
            sarcfChair={data.sarcfChair}
            sarcfStair={data.sarcfStair}
            sarcfFall={data.sarcfFall}
            onLiftChange={(v) => updateField("sarcfLift", v)}
            onChairChange={(v) => updateField("sarcfChair", v)}
            onStairChange={(v) => updateField("sarcfStair", v)}
            onFallChange={(v) => updateField("sarcfFall", v)}
          />
        );

      case "painAreas":
        return (
          <PainAreaStep
            selected={data.painAreas}
            customPainArea={data.customPainArea}
            onChange={(v) => updateField("painAreas", v)}
            onCustomPainAreaChange={(v) => updateField("customPainArea", v)}
          />
        );
      case "motivationEnv":
        return (
          <MotivationEnvStep
            motivation={data.motivation}
            customMotivation={data.customMotivation}
            environment={data.environment}
            customEnvironment={data.customEnvironment}
            onMotivationChange={(v) => updateField("motivation", v)}
            onCustomMotivationChange={(v) => updateField("customMotivation", v)}
            onEnvironmentChange={(v) => updateField("environment", v)}
            onCustomEnvironmentChange={(v) => updateField("customEnvironment", v)}
          />
        );
      case "exerciseHistoryTime":
        return (
          <ExerciseHistoryTimeStep
            exerciseHistory={data.exerciseHistory}
            customExerciseHistory={data.customExerciseHistory}
            availableTime={data.availableTime}
            onHistoryChange={(v) => updateField("exerciseHistory", v)}
            onCustomHistoryChange={(v) => updateField("customExerciseHistory", v)}
            onTimeChange={(v) => updateField("availableTime", v)}
          />
        );

      default:
        return null;
    }
  };

  // 챕터 기반 프로그레스
  const chapterProgress = chapter.total > 0 ? (chapter.current / chapter.total) * 100 : 0;

  return (
    <>
      <LoadingScreen nickname={data.nickname} isVisible={isLoading} />

      {/* Vision Camera Step - 마지막 스텝 완료 후 오버레이 */}
      <AnimatePresence>
        {showVisionStep && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed inset-0 z-50 bg-bg-page flex flex-col overflow-y-auto"
          >
            <div className="sticky top-0 z-40 bg-bg-page/80 backdrop-blur-xl">
              <div className="flex items-center h-[52px] px-4">
                <button
                  onClick={() => setShowVisionStep(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-bg-warm transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div className="flex-1 text-center">
                  <span className="text-[15px] font-semibold text-text-secondary">체형·자세 검사</span>
                </div>
                <div className="w-10" />
              </div>
              <div className="h-[2px] bg-primary" />
            </div>
            <div className="flex-1 px-5 py-6">
              <VisionCameraStep onComplete={handleVisionComplete} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col min-h-dvh bg-bg-page">
        {/* Header with chapter-based progress */}
        <div className="sticky top-0 z-40 bg-bg-page/80 backdrop-blur-xl">
          <div className="flex items-center h-[52px] px-4">
            {!isFirstStep ? (
              <button
                onClick={back}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-bg-warm transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ) : (
              <div className="w-10" />
            )}
            <div className="flex-1 text-center">
              <span className="text-[15px] font-semibold text-text-secondary">
                {chapter.name}
              </span>
            </div>
            <div className="w-10 flex items-center justify-center">
              <span className="text-[17px] font-bold text-text-primary">{chapter.current}</span>
              <span className="text-[13px] text-text-disabled"> / {chapter.total}</span>
            </div>
          </div>

          {/* Thin progress bar (chapter-scoped) */}
          <div className="h-[2px] bg-border-card">
            <motion.div
              className="h-full bg-primary"
              initial={false}
              animate={{ width: `${chapterProgress}%` }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 px-5 py-4 overflow-y-auto overflow-x-hidden relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStepId}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Error */}
        {error && (
          <div className="px-5 pb-2">
            <div className="p-5 rounded-2xl bg-danger/5">
              <p className="text-[15px] text-danger font-medium">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  handleSubmit();
                }}
                className="mt-4 w-full py-3 rounded-xl bg-danger text-white text-[15px] font-bold active:opacity-80 transition-opacity"
              >
                다시 시도하기
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="px-5 pb-8 pt-4">
          {isLastStep ? (
            <Button
              size="large"
              onClick={handleSubmit}
              disabled={!canProceed}
              isLoading={isLoading}
            >
              맞춤 프로그램 만들어볼까요?
            </Button>
          ) : (
            <>
              <Button onClick={next} disabled={!canProceed}>
                다음으로 갈게요
              </Button>
              {(currentStepId === "fitnessCheck" || currentStepId === "sarcf") && (
                <button
                  onClick={skipStep}
                  className="w-full mt-3 py-3 text-[15px] text-text-caption font-medium active:text-text-secondary transition-colors"
                >
                  건너뛰기
                  <span className="block text-[13px] text-text-disabled font-normal mt-0.5">
                    이 검사를 건너뛰면 운동 플랜의 정확도가 낮아져요
                  </span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
