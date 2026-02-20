"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Old assessment page - redirect to new chat-based flow
export default function AssessmentPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/coach");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-dvh">
      <p className="text-[14px] text-text-caption">새로운 진단 페이지로 이동 중...</p>
    </div>
  );
}
