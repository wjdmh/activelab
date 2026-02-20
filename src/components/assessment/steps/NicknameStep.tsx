"use client";

import { useRef, useEffect } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}

export function NicknameStep({ value, onChange, onSubmit }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 400);
  }, []);

  return (
    <div className="flex flex-col gap-8 pt-4">
      <h1 className="text-[26px] font-bold text-text-primary leading-[1.35] tracking-tight">
        <span className="text-primary">반가워요!</span><br />어떻게 불러드리면 좋을까요?
      </h1>

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, 10))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && value.trim().length >= 2) onSubmit();
          }}
          placeholder="이름 또는 별명"
          className="w-full h-[60px] px-1 text-[22px] font-medium text-text-primary bg-transparent border-b-2 border-border-card focus:border-primary outline-none transition-colors duration-300 placeholder:text-text-disabled"
        />
        {value.length > 0 && (
          <span className="absolute right-0 bottom-5 text-[13px] text-text-caption">
            {value.length}/10
          </span>
        )}
      </div>

      {value.trim().length >= 2 && (
        <div className="flex items-center gap-2 text-[15px] text-primary font-medium">
          <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[13px]">
            ✓
          </span>
          {value.trim()}님, 멋진 이름이에요
        </div>
      )}
    </div>
  );
}
