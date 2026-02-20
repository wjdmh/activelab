"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface WorkoutTimerProps {
  seconds: number;
  onComplete: () => void;
  size?: number;
}

export function WorkoutTimer({
  seconds,
  onComplete,
  size = 160,
}: WorkoutTimerProps) {
  const [remaining, setRemaining] = useState(seconds);
  const onCompleteRef = useRef(onComplete);
  const hasCompletedRef = useRef(false);

  // Keep callback ref fresh without triggering re-renders
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Reset when seconds prop changes
  useEffect(() => {
    setRemaining(seconds);
    hasCompletedRef.current = false;
  }, [seconds]);

  // Countdown interval
  useEffect(() => {
    if (remaining <= 0) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(interval);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remaining > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fire onComplete when remaining reaches 0
  const handleComplete = useCallback(() => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;

    // Haptic feedback
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(200);
    }

    onCompleteRef.current();
  }, []);

  useEffect(() => {
    if (remaining === 0) {
      handleComplete();
    }
  }, [remaining, handleComplete]);

  // SVG calculations
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = seconds > 0 ? remaining / seconds : 0;
  const dashOffset = circumference * (1 - progress);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-bg-warm"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="text-primary transition-[stroke-dashoffset] duration-1000 ease-linear"
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[40px] font-bold text-text-primary leading-none tabular-nums">
          {remaining}
        </span>
        <span className="text-[15px] text-text-caption mt-1">초</span>
      </div>
    </div>
  );
}
