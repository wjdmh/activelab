"use client";

import { motion } from "motion/react";

interface WeeklyEncouragementProps {
  todayIndex: number;
  completedDays: Set<number>;
  streak: number;
}

function getEncouragementMessage(completedCount: number, todayIndex: number): string {
  if (completedCount === 0) {
    return "이번 주가 시작됐어요! 같이 힘내볼까요?";
  }
  if (completedCount === 1) {
    return "첫 운동을 하셨어요! 내일도 해볼까요?";
  }
  if (completedCount === 2) {
    return "벌써 이틀째! 꾸준함이 실력이에요";
  }
  if (completedCount === 3) {
    return "3일째! 절반 왔어요";
  }
  if (completedCount === 4) {
    return "꾸준히 하고 계시네요. 대단해요!";
  }
  if (completedCount === 5) {
    return "이번 주 5일째! 거의 다 왔어요!";
  }
  if (completedCount === 6) {
    return "내일이면 이번 주 완주예요!";
  }
  if (completedCount >= 7) {
    return "이번 주 완주! 정말 대단해요!";
  }
  return "오늘도 힘내볼까요?";
}

export function WeeklyEncouragement({
  todayIndex,
  completedDays,
  streak,
}: WeeklyEncouragementProps) {
  const dayLabels = ["월", "화", "수", "목", "금", "토", "일"];
  const completedCount = completedDays.size;
  const message = getEncouragementMessage(completedCount, todayIndex);
  const remaining = 7 - completedCount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="rounded-2xl bg-bg-card border border-border-card p-5"
    >
      {/* Weekly dots */}
      <div className="flex items-center justify-between mb-4">
        {dayLabels.map((label, idx) => {
          const isToday = idx === todayIndex;
          const isCompleted = completedDays.has(idx);

          return (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <span
                className={`text-[12px] font-semibold ${
                  isToday ? "text-primary" : "text-text-caption"
                }`}
              >
                {label}
              </span>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold transition-all ${
                  isCompleted
                    ? "bg-success text-white"
                    : isToday
                    ? "ring-2 ring-primary text-primary bg-primary/5"
                    : "bg-bg-warm text-text-disabled"
                }`}
              >
                {isCompleted ? "✓" : ""}
              </div>
            </div>
          );
        })}
      </div>

      {/* Encouragement message */}
      <div className="flex items-center gap-2">
        {streak > 0 && (
          <span className="text-[14px]">🔥</span>
        )}
        <p className="text-[14px] font-semibold text-text-secondary">
          {streak > 0 && `${streak}일 연속 · `}
          {message}
        </p>
      </div>

      {completedCount > 0 && completedCount < 7 && (
        <p className="text-[13px] text-text-caption mt-1">
          이번 주 완주까지 {remaining}일!
        </p>
      )}
    </motion.div>
  );
}
