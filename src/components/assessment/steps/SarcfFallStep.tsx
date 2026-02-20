"use client";

import { SARCF_FALL_OPTIONS } from "@/lib/constants";
import type { SarcFFallCount } from "@/types/assessment";

interface Props {
  value: SarcFFallCount | null;
  onChange: (v: SarcFFallCount) => void;
}

export function SarcfFallStep({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-7 pt-4">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-success/10 text-success text-[13px] font-semibold mb-3">
          SARC-F 체력 검사
        </div>
        <h1 className="text-[26px] font-bold text-text-primary leading-[1.35] tracking-tight">
          지난 1년 동안<br />넘어진 적이 있나요?
        </h1>
        <p className="text-[15px] text-text-caption mt-3">
          살짝 비틀거린 것은 제외하고, 완전히 넘어진 경우만 세주세요
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {SARCF_FALL_OPTIONS.map((opt) => {
          const selected = value === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={`w-full px-5 py-4 rounded-2xl border-2 flex items-center gap-4 text-left transition-all duration-200 ${
                selected
                  ? "border-primary bg-primary/5"
                  : "border-transparent bg-bg-card shadow-card active:scale-[0.98]"
              }`}
            >
              <span className={`w-3 h-3 rounded-full shrink-0 ${opt.score === 0 ? "bg-success" : opt.score === 1 ? "bg-warning" : "bg-danger"}`} />
              <div>
                <span className={`text-[17px] font-semibold block ${selected ? "text-primary" : "text-text-primary"}`}>
                  {opt.label}
                </span>
                <span className="text-[15px] text-text-caption">{opt.description}</span>
              </div>
            </button>
          );
        })}
      </div>

      {(value === "1-3" || value === "4-plus") && (
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
          <p className="text-[15px] text-text-secondary font-medium leading-normal">
            걱정 마세요. 낙상 예방에 특화된 균형 운동을 추천해드릴게요
          </p>
        </div>
      )}
    </div>
  );
}
