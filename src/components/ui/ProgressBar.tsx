"use client";

import { motion } from "motion/react";

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = ((current + 1) / total) * 100;

  return (
    <div
      className="w-full"
      role="progressbar"
      aria-valuenow={current + 1}
      aria-valuemin={1}
      aria-valuemax={total}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-[15px] font-medium text-text-caption">
          {current + 1} / {total}
        </span>
        <span className="text-[13px] text-text-disabled">
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="w-full h-[6px] bg-bg-warm rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-primary-gradient rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
