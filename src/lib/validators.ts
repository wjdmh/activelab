import type { AssessmentData } from "@/types/assessment";

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateMinimalAssessment(data: AssessmentData): ValidationResult {
  const errors: string[] = [];

  if (!data.nickname || data.nickname.trim().length < 2) {
    errors.push("닉네임을 2글자 이상 입력해주세요.");
  }
  if (!data.goalActivities || data.goalActivities.length === 0) {
    errors.push("목표 활동을 1개 이상 선택해주세요.");
  }
  if (!data.conditions || data.conditions.length === 0) {
    errors.push("건강 상태를 선택해주세요.");
  }
  if (!data.painAreas || data.painAreas.length === 0) {
    errors.push("통증 부위를 선택해주세요.");
  }

  return { valid: errors.length === 0, errors };
}

export function validateAssessmentData(data: AssessmentData): ValidationResult {
  const errors: string[] = [];
  const track = data.track;

  // === 1. 공통 필수 (항상 검증) ===
  if (!data.nickname || data.nickname.trim().length < 2) {
    errors.push("닉네임을 2글자 이상 입력해주세요.");
  }
  if (!data.gender) {
    errors.push("성별을 선택해주세요.");
  }

  // === 2. birthYear: 있으면 범위 검증 ===
  if (data.birthYear !== null && data.birthYear !== undefined) {
    if (data.birthYear < 1930 || data.birthYear > 2010) {
      errors.push("출생연도는 1930~2010 사이로 입력해주세요.");
    }
  }

  // === 3. Track A (vitality) 전용 검증 ===
  if (track === "vitality") {
    if (!data.sports || data.sports.length === 0) {
      errors.push("관심 스포츠를 1개 이상 선택해주세요.");
    }
    if (!data.performanceConcerns || data.performanceConcerns.length === 0) {
      errors.push("퍼포먼스 고민을 1개 이상 선택해주세요.");
    }
    if (!data.flexibilityLevel) {
      errors.push("상체 유연성 수준을 선택해주세요.");
    }
    if (!data.lowerStrengthLevel) {
      errors.push("하체 근지구력 수준을 선택해주세요.");
    }
    if (!data.balanceLevel) {
      errors.push("평형성 수준을 선택해주세요.");
    }
  }

  // === 4. Track B (wellness) 전용 검증 ===
  if (track === "wellness") {
    if (!data.conditions || data.conditions.length === 0) {
      errors.push("건강 상태를 선택해주세요.");
    }
    if (!data.sarcfLift) {
      errors.push("물건 들기 난이도를 선택해주세요.");
    }
    if (!data.sarcfChair) {
      errors.push("의자 일어나기 난이도를 선택해주세요.");
    }
    if (!data.sarcfStair) {
      errors.push("계단 오르기 난이도를 선택해주세요.");
    }
    if (!data.sarcfFall) {
      errors.push("낙상 횟수를 선택해주세요.");
    }
  }

  // === 5. 공통 (항상 검증) ===
  if (!data.painAreas || data.painAreas.length === 0) {
    errors.push("통증 부위를 선택해주세요.");
  }
  if (!data.exerciseHistory || data.exerciseHistory.length === 0) {
    errors.push("운동 경험을 선택해주세요.");
  }
  if (!data.availableTime) {
    errors.push("가용 시간을 선택해주세요.");
  }

  // === 6. Wellness 트랙 추가 검증 ===
  if (track === "wellness") {
    if (!data.motivation || data.motivation.length === 0) {
      errors.push("하고 싶은 활동을 선택해주세요.");
    }
    if (!data.environment) {
      errors.push("운동 환경을 선택해주세요.");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
