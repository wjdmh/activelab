"use client";

import { useState } from "react";
import { EXERCISE_HISTORY_OPTIONS, TIME_OPTIONS } from "@/lib/constants";

interface Props {
  exerciseHistory: string[];
  customExerciseHistory: string;
  availableTime: string | null;
  onHistoryChange: (v: string[]) => void;
  onCustomHistoryChange: (v: string) => void;
  onTimeChange: (v: "10min" | "30min" | "60min") => void;
}

export function ExerciseHistoryTimeStep({
  exerciseHistory,
  customExerciseHistory,
  availableTime,
  onHistoryChange,
  onCustomHistoryChange,
  onTimeChange,
}: Props) {
  const [showCustomInput, setShowCustomInput] = useState(exerciseHistory.includes("custom"));

  const toggle = (id: string) => {
    if (id === "none") {
      onHistoryChange(["none"]);
      setShowCustomInput(false);
      onCustomHistoryChange("");
      return;
    }
    if (id === "custom") {
      const filtered = exerciseHistory.filter((s) => s !== "none");
      if (filtered.includes("custom")) {
        onHistoryChange(filtered.filter((s) => s !== "custom"));
        setShowCustomInput(false);
        onCustomHistoryChange("");
      } else {
        onHistoryChange([...filtered, "custom"]);
        setShowCustomInput(true);
      }
      return;
    }
    const filtered = exerciseHistory.filter((s) => s !== "none");
    if (filtered.includes(id)) {
      onHistoryChange(filtered.filter((s) => s !== id));
    } else {
      onHistoryChange([...filtered, id]);
    }
  };

  return (
    <div className="flex flex-col gap-7 pt-4">
      <div>
        <h1 className="text-[26px] font-bold text-text-primary leading-[1.35] tracking-tight">
          맞춤 운동 강도 설정을 위해<br />경험해본 운동을 알려주세요
        </h1>
        <p className="text-[15px] text-text-caption mt-3">
          해당하는 것을 모두 선택해주세요
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {EXERCISE_HISTORY_OPTIONS.map((opt) => {
          const isSelected = exerciseHistory.includes(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => toggle(opt.id)}
              className={`px-4 py-2.5 rounded-xl border-2 text-[15px] font-medium transition-all duration-200 ${
                isSelected
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-transparent bg-bg-card shadow-card text-text-primary active:scale-[0.97]"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {showCustomInput && (
        <input
          type="text"
          value={customExerciseHistory}
          onChange={(e) => onCustomHistoryChange(e.target.value.slice(0, 50))}
          placeholder="어떤 운동인지 알려주세요"
          autoFocus
          className="w-full h-[54px] px-5 text-[17px] text-text-primary bg-bg-card rounded-2xl border-2 border-border-card focus:border-primary focus:shadow-[0_0_0_3px_rgba(255,84,20,0.08)] outline-none transition-all"
        />
      )}

      <div className="flex flex-col gap-3">
        <label className="text-[15px] font-semibold text-text-secondary">
          하루에 얼마나 운동하실 건가요?
        </label>
        <div className="flex flex-col gap-3">
          {TIME_OPTIONS.map((opt) => {
            const selected = availableTime === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onTimeChange(opt.id)}
                className={`w-full px-5 py-4 rounded-2xl border-2 flex items-center justify-between transition-all duration-200 ${
                  selected
                    ? "border-primary bg-primary/5"
                    : "border-transparent bg-bg-card shadow-card active:scale-[0.98]"
                }`}
              >
                <div>
                  <span className={`text-[17px] font-semibold block ${selected ? "text-primary" : "text-text-primary"}`}>
                    {opt.label}
                  </span>
                  <span className="text-[13px] text-text-caption">{opt.description}</span>
                </div>
                {selected && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                      <path d="M3 7l3 3 5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
