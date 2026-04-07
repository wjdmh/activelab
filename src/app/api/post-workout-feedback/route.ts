import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

interface FeedbackRequest {
  nickname: string;
  rpe: number;
  exerciseCount: number;
  theme: string;
  streak: number;
  weeklyCompleted: number;
  weeklyTotal: number;
}

export async function POST(request: Request) {
  try {
    const body: FeedbackRequest = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ feedback: getFallbackFeedback(body) });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `당신은 스포츠 재활·롱런 퍼포먼스 앱 "온유"의 AI 코치입니다.
사용자가 오늘 운동을 완료했습니다. 1~2문장으로 따뜻하게 격려해주세요.

## 오늘 운동 결과
- 닉네임: ${body.nickname}
- 운동 테마: ${body.theme}
- 완료한 운동 수: ${body.exerciseCount}개
- 체감 강도(RPE): ${body.rpe}/5 (1=매우 쉬움, 5=매우 힘듦)
- 연속 운동일: ${body.streak}일
- 이번 주 진행: ${body.weeklyCompleted}/${body.weeklyTotal}일

## 규칙
- 1~2문장, 최대 80자
- 존댓말, 따뜻한 톤
- RPE가 높으면(4~5) 쉬라는 조언 포함
- RPE가 낮으면(1~2) 다음 주 강도 높여볼 수 있다는 긍정 피드백
- 연속일이 3일 이상이면 꾸준함 칭찬
- 이번 주 완주가 가까우면 응원
- 이모지 사용 가능 (1개만)`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        temperature: 0.8,
        maxOutputTokens: 100,
      },
    });

    const feedback = response.text || getFallbackFeedback(body);

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Post-workout feedback error:", error);
    return NextResponse.json({
      feedback: "오늘도 운동 완료! 정말 잘하셨어요.",
    });
  }
}

function getFallbackFeedback(body: FeedbackRequest): string {
  if (body.rpe >= 4) {
    return "오늘 많이 힘드셨죠? 충분히 쉬면서 회복하세요. 쉬는 것도 운동이에요 💪";
  }
  if (body.streak >= 3) {
    return `${body.streak}일 연속 운동! 꾸준함이 대단해요 🔥`;
  }
  if (body.weeklyCompleted >= body.weeklyTotal - 1) {
    return "이번 주 거의 다 완주했어요! 끝까지 힘내볼까요? 🎉";
  }
  return "오늘도 잘하셨어요! 내일도 함께해요 😊";
}
