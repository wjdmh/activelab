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
                    } catch (err) {
                        console.warn("[AuthInitializer] Session check failed:", err);
                    }
                };

                await checkSession();

                // Listen for auth changes
                const { data } = supabase.auth.onAuthStateChange((event, _session) => {
                    if (event === 'SIGNED_IN') {
                        checkSession();
                        // 로그인 시 이전 채팅 기록 초기화 (유저별 새 세션)
                        useCoachStore.getState().clearMessages();
                        // 로그인 후 미저장 진단 데이터가 있으면 Supabase에 저장
                        useAssessmentStore.getState().saveToSupabase().catch(() => {});
                        router.refresh();
                    } else if (event === 'SIGNED_OUT') {
                        useUserStore.getState().resetAll();
                        // 진단 데이터는 유지 (비로그인 사용자가 진단 중일 수 있음)
                    }
                });
                subscription = data.subscription;
            } catch (err) {
                console.warn("[AuthInitializer] Init failed:", err);
            }
        };

        init();

        return () => {
            subscription?.unsubscribe();
        };
    }, [syncUser, setAssessmentData, router]);

    return null;
}
