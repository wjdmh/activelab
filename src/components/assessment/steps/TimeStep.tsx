"use client";

import { TIME_OPTIONS } from "@/lib/constants";

interface TimeStepProps {
  value: string | null;
  onChange: (value: "10min" | "20min" | "30min" | "60min") => void;
}

export function TimeStep({ value, onChange }: TimeStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[26px] font-bold text-text-primary mb-2">
          하루 중 운동에 투자할 수 있는
        </h2>
        <p className="text-[22px] font-bold text-primary">
          시간은 얼마인가요?
        </p>
      </div>
      <div className="space-y-3">
        {TIME_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`w-full min-h-[72px] px-5 rounded-xl border-2 flex items-center gap-4 text-left transition-all ${
              value === opt.id
                ? "border-primary bg-primary-light"
                : "border-border-card bg-bg-card active:bg-gray-50"
            }`}
            aria-pressed={value === opt.id}
          >
            <div>
              <span
                className={`text-[20px] font-semibold block ${
                  value === opt.id ? "text-primary" : "text-text-primary"
                }`}
              >
                {opt.label}
              </span>
              <span className="text-[16px] text-text-caption">
                {opt.description}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
