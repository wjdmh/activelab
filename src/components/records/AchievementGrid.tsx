"use client";

import { motion } from "motion/react";
import { useAchievementStore } from "@/stores/useAchievementStore";
import { BADGES } from "@/types/achievements";
import { Card } from "@/components/ui/Card";

export function AchievementGrid() {
  const earnedBadges = useAchievementStore((s) => s.earnedBadges);

  return (
    <Card variant="elevated">
      <h2 className="text-[18px] font-bold text-text-primary mb-4 tracking-tight">
        나의 배지
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {BADGES.map((badge) => {
          const earned = earnedBadges.find((b) => b.badgeId === badge.id);
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex flex-col items-center text-center p-3 rounded-2xl ${
                earned ? "bg-primary/5" : "bg-bg-warm opacity-40"
              }`}
            >
              <span className={`text-[32px] mb-1.5 ${earned ? "" : "grayscale"}`}>
                {badge.emoji}
              </span>
              <p className={`text-[12px] font-semibold leading-tight ${
                earned ? "text-text-primary" : "text-text-caption"
              }`}>
                {badge.name}
              </p>
              {earned && (
                <p className="text-[10px] text-text-caption mt-0.5">
                  {new Date(earned.earnedAt).toLocaleDateString("ko-KR", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
