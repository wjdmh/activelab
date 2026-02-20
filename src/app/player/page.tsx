"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/Button";
import { useAssessmentStore } from "@/stores/useAssessmentStore";
import { useWorkoutStore } from "@/stores/useWorkoutStore";
import { useHydration } from "@/hooks/useHydration";
import { PageSkeleton } from "@/components/ui/Skeleton";

const ENCOURAGEMENTS = [
  "정말 대단해요! 💪",
  "오늘도 최선을 다했어요!",
  "꾸준함이 실력이에요! 🔥",
  "몸이 점점 좋아지고 있어요!",
  "프로 선수 못지않아요! ⭐",
];

const BONUS_EXERCISES = [
  { name: "플랭크 30초", description: "팔꿈치를 바닥에 대고 몸을 일직선으로 유지", targetArea: "코어", sets: 2, reps: 1 },
  { name: "스쿼트 10회", description: "무릎이 발끝을 넘지 않게 천천히 앉았다 일어서기", targetArea: "하체", sets: 2, reps: 10 },
  { name: "어깨 스트레칭", description: "한 팔을 반대쪽으로 당기며 어깨 근육 이완", targetArea: "어깨", sets: 2, reps: 10 },
  { name: "종아리 스트레칭", description: "벽에 손을 짚고 한 발씩 뒤로 빼서 스트레칭", targetArea: "하체", sets: 2, reps: 10 },
];

function getDefaultSteps(exerciseName: string) {
  return [
    { title: "준비 자세를 잡으세요", description: "발을 어깨너비로 벌리고 편안하게 서주세요." },
    { title: "천천히 동작을 시작하세요", description: `${exerciseName}을 호흡에 맞춰 천천히 수행합니다.` },
    { title: "반복하세요", description: "무리하지 않는 범위에서 정해진 횟수만큼 반복합니다." },
  ];
}

function PlayerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hydrated = useHydration();
  const result = useAssessmentStore((s) => s.result);
  const setTodayWorkoutCompleted = useAssessmentStore((s) => s.setTodayWorkoutCompleted);
  const incrementStreak = useAssessmentStore((s) => s.incrementStreak);
  const markTodayInCalendar = useAssessmentStore((s) => s.markTodayInCalendar);
  const completeBonusWorkout = useAssessmentStore((s) => s.completeBonusWorkout);
  const weeklyPlan = useWorkoutStore((s) => s.weeklyPlan);
  const completeExercise = useWorkoutStore((s) => s.completeExercise);

  const source = searchParams.get("source");
  const idx = parseInt(searchParams.get("idx") || "0", 10);
  const dayIndex = parseInt(searchParams.get("day") || "0", 10);
  const exerciseIndex = parseInt(searchParams.get("ex") || "0", 10);

  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [encouragement] = useState(() => ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]);
  // 보너스 운동
  const [showBonusChallenge, setShowBonusChallenge] = useState(false);
  const [bonusExercise, setBonusExercise] = useState<typeof BONUS_EXERCISES[0] | null>(null);
  const [bonusCompleted, setBonusCompleted] = useState(false);

  if (!hydrated) return <PageSkeleton />;

  let exercise: {
    id?: string;
    name: string;
    description: string;
    targetArea: string;
    sets: number;
    reps: number;
    benefit?: string;
    safetyNote?: string;
  } | null = null;

  let totalRecommendations = 0;

  if (source === "report" && result?.recommendations) {
    const rec = result.recommendations[idx];
    totalRecommendations = result.recommendations.length;
    if (rec) {
      exercise = {
        id: rec.id,
        name: rec.name,
        description: rec.description,
        targetArea: rec.targetArea,
        sets: rec.sets,
        reps: rec.reps,
        benefit: rec.benefit,
      };
    }
  } else if (weeklyPlan) {
    const todayPlan = weeklyPlan.weeklyPlan?.[dayIndex];
    const ex = todayPlan?.exercises?.[exerciseIndex];
    if (ex) {
      exercise = {
        id: ex.id,
        name: ex.name,
        description: ex.description,
        targetArea: ex.targetArea,
        sets: ex.sets,
        reps: ex.reps,
        benefit: ex.benefit,
        safetyNote: ex.safetyNote,
      };
    }
  }

  if (!exercise) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh px-5">
        <p className="text-[15px] text-text-caption mb-4">운동 정보를 찾을 수 없어요</p>
        <Button variant="ghost" onClick={() => router.back()}>돌아가기</Button>
      </div>
    );
  }

  const steps = getDefaultSteps(exercise.name);
  const difficulty = exercise.sets <= 2 ? "하" : exercise.sets <= 3 ? "중" : "상";
  const estimatedMin = Math.max(2, Math.round(exercise.sets * 1.5));

  const handleComplete = () => {
    if (source !== "report" && exercise?.id) {
      completeExercise(dayIndex, exercise.id);
    }
    setCompleted(true);
  };

  const handleNext = () => {
    if (source === "report" && result?.recommendations) {
      const nextIdx = idx + 1;
      if (nextIdx < result.recommendations.length) {
        router.replace(`/player?source=report&idx=${nextIdx}`);
        setCompleted(false);
        setCurrentStep(0);
        return;
      }
    }
    // All exercises done
    setAllDone(true);
    setTodayWorkoutCompleted(true);
    incrementStreak();
    markTodayInCalendar();
  };

  const handleGoHome = () => {
    router.push("/");
  };

  const handleBonusStart = () => {
    const randomEx = BONUS_EXERCISES[Math.floor(Math.random() * BONUS_EXERCISES.length)];
    setBonusExercise(randomEx);
    setShowBonusChallenge(true);
  };

  const handleBonusComplete = () => {
    completeBonusWorkout();
    setBonusCompleted(true);
  };

  return (
    <div className="flex flex-col min-h-dvh bg-[#0F172A]">
      {/* All Done Celebration */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-gradient-to-b from-[#0F172A] to-[#1E293B] flex flex-col items-center justify-center px-8"
          >
            {!showBonusChallenge ? (
              <>
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 10, stiffness: 100 }}
                  className="text-[80px] mb-6"
                >
                  🎉
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-[28px] font-black text-white text-center tracking-tight mb-2"
                >
                  오늘 운동 완료!
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-[16px] text-white/70 text-center mb-2"
                >
                  {encouragement}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-[14px] text-white/50 text-center mb-8"
                >
                  내일도 함께해요, 꾸준함이 최고의 무기예요
                </motion.p>

                {/* 보너스 운동 도전 버튼 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="w-full max-w-[300px] space-y-3"
                >
                  <button
                    onClick={handleBonusStart}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF9500] to-[#FF6B00] text-white text-[17px] font-bold tracking-tight active:brightness-95 transition-all flex items-center justify-center gap-2"
                  >
                    <span>⚡</span> 보너스 운동 도전하기
                  </button>
                  <button
                    onClick={handleGoHome}
                    className="w-full py-4 rounded-2xl bg-white text-[#0F172A] text-[17px] font-bold tracking-tight active:brightness-95 transition-all"
                  >
                    홈으로 돌아가기
                  </button>
                </motion.div>
              </>
            ) : !bonusCompleted ? (
              <>
                {/* 보너스 운동 진행 화면 */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full max-w-[320px]"
                >
                  <div className="text-center mb-6">
                    <span className="text-[48px]">⚡</span>
                    <h2 className="text-[22px] font-black text-white mt-3 tracking-tight">보너스 도전!</h2>
                    <p className="text-[14px] text-white/60 mt-1">추가 운동으로 체력 점수를 올려보세요</p>
                  </div>

                  {bonusExercise && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 mb-6">
                      <h3 className="text-[18px] font-bold text-white mb-1">{bonusExercise.name}</h3>
                      <p className="text-[14px] text-white/60 mb-3">{bonusExercise.description}</p>
                      <div className="flex gap-3">
                        <span className="text-[13px] text-white/50 bg-white/10 px-3 py-1 rounded-full">{bonusExercise.targetArea}</span>
                        <span className="text-[13px] text-white/50 bg-white/10 px-3 py-1 rounded-full">{bonusExercise.sets}세트 {bonusExercise.reps}회</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleBonusComplete}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF9500] to-[#FF6B00] text-white text-[17px] font-bold tracking-tight active:brightness-95 transition-all mb-3"
                  >
                    완료했어요! ✅
                  </button>
                  <button
                    onClick={handleGoHome}
                    className="w-full py-3 text-[15px] text-white/50 font-medium"
                  >
                    나중에 할게요
                  </button>
                </motion.div>
              </>
            ) : (
              <>
                {/* 보너스 완료 */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 10 }}
                  className="text-[80px] mb-6"
                >
                  🏆
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-[28px] font-black text-white text-center tracking-tight mb-2"
                >
                  보너스 달성!
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-[14px] text-[#FF9500] font-bold mb-1"
                >
                  체력 점수 +0.3점 획득!
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-[14px] text-white/50 text-center mb-8"
                >
                  추가 노력이 몸을 더 강하게 만들어요
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="w-full max-w-[300px] space-y-3"
                >
                  <button
                    onClick={() => {
                      setBonusCompleted(false);
                      handleBonusStart();
                    }}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF9500] to-[#FF6B00] text-white text-[17px] font-bold tracking-tight active:brightness-95 transition-all flex items-center justify-center gap-2"
                  >
                    <span>⚡</span> 하나 더 도전!
                  </button>
                  <button
                    onClick={handleGoHome}
                    className="w-full py-4 rounded-2xl bg-white text-[#0F172A] text-[17px] font-bold tracking-tight active:brightness-95 transition-all"
                  >
                    홈으로 돌아가기
                  </button>
                </motion.div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video area */}
      <div className="relative aspect-video bg-gradient-to-b from-[#1E293B] to-[#0F172A] flex items-center justify-center">
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center z-10"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 19l-7-7 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Progress indicator */}
        {source === "report" && totalRecommendations > 1 && (
          <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm">
            <span className="text-[13px] font-semibold text-white">{idx + 1}/{totalRecommendations}</span>
          </div>
        )}

        <motion.button
          whileTap={{ scale: 0.9 }}
          className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30"
        >
          <svg width="28" height="28" viewBox="0 0 20 20" fill="none">
            <path d="M6 4l10 6-10 6V4z" fill="white" />
          </svg>
        </motion.button>

        <p className="absolute bottom-4 text-[13px] text-white/50">영상 준비 중</p>
      </div>

      {/* Content */}
      <div className="flex-1 bg-bg-primary rounded-t-3xl -mt-4 relative z-10 px-5 pt-6 pb-8">
        {/* Tags */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[12px] font-semibold text-primary bg-primary/8 px-2.5 py-1 rounded-full">
            {exercise.targetArea}
          </span>
          <span className="text-[12px] text-text-caption">⏱ {estimatedMin}분</span>
          <span className="text-[12px] text-text-caption">🔥 난이도 {difficulty}</span>
        </div>

        {/* Title */}
        <h1 className="text-[22px] font-bold text-text-primary tracking-tight leading-tight mb-1">
          {exercise.name}
        </h1>
        {exercise.benefit && (
          <p className="text-[14px] text-text-caption mb-6">{exercise.benefit}</p>
        )}

        {/* Step guide */}
        <div className="space-y-4 mb-8">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className={`flex gap-3 p-4 rounded-2xl transition-colors cursor-pointer ${
                currentStep === i ? "bg-primary/5 border border-primary/15" : "bg-bg-warm"
              }`}
              onClick={() => setCurrentStep(i)}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[13px] font-bold ${
                currentStep === i ? "bg-primary text-white" : "bg-border-card text-text-caption"
              }`}>
                {i + 1}
              </div>
              <div>
                <p className={`text-[15px] font-semibold ${currentStep === i ? "text-text-primary" : "text-text-secondary"}`}>
                  {s.title}
                </p>
                <p className="text-[13px] text-text-caption mt-0.5 leading-relaxed">{s.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Safety note */}
        {exercise.safetyNote && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-warning-light/60 mb-6">
            <span className="text-[16px]">⚠️</span>
            <p className="text-[13px] text-warning leading-relaxed font-medium">{exercise.safetyNote}</p>
          </div>
        )}

        {/* Complete button */}
        <AnimatePresence mode="wait">
          {completed ? (
            <motion.div key="completed" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10 }}
                className="text-[48px] mb-3"
              >
                ✅
              </motion.div>
              <p className="text-[18px] font-bold text-success mb-1">{encouragement}</p>
              <p className="text-[13px] text-text-caption mb-5">
                {source === "report" && result?.recommendations && idx + 1 < result.recommendations.length
                  ? `다음 운동으로 넘어갈까요? (${idx + 1}/${totalRecommendations})`
                  : "모든 운동을 마쳤어요!"}
              </p>
              <Button onClick={handleNext}>
                {source === "report" && result?.recommendations && idx + 1 < result.recommendations.length
                  ? "다음 운동 →"
                  : "운동 완료! 🎉"}
              </Button>
            </motion.div>
          ) : (
            <motion.div key="action">
              <Button onClick={handleComplete}>완료했어요!</Button>
              <p className="text-[12px] text-text-caption text-center mt-2">
                {exercise.sets}세트 · {exercise.reps}회
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function PlayerPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PlayerContent />
    </Suspense>
  );
}
