"use client";

import { useState } from "react";
import type { AgeGroup } from "@/types/user";
import { AGE_OPTIONS } from "@/lib/constants";

interface AgeGroupStepProps {
  value: AgeGroup | null;
  onChange: (value: AgeGroup) => void;
}

export function AgeGroupStep({ value, onChange }: AgeGroupStepProps) {
  const [showWarning, setShowWarning] = useState(false);

  const handleSelect = (id: AgeGroup) => {
    onChange(id);
    if (id === "under-60") {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[26px] font-bold text-text-primary mb-2">
          연령대를 알려주세요
        </h2>
        <p className="text-[20px] text-text-secondary">
          나이에 맞는 안전한 운동을 추천해드려요
        </p>
      </div>

      <div className="space-y-3">
        {AGE_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => handleSelect(opt.id as AgeGroup)}
            className={`w-full min-h-[60px] px-5 rounded-xl border-2 flex items-center text-[20px] font-medium transition-all ${
              value === opt.id
                ? "border-primary bg-primary-light text-primary"
                : "border-border-card bg-bg-card text-text-primary active:bg-gray-50"
            }`}
            aria-pressed={value === opt.id}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {showWarning && (
        <div className="p-4 rounded-xl bg-primary-light border border-primary/20">
          <p className="text-[18px] text-primary font-medium">
            본 서비스는 시니어 맞춤형이지만, 이용하셔도 좋습니다!
          </p>
        </div>
      )}
    </div>
  );
}
