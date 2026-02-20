"use client";

import type { AssessmentTrack } from "@/types/assessment";
import { TRACK_OPTIONS } from "@/lib/constants";
import type { ReactNode } from "react";

interface Props {
  value: AssessmentTrack | null;
  onChange: (v: AssessmentTrack) => void;
}

const TRACK_ICONS: Record<string, ReactNode> = {
  vitality: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  wellness: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M14 24s-8-4.5-8-11.5C6 8.5 9 6 14 6s8 2.5 8 6.5S14 24 14 24z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 12v4M12 14h4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  ),
};

export function TrackSelectionStep({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-8 pt-4">
      <div>
        <h1 className="text-[26px] font-bold text-text-primary leading-[1.35] tracking-tight">
          어떤 목적으로<br />
          운동하고 싶으세요?
        </h1>
        <p className="text-[17px] text-text-caption mt-3 leading-normal">
          목표에 맞는 맞춤 분석을 해드릴게요
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {TRACK_OPTIONS.map((opt) => {
          const selected = value === opt.id;
          const isVitality = opt.id === "vitality";

          return (
            <button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={`relative w-full p-6 rounded-2xl border-2 text-left transition-all duration-200 ${
                selected
                  ? "border-primary bg-primary/5"
                  : "border-transparent bg-bg-card shadow-card active:scale-[0.98]"
              }`}
            >
              {selected && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  isVitality ? "bg-primary/10 text-primary" : "bg-success/10 text-success"
                }`}>
                  {TRACK_ICONS[opt.id]}
                </div>
                <div className="flex-1">
                  <h3 className={`text-[20px] font-bold ${selected ? "text-primary" : "text-text-primary"}`}>
                    {opt.label}
                  </h3>
                  <p className="text-[15px] text-text-caption mt-1 leading-normal">
                    {opt.subtitle}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {isVitality
                  ? ["골프", "등산", "테니스", "여행"].map((tag) => (
                      <span key={tag} className="px-3 py-1 border border-primary/30 bg-transparent rounded-full text-[13px] text-primary font-medium">
                        {tag}
                      </span>
                    ))
                  : ["근력 관리", "통증 완화", "유연성", "체중 관리"].map((tag) => (
                      <span key={tag} className="px-3 py-1 border border-success/30 bg-transparent rounded-full text-[13px] text-success font-medium">
                        {tag}
                      </span>
                    ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
