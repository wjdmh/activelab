"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { analyzePostureFromVideo } from "@/lib/poseAnalysis";
import type { PostureResult } from "@/types/posture";

interface VisionCameraStepProps {
  onComplete: (result: PostureResult | null, skipped: boolean) => void;
}

type Phase = "prompt" | "permission" | "countdown" | "analyzing" | "done" | "error";

const GRADE_CONFIG = {
  good: { label: "균형 잡힌 자세", color: "text-success", bg: "bg-success/10", icon: "🟢" },
  fair: { label: "보통 자세", color: "text-[#FF9500]", bg: "bg-[#FF9500]/10", icon: "🟡" },
  needs_attention: { label: "교정이 필요해요", color: "text-danger", bg: "bg-danger/10", icon: "🔴" },
};

export function VisionCameraStep({ onComplete }: VisionCameraStepProps) {
  const [phase, setPhase] = useState<Phase>("prompt");
  const [countdown, setCountdown] = useState(3);
  const [error, setError] = useState<string | null>(null);
  const [postureResult, setPostureResult] = useState<PostureResult | null>(null);
  const [modelLoading, setModelLoading] = useState(false);

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

  useEffect(() => () => stopCamera(), [stopCamera]);

  // MediaPipe 모델을 prompt 화면에서 미리 백그라운드 로드
  useEffect(() => {
    setModelLoading(true);
    import("@/lib/poseAnalysis")
      .then((m) => m.getPoseLandmarker())
      .catch(() => null)
      .finally(() => setModelLoading(false));
  }, []);

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
      startCountdown();
    } catch {
      setError("카메라 접근이 거부되었어요. 설정에서 권한을 허용해 주세요.");
      setPhase("prompt");
    }
  };

  const startCountdown = () => {
    setPhase("countdown");
    let count = 3;
    setCountdown(count);
    const tick = () => {
      count -= 1;
      setCountdown(count);
      if (count > 0) {
        timerRef.current = setTimeout(tick, 1000);
      } else {
        captureAndAnalyze();
      }
    };
    timerRef.current = setTimeout(tick, 1000);
  };

  const captureAndAnalyze = async () => {
    setPhase("analyzing");
    try {
      const video = videoRef.current;
      if (!video) throw new Error("video ref missing");

      const result = await analyzePostureFromVideo(video);
      stopCamera();

      if (!result) {
        setError("자세를 감지하지 못했어요. 카메라에서 몸 전체가 보이도록 위치를 조정해주세요.");
        setPhase("error");
        return;
      }

      setPostureResult(result);
      setPhase("done");
    } catch {
      stopCamera();
      setError("분석 중 오류가 발생했어요.");
      setPhase("error");
    }
  };

  const handleRetry = () => {
    setError(null);
    setPostureResult(null);
    startCamera();
  };

  const handleDone = () => onComplete(postureResult, false);
  const handleSkip = () => { stopCamera(); onComplete(null, true); };

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">

        {/* ── 유도 화면 ── */}
        {phase === "prompt" && (
          <motion.div
            key="prompt"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-5"
          >
            <div className="flex items-center justify-center mb-2">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="5" r="2.5" fill="#3182F6" />
                  <path d="M8.5 9.5C8 12 8 15 8 17h2l1-4 1 4h2c0-2 0-5-.5-7.5" fill="none" stroke="#3182F6" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M8.5 11L6 15M15.5 11L18 15" stroke="#3182F6" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-[22px] font-bold text-text-primary leading-snug tracking-tight mb-2">
                AI가 <span className="text-primary">체형·자세</span>를<br />직접 분석할게요
              </h2>
              <p className="text-[14px] text-text-caption leading-relaxed">
                카메라로 전신 자세를 스캔해<br />운동 처방 정확도를 높여드려요
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: "🫀", label: "전방 두부" },
                { icon: "⚖️", label: "어깨 균형" },
                { icon: "🦴", label: "골반 정렬" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-bg-warm">
                  <span className="text-[22px]">{item.icon}</span>
                  <span className="text-[12px] font-semibold text-text-secondary">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-bg-warm">
              <span className="text-[18px] mt-0.5">🔒</span>
              <p className="text-[13px] text-text-secondary leading-snug">
                촬영 데이터는 기기 내에서만 처리돼요.<br />서버에 저장되지 않아요.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-danger/5 border border-danger/20">
                <p className="text-[13px] text-danger">{error}</p>
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={startCamera}
              disabled={modelLoading}
              className="w-full py-4 rounded-2xl bg-primary text-white text-[17px] font-bold shadow-button active:brightness-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {modelLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  AI 모델 준비 중...
                </>
              ) : "카메라로 자세 분석 시작"}
            </motion.button>

            <button
              onClick={handleSkip}
              className="w-full py-3 text-[14px] text-text-caption font-medium text-center"
            >
              나중에 할게요
              <span className="block text-[12px] text-text-disabled font-normal mt-0.5">
                건너뛰면 기본 처방이 적용돼요
              </span>
            </button>
          </motion.div>
        )}

        {/* ── 카메라 권한 요청 중 ── */}
        {phase === "permission" && (
          <motion.div
            key="permission"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 gap-4"
          >
            <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-[15px] text-text-secondary font-medium">카메라 켜는 중...</p>
          </motion.div>
        )}

        {/* ── 카메라 + 카운트다운 / 분석 중 ── */}
        {(phase === "countdown" || phase === "analyzing") && (
          <motion.div
            key="camera"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-[#0F172A]">
              <video
                ref={videoRef}
                className="w-full h-full object-cover scale-x-[-1]"
                playsInline
                muted
              />

              {/* 실루엣 가이드 */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <svg viewBox="0 0 200 340" width="150" height="255" fill="none" className="opacity-50">
                  <circle cx="100" cy="38" r="26" stroke="white" strokeWidth="2" strokeDasharray="6 4" />
                  <path d="M70 70 Q62 110 60 160 L140 160 Q138 110 130 70 Z" stroke="white" strokeWidth="2" strokeDasharray="6 4" fill="none" />
                  <path d="M70 80 Q46 120 44 168" stroke="white" strokeWidth="2" strokeDasharray="6 4" />
                  <path d="M130 80 Q154 120 156 168" stroke="white" strokeWidth="2" strokeDasharray="6 4" />
                  <path d="M83 160 Q77 222 75 292" stroke="white" strokeWidth="2" strokeDasharray="6 4" />
                  <path d="M117 160 Q123 222 125 292" stroke="white" strokeWidth="2" strokeDasharray="6 4" />
                </svg>
              </div>

              {/* 카운트다운 */}
              {phase === "countdown" && countdown > 0 && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={countdown}
                    initial={{ scale: 1.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/50"
                  >
                    <span className="text-[80px] font-black text-white drop-shadow-lg">{countdown}</span>
                  </motion.div>
                </AnimatePresence>
              )}

              {/* 분석 중 */}
              {phase === "analyzing" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 gap-4"
                >
                  <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <p className="text-white text-[15px] font-semibold">AI 자세 분석 중...</p>
                </motion.div>
              )}

              {phase === "countdown" && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-white text-[13px] font-semibold text-center">
                    {countdown > 0 ? "실루엣 안에 몸 전체를 맞춰주세요" : "자세를 유지해주세요!"}
                  </p>
                </div>
              )}
            </div>
            <p className="text-[13px] text-text-caption text-center">
              {phase === "countdown" ? `${countdown}초 후 자동 촬영` : "MediaPipe AI가 포즈를 분석하고 있어요"}
            </p>
          </motion.div>
        )}

        {/* ── 에러 / 재시도 ── */}
        {phase === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-5 py-8"
          >
            <div className="w-16 h-16 rounded-full bg-[#FF9500]/10 flex items-center justify-center">
              <span className="text-[32px]">⚠️</span>
            </div>
            <div className="text-center">
              <p className="text-[16px] font-bold text-text-primary mb-1">자세 감지 실패</p>
              <p className="text-[14px] text-text-caption leading-relaxed">{error}</p>
            </div>
            <button onClick={handleRetry} className="w-full py-4 rounded-2xl bg-primary text-white text-[16px] font-bold">
              다시 시도하기
            </button>
            <button onClick={handleSkip} className="text-[14px] text-text-caption font-medium py-2">
              건너뛰기
            </button>
          </motion.div>
        )}

        {/* ── 결과 화면 ── */}
        {phase === "done" && postureResult && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-4"
          >
            {/* 점수 */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-bg-warm">
              <div className="relative w-[72px] h-[72px] flex-shrink-0">
                <svg width="72" height="72" viewBox="0 0 72 72">
                  <circle cx="36" cy="36" r="30" fill="none" stroke="#E5E8EB" strokeWidth="6" />
                  <circle
                    cx="36" cy="36" r="30" fill="none"
                    stroke={postureResult.metrics.score >= 80 ? "#34C759" : postureResult.metrics.score >= 60 ? "#FF9500" : "#FF3B30"}
                    strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={`${(postureResult.metrics.score / 100) * 188.5} 188.5`}
                    transform="rotate(-90 36 36)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[20px] font-black text-text-primary leading-none">{postureResult.metrics.score}</span>
                  <span className="text-[10px] text-text-caption">점</span>
                </div>
              </div>
              <div>
                <p className="text-[12px] font-semibold text-text-caption mb-1">자세 분석 완료</p>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${GRADE_CONFIG[postureResult.grade].bg} mb-1`}>
                  <span className="text-[14px]">{GRADE_CONFIG[postureResult.grade].icon}</span>
                  <span className={`text-[13px] font-bold ${GRADE_CONFIG[postureResult.grade].color}`}>
                    {GRADE_CONFIG[postureResult.grade].label}
                  </span>
                </div>
                <p className="text-[12px] text-text-caption">결과가 운동 처방에 반영돼요</p>
              </div>
            </div>

            {/* 항목별 상태 */}
            <div className="space-y-2">
              <p className="text-[13px] font-bold text-text-secondary px-1">분석 항목</p>
              {[
                { label: "전방 두부 자세", value: postureResult.metrics.forwardHead, thresholds: [0.12, 0.25] },
                { label: "어깨 대칭", value: postureResult.metrics.shoulderAsymmetry, thresholds: [0.03, 0.06] },
                { label: "골반 정렬", value: postureResult.metrics.hipAsymmetry, thresholds: [0.025, 0.05] },
              ].map((item) => {
                const s = item.value <= item.thresholds[0]
                  ? { label: "양호", color: "text-success", dot: "bg-success" }
                  : item.value <= item.thresholds[1]
                  ? { label: "주의", color: "text-[#FF9500]", dot: "bg-[#FF9500]" }
                  : { label: "교정 필요", color: "text-danger", dot: "bg-danger" };
                return (
                  <div key={item.label} className="flex items-center justify-between px-4 py-3 rounded-2xl bg-bg-warm">
                    <span className="text-[14px] text-text-primary font-medium">{item.label}</span>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                      <span className={`text-[13px] font-bold ${s.color}`}>{s.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI 피드백 */}
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/15">
              <p className="text-[12px] font-bold text-primary mb-2">AI 코치 피드백</p>
              {postureResult.findings.map((f, i) => (
                <p key={i} className="text-[13px] text-text-secondary leading-snug mb-1 last:mb-0">• {f}</p>
              ))}
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleDone}
              className="w-full py-4 rounded-2xl bg-primary text-white text-[17px] font-bold shadow-button"
            >
              맞춤 프로그램 만들기
            </motion.button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
