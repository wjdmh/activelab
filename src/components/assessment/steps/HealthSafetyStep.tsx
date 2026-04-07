"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PAIN_OPTIONS } from "@/lib/constants";
import { ACSM_SYMPTOMS } from "@/lib/acsm";
import type { ActivityLevel } from "@/types/assessment";

const QUICK_CONDITIONS = [
  { id: "high-blood-pressure", label: "고혈압", icon: "❤️" },
  { id: "heart-disease", label: "심장 질환", icon: "🫀" },
  { id: "diabetes", label: "당뇨", icon: "🩸" },
  { id: "osteoporosis", label: "골다공증", icon: "🩻" },
  { id: "arthritis", label: "관절염", icon: "🦴" },
  { id: "renal-disease", label: "신장 질환", icon: "🫘" },
  { id: "custom", label: "기타 질환", icon: "✏️" },
  { id: "none", label: "해당 없음", icon: "✅" },
] as const;

type ScreeningStep = "activity" | "conditions" | "symptoms" | "pain";

interface HealthSafetyStepProps {
  activityLevel: ActivityLevel | null;
  conditions: string[];
  customCondition: string;
  acsmSymptoms: string[];
  painAreas: string[];
  customPainArea: string;
  freeNote: string;
  onActivityLevelChange: (v: ActivityLevel) => void;
  onConditionsChange: (conditions: string[]) => void;
  onCustomConditionChange: (v: string) => void;
  onAcsmSymptomsChange: (symptoms: string[]) => void;
  onPainAreasChange: (painAreas: string[]) => void;
  onCustomPainAreaChange: (v: string) => void;
  onFreeNoteChange: (v: string) => void;
}

export function HealthSafetyStep({
  activityLevel,
  conditions,
  customCondition,
  acsmSymptoms,
  painAreas,
  customPainArea,
  freeNote,
  onActivityLevelChange,
  onConditionsChange,
  onCustomConditionChange,
  onAcsmSymptomsChange,
  onPainAreasChange,
  onCustomPainAreaChange,
  onFreeNoteChange,
}: HealthSafetyStepProps) {
  const [screeningStep, setScreeningStep] = useState<ScreeningStep>(() => {
    if (!activityLevel) return "activity";
    if (!conditions.length) return "conditions";
    if (!acsmSymptoms.length && !conditions.includes("none")) return "symptoms";
    return "pain";
  });
  const [showConditionInput, setShowConditionInput] = useState(conditions.includes("custom"));
  const [showPainInput, setShowPainInput] = useState(painAreas.includes("custom"));

  const handleActivitySelect = (level: ActivityLevel) => {
    onActivityLevelChange(level);
    setTimeout(() => setScreeningStep("conditions"), 300);
  };

  const toggleCondition = (id: string) => {
    if (id === "none") {
      onConditionsChange(["none"]);
      setShowConditionInput(false);
      onCustomConditionChange("");
      return;
    }
    if (id === "custom") {
      const without = conditions.filter((c) => c !== "none");
      if (without.includes("custom")) {
        onConditionsChange(without.filter((c) => c !== "custom"));
        setShowConditionInput(false);
        onCustomConditionChange("");
      } else {
        onConditionsChange([...without, "custom"]);
        setShowConditionInput(true);
      }
      return;
    }
    const without = conditions.filter((c) => c !== "none");
    const updated = without.includes(id) ? without.filter((c) => c !== id) : [...without, id];
    onConditionsChange(updated.length === 0 ? [] : updated);
  };

  const toggleSymptom = (id: string) => {
    if (id === "none") {
      onAcsmSymptomsChange(["none"]);
      return;
    }
    const without = acsmSymptoms.filter((s) => s !== "none");
    const updated = without.includes(id) ? without.filter((s) => s !== id) : [...without, id];
    onAcsmSymptomsChange(updated.length === 0 ? [] : updated);
  };

  const togglePain = (id: string) => {
    if (id === "none") {
      onPainAreasChange(["none"]);
      setShowPainInput(false);
      onCustomPainAreaChange("");
      return;
    }
    if (id === "custom") {
      const without = painAreas.filter((p) => p !== "none");
      if (without.includes("custom")) {
        onPainAreasChange(without.filter((p) => p !== "custom"));
        setShowPainInput(false);
        onCustomPainAreaChange("");
      } else {
        onPainAreasChange([...without, "custom"]);
        setShowPainInput(true);
      }
      return;
    }
    const without = painAreas.filter((p) => p !== "none");
    const updated = without.includes(id) ? without.filter((p) => p !== id) : [...without, id];
    onPainAreasChange(updated.length === 0 ? [] : updated);
  };

  const canProceedConditions = conditions.length > 0;
  const canProceedSymptoms = acsmSymptoms.length > 0;

  // 증상 있을 때 경고 표시
  const hasRealSymptoms = acsmSymptoms.some((s) => s !== "none");

  return (
    <div className="space-y-1">
      {/* 진행 단계 표시 */}
      <div className="flex items-center gap-2 mb-5">
        {(["activity", "conditions", "symptoms", "pain"] as ScreeningStep[]).map((s, i) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${
              screeningStep === s
                ? "bg-primary"
                : ["activity", "conditions", "symptoms", "pain"].indexOf(screeningStep) > i
                ? "bg-primary/40"
                : "bg-border-card"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ===== STEP 1: 활동 수준 ===== */}
        {screeningStep === "activity" && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="text-[22px] font-bold text-text-primary leading-snug tracking-tight mb-2">
              평소 운동을 얼마나 하세요?
            </h2>
            <p className="text-[14px] text-text-caption mb-5">
              지난 3개월 동안을 기준으로 알려주세요
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleActivitySelect("active")}
                className={`w-full flex items-start gap-4 p-5 rounded-2xl border-2 transition-all text-left ${
                  activityLevel === "active"
                    ? "border-primary bg-primary/5"
                    : "border-border-card bg-bg-card active:bg-bg-warm"
                }`}
              >
                <span className="text-[32px] flex-shrink-0">🏃</span>
                <div>
                  <p className={`text-[17px] font-bold ${activityLevel === "active" ? "text-primary" : "text-text-primary"}`}>
                    꾸준히 운동해요
                  </p>
                  <p className="text-[13px] text-text-caption mt-1">
                    주 3일 이상, 하루 30분 이상 중강도 활동
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleActivitySelect("inactive")}
                className={`w-full flex items-start gap-4 p-5 rounded-2xl border-2 transition-all text-left ${
                  activityLevel === "inactive"
                    ? "border-primary bg-primary/5"
                    : "border-border-card bg-bg-card active:bg-bg-warm"
                }`}
              >
                <span className="text-[32px] flex-shrink-0">🛋️</span>
                <div>
                  <p className={`text-[17px] font-bold ${activityLevel === "inactive" ? "text-primary" : "text-text-primary"}`}>
                    거의 안 해요 / 시작 단계예요
                  </p>
                  <p className="text-[13px] text-text-caption mt-1">
                    최근 운동이 불규칙하거나 새로 시작하려고 해요
                  </p>
                </div>
              </button>
            </div>
          </motion.div>
        )}

        {/* ===== STEP 2: 질환 확인 ===== */}
        {screeningStep === "conditions" && (
          <motion.div
            key="conditions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="text-[22px] font-bold text-text-primary leading-snug tracking-tight mb-2">
              혹시 해당되는 게 있으신가요?
            </h2>
            <p className="text-[14px] text-text-caption mb-5">
              안전한 맞춤 처방을 위해 필요해요
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {QUICK_CONDITIONS.map((option) => {
                const isSelected = conditions.includes(option.id);
                return (
                  <button
                    key={option.id}
                    onClick={() => toggleCondition(option.id)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border-card bg-bg-card active:bg-bg-warm"
                    }`}
                  >
                    <span className="text-[20px]">{option.icon}</span>
                    <span className={`text-[14px] font-semibold ${isSelected ? "text-primary" : "text-text-primary"}`}>
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {showConditionInput && (
              <input
                type="text"
                value={customCondition}
                onChange={(e) => onCustomConditionChange(e.target.value.slice(0, 50))}
                placeholder="어떤 질환인지 알려주세요"
                autoFocus
                className="w-full h-[54px] px-5 mb-4 text-[17px] text-text-primary bg-bg-card rounded-2xl border-2 border-border-card focus:border-primary focus:shadow-[0_0_0_3px_rgba(255,84,20,0.08)] outline-none transition-all"
              />
            )}

            {canProceedConditions && (
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setScreeningStep("symptoms")}
                className="w-full py-4 rounded-2xl bg-primary text-white text-[16px] font-bold active:opacity-80 transition-opacity"
              >
                다음으로
              </motion.button>
            )}

            <button
              onClick={() => setScreeningStep("activity")}
              className="mt-3 flex items-center gap-1 text-[13px] text-text-caption font-medium min-h-[44px]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              이전으로
            </button>
          </motion.div>
        )}

        {/* ===== STEP 3: 이상 증상 ===== */}
        {screeningStep === "symptoms" && (
          <motion.div
            key="symptoms"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="text-[22px] font-bold text-text-primary leading-snug tracking-tight mb-2">
              최근 이런 증상이 있으신가요?
            </h2>
            <p className="text-[14px] text-text-caption mb-5">
              해당 증상이 있으면 운동 전 의사 상담을 권장해요
            </p>

            <div className="space-y-2.5 mb-4">
              {ACSM_SYMPTOMS.map((symptom) => {
                const isSelected = acsmSymptoms.includes(symptom.id);
                return (
                  <button
                    key={symptom.id}
                    onClick={() => toggleSymptom(symptom.id)}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? "border-danger bg-danger/5"
                        : "border-border-card bg-bg-card active:bg-bg-warm"
                    }`}
                  >
                    <span className="text-[22px] flex-shrink-0">{symptom.icon}</span>
                    <div className="flex-1">
                      <p className={`text-[15px] font-semibold ${isSelected ? "text-danger" : "text-text-primary"}`}>
                        {symptom.label}
                      </p>
                      <p className="text-[12px] text-text-caption mt-0.5">{symptom.description}</p>
                    </div>
                  </button>
                );
              })}

              <button
                onClick={() => toggleSymptom("none")}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 transition-all text-left ${
                  acsmSymptoms.includes("none")
                    ? "border-success bg-success/5"
                    : "border-border-card bg-bg-card active:bg-bg-warm"
                }`}
              >
                <span className="text-[22px]">✅</span>
                <p className={`text-[15px] font-semibold ${acsmSymptoms.includes("none") ? "text-success" : "text-text-primary"}`}>
                  해당 없어요
                </p>
              </button>
            </div>

            {/* 증상 있을 때 경고 */}
            {hasRealSymptoms && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-2xl bg-danger/5 border border-danger/20 mb-4"
              >
                <p className="text-[14px] text-danger font-semibold leading-relaxed">
                  ⚠️ 안전을 위해 운동 시작 전 의사와 상담하시길 강력 권고합니다. 운동 처방은 경도 범위로 제한될 수 있어요.
                </p>
              </motion.div>
            )}

            {canProceedSymptoms && (
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setScreeningStep("pain")}
                className="w-full py-4 rounded-2xl bg-primary text-white text-[16px] font-bold active:opacity-80 transition-opacity"
              >
                다음으로
              </motion.button>
            )}

            <button
              onClick={() => setScreeningStep("conditions")}
              className="mt-3 flex items-center gap-1 text-[13px] text-text-caption font-medium min-h-[44px]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              이전으로
            </button>
          </motion.div>
        )}

        {/* ===== STEP 4: 통증 부위 + 자유 입력 ===== */}
        {screeningStep === "pain" && (
          <motion.div
            key="pain"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-[22px] font-bold text-text-primary leading-snug tracking-tight mb-2">
                아프거나 불편한 곳이 있으신가요?
              </h2>
              <p className="text-[13px] text-text-caption mb-4">
                해당되는 부위를 모두 골라주세요
              </p>

              <div className="grid grid-cols-3 gap-2">
                {PAIN_OPTIONS.map((option) => {
                  const isSelected = painAreas.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      onClick={() => togglePain(option.id)}
                      className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border-card bg-bg-card active:bg-bg-warm"
                      }`}
                    >
                      <span className="text-[20px]">{option.icon}</span>
                      <span className={`text-[13px] font-semibold ${isSelected ? "text-primary" : "text-text-primary"}`}>
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {showPainInput && (
                <input
                  type="text"
                  value={customPainArea}
                  onChange={(e) => onCustomPainAreaChange(e.target.value.slice(0, 50))}
                  placeholder="어디가 불편한지 알려주세요"
                  autoFocus
                  className="w-full h-[54px] px-5 mt-3 text-[17px] text-text-primary bg-bg-card rounded-2xl border-2 border-border-card focus:border-primary focus:shadow-[0_0_0_3px_rgba(255,84,20,0.08)] outline-none transition-all"
                />
              )}
            </div>

            <div>
              <h3 className="text-[17px] font-bold text-text-primary tracking-tight mb-2">
                추가로 알려주실 내용이 있나요?
              </h3>
              <p className="text-[13px] text-text-caption mb-3">
                건강 상태, 운동 경험, 목표 등 자유롭게 적어주세요 (선택)
              </p>
              <textarea
                value={freeNote}
                onChange={(e) => onFreeNoteChange(e.target.value.slice(0, 500))}
                placeholder="예: 3년 전 무릎 수술을 했어요, 아침에 허리가 뻣뻣해요..."
                rows={3}
                className="w-full px-5 py-4 text-[15px] text-text-primary bg-bg-card rounded-2xl border-2 border-border-card focus:border-primary focus:shadow-[0_0_0_3px_rgba(255,84,20,0.08)] outline-none transition-all resize-none leading-relaxed"
              />
              <p className="text-[11px] text-text-disabled mt-1 text-right">{freeNote.length}/500</p>
            </div>

            <button
              onClick={() => setScreeningStep("symptoms")}
              className="flex items-center gap-1 text-[13px] text-text-caption font-medium min-h-[44px]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              이전으로
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
