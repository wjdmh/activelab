"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useWorkoutStore } from "@/stores/useWorkoutStore";
import { useUserStore } from "@/stores/useUserStore";
import { useWorkoutVoice } from "@/hooks/useWorkoutVoice";
import { WorkoutTimer } from "./WorkoutTimer";
import { PostWorkoutFeedback } from "./PostWorkoutFeedback";
import { RPE_LEVELS } from "@/lib/constants";
import type { RPELevel } from "@/types/workout";

interface GuidedWorkoutSessionProps {
  isVisible: boolean;
  onClose: () => void;
}

const TYPE_STYLES: Record<string, { bg: string; text: string }> = {
  "근력(Power)": { bg: "bg-red-50", text: "text-red-600" },
  "유산소": { bg: "bg-orange-50", text: "text-orange-600" },
  "유연성": { bg: "bg-emerald-50", text: "text-emerald-600" },
  "균형": { bg: "bg-violet-50", text: "text-violet-600" },
};

const ORDINALS = ["첫 번째", "두 번째", "세 번째", "네 번째", "다섯 번째", "여섯 번째", "일곱 번째", "여덟 번째"];

function getOrdinal(index: number): string {
  return ORDINALS[index] || `${index + 1}번째`;
}

// Shared transition config for phase animations
const phaseTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
};

export function GuidedWorkoutSession({
  isVisible,
  onClose,
}: GuidedWorkoutSessionProps) {
  const activeSession = useWorkoutStore((s) => s.activeSession);
  const weeklyPlan = useWorkoutStore((s) => s.weeklyPlan);
  const advanceSet = useWorkoutStore((s) => s.advanceSet);
  const setSessionPhase = useWorkoutStore((s) => s.setSessionPhase);
  const completeExerciseInSession = useWorkoutStore((s) => s.completeExerciseInSession);
  const finishSession = useWorkoutStore((s) => s.finishSession);
  const cancelSession = useWorkoutStore((s) => s.cancelSession);
  const getStreak = useWorkoutStore((s) => s.getStreak);
  const getDayCompletedCount = useWorkoutStore((s) => s.getDayCompletedCount);
  const profile = useUserStore((s) => s.profile);

  const [selectedRPE, setSelectedRPE] = useState<RPELevel | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const voice = useWorkoutVoice();
  const prevPhaseRef = useRef<string>("");
  const prevExerciseIdxRef = useRef<number>(-1);

  // ── TTS 페이즈 연동 (State Machine) ──
  useEffect(() => {
    if (!isVisible || !activeSession || !weeklyPlan || !voiceEnabled) return;
    const dayPlan = weeklyPlan.weeklyPlan?.[activeSession.dayIndex];
    const exercises = dayPlan?.exercises ?? [];
    const currentEx = exercises[activeSession.exerciseIndex];
    const { phase, currentSet, exerciseIndex } = activeSession;
    const phaseKey = `${phase}-${exerciseIndex}-${currentSet}`;

    if (prevPhaseRef.current === phaseKey) return;
    prevPhaseRef.current = phaseKey;

    switch (phase) {
      case "instructing":
        if (currentEx) voice.speakInstruction(currentEx.name, currentEx.description);
        break;
      case "active":
        if (currentEx && prevExerciseIdxRef.current !== exerciseIndex) {
          prevExerciseIdxRef.current = exerciseIndex;
          voice.speakDetecting(currentEx.name, currentEx.reps);
        }
        break;
      case "resting":
        if (currentEx) voice.speakSetSuccess(currentSet, currentEx.sets);
        break;
      case "exercise-done": {
        const doneEx = exercises[exerciseIndex - 1] ?? currentEx;
        const nextEx = exercises[exerciseIndex];
        if (doneEx) {
          if (nextEx) {
            voice.speakExerciseDone(doneEx.name);
            setTimeout(() => voice.speakNextExercise(nextEx.name), 3500);
          } else {
            voice.speakExerciseDone(doneEx.name);
          }
        }
        break;
      }
      case "complete":
        voice.speakAllDone();
        break;
      default:
        break;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSession?.phase, activeSession?.exerciseIndex, activeSession?.currentSet, isVisible, voiceEnabled]);

  if (!isVisible || !activeSession || !weeklyPlan) return null;

  const dayPlan = weeklyPlan.weeklyPlan?.[activeSession.dayIndex];
  const exercises = dayPlan?.exercises ?? [];
  const totalExercises = exercises.length;
  const currentExercise = exercises[activeSession.exerciseIndex];
  const { phase, currentSet, exerciseIndex } = activeSession;

  // For exercise-done phase, the exerciseIndex has already been advanced
  // so look back at the previous exercise for the "done" message
  const completedExercise = phase === "exercise-done"
    ? exercises[exerciseIndex - 1] ?? currentExercise
    : currentExercise;

  const handleClose = () => {
    cancelSession();
    onClose();
  };

  const handleSetComplete = () => {
    if (!currentExercise) return;
    if (currentSet < currentExercise.sets) {
      setSessionPhase("resting");
    } else {
      completeExerciseInSession();
    }
  };

  const handleRestSkip = () => {
    advanceSet();
  };

  const handleRestComplete = () => {
    advanceSet();
  };

  const handleNextExercise = () => {
    setSessionPhase("instructing");
  };

  const handleRPESelect = (level: RPELevel) => {
    setSelectedRPE(level);
    // Log RPE but keep session alive for feedback
    setSessionPhase("feedback");
  };

  const handleFeedbackClose = () => {
    if (selectedRPE) {
      finishSession(selectedRPE);
    }
    setSelectedRPE(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] bg-bg-primary flex flex-col overflow-y-auto"
        >
          {/* Header - close + voice toggle */}
          {phase !== "complete" && (
            <div className="flex items-center justify-between px-5 pt-4 pb-2 flex-shrink-0">
              {/* Voice toggle */}
              <button
                onClick={() => {
                  setVoiceEnabled((v) => !v);
                  if (voiceEnabled) voice.stop();
                }}
                className={`flex items-center gap-1.5 px-3 h-9 rounded-full text-[13px] font-semibold transition-colors ${
                  voiceEnabled
                    ? "bg-primary/10 text-primary"
                    : "bg-bg-warm text-text-caption"
                }`}
                aria-label="음성 가이드 토글"
              >
                <span>{voiceEnabled ? "🔊" : "🔇"}</span>
                <span>{voiceEnabled ? "음성 ON" : "음성 OFF"}</span>
              </button>

              <button
                onClick={handleClose}
                className="w-11 h-11 flex items-center justify-center rounded-full bg-bg-warm active:bg-border-card transition-colors"
                aria-label="운동 종료"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M5 5l10 10M15 5L5 15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="text-text-caption"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Phase content */}
          <div className="flex-1 flex flex-col px-6 pb-8">
            <AnimatePresence mode="wait">
              {/* ===== INSTRUCTING PHASE (사전 안내) ===== */}
              {phase === "instructing" && currentExercise && (
                <motion.div
                  key={`instructing-${exerciseIndex}`}
                  {...phaseTransition}
                  className="flex-1 flex flex-col"
                >
                  <div className="mb-4">
                    <p className="text-[15px] text-text-caption font-medium">
                      운동 {exerciseIndex + 1} / {totalExercises} — 사전 안내
                    </p>
                  </div>

                  {/* 타입 배지 */}
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {currentExercise.type && (
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[14px] font-semibold ${
                          (TYPE_STYLES[currentExercise.type] ?? { bg: "bg-primary-50", text: "text-primary" }).bg
                        } ${
                          (TYPE_STYLES[currentExercise.type] ?? { bg: "bg-primary-50", text: "text-primary" }).text
                        }`}
                      >
                        {currentExercise.type}
                      </span>
                    )}
                    <span className="inline-block px-3 py-1 rounded-full bg-primary-50 text-primary text-[14px] font-semibold">
                      {currentExercise.targetArea}
                    </span>
                  </div>

                  {/* 운동명 */}
                  <h1 className="text-[26px] font-bold text-text-primary leading-tight tracking-tight mb-3">
                    {currentExercise.name}
                  </h1>

                  {/* 동작 설명 카드 */}
                  <div className="p-5 rounded-2xl bg-bg-warm mb-4">
                    <p className="text-[13px] font-semibold text-text-caption mb-2 uppercase tracking-wider">
                      동작 설명
                    </p>
                    <p className="text-[17px] text-text-primary leading-relaxed">
                      {currentExercise.description}
                    </p>
                  </div>

                  {/* 목표 효과 */}
                  {currentExercise.benefit && (
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary-50/60 mb-3">
                      <span className="text-[17px] flex-shrink-0">💪</span>
                      <p className="text-[15px] text-primary font-medium leading-snug">
                        {currentExercise.benefit}
                      </p>
                    </div>
                  )}

                  {/* 안전 주의 */}
                  {currentExercise.safetyNote && (
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-warning-light mb-4">
                      <span className="text-[17px] flex-shrink-0">⚠️</span>
                      <p className="text-[15px] text-text-secondary font-medium leading-snug">
                        {currentExercise.safetyNote}
                      </p>
                    </div>
                  )}

                  {/* 세트/횟수 */}
                  <div className="flex gap-2 flex-wrap mb-8">
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-bg-warm">
                      <span className="text-[14px] text-text-caption">세트</span>
                      <span className="text-[17px] font-bold text-text-primary">{currentExercise.sets}세트</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-bg-warm">
                      <span className="text-[14px] text-text-caption">반복</span>
                      <span className="text-[17px] font-bold text-text-primary">{currentExercise.reps}회</span>
                    </div>
                  </div>

                  {/* 시작 버튼 */}
                  <div className="mt-auto">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      onClick={() => setSessionPhase("intro")}
                      className="w-full min-h-[60px] px-8 text-[18px] font-bold rounded-2xl bg-gradient-to-b from-primary to-[#E84A10] text-white shadow-button active:shadow-none active:translate-y-[1px] transition-all"
                    >
                      동작 익혔어요, 시작할게요!
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ===== INTRO PHASE ===== */}
              {phase === "intro" && currentExercise && (
                <motion.div
                  key={`intro-${exerciseIndex}`}
                  {...phaseTransition}
                  className="flex-1 flex flex-col"
                >
                  {/* Header */}
                  <div className="mb-6">
                    <p className="text-[15px] text-text-caption font-medium">
                      운동 {exerciseIndex + 1} / {totalExercises}
                    </p>
                  </div>

                  {/* Type badge + target area */}
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {currentExercise.type && (
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[14px] font-semibold ${
                          (TYPE_STYLES[currentExercise.type] ?? { bg: "bg-primary-50", text: "text-primary" }).bg
                        } ${
                          (TYPE_STYLES[currentExercise.type] ?? { bg: "bg-primary-50", text: "text-primary" }).text
                        }`}
                      >
                        {currentExercise.type}
                      </span>
                    )}
                    <span className="inline-block px-3 py-1 rounded-full bg-primary-50 text-primary text-[14px] font-semibold">
                      {currentExercise.targetArea}
                    </span>
                  </div>

                  {/* Exercise name */}
                  <h1 className="text-[24px] font-bold text-text-primary leading-tight tracking-tight mb-4">
                    {currentExercise.name}
                  </h1>

                  {/* Description */}
                  <p className="text-[17px] text-text-secondary leading-relaxed mb-6">
                    {currentExercise.description}
                  </p>

                  {/* Safety note */}
                  {currentExercise.safetyNote && (
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-warning-light mb-3">
                      <span className="text-[17px] flex-shrink-0 mt-0.5">&#x26A0;&#xFE0F;</span>
                      <p className="text-[16px] text-text-secondary font-medium leading-snug">
                        {currentExercise.safetyNote}
                      </p>
                    </div>
                  )}

                  {/* Support note */}
                  {currentExercise.requiresSupport && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary-50/60 mb-3">
                      <span className="text-[17px]">&#x1FA91;</span>
                      <p className="text-[16px] text-primary font-medium">
                        의자나 벽을 잡고 하세요
                      </p>
                    </div>
                  )}

                  {/* Metrics */}
                  <div className="flex gap-2 flex-wrap mb-8">
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-bg-warm">
                      <span className="text-[14px] text-text-caption">세트</span>
                      <span className="text-[17px] font-bold text-text-primary">
                        {currentExercise.sets}세트
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-bg-warm">
                      <span className="text-[14px] text-text-caption">반복</span>
                      <span className="text-[17px] font-bold text-text-primary">
                        {currentExercise.reps}회
                      </span>
                    </div>
                    {currentExercise.restSeconds > 0 && (
                      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-bg-warm">
                        <span className="text-[14px] text-text-caption">쉬기</span>
                        <span className="text-[17px] font-bold text-text-primary">
                          {currentExercise.restSeconds}초
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Start button */}
                  <div className="mt-auto">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      onClick={() => setSessionPhase("active")}
                      className="w-full min-h-[60px] px-8 text-[18px] font-bold rounded-2xl bg-gradient-to-b from-primary to-[#E84A10] text-white shadow-button active:shadow-none active:translate-y-[1px] transition-all"
                    >
                      시작해볼까요?
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ===== ACTIVE PHASE ===== */}
              {phase === "active" && currentExercise && (
                <motion.div
                  key={`active-${exerciseIndex}-${currentSet}`}
                  {...phaseTransition}
                  className="flex-1 flex flex-col"
                >
                  {/* Header */}
                  <div className="mb-8">
                    <p className="text-[15px] text-text-caption font-medium">
                      운동 {exerciseIndex + 1}/{totalExercises}
                      <span className="mx-2 text-border-card">|</span>
                      세트 {currentSet}/{currentExercise.sets}
                    </p>
                  </div>

                  {/* Exercise name */}
                  <h2 className="text-[22px] font-bold text-text-primary leading-tight tracking-tight mb-8">
                    {currentExercise.name}
                  </h2>

                  {/* Center: reps display */}
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="text-center mb-8">
                      <p className="text-[36px] font-bold text-primary leading-none mb-2">
                        {currentExercise.reps}회
                      </p>
                      <p className="text-[20px] text-text-secondary font-medium">
                        반복하세요
                      </p>
                    </div>

                    {/* Benefit */}
                    {currentExercise.benefit && (
                      <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary-50/60 w-full max-w-sm">
                        <span className="text-[17px] flex-shrink-0 mt-0.5">&#x1F4AA;</span>
                        <p className="text-[16px] text-primary font-medium leading-snug">
                          {currentExercise.benefit}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Set complete button */}
                  <div className="mt-auto">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      onClick={handleSetComplete}
                      className="w-full min-h-[60px] px-8 text-[18px] font-bold rounded-2xl bg-gradient-to-b from-success to-[#1AB88A] text-white shadow-[0_4px_14px_rgba(32,201,151,0.35)] active:shadow-none active:translate-y-[1px] transition-all"
                    >
                      세트 완료 &#x2713;
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ===== RESTING PHASE ===== */}
              {phase === "resting" && currentExercise && (
                <motion.div
                  key={`resting-${exerciseIndex}-${currentSet}`}
                  {...phaseTransition}
                  className="flex-1 flex flex-col"
                >
                  {/* Header */}
                  <div className="mb-6">
                    <p className="text-[15px] text-text-caption font-medium">
                      운동 {exerciseIndex + 1}/{totalExercises}
                      <span className="mx-2 text-border-card">|</span>
                      세트 {currentSet}/{currentExercise.sets} 완료
                    </p>
                  </div>

                  {/* Rest message */}
                  <h2 className="text-[24px] font-bold text-text-primary text-center tracking-tight mb-8">
                    잠시 쉬세요
                  </h2>

                  {/* Timer */}
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <WorkoutTimer
                      seconds={currentExercise.restSeconds}
                      onComplete={handleRestComplete}
                      size={180}
                    />

                    {/* Next set info */}
                    <p className="text-[17px] text-text-secondary font-medium mt-8">
                      다음: 세트 {currentSet + 1}/{currentExercise.sets}
                    </p>
                  </div>

                  {/* Skip button */}
                  <div className="mt-auto flex justify-center">
                    <button
                      onClick={handleRestSkip}
                      className="px-6 py-3 text-[17px] text-text-caption font-medium active:text-primary transition-colors"
                    >
                      건너뛰기
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ===== EXERCISE-DONE PHASE ===== */}
              {phase === "exercise-done" && (
                <motion.div
                  key={`done-${exerciseIndex}`}
                  {...phaseTransition}
                  className="flex-1 flex flex-col items-center justify-center"
                >
                  {/* Dot progress indicator */}
                  <div className="flex items-center gap-2 mb-10">
                    {exercises.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          idx < exerciseIndex
                            ? "bg-success"
                            : idx === exerciseIndex
                            ? "bg-primary"
                            : "bg-bg-warm"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Celebration */}
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="text-center mb-10"
                  >
                    <h2 className="text-[26px] font-bold text-text-primary tracking-tight mb-3">
                      잘하셨어요!
                    </h2>
                    <p className="text-[18px] text-text-secondary font-medium">
                      {getOrdinal(exerciseIndex - 1)} 운동 완료
                    </p>
                  </motion.div>

                  {/* Next exercise preview */}
                  {currentExercise && (
                    <div className="w-full max-w-sm p-5 rounded-2xl bg-bg-card shadow-card mb-10">
                      <p className="text-[14px] text-text-caption mb-2">다음 운동</p>
                      <p className="text-[20px] font-bold text-text-primary tracking-tight">
                        {currentExercise.name}
                      </p>
                      {currentExercise.type && (
                        <span
                          className={`inline-block mt-2 px-3 py-0.5 rounded-full text-[13px] font-semibold ${
                            (TYPE_STYLES[currentExercise.type] ?? { bg: "bg-primary-50", text: "text-primary" }).bg
                          } ${
                            (TYPE_STYLES[currentExercise.type] ?? { bg: "bg-primary-50", text: "text-primary" }).text
                          }`}
                        >
                          {currentExercise.type}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Next exercise button */}
                  <div className="w-full max-w-sm mt-auto">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      onClick={handleNextExercise}
                      className="w-full min-h-[60px] px-8 text-[18px] font-bold rounded-2xl bg-gradient-to-b from-primary to-[#E84A10] text-white shadow-button active:shadow-none active:translate-y-[1px] transition-all"
                    >
                      다음 운동 해볼까요?
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ===== COMPLETE PHASE ===== */}
              {phase === "complete" && (
                <motion.div
                  key="complete"
                  {...phaseTransition}
                  className="flex-1 flex flex-col items-center justify-center pt-8"
                >
                  {/* Celebration animation */}
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 250, damping: 15, delay: 0.1 }}
                    className="text-[64px] mb-6"
                  >
                    &#x1F389;
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center mb-4"
                  >
                    <h2 className="text-[26px] font-bold text-text-primary tracking-tight leading-snug mb-2">
                      오늘 운동 완료!
                    </h2>
                    <p className="text-[26px] font-bold text-primary tracking-tight">
                      정말 대단해요
                    </p>
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-[18px] text-text-secondary font-medium mb-10"
                  >
                    {totalExercises}개 운동 완료
                  </motion.p>

                  {/* RPE Selection */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="w-full max-w-sm"
                  >
                    <p className="text-[18px] font-bold text-text-primary text-center mb-6">
                      오늘 운동 어떠셨어요?
                    </p>

                    <div className="flex justify-between gap-1">
                      {RPE_LEVELS.map((rpe) => (
                        <motion.button
                          key={rpe.level}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => handleRPESelect(rpe.level)}
                          className="flex flex-col items-center gap-2 flex-1 p-3 rounded-2xl transition-all active:bg-primary-50"
                        >
                          <span className="text-[32px]">{rpe.emoji}</span>
                          <span className="text-[12px] text-text-caption font-medium leading-tight text-center">
                            {rpe.label}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* ===== FEEDBACK PHASE ===== */}
              {phase === "feedback" && selectedRPE && (
                <motion.div
                  key="feedback"
                  {...phaseTransition}
                  className="flex-1 flex flex-col"
                >
                  <PostWorkoutFeedback
                    nickname={profile?.nickname || ""}
                    rpe={selectedRPE}
                    exerciseCount={totalExercises}
                    theme={dayPlan?.theme || ""}
                    streak={getStreak()}
                    weeklyCompleted={(() => {
                      let count = 0;
                      for (let i = 0; i < 7; i++) {
                        if (getDayCompletedCount(i) > 0) count++;
                      }
                      return count;
                    })()}
                    weeklyTotal={weeklyPlan.weeklyPlan?.filter((d) => d.exercises.length > 0).length ?? 7}
                    onClose={handleFeedbackClose}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
