export type BadgeId =
  | "first-step"
  | "streak-3"
  | "first-week"
  | "streak-30"
  | "program-complete"
  | "getting-easier";

export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  emoji: string;
  condition: string;
}

export interface EarnedBadge {
  badgeId: BadgeId;
  earnedAt: string;
}

export const BADGES: Badge[] = [
  {
    id: "first-step",
    name: "첫 걸음",
    description: "시작이 반이에요!",
    emoji: "🌱",
    condition: "첫 운동 완료",
  },
  {
    id: "streak-3",
    name: "3일 연속",
    description: "꾸준함이 실력이에요",
    emoji: "🔥",
    condition: "3일 연속 운동",
  },
  {
    id: "first-week",
    name: "첫 주 완주",
    description: "첫 주를 멋지게 마쳤어요!",
    emoji: "🏅",
    condition: "일주일 운동 완주",
  },
  {
    id: "streak-30",
    name: "한 달 꾸준히",
    description: "한 달 동안 정말 대단해요",
    emoji: "👑",
    condition: "30일 연속 운동",
  },
  {
    id: "program-complete",
    name: "프로그램 졸업",
    description: "목표를 이뤘어요!",
    emoji: "🎓",
    condition: "프로그램 완료",
  },
  {
    id: "getting-easier",
    name: "편해졌어요",
    description: "체력이 좋아지고 있어요",
    emoji: "💪",
    condition: "RPE 하락 추세",
  },
];
