"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { GoalActivity } from "@/types/assessment";
import { GOAL_ACTIVITY_OPTIONS, SPECIFIC_GOAL_OPTIONS } from "@/types/assessment";

interface GoalSelectionStepProps {
  goalActivities: GoalActivity[];
  specificGoals: string[];
  onActivitiesChange: (activities: GoalActivity[]) => void;
  onSpecificGoalsChange: (goals: string[]) => void;
}

export function GoalSelectionStep({
  goalActivities,
  specificGoals,
  onActivitiesChange,
  onSpecificGoalsChange,
}: GoalSelectionStepProps) {
  const [showSpecificGoals, setShowSpecificGoals] = useState(goalActivities.length > 0);

  const toggleActivity = (id: GoalActivity) => {
    const updated = goalActivities.includes(id)
      ? goalActivities.filter((a) => a !== id)
      : [...goalActivities, id];
    onActivitiesChange(updated);

    // 활동 선택 시 구체적 목표 화면 보여주기
    if (updated.length > 0 && !showSpecificGoals) {
      setShowSpecificGoals(true);
    }
    if (updated.length === 0) {
      setShowSpecificGoals(false);
      onSpecificGoalsChange([]);
    }
  };

  const toggleSpecificGoal = (id: string) => {
    const updated = specificGoals.includes(id)
      ? specificGoals.filter((g) => g !== id)
      : [...specificGoals, id];
    onSpecificGoalsChange(updated);
  };

  // 선택된 활동들의 구체적 목표 옵션 모으기
  const availableGoals = goalActivities.flatMap(
    (activity) => SPECIFIC_GOAL_OPTIONS[activity] ?? []
  );

  return (
    <div className="space-y-6">
      {/* 활동 선택 */}
      <div>
        <h2 className="text-[22px] font-bold text-text-primary leading-snug tracking-tight mb-2">
          어떤 운동을 하고 싶으세요?
        </h2>
        <p className="text-[15px] text-text-caption mb-5">
          하고 싶은 활동을 모두 골라주세요
        </p>

        <div className="grid grid-cols-2 gap-3">
          {GOAL_ACTIVITY_OPTIONS.map((option) => {
            const isSelected = goalActivities.includes(option.id);
            return (
              <button
                key={option.id}
                onClick={() => toggleActivity(option.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all min-h-[100px] ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-card"
                    : "border-border-card bg-bg-card active:bg-bg-warm"
                }`}
              >
                <span className="text-[28px]">{option.icon}</span>
                <span
                  className={`text-[15px] font-semibold ${
                    isSelected ? "text-primary" : "text-text-primary"
                  }`}
                >
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 구체적 목표 선택 */}
      <AnimatePresence>
        {showSpecificGoals && availableGoals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-[18px] font-bold text-text-primary tracking-tight mb-2">
              구체적인 목표가 있으신가요?
            </h3>
            <p className="text-[13px] text-text-caption mb-4">
              해당되는 것을 골라주세요 (선택)
            </p>

            <div className="space-y-2">
              {availableGoals.map((goal) => {
                const isSelected = specificGoals.includes(goal.id);
                return (
                  <button
                    key={goal.id}
                    onClick={() => toggleSpecificGoal(goal.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all text-left ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border-card bg-bg-card active:bg-bg-warm"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? "border-primary bg-primary"
                          : "border-text-disabled"
                      }`}
                    >
                      {isSelected && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`text-[15px] font-medium ${
                        isSelected ? "text-primary" : "text-text-primary"
                      }`}
                    >
                      {goal.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
