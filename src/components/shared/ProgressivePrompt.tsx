"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type PromptType = "age-gender" | "health-detail" | "environment-time" | "sarcf";

interface ProgressivePromptProps {
  type: PromptType;
  onComplete: (data: Record<string, unknown>) => void;
  onDismiss: () => void;
}

const PROMPT_CONFIG: Record<PromptType, { title: string; subtitle: string; icon: string }> = {
  "age-gender": {
    title: "더 정확한 프로그램을 위해",
    subtitle: "나이와 성별을 알려주시면 운동 강도를 맞춰드릴 수 있어요",
    icon: "🎯",
  },
  "health-detail": {
    title: "건강 상태 체크",
    subtitle: "건강 상태를 좀 더 알려주시면 더 안전한 운동을 추천할 수 있어요",
    icon: "💚",
  },
  "environment-time": {
    title: "운동 환경 알려주세요",
    subtitle: "어디서, 얼마나 운동하시는지 알면 더 맞는 프로그램을 만들 수 있어요",
    icon: "🏠",
  },
  sarcf: {
    title: "건강 체크해볼까요?",
    subtitle: "간단한 체크로 체력 상태를 파악할 수 있어요 (선택사항)",
    icon: "📋",
  },
};

export function ProgressivePrompt({ type, onComplete, onDismiss }: ProgressivePromptProps) {
  const config = PROMPT_CONFIG[type];
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
      >
        <Card variant="elevated" className="bg-gradient-to-br from-primary/3 to-primary/8 border border-primary/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-[24px]">{config.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-text-primary">
                {config.title}
              </p>
              <p className="text-[13px] text-text-caption mt-0.5">
                {config.subtitle}
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              size="default"
              onClick={() => setExpanded(true)}
            >
              알려줄게요
            </Button>
            <button
              onClick={onDismiss}
              className="px-4 py-2 text-[14px] text-text-caption font-medium"
            >
              나중에
            </button>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Expanded form for each type
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card variant="elevated">
          <h3 className="text-[17px] font-bold text-text-primary mb-4">{config.title}</h3>

          {type === "age-gender" && (
            <AgeGenderForm onComplete={onComplete} />
          )}
          {type === "health-detail" && (
            <HealthDetailForm onComplete={onComplete} />
          )}
          {type === "environment-time" && (
            <EnvironmentTimeForm onComplete={onComplete} />
          )}
          {type === "sarcf" && (
            <div className="text-center py-4">
              <p className="text-[15px] text-text-caption mb-4">
                SARC-F 체력 검사는 리포트 페이지에서 할 수 있어요
              </p>
              <Button size="default" onClick={() => onComplete({})}>
                확인
              </Button>
            </div>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

function AgeGenderForm({ onComplete }: { onComplete: (data: Record<string, unknown>) => void }) {
  const [gender, setGender] = useState<string | null>(null);
  const [birthYear, setBirthYear] = useState("");

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[14px] text-text-secondary mb-2">성별</p>
        <div className="flex gap-2">
          {[
            { id: "male", label: "남성" },
            { id: "female", label: "여성" },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setGender(opt.id)}
              className={`flex-1 py-3 rounded-xl text-[15px] font-semibold transition-all ${
                gender === opt.id
                  ? "bg-primary text-white"
                  : "bg-bg-warm text-text-secondary"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[14px] text-text-secondary mb-2">태어난 해</p>
        <input
          type="number"
          value={birthYear}
          onChange={(e) => setBirthYear(e.target.value)}
          placeholder="예: 1960"
          className="w-full px-4 py-3 rounded-xl bg-bg-warm text-[16px] text-text-primary placeholder-text-disabled border-none outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      <Button
        size="default"
        disabled={!gender || !birthYear}
        onClick={() => onComplete({ gender, birthYear: parseInt(birthYear) })}
      >
        저장
      </Button>
    </div>
  );
}

function HealthDetailForm({ onComplete }: { onComplete: (data: Record<string, unknown>) => void }) {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[14px] text-text-secondary mb-2">키 (cm)</p>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="165"
            className="w-full px-4 py-3 rounded-xl bg-bg-warm text-[16px] text-text-primary placeholder-text-disabled border-none outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <p className="text-[14px] text-text-secondary mb-2">몸무게 (kg)</p>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="65"
            className="w-full px-4 py-3 rounded-xl bg-bg-warm text-[16px] text-text-primary placeholder-text-disabled border-none outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>
      <Button
        size="default"
        onClick={() => onComplete({
          height: height ? parseInt(height) : null,
          weight: weight ? parseInt(weight) : null,
        })}
      >
        저장
      </Button>
    </div>
  );
}

function EnvironmentTimeForm({ onComplete }: { onComplete: (data: Record<string, unknown>) => void }) {
  const [env, setEnv] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);

  const envOptions = [
    { id: "home", label: "집 안", icon: "🏠" },
    { id: "park", label: "공원", icon: "🌳" },
    { id: "gym", label: "헬스장", icon: "🏋️" },
  ];

  const timeOptions = [
    { id: "10min", label: "10분" },
    { id: "30min", label: "30분" },
    { id: "60min", label: "1시간" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[14px] text-text-secondary mb-2">주로 어디서 운동하세요?</p>
        <div className="flex gap-2">
          {envOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setEnv(opt.id)}
              className={`flex-1 py-3 rounded-xl text-[14px] font-semibold transition-all ${
                env === opt.id
                  ? "bg-primary text-white"
                  : "bg-bg-warm text-text-secondary"
              }`}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[14px] text-text-secondary mb-2">하루 운동 시간은?</p>
        <div className="flex gap-2">
          {timeOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setTime(opt.id)}
              className={`flex-1 py-3 rounded-xl text-[14px] font-semibold transition-all ${
                time === opt.id
                  ? "bg-primary text-white"
                  : "bg-bg-warm text-text-secondary"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <Button
        size="default"
        disabled={!env || !time}
        onClick={() => onComplete({ environment: env, availableTime: time })}
      >
        저장
      </Button>
    </div>
  );
}
