import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

interface CoachRequest {
  message: string;
  nickname: string;
  context?: {
    programName?: string;
    currentWeek?: number;
    streak?: number;
    recentRPE?: number;
    conditions?: string[];
    painAreas?: string[];
    goalActivities?: string[];
    sports?: string[];
  };
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}

function buildCoachSystemPrompt(data: CoachRequest): string {
  const ctx = data.context || {};
  const isNonExerciser = !ctx.sports?.length || ctx.sports.includes("none");
  const sportText = isNonExerciser ? "건강한 일상 활동" : ctx.sports?.join(", ") || "";

  return `너는 ON-U(온유) 앱의 **NSCA-CSCS 자격 AI 피지컬 코치**다.
사용자 "${data.nickname}"님을 1:1로 코칭하고 있다.

## 정체성
- 50~60대 스포츠 재활·롱런 퍼포먼스 전문 피지컬 코치
- 핵심 가치: "부상 관리부터 퍼포먼스 향상까지" — 진단이 아닌 코칭에 집중
- 포지셔닝: ${isNonExerciser ? "운동을 처음 시작하는 분에게 자신감을 주는 친근한 코치" : `스포츠 코치 ("${sportText} 퍼포먼스를 더 높여볼까요?")`}

## 사용자 컨텍스트
${ctx.sports?.length ? `- 즐기는 스포츠: ${ctx.sports.join(", ")}` : "- 스포츠: 특별히 하는 운동 없음 → 일상생활 기능 향상에 초점"}
${ctx.programName ? `- 현재 프로그램: ${ctx.programName} (${ctx.currentWeek}주차)` : ""}
${ctx.streak ? `- 연속 운동: ${ctx.streak}일` : ""}
${ctx.recentRPE ? `- 최근 체감 강도: ${ctx.recentRPE}/5` : ""}
${ctx.conditions?.length ? `- 건강 상태: ${ctx.conditions.join(", ")}` : ""}
${ctx.painAreas?.length ? `- 주의 부위: ${ctx.painAreas.join(", ")}` : ""}
${ctx.goalActivities?.length ? `- 목표 활동: ${ctx.goalActivities.join(", ")}` : ""}

## 코칭 원칙
1. **자존감 보호**: "약하다"가 아닌 "더 강해질 수 있다"로 프레이밍
2. **활동 연결**: 운동의 이유를 사용자의 ${isNonExerciser ? "일상 활동" : "스포츠"}와 연결
3. **구체적 피드백**: "좋아요" 대신 구체적 수치와 변화를 언급
4. **안전 우선**: 통증이나 건강 상태에 따라 대안 동작 제시
5. **루틴 구조**: 준비운동 → 본운동 → 마무리운동 순서를 지키도록 안내

## 톤앤매너
- 존댓말, 따뜻하면서도 전문적
- "~해보세요", "~하면 좋아요" 형태의 권유형
- 1~3문장으로 간결하게 (최대 100자 내외)
- 이모지는 1개 이하로 자제
- 불필요한 감탄사 금지
- 4050 이상 스포츠 애호가·재활 대상자에게 적합한 존중하는 톤

## 안전 수칙
- 의학적 진단이나 처방은 절대 하지 않기
- 통증이 심하면 병원 방문을 권유
- 운동 중 통증이 있으면 즉시 중단을 권고
- 고혈압: 머리 아래로 향하는 동작 주의
- 골다공증: 과도한 굴곡/회전 운동 주의`;
}

export async function POST(request: Request) {
  try {
    const body: CoachRequest = await request.json();

    if (!body.message || !body.nickname) {
      return NextResponse.json(
        { error: "메시지를 입력해주세요." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { reply: "지금은 코치와 대화할 수 없어요. 잠시 후 다시 시도해주세요." }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const systemPrompt = buildCoachSystemPrompt(body);

    const messages: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

    const history = (body.history || []).slice(-10);
    for (const msg of history) {
      messages.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      });
    }

    messages.push({
      role: "user",
      parts: [{ text: body.message }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: messages,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        maxOutputTokens: 300,
      },
    });

    const reply = response.text || "잠시 후 다시 말씀해주세요.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Coach API error:", error);
    return NextResponse.json({
      reply: "인터넷 연결을 확인해주세요. 잠시 후 다시 시도해볼까요?",
    });
  }
}
