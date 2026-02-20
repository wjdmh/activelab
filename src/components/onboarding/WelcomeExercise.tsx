"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";

interface WelcomeExerciseProps {
  onComplete: () => void;
}

export function WelcomeExercise({ onComplete }: WelcomeExerciseProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center text-center px-5"
    >
      <div className="w-24 h-24 rounded-[28px] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6">
        <span className="text-[48px]">🪑</span>
      </div>

      <h2 className="text-[22px] font-bold text-text-primary leading-snug tracking-tight mb-2">
        의자 잡고 까치발 들기
      </h2>

      <p className="text-[15px] text-text-caption leading-relaxed mb-6 max-w-[280px]">
        의자를 잡고 천천히 발뒤꿈치를 들어올려보세요.
        <br />
        종아리 근력에 좋아요.
      </p>

      <div className="flex items-center gap-4 mb-8">
        <div className="flex flex-col items-center px-5 py-3 rounded-2xl bg-bg-warm">
          <span className="text-[22px] font-bold text-primary">10회</span>
          <span className="text-[13px] text-text-caption mt-0.5">반복</span>
        </div>
        <span className="text-text-disabled">×</span>
        <div className="flex flex-col items-center px-5 py-3 rounded-2xl bg-bg-warm">
          <span className="text-[22px] font-bold text-primary">2세트</span>
          <span className="text-[13px] text-text-caption mt-0.5">세트</span>
        </div>
      </div>

      <div className="w-full">
        <Button size="large" onClick={onComplete}>
          완료했어요!
        </Button>
      </div>
    </motion.div>
  );
}
