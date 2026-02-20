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
          <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="text-[11px] font-semibold" fill="#8B95A1">
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
      <div className="relative bg-gradient-to-br from-primary via-[#4B95F9] to-[#6BABFF] px-5 pt-5 pb-12 overflow-hidden">
        <div className="flex items-center justify-between mb-8">
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

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-[13px] text-white/60 font-medium mb-1">
            {nickname}님의 체력 리포트
          </p>
          <h1 className="text-[26px] font-bold text-white leading-tight tracking-tight">
            스포츠 나이
          </h1>
          <div className="flex items-baseline gap-2 mt-3">
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

        {/* Decorative elements */}
        <div className="absolute top-8 right-4 w-24 h-24 rounded-full bg-white/[0.04] blur-xl" />
        <div className="absolute bottom-2 right-12 w-16 h-16 rounded-full bg-white/[0.06] blur-lg" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/[0.03] blur-2xl" />
      </div>

      {/* Content */}
      <div className="flex-1 -mt-4 bg-bg-primary rounded-t-3xl relative z-10 px-5 pt-6 pb-10">
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

        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <Card variant="elevated" className="mb-5">
              <h2 className="text-[16px] font-bold text-text-primary tracking-tight mb-1">
                {isNonExerciser ? "건강한 일상을 위한 추천 운동" : `${sportLabel} 퍼포먼스를 위한 추천 운동`}
              </h2>
              <p className="text-[13px] text-text-caption mb-4">준비운동 → 본운동 → 마무리운동 순서로 구성</p>
              <div className="space-y-3">
                {recommendations.map((rec: { id: string; name: string; description: string; targetArea: string; sets: number; reps: number; benefit?: string }, i: number) => {
                  const phase = i === 0 ? "준비운동" : i === recommendations.length - 1 ? "마무리" : "본운동";
                  const phaseColor = i === 0 ? "text-[#FF9500] bg-[#FF9500]/8" : i === recommendations.length - 1 ? "text-[#34C759] bg-[#34C759]/8" : "text-primary bg-primary/8";
                  return (
                    <div key={rec.id} className="flex gap-3 p-3 rounded-xl bg-bg-warm">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-[13px] font-bold ${phaseColor}`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-[14px] font-semibold text-text-primary">{rec.name}</p>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${phaseColor}`}>{phase}</span>
                        </div>
                        <p className="text-[12px] text-text-caption">{rec.targetArea} · {rec.sets}세트 {rec.reps}회</p>
                        {rec.benefit && (
                          <p className="text-[12px] text-primary/80 mt-1">{rec.benefit}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="space-y-3"
        >
          <div className="text-center mb-1">
            <p className="text-[14px] text-text-secondary font-medium">
              맞춤 트레이닝을 시작해보세요
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
            트레이닝 시작하기
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
