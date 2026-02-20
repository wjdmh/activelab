"use client";

import { useRef, useEffect } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function MotivationStep({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 400);
  }, []);

  return (
    <div className="flex flex-col gap-7 pt-4">
      <div>
        <h1 className="text-[26px] font-bold text-text-primary leading-[1.35] tracking-tight">
          건강해지면 꼭 하고 싶은<br />활동이 있나요?
        </h1>
        <p className="text-[15px] text-text-caption mt-3">
          목표가 있으면 운동 지속률이 2배 높아져요
        </p>
      </div>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, 50))}
        placeholder="예: 손주와 놀기, 여행, 등산"
        className="w-full h-[54px] px-5 text-[17px] text-text-primary bg-bg-card rounded-2xl border-2 border-border-card focus:border-primary focus:shadow-[0_0_0_3px_rgba(255,84,20,0.08)] outline-none transition-all"
      />
    </div>
  );
}
