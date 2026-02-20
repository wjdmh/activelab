"use client";

import { useState } from "react";
import { PAIN_OPTIONS } from "@/lib/constants";
import type { ReactNode } from "react";

interface Props {
  selected: string[];
  customPainArea: string;
  onChange: (areas: string[]) => void;
  onCustomPainAreaChange: (v: string) => void;
}

const PAIN_ICONS: Record<string, ReactNode> = {
  knee: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M14 4v8l-3 4v8M14 12l3 4v8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="14" cy="14" r="2.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.2" />
    </svg>
  ),
  back: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M14 4v20M10 8c2 2 2 4 0 6s-2 4 0 6M18 8c-2 2-2 4 0 6s2 4 0 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  ),
  shoulder: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="7" r="3" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.2" />
      <path d="M7 16c0-4 3-6 7-6s7 2 7 6M7 16v4M21 16v4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  neck: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="8" r="4" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.2" />
      <path d="M11 12v6h6v-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 18h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  ),
  hip: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M8 10h12v4c0 3-2.5 5-6 5s-6-2-6-5v-4z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 19l-2 5M18 19l2 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="14" cy="14" r="1.5" fill="currentColor" />
    </svg>
  ),
  wrist: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M10 14v-4a1 1 0 012 0v-2a1 1 0 012 0v-1a1 1 0 012 0v1a1 1 0 012 0v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 14c0 4 2 6 4 8M18 14c0 4-2 6-4 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 18h10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  ),
  custom: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="9" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.2" />
      <path d="M14 9v4M14 17v2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  ),
  none: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="9" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.2" />
      <path d="M10 14l3 3 5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export function PainAreaStep({ selected, customPainArea, onChange, onCustomPainAreaChange }: Props) {
  const [showCustomInput, setShowCustomInput] = useState(selected.includes("custom"));

  const toggle = (id: string) => {
    if (id === "none") {
      onChange(["none"]);
      setShowCustomInput(false);
      onCustomPainAreaChange("");
      return;
    }
    if (id === "custom") {
      const filtered = selected.filter((s) => s !== "none");
      if (filtered.includes("custom")) {
        onChange(filtered.filter((s) => s !== "custom"));
        setShowCustomInput(false);
        onCustomPainAreaChange("");
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

  return (
    <div className="flex flex-col gap-7 pt-4">
      <div>
        <h1 className="text-[26px] font-bold text-text-primary leading-[1.35] tracking-tight">
          아픈 곳이 있으신가요?
        </h1>
        <p className="text-[17px] text-text-caption mt-3">
          해당하는 곳을 모두 선택해주세요
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {PAIN_OPTIONS.map((opt) => {
          const isSelected = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => toggle(opt.id)}
              className={`relative h-[100px] rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${
                isSelected
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-transparent bg-bg-card shadow-card text-text-caption active:scale-[0.97]"
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7l3 3 5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
              <div className="w-10 h-10 flex items-center justify-center">
                {PAIN_ICONS[opt.id]}
              </div>
              <span className={`text-[15px] font-semibold ${isSelected ? "text-primary" : "text-text-primary"}`}>
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>

      {showCustomInput && (
        <input
          type="text"
          value={customPainArea}
          onChange={(e) => onCustomPainAreaChange(e.target.value.slice(0, 50))}
          placeholder="어디가 불편한지 알려주세요"
          autoFocus
          className="w-full h-[54px] px-5 text-[17px] text-text-primary bg-bg-card rounded-2xl border-2 border-border-card focus:border-primary focus:shadow-[0_0_0_3px_rgba(255,84,20,0.08)] outline-none transition-all"
        />
      )}
    </div>
  );
}
