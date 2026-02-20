"use client";

import { TIME_OPTIONS } from "@/lib/constants";

interface Props {
  value: string | null;
  onChange: (v: "10min" | "20min" | "30min" | "60min") => void;
}

export function AvailableTimeStep({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-7 pt-4">
      <div>
        <h1 className="text-[26px] font-bold text-text-primary leading-[1.35] tracking-tight">
          하루에 얼마나<br />운동할 수 있나요?
        </h1>
        <p className="text-[15px] text-text-caption mt-3">
          시간에 딱 맞는 운동을 구성해드려요
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {TIME_OPTIONS.map((opt) => {
          const selected = value === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onChange(opt.id)}
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
  );
}
