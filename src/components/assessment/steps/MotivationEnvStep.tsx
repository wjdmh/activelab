"use client";

import { useState } from "react";
import { MOTIVATION_OPTIONS, ENVIRONMENT_OPTIONS } from "@/lib/constants";
import type { ReactNode } from "react";

interface Props {
  motivation: string[];
  customMotivation: string;
  environment: string | null;
  customEnvironment: string;
  onMotivationChange: (v: string[]) => void;
  onCustomMotivationChange: (v: string) => void;
  onEnvironmentChange: (v: "home" | "park" | "gym" | "senior-center") => void;
  onCustomEnvironmentChange: (v: string) => void;
}

const ENV_ICONS: Record<string, ReactNode> = {
  home: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M5 13l9-8 9 8" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 12v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  park: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M14 4l-6 8h4l-5 7h14l-5-7h4l-6-8z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 19v5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  ),
  gym: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M4 14h20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <rect x="7" y="10" width="3" height="8" rx="1" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.2" />
      <rect x="18" y="10" width="3" height="8" rx="1" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.2" />
      <rect x="4" y="12" width="2" height="4" rx="0.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
      <rect x="22" y="12" width="2" height="4" rx="0.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  "senior-center": (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M4 22h20M6 22V12l8-6 8 6v10" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 22v-6h6v6" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="14" cy="11" r="1.5" fill="currentColor" />
    </svg>
  ),
  custom: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="9" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.2" />
      <path d="M14 9v4M14 17v2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  ),
};

export function MotivationEnvStep({
  motivation,
  customMotivation,
  environment,
  customEnvironment,
  onMotivationChange,
  onCustomMotivationChange,
  onEnvironmentChange,
  onCustomEnvironmentChange,
}: Props) {
  const [showCustomInput, setShowCustomInput] = useState(motivation.includes("custom"));
  const [showEnvInput, setShowEnvInput] = useState(environment === ("custom" as string));

  const toggle = (id: string) => {
    if (id === "custom") {
      if (motivation.includes("custom")) {
        onMotivationChange(motivation.filter((s) => s !== "custom"));
        setShowCustomInput(false);
        onCustomMotivationChange("");
      } else {
        onMotivationChange([...motivation, "custom"]);
        setShowCustomInput(true);
      }
      return;
    }
    if (motivation.includes(id)) {
      onMotivationChange(motivation.filter((s) => s !== id));
    } else {
      onMotivationChange([...motivation, id]);
    }
  };

  const handleEnvChange = (id: string) => {
    if (id === "custom") {
      setShowEnvInput(true);
    } else {
      setShowEnvInput(false);
      onCustomEnvironmentChange("");
    }
    onEnvironmentChange(id as "home" | "park" | "gym" | "senior-center");
  };

  return (
    <div className="flex flex-col gap-7 pt-4">
      <div>
        <h1 className="text-[26px] font-bold text-text-primary leading-[1.35] tracking-tight">
          건강해지면 꼭 하고 싶은<br />활동이 있나요?
        </h1>
        <p className="text-[15px] text-text-caption mt-3">
          해당하는 것을 모두 선택해주세요
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {MOTIVATION_OPTIONS.map((opt) => {
          const isSelected = motivation.includes(opt.id);
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
          value={customMotivation}
          onChange={(e) => onCustomMotivationChange(e.target.value.slice(0, 50))}
          placeholder="어떤 활동인지 알려주세요"
          autoFocus
          className="w-full h-[54px] px-5 text-[17px] text-text-primary bg-bg-card rounded-2xl border-2 border-border-card focus:border-primary focus:shadow-[0_0_0_3px_rgba(255,84,20,0.08)] outline-none transition-all"
        />
      )}

      <div className="flex flex-col gap-3">
        <label className="text-[15px] font-semibold text-text-secondary">
          주로 어디서 운동하시나요?
        </label>
        <div className="grid grid-cols-2 gap-3">
          {ENVIRONMENT_OPTIONS.map((opt) => {
            const isEnvSelected = environment === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleEnvChange(opt.id)}
                className={`h-[90px] rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${
                  isEnvSelected
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-transparent bg-bg-card shadow-card text-text-caption active:scale-[0.97]"
                }`}
              >
                <div className="w-8 h-8 flex items-center justify-center">
                  {ENV_ICONS[opt.id]}
                </div>
                <span className={`text-[15px] font-semibold ${isEnvSelected ? "text-primary" : "text-text-primary"}`}>
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>

        {showEnvInput && (
          <input
            type="text"
            value={customEnvironment}
            onChange={(e) => onCustomEnvironmentChange(e.target.value.slice(0, 50))}
            placeholder="어디서 운동하시는지 알려주세요"
            autoFocus
            className="w-full h-[54px] px-5 text-[17px] text-text-primary bg-bg-card rounded-2xl border-2 border-border-card focus:border-primary focus:shadow-[0_0_0_3px_rgba(255,84,20,0.08)] outline-none transition-all"
          />
        )}
      </div>
    </div>
  );
}
