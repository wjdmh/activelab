"use client";

import { useState, useRef, useEffect } from "react";
import { FITNESS_CHECK_OPTIONS } from "@/lib/constants";
import type { FitnessLevel } from "@/types/assessment";

interface Props {
  flexibilityLevel: FitnessLevel | null;
  lowerStrengthLevel: FitnessLevel | null;
  balanceLevel: FitnessLevel | null;
  onFlexibilityChange: (v: FitnessLevel) => void;
  onStrengthChange: (v: FitnessLevel) => void;
  onBalanceChange: (v: FitnessLevel) => void;
}

const CHECKS = [
  {
    key: "flexibility" as const,
    title: "상체 유연성",
    question: "등 뒤로 양손을 맞잡을 수 있나요?",
    hint: "한 손은 위에서, 한 손은 아래에서 등 뒤로",
  },
  {
    key: "lowerStrength" as const,
    title: "하체 근지구력",
    question: "30초 동안 의자에서 앉았다 일어나기",
    hint: "팔짱을 끼고 최대한 빠르게",
  },
  {
    key: "balance" as const,
    title: "평형성",
    question: "눈을 감고 한 발로 서 있을 수 있나요?",
    hint: "편한 발로, 눈을 감고",
  },
] as const;

export function FitnessCheckStep({
  flexibilityLevel,
  lowerStrengthLevel,
  balanceLevel,
  onFlexibilityChange,
  onStrengthChange,
  onBalanceChange,
}: Props) {
  const values = {
    flexibility: flexibilityLevel,
    lowerStrength: lowerStrengthLevel,
    balance: balanceLevel,
  };
  const handlers = {
    flexibility: onFlexibilityChange,
    lowerStrength: onStrengthChange,
    balance: onBalanceChange,
  };

  const [expandedIndex, setExpandedIndex] = useState(0);

  const [timerState, setTimerState] = useState<'idle' | 'running' | 'done'>('idle');
  const [remainingSeconds, setRemainingSeconds] = useState(30);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    setTimerState("running");
    setRemainingSeconds(30);
    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          setTimerState("done");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setTimerState("done");
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const completedCount = [flexibilityLevel, lowerStrengthLevel, balanceLevel].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div>
        <h1 className="text-[26px] font-bold text-text-primary leading-[1.35] tracking-tight">
          간단한 체력 셀프 체크
        </h1>
        <p className="text-[17px] text-text-caption mt-3">
          3가지 체크로 6개 체력 지표를 분석해드려요
        </p>
        <div className="flex items-center gap-2 mt-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                i < completedCount ? "bg-primary" : "bg-border-card"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {CHECKS.map((check, idx) => {
          const isExpanded = expandedIndex === idx;
          const currentValue = values[check.key];
          const options = FITNESS_CHECK_OPTIONS[check.key];
          const isDone = currentValue !== null;

          return (
            <div
              key={check.key}
              className={`rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
                isDone && !isExpanded
                  ? "border-primary/20 bg-primary/5"
                  : isExpanded
                  ? "border-primary/40 bg-bg-card"
                  : "border-transparent bg-bg-card shadow-card"
              }`}
            >
              <button
                onClick={() => setExpandedIndex(idx)}
                className="w-full px-5 py-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold ${
                    isDone ? "bg-primary text-white" : "bg-bg-warm text-text-caption"
                  }`}>
                    {isDone ? "✓" : idx + 1}
                  </span>
                  <div>
                    <span className="text-[17px] font-semibold text-text-primary">{check.title}</span>
                    {isDone && !isExpanded && (
                      <span className="block text-[13px] text-primary font-medium mt-0.5">
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
                    <p className="text-[13px] text-text-caption mt-1">{check.hint}</p>
                  </div>
                  {check.key === "lowerStrength" && (
                    <div className="flex items-center gap-4 px-3 py-3 rounded-xl bg-primary/5 border border-primary/10 mb-3">
                      {timerState === "idle" && (
                        <button
                          onClick={startTimer}
                          className="px-5 py-2.5 rounded-xl bg-primary text-white text-[15px] font-bold active:opacity-80"
                        >
                          30초 타이머 시작
                        </button>
                      )}
                      {timerState === "running" && (
                        <>
                          <div className="text-[26px] font-bold text-primary tabular-nums">{remainingSeconds}초</div>
                          <button onClick={stopTimer} className="text-[15px] text-text-caption">중지</button>
                        </>
                      )}
                      {timerState === "done" && (
                        <p className="text-[15px] font-medium text-primary">완료! 아래에서 결과를 선택해주세요</p>
                      )}
                    </div>
                  )}
                  {options.map((opt) => {
                    const isSelected = currentValue === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          handlers[check.key](opt.id as FitnessLevel);
                          if (idx < 2) setTimeout(() => setExpandedIndex(idx + 1), 300);
                        }}
                        className={`w-full px-4 py-4 rounded-xl border-2 flex items-center gap-3 text-left transition-all duration-200 ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-transparent bg-bg-card shadow-card active:scale-[0.98]"
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full shrink-0 ${
                          opt.id === "good" ? "bg-success" : opt.id === "poor" ? "bg-danger" : "bg-warning"
                        }`} />
                        <div>
                          <span className={`text-[17px] font-semibold block ${isSelected ? "text-primary" : "text-text-primary"}`}>
                            {opt.label}
                          </span>
                          <span className="text-[13px] text-text-caption">{opt.description}</span>
                        </div>
                      </button>
                    );
                  })}
                  <button
                    onClick={() => {
                      handlers[check.key]("moderate" as FitnessLevel);
                      if (idx < 2) setTimeout(() => setExpandedIndex(idx + 1), 300);
                    }}
                    className={`w-full py-3 text-center text-[15px] font-medium transition-colors ${
                      currentValue === "moderate" ? "text-primary" : "text-text-caption hover:text-text-secondary"
                    }`}
                  >
                    잘 모르겠어요
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
