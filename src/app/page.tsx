"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { GuidedWorkoutSession } from "@/components/workout/GuidedWorkoutSession";
import { BadgeNotification } from "@/components/shared/BadgeNotification";
import { useUserStore } from "@/stores/useUserStore";
import { useWorkoutStore } from "@/stores/useWorkoutStore";
import { useAssessmentStore } from "@/stores/useAssessmentStore";
import { useAchievementStore } from "@/stores/useAchievementStore";
import { useHydration } from "@/hooks/useHydration";

function getTodayIndex(): number {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

// ===== 스트릭 단계 =====
function getStreakInfo(streak: number) {
  if (streak >= 30) return { emoji: "👑", label: `${streak}일 연속! 전설의 시작!`, color: "from-[#FFD700]/15 to-[#FFA000]/10", textColor: "text-[#B8860B]", subColor: "text-[#B8860B]/70" };
  if (streak >= 14) return { emoji: "⚡", label: `${streak}일 연속! 몸이 달라지고 있어요!`, color: "from-[#9C27B0]/10 to-[#7B1FA2]/5", textColor: "text-[#7B1FA2]", subColor: "text-[#7B1FA2]/70" };
  if (streak >= 7) return { emoji: "🔥🔥🔥", label: `1주 돌파! 습관이 되고 있어요!`, color: "from-[#D32F2F]/8 to-[#C62828]/5", textColor: "text-[#C62828]", subColor: "text-[#C62828]/70" };
  if (streak >= 3) return { emoji: "🔥🔥", label: `${streak}일 연속! 대단해요!`, color: "from-[#E65100]/8 to-[#BF360C]/5", textColor: "text-[#E65100]", subColor: "text-[#BF360C]/70" };
  return { emoji: "🔥", label: "시작이 반이에요!", color: "from-[#FF9500]/8 to-[#FF6B00]/5", textColor: "text-[#E65100]", subColor: "text-[#BF360C]/70" };
}

// ===== ON-U Landing =====
function LandingScreen() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-dvh bg-white relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[5%] left-[-15%] w-[50vw] h-[50vw] max-w-[280px] max-h-[280px] bg-primary/[0.04] rounded-full blur-3xl" />
        <div className="absolute bottom-[25%] right-[-10%] w-[40vw] h-[40vw] max-w-[200px] max-h-[200px] bg-[#6BABFF]/[0.05] rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between px-5 pt-4 pb-2 relative z-10"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-primary via-[#4B95F9] to-[#6BABFF] flex items-center justify-center shadow-sm">
            <span className="text-white text-[10px] font-black tracking-tighter leading-none">ON</span>
          </div>
          <span className="text-[18px] font-bold text-text-primary tracking-tight">ON-U</span>
        </div>
        <span className="text-[11px] font-semibold text-primary bg-primary/8 px-2.5 py-1 rounded-full">Beta</span>
      </motion.header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative mb-14"
        >
          <div className="absolute inset-[-28px] bg-primary/6 rounded-full breathe blur-2xl" />
          <div className="relative w-[120px] h-[120px]">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#4B95F9] to-[#6BABFF] fluid-core shadow-float" />
            <div className="absolute inset-[15%] bg-white/20 fluid-core" style={{ animationDelay: "-2s" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-[22px] font-black tracking-tight drop-shadow-lg">ON-U</span>
            </div>
          </div>
          <div className="absolute -top-2 -left-1 w-2 h-2 rounded-full bg-[#FF9F0A] dot-float-1" />
          <div className="absolute -bottom-1 -right-3 w-1.5 h-1.5 rounded-full bg-[#34C759] dot-float-2" />
          <div className="absolute top-1/2 -right-5 w-1 h-1 rounded-full bg-primary/50 dot-float-3" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-[24px] font-bold text-text-primary leading-tight tracking-tight mb-1">
            스포츠를 더 오래,
          </h1>
          <h1 className="text-[24px] font-bold text-text-primary leading-tight tracking-tight mb-2">
            더 즐겁게 즐기기 위한
          </h1>
          <h1 className="text-[28px] font-bold leading-tight tracking-tight gradient-text">
            맞춤형 AI 코칭
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-[14px] text-text-caption text-center mt-5 leading-relaxed max-w-[240px]"
        >
          부상 없이 더 높은 퍼포먼스를 위한
          <br />
          나만의 피지컬 코치
        </motion.p>
      </main>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="px-5 pb-12 relative z-10 space-y-3"
      >
        <button
          onClick={() => router.push("/coach")}
          className="w-full min-h-[56px] rounded-2xl bg-primary text-white text-[17px] font-bold shadow-button active:shadow-none active:brightness-95 active:translate-y-[1px] transition-all"
        >
          3분 만에 시작하기
        </button>
        <p className="text-[12px] text-text-disabled text-center">
          무료로 체력 진단 받고 맞춤 루틴 시작
        </p>
      </motion.div>
    </div>
  );
}

// ===== 주간 진행 캘린더 =====
function WeeklyCalendar() {
  const router = useRouter();
  const weeklyRecord = useAssessmentStore((s) => s.weeklyRecord);
  const todayIdx = getTodayIndex();

  const days = weeklyRecord?.days || [false, false, false, false, false, false, false];
  const completedDays = days.filter(Boolean).length;

  return (
    <button onClick={() => router.push("/records")} className="w-full text-left">
    <div className="bg-white rounded-3xl shadow-card border border-border-card/50 p-5 mb-4 active:scale-[0.98] transition-transform">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-bold text-text-primary tracking-tight">이번 주 운동</h3>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1">
            <span className="text-[14px] font-bold text-primary">{completedDays}</span>
            <span className="text-[13px] text-text-caption">/7일</span>
          </div>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="text-text-disabled">
            <path d="M7 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="flex justify-between">
        {DAY_LABELS.map((label, i) => {
          const done = days[i];
          const isToday = i === todayIdx;
          const isFuture = i > todayIdx;
          return (
            <div key={label} className="flex flex-col items-center gap-2">
              <span className={`text-[11px] font-semibold ${isToday ? "text-primary" : "text-text-caption"}`}>{label}</span>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                done
                  ? "bg-primary text-white shadow-sm"
                  : isToday
                    ? "border-2 border-primary text-primary bg-primary/5"
                    : isFuture
                      ? "bg-bg-warm text-text-disabled"
                      : "bg-bg-warm text-text-caption"
              }`}>
                {done ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : isToday ? (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
    </button>
  );
}

// ===== 체력 요약 카드 =====
function FitnessScoreCard() {
  const router = useRouter();
  const effectiveScore = useAssessmentStore((s) => s.getEffectiveScore());
  const effectiveSportsAge = useAssessmentStore((s) => s.getEffectiveSportsAge());
  const bonusScore = useAssessmentStore((s) => s.bonusScore);
  const result = useAssessmentStore((s) => s.result);

  if (!result) return null;

  const baseAvg = result.radarData.length > 0
    ? Math.round(result.radarData.reduce((a, b) => a + b.value, 0) / result.radarData.length)
    : 0;

  return (
    <button onClick={() => router.push("/report")} className="w-full text-left">
      <div className="bg-white rounded-3xl shadow-card border border-border-card/50 p-5 mb-4 active:scale-[0.98] transition-transform">
        <div className="flex items-center gap-4">
          {/* Score circle */}
          <div className="relative w-[60px] h-[60px] flex-shrink-0">
            <svg width="60" height="60" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="26" fill="none" stroke="#F2F4F6" strokeWidth="4.5" />
              <circle
                cx="30" cy="30" r="26"
                fill="none"
                stroke="#3182F6"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeDasharray={`${(effectiveScore / 100) * 163.4} 163.4`}
                transform="rotate(-90 30 30)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[17px] font-black text-text-primary leading-none">{effectiveScore}</span>
              <span className="text-[9px] font-medium text-text-caption mt-0.5">점</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[15px] font-bold text-text-primary">나의 체력</p>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="text-text-disabled">
                <path d="M7 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-baseline gap-1">
                <span className="text-[13px] text-text-caption">스포츠 나이</span>
                <span className="text-[15px] font-bold text-primary">{effectiveSportsAge}세</span>
              </div>
              {bonusScore > 0 && (
                <span className="text-[12px] font-semibold text-success bg-success/8 px-2 py-0.5 rounded-full">+{Math.round(bonusScore)}</span>
              )}
            </div>
            <p className="text-[12px] text-text-caption mt-1">
              {bonusScore > 0 ? `기본 ${baseAvg}점 + 운동 보너스` : "운동하면 점수가 올라요"}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}

// ===== 오늘의 코치 한마디 =====
const MOTIVATION_MESSAGES = [
  "오늘도 움직이는 당신이 멋져요!",
  "꾸준함이 가장 큰 무기예요.",
  "어제보다 조금 더, 그게 성장이에요.",
  "오늘 5분이라도 스트레칭 해볼까요?",
  "몸이 보내는 신호에 귀 기울여보세요.",
];

function CoachMessage() {
  const router = useRouter();
  const proactiveQ = useAssessmentStore((s) => s.proactiveQuestion);
  const [fallback] = useState(() => MOTIVATION_MESSAGES[Math.floor(Math.random() * MOTIVATION_MESSAGES.length)]);

  const message = proactiveQ?.question || fallback;

  const renderContent = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <button onClick={() => router.push("/coach")} className="w-full text-left">
      <div className="bg-gradient-to-br from-primary/[0.04] to-primary/[0.08] rounded-3xl border border-primary/10 p-4 mb-4 active:scale-[0.98] transition-transform">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary via-[#4B95F9] to-[#6BABFF] flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-[20px]">🏋️‍♂️</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-primary mb-1">코치 한마디</p>
            <p className="text-[14px] text-text-secondary leading-relaxed">{renderContent(message)}</p>
          </div>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="text-primary/40 flex-shrink-0 mt-3">
            <path d="M7 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </button>
  );
}

// ===== Main Home =====
function HomeMain() {
  const router = useRouter();
  const profile = useUserStore((s) => s.profile);
  const assessmentResult = useAssessmentStore((s) => s.result);
  const weeklyPlan = useWorkoutStore((s) => s.weeklyPlan);
  const isRestMode = useWorkoutStore((s) => s.isRestMode);
  const toggleRestMode = useWorkoutStore((s) => s.toggleRestMode);
  const activeSession = useWorkoutStore((s) => s.activeSession);
  const startSession = useWorkoutStore((s) => s.startSession);
  const getDayCompletedCount = useWorkoutStore((s) => s.getDayCompletedCount);
  const getStreak = useWorkoutStore((s) => s.getStreak);
  const isExerciseCompleted = useWorkoutStore((s) => s.isExerciseCompleted);
  const checkAchievements = useAchievementStore((s) => s.checkAchievements);
  const getAverageRPE = useWorkoutStore((s) => s.getAverageRPE);
  const getTotalWorkoutDays = useWorkoutStore((s) => s.getTotalWorkoutDays);
  const getMaxStreak = useWorkoutStore((s) => s.getMaxStreak);

  const todayWorkoutCompleted = useAssessmentStore((s) => s.todayWorkoutCompleted);
  const streakFromStore = useAssessmentStore((s) => s.streak);
  const bonusWorkoutsToday = useAssessmentStore((s) => s.bonusWorkoutsToday);

  const setProactiveQuestion = useAssessmentStore((s) => s.setProactiveQuestion);
  const proactiveQ = useAssessmentStore((s) => s.proactiveQuestion);

  const todayIndex = getTodayIndex();
  const [showSession, setShowSession] = useState(false);

  const nickname = assessmentResult?.profile?.nickname || profile?.nickname || "";
  const sportLabel = assessmentResult?.profile?.sportLabel || "";

  const todayPlan = weeklyPlan?.weeklyPlan?.[todayIndex];
  const exercises = todayPlan?.exercises ?? [];
  const completedCount = getDayCompletedCount(todayIndex);
  const totalExercises = exercises.length;
  const allDone = totalExercises > 0 && completedCount >= totalExercises;
  const streak = getStreak() || streakFromStore;
  const recommendations = assessmentResult?.recommendations || [];

  useEffect(() => {
    if (activeSession) setShowSession(true);
  }, [activeSession]);

  useEffect(() => {
    if (!weeklyPlan) return;
    const totalWorkouts = getTotalWorkoutDays();
    const currentStreak = getStreak();
    const maxStreak = getMaxStreak();
    const avgRPE = getAverageRPE();
    let weeklyDone = 0;
    for (let i = 0; i < 7; i++) if (getDayCompletedCount(i) > 0) weeklyDone++;
    checkAchievements({
      totalWorkouts, streak: currentStreak, maxStreak, averageRPE: avgRPE,
      previousAverageRPE: 0, programCompleted: false, weeklyCompleted: weeklyDone,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weeklyPlan]);

  // Proactive question generation (once per day)
  useEffect(() => {
    if (!assessmentResult) return;
    const today = new Date().toDateString();
    if (proactiveQ && proactiveQ.createdAt === today) return;

    const p = assessmentResult.profile;
    fetch("/api/proactive-question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nickname: p?.nickname || "",
        sportLabel: p?.sportLabel || "",
        sportsAge: assessmentResult.sportsAge,
        streak: streak,
        lastWorkoutDate: null,
        painAreas: p?.painAreas || [],
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.question) {
          setProactiveQuestion({
            id: `pq-${Date.now()}`,
            question: data.question,
            createdAt: today,
            read: false,
          });
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentResult]);

  const greeting = getGreeting();
  const streakInfo = getStreakInfo(streak);

  return (
    <>
      <Header />
      <main className="px-5 pt-5 pb-28">
        {/* Greeting Section */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-5">
          <p className="text-[13px] text-text-caption font-medium mb-1">
            {new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" })}
          </p>
          <h1 className="text-[22px] font-bold text-text-primary tracking-tight leading-snug">
            {nickname ? `${nickname}님, ${greeting}` : greeting}
          </h1>
          {sportLabel && sportLabel !== "운동 안 함" && sportLabel !== "none" && (
            <p className="text-[14px] text-text-caption mt-0.5">
              {sportLabel}를 위한 맞춤 트레이닝
            </p>
          )}
        </motion.div>

        {/* Streak banner */}
        {streak > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-4"
          >
            <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-gradient-to-r ${streakInfo.color} border border-black/[0.04]`}>
              <span className="text-[26px]">{streakInfo.emoji}</span>
              <div className="flex-1">
                <p className={`text-[14px] font-bold ${streakInfo.textColor}`}>{streakInfo.label}</p>
                <p className={`text-[12px] ${streakInfo.subColor}`}>
                  {bonusWorkoutsToday > 0 && `오늘 보너스 ${bonusWorkoutsToday}개 완료 · `}
                  꾸준함이 최고의 실력이에요
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ===== Workout Card (before workout) ===== */}
        {!todayWorkoutCompleted && !allDone && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mb-4"
          >
            <div className="bg-white rounded-3xl shadow-card border border-border-card/50 overflow-hidden">
              {/* Card header */}
              <div className="bg-gradient-to-br from-primary/[0.03] to-primary/[0.06] px-5 py-4 border-b border-border-card/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-primary font-bold tracking-wider uppercase mb-0.5">오늘의 트레이닝</p>
                    <h2 className="text-[18px] font-bold text-text-primary tracking-tight">
                      {weeklyPlan ? (todayPlan?.theme || "맞춤 운동") : "운동 시작하기"}
                    </h2>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-primary/8 flex items-center justify-center">
                    <span className="text-[22px]">💪</span>
                  </div>
                </div>
              </div>

              <div className="p-5">
                {/* Start button */}
                <button
                  onClick={() => {
                    if (weeklyPlan && exercises.length > 0) {
                      startSession(todayIndex);
                      setShowSession(true);
                    } else {
                      router.push("/daily");
                    }
                  }}
                  className="w-full min-h-[52px] rounded-2xl bg-primary text-white text-[16px] font-bold shadow-button active:shadow-none active:brightness-95 active:translate-y-[1px] transition-all mb-4"
                >
                  {weeklyPlan ? "운동 시작하기" : "오늘 컨디션 체크하고 시작"}
                </button>

                {/* Weekly plan exercises */}
                {weeklyPlan && exercises.length > 0 && !isRestMode && (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[13px] font-semibold text-text-secondary">맞춤 루틴</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] text-text-caption">{completedCount}/{totalExercises}</span>
                        <span className="text-[13px] font-bold text-primary">{Math.round((completedCount / totalExercises) * 100)}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-bg-warm rounded-full overflow-hidden mb-4">
                      <motion.div className="h-full bg-gradient-to-r from-primary to-[#4B95F9] rounded-full" initial={{ width: 0 }} animate={{ width: `${(completedCount / totalExercises) * 100}%` }} transition={{ duration: 0.5 }} />
                    </div>
                    <div className="space-y-2">
                      {exercises.slice(0, 3).map((exercise, idx) => {
                        const done = isExerciseCompleted(todayIndex, exercise.id);
                        return (
                          <button
                            key={exercise.id}
                            onClick={() => router.push(`/player?day=${todayIndex}&ex=${idx}`)}
                            className={`w-full p-3 rounded-xl text-left flex items-center gap-3 transition-all ${done ? "bg-success/5 opacity-60" : "bg-bg-warm active:bg-primary/5"}`}
                          >
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[12px] font-bold ${done ? "bg-success text-white" : "bg-primary/10 text-primary"}`}>
                              {done ? "✓" : idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-[14px] font-semibold ${done ? "text-text-caption line-through" : "text-text-primary"}`}>{exercise.name}</p>
                            </div>
                          </button>
                        );
                      })}
                      {exercises.length > 3 && (
                        <p className="text-[13px] text-text-caption text-center mt-2">+{exercises.length - 3}개 더</p>
                      )}
                    </div>
                  </>
                )}

                {/* Recommendations (no weekly plan) */}
                {!weeklyPlan && recommendations.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[13px] font-semibold text-text-secondary mb-2">추천 운동</p>
                    {recommendations.slice(0, 3).map((rec, i) => (
                      <button
                        key={rec.id}
                        onClick={() => router.push(`/player?source=report&idx=${i}`)}
                        className="w-full p-3 rounded-xl text-left flex items-center gap-3 bg-bg-warm active:bg-primary/5 transition-all"
                      >
                        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[12px] font-bold bg-primary/10 text-primary">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-semibold text-text-primary">{rec.name}</p>
                          <p className="text-[12px] text-text-caption">{rec.targetArea} · {rec.sets}세트 {rec.reps}회</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ===== Completed State ===== */}
        {(todayWorkoutCompleted || allDone) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-4"
          >
            <div className="bg-white rounded-3xl shadow-card border border-border-card/50 text-center py-10 px-5">
              <div className="w-16 h-16 rounded-full bg-success/8 flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="#34C759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-[20px] font-bold text-text-primary mb-1 tracking-tight">오늘 운동 완료!</h3>
              <p className="text-[14px] text-text-caption">대단해요! 내일도 함께해요</p>
              {streak > 0 && (
                <div className="mt-4 inline-flex items-center gap-1.5 bg-primary/8 px-4 py-2 rounded-full mx-auto">
                  <span className="text-[14px]">{streakInfo.emoji}</span>
                  <span className="text-[13px] font-bold text-primary">{streak}일 연속 달성!</span>
                </div>
              )}
              {bonusWorkoutsToday > 0 && (
                <p className="text-[12px] text-success font-semibold mt-2">보너스 운동 {bonusWorkoutsToday}개 완료!</p>
              )}
            </div>
          </motion.div>
        )}

        {/* 주간 캘린더 */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <WeeklyCalendar />
        </motion.div>

        {/* 코치 한마디 */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <CoachMessage />
        </motion.div>

        {/* 체력 요약 카드 */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
          <FitnessScoreCard />
        </motion.div>

        {/* Rest mode toggle */}
        {weeklyPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center mt-1 mb-2"
          >
            <button onClick={toggleRestMode} className="text-[13px] text-text-caption font-medium min-h-[44px] flex items-center active:text-primary transition-colors">
              {isRestMode ? "운동 모드로 돌아가기" : "오늘 몸이 안 좋으신가요?"}
            </button>
          </motion.div>
        )}
      </main>

      <GuidedWorkoutSession isVisible={showSession} onClose={() => setShowSession(false)} />
      <BadgeNotification />
      <BottomNav />
    </>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "좋은 새벽이에요";
  if (hour < 12) return "좋은 아침이에요";
  if (hour < 18) return "좋은 오후예요";
  return "좋은 저녁이에요";
}

export default function HomePage() {
  const hydrated = useHydration();
  const hasCompleted = useUserStore((s) => s.hasCompletedAssessment);
  const assessmentResult = useAssessmentStore((s) => s.result);

  if (!hydrated) return null;

  if (!hasCompleted && !assessmentResult) {
    return <LandingScreen />;
  }

  return <HomeMain />;
}
