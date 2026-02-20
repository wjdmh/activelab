import type { AssessmentData } from "@/types/assessment";

/**
 * 스포츠별 운동 이름 접두사를 반환한다.
 * vitality 트랙에서만 사용된다.
 */
function getSportPrefix(sports: string[]): string {
  const primary = sports[0]?.toLowerCase() ?? "";
  if (primary.includes("golf") || primary.includes("골프")) {
    return "스윙 파워를 위한";
  }
  if (primary.includes("hiking") || primary.includes("등산")) {
    return "등산 체력을 위한";
  }
  if (primary.includes("tennis") || primary.includes("테니스")) {
    return "코트 퍼포먼스를 위한";
  }
  return "활력 넘치는";
}

/**
 * vitality 트랙용 운동 이름을 생성한다.
 * 기본 이름 앞에 스포츠별 접두사를 붙인다.
 */
function vitalityName(prefix: string, baseName: string): string {
  return `${prefix} ${baseName}`;
}

export function getFallbackPlan(data: AssessmentData) {
  const track = data.track ?? "wellness"; // 기본값: wellness
  const isVitality = track === "vitality";

  const hasFallRisk = data.sarcfFall === "1-3" || data.sarcfFall === "4-plus";
  const hasChairDifficulty =
    data.sarcfChair === "a_lot" || data.sarcfChair === "unable";
  const needsSupport = isVitality ? false : hasFallRisk || hasChairDifficulty;
  const hasKneePain = data.painAreas.includes("knee");
  const hasBackPain = data.painAreas.includes("back");
  const hasShoulderPain = data.painAreas.includes("shoulder");

  const motivation = data.motivation || "건강한 생활";
  const supportNote = needsSupport
    ? "반드시 의자나 벽을 잡고 하세요. "
    : "";

  // vitality 트랙: 스포츠별 접두사
  const prefix = isVitality ? getSportPrefix(data.sports) : "";

  const baseExercises = {
    chairSquat: {
      id: "fb-sq",
      name: isVitality
        ? vitalityName(prefix, "하체 파워 스쿼트")
        : "의자 잡고 앉았다 일어서기",
      type: "근력(Power)",
      description: isVitality
        ? "양발을 어깨 너비로 벌리고, 일어날 때 폭발적으로! 앉을 때는 천천히 컨트롤하세요."
        : "의자 등받이를 양손으로 잡고, 일어날 때는 빠르게! 앉을 때는 천천히! 살짝 닿을 듯 말 듯하게 해보세요.",
      sets: isVitality ? 3 : 2,
      reps: isVitality ? 12 : 8,
      durationSeconds: 0,
      restSeconds: 30,
      safetyNote: supportNote + "무릎에 통증이 느껴지면 즉시 멈추세요.",
      requiresSupport: !isVitality,
      targetArea: "허벅지",
      benefit: isVitality
        ? `${data.sports[0] ?? "스포츠"} 퍼포먼스를 위한 하체 파워 강화!`
        : `${motivation}을(를) 위해 튼튼한 하체를 만들어요!`,

    },
    wallPush: {
      id: "fb-wp",
      name: isVitality
        ? vitalityName(prefix, "상체 푸시업")
        : "벽 밀기",
      type: "근력(Power)",
      description: isVitality
        ? "벽이나 높은 바에 손을 짚고, 가슴이 닿을 듯 내려갔다가 폭발적으로 밀어내세요."
        : "벽을 마주보고 팔을 뻗어 벽에 손을 짚으세요. 팔을 굽혀 벽 쪽으로 다가갔다가 빠르게 밀어내세요.",
      sets: isVitality ? 3 : 2,
      reps: isVitality ? 12 : 10,
      durationSeconds: 0,
      restSeconds: 20,
      safetyNote: supportNote + "손목이 아프면 멈추세요.",
      requiresSupport: false,
      targetArea: "가슴, 어깨",
      benefit: isVitality
        ? `${data.sports[0] ?? "스포츠"}에 필요한 상체 힘을 길러요!`
        : `${motivation}을(를) 위한 상체 힘을 길러요!`,

    },
    heelRaise: {
      id: "fb-hr",
      name: isVitality
        ? vitalityName(prefix, "카프 레이즈")
        : "까치발 들기 (의자 잡고)",
      type: "근력(Power)",
      description: isVitality
        ? "서서 발꿈치를 최대한 높이 들어올렸다가 천천히 내려놓으세요. 종아리 파워를 키워요!"
        : "의자를 잡고 서서, 발꿈치를 빠르게 들어올렸다가 천천히 내려놓으세요. 종아리가 탄탄해져요!",
      sets: isVitality ? 3 : 2,
      reps: isVitality ? 15 : 12,
      durationSeconds: 0,
      restSeconds: 20,
      safetyNote: supportNote + "균형을 잃지 않도록 주의하세요.",
      requiresSupport: !isVitality,
      targetArea: "종아리",
      benefit: isVitality
        ? `발목 안정성과 추진력을 높여 ${data.sports[0] ?? "활동"} 퍼포먼스를 올려요!`
        : `걸을 때 더 가볍고 안정적으로! ${motivation}에 한 걸음 더 가까워져요!`,
    },
    shoulderRoll: {
      id: "fb-sr",
      name: isVitality
        ? vitalityName(prefix, "어깨 모빌리티")
        : "어깨 돌리기",
      type: "유연성",
      description: isVitality
        ? "양팔을 크게 원을 그리며 돌려주세요. 앞으로 5번, 뒤로 5번. 가동 범위를 최대한 넓게!"
        : "양 어깨를 앞으로 5번, 뒤로 5번 천천히 크게 돌려주세요. 뭉친 어깨가 시원해져요.",
      sets: 2,
      reps: 10,
      durationSeconds: 0,
      restSeconds: 15,
      safetyNote: "통증이 있으면 작은 원으로 돌리세요.",
      requiresSupport: false,
      targetArea: "어깨",
      benefit: isVitality
        ? "어깨 가동범위가 넓어지면 퍼포먼스가 올라가요!"
        : "어깨가 편안해지면 일상이 가벼워져요!",
    },
    neckStretch: {
      id: "fb-ns",
      name: isVitality
        ? vitalityName(prefix, "목 릴리즈 스트레칭")
        : "목 스트레칭",
      type: "유연성",
      description:
        "고개를 왼쪽으로 천천히 기울여 5초 유지, 오른쪽도 같은 방법으로 해주세요.",
      sets: 1,
      reps: 5,
      durationSeconds: 20,
      restSeconds: 10,
      safetyNote: "빠르게 움직이지 마세요.",
      requiresSupport: false,
      targetArea: "목",
      benefit: "뻣뻣한 목이 풀리면 하루가 편안해져요!",
    },
    seatedLegExtension: {
      id: "fb-le",
      name: isVitality
        ? vitalityName(prefix, "레그 익스텐션")
        : "의자에 앉아 다리 펴기",
      type: "근력(Power)",
      description: isVitality
        ? "의자에 앉아 한쪽 다리를 폭발적으로 펴고 3초 유지! 허벅지 앞쪽에 집중하세요."
        : "의자에 앉아 한쪽 다리를 앞으로 빠르게 쭉 펴고 3초 유지했다가 천천히 내리세요.",
      sets: isVitality ? 3 : 2,
      reps: isVitality ? 12 : 10,
      durationSeconds: 0,
      restSeconds: 20,
      safetyNote: "무릎에 통증이 느껴지면 멈추세요.",
      requiresSupport: false,
      targetArea: "허벅지",
      benefit: isVitality
        ? `${data.sports[0] ?? "스포츠"}에 필요한 허벅지 근력을 길러요!`
        : `${motivation}을(를) 위해 허벅지 근력을 길러요!`,
    },
    balanceStand: {
      id: "fb-bs",
      name: isVitality
        ? vitalityName(prefix, "싱글 레그 밸런스")
        : "한 발 서기 (의자 잡고)",
      type: "균형",
      description: isVitality
        ? "한 발로 서서 15초간 균형을 잡아보세요. 눈을 감으면 난이도 UP! 양쪽 번갈아 하세요."
        : "의자를 잡고 한 발로 서서 10초간 균형을 잡아보세요. 양쪽 번갈아 해주세요.",
      sets: isVitality ? 3 : 2,
      reps: isVitality ? 5 : 3,
      durationSeconds: isVitality ? 15 : 10,
      restSeconds: 20,
      safetyNote: supportNote + "넘어지지 않도록 꼭 의자를 잡으세요.",
      requiresSupport: !isVitality,
      targetArea: "균형 감각",
      benefit: isVitality
        ? "균형 감각이 좋아지면 운동 중 부상 위험이 줄어요!"
        : "균형 감각이 좋아지면 넘어질 걱정이 줄어요!",
    },
    marchInPlace: {
      id: "fb-mp",
      name: isVitality
        ? vitalityName(prefix, "하이니 마칭")
        : "제자리 걷기",
      type: "유산소",
      description: isVitality
        ? "제자리에서 무릎을 높이 올리며 빠르게 걸어보세요. 팔도 크게 흔들어주세요!"
        : "그 자리에서 팔을 크게 흔들며 걸어보세요. 무릎을 적당히 올려주세요.",
      sets: 1,
      reps: 1,
      durationSeconds: isVitality ? 240 : 180,
      restSeconds: 30,
      safetyNote: "어지러우면 바로 멈추고 앉으세요.",
      requiresSupport: false,
      targetArea: "전신",
      benefit: isVitality
        ? `심폐 지구력을 높여 ${data.sports[0] ?? "스포츠"} 체력을 키워요!`
        : `심장이 튼튼해지면 ${motivation}도 더 즐길 수 있어요!`,
    },
    breathing: {
      id: "fb-br",
      name: isVitality
        ? vitalityName(prefix, "호흡 리커버리")
        : "깊은 호흡 운동",
      type: "유연성",
      description:
        "편하게 앉아서 코로 4초 들이마시고, 입으로 6초 내쉬세요. 마음이 차분해져요.",
      sets: 1,
      reps: 5,
      durationSeconds: 0,
      restSeconds: 0,
      safetyNote: "편안한 속도로 하세요.",
      requiresSupport: false,
      targetArea: "호흡",
      benefit: isVitality
        ? "운동 후 빠른 회복을 위해 깊은 호흡으로 리커버리하세요!"
        : "깊은 호흡은 스트레스를 줄이고 활력을 높여요!",
    },
    sideStep: {
      id: "fb-ss",
      name: isVitality
        ? vitalityName(prefix, "래터럴 스텝")
        : "옆으로 걷기 (의자 잡고)",
      type: "균형",
      description: isVitality
        ? "옆으로 3~5걸음 빠르게 이동했다가 반대쪽으로 돌아오세요. 민첩성을 길러요!"
        : "의자를 잡고 옆으로 3걸음 이동했다가 반대쪽으로 3걸음 돌아오세요.",
      sets: isVitality ? 3 : 2,
      reps: isVitality ? 8 : 5,
      durationSeconds: 0,
      restSeconds: 20,
      safetyNote: supportNote + "발이 걸리지 않도록 주의하세요.",
      requiresSupport: !isVitality,
      targetArea: "균형 감각",
      benefit: isVitality
        ? "민첩성과 방향 전환 능력을 길러요!"
        : "옆으로 걷는 연습은 일상에서 넘어짐을 막아줘요!",
    },
  };

  const e = baseExercises;

  const lowerBody = hasKneePain
    ? [e.seatedLegExtension, e.heelRaise, e.marchInPlace]
    : [e.chairSquat, e.heelRaise, e.marchInPlace];

  const upperBody = hasShoulderPain
    ? [e.wallPush, e.neckStretch, e.breathing]
    : [e.wallPush, e.shoulderRoll, e.neckStretch];

  const balance = [e.balanceStand, e.sideStep, e.marchInPlace];

  const stretch = hasBackPain
    ? [e.shoulderRoll, e.neckStretch, e.breathing]
    : [e.shoulderRoll, e.neckStretch, e.seatedLegExtension];

  // vitality 트랙: 테마 이름도 스포츠 지향적으로
  const themePrefix = isVitality ? "퍼포먼스 " : "";

  return {
    weeklyPlan: [
      { day: "월요일", dayIndex: 0, theme: `${themePrefix}하체 근력 + 파워`, exercises: withUniqueIds(lowerBody, 0) },
      { day: "화요일", dayIndex: 1, theme: `${themePrefix}상체 근력`, exercises: withUniqueIds(upperBody, 1) },
      { day: "수요일", dayIndex: 2, theme: `${themePrefix}균형 감각`, exercises: withUniqueIds(balance, 2) },
      { day: "목요일", dayIndex: 3, theme: `${themePrefix}스트레칭 + 유연성`, exercises: withUniqueIds(stretch, 3) },
      { day: "금요일", dayIndex: 4, theme: `${themePrefix}하체 근력 + 파워`, exercises: withUniqueIds(lowerBody, 4) },
      { day: "토요일", dayIndex: 5, theme: `${themePrefix}상체 근력`, exercises: withUniqueIds(upperBody, 5) },
      { day: "일요일", dayIndex: 6, theme: "가벼운 활동", exercises: withUniqueIds([e.marchInPlace, e.breathing], 6) },
    ],
    restDayAlternative: {
      name: isVitality ? "액티브 리커버리 호흡" : "편안한 호흡 운동",
      description:
        "편한 자세로 앉아서, 코로 4초 들이마시고, 입으로 6초 내쉬세요.",
      sets: 1,
      reps: 5,
    },
  };
}

function withUniqueIds(
  exercises: Array<Record<string, unknown>>,
  dayIndex: number
) {
  return exercises.map((ex, i) => ({
    ...ex,
    id: `fb-${dayIndex}-${i}`,
  }));
}
