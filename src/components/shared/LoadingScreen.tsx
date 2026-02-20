"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

const MESSAGES = [
  "건강 데이터 6가지를 분석 중이에요",
  "7일치 안전한 운동을 선별하고 있어요",
  "나에게 딱 맞는 일정을 만들고 있어요",
  "거의 다 됐어요!",
];

interface LoadingScreenProps {
  nickname: string;
  isVisible: boolean;
}

export function LoadingScreen({ nickname, isVisible }: LoadingScreenProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => Math.min(prev + 1, MESSAGES.length - 1));
    }, 2200);
    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 1, 95));
    }, 100);
    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg-primary"
    >
      <div className="flex flex-col items-center gap-10 px-8 text-center max-w-sm">
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-gradient flex items-center justify-center shadow-lg">
            <span className="text-white text-[13px] font-black tracking-tighter">
              ON
            </span>
          </div>
        </motion.div>

        <div>
          <h2 className="text-[22px] font-bold text-text-primary mb-2 tracking-tight">
            오직 {nickname}님만을 위해 준비했어요
          </h2>
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="text-[15px] text-text-caption"
            >
              {MESSAGES[messageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="w-full space-y-2">
          <div className="w-full h-[6px] bg-bg-warm rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary-gradient rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1, ease: "linear" }}
            />
          </div>
          <span className="text-[13px] text-text-disabled">
            {progress}%
          </span>
        </div>
      </div>
    </motion.div>
  );
}
