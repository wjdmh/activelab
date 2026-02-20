"use client";

import { useState } from "react";
import { SARCF_DIFFICULTY_OPTIONS, SARCF_FALL_OPTIONS } from "@/lib/constants";
import type { SarcFDifficulty, SarcFFallCount } from "@/types/assessment";

interface Props {
  sarcfLift: SarcFDifficulty | null;
  sarcfChair: SarcFDifficulty | null;
  sarcfStair: SarcFDifficulty | null;
  sarcfFall: SarcFFallCount | null;
  onLiftChange: (v: SarcFDifficulty) => void;
  onChairChange: (v: SarcFDifficulty) => void;
  onStairChange: (v: SarcFDifficulty) => void;
  onFallChange: (v: SarcFFallCount) => void;
}

const SARCF_CHECKS = [
  {
    key: "lift" as const,
    title: "물건 들기",
    question: "2L 생수 두 개 정도를 한번에 들거나 나르는 것이 힘드신가요?",
    hint: null,
    type: "difficulty" as const,
  },
  {
    key: "chair" as const,
    title: "의자에서 일어나기",
    question: "팔걸이 없이 혼자 의자에서 일어나는 것이 힘드신가요?",
    hint: null,
    type: "difficulty" as const,
  },
  {
    key: "stair" as const,
    title: "계단 오르기",
    question: "아파트 1층 계단(약 10개)을 쉬지 않고 오를 수 있나요?",
    hint: null,
    type: "difficulty" as const,
  },
  {
    key: "fall" as const,
    title: "낙상 경험",
    question: "지난 1년 동안 넘어진 적이 있나요?",
    hint: "살짝 비틀거린 것은 제외하고, 완전히 넘어진 경우만 세주세요",
    type: "fall" as const,
  },
] as const;

export function SarcfStep({
  sarcfLift,
  sarcfChair,
  sarcfStair,
  sarcfFall,
  onLiftChange,
  onChairChange,
  onStairChange,
  onFallChange,
}: Props) {
  const values = {
    lift: sarcfLift,
    chair: sarcfChair,
    stair: sarcfStair,
    fall: sarcfFall,
  };

  const handlers = {
    lift: onLiftChange,
    chair: onChairChange,
    stair: onStairChange,
    fall: onFallChange,
  };

  const [expandedIndex, setExpandedIndex] = useState(0);
  const completedCount = [sarcfLift, sarcfChair, sarcfStair, sarcfFall].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-success/10 text-success text-[13px] font-semibold mb-3">
          SARC-F 체력 검사
        </div>
        <h1 className="text-[26px] font-bold text-text-primary leading-[1.35] tracking-tight">
          일상생활 체크
        </h1>
        <p className="text-[15px] text-text-caption mt-3">
          4가지 체크로 근력 건강 점수를 산출해드려요
        </p>
        <div className="flex items-center gap-2 mt-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                i < completedCount ? "bg-success" : "bg-border-card"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {SARCF_CHECKS.map((check, idx) => {
          const isExpanded = expandedIndex === idx;
          const currentValue = values[check.key];
          const isDone = currentValue !== null;
          const options = check.type === "fall" ? SARCF_FALL_OPTIONS : SARCF_DIFFICULTY_OPTIONS;

          return (
            <div
              key={check.key}
              className={`rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
                isDone && !isExpanded
                  ? "border-success/20 bg-success/5"
                  : isExpanded
                  ? "border-success/40 bg-bg-card"
                  : "border-transparent bg-bg-card shadow-card"
              }`}
            >
              <button
                onClick={() => setExpandedIndex(idx)}
                className="w-full px-5 py-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold ${
                    isDone ? "bg-success text-white" : "bg-bg-warm text-text-caption"
                  }`}>
                    {isDone ? "✓" : idx + 1}
                  </span>
                  <div>
                    <span className="text-[17px] font-semibold text-text-primary">{check.title}</span>
                    {isDone && !isExpanded && (
                      <span className="block text-[13px] text-success font-medium mt-0.5">
                        {options.find((o) => o.id === currentValue)?.label}
                      </span>
                    )}
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-text-caption transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 space-y-3">
                  <div className="px-3 py-2 rounded-xl bg-bg-warm/60 mb-4">
                    <p className="text-[15px] font-medium text-text-secondary">{check.question}</p>
                    {check.hint && (
                      <p className="text-[13px] text-text-caption mt-1">{check.hint}</p>
                    )}
                  </div>
                  {options.map((opt) => {
                    const isSelected = currentValue === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          (handlers[check.key] as (v: string) => void)(opt.id);
                          if (idx < 3) setTimeout(() => setExpandedIndex(idx + 1), 300);
                        }}
                        className={`w-full px-4 py-4 rounded-xl border-2 flex items-center gap-3 text-left transition-all duration-200 ${
                          isSelected
                            ? "border-success bg-success/5"
                            : "border-transparent bg-bg-card shadow-card active:scale-[0.98]"
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full shrink-0 ${
                          opt.score === 0 ? "bg-success" : opt.score === 1 ? "bg-warning" : "bg-danger"
                        }`} />
                        <div>
                          <span className={`text-[17px] font-semibold block ${isSelected ? "text-success" : opt.id === "unable" ? "text-text-disabled" : "text-text-primary"}`}>
                            {opt.label}
                          </span>
                          {"description" in opt && (
                            <span className={`text-[13px] ${opt.score === 0 ? "text-success" : opt.score === 1 ? "text-warning" : "text-danger"}`}>{(opt as { description: string }).description}</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
