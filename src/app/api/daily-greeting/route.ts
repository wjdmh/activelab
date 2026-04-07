import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

interface GreetingRequest {
  nickname: string;
  todayTheme: string;
  streak: number;
  weeklyCompleted: number;
  weeklyTotal: number;
  lastRPE?: number;
  lastTheme?: string;
  programName?: string;
  currentWeek?: number;
}

export async function POST(request: Request) {
  try {
    const body: GreetingRequest = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ greeting: getFallbackGreeting(body) });
    }

    const ai = new GoogleGenAI({ apiKey });

    const hour = new Date().getHours();
    const timeOfDay = hour < 6 ? "새벽" : hour < 12 ? "아침" : hour < 18 ? "오후" : "저녁";

    const prompt = `너는 ON-U(온유) 앱의 스포츠 재활·롱런 퍼포먼스 전문 AI 피지컬 코치다.
사용자가 앱을 열었을 때 보여줄 맞춤 인사말을 작성해라.
전문적이면서도 따뜻한 톤으로, 스포츠 코칭 관점에서 인사한다.

## 사용자 정보
- 닉네임: ${body.nickname}
- 현재 시간대: ${timeOfDay}
- 오늘 운동 테마: ${body.todayTheme}
${body.lastTheme ? `- 어제 운동 테마: ${body.lastTheme}` : ""}
${body.lastRPE ? `- 어제 체감 강도: ${body.lastRPE}/5` : ""}
- 연속 운동일: ${body.streak}일
- 이번 주 진행: ${body.weeklyCompleted}/${body.weeklyTotal}일
${body.programName ? `- 프로그램: ${body.programName} ${body.currentWeek}주차` : ""}

## 규칙
- 1~2문장, 최대 60자
- 존댓말, 전문적이면서 따뜻한 톤
- 시간대에 맞는 인사
- 어제 운동을 했다면 회복/컨디션 관련 언급
- 어제 RPE가 높았으면(4~5) "오늘은 가볍게 리커버리" 방향 제시
- 이번 주 진행 상황에 따른 전문 코칭 멘트
- 이모지 사용하지 않기
- "${body.nickname}님," 으로 시작하지 않기 (호출하는 쪽에서 붙임)
- "노인", "어르신" 같은 표현 절대 사용 금지`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        temperature: 0.8,
        maxOutputTokens: 80,
      },
    });

    const greeting = response.text || getFallbackGreeting(body);

    return NextResponse.json({ greeting });
  } catch (error) {
    console.error("Daily greeting error:", error);
    return NextResponse.json({
      greeting: getFallbackGreeting({ nickname: "", todayTheme: "", streak: 0, weeklyCompleted: 0, weeklyTotal: 7 }),
    });
  }
}

function getFallbackGreeting(body: GreetingRequest): string {
  const hour = new Date().getHours();

  if (body.lastRPE && body.lastRPE >= 4) {
    return "어제 운동이 힘들었을 텐데, 오늘은 가볍게 해봐요.";
  }

  if (body.streak >= 5) {
    return `${body.streak}일째 이어가고 있어요! 오늘도 함께해요.`;
  }

  if (body.weeklyCompleted >= body.weeklyTotal - 1) {
    return "이번 주 마지막 운동이에요! 끝까지 힘내봐요.";
  }

  if (hour < 12) {
    return "오늘도 건강한 하루 시작해볼까요?";
  }

  return "오늘도 운동으로 건강을 챙겨봐요.";
}
