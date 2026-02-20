"use client";

import type { Gender } from "@/types/user";

interface Props {
  value: Gender | null;
  onChange: (v: Gender) => void;
}

function MaleIcon({ selected }: { selected: boolean }) {
  const color = selected ? "var(--color-primary)" : "var(--color-text-caption)";
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      {/* Head */}
      <circle cx="28" cy="16" r="8" fill={color} fillOpacity={0.15} stroke={color} strokeWidth="1.8" />
      {/* Short cropped hair */}
      <path
        d="M20.5 14c0-5.5 4.5-9 7.5-9s7.5 3.5 7.5 9"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Broad shoulders + body */}
      <path
        d="M28 26c-9 0-15 4.5-15 10v5a2 2 0 002 2h26a2 2 0 002-2v-5c0-5.5-6-10-15-10z"
        fill={color}
        fillOpacity={0.15}
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FemaleIcon({ selected }: { selected: boolean }) {
  const color = selected ? "var(--color-primary)" : "var(--color-text-caption)";
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      {/* Head */}
      <circle cx="28" cy="16" r="7.5" fill={color} fillOpacity={0.15} stroke={color} strokeWidth="1.8" />
      {/* Flowing long hair */}
      <path
        d="M20 14c0-6 3.5-9.5 8-9.5s8 3.5 8 9.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M20 14c-1 3-1.5 7-1 11"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M36 14c1 3 1.5 7 1 11"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Narrower shoulders + curved body */}
      <path
        d="M28 25c-7 0-12 4-12 9v4.5a2 2 0 002 2h20a2 2 0 002-2V34c0-5-5-9-12-9z"
        fill={color}
        fillOpacity={0.15}
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* Waist curve */}
      <path
        d="M20 34c2.5-2 5-3 8-3s5.5 1 8 3"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity={0.4}
      />
    </svg>
  );
}

const OPTIONS: Array<{ id: Gender; label: string }> = [
  { id: "male", label: "남성" },
  { id: "female", label: "여성" },
];

export function GenderStep({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-8 pt-4">
      <h1 className="text-[26px] font-bold text-text-primary leading-[1.35] tracking-tight">
        성별에 따라 운동 강도가 달라져요
      </h1>

      <div className="grid grid-cols-2 gap-4">
        {OPTIONS.map((opt) => {
          const selected = value === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={`relative h-[160px] rounded-2xl border-2 flex flex-col items-center justify-center gap-4 transition-all duration-200 ${
                selected
                  ? "border-primary bg-primary/5"
                  : "border-transparent bg-bg-card shadow-card active:scale-[0.97]"
              }`}
            >
              {selected && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
              <div className={`w-[72px] h-[72px] rounded-full flex items-center justify-center transition-colors ${
                selected ? "bg-primary/10" : opt.id === "male" ? "bg-blue-50" : "bg-pink-50"
              }`}>
                {opt.id === "male" ? <MaleIcon selected={selected} /> : <FemaleIcon selected={selected} />}
              </div>
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
