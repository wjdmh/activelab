import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

interface UserProfile {
  nickname: string;
  age: number | null;
  height: number | null;
  weight: number | null;
  sport: string;
  sportLabel: string;
  experience: string;
  goal: string;
  painAreas: string[];
  fitnessTest: {
    flexibility: number | null;
    balance: number | null;
    power: number | null;
    agility: number | null;
  };
  fitnessTestCompleted: boolean;
}

interface RequestBody {
  type: "generate_question" | "generate_result";
  step?: number;
  profile: UserProfile;
  history: Array<{ role: "user" | "assistant"; content: string }>;
}

const EXPERIENCE_MAP: Record<string, string> = {
  beginner: "1년 미만 (입문)",
  intermediate: "1~3년",
  advanced: "3~5년 (숙련)",
  veteran: "5년 이상 (베테랑)",
};

const GOAL_MAP: Record<string, string> = {
  performance: "기록/비거리 향상",
  pain_free: "통증 없는 운동",
  stamina: "체력 증진",
  prevention: "부상 예방",
};

const PAIN_KR: Record<string, string> = {
  none: "없음", back: "허리", knee: "무릎", shoulder: "어깨", elbow: "팔꿈치", ankle: "발목",
};

function profileToText(p: UserProfile): string {
  const pains = p.painAreas.includes("none") || p.painAreas.includes("없음")
    ? "통증 없음"
    : p.painAreas.map((a) => PAIN_KR[a] || a).join(", ");
  const bodyInfo = [
    p.age ? `나이: ${p.age}세` : null,
    p.height ? `키: ${p.height}cm` : null,
    p.weight ? `몸무게: ${p.weight}kg` : null,
  ].filter(Boolean).join(", ");

  let fitnessInfo = "";
  if (p.fitnessTestCompleted && p.fitnessTest) {
    const tests = [];
    if (p.fitnessTest.flexibility !== null) tests.push(`유연성: ${p.fitnessTest.flexibility}점`);
    if (p.fitnessTest.balance !== null) tests.push(`밸런스: ${p.fitnessTest.balance}점`);
    if (p.fitnessTest.power !== null) tests.push(`하체근력: ${p.fitnessTest.power}점`);
    if (p.fitnessTest.agility !== null) tests.push(`민첩성: ${p.fitnessTest.agility}점`);
    if (tests.length > 0) fitnessInfo = `\n운동수행능력 테스트 결과: ${tests.join(", ")}`;
  }

  return `닉네임: ${p.nickname}, ${bodyInfo}, 스포츠: ${p.sportLabel}, 구력: ${EXPERIENCE_MAP[p.experience] || p.experience}, 목표: ${GOAL_MAP[p.goal] || p.goal}, 통증부위: ${pains}${fitnessInfo}`;
}

// ===== Phase 2: AI 심층 질문 생성 =====
async function generateQuestion(body: RequestBody) {
  const apiKey = process.env.GEMINI_API_KEY;
  const profile = body.profile;
  const step = body.step || 8;
  const profileText = profileToText(profile);

  const questionNumber = step - 7; // Q8=1번째 심층질문, Q12=5번째
  const historyText = body.history
    .slice(-8)
    .map((m) => `${m.role === "user" ? "사용자" : "코치"}: ${m.content}`)
    .join("\n");

  const isNonExerciserForQ = profile.sport === "none" || profile.sportLabel === "운동 안 함" || !profile.sport;
  const activityForQ = isNonExerciserForQ ? "일상 활동" : profile.sportLabel;

  const questionTopics: Record<number, string> = {
    1: isNonExerciserForQ
      ? "일상 활동량 (걷기, 계단, 가사노동 등 하루 활동 시간)"
      : "운동 빈도와 강도 (주당 운동 횟수, 1회 운동 시간, 자각 강도)",
    2: isNonExerciserForQ
      ? "일상 동작 시 기능적 제한사항 (계단 오르기, 물건 들기, 오래 서기 등)"
      : `${activityForQ} 수행 시 기능적 제한사항 (ROM, 힘 부족, 균형 불안정 등)`,
    3: "일상생활 기능 평가 (계단 오르기, 물건 들기, 장시간 보행 등의 어려움)",
    4: "회복 패턴 (활동 후 회복 시간, 수면의 질, 근육통 지속 기간)",
    5: "과거 부상 이력 및 현재 만성 질환 (고혈압, 당뇨, 관절염 등)",
  };

  const systemPrompt = `너는 NSCA-CSCS(미국 근력컨디셔닝 전문가) 자격의 스포츠 재활·롱런 퍼포먼스 전문 피지컬 코치다.
FMS(Functional Movement Screen), ACSM 가이드라인, 국민체력100 기준을 활용하여 체계적 진단을 수행한다.

유저 정보: ${profileText}

지금까지의 대화:
${historyText}

위 정보를 바탕으로, 이 사용자의 체력을 정밀하게 평가하기 위한 심층 질문 1개를 생성해라.
이것은 총 5개 심층 질문 중 ${questionNumber}번째이다.

주제 초점: ${questionTopics[questionNumber] || "종합적 체력 상태"}

규칙:
- ${isNonExerciserForQ ? "일상생활 기능에 초점을 맞춘" : `${activityForQ}에 특화된`} 기능적 체력 요소를 파악하는 질문이어야 한다
- 이전 대화에서 이미 물어본 내용은 절대 반복하지 마라
- 4050 이상 스포츠 애호가·재활 대상자에게 적합한 톤 (존중하되 전문적)
- 1~2문장, 최대 100자
- 핵심 키워드는 **볼드** 처리
- 반드시 한국어로만 답해라. 영어 사용 금지 (신체 부위, 운동 용어 모두 한국어로)
- "운동 안 함" 사용자에게는 일상생활 동작 기반으로 질문해라 (계단, 걷기, 앉았다 일어나기 등)

반드시 아래 JSON 형식으로만 답해라 (코드블록 없이):
{"question": "질문 내용", "chips": ["선택지A", "선택지B", "선택지C"]}

chips는 3~4개, 사용자가 쉽게 답할 수 있는 자연스러운 선택지로 만들어라.`;

  const isNonExerciser = profile.sport === "none" || profile.sportLabel === "운동 안 함" || !profile.sport;
  const activityLabel = isNonExerciser ? "일상 활동" : profile.sportLabel;

  const fallbacks: Record<number, { question: string; chips: string[] }> = {
    8: isNonExerciser
      ? {
          question: "평소에 **계단 오르기나 오래 걷기**가 힘드시진 않으세요?",
          chips: ["잘 해요", "약간 힘들어요", "꽤 힘들어요"],
        }
      : {
          question: `${activityLabel} 할 때 **가장 힘든 동작**이 있으신가요?`,
          chips: ["스윙/회전 동작", "오래 서 있기", "빠른 움직임"],
        },
    9: {
      question: "평소에 별도로 **근력운동이나 스트레칭**을 하시나요?",
      chips: ["매일 함", "가끔 생각나면", "전혀 안 함"],
    },
    10: {
      question: "일주일에 **몇 번 정도** 움직이시나요?",
      chips: ["주 1~2회", "주 3~4회", "거의 매일"],
    },
    11: isNonExerciser
      ? {
          question: "활동적으로 움직인 **다음날 몸 상태**는 보통 어떤 편인가요?",
          chips: ["거뜬함", "약간 피로", "꽤 힘듦", "통증 있음"],
        }
      : {
          question: `${activityLabel} 후 **다음날 몸 상태**는 보통 어떤 편인가요?`,
          chips: ["거뜬함", "약간 피로", "꽤 힘듦", "통증 있음"],
        },
    12: {
      question: "**수면**은 충분히 취하시는 편인가요?",
      chips: ["잘 자는 편", "가끔 뒤척임", "수면 부족"],
    },
  };

  if (!apiKey) {
    const fb = fallbacks[step] || fallbacks[8];
    return NextResponse.json(fb);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
      config: { temperature: 0.7, maxOutputTokens: 300 },
    });

    const text = response.text || "";
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return NextResponse.json({
      question: parsed.question || "한 가지 더 여쭤볼게요.",
      chips: Array.isArray(parsed.chips) ? parsed.chips : [],
    });
  } catch {
    const fb = fallbacks[step] || fallbacks[8];
    return NextResponse.json(fb);
  }
}

// ===== 결과 생성 =====
async function generateResult(body: RequestBody) {
  const apiKey = process.env.GEMINI_API_KEY;
  const profile = body.profile;
  const profileText = profileToText(profile);

  const historyText = body.history
    .map((m) => `${m.role === "user" ? "사용자" : "코치"}: ${m.content}`)
    .join("\n");

  const fitnessTestSection = profile.fitnessTestCompleted
    ? `\n\n운동수행능력 테스트 결과가 있으므로, 이 데이터를 적극 반영하여 radarData 점수를 산정해주세요:
- 유연성 테스트: ${profile.fitnessTest.flexibility ?? "미측정"}점
- 밸런스 테스트: ${profile.fitnessTest.balance ?? "미측정"}점
- 하체근력 테스트: ${profile.fitnessTest.power ?? "미측정"}점
- 민첩성 테스트: ${profile.fitnessTest.agility ?? "미측정"}점`
    : "";

  const peerAgeNote = profile.age
    ? `peerAverage는 ${profile.age}세 동일 나이대의 평균 체력 점수를 추정해서 넣어주세요 (40~70 사이).`
    : "peerAverage는 60세 기준 평균으로 55를 넣어주세요.";

  const isNonExerciser = profile.sport === "none" || profile.sportLabel === "운동 안 함" || !profile.sport;
  const targetActivity = isNonExerciser ? "일상생활 활동" : profile.sportLabel;

  const resultPrompt = `너는 NSCA-CSCS, ACSM-CEP 자격 보유 스포츠 재활·롱런 퍼포먼스 전문 피지컬 코치다.
아래 사용자의 체력 진단 대화를 분석하여, 과학적 근거 기반(Evidence-Based) 결과를 생성하라.

[평가 프레임워크]
1. 근력(Strength): ACSM 기준 상하지 근력 + 악력 추정 (의자 앉기/계단 오르기 능력 반영)
2. 심폐지구력(Endurance): 일상 활동 지구력, 운동 지속 시간, 회복 속도 기반 VO2max 추정
3. 유연성(Flexibility): Sit-and-Reach 추정, 관절 가동 범위, ${targetActivity} 동작 수행 범위
4. 밸런스(Balance): 한 발 서기 능력, 낙상 위험도(SPPB 기준), 동적 안정성
5. 순발력(Power): 빠른 방향 전환, 반응 속도, ${targetActivity} 순간 동작 능력
6. 회복력(Recovery): 운동 후 회복 시간, 수면의 질, 일상 피로도, 근육통 지속 기간

유저 프로필: ${profileText}
${fitnessTestSection}

대화 기록:
${historyText}

[sportsAge 산정 규칙 (국민체력100 + ACSM 기준)]
- radarData 6개 항목의 가중 평균 계산 (근력 20%, 지구력 20%, 유연성 15%, 밸런스 20%, 순발력 10%, 회복력 15%)
- 가중 평균 75+ → sportsAge = 실제 나이 - 10~15세
- 가중 평균 60~74 → sportsAge = 실제 나이 - 3~9세
- 가중 평균 45~59 → sportsAge = 실제 나이 ± 2세
- 가중 평균 45 미만 → sportsAge = 실제 나이 + 3~10세
- 운동수행능력 테스트 결과가 있으면 해당 항목에 직접 반영

${isNonExerciser ? `[비운동자 특별 지침]
- 이 사용자는 특정 스포츠를 하지 않는 분입니다
- 일상생활 기능(ADL: Activities of Daily Living) 중심으로 평가
- 추천 운동은 일상 기능 향상에 초점 (걷기, 계단, 물건 들기 등)
- "운동 없음을 위한" 같은 어색한 표현 대신, "건강한 일상을 위한" 으로 표현` : ""}

다음 JSON 형식으로만 답해주세요 (코드블록 없이):
{
  "sportsAge": (35~80 사이 정수, 위 규칙에 따라 일관되게),
  "peerAverage": (동일 나이대 한국인 평균 체력 점수, 국민체력100 기준 40~65 사이),
  "radarData": [
    {"label": "근력", "value": (20~100)},
    {"label": "지구력", "value": (20~100)},
    {"label": "유연성", "value": (20~100)},
    {"label": "밸런스", "value": (20~100)},
    {"label": "순발력", "value": (20~100)},
    {"label": "회복력", "value": (20~100)}
  ],
  "aiComment": "(5~7문장. 구조: ①총평 1문장 ②강점 2가지(구체적 수치/행동 근거) ③개선 필요 2가지(위험도 포함) ④맞춤 코칭 방향 1~2문장. ${targetActivity}에 맞는 전문적 분석. 핵심 키워드 **볼드**. 격려하되 구체적으로.)",
  "recommendations": [
    {"id": "ex1", "name": "운동이름", "description": "정확한 수행 방법 2~3문장", "targetArea": "대근육군", "sets": 3, "reps": 10, "benefit": "${targetActivity}에 도움되는 구체적 이유"}
  ]
}

recommendations 규칙:
- 총 4개, 준비운동 1개 + 본운동 2개 + 마무리운동 1개 순서로 구성
- ${isNonExerciser ? "일상생활 기능 향상" : profile.sportLabel + " 퍼포먼스 향상"}에 직접 연결되는 운동
- 통증 부위(${profile.painAreas.join(", ")})가 있으면 해당 부위에 부담을 주지 않는 대체 운동 사용
- ${profile.age ? `${profile.age}세` : "50~60대"} 액티브 시니어에게 안전한 강도 (RPE 4~6 수준)
- description은 자세, 호흡, 주의사항을 포함한 구체적 수행 가이드
${peerAgeNote}`;

  const chronAge = profile.age || 60;
  const fallbackResult = {
    sportsAge: Math.max(40, chronAge - 5),
    peerAverage: Math.round(chronAge * 0.85 + 5),
    radarData: [
      { label: "근력", value: profile.fitnessTest.power || 55 },
      { label: "지구력", value: 50 },
      { label: "유연성", value: profile.fitnessTest.flexibility || 45 },
      { label: "밸런스", value: profile.fitnessTest.balance || 52 },
      { label: "순발력", value: profile.fitnessTest.agility || 48 },
      { label: "회복력", value: 53 },
    ],
    aiComment: isNonExerciser
      ? "전반적인 기초 체력이 양호한 편이에요. **유연성과 하체 근력**을 강화하면 일상생활이 훨씬 편해질 수 있어요."
      : `${profile.sportLabel}을 즐기시는 분답게 전반적인 체력이 양호한 편이에요. **유연성과 코어 안정성**을 강화하면 더 좋은 퍼포먼스를 기대할 수 있어요.`,
    recommendations: [
      { id: "ex1", name: "의자 스쿼트", description: "의자 앞에 서서 천천히 앉았다 일어나는 운동", targetArea: "하체", sets: 3, reps: 10, benefit: isNonExerciser ? "일상에서 필요한 하체 근력을 키워요" : `${profile.sportLabel}에 필요한 하체 근력을 키워요` },
      { id: "ex2", name: "한 발 서기", description: "한 발로 서서 10초간 균형 잡기", targetArea: "밸런스", sets: 3, reps: 15, benefit: isNonExerciser ? "걸을 때 안정감을 높여줘요" : `${profile.sportLabel} 시 안정감을 높여줘요` },
      { id: "ex3", name: "어깨 스트레칭", description: "양팔을 번갈아 머리 위로 올리는 스트레칭", targetArea: "상체", sets: 2, reps: 10, benefit: "상체 유연성을 개선해요" },
      { id: "ex4", name: "코어 호흡 운동", description: "복부에 힘을 주면서 깊게 호흡하는 운동", targetArea: "코어", sets: 3, reps: 8, benefit: "코어 안정성과 회복력을 높여요" },
    ],
  };

  if (!apiKey) {
    return NextResponse.json(fallbackResult);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: resultPrompt }] }],
      config: { temperature: 0.4, maxOutputTokens: 1500 },
    });

    const text = response.text || "";
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    // radarData 평균 계산
    const radarAvg = Array.isArray(parsed.radarData) && parsed.radarData.length > 0
      ? Math.round(parsed.radarData.reduce((a: number, b: { value: number }) => a + b.value, 0) / parsed.radarData.length)
      : 50;

    // sportsAge를 radarData 평균과 일관되게 조정
    let adjustedSportsAge = parsed.sportsAge || fallbackResult.sportsAge;
    if (radarAvg >= 70 && adjustedSportsAge > chronAge) {
      // 점수 높은데 sportsAge가 실제보다 높으면 보정
      adjustedSportsAge = Math.max(40, chronAge - Math.round((radarAvg - 50) / 5));
    } else if (radarAvg < 50 && adjustedSportsAge < chronAge) {
      // 점수 낮은데 sportsAge가 실제보다 낮으면 보정
      adjustedSportsAge = Math.min(75, chronAge + Math.round((50 - radarAvg) / 5));
    }
    const clampedSportsAge = Math.max(40, Math.min(75, adjustedSportsAge));

    return NextResponse.json({
      ...parsed,
      sportsAge: clampedSportsAge,
      peerAverage: Math.max(40, Math.min(70, parsed.peerAverage || fallbackResult.peerAverage)),
    });
  } catch {
    return NextResponse.json(fallbackResult);
  }
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();

    if (body.type === "generate_question") {
      return generateQuestion(body);
    }

    if (body.type === "generate_result") {
      return generateResult(body);
    }

    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  } catch (error) {
    console.error("Assessment chat error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
