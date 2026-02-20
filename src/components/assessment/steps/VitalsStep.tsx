"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  birthYear: number | null;
  height: number | null;
  weight: number | null;
  onBirthYearChange: (v: number | null) => void;
  onHeightChange: (v: number | null) => void;
  onWeightChange: (v: number | null) => void;
}

function NumberInput({
  label,
  unit,
  value,
  onChange,
  min,
  max,
  placeholder,
  autoFocus,
  errorMessage,
}: {
  label: string;
  unit: string;
  value: number | null;
  onChange: (v: number | null) => void;
  min: number;
  max: number;
  placeholder: string;
  autoFocus?: boolean;
  errorMessage?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<string>(value != null ? String(value) : "");
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (autoFocus) setTimeout(() => inputRef.current?.focus(), 400);
  }, [autoFocus]);

  // Sync external value changes
  useEffect(() => {
    setDraft(value != null ? String(value) : "");
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow any numeric typing
    if (raw === "" || /^\d+$/.test(raw)) {
      setDraft(raw);
      setHasError(false);
      if (raw === "") {
        onChange(null);
      } else {
        const n = parseInt(raw, 10);
        if (!isNaN(n) && n >= min && n <= max) {
          onChange(n);
        }
      }
    }
  };

  const handleBlur = () => {
    if (draft === "") {
      onChange(null);
      setHasError(false);
      return;
    }
    const n = parseInt(draft, 10);
    if (isNaN(n) || n < min || n > max) {
      setHasError(true);
    } else {
      setHasError(false);
      onChange(n);
    }
  };

  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-colors ${
      hasError
        ? "bg-danger/5 border-danger/30"
        : "bg-bg-warm/60 border-border-card/60"
    }`}>
      <span className="text-[15px] font-medium text-text-caption min-w-[60px]">{label}</span>
      <div className="flex-1 flex items-center gap-2">
        <input
          ref={autoFocus ? inputRef : undefined}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={draft}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`flex-1 h-[48px] px-3 text-[20px] font-semibold text-text-primary bg-bg-card rounded-xl border outline-none transition-all text-center ${
            hasError
              ? "border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(220,38,38,0.08)]"
              : "border-border-card focus:border-primary focus:shadow-[0_0_0_3px_rgba(255,84,20,0.08)]"
          }`}
        />
        <span className="text-[15px] text-text-caption font-medium min-w-[30px]">{unit}</span>
      </div>
      {hasError && errorMessage && (
        <p className="text-[13px] text-danger font-medium mt-1 ml-1">{errorMessage}</p>
      )}
    </div>
  );
}

export function VitalsStep({
  birthYear,
  height,
  weight,
  onBirthYearChange,
  onHeightChange,
  onWeightChange,
}: Props) {
  const currentYear = new Date().getFullYear();
  const age = birthYear ? currentYear - birthYear : null;

  return (
    <div className="flex flex-col gap-7 pt-4">
      <div>
        <h1 className="text-[26px] font-bold text-text-primary leading-[1.35] tracking-tight">
          기본 정보를 알려주세요
        </h1>
        <p className="text-[17px] text-text-caption mt-3 leading-normal">
          정확한 맞춤 운동을 위해 필요해요
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <NumberInput
          label="출생연도"
          unit="년"
          value={birthYear}
          onChange={onBirthYearChange}
          min={1930}
          max={2010}
          placeholder="예: 1960"
          autoFocus
          errorMessage="1930~2010 사이의 연도를 입력해주세요"
        />
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="키"
            unit="cm"
            value={height}
            onChange={onHeightChange}
            min={100}
            max={250}
            placeholder="선택"
            errorMessage="100~250 사이의 값을 입력해주세요"
          />
          <NumberInput
            label="몸무게"
            unit="kg"
            value={weight}
            onChange={onWeightChange}
            min={30}
            max={200}
            placeholder="선택"
            errorMessage="30~200 사이의 값을 입력해주세요"
          />
        </div>
      </div>

      {age !== null && age > 0 && (
        <div className="flex items-center gap-2 px-5 py-4 rounded-xl bg-primary/5 border border-primary/10">
          <span className="text-[17px] text-primary font-medium">
            만 {age}세
            {height && weight ? ` · BMI ${(weight / ((height / 100) ** 2)).toFixed(1)}` : ""}
          </span>
        </div>
      )}

      <div className="flex items-start gap-2 p-3 rounded-xl bg-bg-warm">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" className="text-text-caption" />
          <path d="M8 7v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-text-caption" />
          <circle cx="8" cy="5" r="0.75" fill="currentColor" className="text-text-caption" />
        </svg>
        <p className="text-[13px] text-text-caption">
          키와 몸무게는 선택 사항이에요. 입력하시면 더 정밀한 분석이 가능해요.
        </p>
      </div>
    </div>
  );
}
