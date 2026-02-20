"use client";

import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/Button";

interface WeekCompletionCelebrationProps {
  isVisible: boolean;
  weekNumber: number;
  programName: string;
  completedDays: number;
  totalDays: number;
  averageRPE: number;
  isFullCompletion: boolean;
  onNext: () => void;
  onClose: () => void;
}

function getRPELabel(rpe: number): string {
  if (rpe <= 2) return "쉬웠어요";
  if (rpe <= 3) return "적절해요";
  if (rpe <= 4) return "조금 힘들었어요";
  return "많이 힘들었어요";
}

function getRPEEmoji(rpe: number): string {
  if (rpe <= 2) return "😊";
  if (rpe <= 3) return "🙂";
  if (rpe <= 4) return "😤";
  return "😰";
}

export function WeekCompletionCelebration({
  isVisible,
  weekNumber,
  programName,
  completedDays,
  totalDays,
  averageRPE,
  isFullCompletion,
  onNext,
  onClose,
}: WeekCompletionCelebrationProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-bg-primary flex flex-col items-center justify-center px-6"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center rounded-full bg-bg-warm"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-text-caption" />
            </svg>
          </button>

          {isFullCompletion ? (
            /* Full completion */
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
              className="text-center max-w-sm"
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.2 }}
                className="text-[64px] block mb-4"
              >
                🎉
              </motion.span>

              <h2 className="text-[24px] font-bold text-text-primary tracking-tight mb-2">
                이번 주 완주!
              </h2>
              <p className="text-[16px] text-text-secondary mb-6">
                {programName} {weekNumber}주차를 멋지게 완수하셨어요!
              </p>

              <div className="flex justify-center gap-6 mb-6">
                <div className="text-center">
                  <p className="text-[28px] font-bold text-primary">{completedDays}</p>
                  <p className="text-[13px] text-text-caption">운동 일수</p>
                </div>
                <div className="text-center">
                  <p className="text-[28px]">{getRPEEmoji(averageRPE)}</p>
                  <p className="text-[13px] text-text-caption">{getRPELabel(averageRPE)}</p>
                </div>
              </div>

              <p className="text-[15px] text-text-caption mb-8">
                다음 주는 조금 더 도전적인 프로그램을 준비했어요.
              </p>

              <Button size="large" onClick={onNext}>
                다음 주 미리보기
              </Button>
            </motion.div>
          ) : (
            /* Partial completion — gentle encouragement */
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
              className="text-center max-w-sm"
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.2 }}
                className="text-[48px] block mb-4"
              >
                💪
              </motion.span>

              <h2 className="text-[22px] font-bold text-text-primary tracking-tight mb-2">
                이번 주 {completedDays}일 운동하셨어요
              </h2>
              <p className="text-[15px] text-text-secondary mb-6">
                시작한 것만으로도 대단해요!
              </p>

              <p className="text-[15px] text-text-caption mb-8">
                다음 주는 조금 가볍게 준비해드릴게요.
              </p>

              <Button size="large" onClick={onNext}>
                다음 주 시작하기
              </Button>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
