"use client";

import { SARCF_DIFFICULTY_OPTIONS } from "@/lib/constants";
import type { SarcFDifficulty } from "@/types/assessment";

interface Props {
  value: SarcFDifficulty | null;
  onChange: (v: SarcFDifficulty) => void;
}

export function SarcfStairStep({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-7 pt-4">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-success/10 text-success text-[13px] font-semibold mb-3">
          SARC-F 체력 검사
        </div>
        <h1 className="text-[26px] font-bold text-text-primary leading-[1.35] tracking-tight">
          계단 10개를 쉬지 않고<br />오르는 것이 힘드신가요?
        </h1>
        <p className="text-[15px] text-text-caption mt-3">
          아파트 1층(계단 약 10개)을 쉬지 않고 오르는 것을 기준으로
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {SARCF_DIFFICULTY_OPTIONS.map((opt) => {
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
              <span className={`text-[17px] font-semibold ${selected ? "text-primary" : "text-text-primary"}`}>
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
