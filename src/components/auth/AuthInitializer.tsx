"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/stores/useUserStore";
import { useAssessmentStore } from "@/stores/useAssessmentStore";
import { useCoachStore } from "@/stores/useCoachStore";
import { useRouter } from "next/navigation";

export function AuthInitializer() {
    const router = useRouter();
    const syncUser = useUserStore((s) => s.syncWithSupabase);
    const setAssessmentData = useAssessmentStore((s) => s.setResult);
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        let subscription: { unsubscribe: () => void } | null = null;
        let onlineHandler: (() => void) | null = null;

        const init = async () => {
            try {
                const supabase = createClient();

                // Check session on mount
                const checkSession = async () => {
                    try {
                        const { data: { session }, error } = await supabase.auth.getSession();
                        if (error || !session) return;

                        // 로그인 세션 감지 시 이전 채팅 기록 초기화
                        useCoachStore.getState().clearMessages();
                        await syncUser().catch(() => {});

                        // Fetch latest assessment
                        const { data: assessments } = await supabase
                            .from("assessments")
                            .select("profile, result")
                            .eq("user_id", session.user.id)
                            .order("created_at", { ascending: false })
                            .limit(1);

                        if (assessments && assessments.length > 0) {
                            const latest = assessments[0];
                            setAssessmentData({
                                profile: latest.profile,
                                ...latest.result,
                            });
                        }
                    } catch {
                        // 네트워크 오류 등 — 조용히 무시
                    }
                };

                await checkSession();

                // Listen for auth changes
                const { data } = supabase.auth.onAuthStateChange((event: string, _session: unknown) => {
                    if (event === 'SIGNED_IN') {
                        checkSession();
                        useCoachStore.getState().clearMessages();
                        useAssessmentStore.getState().saveToSupabase().catch(() => {});
                        router.refresh();
                    } else if (event === 'SIGNED_OUT') {
                        useUserStore.getState().resetAll();
                        useAssessmentStore.getState().resetAssessment();
                        useCoachStore.getState().clearMessages();
                        router.replace('/');
                    }
                    // TOKEN_REFRESHED, TOKEN_REFRESH_FAILED 등은 조용히 무시
                });
                subscription = data.subscription;

                // 네트워크 복구 시 세션 재확인 (refresh token 재시도)
                onlineHandler = () => {
                    supabase.auth.getSession().catch(() => {});
                };
                window.addEventListener('online', onlineHandler);
            } catch {
                // Supabase 초기화 실패 — 앱은 계속 동작
            }
        };

        init();

        return () => {
            subscription?.unsubscribe();
            if (onlineHandler) window.removeEventListener('online', onlineHandler);
        };
    }, [syncUser, setAssessmentData, router]);

    return null;
}
