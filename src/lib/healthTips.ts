export interface HealthTip {
  id: string;
  icon: string;
  title: string;
  description: string;
  category: string;
}

export const healthTips: HealthTip[] = [
  {
    id: "knee-care",
    icon: "🦵",
    title: "무릎 관절에 좋은 습관 3가지",
    description:
      "쿠션 있는 신발 신기, 계단보다 엘리베이터, 의자에서 다리 펴기를 해보세요.",
    category: "관절",
  },
  {
    id: "hydration",
    icon: "💧",
    title: "물 자주 마시기",
    description:
      "하루 6~8잔의 물을 조금씩 나눠서 드세요. 한 번에 많이 마시지 않아도 괜찮아요.",
    category: "생활",
  },
  {
    id: "walking",
    icon: "🚶",
    title: "하루 30분 걷기의 힘",
    description:
      "빠르게 걷지 않아도 돼요. 천천히 편하게 걷는 것만으로도 심장 건강에 도움이 됩니다.",
    category: "운동",
  },
  {
    id: "stretching",
    icon: "🧘",
    title: "아침 스트레칭 5분",
    description:
      "잠에서 깨면 이불 위에서 기지개를 켜고, 목과 어깨를 천천히 돌려보세요.",
    category: "운동",
  },
  {
    id: "posture",
    icon: "🪑",
    title: "바른 자세로 앉기",
    description:
      "등을 의자 등받이에 붙이고, 발바닥이 바닥에 닿게 앉으면 허리가 편해져요.",
    category: "생활",
  },
  {
    id: "sleep",
    icon: "😴",
    title: "숙면을 위한 작은 습관",
    description:
      "잠자기 2시간 전에는 스마트폰을 내려놓고, 따뜻한 물을 한 잔 마셔보세요.",
    category: "생활",
  },
];
