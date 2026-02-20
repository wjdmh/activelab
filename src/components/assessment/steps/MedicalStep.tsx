"use client";

import { useState } from "react";
import { CONDITION_OPTIONS } from "@/lib/constants";

interface Props {
  selected: string[];
  customCondition: string;
  onChange: (conditions: string[]) => void;
  onCustomChange: (value: string) => void;
}

export function MedicalStep({ selected, customCondition, onChange, onCustomChange }: Props) {
  const [showCustomInput, setShowCustomInput] = useState(selected.includes("custom"));

  const toggle = (id: string) => {
    if (id === "none") {
      onChange(["none"]);
      setShowCustomInput(false);
      onCustomChange("");
      return;
    }
    if (id === "custom") {
      const filtered = selected.filter((s) => s !== "none");
      if (filtered.includes("custom")) {
        onChange(filtered.filter((s) => s !== "custom"));
        setShowCustomInput(false);
        onCustomChange("");
      } else {
        onChange([...filtered, "custom"]);
        setShowCustomInput(true);
      }
      return;
    }
    const filtered = selected.filter((s) => s !== "none");
    if (filtered.includes(id)) {
      onChange(filtered.filter((s) => s !== id));
    } else {
      onChange([...filtered, id]);
    }
  };

  const hasMedicalRestriction = selected.includes("medical-restriction");

  return (
    <div className="flex flex-col gap-7 pt-4">
      <div>
        <h1 className="text-[26px] font-bold text-text-primary leading-[1.35] tracking-tight">
          현재 건강 상태를<br />알려주세요
        </h1>
        <p className="text-[17px] text-text-caption mt-3">
          안전한 운동을 위해 꼭 필요해요
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {CONDITION_OPTIONS.map((opt) => {
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
          value={customCondition}
          onChange={(e) => onCustomChange(e.target.value)}
          placeholder="어떤 질환인지 알려주세요"
          autoFocus
          className="w-full h-[54px] px-5 text-[17px] text-text-primary bg-bg-card rounded-2xl border-2 border-border-card focus:border-primary focus:shadow-[0_0_0_3px_rgba(255,84,20,0.08)] outline-none transition-all"
        />
      )}

      {hasMedicalRestriction && (
        <div className="p-4 rounded-2xl bg-warning/5 border border-warning/20">
          <p className="text-[15px] text-text-secondary font-medium leading-normal">
            의사 선생님과 상의 후 이용하시면 더 안전해요
          </p>
        </div>
      )}
    </div>
  );
}
