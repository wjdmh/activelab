"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";

interface QuickStartCardProps {
  theme: string;
  exerciseCount: number;
  completedCount: number;
  estimatedMinutes: number;
  onStart: () => void;
}

export function QuickStartCard({
  theme,
  exerciseCount,
  completedCount,
  estimatedMinutes,
  onStart,
}: QuickStartCardProps) {
  const allDone = exerciseCount > 0 && completedCount >= exerciseCount;

  if (allDone) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="rounded-3xl bg-gradient-to-br from-success/10 to-success/5 border border-success/20 p-6 text-center"
      >
        <span className="text-[48px] block mb-3">🎉</span>
        <h3 className="text-[20px] font-bold text-text-primary mb-1 tracking-tight">
          오늘 운동 완료!
        </h3>
        <p className="text-[15px] text-text-caption">
          정말 대단해요. 내일도 함께해요
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
      className="rounded-3xl bg-gradient-to-br from-primary/8 to-primary/3 border border-primary/15 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[18px] font-bold text-text-primary tracking-tight">
            오늘의 운동
          </h3>
          <p className="text-[14px] text-text-caption mt-0.5">
            {theme} · {estimatedMinutes}분 · {exerciseCount}종목
          </p>
        </div>
        {completedCount > 0 && (
          <span className="text-[14px] font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
            {completedCount}/{exerciseCount}
          </span>
        )}
      </div>

      <Button size="large" onClick={onStart}>
        {completedCount > 0 ? "이어서 운동할까요?" : "운동 시작해볼까요?"}
      </Button>
    </motion.div>
  );
}
