import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

interface ProactiveRequest {
  nickname: string;
  sportLabel: string;
  sportsAge: number;
  streak: number;
  lastWorkoutDate: string | null;
  painAreas: string[];
}

export async function POST(request: Request) {
  try {
    const body: ProactiveRequest = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    const now = new Date();
    const dayOfWeek = ["일", "월", "화", "수", "목", "금", "토"][now.getDay()];
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;

    const contextHints = [
      isWeekend ? "주말이라 라운딩/경기 계획이 있을 수 있음" : "평일이라 일상 관리에 초점",
      body.streak > 3 ? `${body.streak}일 연속 운동 중 → 격려` : "운동 습관 형성 중 → 동기부여",
      body.painAreas.length > 0 && !body.painAreas.includes("none") ? `통증 부위(${body.painAreas.join(",")}) 관리 체크` : "",
    ].filter(Boolean).join(", ");

    if (!apiKey) {
      const isNonEx = !body.sportLabel || body.sportLabel === "운동 안 함" || body.sportLabel === "none";
      const fallbacks = isNonEx
        ? [
            `${body.nickname}님, 오늘 가벼운 스트레칭으로 하루를 시작해볼까요? 🧘`,
            `${body.nickname}님, 어제 몸 상태는 어떠세요? 간단한 회복 루틴을 알려드릴게요!`,
            `${body.nickname}님, 요즘 걷기나 계단 오르기가 좀 편해지셨나요?`,
          ]
        : [
            `${body.nickname}님, 이번 주말 ${body.sportLabel} 계획 있으신가요? 미리 준비 루틴을 알려드릴게요! 🏌️`,
            `${body.nickname}님, 어제 운동 후 몸 상태는 어떠세요? 회복이 잘 되고 있는지 체크해볼까요?`,
            `${body.nickname}님, 요즘 ${body.sportLabel} 하실 때 예전보다 나아진 점이 느껴지시나요?`,
          ];
      return NextResponse.json({
        question: fallbacks[Math.floor(Math.random() * fallbacks.length)],
      });
    }

    const isNonExerciser = !body.sportLabel || body.sportLabel === "운동 안 함" || body.sportLabel === "none";
    const activityLabel = isNonExerciser ? "일상 활동" : body.sportLabel;

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `너는 ON-U의 스포츠 재활·롱런 퍼포먼스 전문 AI 피지컬 코치다.
사용자: ${body.nickname}, 활동: ${activityLabel}, 스포츠나이: ${body.sportsAge}세, 연속운동: ${body.streak}일
오늘: ${dayOfWeek}요일
상황: ${contextHints}

사용자에게 먼저 건넬 수 있는 선제적 질문 1개를 생성해라.
- 전문적이면서 자연스럽고 따뜻한 톤
- ${isNonExerciser ? "일상 건강 관리와 관련된 실질적 내용" : `${body.sportLabel} 퍼포먼스와 관련된 실질적 내용`}
- 1~2문장, 최대 80자
- 핵심 키워드 **볼드** 처리
- 이모지 1개 포함
- "노인", "어르신" 표현 절대 사용 금지

질문만 출력해라 (JSON 아님, 순수 텍스트).`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { temperature: 0.8, maxOutputTokens: 150 },
    });

    const question = (response.text || "").trim();
    return NextResponse.json({ question: question || `${body.nickname}님, 오늘 컨디션은 어떠세요?` });
  } catch (error) {
    console.error("Proactive question error:", error);
    return NextResponse.json({ question: "오늘 컨디션은 어떠세요? 😊" });
  }
}
