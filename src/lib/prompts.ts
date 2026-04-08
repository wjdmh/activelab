import type { AssessmentData } from "@/types/assessment";
import type { PostureResult } from "@/types/posture";
import { GOAL_ACTIVITY_OPTIONS, SPECIFIC_GOAL_OPTIONS } from "@/types/assessment";
import { getAcsmPrescriptionConstraints, getSpecialConditionConstraints } from "@/lib/acsm";

/**
 * 자세 분석 결과를 프롬프트 지시문으로 변환
 */
function buildPostureConstraints(postureResult: PostureResult | null | undefined): string {
  if (!postureResult) return "";

  const { metrics, findings, grade } = postureResult;
  const parts: string[] = [];

  parts.push(`
[📸 Vision AI 자세 분석 결과 반영]
- 자세 점수: ${metrics.score}/100점 (${grade === "good" ? "균형 잡힘" : grade === "fair" ? "보통" : "교정 필요"})
- 주요 소견: ${findings.join("; ")}`);

  // 전방 두부
  if (metrics.forwardHead > 0.12) {
    parts.push(`- **전방 두부 자세**: 목·어깨 스트레칭(흉쇄유돌근, 승모근 이완)과 심부 경부 굴근 강화 운동을 매일 포함하세요.`);
  }

  // 어깨 비대칭
  if (metrics.shoulderAsymmetry > 0.03) {
    parts.push(`- **어깨 비대칭**: 좌우 대칭 강화를 위해 단방향 덤벨/밴드 운동(낮은 쪽 먼저)을 포함하세요. 어깨 충돌 유발 동작(오버헤드 프레스 등) 주의.`);
  }

  // 골반 비대칭
  if (metrics.hipAsymmetry > 0.025) {
    parts.push(`- **골반 기울기**: 고관절 외전근(둔근 중부) 강화와 요방형근 스트레칭을 포함하세요. 단관절 밸런스 훈련 우선.`);
  }

  if (grade === "needs_attention") {
    parts.push(`- ⚠️ 전반적으로 자세 교정이 우선입니다. 첫 2주는 자세 교정 운동 비중을 본운동의 30% 이상으로 구성하세요.`);
  }

  return parts.join("\n");
}

const GENDER_MAP: Record<string, string> = {
  male: "남성",
  female: "여성",
};

const AGE_MAP: Record<string, string> = {
  "under-60": "60세 미만",
  "60-64": "60~64세",
  "65-69": "65~69세",
  "70-74": "70~74세",
  "75-plus": "75세 이상",
};

const PAIN_MAP: Record<string, string> = {
  knee: "무릎",
  back: "허리",
  shoulder: "어깨",
  neck: "목",
  hip: "고관절",
  wrist: "손목/손",
  none: "없음",
};

const CONDITION_MAP: Record<string, string> = {
  "medical-restriction": "의사 운동 제한 권고",
  "high-blood-pressure": "고혈압",
  diabetes: "당뇨",
  arthritis: "관절염",
  osteoporosis: "골다공증",
  none: "없음",
};

const SARCF_LABEL_MAP: Record<string, string> = {
  none: "전혀 힘들지 않음",
  some: "조금 힘듦",
  a_lot: "많이 힘듦",
  unable: "할 수 없음",
};

const ENVIRONMENT_MAP: Record<string, string> = {
  home: "집 안",
  park: "공원/야외",
  gym: "헬스장/체육관",
  "senior-center": "경로당/복지관",
};

const MOTIVATION_MAP: Record<string, string> = {
  grandchild: "손주와 놀기",
  travel: "여행 다니기",
  hiking: "등산/산책",
  "daily-life": "편한 일상생활",
  sports: "골프/스포츠",
  social: "모임/사교활동",
  independence: "혼자 거뜬히 살기",
  "pain-free": "통증 없는 생활",
};

const EXERCISE_HISTORY_MAP: Record<string, string> = {
  walking: "걷기/산책",
  hiking: "등산",
  swimming: "수영",
  yoga: "요가/필라테스",
  gym: "헬스/웨이트",
  dance: "댄스/에어로빅",
  golf: "골프",
  tennis: "테니스/배드민턴",
  cycling: "자전거",
  none: "운동 경험 없음",
};

const TIME_MAP: Record<string, string> = {
  "10min": "10분 이내",
  "30min": "30분 이내",
  "60min": "1시간 이내",
};

function calcSarcFScore(data: AssessmentData): number {
  const scoreMap: Record<string, number> = { none: 0, some: 1, a_lot: 2, unable: 2 };
  const fallScoreMap: Record<string, number> = { none: 0, "1-3": 1, "4-plus": 2 };

  return (
    (scoreMap[data.sarcfLift || "none"] || 0) +
    (scoreMap[data.sarcfChair || "none"] || 0) +
    (scoreMap[data.sarcfStair || "none"] || 0) +
    (fallScoreMap[data.sarcfFall || "none"] || 0)
  );
}

export function buildMinimalPrompt(data: AssessmentData): string {
  const goalLabels = (data.goalActivities || [])
    .map((id) => {
      const opt = GOAL_ACTIVITY_OPTIONS.find((o) => o.id === id);
      return opt ? opt.label : id;
    })
    .join(", ");

  const specificGoalLabels = (data.specificGoals || [])
    .map((id) => {
      for (const activity of data.goalActivities || []) {
        const goals = SPECIFIC_GOAL_OPTIONS[activity] || [];
        const found = goals.find((g) => g.id === id);
        if (found) return found.label;
      }
      return id;
    })
    .join(", ");

  const painAreasList = (data.painAreas || [])
    .filter((p) => p !== "custom")
    .map((p) => PAIN_MAP[p] || p);
  if (data.customPainArea) painAreasList.push(data.customPainArea);
  const painAreas = painAreasList.join(", ");

  const conditions = (data.conditions || [])
    .filter((c) => c !== "custom")
    .map((c) => CONDITION_MAP[c] || c);
  if (data.customCondition) conditions.push(data.customCondition);
  const conditionsStr = conditions.join(", ");

  const fitnessInfo = data.flexibilityLevel
    ? `\n- **체력 수준**: 유연성(${data.flexibilityLevel}), 하체근력(${data.lowerStrengthLevel}), 균형(${data.balanceLevel})`
    : "";

  const hasHighBP = data.conditions.includes("high-blood-pressure");
  const hasOsteoporosis = data.conditions.includes("osteoporosis");
  const hasArthritis = data.conditions.includes("arthritis");

  const isNonExerciser = !goalLabels || goalLabels.includes("전신 근력") || goalLabels.includes("통증 관리");
  const targetDesc = isNonExerciser ? "건강한 일상을 위한" : `${goalLabels}을 위한`;

  const acsmConstraints = getAcsmPrescriptionConstraints(data.acsmRiskLevel ?? null);
  const specialConstraints = getSpecialConditionConstraints(data.conditions || []);
  const postureConstraints = buildPostureConstraints(data.postureResult);

  return `너는 ACSM(미국 스포츠의학회) 11판 가이드라인을 따르는 스포츠 재활·롱런 퍼포먼스 전문 피지컬 코치다.
사용자의 목표와 건강 상태를 기반으로, 부상 없이 오래 스포츠를 즐길 수 있도록 안전하고 효과적인 7일 운동 프로그램을 설계한다.

${acsmConstraints}
${specialConstraints}
${postureConstraints}

## [사용자 정보]
- **닉네임**: ${data.nickname}
- **목표 활동**: ${goalLabels || "전신 근력"}
- **구체적 목표**: ${specificGoalLabels || "전반적인 건강 개선"}
- **건강 상태**: ${conditionsStr || "해당 없음"}
- **통증 부위**: ${painAreas || "없음"}${fitnessInfo}${data.freeNote ? `\n- **추가 정보**: ${data.freeNote}` : ""}

## [프로그램 설계 원칙]
1. **준비운동 → 본운동 → 마무리운동** 순서를 반드시 지켜라
   - 준비운동(warmup): 관절 가동성 + 동적 스트레칭 (5~7분)
   - 본운동(main): 근력/유산소/균형 등 목표 운동 (15~25분)
   - 마무리운동(cooldown): 정적 스트레칭 + 호흡 (5분)
2. **목표 연결**: 각 운동의 benefit에 "${targetDesc}" 구체적 이점 작성
3. **점진적 진행**: 첫 주이므로 RPE 4~6 수준. 세트 2~3, 횟수 8~12회
4. **안전 최우선**: 통증 부위(${painAreas || "없음"})에 부하가 가는 동작 제외

## [안전 수칙]
${hasHighBP ? "- **고혈압**: 머리가 심장 아래로 가는 동작, 숨 참기 절대 금지\n" : ""}${hasOsteoporosis ? "- **골다공증**: 척추 굽힘, 회전, 발끝 닿기 절대 금지\n" : ""}${hasArthritis ? "- **관절염**: 충격이 가는 점프, 달리기 절대 금지\n" : ""}${painAreas !== "없음" ? `- **통증 부위(${painAreas})**: 해당 부위에 부하가 가는 동작 제외\n` : ""}

## [UX/톤앤매너]
- 쉬운 비유로 동작 설명 (전문 용어 X)
- 정중하고 따뜻하되, 전문적 코칭 느낌
- 각 운동 benefit에 목표와 연결된 동기 부여 문구

## [출력 (JSON)]
7일치 루틴을 아래 구조로 생성. 유효한 JSON만 출력.

{
  "weeklyPlan": [
    {
      "day": "월요일",
      "dayIndex": 0,
      "theme": "하체 근력 + 균형",
      "exercises": [
        {
          "id": "ex-0-1",
          "name": "어깨·고관절 돌리기",
          "phase": "warmup",
          "type": "유연성",
          "description": "양 어깨를 크게 돌리고 고관절을 부드럽게 풀어주세요.",
          "sets": 1,
          "reps": 10,
          "durationSeconds": 0,
          "restSeconds": 10,
          "safetyNote": "통증 없는 범위에서 하세요.",
          "requiresSupport": false,
          "targetArea": "어깨, 고관절",
          "benefit": "본운동 전 관절을 풀어 부상을 예방해요!"
        },
        {
          "id": "ex-0-2",
          "name": "의자 잡고 스쿼트",
          "phase": "main",
          "type": "근력(Power)",
          "description": "의자를 잡고 천천히 앉았다 빠르게 일어나세요.",
          "sets": 3,
          "reps": 10,
          "durationSeconds": 0,
          "restSeconds": 30,
          "safetyNote": "무릎이 발끝을 넘지 않게 하세요.",
          "requiresSupport": true,
          "targetArea": "허벅지",
          "benefit": "${targetDesc} 튼튼한 하체를 만들어요!"
        },
        {
          "id": "ex-0-3",
          "name": "허벅지 앞 스트레칭",
          "phase": "cooldown",
          "type": "유연성",
          "description": "벽을 잡고 한 발을 뒤로 접어 허벅지 앞쪽을 늘려주세요.",
          "sets": 1,
          "reps": 1,
          "durationSeconds": 30,
          "restSeconds": 0,
          "safetyNote": "무리하지 마세요.",
          "requiresSupport": true,
          "targetArea": "허벅지",
          "benefit": "운동 후 근육 회복을 도와요!"
        }
      ]
    }
  ],
  "restDayAlternative": {
    "name": "편안한 호흡 운동",
    "description": "편한 자세로 앉아서, 코로 4초 들이마시고, 입으로 6초 내쉬세요.",
    "sets": 1,
    "reps": 5
  }
}

각 요일(월~일, dayIndex 0~6)에 4~6개의 운동을 포함하세요.
운동 id는 "ex-{dayIndex}-{순번}" 형식으로 지정하세요.
- **phase**: "warmup" | "main" | "cooldown" 중 하나 (반드시 warmup으로 시작, cooldown으로 끝나야 함)
- **type**: "근력(Power)" | "유산소" | "유연성" | "균형" 중 하나
- **description**: 쉬운 비유 + 동작 설명
- **benefit**: 목표 활동과 연결된 이점
- **safetyNote**: 주의사항
JSON만 출력하고 다른 텍스트는 포함하지 마세요.`;
}

export function buildPrompt(data: AssessmentData): string {
  const painAreasList = data.painAreas
    .filter((p) => p !== "custom")
    .map((p) => PAIN_MAP[p] || p);
  if (data.customPainArea) painAreasList.push(data.customPainArea);
  const painAreas = painAreasList.join(", ");
  const conditionsList = data.conditions
    .filter((c) => c !== "custom")
    .map((c) => CONDITION_MAP[c] || c);
  if (data.customCondition) conditionsList.push(data.customCondition);
  const conditions = conditionsList.join(", ");

  const sarcfScore = calcSarcFScore(data);
  const sarcfRiskLevel =
    sarcfScore >= 4 ? "높음 (근감소증 고위험)" : sarcfScore >= 2 ? "보통 (주의 필요)" : "낮음";

  const hasFallRisk = data.sarcfFall === "1-3" || data.sarcfFall === "4-plus";
  const hasChairDifficulty = data.sarcfChair === "a_lot" || data.sarcfChair === "unable";
  const hasHighBP = data.conditions.includes("high-blood-pressure");
  const hasOsteoporosis = data.conditions.includes("osteoporosis");
  const hasArthritis = data.conditions.includes("arthritis");
  const hasMedicalRestriction = data.conditions.includes("medical-restriction");

  const motivationArr = Array.isArray(data.motivation) ? data.motivation : (data.motivation ? [data.motivation] : []);
  const motivationLabels = motivationArr
    .filter((m) => m !== "custom")
    .map((m) => MOTIVATION_MAP[m] || m);
  if (data.customMotivation) motivationLabels.push(data.customMotivation);
  const motivation = motivationLabels.length > 0 ? motivationLabels.join(", ") : "건강한 생활";

  const exerciseArr = Array.isArray(data.exerciseHistory) ? data.exerciseHistory : (data.exerciseHistory ? [data.exerciseHistory] : []);
  const exerciseLabels = exerciseArr
    .filter((e) => e !== "custom")
    .map((e) => EXERCISE_HISTORY_MAP[e] || e);
  if (data.customExerciseHistory) exerciseLabels.push(data.customExerciseHistory);
  const exerciseHistory = exerciseLabels.length > 0 ? exerciseLabels.join(", ") : "없음";

  const isNonExerciser = exerciseHistory === "없음" || exerciseHistory.includes("운동 경험 없음");
  const targetDesc = isNonExerciser ? "건강한 일상을 위한" : `${motivation}을(를) 위한`;

  const acsmConstraints = getAcsmPrescriptionConstraints(data.acsmRiskLevel ?? null);
  const specialConstraints = getSpecialConditionConstraints(data.conditions || []);
  const postureConstraints = buildPostureConstraints(data.postureResult);

  return `너는 ACSM(미국 스포츠의학회) 11판 가이드라인을 따르는 스포츠 재활·롱런 퍼포먼스 전문 피지컬 코치다.
사용자가 **부상 없이 건강하게 스포츠를 즐기며 롱런 퍼포먼스**를 유지할 수 있도록 돕는다.

${acsmConstraints}
${specialConstraints}
${postureConstraints}

## [핵심 처방 원칙]
1. **준비운동 → 본운동 → 마무리운동** 순서를 반드시 지켜라
   - 준비운동(warmup): 관절 가동성 + 동적 스트레칭 (5~7분)
   - 본운동(main): 근력/유산소/균형 등 목표 운동 (15~25분)
   - 마무리운동(cooldown): 정적 스트레칭 + 호흡 (5분)
2. **근감소증 타파**: 근력 운동 필수 포함. 안전하다면 "일어날 때 빠르게, 앉을 때 천천히" 속도 강조
3. **동기 부여**: 각 운동의 benefit에 "${motivation}"과 연결된 구체적 이점 작성
4. **가용 시간 반영**: ${TIME_MAP[data.availableTime || ""] || "미지정"} 내에서 완료 가능하도록 설계

## [사용자 정보 분석]
- **닉네임**: ${data.nickname}
- **연령**: ${AGE_MAP[data.ageGroup || ""] || "미지정"}
- **성별**: ${GENDER_MAP[data.gender || ""] || "미지정"}
- **건강 상태**: ${conditions || "없음"}
- **근감소 위험도 (SARC-F ${sarcfScore}/8)**: ${sarcfRiskLevel}
    - 물건 들기: ${SARCF_LABEL_MAP[data.sarcfLift || "none"]}
    - 의자 일어나기: ${SARCF_LABEL_MAP[data.sarcfChair || "none"]}
    - 계단 오르기: ${SARCF_LABEL_MAP[data.sarcfStair || "none"]}
    - 낙상 횟수: ${data.sarcfFall === "none" ? "없음" : data.sarcfFall === "1-3" ? "1~3번" : "4번 이상"}
- **통증 부위**: ${painAreas || "없음"}
- **목표**: ${motivation}
- **환경**: ${ENVIRONMENT_MAP[data.environment || ""] || data.customEnvironment || "미지정"}
- **운동 경험**: ${exerciseHistory}
- **가용 시간**: ${TIME_MAP[data.availableTime || ""] || "미지정"}${data.freeNote ? `\n- **추가 정보**: ${data.freeNote}` : ""}

${isNonExerciser ? `## [비운동자 특별 지침]
- 이 사용자는 운동 경험이 없는 분입니다
- "운동 없음을 위한" 같은 어색한 표현 대신 "건강한 일상을 위한" 으로 표현
- 일상생활 동작(ADL) 기반: 걷기, 계단 오르기, 물건 들기 등에 초점
- RPE 3~5 수준의 매우 가벼운 강도로 시작
- 모든 운동에 "의자나 벽을 잡으세요" 안내 포함\n` : ""}
## [절대 안전 수칙 (Red Flags)]
1.  **낙상 고위험군**: ${hasFallRisk || hasChairDifficulty ? "⚠️ 해당 → " : ""}모든 서서 하는 동작에 "반드시 의자나 벽을 잡으세요" 포함
2.  **골다공증**: ${hasOsteoporosis ? "⚠️ 해당 → " : ""}척추 굽힘, 회전, 발끝 닿기 절대 금지
3.  **고혈압**: ${hasHighBP ? "⚠️ 해당 → " : ""}머리가 심장 아래로, 숨 참기 절대 금지
4.  **관절염**: ${hasArthritis ? "⚠️ 해당 → " : ""}점프, 달리기 절대 금지
5.  **관절 통증**: ${painAreas !== "없음" ? "⚠️ " + painAreas + " → " : ""}해당 부위에 부하가 가는 동작 제외
${hasMedicalRestriction ? "6.  **의사 운동 제한 권고**: 매우 보수적으로 처방. 강도 최소, 안전 노트 강화\n" : ""}
## [UX/톤앤매너]
- 쉬운 비유: "대퇴사두근 힘주세요" (X) → "무릎 윗쪽 허벅지를 단단하게 만드세요" (O)
- 정중하되 전문적인 코칭 톤

## [출력 (JSON)]
7일치 루틴을 아래 구조로 생성. 유효한 JSON만 출력.

{
  "weeklyPlan": [
    {
      "day": "월요일",
      "dayIndex": 0,
      "theme": "하체 근력 + 균형",
      "exercises": [
        {
          "id": "ex-0-1",
          "name": "어깨·고관절 돌리기",
          "phase": "warmup",
          "type": "유연성",
          "description": "양 어깨를 크게 돌리고 고관절을 부드럽게 풀어주세요.",
          "sets": 1,
          "reps": 10,
          "durationSeconds": 0,
          "restSeconds": 10,
          "safetyNote": "통증 없는 범위에서 하세요.",
          "requiresSupport": false,
          "targetArea": "어깨, 고관절",
          "benefit": "본운동 전 관절을 풀어 부상을 예방해요!"
        },
        {
          "id": "ex-0-2",
          "name": "식탁 잡고 파워 스쿼트",
          "phase": "main",
          "type": "근력(Power)",
          "description": "식탁을 잡고 천천히 앉았다 빠르게 일어나세요. 허벅지 힘을 느껴보세요!",
          "sets": 3,
          "reps": 10,
          "durationSeconds": 0,
          "restSeconds": 30,
          "safetyNote": "반드시 식탁이나 벽을 잡으세요.",
          "requiresSupport": true,
          "targetArea": "허벅지",
          "benefit": "${targetDesc} 튼튼한 하체를 만들어요!"
        },
        {
          "id": "ex-0-3",
          "name": "허벅지·종아리 스트레칭",
          "phase": "cooldown",
          "type": "유연성",
          "description": "벽을 잡고 한쪽 다리를 뒤로 뻗어 종아리와 허벅지를 늘려주세요.",
          "sets": 1,
          "reps": 1,
          "durationSeconds": 30,
          "restSeconds": 0,
          "safetyNote": "무리하지 마세요.",
          "requiresSupport": true,
          "targetArea": "하체",
          "benefit": "운동 후 근육 회복을 도와요!"
        }
      ]
    }
  ],
  "restDayAlternative": {
    "name": "편안한 호흡 운동",
    "description": "편한 자세로 앉아서, 코로 4초 들이마시고, 입으로 6초 내쉬세요.",
    "sets": 1,
    "reps": 5
  }
}

각 요일(월~일, dayIndex 0~6)에 4~6개의 운동을 포함하세요.
운동 id는 "ex-{dayIndex}-{순번}" 형식으로 지정하세요.
- **phase**: "warmup" | "main" | "cooldown" 중 하나 (반드시 warmup으로 시작, cooldown으로 끝나야 함)
- **type**: "근력(Power)" | "유산소" | "유연성" | "균형" 중 하나
- **description**: 비유를 섞은 쉬운 설명 + 속도(빠르게/천천히) 지침
- **benefit**: Motivation(${motivation})과 연결된 이점
- **safetyNote**: 주의사항
JSON만 출력하고 다른 텍스트는 포함하지 마세요.`;
}
