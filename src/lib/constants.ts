export const APP_NAME = "온유";
export const APP_DESCRIPTION = "나에게 꼭 맞는 운동 프로그램";

export const DAYS_KR = [
  "월요일",
  "화요일",
  "수요일",
  "목요일",
  "금요일",
  "토요일",
  "일요일",
] as const;

// === 듀얼 트랙 선택 ===

export const TRACK_OPTIONS = [
  {
    id: "vitality" as const,
    label: "스포츠 & 여행",
    subtitle: "골프·등산·테니스·여행을 더 잘 즐기고 싶어요",
    icon: "⚡",
  },
  {
    id: "wellness" as const,
    label: "건강 & 통증 관리",
    subtitle: "일상이 편해지고, 통증 없는 생활이 목표예요",
    icon: "💚",
  },
] as const;

// === Track A: Vitality 옵션 ===

export const SPORT_OPTIONS = [
  { id: "golf", label: "골프", icon: "⛳" },
  { id: "hiking", label: "등산", icon: "🏔️" },
  { id: "tennis", label: "테니스/배드민턴", icon: "🎾" },
  { id: "swimming", label: "수영", icon: "🏊" },
  { id: "travel", label: "여행/걷기", icon: "✈️" },
  { id: "cycling", label: "자전거", icon: "🚴" },
  { id: "dance", label: "댄스/에어로빅", icon: "💃" },
  { id: "other", label: "기타 활동", icon: "🏃" },
] as const;

export const PERFORMANCE_CONCERN_OPTIONS: Record<string, Array<{ id: string; label: string; icon: string }>> = {
  golf: [
    { id: "backswing-stiff", label: "백스윙이 뻣뻣해요", icon: "🔄" },
    { id: "distance-short", label: "비거리가 줄었어요", icon: "📏" },
    { id: "back-pain-after", label: "라운딩 후 허리가 아파요", icon: "😣" },
    { id: "stamina-18hole", label: "후반 9홀에 체력이 떨어져요", icon: "🔋" },
    { id: "custom", label: "기타 (직접 입력)", icon: "✏️" },
    { id: "none", label: "특별한 고민이 없어요", icon: "👌" },
  ],
  hiking: [
    { id: "knee-descent", label: "하산할 때 무릎이 아파요", icon: "🦵" },
    { id: "stamina-3hr", label: "3시간 이상 산행이 힘들어요", icon: "⏱️" },
    { id: "balance-rocky", label: "바위/경사에서 불안해요", icon: "⛰️" },
    { id: "breath-uphill", label: "오르막에서 숨이 차요", icon: "💨" },
    { id: "custom", label: "기타 (직접 입력)", icon: "✏️" },
    { id: "none", label: "특별한 고민이 없어요", icon: "👌" },
  ],
  tennis: [
    { id: "shoulder-serve", label: "서브 시 어깨가 아파요", icon: "🎯" },
    { id: "lateral-slow", label: "좌우 이동이 느려졌어요", icon: "↔️" },
    { id: "grip-weak", label: "그립 힘이 약해졌어요", icon: "✊" },
    { id: "reaction-slow", label: "반응 속도가 느려졌어요", icon: "⚡" },
    { id: "custom", label: "기타 (직접 입력)", icon: "✏️" },
    { id: "none", label: "특별한 고민이 없어요", icon: "👌" },
  ],
  swimming: [
    { id: "shoulder-rotation", label: "어깨 가동 범위가 좁아요", icon: "🔄" },
    { id: "breath-control", label: "호흡 조절이 어려워요", icon: "💨" },
    { id: "endurance", label: "오래 수영하기 힘들어요", icon: "🔋" },
    { id: "kick-weak", label: "킥 파워가 약해요", icon: "🦶" },
    { id: "custom", label: "기타 (직접 입력)", icon: "✏️" },
    { id: "none", label: "특별한 고민이 없어요", icon: "👌" },
  ],
  default: [
    { id: "stamina-low", label: "체력이 예전 같지 않아요", icon: "🔋" },
    { id: "flexibility-poor", label: "몸이 뻣뻣해요", icon: "🧘" },
    { id: "balance-shaky", label: "균형 잡기가 어려워요", icon: "⚖️" },
    { id: "pain-activity", label: "활동 후 통증이 있어요", icon: "😣" },
    { id: "custom", label: "기타 (직접 입력)", icon: "✏️" },
    { id: "none", label: "특별한 고민이 없어요", icon: "👌" },
  ],
};

export const FITNESS_CHECK_OPTIONS = {
  flexibility: [
    { id: "good" as const, label: "닿아요", description: "등 뒤로 양손이 만나요", icon: "👍" },
    { id: "moderate" as const, label: "살짝 부족", description: "손끝이 거의 닿을 듯 말 듯", icon: "🤏" },
    { id: "poor" as const, label: "안 닿아요", description: "한참 부족해요", icon: "😅" },
  ],
  lowerStrength: [
    { id: "good" as const, label: "10회 이상", description: "30초 안에 쉽게 가능", icon: "💪" },
    { id: "moderate" as const, label: "5~9회", description: "할 수는 있지만 힘들어요", icon: "😤" },
    { id: "poor" as const, label: "5회 미만", description: "많이 힘들거나 어려워요", icon: "😰" },
  ],
  balance: [
    { id: "good" as const, label: "10초 이상", description: "안정적으로 가능", icon: "🧘" },
    { id: "moderate" as const, label: "5~9초", description: "흔들리지만 가능", icon: "🙃" },
    { id: "poor" as const, label: "5초 미만", description: "바로 발이 내려가요", icon: "😵" },
  ],
} as const;

// === Track B: Wellness 옵션 ===

export const AGE_OPTIONS = [
  { id: "under-60", label: "60세 미만" },
  { id: "60-64", label: "60~64세" },
  { id: "65-69", label: "65~69세" },
  { id: "70-74", label: "70~74세" },
  { id: "75-plus", label: "75세 이상" },
] as const;

export const CONDITION_OPTIONS = [
  { id: "medical-restriction", label: "의사 운동 제한 권고", icon: "🏥" },
  { id: "high-blood-pressure", label: "고혈압", icon: "❤️" },
  { id: "diabetes", label: "당뇨", icon: "🩸" },
  { id: "arthritis", label: "관절염", icon: "🦴" },
  { id: "osteoporosis", label: "골다공증", icon: "🩻" },
  { id: "custom", label: "기타 (직접 입력)", icon: "✏️" },
  { id: "none", label: "없음", icon: "✅" },
] as const;

export const PAIN_OPTIONS = [
  { id: "knee", label: "무릎", icon: "🦵" },
  { id: "back", label: "허리", icon: "🔙" },
  { id: "shoulder", label: "어깨", icon: "💪" },
  { id: "neck", label: "목", icon: "🧣" },
  { id: "hip", label: "고관절", icon: "🦴" },
  { id: "wrist", label: "손목/손", icon: "🤚" },
  { id: "custom", label: "기타", icon: "✏️" },
  { id: "none", label: "없어요", icon: "✅" },
] as const;

// === SARC-F 평가 옵션 ===

export const SARCF_DIFFICULTY_OPTIONS = [
  { id: "none" as const, label: "전혀 힘들지 않아요", score: 0, icon: "😊" },
  { id: "some" as const, label: "조금 힘들어요", score: 1, icon: "😐" },
  { id: "a_lot" as const, label: "많이 힘들어요", score: 2, icon: "😰" },
  { id: "unable" as const, label: "할 수 없어요", score: 2, icon: "😢" },
] as const;

export const SARCF_FALL_OPTIONS = [
  { id: "none" as const, label: "없어요", score: 0, icon: "✅", description: "지난 1년간 넘어진 적이 없어요" },
  { id: "1-3" as const, label: "1~3번", score: 1, icon: "⚠️", description: "지난 1년간 1~3번 넘어졌어요" },
  { id: "4-plus" as const, label: "4번 이상", score: 2, icon: "🚨", description: "지난 1년간 4번 이상 넘어졌어요" },
] as const;

// === 환경/시간/목표 옵션 ===

export const ENVIRONMENT_OPTIONS = [
  { id: "home" as const, label: "집 안", icon: "🏠", description: "거실이나 방에서 편하게" },
  { id: "park" as const, label: "공원/야외", icon: "🌳", description: "바깥 공기 마시며" },
  { id: "gym" as const, label: "헬스장/체육관", icon: "🏋️", description: "운동 기구를 활용해서" },
  { id: "senior-center" as const, label: "경로당/복지관", icon: "🏛️", description: "친구분들과 함께" },
  { id: "custom" as const, label: "기타", icon: "✏️", description: "직접 입력" },
] as const;

export const TIME_OPTIONS = [
  { id: "10min" as const, label: "10분 이내", description: "짧고 간단하게" },
  { id: "30min" as const, label: "30분 이내", description: "적당한 시간을 내서" },
  { id: "60min" as const, label: "1시간 이내", description: "충분히 시간을 투자해서" },
] as const;

export const MOTIVATION_OPTIONS = [
  { id: "grandchild", label: "손주와 놀기" },
  { id: "travel", label: "여행 다니기" },
  { id: "hiking", label: "등산/산책" },
  { id: "daily-life", label: "편한 일상생활" },
  { id: "sports", label: "골프/스포츠" },
  { id: "social", label: "모임/사교활동" },
  { id: "independence", label: "혼자 거뜬히 살기" },
  { id: "pain-free", label: "통증 없는 생활" },
  { id: "custom", label: "기타 (직접 작성)" },
] as const;

export const EXERCISE_HISTORY_OPTIONS = [
  { id: "walking", label: "걷기/산책" },
  { id: "hiking", label: "등산" },
  { id: "swimming", label: "수영" },
  { id: "yoga", label: "요가/필라테스" },
  { id: "gym", label: "헬스/웨이트" },
  { id: "dance", label: "댄스/에어로빅" },
  { id: "golf", label: "골프" },
  { id: "tennis", label: "테니스/배드민턴" },
  { id: "cycling", label: "자전거" },
  { id: "none", label: "운동 경험 없음" },
  { id: "custom", label: "기타 (직접 작성)" },
] as const;

export const GOAL_OPTIONS = [
  { id: "strength", label: "근력 (힘)", icon: "💪" },
  { id: "flexibility", label: "유연성 (부드러움)", icon: "🧘" },
  { id: "weight", label: "체중 관리", icon: "⚖️" },
  { id: "vitality", label: "활력", icon: "⚡" },
] as const;

export const RPE_LEVELS = [
  { level: 1 as const, emoji: "😊", label: "아주 쉬웠어요" },
  { level: 2 as const, emoji: "🙂", label: "쉬운 편이었어요" },
  { level: 3 as const, emoji: "😐", label: "적당했어요" },
  { level: 4 as const, emoji: "😤", label: "조금 힘들었어요" },
  { level: 5 as const, emoji: "😰", label: "너무 힘들었어요" },
] as const;
