"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { VisionCameraStep } from "@/components/assessment/steps/VisionCameraStep";
import { useUserStore } from "@/stores/useUserStore";
import type { PostureResult } from "@/types/posture";

export function VisionScanBanner() {
  const visionScanCompleted = useUserStore((s) => s.visionScanCompleted);
  const setVisionScanCompleted = useUserStore((s) => s.setVisionScanCompleted);
  const [showScanner, setShowScanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // 스캔 완료했거나 배너 닫은 경우 숨김
  // 미완료 사용자 전체(기존 + 신규 건너뜀)에게 표시
  if (visionScanCompleted || dismissed) return null;

  const handleComplete = (result: PostureResult | null, skipped: boolean) => {
    if (!skipped) {
      setVisionScanCompleted(result);
      if (result) {
        fetch("/api/posture-scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postureResult: result }),
        }).catch(() => {});
      }
    }
    setShowScanner(false);
  };

  return (
    <>
      {/* 카메라 스캐너 모달 */}
      <AnimatePresence>
        {showScanner && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 z-50 bg-bg-page flex flex-col"
          >
            <div className="sticky top-0 bg-bg-page/80 backdrop-blur-xl">
              <div className="flex items-center h-[52px] px-4">
                <button
                  onClick={() => setShowScanner(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-bg-warm transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div className="flex-1 text-center">
                  <span className="text-[15px] font-semibold text-text-secondary">체형·자세 검사</span>
                </div>
                <div className="w-10" />
              </div>
              <div className="h-[2px] bg-primary" />
            </div>
            <div className="flex-1 px-5 py-6 overflow-y-auto">
              <VisionCameraStep onComplete={handleComplete} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 대시보드 배너 */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-4 mb-3 p-4 rounded-2xl bg-gradient-to-r from-primary/8 to-[#4B95F9]/8 border border-primary/15 relative"
      >
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full bg-black/5 text-text-caption text-[12px]"
          aria-label="배너 닫기"
        >
          ✕
        </button>

        <div className="flex items-start gap-3 pr-6">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
            <span className="text-[20px]">📸</span>
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-bold text-text-primary leading-tight mb-1">
              AI가 체형·자세를 분석해 처방을 정밀화해요
            </p>
            <p className="text-[12px] text-text-caption mb-3">
              전방 두부·어깨·골반 균형을 AI로 확인해요
            </p>
            <button
              onClick={() => setShowScanner(true)}
              className="px-4 py-2 rounded-xl bg-primary text-white text-[13px] font-bold active:opacity-80 transition-opacity"
            >
              지금 검사하기
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
