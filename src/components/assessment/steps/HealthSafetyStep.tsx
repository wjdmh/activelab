"use client";

import { useState } from "react";
import { PAIN_OPTIONS } from "@/lib/constants";

const QUICK_CONDITIONS = [
  { id: "high-blood-pressure", label: "고혈압", icon: "❤️" },
  { id: "diabetes", label: "당뇨", icon: "🩸" },
  { id: "osteoporosis", label: "골다공증", icon: "🩻" },
  { id: "arthritis", label: "관절염", icon: "🦴" },
  { id: "custom", label: "기타", icon: "✏️" },
  { id: "none", label: "해당 없음", icon: "✅" },
] as const;

interface HealthSafetyStepProps {
  conditions: string[];
  customCondition: string;
  painAreas: string[];
  customPainArea: string;
  freeNote: string;
  onConditionsChange: (conditions: string[]) => void;
  onCustomConditionChange: (v: string) => void;
  onPainAreasChange: (painAreas: string[]) => void;
  onCustomPainAreaChange: (v: string) => void;
  onFreeNoteChange: (v: string) => void;
}

export function HealthSafetyStep({
  conditions,
  customCondition,
  painAreas,
  customPainArea,
  freeNote,
  onConditionsChange,
  onCustomConditionChange,
  onPainAreasChange,
  onCustomPainAreaChange,
  onFreeNoteChange,
}: HealthSafetyStepProps) {
  const [showConditionInput, setShowConditionInput] = useState(conditions.includes("custom"));
  const [showPainInput, setShowPainInput] = useState(painAreas.includes("custom"));

  const toggleCondition = (id: string) => {
    if (id === "none") {
      onConditionsChange(["none"]);
      setShowConditionInput(false);
      onCustomConditionChange("");
      return;
    }
    if (id === "custom") {
      const without = conditions.filter((c) => c !== "none");
      if (without.includes("custom")) {
        onConditionsChange(without.filter((c) => c !== "custom"));
        setShowConditionInput(false);
        onCustomConditionChange("");
      } else {
        onConditionsChange([...without, "custom"]);
        setShowConditionInput(true);
      }
      return;
    }
    const without = conditions.filter((c) => c !== "none");
    const updated = without.includes(id)
      ? without.filter((c) => c !== id)
      : [...without, id];
    onConditionsChange(updated.length === 0 ? [] : updated);
  };

  const togglePain = (id: string) => {
    if (id === "none") {
      onPainAreasChange(["none"]);
      setShowPainInput(false);
      onCustomPainAreaChange("");
      return;
    }
    if (id === "custom") {
      const without = painAreas.filter((p) => p !== "none");
      if (without.includes("custom")) {
        onPainAreasChange(without.filter((p) => p !== "custom"));
        setShowPainInput(false);
        onCustomPainAreaChange("");
      } else {
        onPainAreasChange([...without, "custom"]);
        setShowPainInput(true);
      }
      return;
    }
    const without = painAreas.filter((p) => p !== "none");
    const updated = without.includes(id)
      ? without.filter((p) => p !== id)
      : [...without, id];
    onPainAreasChange(updated.length === 0 ? [] : updated);
  };

  return (
    <div className="space-y-8">
      {/* 건강 상태 */}
      <div>
        <h2 className="text-[22px] font-bold text-text-primary leading-snug tracking-tight mb-2">
          혹시 해당되는 게 있으신가요?
        </h2>
        <p className="text-[15px] text-text-caption mb-5">
          안전한 운동을 위해 알려주세요
        </p>

        <div className="grid grid-cols-2 gap-3">
          {QUICK_CONDITIONS.map((option) => {
            const isSelected = conditions.includes(option.id);
            return (
              <button
                key={option.id}
                onClick={() => toggleCondition(option.id)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border-card bg-bg-card active:bg-bg-warm"
                }`}
              >
                <span className="text-[20px]">{option.icon}</span>
                <span
                  className={`text-[15px] font-semibold ${
                    isSelected ? "text-primary" : "text-text-primary"
                  }`}
                >
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>

        {showConditionInput && (
          <input
            type="text"
            value={customCondition}
            onChange={(e) => onCustomConditionChange(e.target.value.slice(0, 50))}
            placeholder="어떤 질환인지 알려주세요"
            autoFocus
            className="w-full h-[54px] px-5 mt-3 text-[17px] text-text-primary bg-bg-card rounded-2xl border-2 border-border-card focus:border-primary focus:shadow-[0_0_0_3px_rgba(255,84,20,0.08)] outline-none transition-all"
          />
        )}
      </div>

      {/* 통증 부위 */}
      <div>
        <h3 className="text-[18px] font-bold text-text-primary tracking-tight mb-2">
          아프거나 불편한 곳이 있으신가요?
        </h3>
        <p className="text-[13px] text-text-caption mb-4">
          해당되는 부위를 모두 골라주세요
        </p>

        <div className="grid grid-cols-3 gap-2">
          {PAIN_OPTIONS.map((option) => {
            const isSelected = painAreas.includes(option.id);
            return (
              <button
                key={option.id}
                onClick={() => togglePain(option.id)}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border-card bg-bg-card active:bg-bg-warm"
                }`}
              >
                <span className="text-[20px]">{option.icon}</span>
                <span
                  className={`text-[13px] font-semibold ${
                    isSelected ? "text-primary" : "text-text-primary"
                  }`}
                >
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>

        {showPainInput && (
          <input
            type="text"
            value={customPainArea}
            onChange={(e) => onCustomPainAreaChange(e.target.value.slice(0, 50))}
            placeholder="어디가 불편한지 알려주세요"
            autoFocus
            className="w-full h-[54px] px-5 mt-3 text-[17px] text-text-primary bg-bg-card rounded-2xl border-2 border-border-card focus:border-primary focus:shadow-[0_0_0_3px_rgba(255,84,20,0.08)] outline-none transition-all"
          />
        )}
      </div>

      {/* 서술형 자유 입력 */}
      <div>
        <h3 className="text-[18px] font-bold text-text-primary tracking-tight mb-2">
          추가로 알려주실 내용이 있나요?
        </h3>
        <p className="text-[13px] text-text-caption mb-4">
          건강 상태, 운동 경험, 목표 등 자유롭게 적어주세요 (선택)
        </p>
        <textarea
          value={freeNote}
          onChange={(e) => onFreeNoteChange(e.target.value.slice(0, 500))}
          placeholder="예: 3년 전 무릎 수술을 했어요, 아침에 일어나면 허리가 뻣뻣해요..."
          rows={4}
          className="w-full px-5 py-4 text-[15px] text-text-primary bg-bg-card rounded-2xl border-2 border-border-card focus:border-primary focus:shadow-[0_0_0_3px_rgba(255,84,20,0.08)] outline-none transition-all resize-none leading-relaxed"
        />
        <p className="text-[11px] text-text-disabled mt-1 text-right">{freeNote.length}/500</p>
      </div>
    </div>
  );
}
