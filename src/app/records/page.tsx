"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { CalendarHeatmap } from "@/components/records/CalendarHeatmap";
import { Card } from "@/components/ui/Card";
import { useUserStore } from "@/stores/useUserStore";
import { useWorkoutStore } from "@/stores/useWorkoutStore";
import { useHydration } from "@/hooks/useHydration";
import { AchievementGrid } from "@/components/records/AchievementGrid";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { RPE_LEVELS } from "@/lib/constants";

export default function RecordsPage() {
  const hydrated = useHydration();
  const router = useRouter();
  const hasCompleted = useUserStore((s) => s.hasCompletedAssessment);
  const nickname = useUserStore((s) => s.profile?.nickname ?? "");

  const logs = useWorkoutStore((s) => s.logs);
  const getStreak = useWorkoutStore((s) => s.getStreak);
  const getMaxStreak = useWorkoutStore((s) => s.getMaxStreak);
  const getCompletedDates = useWorkoutStore((s) => s.getCompletedDates);
  const getTotalWorkoutDays = useWorkoutStore((s) => s.getTotalWorkoutDays);
  const getAverageRPE = useWorkoutStore((s) => s.getAverageRPE);
  const getRecentSessions = useWorkoutStore((s) => s.getRecentSessions);

  const shouldRedirect = hydrated && !hasCompleted;

  useEffect(() => {
    if (shouldRedirect) router.replace("/");
  }, [shouldRedirect, router]);

  if (!hydrated) return <PageSkeleton />;
  if (shouldRedirect) return null;

  const streak = getStreak();
  const maxStreak = getMaxStreak();
  const completedDates = getCompletedDates();
  const totalDays = getTotalWorkoutDays();
  const averageRPE = getAverageRPE();
  const recentSessions = getRecentSessions();

  const rpeInfo = RPE_LEVELS.find((r) => r.level === Math.round(averageRPE));

  return (
    <>
      <Header />
      <main className="px-5 pt-4 pb-28">
        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <h1 className="text-[24px] font-bold text-text-primary tracking-tight">
            {nickname ? `${nickname}님의 기록` : "운동 기록"}
          </h1>
          <p className="text-[15px] text-text-caption mt-1">
            꾸준함이 가장 큰 힘이에요
          </p>
        </motion.div>

        {/* Streak banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="mb-5"
        >
          <Card variant="elevated" className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="text-[28px]">{streak > 0 ? "🔥" : "💪"}</span>
              </div>
              <div className="flex-1">
                <p className="text-[15px] text-text-caption font-medium">연속 운동</p>
                <p className="text-[28px] font-bold text-primary leading-tight">
                  {streak}일
                </p>
              </div>
              {maxStreak > 0 && (
                <div className="text-right">
                  <p className="text-[13px] text-text-caption">최고 기록</p>
                  <p className="text-[17px] font-bold text-text-primary">{maxStreak}일</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="grid grid-cols-2 gap-3 mb-5"
        >
          <Card variant="default" padding="compact">
            <p className="text-[13px] text-text-caption mb-1">총 운동 일수</p>
            <p className="text-[24px] font-bold text-text-primary">{totalDays}일</p>
          </Card>
          <Card variant="default" padding="compact">
            <p className="text-[13px] text-text-caption mb-1">평균 체감 강도</p>
            <div className="flex items-center gap-2">
              {averageRPE > 0 ? (
                <>
                  <span className="text-[24px]">{rpeInfo?.emoji ?? "😐"}</span>
                  <span className="text-[17px] font-bold text-text-primary">
                    {rpeInfo?.label ?? `RPE ${averageRPE}`}
                  </span>
                </>
              ) : (
                <span className="text-[15px] text-text-caption">아직 데이터 없음</span>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Calendar heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="mb-5"
        >
          <CalendarHeatmap completedDates={completedDates} />
        </motion.div>

        {/* Achievement badges */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.18 }}
          className="mb-5"
        >
          <AchievementGrid />
        </motion.div>

        {/* Recent sessions */}
        {recentSessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
          >
            <h2 className="text-[18px] font-bold text-text-primary mb-3 tracking-tight">
              최근 운동
            </h2>
            <div className="space-y-2">
              {recentSessions.map((session) => {
                const sessionRpe = RPE_LEVELS.find((r) => r.level === session.rpe);
                const dateObj = new Date(session.date);
                const dateLabel = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
                const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
                const dayLabel = dayNames[dateObj.getDay()];

                return (
                  <Card key={session.date} variant="outlined" padding="compact">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-[15px]">✅</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[15px] font-bold text-text-primary">
                            {dateLabel}({dayLabel})
                          </span>
                          {session.theme && (
                            <span className="text-[13px] text-text-caption truncate">
                              {session.theme}
                            </span>
                          )}
                        </div>
                        <p className="text-[13px] text-text-caption">
                          {session.exerciseCount}개 운동 완료
                        </p>
                      </div>
                      {sessionRpe && (
                        <span className="text-[24px] flex-shrink-0">{sessionRpe.emoji}</span>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Full exercise history */}
        {(() => {
          const exerciseLogs = logs
            .filter((l) => l.exerciseId && l.exerciseName)
            .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

          if (exerciseLogs.length === 0) return null;

          // Group by date
          const grouped = new Map<string, typeof exerciseLogs>();
          for (const log of exerciseLogs) {
            const d = new Date(log.completedAt);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            if (!grouped.has(key)) grouped.set(key, []);
            grouped.get(key)!.push(log);
          }

          return (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.25 }}
              className="mb-5"
            >
              <h2 className="text-[18px] font-bold text-text-primary mb-3 tracking-tight">
                운동 상세 기록
              </h2>
              <div className="space-y-4">
                {Array.from(grouped.entries()).slice(0, 7).map(([dateKey, dateLogs]) => {
                  const dateObj = new Date(dateKey);
                  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
                  const dateLabel = `${dateObj.getMonth() + 1}/${dateObj.getDate()}(${dayNames[dateObj.getDay()]})`;

                  return (
                    <div key={dateKey}>
                      <p className="text-[14px] font-semibold text-text-caption mb-2">
                        {dateLabel}
                      </p>
                      <div className="space-y-1.5">
                        {dateLogs.map((log, idx) => (
                          <div
                            key={`${log.exerciseId}-${idx}`}
                            className="flex items-center gap-3 px-4 py-2.5 bg-bg-warm rounded-xl"
                          >
                            <div className="w-7 h-7 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-[11px] text-success font-bold">✓</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[14px] font-semibold text-text-primary truncate">
                                {log.exerciseName}
                              </p>
                              <p className="text-[12px] text-text-caption">
                                {log.sets && log.reps ? `${log.sets}세트 · ${log.reps}회` : ""}
                                {log.source === "onboarding" ? " · 온보딩" : ""}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })()}

        {/* Report link */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.3 }}
          className="mb-5"
        >
          <button
            onClick={() => router.push("/report")}
            className="w-full p-4 rounded-2xl bg-bg-warm flex items-center justify-between active:bg-border-card/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-[20px]">📊</span>
              <span className="text-[15px] font-semibold text-text-primary">
                주간 리포트 보기
              </span>
            </div>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-caption" />
            </svg>
          </button>
        </motion.div>

        {/* Empty state */}
        {totalDays === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
          >
            <Card variant="elevated" className="text-center py-8">
              <span className="text-[48px] block mb-4">🌱</span>
              <h3 className="text-[20px] font-bold text-text-primary mb-2 tracking-tight">
                아직 운동 기록이 없어요
              </h3>
              <p className="text-[15px] text-text-caption">
                홈에서 오늘의 운동을 시작해볼까요?
              </p>
            </Card>
          </motion.div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
