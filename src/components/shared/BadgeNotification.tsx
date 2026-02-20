"use client";

import { motion, AnimatePresence } from "motion/react";
import { useAchievementStore } from "@/stores/useAchievementStore";
import { BADGES } from "@/types/achievements";

export function BadgeNotification() {
  const pendingNotification = useAchievementStore((s) => s.pendingNotification);
  const dismissNotification = useAchievementStore((s) => s.dismissNotification);

  const badge = BADGES.find((b) => b.id === pendingNotification);

  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={dismissNotification}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="bg-bg-card rounded-3xl p-8 mx-8 max-w-sm w-full text-center shadow-float"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 250, damping: 15, delay: 0.15 }}
              className="text-[64px] mb-4"
            >
              {badge.emoji}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-[14px] text-primary font-semibold mb-1">
                새로운 배지 획득!
              </p>
              <h3 className="text-[22px] font-bold text-text-primary tracking-tight mb-2">
                {badge.name}
              </h3>
              <p className="text-[15px] text-text-secondary">
                {badge.description}
              </p>
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              whileTap={{ scale: 0.97 }}
              onClick={dismissNotification}
              className="mt-6 w-full py-3.5 rounded-2xl bg-primary text-white text-[16px] font-bold active:opacity-80 transition-opacity"
            >
              확인
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
