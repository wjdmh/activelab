"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";

interface PostWorkoutFeedbackProps {
  nickname: string;
  rpe: number;
  exerciseCount: number;
  theme: string;
  streak: number;
  weeklyCompleted: number;
  weeklyTotal: number;
  onClose: () => void;
}

export function PostWorkoutFeedback({
  nickname,
  rpe,
  exerciseCount,
  theme,
  streak,
  weeklyCompleted,
  weeklyTotal,
  onClose,
}: PostWorkoutFeedbackProps) {
  const [feedback, setFeedback] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeedback() {
      try {
        const res = await fetch("/api/post-workout-feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nickname,
            rpe,
            exerciseCount,
            theme,
            streak,
            weeklyCompleted,
            weeklyTotal,
          }),
        });
        const data = await res.json();
        setFeedback(data.feedback);
      } catch {
        setFeedback("오늘도 잘하셨어요! 내일도 함께해요.");
      } finally {
        setLoading(false);
      }
    }

    fetchFeedback();
  }, [nickname, rpe, exerciseCount, theme, streak, weeklyCompleted, weeklyTotal]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex-1 flex flex-col items-center justify-center px-6"
    >
      {/* Coach avatar */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
        className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-gradient flex items-center justify-center mb-6"
      >
        <span className="text-white text-[20px] font-black">AI</span>
      </motion.div>

      {/* Feedback message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-sm"
      >
        {loading ? (
          <div className="text-center">
            <div className="flex justify-center gap-1.5 mb-4">
              <div className="w-2 h-2 rounded-full bg-text-caption animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 rounded-full bg-text-caption animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 rounded-full bg-text-caption animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <p className="text-[15px] text-text-caption">코치가 피드백을 준비하고 있어요</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="bg-bg-warm rounded-2xl px-6 py-5 mb-8">
              <p className="text-[17px] text-text-primary font-medium leading-relaxed">
                {feedback}
              </p>
            </div>

            {/* Stats summary */}
            <div className="flex justify-center gap-6 mb-10">
              <div className="text-center">
                <p className="text-[24px] font-bold text-primary">{exerciseCount}</p>
                <p className="text-[13px] text-text-caption">운동 완료</p>
              </div>
              {streak > 0 && (
                <div className="text-center">
                  <p className="text-[24px] font-bold text-success">{streak}</p>
                  <p className="text-[13px] text-text-caption">일 연속</p>
                </div>
              )}
              <div className="text-center">
                <p className="text-[24px] font-bold text-text-primary">
                  {weeklyCompleted}/{weeklyTotal}
                </p>
                <p className="text-[13px] text-text-caption">이번 주</p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Close button */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-sm mt-auto"
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            onClick={onClose}
            className="w-full min-h-[56px] px-8 text-[17px] font-bold rounded-2xl bg-gradient-to-b from-primary to-[#E84A10] text-white shadow-button active:shadow-none active:translate-y-[1px] transition-all"
          >
            확인
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}
