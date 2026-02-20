"use client";

import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { Card } from "@/components/ui/Card";

interface CalendarHeatmapProps {
  completedDates: string[]; // 'YYYY-MM-DD' array
}

const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function CalendarHeatmap({ completedDates }: CalendarHeatmapProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed

  const completedSet = useMemo(() => new Set(completedDates), [completedDates]);

  const todayKey = toDateKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  // Calculate calendar grid
  const { days, monthLabel } = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    // Monday-based offset: JS getDay() returns 0=Sun, so Mon=0 in our system
    const jsDay = firstDay.getDay();
    const mondayOffset = jsDay === 0 ? 6 : jsDay - 1;

    // Build array: null for padding, then day numbers
    const grid: (number | null)[] = [];
    for (let i = 0; i < mondayOffset; i++) {
      grid.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      grid.push(d);
    }

    const label = `${viewYear}년 ${viewMonth + 1}월`;

    return { days: grid, monthLabel: label };
  }, [viewYear, viewMonth]);

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    // Don't allow navigating past the current month
    const isCurrentMonth =
      viewYear === today.getFullYear() && viewMonth === today.getMonth();
    if (isCurrentMonth) return;

    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const isCurrentMonth =
    viewYear === today.getFullYear() && viewMonth === today.getMonth();

  return (
    <Card variant="default" padding="default">
      {/* Month navigation header */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={goToPrevMonth}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl active:bg-bg-warm transition-colors text-text-secondary"
          aria-label="이전 달"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 19l-7-7 7-7"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <h3 className="text-[18px] font-bold text-text-primary">{monthLabel}</h3>

        <button
          onClick={goToNextMonth}
          disabled={isCurrentMonth}
          className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl active:bg-bg-warm transition-colors ${
            isCurrentMonth ? "text-text-disabled cursor-not-allowed" : "text-text-secondary"
          }`}
          aria-label="다음 달"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 5l7 7-7 7"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Day of week labels */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="flex items-center justify-center h-8 text-[13px] font-semibold text-text-caption"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Day cells grid */}
      <motion.div
        key={`${viewYear}-${viewMonth}`}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="grid grid-cols-7 gap-y-1"
      >
        {days.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="w-10 h-10" />;
          }

          const dateKey = toDateKey(viewYear, viewMonth, day);
          const isCompleted = completedSet.has(dateKey);
          const isToday = dateKey === todayKey;
          const isFuture = new Date(viewYear, viewMonth, day) > today;

          let cellClass =
            "w-10 h-10 flex items-center justify-center text-[15px] font-medium mx-auto transition-colors";

          if (isCompleted && isToday) {
            // Today + completed
            cellClass += " bg-success text-white rounded-full ring-2 ring-success";
          } else if (isCompleted) {
            // Completed day
            cellClass += " bg-success text-white rounded-full";
          } else if (isToday) {
            // Today, not completed
            cellClass += " ring-2 ring-primary text-primary rounded-full";
          } else if (isFuture) {
            // Future day
            cellClass += " text-text-disabled";
          } else {
            // Past, not completed
            cellClass += " text-text-caption";
          }

          return (
            <div key={dateKey} className={cellClass}>
              {day}
            </div>
          );
        })}
      </motion.div>
    </Card>
  );
}
