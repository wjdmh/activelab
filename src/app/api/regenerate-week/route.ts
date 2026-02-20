import { GoogleGenAI } from "@google/genai";
import { getFallbackPlan } from "@/lib/fallbackPlan";
import { NextResponse } from "next/server";

interface RegenerateRequest {
  programName: string;
  programGoal: string;
  currentWeek: number;
  phaseName: string;
  phaseDescription: string;
  completedDays: number;
  averageRPE: number;
  conditions: string[];
  painAreas: string[];
  nickname: string;
}

function buildAdaptivePrompt(data: RegenerateRequest): string {
  const rpeLabel =
    data.averageRPE <= 2
      ? "쉬웠음"
      : data.averageRPE <= 3
      ? "적절했음"
      : data.averageRPE <= 4
      ? "조금 힘들었음"
      : "많이 힘들었음";

  const completionRate = Math.round((data.completedDays / 7) * 100);

  let adaptationNote = "";
  if (data.averageRPE <= 2 && completionRate >= 80) {
    adaptationNote = "지난 주가 쉬웠고 완료율이 높으므로, 세트 수를 1개 늘리거나 난이도를 약간 올려주세요.";
  } else if (data.averageRPE >= 4 || completionRate < 50) {
    adaptationNote = "지난 주가 힘들었거나 완료율이 낮으므로, 세트 수를 줄이고 난이도를 낮춰주세요.";
  } else {
    adaptationNote = "지난 주와 비슷한 난이도를 유지하되, 약간의 변형을 주세요.";
  }

  const conditions = data.conditions.filter(c => c !== "none").join(", ") || "없음";
  const painAreas = data.painAreas.filter(p => p !== "none").join(", ") || "없음";

  return `당신은 맞춤 운동 프로그램 전문가입니다.
사용자의 지난 주 운동 결과를 반영하여, 다음 주 프로그램을 생성해주세요.

## [프로그램 정보]
- **프로그램**: ${data.programName}
- **목표**: ${data.programGoal}
- **현재 주차**: ${data.currentWeek}주차
- **현재 단계**: ${data.phaseName} — ${data.phaseDescription}

## [지난 주 결과]
- **완료 일수**: ${data.completedDays}/7일 (${completionRate}%)
- **평균 체감 강도**: ${data.averageRPE} (${rpeLabel})

## [적응 지침]
${adaptationNote}

## [건강 정보]
- **건강 상태**: ${conditions}
- **통증 부위**: ${painAreas}
- 통증 부위에 부하가 가는 동작은 제외하세요.

## [UX/톤앤매너]
1. 쉬운 비유로 동작 설명
2. 따뜻한 어조
3. 각 운동의 benefit에 목표와 연결된 동기 부여 문구

## [출력 (JSON)]
7일치 루틴을 아래 구조로 생성하세요. 유효한 JSON만 출력하세요.

{
  "weeklyPlan": [
    {
      "day": "월요일",
      "dayIndex": 0,
      "theme": "하체 근력 + 균형",
      "exercises": [
        {
          "id": "ex-0-1",
          "name": "의자 잡고 까치발 들기",
          "type": "근력(Power)",
          "description": "의자를 양손으로 잡고 발꿈치를 천천히 들어올린 뒤 내려놓으세요.",
          "sets": 2,
          "reps": 10,
          "durationSeconds": 0,
          "restSeconds": 20,
          "safetyNote": "반드시 의자나 벽을 잡으세요.",
          "requiresSupport": true,
          "targetArea": "종아리",
          "benefit": "목표를 위한 튼튼한 다리를 만들어요!"
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

각 요일(월~일, dayIndex 0~6)에 3~4개의 운동을 포함하세요.
운동 id는 "ex-{dayIndex}-{순번}" 형식으로 지정하세요.
JSON만 출력하고 다른 텍스트는 포함하지 마세요.`;
}

export async function POST(request: Request) {
  try {
    const body: RegenerateRequest = await request.json();

    if (!body.programName || !body.nickname) {
      return NextResponse.json(
        { error: "필수 정보가 누락됐어요." },
        { status: 400 }
      );
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("API key missing");

      const ai = new GoogleGenAI({ apiKey });
      const prompt = buildAdaptivePrompt(body);

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      const text = response.text;
      if (!text) throw new Error("Empty response");

      const plan = JSON.parse(text);
      if (!plan.weeklyPlan || !Array.isArray(plan.weeklyPlan)) {
        throw new Error("Invalid plan structure");
      }

      return NextResponse.json(plan);
    } catch (geminiError) {
      console.error("Gemini API failed for regeneration:", geminiError);
      const fallback = getFallbackPlan({
        conditions: body.conditions || [],
        painAreas: body.painAreas || [],
        track: null,
      } as never);
      return NextResponse.json(fallback);
    }
  } catch (error) {
    console.error("Regenerate error:", error);
    return NextResponse.json(
      { error: "다음 주 프로그램을 만드는 중 문제가 발생했어요." },
      { status: 500 }
    );
  }
}
