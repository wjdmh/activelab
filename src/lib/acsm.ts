/**
 * ACSM 11판 기반 사전 선별 알고리즘 및 처방 제약 유틸리티
 * American College of Sports Medicine Guidelines for Exercise Testing and Prescription, 11th Edition
 */

import type { ActivityLevel, AcsmRiskLevel } from "@/types/assessment";

// ACSM 9대 위험 증상
export const ACSM_SYMPTOMS = [
  { id: "chest-pain", label: "가슴 통증·압박감", description: "휴식 중이나 활동 시 가슴이 아프거나 답답해요", icon: "💗" },
  { id: "syncope", label: "어지러움·실신", description: "갑자기 어지럽거나 쓰러진 적이 있어요", icon: "😵" },
  { id: "dyspnea", label: "심한 호흡 곤란", description: "가벼운 활동에도 숨이 많이 차요", icon: "🫁" },
  { id: "ankle-edema", label: "발목 부종", description: "발목이나 다리가 자주 부어요", icon: "🦵" },
  { id: "palpitation", label: "두근거림·빈맥", description: "심장이 갑자기 빠르게 뛰거나 불규칙하게 뛰어요", icon: "💓" },
  { id: "claudication", label: "다리 저림·통증", description: "걸을 때 다리가 심하게 저리거나 아파요", icon: "🦿" },
] as const;

export type AcsmSymptomId = typeof ACSM_SYMPTOMS[number]["id"];

// CMR 질환 목록 (ACSM Step 2 기준)
export const CMR_CONDITIONS = [
  "high-blood-pressure",
  "heart-disease",
  "vascular-disease",
  "stroke",
  "diabetes",
  "diabetes-type1",
  "renal-disease",
] as const;

/**
 * ACSM 3단계 사전 선별 알고리즘
 * @returns AcsmRiskLevel - 처방 분기 결과
 */
export function classifyAcsmRisk(params: {
  activityLevel: ActivityLevel | null;
  conditions: string[];
  acsmSymptoms: string[];
}): AcsmRiskLevel {
  const { activityLevel, conditions, acsmSymptoms } = params;

  // 공통: 새로운 이상 증상 → 즉시 응급
  if (acsmSymptoms.length > 0) return "emergency";

  const hasCmrCondition = conditions.some((c) =>
    CMR_CONDITIONS.includes(c as typeof CMR_CONDITIONS[number])
  );

  // 비활동자 + 질환 있음 → 처방 보류 (의사 상담 필요)
  if (activityLevel === "inactive" && hasCmrCondition) return "red";

  // 활동자 + 질환 있음 → 제한적 처방 (기존 중강도 허용, 고강도 금지)
  if (activityLevel === "active" && hasCmrCondition) return "yellow";

  // 비활동자 + 질환 없음 → 경도~중강도 정상 처방
  // 활동자 + 질환 없음 → 정상 처방
  return "green";
}

/**
 * ACSM 위험도별 AI 처방 제약 프롬프트 지시문
 */
export function getAcsmPrescriptionConstraints(riskLevel: AcsmRiskLevel | null): string {
  switch (riskLevel) {
    case "emergency":
      return `
[🚨 ACSM 응급 프로토콜 활성화]
- 유저가 현재 이상 증상(가슴통증, 어지러움, 호흡곤란 등)을 호소하고 있습니다.
- 운동 처방을 즉시 중단하고 의학적 평가를 강력 권고하세요.
- 어떠한 운동 루틴도 제공하지 마세요.`;

    case "red":
      return `
[🚫 ACSM 처방 보류]
- 비활동자이며 심혈관/대사/신장(CMR) 질환이 확인되었습니다.
- 의사의 Medical Clearance 전까지 중강도 이상 운동 처방 불가입니다.
- 매우 경도(RPE 3~4 이하, HRR 30% 미만)의 스트레칭·호흡 운동만 제공하세요.
- 루틴 첫 번째 항목에 "의사 상담 권고" 안내를 포함하세요.`;

    case "yellow":
      return `
[⚠️ ACSM 제한적 처방]
- 활동자이지만 CMR 질환이 있습니다. 기존 중강도 운동은 허용되나 고강도 금지입니다.
- 강도 제한: 여유심박수(HRR) 40~59% / RPE 5~6 (중강도) 이하만 처방하세요.
- 고강도(Vigorous) 인터벌, 플라이오메트릭, 최대 근력 운동을 절대 포함하지 마세요.`;

    case "green":
    default:
      return `
[✅ ACSM 정상 처방]
- 경도~중강도(Light-to-Moderate) 훈련을 기준으로 점진적 진행이 가능합니다.
- 초기 4~6주는 강도보다 시간(Duration)을 우선 증가시키세요 (주 150분 목표 도달 후 강도 상향).`;
  }
}

/**
 * ACSM 특수질환별 운동 금지/제한 프롬프트
 */
export function getSpecialConditionConstraints(conditions: string[]): string {
  const parts: string[] = [];

  if (conditions.includes("high-blood-pressure")) {
    parts.push(`
[고혈압 제약]
- 절대 금지: 다운독 등 머리가 심장 아래로 향하는 요가 동작, 플랭크 장시간 유지, 발살바 호흡(숨 참기).
- 세트 간 휴식 시간 충분히 확보하고, 루틴 중간에 어지러움 여부 체크 안내를 포함하세요.`);
  }

  if (conditions.includes("arthritis") || conditions.includes("knee-pain")) {
    parts.push(`
[골관절염/무릎 통증 제약]
- 절대 금지: 점프·플라이오메트릭 등 고충격 동작.
- 스쿼트는 하프 스쿼트(무릎 90도 이상 구부리지 않기) 이하로 제한하세요.
- 누워서 하는 브릿지, 실내 자전거, 수중 운동 위주로 구성하세요.`);
  }

  if (conditions.includes("diabetes")) {
    parts.push(`
[제2형 당뇨 제약]
- 연속 2일 이상 운동 공백이 생기지 않도록 데일리 넛지를 포함하세요.
- 운동 전후 저혈당 경고(간식 섭취 등) 안내를 루틴에 포함하세요.`);
  }

  return parts.join("\n");
}

/**
 * ACSM FITT-VP 기준: 저항운동 처방 볼륨
 */
export const ACSM_RESISTANCE_DEFAULTS = {
  beginner: { setsMin: 1, setsMax: 2, repsMin: 10, repsMax: 15, exercises: 8 },
  intermediate: { setsMin: 2, setsMax: 3, repsMin: 10, repsMax: 15, exercises: 10 },
};

/**
 * ACSM 유연성 유지 시간: 30~60초
 */
export const ACSM_FLEXIBILITY_HOLD_SECONDS = { min: 30, max: 60 };
