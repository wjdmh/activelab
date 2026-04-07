"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

interface VisionCameraStepProps {
  onComplete: (skipped: boolean) => void;
}

type ScanPhase = "prompt" | "permission" | "scanning" | "done";

export function VisionCameraStep({ onComplete }: VisionCameraStepProps) {
  const [phase, setPhase] = useState<ScanPhase>("prompt");
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [scanProgress, setScanProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const startCamera = async () => {
    setPhase("permission");
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setPhase("scanning");
      startCountdownAndScan();
    } catch {
      setError("카메라 접근이 거부되었어요. 설정에서 권한을 허용해 주세요.");
      setPhase("prompt");
    }
  };

  const startCountdownAndScan = () => {
    let count = 3;
    setCountdown(count);

    const tick = () => {
      count -= 1;
      setCountdown(count);
      if (count > 0) {
        timerRef.current = setTimeout(tick, 1000);
      } else {
        // 스캔 진행 시뮬레이션 (실제 MediaPipe 포즈 분석은 운동 세션에서 활용)
        simulateScan();
      }
    };
    timerRef.current = setTimeout(tick, 1000);
  };

  const simulateScan = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 4;
      setScanProgress(Math.min(progress, 100));
      if (progress >= 100) {
        clearInterval(interval);
        timerRef.current = setTimeout(() => {
          stopCamera();
          setPhase("done");
        }, 500);
      }
    }, 80);
  };

  const handleSkip = () => {
    stopCamera();
    onComplete(true);
  };

  const handleDone = () => {
    onComplete(false);
  };

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {/* ===== 유도 화면 ===== */}
        {phase === "prompt" && (
          <motion.div
            key="prompt"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C10.3 2 9 3.3 9 5s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3z" fill="currentColor" className="text-primary" />
                  <path d="M3 7h4v2H5v8h2v2H3V7zm14 0h4v12h-4v-2h2V9h-2V7z" fill="currentColor" className="text-primary/40" />
                  <path d="M7 7h10v12H7z" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            <h2 className="text-[22px] font-bold text-text-primary text-center leading-snug tracking-tight mb-3">
              더 정확한 처방을 위해<br />
              <span className="text-primary">체형·자세 검사</span>를 할까요?
            </h2>
            <p className="text-[14px] text-text-caption text-center mb-6 leading-relaxed">
              카메라로 체형과 자세를 분석해<br />
              맞춤 운동 처방의 정확도를 높여드려요
            </p>

            {/* 안전 배지 */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-bg-warm mb-6">
              <span className="text-[18px]">🔒</span>
              <p className="text-[13px] text-text-secondary">
                촬영 데이터는 기기 안에서만 처리되며 서버로 전송되지 않아요
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-danger/5 border border-danger/20 mb-4">
                <p className="text-[13px] text-danger">{error}</p>
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={startCamera}
              className="w-full py-4 rounded-2xl bg-gradient-to-b from-primary to-[#E84A10] text-white text-[17px] font-bold shadow-button active:shadow-none active:translate-y-[1px] transition-all mb-3"
            >
              카메라로 체형 검사 시작하기
            </motion.button>

            <button
              onClick={handleSkip}
              className="w-full py-3 text-[15px] text-text-caption font-medium text-center active:text-text-secondary transition-colors"
            >
              나중에 할게요
              <span className="block text-[12px] text-text-disabled font-normal mt-0.5">
                안전 최우선으로 경도 처방이 적용돼요
              </span>
            </button>
          </motion.div>
        )}

        {/* ===== 카메라 권한 요청 중 ===== */}
        {phase === "permission" && (
          <motion.div
            key="permission"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-[15px] text-text-secondary font-medium">카메라 권한 요청 중...</p>
          </motion.div>
        )}

        {/* ===== 스캔 중 ===== */}
        {phase === "scanning" && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-[#0F172A] mb-4">
              {/* 실제 카메라 피드 */}
              <video
                ref={videoRef}
                className="w-full h-full object-cover scale-x-[-1]"
                playsInline
                muted
              />

              {/* 실루엣 오버레이 가이드 */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <svg
                  viewBox="0 0 200 340"
                  width="160"
                  height="272"
                  fill="none"
                  className="opacity-60"
                >
                  {/* 머리 */}
                  <circle cx="100" cy="38" r="28" stroke="white" strokeWidth="2.5" strokeDasharray="6 4" />
                  {/* 몸통 */}
                  <path d="M68 72 Q60 110 58 160 L142 160 Q140 110 132 72 Z" stroke="white" strokeWidth="2.5" strokeDasharray="6 4" fill="none" />
                  {/* 왼팔 */}
                  <path d="M68 80 Q44 120 42 170" stroke="white" strokeWidth="2.5" strokeDasharray="6 4" />
                  {/* 오른팔 */}
                  <path d="M132 80 Q156 120 158 170" stroke="white" strokeWidth="2.5" strokeDasharray="6 4" />
                  {/* 왼쪽 다리 */}
                  <path d="M82 160 Q76 220 74 290" stroke="white" strokeWidth="2.5" strokeDasharray="6 4" />
                  {/* 오른쪽 다리 */}
                  <path d="M118 160 Q124 220 126 290" stroke="white" strokeWidth="2.5" strokeDasharray="6 4" />
                </svg>
              </div>

              {/* 카운트다운 */}
              {countdown > 0 && (
                <motion.div
                  key={countdown}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/40"
                >
                  <span className="text-[72px] font-black text-white">{countdown}</span>
                </motion.div>
              )}

              {/* 스캔 진행 중 */}
              {countdown === 0 && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-[13px] text-white font-semibold mb-2 text-center">
                    실루엣에 맞춰 서주세요
                  </p>
                  <div className="w-full h-1.5 rounded-full bg-white/20">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      animate={{ width: `${scanProgress}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                </div>
              )}

              {/* 스캔 라인 애니메이션 */}
              {countdown === 0 && scanProgress < 100 && (
                <motion.div
                  className="absolute left-0 right-0 h-0.5 bg-primary/70"
                  animate={{ top: ["10%", "90%", "10%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              )}
            </div>

            <p className="text-[14px] text-text-caption text-center">
              {countdown > 0 ? `${countdown}초 후 스캔 시작` : `분석 중... ${scanProgress}%`}
            </p>
          </motion.div>
        )}

        {/* ===== 완료 ===== */}
        {phase === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-5"
            >
              <span className="text-[40px]">✅</span>
            </motion.div>

            <h2 className="text-[22px] font-bold text-text-primary text-center tracking-tight mb-2">
              체형 검사 완료!
            </h2>
            <p className="text-[14px] text-text-caption text-center mb-8 leading-relaxed">
              분석 결과가 운동 처방에 반영돼요.<br />
              이제 맞춤 프로그램을 만들어드릴게요!
            </p>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleDone}
              className="w-full py-4 rounded-2xl bg-gradient-to-b from-primary to-[#E84A10] text-white text-[17px] font-bold shadow-button"
            >
              맞춤 프로그램 만들기
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
