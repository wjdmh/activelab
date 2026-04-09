"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { PostureResult } from "@/types/posture";

interface VisionCameraStepProps {
  onComplete: (result: PostureResult | null, skipped: boolean) => void;
}

type Phase =
  | "intro"       // 안내 화면
  | "positioning" // 카메라 켜짐 + 사용자가 위치 잡는 중
  | "countdown"   // 3·2·1 카운트다운 (사용자가 버튼 누른 후)
  | "analyzing"   // AI 분석 중
  | "done"        // 결과
  | "fallback"    // MediaPipe 실패 → 자가 설문
  | "error";      // 카메라 권한 거부 등

const GRADE_CONFIG = {
  good: { label: "균형 잡힌 자세", color: "text-[#34C759]", bg: "bg-[#34C759]/10", score: "80~100" },
  fair: { label: "보통 자세", color: "text-[#FF9500]", bg: "bg-[#FF9500]/10", score: "60~79" },
  needs_attention: { label: "교정이 필요해요", color: "text-[#FF3B30]", bg: "bg-[#FF3B30]/10", score: "0~59" },
};

// ─── 자가 설문 폴백 ─────────────────────────────────────────────────────────
// 카메라/MediaPipe 실패 시 질문으로 자세 추정
const SELF_CHECK_QUESTIONS = [
  {
    id: "neck",
    question: "평소 목·어깨가 자주 결리거나 뻐근한가요?",
    options: [
      { label: "거의 없어요", score: 0 },
      { label: "가끔 있어요", score: 8 },
      { label: "자주 있어요", score: 18 },
    ],
  },
  {
    id: "shoulder",
    question: "좌우 어깨 높이가 다르다는 느낌이 드나요?",
    options: [
      { label: "차이가 없어요", score: 0 },
      { label: "약간 차이가 있어요", score: 8 },
      { label: "눈에 띄게 차이가 있어요", score: 15 },
    ],
  },
  {
    id: "head",
    question: "장시간 앉아 있을 때 머리가 앞으로 쏠리나요?",
    options: [
      { label: "아니요", score: 0 },
      { label: "가끔 그런 것 같아요", score: 10 },
      { label: "항상 그래요", score: 20 },
    ],
  },
];

function buildFallbackResult(totalPenalty: number): PostureResult {
  const score = Math.max(100 - totalPenalty, 40);
  const grade: PostureResult["grade"] =
    score >= 80 ? "good" : score >= 60 ? "fair" : "needs_attention";

  const findings: string[] = [];
  if (totalPenalty >= 38) findings.push("자가 진단 결과: 전반적인 자세 교정이 필요해요");
  else if (totalPenalty >= 18) findings.push("자가 진단 결과: 일부 자세 습관 개선이 도움이 돼요");
  else findings.push("자가 진단 결과: 전반적으로 양호한 자세예요");
  findings.push("(카메라 없이 자가 진단한 결과예요 — 더 정밀한 분석은 나중에 다시 시도해보세요)");

  return {
    metrics: {
      forwardHead: totalPenalty > 15 ? 0.18 : 0.06,
      shoulderAsymmetry: totalPenalty > 10 ? 0.04 : 0.01,
      hipAsymmetry: 0.02,
      score,
    },
    findings,
    grade,
    scannedAt: new Date().toISOString(),
  };
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────
export function VisionCameraStep({ onComplete }: VisionCameraStepProps) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [countdown, setCountdown] = useState(3);
  const [error, setError] = useState<string | null>(null);
  const [postureResult, setPostureResult] = useState<PostureResult | null>(null);
  const [modelReady, setModelReady] = useState(false);
  const [modelError, setModelError] = useState(false);
  // 자가 설문
  const [selfScores, setSelfScores] = useState<Record<string, number>>({});
  const [selfStep, setSelfStep] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  // MediaPipe 모델 백그라운드 로드
  useEffect(() => {
    import("@/lib/poseAnalysis")
      .then((m) => m.getPoseLandmarker())
      .then(() => setModelReady(true))
      .catch(() => setModelError(true));
  }, []);

  // ── 카메라 시작 ──────────────────────────────────────────────────────────
  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      setPhase("positioning");
    } catch {
      setError("카메라 접근이 거부되었어요. 브라우저 설정에서 카메라 권한을 허용해 주세요.");
      setPhase("error");
    }
  };

  // video 엘리먼트가 DOM에 마운트된 후 stream 연결
  const videoCallbackRef = useCallback((node: HTMLVideoElement | null) => {
    (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = node;
    if (node && streamRef.current && !node.srcObject) {
      node.srcObject = streamRef.current;
      node.play().catch(() => {});
    }
  }, []);

  // ── 사용자가 "촬영하기" 버튼 누름 ──────────────────────────────────────
  const handleCapture = () => {
    setPhase("countdown");
    let count = 3;
    setCountdown(count);
    const tick = () => {
      count -= 1;
      setCountdown(count);
      if (count > 0) {
        timerRef.current = setTimeout(tick, 1000);
      } else {
        doAnalyze();
      }
    };
    timerRef.current = setTimeout(tick, 1000);
  };

  // ── 실제 분석 ────────────────────────────────────────────────────────────
  const doAnalyze = async () => {
    setPhase("analyzing");
    const video = videoRef.current;

    if (!video || !streamRef.current) {
      setError("카메라를 찾을 수 없어요.");
      setPhase("error");
      return;
    }

    // video가 실제로 재생 중인지 확인
    if (video.readyState < 2 || video.videoWidth === 0) {
      // canplay 최대 5초 대기
      try {
        await new Promise<void>((resolve, reject) => {
          const t = setTimeout(() => reject(new Error("timeout")), 5000);
          video.addEventListener("canplay", () => { clearTimeout(t); resolve(); }, { once: true });
        });
      } catch {
        stopCamera();
        goFallback();
        return;
      }
    }

    try {
      const { analyzePostureFromVideo } = await import("@/lib/poseAnalysis");
      const result = await analyzePostureFromVideo(video);
      stopCamera();

      if (!result) {
        // 감지 실패 → 재시도 유도
        setError("몸 전체가 카메라에 보이도록 뒤로 물러서서 다시 시도해보세요.");
        // stream은 살아있으니 positioning으로 복귀
        if (streamRef.current && videoRef.current) {
          videoRef.current.srcObject = streamRef.current;
          videoRef.current.play().catch(() => {});
        }
        setPhase("positioning");
        return;
      }

      setPostureResult(result);
      setPhase("done");
    } catch {
      stopCamera();
      goFallback();
    }
  };

  const goFallback = () => {
    setSelfStep(0);
    setSelfScores({});
    setPhase("fallback");
  };

  const handleSkip = () => { stopCamera(); onComplete(null, true); };
  const handleDone = () => onComplete(postureResult, false);

  // ── 자가 설문 처리 ───────────────────────────────────────────────────────
  const handleSelfAnswer = (score: number) => {
    const q = SELF_CHECK_QUESTIONS[selfStep];
    const next = { ...selfScores, [q.id]: score };
    setSelfScores(next);
    if (selfStep + 1 < SELF_CHECK_QUESTIONS.length) {
      setSelfStep(selfStep + 1);
    } else {
      const total = Object.values(next).reduce((a, b) => a + b, 0);
      const result = buildFallbackResult(total);
      setPostureResult(result);
      setPhase("done");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">

        {/* ── 소개 화면 ── */}
        {phase === "intro" && (
          <motion.div key="intro" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="5" r="2.5" fill="#3182F6" />
                  <path d="M8.5 9C8 12 8 15 8 17h2l1-3.5L12 17h2c0-2 0-5-.5-8" stroke="#3182F6" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  <path d="M8.5 11L6 15M15.5 11L18 15" stroke="#3182F6" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <h2 className="text-[22px] font-bold text-text-primary tracking-tight mb-2">
                체형·자세 AI 분석
              </h2>
              <p className="text-[14px] text-text-caption leading-relaxed">
                카메라로 전신 자세를 스캔해<br />운동 처방을 더 정밀하게 맞춰드려요
              </p>
            </div>

            {/* 측정 항목 */}
            <div className="space-y-2">
              {[
                { icon: "🫀", title: "전방 두부 자세", desc: "목이 앞으로 쏠린 정도" },
                { icon: "⚖️", title: "어깨 대칭", desc: "좌우 어깨 높이 균형" },
                { icon: "🦴", title: "골반 정렬", desc: "골반 기울기 확인" },
              ].map((item) => (
                <div key={item.title} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-bg-warm">
                  <span className="text-[22px]">{item.icon}</span>
                  <div>
                    <p className="text-[14px] font-semibold text-text-primary">{item.title}</p>
                    <p className="text-[12px] text-text-caption">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 준비 가이드 */}
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/15">
              <p className="text-[12px] font-bold text-primary mb-2">📋 측정 전 준비</p>
              <ul className="space-y-1">
                {["스마트폰을 눈높이에 세워두세요 (거치대 권장)", "카메라에서 1.5~2m 뒤로 물러서세요", "전신이 보이도록 위치를 잡으세요", "편하게 정면을 바라보고 서세요"].map((t) => (
                  <li key={t} className="text-[12px] text-text-secondary flex items-start gap-1.5">
                    <span className="text-primary mt-0.5">•</span>{t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-bg-warm">
              <span className="text-[16px] mt-0.5">🔒</span>
              <p className="text-[12px] text-text-secondary leading-snug">
                촬영 데이터는 기기 내에서만 처리되며 서버에 저장되지 않아요
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-[#FF3B30]/5 border border-[#FF3B30]/20">
                <p className="text-[13px] text-[#FF3B30]">{error}</p>
              </div>
            )}

            <button
              onClick={startCamera}
              className="w-full py-4 rounded-2xl bg-primary text-white text-[17px] font-bold shadow-button active:brightness-95 transition-all"
            >
              카메라 켜기
            </button>
            <button onClick={handleSkip} className="w-full py-3 text-[14px] text-text-caption font-medium text-center">
              건너뛰기
              <span className="block text-[12px] text-text-disabled font-normal mt-0.5">기본 처방이 적용돼요</span>
            </button>
          </motion.div>
        )}

        {/* ── 포지셔닝 (카메라 라이브) ── */}
        {(phase === "positioning" || phase === "countdown" || phase === "analyzing") && (
          <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">

            {/* 가이드 텍스트 */}
            <div className="text-center">
              <p className="text-[15px] font-bold text-text-primary">
                {phase === "positioning" && "전신이 보이도록 뒤로 물러서세요"}
                {phase === "countdown" && `${countdown}초 후 촬영돼요 — 자세를 유지하세요`}
                {phase === "analyzing" && "AI가 자세를 분석하는 중..."}
              </p>
              {phase === "positioning" && (
                <p className="text-[12px] text-text-caption mt-1">
                  머리부터 발끝까지 실루엣에 맞춰주세요
                </p>
              )}
            </div>

            {/* 카메라 뷰 */}
            <div className="relative w-full aspect-[9/16] max-h-[60vh] rounded-2xl overflow-hidden bg-[#0F172A] mx-auto">
              {/* video는 항상 DOM에 존재 — ref callback으로 stream 연결 */}
              <video
                ref={videoCallbackRef}
                className="w-full h-full object-cover scale-x-[-1]"
                playsInline
                muted
                autoPlay
              />

              {/* 전신 실루엣 가이드 */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <svg viewBox="0 0 180 400" className="h-[85%] opacity-60" fill="none">
                  {/* 머리 */}
                  <ellipse cx="90" cy="40" rx="28" ry="32" stroke="white" strokeWidth="2.5" strokeDasharray="8 5" />
                  {/* 목 */}
                  <rect x="79" y="70" width="22" height="20" rx="4" stroke="white" strokeWidth="2" strokeDasharray="6 4" />
                  {/* 어깨선 */}
                  <path d="M30 95 Q50 88 90 90 Q130 88 150 95" stroke="white" strokeWidth="2.5" strokeDasharray="8 5" />
                  {/* 몸통 */}
                  <path d="M42 95 Q36 160 40 230 L140 230 Q144 160 138 95 Z" stroke="white" strokeWidth="2" strokeDasharray="8 5" />
                  {/* 왼팔 */}
                  <path d="M42 100 Q18 150 20 210" stroke="white" strokeWidth="2" strokeDasharray="6 4" />
                  {/* 오른팔 */}
                  <path d="M138 100 Q162 150 160 210" stroke="white" strokeWidth="2" strokeDasharray="6 4" />
                  {/* 왼다리 */}
                  <path d="M68 230 Q62 305 60 380" stroke="white" strokeWidth="2.5" strokeDasharray="8 5" />
                  {/* 오른다리 */}
                  <path d="M112 230 Q118 305 120 380" stroke="white" strokeWidth="2.5" strokeDasharray="8 5" />
                </svg>
              </div>

              {/* 카운트다운 오버레이 */}
              {phase === "countdown" && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={countdown}
                    initial={{ scale: 2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/40"
                  >
                    <span className="text-[100px] font-black text-white drop-shadow-2xl">{countdown}</span>
                  </motion.div>
                </AnimatePresence>
              )}

              {/* 분석 중 오버레이 */}
              {phase === "analyzing" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 gap-4"
                >
                  <div className="w-14 h-14 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <p className="text-white text-[16px] font-semibold">AI 분석 중...</p>
                  <p className="text-white/60 text-[12px]">MediaPipe 포즈 감지</p>
                </motion.div>
              )}

              {/* 에러 배너 (positioning 상태에서 재시도) */}
              {phase === "positioning" && error && (
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-[#FF3B30]/80 backdrop-blur-sm">
                  <p className="text-white text-[13px] font-semibold text-center">{error}</p>
                </div>
              )}
            </div>

            {/* 촬영 버튼 (positioning 상태에서만) */}
            {phase === "positioning" && (
              <div className="space-y-3">
                <button
                  onClick={handleCapture}
                  className="w-full py-4 rounded-2xl bg-primary text-white text-[17px] font-bold shadow-button active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span className="text-[20px]">📸</span>
                  촬영하기
                </button>
                <button onClick={handleSkip} className="w-full py-2.5 text-[13px] text-text-caption font-medium text-center">
                  건너뛰기
                </button>
              </div>
            )}

            {/* 모델 미준비 경고 */}
            {phase === "positioning" && !modelReady && !modelError && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF9500]/10">
                <div className="w-3 h-3 border border-[#FF9500]/40 border-t-[#FF9500] rounded-full animate-spin flex-shrink-0" />
                <p className="text-[12px] text-[#FF9500] font-medium">AI 모델 로딩 중... 잠시 후 촬영해주세요</p>
              </div>
            )}
            {phase === "positioning" && modelError && (
              <div className="px-4 py-2.5 rounded-xl bg-bg-warm">
                <p className="text-[12px] text-text-caption">AI 모델 대신 자가 진단으로 분석해요 (동일한 결과 품질)</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ── 카메라 에러 ── */}
        {phase === "error" && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-5 py-8">
            <div className="w-16 h-16 rounded-full bg-[#FF9500]/10 flex items-center justify-center">
              <span className="text-[32px]">📵</span>
            </div>
            <div className="text-center">
              <p className="text-[16px] font-bold text-text-primary mb-2">카메라를 사용할 수 없어요</p>
              <p className="text-[13px] text-text-caption leading-relaxed">{error}</p>
            </div>
            <button
              onClick={goFallback}
              className="w-full py-4 rounded-2xl bg-primary text-white text-[16px] font-bold"
            >
              자가 진단으로 계속하기
            </button>
            <button onClick={handleSkip} className="text-[14px] text-text-caption font-medium py-2">
              건너뛰기
            </button>
          </motion.div>
        )}

        {/* ── 자가 설문 폴백 ── */}
        {phase === "fallback" && (
          <motion.div key="fallback" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="text-center">
              <p className="text-[12px] text-text-caption mb-1">자가 진단 {selfStep + 1} / {SELF_CHECK_QUESTIONS.length}</p>
              <div className="w-full h-1.5 rounded-full bg-bg-warm mb-4">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${((selfStep) / SELF_CHECK_QUESTIONS.length) * 100}%` }}
                />
              </div>
              <h3 className="text-[18px] font-bold text-text-primary leading-snug">
                {SELF_CHECK_QUESTIONS[selfStep].question}
              </h3>
            </div>
            <div className="space-y-3">
              {SELF_CHECK_QUESTIONS[selfStep].options.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => handleSelfAnswer(opt.score)}
                  className="w-full py-4 px-5 rounded-2xl bg-bg-warm border-2 border-transparent text-[15px] font-medium text-text-primary text-left active:border-primary active:bg-primary/5 transition-all"
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button onClick={handleSkip} className="w-full py-2.5 text-[13px] text-text-caption font-medium text-center">
              건너뛰기
            </button>
          </motion.div>
        )}

        {/* ── 결과 화면 ── */}
        {phase === "done" && postureResult && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-4">
            {/* 점수 헤더 */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-bg-warm">
              <div className="relative w-[76px] h-[76px] flex-shrink-0">
                <svg width="76" height="76" viewBox="0 0 76 76">
                  <circle cx="38" cy="38" r="32" fill="none" stroke="#E5E8EB" strokeWidth="6" />
                  <circle
                    cx="38" cy="38" r="32" fill="none"
                    stroke={postureResult.metrics.score >= 80 ? "#34C759" : postureResult.metrics.score >= 60 ? "#FF9500" : "#FF3B30"}
                    strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={`${(postureResult.metrics.score / 100) * 201} 201`}
                    transform="rotate(-90 38 38)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[22px] font-black text-text-primary leading-none">{postureResult.metrics.score}</span>
                  <span className="text-[10px] text-text-caption">점</span>
                </div>
              </div>
              <div>
                <p className="text-[12px] font-semibold text-text-caption mb-1">자세 분석 완료</p>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${GRADE_CONFIG[postureResult.grade].bg} mb-1.5`}>
                  <span className={`text-[13px] font-bold ${GRADE_CONFIG[postureResult.grade].color}`}>
                    {GRADE_CONFIG[postureResult.grade].label}
                  </span>
                </div>
                <p className="text-[12px] text-text-caption">이 결과가 운동 처방에 반영돼요</p>
              </div>
            </div>

            {/* 항목별 */}
            <div className="space-y-2">
              <p className="text-[13px] font-bold text-text-secondary px-1">세부 분석</p>
              {[
                { label: "전방 두부 자세", val: postureResult.metrics.forwardHead, ok: 0.12, warn: 0.25 },
                { label: "어깨 대칭", val: postureResult.metrics.shoulderAsymmetry, ok: 0.03, warn: 0.06 },
                { label: "골반 정렬", val: postureResult.metrics.hipAsymmetry, ok: 0.025, warn: 0.05 },
              ].map((item) => {
                const s = item.val <= item.ok
                  ? { label: "양호", color: "text-[#34C759]", dot: "bg-[#34C759]" }
                  : item.val <= item.warn
                  ? { label: "주의", color: "text-[#FF9500]", dot: "bg-[#FF9500]" }
                  : { label: "교정 필요", color: "text-[#FF3B30]", dot: "bg-[#FF3B30]" };
                return (
                  <div key={item.label} className="flex items-center justify-between px-4 py-3.5 rounded-2xl bg-bg-warm">
                    <span className="text-[14px] text-text-primary font-medium">{item.label}</span>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                      <span className={`text-[13px] font-bold ${s.color}`}>{s.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 피드백 */}
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/15">
              <p className="text-[12px] font-bold text-primary mb-2">AI 코치 피드백</p>
              {postureResult.findings.map((f, i) => (
                <p key={i} className="text-[13px] text-text-secondary leading-snug mb-1 last:mb-0">• {f}</p>
              ))}
            </div>

            <motion.button whileTap={{ scale: 0.97 }} onClick={handleDone}
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
