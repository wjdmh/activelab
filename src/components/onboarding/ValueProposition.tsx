"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";

interface ValuePropositionProps {
  onStart: () => void;
}

export function ValueProposition({ onStart }: ValuePropositionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center text-center px-5"
    >
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 15 }}
        className="text-[56px] mb-4"
      >
        🎉
      </motion.span>

      <h2 className="text-[22px] font-bold text-text-primary leading-snug tracking-tight mb-2">
        잘 하셨어요!
      </h2>

      <p className="text-[15px] text-text-caption leading-relaxed mb-8 max-w-[280px]">
        이런 운동을 매일 맞춤으로
        <br />
        만들어드릴 수 있어요.
        <br />
        <span className="text-text-secondary font-medium mt-1 inline-block">
          어떤 운동을 하고 싶은지 알려주시겠어요?
        </span>
      </p>

      <div className="w-full space-y-3">
        <Button size="large" onClick={onStart}>
          맞춤 프로그램 만들기
        </Button>
      </div>
    </motion.div>
  );
}
