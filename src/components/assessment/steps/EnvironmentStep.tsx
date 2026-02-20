"use client";

import { ENVIRONMENT_OPTIONS } from "@/lib/constants";
import type { ReactNode } from "react";

interface Props {
  value: string | null;
  onChange: (v: string) => void;
}

const ENV_ICONS: Record<string, ReactNode> = {
  home: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M5 13l9-8 9 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 12v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  park: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M14 4l-6 8h4l-5 7h14l-5-7h4l-6-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 19v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  gym: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M4 14h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="7" y="10" width="3" height="8" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="18" y="10" width="3" height="8" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="4" y="12" width="2" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="22" y="12" width="2" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  "senior-center": (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M4 22h20M6 22V12l8-6 8 6v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 22v-6h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="14" cy="11" r="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
};

export function EnvironmentStep({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-7 pt-4">
      <div>
        <h1 className="text-[26px] font-bold text-text-primary leading-[1.35] tracking-tight">
          주로 어디서<br />운동하시나요?
        </h1>
        <p className="text-[15px] text-text-caption mt-3">
          장소에 맞는 운동을 추천해드릴게요
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {ENVIRONMENT_OPTIONS.map((opt) => {
          const selected = value === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={`h-[90px] rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${
                selected
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-transparent bg-bg-card shadow-card text-text-caption active:scale-[0.97]"
              }`}
            >
              <div className="w-8 h-8 flex items-center justify-center">
                {ENV_ICONS[opt.id]}
              </div>
              <span className={`text-[15px] font-semibold ${selected ? "text-primary" : "text-text-primary"}`}>
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
