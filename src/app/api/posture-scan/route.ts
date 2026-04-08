import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { PostureResult } from "@/types/posture";

/**
 * POST /api/posture-scan
 * 자세 분석 결과를 Supabase posture_scans 테이블에 저장
 *
 * 테이블이 없으면 조용히 실패 (앱 플로우에 영향 없음)
 */
export async function POST(request: Request) {
  try {
    const body: { postureResult: PostureResult } = await request.json();
    const { postureResult } = body;

    if (!postureResult) {
      return NextResponse.json({ error: "postureResult required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 비로그인 사용자 → 저장 스킵 (로컬 스토어에만 보관)
    if (!user) {
      return NextResponse.json({ saved: false, reason: "unauthenticated" });
    }

    const { error } = await supabase.from("posture_scans").insert({
      user_id: user.id,
      score: postureResult.metrics.score,
      grade: postureResult.grade,
      forward_head: postureResult.metrics.forwardHead,
      shoulder_asymmetry: postureResult.metrics.shoulderAsymmetry,
      hip_asymmetry: postureResult.metrics.hipAsymmetry,
      findings: postureResult.findings,
      scanned_at: postureResult.scannedAt,
    });

    if (error) {
      // 테이블 미생성 등 DB 에러 → 클라이언트에 오류 노출 안 함
      console.error("posture_scans insert error:", error.message);
      return NextResponse.json({ saved: false, reason: error.message });
    }

    return NextResponse.json({ saved: true });
  } catch (e) {
    console.error("posture-scan API error:", e);
    return NextResponse.json({ saved: false });
  }
}
