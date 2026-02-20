"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useAssessmentStore } from "@/stores/useAssessmentStore";
import { useUserStore } from "@/stores/useUserStore";
import { useCoachStore } from "@/stores/useCoachStore";
import { useHydration } from "@/hooks/useHydration";

// ===== 3D Coach Avatar =====
function CoachAvatar({ size = 32 }: { size?: number }) {
  return (
    <div
      className="rounded-full bg-gradient-to-br from-primary via-[#4B95F9] to-[#6BABFF] flex items-center justify-center flex-shrink-0 shadow-md"
      style={{ width: size, height: size }}
    >
      <span style={{ fontSize: size * 0.55 }} role="img" aria-label="coach">
        🏋️‍♂️
      </span>
    </div>
  );
}

// ===== 스포츠 키워드 추출 =====
const SPORT_KEYWORDS: { keyword: string; id: string; label: string }[] = [
  { keyword: "골프", id: "golf", label: "골프" },
  { keyword: "테니스", id: "tennis", label: "테니스" },
  { keyword: "배드민턴", id: "badminton", label: "배드민턴" },
  { keyword: "러닝", id: "running", label: "러닝" },
  { keyword: "달리기", id: "running", label: "러닝" },
  { keyword: "조깅", id: "jogging", label: "조깅" },
  { keyword: "헬스", id: "gym", label: "헬스" },
  { keyword: "웨이트", id: "gym", label: "헬스" },
  { keyword: "걷기", id: "walking", label: "걷기" },
  { keyword: "산책", id: "walking", label: "걷기" },
  { keyword: "등산", id: "hiking", label: "등산" },
  { keyword: "수영", id: "swimming", label: "수영" },
  { keyword: "탁구", id: "tabletennis", label: "탁구" },
  { keyword: "축구", id: "soccer", label: "축구" },
  { keyword: "야구", id: "baseball", label: "야구" },
  { keyword: "농구", id: "basketball", label: "농구" },
  { keyword: "필라테스", id: "pilates", label: "필라테스" },
  { keyword: "요가", id: "yoga", label: "요가" },
  { keyword: "자전거", id: "cycling", label: "자전거" },
  { keyword: "사이클", id: "cycling", label: "자전거" },
  { keyword: "스쿼시", id: "squash", label: "스쿼시" },
  { keyword: "볼링", id: "bowling", label: "볼링" },
  { keyword: "크로스핏", id: "crossfit", label: "크로스핏" },
];

function extractSportNames(text: string): { main: { id: string; label: string } | null; sub: string[] } {
  const cleaned = text.replace(/\s*[⛳🏔️🎾🏃💪🚶]/g, "").trim();
  const matched: { id: string; label: string }[] = [];
  const seen = new Set<string>();

  for (const s of SPORT_KEYWORDS) {
    if (cleaned.includes(s.keyword) && !seen.has(s.id)) {
      seen.add(s.id);
      matched.push({ id: s.id, label: s.label });
    }
  }

  if (matched.length === 0) {
    return { main: { id: cleaned, label: cleaned }, sub: [] };
  }
  return { main: matched[0], sub: matched.slice(1).map((m) => m.label) };
}

// ===== 칩 데이터 =====
const SPORT_CHIPS = [
  { id: "golf", label: "골프 ⛳" },
  { id: "hiking", label: "등산 🏔️" },
  { id: "tennis", label: "테니스 🎾" },
  { id: "running", label: "러닝 🏃" },
  { id: "gym", label: "헬스 💪" },
  { id: "walking", label: "걷기 🚶" },
];
const EXPERIENCE_CHIPS = [
  { id: "beginner", label: "1년 미만 (입문)" },
  { id: "intermediate", label: "1~3년 (즐기는 중)" },
  { id: "advanced", label: "3~5년 (숙련)" },
  { id: "veteran", label: "5년 이상 (베테랑)" },
];
const GOAL_CHIPS = [
  { id: "performance", label: "비거리/기록 향상 🚀" },
  { id: "pain_free", label: "통증 없는 운동 🩹" },
  { id: "stamina", label: "체력 증진 🔋" },
  { id: "prevention", label: "부상 예방 🛡️" },
];
const PAIN_CHIPS = [
  { id: "none", label: "없음" },
  { id: "back", label: "허리" },
  { id: "knee", label: "무릎" },
  { id: "shoulder", label: "어깨" },
  { id: "elbow", label: "팔꿈치" },
  { id: "ankle", label: "발목" },
];

// ===== ChipSelector =====
function ChipSelector({
  chips,
  onSelect,
  selected = [],
}: {
  chips: { id: string; label: string }[];
  onSelect: (id: string, label: string) => void;
  selected?: string[];
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
      {chips.map((chip) => {
        const isSelected = selected.includes(chip.id);
        return (
          <button
            key={chip.id}
            onClick={() => onSelect(chip.id, chip.label)}
            className={`flex-shrink-0 px-4 py-2.5 rounded-full text-[14px] font-medium transition-all whitespace-nowrap ${isSelected
                ? "bg-primary text-white shadow-sm"
                : "bg-bg-warm text-text-secondary active:bg-primary/10 active:text-primary"
              }`}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}

// ===== ChatBubble (볼드 지원) =====
function ChatBubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  const renderContent = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}
    >
      {role === "assistant" && <CoachAvatar />}
      {role === "assistant" && <div className="w-2 flex-shrink-0" />}
      <div
        className={`max-w-[80%] px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap ${role === "user"
            ? "bg-primary text-white rounded-[20px] rounded-br-md"
            : "bg-bg-warm text-text-primary rounded-[20px] rounded-bl-md"
          }`}
      >
        {role === "assistant" ? renderContent(content) : content}
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start items-end gap-2">
      <CoachAvatar />
      <div className="bg-bg-warm px-4 py-3 rounded-[20px] rounded-bl-md">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-text-caption typing-dot" />
          <div className="w-2 h-2 rounded-full bg-text-caption typing-dot" style={{ animationDelay: "0.2s" }} />
          <div className="w-2 h-2 rounded-full bg-text-caption typing-dot" style={{ animationDelay: "0.4s" }} />
        </div>
      </div>
    </motion.div>
  );
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-bg-warm rounded-full overflow-hidden">
        <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${Math.min((step / total) * 100, 100)}%` }} transition={{ duration: 0.4 }} />
      </div>
      <span className="text-[12px] font-semibold text-text-caption flex-shrink-0">{Math.min(step, total)}/{total}</span>
    </div>
  );
}

// ===== 스크롤 드럼 피커 =====
function DrumPicker({
  items,
  value,
  onChange,
  suffix,
}: {
  items: number[];
  value: number;
  onChange: (v: number) => void;
  suffix: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ITEM_H = 44;
  const isScrollingRef = useRef(false);

  useEffect(() => {
    const idx = items.indexOf(value);
    if (idx >= 0 && containerRef.current && !isScrollingRef.current) {
      containerRef.current.scrollTop = idx * ITEM_H;
    }
  }, [value, items]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    isScrollingRef.current = true;
    const scrollTop = containerRef.current.scrollTop;
    const idx = Math.round(scrollTop / ITEM_H);
    const clamped = Math.max(0, Math.min(items.length - 1, idx));
    if (items[clamped] !== value) {
      onChange(items[clamped]);
    }
  };

  const handleScrollEnd = () => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const idx = Math.round(scrollTop / ITEM_H);
    const clamped = Math.max(0, Math.min(items.length - 1, idx));
    containerRef.current.scrollTo({ top: clamped * ITEM_H, behavior: "smooth" });
    isScrollingRef.current = false;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[90px] h-[132px] overflow-hidden">
        {/* 선택 영역 하이라이트 */}
        <div className="absolute top-[44px] left-0 right-0 h-[44px] bg-primary/8 rounded-xl border border-primary/15 z-0 pointer-events-none" />
        <div
          ref={containerRef}
          onScroll={handleScroll}
          onTouchEnd={handleScrollEnd}
          onMouseUp={handleScrollEnd}
          className="absolute inset-0 overflow-y-auto scrollbar-hide snap-y snap-mandatory z-10"
          style={{ paddingTop: ITEM_H, paddingBottom: ITEM_H }}
        >
          {items.map((item) => (
            <div
              key={item}
              className={`h-[44px] flex items-center justify-center snap-center text-[18px] font-semibold transition-colors ${item === value ? "text-text-primary" : "text-text-disabled"
                }`}
            >
              {item}
            </div>
          ))}
        </div>
        {/* 위아래 그라데이션 */}
        <div className="absolute top-0 left-0 right-0 h-[44px] bg-gradient-to-b from-bg-primary to-transparent z-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-[44px] bg-gradient-to-t from-bg-primary to-transparent z-20 pointer-events-none" />
      </div>
      <span className="text-[13px] text-text-caption mt-1">{suffix}</span>
    </div>
  );
}

function BodyInfoPicker({ onConfirm }: { onConfirm: (age: number, height: number, weight: number) => void }) {
  const currentYear = new Date().getFullYear();
  const birthYears = Array.from({ length: 71 }, (_, i) => currentYear - 80 + i); // 80세~10세
  const heights = Array.from({ length: 71 }, (_, i) => 130 + i); // 130~200cm
  const weights = Array.from({ length: 121 }, (_, i) => 30 + i); // 30~150kg

  const [birthYear, setBirthYear] = useState(currentYear - 60);
  const [height, setHeight] = useState(165);
  const [weight, setWeight] = useState(68);

  const age = currentYear - birthYear;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-warm rounded-2xl p-5"
    >
      <p className="text-[14px] font-semibold text-text-primary text-center mb-4">
        스크롤해서 선택해주세요
      </p>

      <div className="flex items-start justify-center gap-4">
        <DrumPicker items={birthYears} value={birthYear} onChange={setBirthYear} suffix={`태어난 해 (${age}세)`} />
        <DrumPicker items={heights} value={height} onChange={setHeight} suffix="cm" />
        <DrumPicker items={weights} value={weight} onChange={setWeight} suffix="kg" />
      </div>

      <button
        onClick={() => onConfirm(age, height, weight)}
        className="w-full mt-5 py-3 rounded-full bg-primary text-white text-[15px] font-bold active:brightness-95 transition-all"
      >
        확인
      </button>
    </motion.div>
  );
}

// ===== 운동수행능력 테스트 =====
const FITNESS_TESTS = [
  {
    id: "flexibility",
    label: "유연성",
    emoji: "🧘",
    instruction: "바닥에 앉아서 다리를 쭉 펴고, 손끝이 **발끝에 닿을 수 있는지** 확인해주세요.",
    chips: ["손끝이 발끝을 넘어감", "발끝에 딱 닿음", "발끝에 안 닿음", "무릎까지만"],
    scores: [90, 70, 45, 25],
  },
  {
    id: "balance",
    label: "밸런스",
    emoji: "🦩",
    instruction: "한 발로 서서 **눈을 감고** 몇 초간 버틸 수 있는지 측정해주세요.",
    chips: ["30초 이상", "15~30초", "5~15초", "5초 미만"],
    scores: [90, 70, 45, 25],
  },
  {
    id: "power",
    label: "하체 근력",
    emoji: "🦵",
    instruction: "의자에서 **30초 동안** 앉았다 일어서기를 반복해주세요. 몇 회 하셨나요?",
    chips: ["15회 이상", "10~14회", "5~9회", "5회 미만"],
    scores: [90, 70, 45, 25],
  },
  {
    id: "agility",
    label: "민첩성",
    emoji: "⚡",
    instruction: "제자리에서 **10초간 빠르게 발 구르기**를 해주세요. 어떠셨나요?",
    chips: ["쉬웠어요", "약간 힘들었어요", "꽤 힘들었어요", "못하겠어요"],
    scores: [85, 65, 40, 20],
  },
];

// ===== 10+ Step 하이브리드 플로우 =====
function HybridChatFlow() {
  const router = useRouter();
  const { userProfile, updateProfile, setResult, addChatMessage } = useAssessmentStore();

  const [messages, setMessages] = useState<{ id: string; role: "user" | "assistant"; content: string }[]>([]);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [selectedPains, setSelectedPains] = useState<string[]>([]);
  const [currentAIChips, setCurrentAIChips] = useState<{ id: string; label: string }[]>([]);
  const [showResultButton, setShowResultButton] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [tipText, setTipText] = useState("");
  const [showBodyPicker, setShowBodyPicker] = useState(false);
  // 운동수행능력 테스트
  const [fitnessTestIndex, setFitnessTestIndex] = useState(0);
  const [fitnessResults, setFitnessResults] = useState<Record<string, number>>({});
  // 칩에서 선택된 항목 추적 (Q3~Q5)
  const [selectedChipIds, setSelectedChipIds] = useState<string[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const totalSteps = 12;

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 100);
  }, []);

  const addMsg = useCallback((role: "user" | "assistant", content: string) => {
    const msg = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, role, content };
    setMessages((prev) => [...prev, msg]);
    addChatMessage({ role, content });
    return msg;
  }, [addChatMessage]);

  const delayMsg = useCallback((content: string, delay = 600) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        addMsg("assistant", content);
        resolve();
      }, delay);
    });
  }, [addMsg]);

  // Q1 인사 (Strict Mode 중복 방지)
  const greetingSent = useRef(false);
  useEffect(() => {
    if (greetingSent.current) return;
    greetingSent.current = true;
    setTimeout(() => {
      addMsg("assistant", "**안녕하세요! ON-U 피지컬 코치입니다.** 😊\n제가 앞으로 뭐라고 불러드리면 될까요?");
      setTipText("💡 이름이나 별명을 입력해주세요!");
      scrollToBottom();
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isLoading, showBodyPicker, scrollToBottom]);

  // ===== 이전 질문으로 돌아가기 =====
  const handleGoBack = () => {
    if (step <= 1) return;
    // 마지막 user + assistant 메시지 제거
    setMessages((prev) => {
      const copy = [...prev];
      // 마지막 assistant 제거
      const lastAssistantIdx = copy.findLastIndex((m) => m.role === "assistant");
      if (lastAssistantIdx >= 0) copy.splice(lastAssistantIdx, 1);
      // 마지막 user 제거
      const lastUserIdx = copy.findLastIndex((m) => m.role === "user");
      if (lastUserIdx >= 0) copy.splice(lastUserIdx, 1);
      return copy;
    });

    const prevStep = step - 1;
    setStep(prevStep);
    setTextInput("");
    setSelectedChipIds([]);
    setShowBodyPicker(prevStep === 2);
    setTipText("");

    // 해당 step 프로필 데이터 초기화
    switch (prevStep) {
      case 1: updateProfile({ nickname: "" }); break;
      case 2: updateProfile({ age: null, height: null, weight: null }); break;
      case 3: updateProfile({ sport: "", sportLabel: "", subSports: [] }); break;
      case 4: updateProfile({ experience: "" }); break;
      case 5: updateProfile({ goal: "" }); break;
      case 6: updateProfile({ painAreas: [] }); setSelectedPains([]); break;
    }
  };

  // ===== 텍스트 전송 핸들러 =====
  const handleTextSend = () => {
    // IME 입력 중이면 전송하지 않음
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).event?.isComposing) return;

    const val = textInput.trim();
    if (!val || isLoading) return;
    setTextInput("");
    setSelectedChipIds([]);
    processAnswer(val);
  };

  // ===== 칩 선택 핸들러 (Q3~Q5, Q8~12: 입력창에 넣기) =====
  const handleChipToInput = (id: string, _label: string) => {
    // Q4(경험), Q5(목표): 단일 선택만 허용
    const singleSelectSteps = [4, 5];
    const isSingleSelect = singleSelectSteps.includes(step);

    setSelectedChipIds((prev) => {
      const allChips = [...SPORT_CHIPS, ...EXPERIENCE_CHIPS, ...GOAL_CHIPS, ...currentAIChips];
      let newIds: string[];

      if (isSingleSelect) {
        // 단일 선택: 이미 선택된 것 클릭하면 해제, 아니면 교체
        newIds = prev.includes(id) ? [] : [id];
      } else {
        // 복수 선택: 토글
        if (prev.includes(id)) {
          newIds = prev.filter((p) => p !== id);
        } else {
          newIds = [...prev, id];
        }
      }

      const newLabels = newIds.map((chipId) => allChips.find((c) => c.id === chipId)?.label || chipId);
      setTextInput(newLabels.join(", "));
      return newIds;
    });
  };

  // ===== 통증 토글 =====
  const handlePainToggle = (id: string) => {
    if (id === "none") {
      // "없음" 선택 시 다른 부위 모두 해제
      setSelectedPains((prev) => prev.includes("none") ? [] : ["none"]);
      return;
    }
    setSelectedPains((prev) => {
      // 부위 선택 시 "없음" 해제
      const without = prev.filter((p) => p !== "none");
      return without.includes(id) ? without.filter((p) => p !== id) : [...without, id];
    });
  };

  // ===== 단계별 답변 처리 =====
  const processAnswer = async (answer: string) => {
    addMsg("user", answer);
    setTipText("");
    setSelectedChipIds([]);
    setTextInput("");

    switch (step) {
      case 1: { // 닉네임
        updateProfile({ nickname: answer });
        setStep(2);
        setShowBodyPicker(true);
        await delayMsg(`반가워요 **${answer}**님! 😄\n맞춤 진단을 위해 아래에서 **나이, 키, 몸무게**를 선택해주세요.`);
        break;
      }
      case 2: { // 나이/키/몸무게 (텍스트 입력 폴백)
        const nums = answer.match(/\d+/g)?.map(Number) || [];
        updateProfile({
          age: nums[0] || null,
          height: nums[1] || null,
          weight: nums[2] || null,
        });
        setShowBodyPicker(false);
        setStep(3);
        const name = useAssessmentStore.getState().userProfile.nickname || "사용자";
        await delayMsg(`감사해요! ${name}님, 평소에 **가장 즐겨하시는 스포츠**나 운동이 있으신가요?`);
        break;
      }
      case 3: { // 스포츠 — 키워드 추출
        // 부정적인 답변 체크 (운동 안 함)
        const negativeKeywords = ["안해", "안 해", "없어", "하지 않", "안 함", "숨쉬기", "없음"];
        const isNegative = negativeKeywords.some((k) => answer.includes(k));

        if (isNegative) {
          updateProfile({ sport: "none", sportLabel: "운동 안 함", subSports: [] });
          setStep(4);
          await delayMsg(`괜찮습니다! 😊 오히려 **처음 시작하시기 좋은 타이밍**이에요.\n그럼 평소에 **활동적인 움직임**은 좀 있으신 편인가요?`);
        } else {
          const extracted = extractSportNames(answer);
          if (extracted.main) {
            updateProfile({
              sport: extracted.main.id,
              sportLabel: extracted.main.label,
              subSports: extracted.sub,
            });
            const subText = extracted.sub.length > 0
              ? `\n(${extracted.sub.join(", ")}도 즐기시는군요!)`
              : "";
            setStep(4);
            await delayMsg(`**${extracted.main.label}**를 즐기시는군요! 👏${subText}\n${extracted.main.label}를 즐기신 지는 **얼마나 되셨나요**?`);
          } else {
            updateProfile({ sport: answer, sportLabel: answer, subSports: [] });
            setStep(4);
            await delayMsg(`**${answer}**를 즐기시는군요! 👏\n${answer}를 즐기신 지는 **얼마나 되셨나요**?`);
          }
        }
        break;
      }
      case 4: { // 숙련도
        const exp = EXPERIENCE_CHIPS.find((c) => answer.includes(c.label));
        updateProfile({ experience: exp?.id || answer });
        setStep(5);
        await delayMsg("현재 **가장 해결하고 싶은 고민**이나 목표는 무엇인가요?");
        break;
      }
      case 5: { // 목표
        const goal = GOAL_CHIPS.find((c) => answer.includes(c.label.replace(/\s*[🚀🩹🔋🛡️]/g, "")));
        updateProfile({ goal: goal?.id || answer });
        setStep(6);
        await delayMsg("혹시 현재 운동할 때 **불편하거나 아픈 부위**가 있으신가요?\n여러 개 선택할 수 있어요.");
        break;
      }
      case 6: { // 통증 — 한글 라벨로 저장
        const painLabels = answer === "없음" ? ["없음"] :
          PAIN_CHIPS.filter((c) => answer.includes(c.label)).map((c) => c.label);
        updateProfile({ painAreas: painLabels.length > 0 ? painLabels : [answer] });
        setStep(7);
        const name2 = useAssessmentStore.getState().userProfile.nickname || "사용자";
        await delayMsg(
          `기본 정보 입력이 완료되었어요! ✅\n\n이제 간단한 테스트를 통해 **${name2}님의 운동수행능력**을 확인할 거예요.\n\n그냥 넘어갈 수 있지만, 이 테스트를 진행하면 **더 정확한 리포트와 트레이닝**이 제공돼요.`
        );
        break;
      }
      default:
        break;
    }
    scrollToBottom();
  };

  // ===== 바디 피커 확인 =====
  const handleBodyConfirm = async (age: number, height: number, weight: number) => {
    updateProfile({ age, height, weight });
    setShowBodyPicker(false);
    addMsg("user", `${age}세 / ${height}cm / ${weight}kg`);
    setStep(3);
    const name = useAssessmentStore.getState().userProfile.nickname || "사용자";
    await delayMsg(`감사해요! ${name}님, 평소에 **가장 즐겨하시는 스포츠**나 운동이 있으신가요?`);
    scrollToBottom();
  };

  // ===== 운동수행능력 테스트 시작 =====
  const handleStartFitnessTest = async () => {
    addMsg("user", "운동수행능력 테스트 진행하기");
    setStep(7.1);
    setFitnessTestIndex(0);
    const test = FITNESS_TESTS[0];
    await delayMsg(`${test.emoji} **${test.label} 테스트**\n\n${test.instruction}`);
    scrollToBottom();
  };

  const handleSkipFitnessTest = async () => {
    addMsg("user", "건너뛰기");
    updateProfile({ fitnessTestCompleted: false });
    setStep(8);
    requestAIQuestion(8);
  };

  const handleFitnessAnswer = async (chipIndex: number, label: string) => {
    const test = FITNESS_TESTS[fitnessTestIndex];
    const score = test.scores[chipIndex];
    addMsg("user", label);

    const newResults = { ...fitnessResults, [test.id]: score };
    setFitnessResults(newResults);

    const nextIndex = fitnessTestIndex + 1;
    if (nextIndex < FITNESS_TESTS.length) {
      setFitnessTestIndex(nextIndex);
      const nextTest = FITNESS_TESTS[nextIndex];
      await delayMsg(`${nextTest.emoji} **${nextTest.label} 테스트**\n\n${nextTest.instruction}`);
    } else {
      updateProfile({
        fitnessTest: {
          flexibility: newResults.flexibility || null,
          balance: newResults.balance || null,
          power: newResults.power || null,
          agility: newResults.agility || null,
        },
        fitnessTestCompleted: true,
      });
      const avg = Math.round(Object.values(newResults).reduce((a, b) => a + b, 0) / Object.values(newResults).length);
      await delayMsg(`운동수행능력 테스트 완료! 🎉\n종합 점수: **${avg}점/100점**\n\n이제 AI가 더 정밀한 심층 분석을 진행할게요.`);
      setStep(8);
      setTimeout(() => requestAIQuestion(8), 800);
    }
    scrollToBottom();
  };

  // ===== AI 심층 질문 (Q8~Q12) =====
  const requestAIQuestion = async (questionStep: number) => {
    setIsLoading(true);
    setCurrentAIChips([]);

    try {
      const profile = useAssessmentStore.getState().userProfile;
      const history = useAssessmentStore.getState().chatHistory;
      const res = await fetch("/api/assessment-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "generate_question", step: questionStep, profile, history: history.slice(-12) }),
      });
      const data = await res.json();
      if (data.question) {
        addMsg("assistant", data.question);
        if (Array.isArray(data.chips)) {
          setCurrentAIChips(data.chips.map((c: string, i: number) => ({ id: `ai-${i}`, label: c })));
        }
      }
    } catch {
      addMsg("assistant", "한 가지 더 여쭤볼게요. 평소 운동 습관에 대해 알려주세요.");
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const handleAISend = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).event?.isComposing) return;

    const val = textInput.trim();
    if (!val || isLoading) return;
    addMsg("user", val);
    setTextInput("");
    setSelectedChipIds([]);
    setCurrentAIChips([]);

    const nextStep = step + 1;
    if (nextStep > 12) {
      setStep(13);
      setShowResultButton(true);
      const name = useAssessmentStore.getState().userProfile.nickname || "사용자";
      setTimeout(() => {
        addMsg("assistant", `**${name}님의 답변을 모두 분석했어요!** 🔬\n맞춤 진단 리포트를 확인해볼까요?`);
        scrollToBottom();
      }, 600);
      return;
    }
    setStep(nextStep);
    requestAIQuestion(nextStep);
  };

  // ===== 결과 생성 =====
  const handleGenerateResult = async () => {
    setIsGenerating(true);
    setShowResultButton(false);
    try {
      const profile = useAssessmentStore.getState().userProfile;
      const history = useAssessmentStore.getState().chatHistory;
      const res = await fetch("/api/assessment-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "generate_result", profile, history }),
      });
      const data = await res.json();
      setResult({
        profile,
        sportsAge: data.sportsAge || 52,
        chronologicalAge: profile.age || 65,
        radarData: data.radarData || [],
        peerAverage: data.peerAverage || 55,
        aiComment: data.aiComment || "",
        recommendations: data.recommendations || [],
        completedAt: new Date().toISOString(),
      });
      router.push("/report");
    } catch {
      setIsGenerating(false);
      addMsg("assistant", "결과 생성 중 문제가 발생했어요. 다시 시도해주세요.");
    }
  };

  // ===== 입력 영역 렌더링 =====
  const renderInputArea = () => {
    if (isGenerating) {
      return (
        <div className="px-5 py-6 flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
          <p className="text-[14px] font-semibold text-text-primary">맞춤 리포트 생성 중...</p>
        </div>
      );
    }

    if (showResultButton) {
      return (
        <div className="px-5 py-4">
          <button onClick={handleGenerateResult} className="w-full min-h-[56px] rounded-2xl bg-primary text-white text-[17px] font-bold tracking-tight active:brightness-95 transition-all shadow-button">
            네, 확인할게요!
          </button>
        </div>
      );
    }

    // Step 2: 바디 피커
    if (step === 2 && showBodyPicker) {
      return (
        <div className="px-5 py-3 border-t border-border-card/40 bg-bg-primary">
          <BodyInfoPicker onConfirm={handleBodyConfirm} />
        </div>
      );
    }

    // 운동수행능력 테스트 선택 (Step 7)
    if (step === 7) {
      return (
        <div className="px-5 py-4 space-y-2">
          <button onClick={handleStartFitnessTest} className="w-full min-h-[50px] rounded-2xl bg-primary text-white text-[15px] font-bold active:brightness-95 transition-all shadow-button">
            🏋️ 운동수행능력 테스트 진행하기
          </button>
          <button onClick={handleSkipFitnessTest} className="w-full py-2.5 text-[14px] text-text-caption font-medium">
            건너뛰기
          </button>
        </div>
      );
    }

    // 운동수행능력 테스트 진행 중 (Step 7.1)
    if (step === 7.1) {
      const test = FITNESS_TESTS[fitnessTestIndex];
      if (!test) return null;
      return (
        <div className="px-5 py-3 border-t border-border-card/40 bg-bg-primary">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {test.chips.map((chip, i) => (
              <button key={i} onClick={() => handleFitnessAnswer(i, chip)} className="flex-shrink-0 px-4 py-2.5 rounded-full text-[14px] font-medium bg-bg-warm text-text-secondary active:bg-primary/10 active:text-primary transition-all whitespace-nowrap">
                {chip}
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Q6: 통증 (복수선택 + 텍스트)
    if (step === 6) {
      return (
        <div className="px-5 py-3 border-t border-border-card/40 bg-bg-primary space-y-2">
          <ChipSelector chips={PAIN_CHIPS} onSelect={(id) => handlePainToggle(id)} selected={selectedPains} />
          {selectedPains.length > 0 && (
            <button onClick={() => {
              const labels = selectedPains.map((id) => PAIN_CHIPS.find((c) => c.id === id)?.label || id);
              processAnswer(labels.join(", "));
            }} className="w-full py-2.5 rounded-full bg-primary text-white text-[14px] font-semibold">
              선택 완료
            </button>
          )}
          <div className="flex items-center gap-2">
            <input type="text" value={textInput} onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (e.nativeEvent.isComposing) return;
                  e.preventDefault();
                  if (textInput.trim()) processAnswer(textInput.trim());
                  setTextInput("");
                }
              }}
              placeholder="직접 입력하기..." className="flex-1 px-4 py-3 rounded-full bg-bg-warm text-[15px] text-text-primary placeholder-text-disabled border-none outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>
      );
    }

    // Q3~Q5: 칩 → 입력창에 넣기 (자동 전송 X) + 보내기 버튼
    const chipMap: Record<number, { id: string; label: string }[]> = {
      3: SPORT_CHIPS,
      4: EXPERIENCE_CHIPS,
      5: GOAL_CHIPS,
    };
    if (step >= 3 && step <= 5 && chipMap[step]) {
      return (
        <div className="px-5 py-3 border-t border-border-card/40 bg-bg-primary space-y-2">
          <ChipSelector chips={chipMap[step]} onSelect={handleChipToInput} selected={selectedChipIds} />
          <div className="flex items-center gap-2">
            <input ref={inputRef} type="text" value={textInput} onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (e.nativeEvent.isComposing) return;
                  e.preventDefault();
                  handleTextSend();
                }
              }}
              placeholder="직접 입력하기..." className="flex-1 px-4 py-3 rounded-full bg-bg-warm text-[15px] text-text-primary placeholder-text-disabled border-none outline-none focus:ring-2 focus:ring-primary/20" />
            <button type="button" onClick={handleTextSend} disabled={!textInput.trim()}
              className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-30 transition-opacity flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 16V4M10 4l-5 5M10 4l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>
      );
    }

    // AI 질문 (Q8~Q12): 칩→입력창, 보내기로 전송
    if (step >= 8 && step <= 12) {
      return (
        <div className="px-5 py-3 border-t border-border-card/40 bg-bg-primary space-y-2">
          {currentAIChips.length > 0 && (
            <ChipSelector chips={currentAIChips} onSelect={handleChipToInput} />
          )}
          <div className="flex items-center gap-2">
            <input type="text" value={textInput} onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (e.nativeEvent.isComposing) return;
                  e.preventDefault();
                  handleAISend();
                }
              }}
              placeholder="직접 입력하기..." disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-full bg-bg-warm text-[15px] text-text-primary placeholder-text-disabled border-none outline-none focus:ring-2 focus:ring-primary/20" />
            <button type="button" onClick={handleAISend} disabled={!textInput.trim() || isLoading}
              className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-30 transition-opacity flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 16V4M10 4l-5 5M10 4l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>
      );
    }

    // Q1: 텍스트 입력만
    return (
      <div className="px-5 py-3 border-t border-border-card/40 bg-bg-primary">
        {tipText && (
          <p className="text-[13px] text-primary font-medium mb-2 px-1">{tipText}</p>
        )}
        <form onSubmit={(e) => { e.preventDefault(); handleTextSend(); }} className="flex items-center gap-2">
          <input ref={inputRef} type="text" value={textInput} onChange={(e) => setTextInput(e.target.value)}
            placeholder={step === 1 ? "닉네임을 입력해주세요" : "입력해주세요..."}
            maxLength={step === 1 ? 10 : 50}
            className="flex-1 px-4 py-3 rounded-full bg-bg-warm text-[15px] text-text-primary placeholder-text-disabled border-none outline-none focus:ring-2 focus:ring-primary/20" />
          <button type="submit" disabled={!textInput.trim()}
            className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-30 transition-opacity flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 16V4M10 4l-5 5M10 4l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </form>
      </div>
    );
  };

  const displayStep = step <= 6 ? step : step === 7 || step === 7.1 ? 7 : Math.min(step, 12);

  return (
    <div className="flex flex-col h-dvh bg-bg-primary">
      <header className="px-5 pt-4 pb-3 bg-bg-primary border-b border-border-card/30">
        <div className="flex items-center justify-between mb-2.5">
          <button onClick={() => router.back()} className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2" aria-label="뒤로 가기">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke="#333D4B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <span className="text-[16px] font-bold text-text-primary">1:1 맞춤 진단</span>
          <div className="w-8" />
        </div>
        <ProgressBar step={displayStep} total={totalSteps} />
      </header>

      {/* 이전 질문 버튼 */}
      {step > 1 && step <= 6 && (
        <button
          onClick={handleGoBack}
          className="flex items-center gap-1 px-5 py-2 text-[13px] text-text-caption font-medium hover:text-primary transition-colors self-start"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          이전 질문
        </button>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {messages.map((msg) => <ChatBubble key={msg.id} role={msg.role} content={msg.content} />)}
          </AnimatePresence>
          {isLoading && <TypingIndicator />}
        </div>
      </div>

      {renderInputArea()}
    </div>
  );
}

// ===== 일반 코치 채팅 (진단 완료 후) =====
function CoachChat() {
  const router = useRouter();
  const result = useAssessmentStore((s) => s.result);
  const proactiveQ = useAssessmentStore((s) => s.proactiveQuestion);
  const markRead = useAssessmentStore((s) => s.markProactiveRead);
  const profile = useUserStore((s) => s.profile);
  const messages = useCoachStore((s) => s.messages);
  const addMessage = useCoachStore((s) => s.addMessage);
  const isLoading = useCoachStore((s) => s.isLoading);
  const setLoading = useCoachStore((s) => s.setLoading);

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const nickname = result?.profile?.nickname || profile?.nickname || "";

  // 선제 질문 표시 (Strict Mode 중복 방지)
  const proactiveSent = useRef(false);
  useEffect(() => {
    if (proactiveSent.current) return;
    if (proactiveQ && !proactiveQ.read && messages.length === 0) {
      proactiveSent.current = true;
      addMessage({ role: "assistant", content: proactiveQ.question });
      markRead();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proactiveQ]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    addMessage({ role: "user", content: text.trim() });
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          nickname,
          context: { sport: result?.profile?.sportLabel, painAreas: result?.profile?.painAreas, goal: result?.profile?.goal },
          history: messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      addMessage({ role: "assistant", content: data.reply || "답변을 받지 못했어요." });
    } catch {
      addMessage({ role: "assistant", content: "인터넷 연결을 확인해주세요." });
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-dvh bg-bg-primary">
      <header className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border-card/30">
        <button onClick={() => router.back()} className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2" aria-label="뒤로 가기">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke="#333D4B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <span className="text-[16px] font-bold text-text-primary">AI 코치</span>
        <div className="w-8" />
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-5 pb-4">
            <div className="relative mb-6">
              <div className="absolute inset-[-12px] bg-primary/6 rounded-full blur-xl" />
              <CoachAvatar size={72} />
            </div>
            <h2 className="text-[22px] font-bold text-text-primary tracking-tight mb-2">AI 피지컬 코치</h2>
            <p className="text-[14px] text-text-caption leading-relaxed max-w-[260px]">운동, 컨디션, 부상 관리 등<br />무엇이든 물어보세요</p>
            <div className="flex flex-wrap gap-2 justify-center mt-8 max-w-[320px]">
              {[
                { text: "오늘 운동 추천해주세요", emoji: "💪" },
                { text: "컨디션이 안 좋아요", emoji: "😣" },
                { text: "스트레칭 알려주세요", emoji: "🧘" },
              ].map((q) => (
                <button key={q.text} onClick={() => sendMessage(q.text)} className="px-4 py-2.5 rounded-full bg-bg-warm text-[13px] text-text-secondary font-medium active:bg-primary/8 active:text-primary transition-all border border-transparent active:border-primary/10">
                  <span className="mr-1">{q.emoji}</span> {q.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-5 py-4 space-y-3">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <ChatBubble key={msg.id} role={msg.role} content={msg.content} />
              ))}
            </AnimatePresence>
            {isLoading && <TypingIndicator />}
          </div>
        )}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="px-5 py-3 border-t border-border-card/40 bg-bg-primary">
        <div className="flex items-center gap-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="직접 입력하기..." disabled={isLoading} className="flex-1 px-4 py-3 rounded-full bg-bg-warm text-[15px] text-text-primary placeholder-text-disabled border-none outline-none focus:ring-2 focus:ring-primary/20" />
          <button type="submit" disabled={!input.trim() || isLoading} className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-30 transition-opacity flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 16V4M10 4l-5 5M10 4l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CoachPage() {
  const hydrated = useHydration();
  const result = useAssessmentStore((s) => s.result);
  const hasCompleted = useUserStore((s) => s.hasCompletedAssessment);
  if (!hydrated) return null;
  if (result || hasCompleted) return <CoachChat />;
  return <HybridChatFlow />;
}
