import { GoogleGenAI } from "@google/genai";
import { buildPrompt, buildMinimalPrompt } from "@/lib/prompts";
import { validateAssessmentData, validateMinimalAssessment } from "@/lib/validators";
import { getFallbackPlan } from "@/lib/fallbackPlan";
import { NextResponse } from "next/server";
import type { AssessmentData } from "@/types/assessment";

export async function POST(request: Request) {
  try {
    const body: AssessmentData = await request.json();

    const isMinimal = body.mode === "minimal";
    const validation = isMinimal
      ? validateMinimalAssessment(body)
      : validateAssessmentData(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.errors },
        { status: 400 }
      );
    }

    // Gemini API 호출 시도
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error("GEMINI_API_KEY is not set");
        throw new Error("API key missing");
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = isMinimal ? buildMinimalPrompt(body) : buildPrompt(body);

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      const text = response.text;
      if (!text) {
        console.error("Gemini returned empty text. Response:", JSON.stringify(response));
        throw new Error("Empty response from Gemini");
      }

      const plan = JSON.parse(text);

      if (!plan.weeklyPlan || !Array.isArray(plan.weeklyPlan) || plan.weeklyPlan.length === 0) {
        console.error("Gemini returned invalid plan structure:", JSON.stringify(plan).slice(0, 500));
        throw new Error("Invalid plan structure");
      }

      const safePlan = applySafetyFilters(plan, body);
      return NextResponse.json(safePlan);
    } catch (geminiError) {
      console.error("Gemini API failed, using fallback plan:", geminiError);
      const fallback = getFallbackPlan(body);
      return NextResponse.json(fallback);
    }
  } catch (error) {
    console.error("Request processing error:", error);
    return NextResponse.json(
      {
        error: "요청을 처리하는 중 문제가 발생했어요. 다시 시도해주세요.",
      },
      { status: 500 }
    );
  }
}

function applySafetyFilters(
  plan: Record<string, unknown>,
  assessment: AssessmentData
) {
  if (!plan.weeklyPlan || !Array.isArray(plan.weeklyPlan)) {
    return plan;
  }

  const hasHighBP = assessment.conditions.includes("high-blood-pressure");
  const hasOsteoporosis = assessment.conditions.includes("osteoporosis");
  const hasFallRisk = assessment.sarcfFall === "1-3" || assessment.sarcfFall === "4-plus";
  const hasChairDifficulty = assessment.sarcfChair === "a_lot" || assessment.sarcfChair === "unable";
  const needsSupport = hasFallRisk || hasChairDifficulty;

  const UNSAFE_FOR_BP = ["다운독", "앞으로 굽히기", "물구나무", "거꾸로", "숨 참"];
  const UNSAFE_FOR_OSTEO = ["크런치", "윗몸일으키기", "회전", "발끝 닿기"];

  for (const day of plan.weeklyPlan as Array<Record<string, unknown>>) {
    if (!day.exercises || !Array.isArray(day.exercises)) continue;

    day.exercises = (day.exercises as Array<Record<string, unknown>>).filter(
      (exercise) => {
        const name = String(exercise.name || "");
        const desc = String(exercise.description || "");
        const combined = name + desc;

        if (hasHighBP) {
          for (const unsafe of UNSAFE_FOR_BP) {
            if (combined.includes(unsafe)) return false;
          }
        }

        if (hasOsteoporosis) {
          for (const unsafe of UNSAFE_FOR_OSTEO) {
            if (combined.includes(unsafe)) return false;
          }
        }

        return true;
      }
    );

    if (needsSupport) {
      for (const exercise of day.exercises as Array<
        Record<string, unknown>
      >) {
        exercise.requiresSupport = true;
        if (
          exercise.safetyNote &&
          !String(exercise.safetyNote).includes("잡고")
        ) {
          exercise.safetyNote =
            "반드시 의자나 벽을 잡고 하세요. " + exercise.safetyNote;
        }
      }
    }
  }

  return plan;
}
