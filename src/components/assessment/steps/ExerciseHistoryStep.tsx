"use client";

import { useRef, useEffect } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function ExerciseHistoryStep({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 400);
  }, []);

  return (
    <div className="flex flex-col gap-7 pt-4">
      <div>
        <h1 className="text-[26px] font-bold text-text-primary leading-[1.35] tracking-tight">
          운동 경험을<br />알려주세요
        </h1>
        <p className="text-[15px] text-text-caption mt-3">
          맞춤 운동 강도를 설정할게요
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[15px] font-semibold text-text-secondary">
          과거 운동 경험
        </label>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, 50))}
          placeholder="예: 수영, 등산 / 없으면 '없음'"
          className="w-full h-[54px] px-5 text-[17px] text-text-primary bg-bg-card rounded-2xl border-2 border-border-card focus:border-primary focus:shadow-[0_0_0_3px_rgba(255,84,20,0.08)] outline-none transition-all"
        />
      </div>
    </div>
  );
}
