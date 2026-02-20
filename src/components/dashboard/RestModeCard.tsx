"use client";

import { motion } from "motion/react";
import { Card } from "@/components/ui/Card";
import type { RestDayAlternative } from "@/types/workout";

interface RestModeCardProps {
  alternative?: RestDayAlternative;
}

export function RestModeCard({ alternative }: RestModeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card variant="elevated" className="text-center py-8">
        <span className="text-[56px] block mb-4">🌿</span>
        <h3 className="text-[22px] font-bold text-text-primary mb-2 tracking-tight">
          오늘은 편히 쉬어도 좋아요
        </h3>
        <p className="text-[15px] text-text-caption mb-6">
          무리하지 않는 것도 건강 관리의 일부예요
        </p>

        {alternative && (
          <div className="mt-4 p-5 rounded-2xl bg-primary-50/60 text-left">
            <h4 className="text-[15px] font-semibold text-primary mb-2">
              가볍게 할 수 있는 운동
            </h4>
            <p className="text-[17px] font-bold text-text-primary mb-1">
              {alternative.name}
            </p>
            <p className="text-[15px] text-text-secondary leading-normal">
              {alternative.description}
            </p>
            <p className="text-[13px] text-text-caption mt-2">
              {alternative.sets}세트 / {alternative.reps}회
            </p>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
