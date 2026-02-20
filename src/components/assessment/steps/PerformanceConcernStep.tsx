"use client";

import { useState } from "react";
import { PERFORMANCE_CONCERN_OPTIONS } from "@/lib/constants";

interface Props {
  sports: string[];
  selected: string[];
  customConcern: string;
  onChange: (v: string[]) => void;
  onCustomConcernChange: (v: string) => void;
}

export function PerformanceConcernStep({ sports, selected, customConcern, onChange, onCustomConcernChange }: Props) {
  const primarySport = sports[0] || "default";
  const concerns =
    PERFORMANCE_CONCERN_OPTIONS[primarySport] ||
    PERFORMANCE_CONCERN_OPTIONS["default"];

  const [showCustomInput, setShowCustomInput] = useState(selected.includes("custom"));

  const toggle = (id: string) => {
    if (id === "none") {
      onChange(selected.includes("none") ? [] : ["none"]);
      setShowCustomInput(false);
      onCustomConcernChange("");
      return;
    }
    if (id === "custom") {
      const withoutNone = selected.filter((s) => s !== "none");
      if (withoutNone.includes("custom")) {
        onChange(withoutNone.filter((s) => s !== "custom"));
        setShowCustomInput(false);
        onCustomConcernChange("");
      } else {
        onChange([...withoutNone, "custom"]);
        setShowCustomInput(true);
      }
      return;
    }
    const withoutNone = selected.filter((s) => s !== "none");
    if (withoutNone.includes(id)) {
      onChange(withoutNone.filter((s) => s !== id));
    } else {
      onChange([...withoutNone, id]);
    }
  };

  return (
    <div className="flex flex-col gap-7 pt-4">
      <div>
        <h1 className="text-[26px] font-bold text-text-primary leading-[1.35] tracking-tight">
          운동할 때 느끼는<br />
          고민이 있나요?
        </h1>
        <p className="text-[17px] text-text-caption mt-3">
          해당하는 것을 모두 선택해주세요
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {concerns.map((opt) => {
          const isSelected = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => toggle(opt.id)}
              className={`w-full px-5 py-4 rounded-2xl border-2 flex items-center gap-4 text-left transition-all duration-200 ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-transparent bg-bg-card shadow-card active:scale-[0.98]"
              }`}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                isSelected ? "bg-primary border-primary" : "border-border-card"
              }`}>
                {isSelected && (
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7l3 3 5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className={`text-[17px] font-medium flex-1 ${isSelected ? "text-primary" : "text-text-primary"}`}>
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>

      {showCustomInput && (
        <input
          type="text"
          value={customConcern}
          onChange={(e) => onCustomConcernChange(e.target.value.slice(0, 50))}
          placeholder="어떤 고민인지 알려주세요"
          autoFocus
          className="w-full h-[54px] px-5 text-[17px] text-text-primary bg-bg-card rounded-2xl border-2 border-border-card focus:border-primary focus:shadow-[0_0_0_3px_rgba(255,84,20,0.08)] outline-none transition-all"
        />
      )}
    </div>
  );
}
