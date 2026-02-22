"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAssessmentStore } from "@/stores/useAssessmentStore";
import { useUserStore } from "@/stores/useUserStore";
import { useHydration } from "@/hooks/useHydration";
import { createClient } from "@/lib/supabase/client";

// Simple SVG Radar Chart
function RadarChartSimple({ data }: { data: { label: string; value: number }[] }) {
  const size = 240;
  const center = size / 2;
  const radius = 90;
  const levels = 5;
  const angleStep = (2 * Math.PI) / data.length;

  const getPoint = (index: number, value: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const r = (value / 100) * radius;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };

  const polygonPoints = data.map((d, i) => {
    const p = getPoint(i, d.value);
    return `${p.x},${p.y}`;
  }).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {Array.from({ length: levels }, (_, level) => {
        const r = (radius * (level + 1)) / levels;
        const points = data.map((_, i) => {
          const angle = angleStep * i - Math.PI / 2;
          return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
        }).join(" ");
        return (
          <polygon key={level} points={points} fill="none" stroke="#E5E8EB" strokeWidth="0.5" />
        );
      })}
      {data.map((_, i) => {
        const p = getPoint(i, 100);
        return (
          <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#E5E8EB" strokeWidth="0.5" />
        );
      })}
      <polygon points={polygonPoints} fill="rgba(49, 130, 246, 0.15)" stroke="#3182F6" strokeWidth="2" />
      {data.map((d, i) => {
        const p = getPoint(i, d.value);
        return <circle key={i} cx={p.x} cy={p.y} r="4" fill="#3182F6" />;
      })}
      {data.map((d, i) => {
        const labelRadius = radius + 24;
        const angle = angleStep * i - Math.PI / 2;
        const x = center + labelRadius * Math.cos(angle);
        const y = center + labelRadius * Math.sin(angle);
        return (
          <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="text-[12px] font-bold" fill="#4E5968">
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}

// Bold text renderer
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="font-bold text-text-primary">{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// AI 코멘트를 문장 단위로 구조화
function StructuredComment({ text }: { text: string }) {
  // 문장을 2~3문장씩 묶어서 섹션으로 나눔
  const sentences = text.split(/(?<=[.!?。])\s+/).filter(Boolean);
  if (sentences.length <= 2) {
    return <p className="text-[14px] text-text-secondary leading-relaxed"><RichText text={text} /></p>;
  }

  const strengthPart = sentences.slice(0, 2).join(" ");
  const improvePart = sentences.slice(2, 4).join(" ");
  const summaryPart = sentences.slice(4).join(" ");

  return (
    <div className="space-y-3">
      {strengthPart && (
        <div>
          <p className="text-[12px] font-bold text-success mb-0.5">강점</p>
          <p className="text-[14px] text-text-secondary leading-relaxed"><RichText text={strengthPart} /></p>
        </div>
      )}
      {improvePart && (
        <div>
          <p className="text-[12px] font-bold text-warning mb-0.5">개선 포인트</p>
          <p className="text-[14px] text-text-secondary leading-relaxed"><RichText text={improvePart} /></p>
        </div>
      )}
      {summaryPart && (
        <div>
          <p className="text-[12px] font-bold text-primary mb-0.5">코칭 방향</p>
          <p className="text-[14px] text-text-secondary leading-relaxed"><RichText text={summaryPart} /></p>
        </div>
      )}
    </div>
  );
}

export default function ReportPage() {
  const hydrated = useHydration();
  const router = useRouter();
  const result = useAssessmentStore((s) => s.result);
  const hasCompleted = useUserStore((s) => s.hasCompletedAssessment);

  const shouldRedirect = hydrated && !result && !hasCompleted;

  useEffect(() => {
    if (shouldRedirect) router.replace("/");
  }, [shouldRedirect, router]);

  if (!hydrated || shouldRedirect) return null;

  if (!result) {
    return (
      <div className="flex flex-col min-h-dvh bg-bg-primary items-center justify-center px-6">
        <div className="w-20 h-20 rounded-full bg-primary/8 flex items-center justify-center mb-5">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="#3182F6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="text-[20px] font-bold text-text-primary tracking-tight mb-2">아직 리포트가 없어요</h2>
        <p className="text-[14px] text-text-caption text-center leading-relaxed mb-6 max-w-[240px]">3분 만에 체력 진단을 받고<br />맞춤 리포트를 확인해보세요</p>
        <Button onClick={() => router.push("/coach")}>체력 진단 시작하기</Button>
      </div>
    );
  }

  const nickname = result.profile?.nickname || "";
  const chronAge = result.chronologicalAge || result.profile?.age || 60;
  const sportLabel = result.profile?.sportLabel || "";
  const isNonExerciser = !sportLabel || sportLabel === "운동 안 함" || sportLabel === "none";
  const { sportsAge, radarData, peerAverage, aiComment, recommendations } = result;

  const avgScore = radarData.length > 0
    ? Math.round(radarData.reduce((a, b) => a + b.value, 0) / radarData.length)
    : 0;

  const ageDiff = chronAge - sportsAge;
  const ageLabel = ageDiff > 0 ? `실제 나이보다 ${ageDiff}세 젊어요!` : ageDiff < 0 ? `체력 나이가 ${Math.abs(ageDiff)}세 더 높아요` : "실제 나이와 같아요";

  return (
    <div className="flex flex-col min-h-dvh bg-bg-primary">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-primary via-[#4B95F9] to-[#6BABFF] px-5 pt-5 pb-16 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center active:bg-white/25 transition-colors"
            aria-label="뒤로 가기"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 19l-7-7 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="text-[13px] font-semibold text-white/70 tracking-wide">체력 분석 리포트</span>
          <div className="w-9" />
        </div>

        <div className="flex items-end justify-between">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1"
          >
            <p className="text-[13px] text-white/60 font-medium mb-1">
              {nickname}님의 체력 리포트
            </p>
            <h1 className="text-[26px] font-bold text-white leading-tight tracking-tight">
              스포츠 나이
            </h1>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-[52px] font-black text-white leading-none">
                {sportsAge}
              </span>
              <span className="text-[18px] font-bold text-white/60">세</span>
            </div>
            <div className="mt-3 inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <span className="text-[13px] font-semibold text-white">
                {ageLabel}
              </span>
            </div>
          </motion.div>

          {/* Score gauge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-shrink-0 ml-4"
          >
            <div className="relative w-[100px] h-[100px]">
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="white" strokeOpacity="0.15" strokeWidth="6" />
                <circle
                  cx="50" cy="50" r="42"
                  fill="none"
                  stroke="white"
                  strokeOpacity="0.9"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${(avgScore / 100) * 263.9} 263.9`}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[24px] font-black text-white leading-none">{avgScore}</span>
                <span className="text-[10px] font-semibold text-white/60 mt-0.5">체력 점수</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-6 right-0 w-40 h-40 rounded-full bg-white/[0.04] blur-2xl" />
        <div className="absolute top-20 right-24 w-20 h-20 rounded-full bg-white/[0.06] blur-xl" />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-white/[0.05] blur-2xl" />
        <div className="absolute bottom-10 left-1/3 w-12 h-12 rounded-full bg-white/[0.04] blur-lg" />

        {/* Bottom wave decoration */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 375 24" fill="none" preserveAspectRatio="none" style={{ height: 24 }}>
          <path d="M0 24V12C62.5 0 125 0 187.5 6C250 12 312.5 18 375 12V24H0Z" fill="var(--color-bg-primary, #F7F8FA)" />
        </svg>
      </div>

      {/* Content */}
      <div className="flex-1 bg-bg-primary relative z-10 px-5 pt-2 pb-10">
        {/* Age Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card variant="elevated" className="mb-5">
            <h2 className="text-[16px] font-bold text-text-primary tracking-tight mb-4">
              나이대 비교
            </h2>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] font-semibold text-primary">내 체력 점수</span>
                  <span className="text-[15px] font-bold text-primary">{avgScore}점</span>
                </div>
                <div className="h-3 bg-bg-warm rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-[#4B95F9] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${avgScore}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] font-medium text-text-caption">{chronAge}세 평균</span>
                  <span className="text-[15px] font-bold text-text-caption">{peerAverage}점</span>
                </div>
                <div className="h-3 bg-bg-warm rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-text-caption/30 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${peerAverage}%` }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                  />
                </div>
              </div>
            </div>
            {avgScore > peerAverage && (
              <p className="text-[13px] text-primary font-medium mt-3">
                동일 나이대 평균보다 {avgScore - peerAverage}점 높아요! 👏
              </p>
            )}
          </Card>
        </motion.div>

        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card variant="elevated" className="mb-5">
            <h2 className="text-[18px] font-bold text-text-primary tracking-tight mb-4">
              체력 분석
            </h2>
            {radarData.length > 0 && <RadarChartSimple data={radarData} />}
            <div className="space-y-3 mt-4">
              {radarData.map((d) => (
                <div key={d.label} className="flex items-center gap-3">
                  <span className="text-[13px] font-medium text-text-caption w-14 flex-shrink-0">
                    {d.label}
                  </span>
                  <div className="flex-1 h-2 bg-bg-warm rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${d.value}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                    />
                  </div>
                  <span className="text-[13px] font-bold text-primary w-8 text-right">
                    {d.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* AI Comment */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card variant="default" className="mb-5 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[16px]">🏋️‍♂️</span>
              </div>
              <p className="text-[15px] font-bold text-primary mt-1">AI 코치 분석</p>
            </div>
            <StructuredComment text={aiComment} />
          </Card>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card variant="elevated" className="mb-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[18px]">💬</span>
              <h2 className="text-[16px] font-bold text-text-primary tracking-tight">
                실제 사용자들의 변화
              </h2>
            </div>
            <div className="space-y-3">
              {[
                { name: "김*수", sport: "골프", age: 62, review: "스포츠 나이가 5살 젊어졌어요! 라운딩 후 허리 통증도 줄었습니다.", stars: 5 },
                { name: "박*영", sport: "테니스", age: 57, review: "맞춤 트레이닝 덕분에 서브 속도가 확 늘었어요. 코트에서 자신감이 생겼습니다.", stars: 5 },
                { name: "이*희", sport: "등산", age: 65, review: "무릎 걱정 없이 산행을 즐기게 됐어요. 하산할 때 통증이 거의 없어졌습니다.", stars: 5 },
              ].map((t, i) => (
                <div key={i} className="p-4 rounded-2xl bg-bg-warm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-[13px] font-bold text-primary">{t.name[0]}</span>
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-text-primary">{t.name}</p>
                        <p className="text-[11px] text-text-caption">{t.sport} · {t.age}세</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.stars }, (_, j) => (
                        <span key={j} className="text-[12px] text-[#FFB800]">★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-[13px] text-text-secondary leading-relaxed">
                    &ldquo;{t.review}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="space-y-3"
        >
          <div className="text-center mb-1">
            <p className="text-[15px] font-bold text-text-primary tracking-tight">
              나도 변화를 경험해보고 싶다면?
            </p>
            <p className="text-[13px] text-text-caption mt-1">
              내 체력 상태에 딱 맞는 트레이닝을 시작해보세요
            </p>
          </div>
          <Button onClick={async () => {
            try {
              const supabase = createClient();
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                router.push("/");
              } else {
                router.push("/login?next=/");
              }
            } catch {
              router.push("/login?next=/");
            }
          }}>
            나만의 맞춤 트레이닝 경험해보기
          </Button>
          <button
            onClick={() => router.push("/login?next=/")}
            className="w-full min-h-[44px] text-[14px] text-text-caption font-medium text-center flex items-center justify-center"
          >
            이미 회원이신가요? <span className="text-primary font-semibold ml-1">로그인</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
