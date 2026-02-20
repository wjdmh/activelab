"use client";

import { SPORT_OPTIONS } from "@/lib/constants";
import type { ReactNode } from "react";

interface Props {
  selected: string[];
  onChange: (v: string[]) => void;
}

const SPORT_ICONS: Record<string, ReactNode> = {
  golf: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M14 4v16M14 4l6 4-6 4" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 24c0-2.2 2.7-4 6-4s6 1.8 6 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  ),
  hiking: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M4 22l7-10 5 6 8-12" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  tennis: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="8" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.2" />
      <path d="M8.5 7C11 10.5 11 17.5 8.5 21M19.5 7C17 10.5 17 17.5 19.5 21" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  swimming: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M4 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M4 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="10" cy="10" r="2.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.2" />
      <path d="M12.5 12l4 3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  ),
  travel: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="9" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.2" />
      <path d="M5 14h18M14 5c-2.5 2.5-4 5.5-4 9s1.5 6.5 4 9c2.5-2.5 4-5.5 4-9s-1.5-6.5-4-9z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  cycling: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="8" cy="19" r="4" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="20" cy="19" r="4" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.2" />
      <path d="M8 19l6-10h4l2 10M14 9l-3 10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  dance: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="6" r="2.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.2" />
      <path d="M14 9v7M14 16l-4 6M14 16l4 6M10 12l4 2 4-2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  other: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="6" r="2.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.2" />
      <path d="M14 9v5M14 14l-3 8M14 14l3 8M9 11l5 3M19 11l-5 3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export function SportSelectionStep({ selected, onChange }: Props) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="flex flex-col gap-7 pt-4">
      <div>
        <h1 className="text-[26px] font-bold text-text-primary leading-[1.35] tracking-tight">
          즐기는 활동을<br />
          모두 선택해주세요
        </h1>
        <p className="text-[17px] text-text-caption mt-3">
          선택한 종목 기반으로 주 7일 맞춤 운동을 구성해드려요
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {SPORT_OPTIONS.map((opt) => {
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
                {SPORT_ICONS[opt.id]}
              </div>
              <span className={`text-[15px] font-semibold ${isSelected ? "text-primary" : "text-text-primary"}`}>
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <p className="text-[15px] text-primary font-medium text-center">
          {selected.length}개 선택됨
        </p>
      )}
    </div>
  );
}
