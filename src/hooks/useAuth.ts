"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Supabase 인증 세션 존재 여부를 반환하는 훅.
 * - `null`: 아직 확인 중 (로딩)
 * - `true`: 로그인됨
 * - `false`: 비로그인
 */
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // 초기 세션 확인
    supabase.auth.getSession().then(({ data }: { data: { session: unknown } }) => {
      setIsAuthenticated(!!data.session);
    }).catch(() => {
      setIsAuthenticated(false);
    });

    // 인증 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: unknown) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return isAuthenticated;
}
