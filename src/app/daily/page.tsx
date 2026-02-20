"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAssessmentStore } from "@/stores/useAssessmentStore";
import { useUserStore } from "@/stores/useUserStore";
import { useHydration } from "@/hooks/useHydration";
import { useToast } from "@/components/ui/Toast";

const CONDITION_OPTIONS = [
  { id: "great", label: "개운해요!", desc: "오늘 컨디션 최고", emoji: "😄", bg: "bg-[#E8F5E9]", border: "border-[#4CAF50]/30", activeText: "text-[#2E7D32]" },
  { id: "normal", label: "평소와 같아요", desc: "무난한 컨디션", emoji: "😊", bg: "bg-[#FFF8E1]", border: "border-[#FF9800]/30", activeText: "text-[#E65100]" },
  { id: "sore", label: "좀 뻐근해요", desc: "가벼운 스트레칭 위주", emoji: "😫", bg: "bg-[#FFF3E0]", border: "border-[#FF5722]/30", activeText: "text-[#BF360C]" },
];

const TIME_OPTIONS = [
  { id: "10", label: "10분", emoji: "⚡" },
  { id: "20", label: "20분", emoji: "💪" },
  { id: "30", label: "30분 이상", emoji: "🔥" },
];

function getTodayLabel(): string {
  const now = new Date();
  const month = now.getMonth() + 1;
  const date = now.getDate();
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${month}월 ${date}일 (${days[now.getDay()]})`;
}

export default function DailyCheckinPage() {
  const hydrated = useHydration();
  const router = useRouter();
  const result = useAssessmentStore((s) => s.result);
  const hasCompleted = useUserStore((s) => s.hasCompletedAssessment);
  const toast = useToast((s) => s.toast);

  const [step, setStep] = useState<"condition" | "time" | "prescription">("condition");
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [aiRoutine, setAiRoutine] = useState<{
    name: string;
    description: string;
    targetArea: string;
    sets: number;
    reps: number;
    phase?: string;
    tips?: string;
  }[] | null>(null);
  const [coachExplanation, setCoachExplanation] = useState<string>("");
  const [routineLoading, setRoutineLoading] = useState(false);

  const shouldRedirect = hydrated && !result && !hasCompleted;

  useEffect(() => {
    if (shouldRedirect) router.replace("/");
  }, [shouldRedirect, router]);

  if (!hydrated || shouldRedirect) return null;

  const nickname = result?.profile?.nickname || "";
  const rawSportLabel = result?.profile?.sportLabel || "";
  const isNonExerciser = !rawSportLabel || rawSportLabel === "운동 안 함" || rawSportLabel === "none";
  const sportLabel = isNonExerciser ? "건강한 일상" : rawSportLabel;

  const handleConditionSelect = (conditionId: string) => {
    setSelectedCondition(conditionId);
    setTimeout(() => setStep("time"), 300);
  };

  const handleTimeSelect = async (timeId: string) => {
    setSelectedTime(timeId);
    setStep("prescription");
    setRoutineLoading(true);

    const conditionLabel = CONDITION_OPTIONS.find((o) => o.id === selectedCondition)?.label || "";
    const minutes = timeId === "10" ? 10 : timeId === "20" ? 20 : 30;
    const activityDesc = isNonExerciser ? "건강한 일상을 위한" : `${sportLabel}을 위한`;

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `오늘 컨디션: "${conditionLabel}", 가용 시간: ${minutes}분. ${activityDesc} 맞춤 루틴을 JSON으로 추천해주세요. 반드시 준비운동(warmup) → 본운동(main) → 마무리운동(cooldown) 순서로 구성하세요. 형식: {"explanation":"오늘 이 루틴을 구성한 이유를 1~2문장으로 설명","exercises":[{"name":"운동이름","description":"설명","targetArea":"부위","sets":3,"reps":10,"phase":"warmup|main|cooldown"}]}. 컨디션과 시간에 맞게 ${selectedCondition === "sore" ? "가벼운 스트레칭 위주로" : "적절한 강도로"} ${Math.floor(minutes / 8)}~${Math.floor(minutes / 5)}개 운동을 구성해주세요.`,
          nickname,
          context: { sport: sportLabel },
          history: [],
        }),
      });
      const data = await res.json();
      try {
        const cleaned = (data.reply || "").replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed)) {
          setAiRoutine(parsed);
        } else if (parsed.exercises && Array.isArray(parsed.exercises)) {
          setAiRoutine(parsed.exercises);
          if (parsed.explanation) setCoachExplanation(parsed.explanation);
        } else {
          throw new Error("invalid format");
        }
      } catch {
        setAiRoutine(getDefaultRoutine(selectedCondition || "normal", minutes));
        setCoachExplanation(getDefaultExplanation(selectedCondition || "normal", sportLabel));
      }
    } catch {
      setAiRoutine(getDefaultRoutine(selectedCondition || "normal", parseInt(timeId) || 20));
      setCoachExplanation(getDefaultExplanation(selectedCondition || "normal", sportLabel));
    } finally {
      setRoutineLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-dvh bg-bg-primary">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border-card/20">
        <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center -ml-1 rounded-xl active:bg-bg-warm transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 19l-7-7 7-7" stroke="#333D4B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="text-[16px] font-bold text-text-primary tracking-tight">운동 시작하기</span>
        <div className="w-9" />
      </header>

      <main className="flex-1 px-5 pt-4 pb-28">
        {/* Date */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-2">
          <p className="text-[14px] text-text-caption">{getTodayLabel()}</p>
        </motion.div>

        {/* Step 1: Condition */}
        <AnimatePresence mode="wait">
          {step === "condition" && (
            <motion.div key="condition" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <h1 className="text-[24px] font-bold text-text-primary tracking-tight leading-tight mb-6">
                오늘 <strong className="text-primary">컨디션</strong>은 어때요?
              </h1>
              <div className="space-y-3">
                {CONDITION_OPTIONS.map((option, i) => (
                  <motion.button
                    key={option.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    onClick={() => handleConditionSelect(option.id)}
                    className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${selectedCondition === option.id
                        ? `${option.bg} ${option.border}`
                        : "bg-bg-card border-border-card/50 shadow-card"
                      }`}
                  >
                    <span className="text-[36px] flex-shrink-0">{option.emoji}</span>
                    <div className="flex-1">
                      <span className={`text-[17px] font-bold block ${selectedCondition === option.id ? option.activeText : "text-text-primary"
                        }`}>
                        {option.label}
                      </span>
                      <span className="text-[13px] text-text-caption mt-0.5 block">{option.desc}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Available Time */}
          {step === "time" && (
            <motion.div key="time" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <h1 className="text-[24px] font-bold text-text-primary tracking-tight leading-tight mb-2">
                오늘 <strong className="text-primary">몇 분</strong> 운동할 수 있나요?
              </h1>
              <p className="text-[14px] text-text-caption mb-6">시간에 맞는 루틴을 만들어 드릴게요</p>

              <div className="space-y-3">
                {TIME_OPTIONS.map((option, i) => (
                  <motion.button
                    key={option.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    onClick={() => handleTimeSelect(option.id)}
                    className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${selectedTime === option.id
                        ? "bg-primary/5 border-primary/30"
                        : "bg-bg-card border-border-card/50 shadow-card"
                      }`}
                  >
                    <span className="text-[32px] flex-shrink-0">{option.emoji}</span>
                    <span className={`text-[17px] font-bold flex-1 ${selectedTime === option.id ? "text-primary" : "text-text-primary"
                      }`}>
                      {option.label}
                    </span>
                  </motion.button>
                ))}
              </div>

              <button onClick={() => { setStep("condition"); setSelectedCondition(null); }} className="mt-5 flex items-center gap-1 text-[14px] text-text-caption font-medium active:text-primary transition-colors min-h-[44px]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                이전 단계로
              </button>
            </motion.div>
          )}

          {/* Step 3: AI Prescription */}
          {step === "prescription" && (
            <motion.div key="prescription" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <h1 className="text-[24px] font-bold text-text-primary tracking-tight leading-tight mb-2">
                오늘의 <strong className="text-primary">맞춤 루틴</strong>
              </h1>
              <p className="text-[14px] text-text-caption mb-6">
                {CONDITION_OPTIONS.find((o) => o.id === selectedCondition)?.emoji}{" "}
                {CONDITION_OPTIONS.find((o) => o.id === selectedCondition)?.label} ·{" "}
                {TIME_OPTIONS.find((o) => o.id === selectedTime)?.label}
              </p>

              {routineLoading ? (
                <Card variant="elevated" className="flex flex-col items-center py-10">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                  <p className="text-[15px] font-semibold text-text-primary">AI가 루틴을 만들고 있어요...</p>
                  <p className="text-[13px] text-text-caption mt-1">컨디션과 시간에 맞게 구성 중</p>
                </Card>
              ) : aiRoutine && (
                <>
                  {/* 코치 설명 */}
                  {coachExplanation && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4"
                    >
                      <div className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary via-[#4B95F9] to-[#6BABFF] flex items-center justify-center flex-shrink-0 shadow-sm">
                          <span className="text-[16px]">🏋️‍♂️</span>
                        </div>
                        <p className="text-[14px] text-text-secondary leading-relaxed flex-1">{coachExplanation}</p>
                      </div>
                    </motion.div>
                  )}

                  <div className="space-y-2.5 mb-6">
                    {aiRoutine.map((exercise, i) => {
                      const phaseLabel = exercise.phase === "warmup" ? "준비운동" : exercise.phase === "cooldown" ? "마무리" : "본운동";
                      const phaseColor = exercise.phase === "warmup" ? "text-[#FF9500] bg-[#FF9500]/8" : exercise.phase === "cooldown" ? "text-[#34C759] bg-[#34C759]/8" : "text-primary bg-primary/8";
                      return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                      >
                        <Card variant="default" padding="compact" className="flex flex-col gap-3">
                          <div className="flex items-start gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${phaseColor}`}>
                              <span className="text-[14px] font-bold">{i + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                  <p className="text-[15px] font-semibold text-text-primary">{exercise.name}</p>
                                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${phaseColor}`}>{phaseLabel}</span>
                                </div>
                                <button
                                  onClick={() => toast("영상 기능은 준비중이에요!")}
                                  className="text-[12px] font-medium text-primary bg-primary/5 px-2 py-1 rounded-md hover:bg-primary/10 transition-colors flex-shrink-0"
                                >
                                  영상 ▶
                                </button>
                              </div>
                              <p className="text-[13px] text-text-caption mt-0.5">
                                {exercise.targetArea} · {exercise.sets}세트 {exercise.reps}회
                              </p>
                            </div>
                          </div>
                          {exercise.tips && (
                            <div className="pl-12">
                              <p className="text-[13px] text-text-secondary bg-bg-warm px-3 py-2 rounded-lg">
                                💡 {exercise.tips}
                              </p>
                            </div>
                          )}
                        </Card>
                      </motion.div>
                      );
                    })}
                  </div>

                  <Button onClick={() => {
                    toast("맞춤 루틴이 준비되었어요! 위 운동을 따라해 보세요.");
                  }}>
                    {selectedCondition === "sore" ? "가벼운 스트레칭 시작" : "운동 시작하기"}
                  </Button>

                  <button onClick={() => { setStep("time"); setSelectedTime(null); setAiRoutine(null); }} className="mt-4 w-full text-[14px] text-text-caption font-medium text-center min-h-[44px] active:text-primary transition-colors">
                    다시 구성하기
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  );
}

function getDefaultExplanation(condition: string, sport: string): string {
  if (condition === "sore") {
    return `오늘은 몸이 뻐근하시니 가벼운 스트레칭 위주로 구성했어요. ${sport} 할 때 부담 없도록 회복에 집중해볼게요!`;
  }
  if (condition === "great") {
    return `컨디션이 좋으시니 오늘은 조금 더 적극적으로 구성했어요! ${sport} 퍼포먼스 향상에 직접적으로 도움이 될 거예요.`;
  }
  return `평소 컨디션에 맞춰 균형 잡힌 루틴을 구성했어요. ${sport}에 필요한 기본기를 다져볼게요!`;
}

function getDefaultRoutine(condition: string, minutes: number) {
  const count = Math.max(2, Math.floor(minutes / 6));
  if (condition === "sore") {
    return [
      { name: "목 스트레칭", description: "목을 좌우로 천천히 기울이기", targetArea: "목·어깨", sets: 2, reps: 10, phase: "warmup", tips: "어깨가 따라 올라가지 않도록 주의하세요." },
      { name: "고양이 자세", description: "네 발로 엎드려 등을 둥글게 말았다 펴기", targetArea: "척추", sets: 2, reps: 8, phase: "main", tips: "허리를 너무 과하게 꺾지 마세요." },
      { name: "햄스트링 스트레칭", description: "한쪽 다리를 앞으로 뻗고 상체 숙이기", targetArea: "하체", sets: 2, reps: 10, phase: "cooldown", tips: "무릎을 살짝 구부려도 괜찮아요." },
    ].slice(0, count);
  }
  return [
    { name: "어깨·고관절 돌리기", description: "양 어깨를 크게 돌리고 고관절을 풀어주기", targetArea: "전신", sets: 1, reps: 10, phase: "warmup", tips: "통증 없는 범위에서 크게 돌려주세요." },
    { name: "의자 스쿼트", description: "의자 앞에 서서 천천히 앉았다 빠르게 일어나기", targetArea: "하체", sets: 3, reps: 10, phase: "main", tips: "무릎이 발끝보다 많이 나가지 않게 하세요." },
    { name: "벽 푸시업", description: "벽에 손을 짚고 팔굽혀펴기", targetArea: "상체", sets: 3, reps: 8, phase: "main", tips: "몸이 일직선이 되도록 유지하세요." },
    { name: "전신 스트레칭", description: "깊게 호흡하며 전신을 편안하게 늘려주기", targetArea: "전신", sets: 1, reps: 5, phase: "cooldown", tips: "어깨 힘을 빼고 편안하게 하세요." },
  ].slice(0, count);
}
