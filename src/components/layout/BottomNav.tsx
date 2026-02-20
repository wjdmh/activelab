"use client";

import { usePathname, useRouter } from "next/navigation";
import { useUserStore } from "@/stores/useUserStore";
import { useAssessmentStore } from "@/stores/useAssessmentStore";
import { useHydration } from "@/hooks/useHydration";

const NAV_ITEMS = [
  {
    path: "/",
    label: "홈",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"
          stroke="currentColor"
          strokeWidth={active ? "2" : "1.8"}
          fill={active ? "currentColor" : "none"}
          fillOpacity={active ? 0.12 : 0}
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    path: "/coach",
    label: "코치",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"
          stroke="currentColor"
          strokeWidth={active ? "2" : "1.8"}
          strokeLinejoin="round"
          fill={active ? "currentColor" : "none"}
          fillOpacity={active ? 0.12 : 0}
        />
      </svg>
    ),
    hasNotification: true,
  },
  {
    path: "/report",
    label: "리포트",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M4 20V7a2 2 0 012-2h12a2 2 0 012 2v13l-8-3.5L4 20z" stroke="currentColor" strokeWidth={active ? "2" : "1.8"} fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.12 : 0} strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    path: "/my",
    label: "마이",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth={active ? "2" : "1.8"} fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.12 : 0} />
        <path d="M4 21v-1a6 6 0 0112 0v1" stroke="currentColor" strokeWidth={active ? "2" : "1.8"} strokeLinecap="round" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useHydration();
  const hasCompleted = useUserStore((s) => s.hasCompletedAssessment);
  const assessmentResult = useAssessmentStore((s) => s.result);
  const proactiveQ = useAssessmentStore((s) => s.proactiveQuestion);

  if (!hydrated) return null;
  if (pathname?.startsWith("/assessment")) return null;
  if (pathname?.startsWith("/player")) return null;
  if (!hasCompleted && !assessmentResult) return null;

  const hasUnreadQuestion = proactiveQ && !proactiveQ.read;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-bg-primary/95 backdrop-blur-xl border-t border-border-card/30 safe-area-bottom">
      <div className="mx-auto max-w-lg flex items-center justify-around h-[64px]">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          const showDot = item.hasNotification && hasUnreadQuestion;
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className="relative flex flex-col items-center justify-center gap-1 min-w-[72px] min-h-[48px] transition-all"
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <span className={`relative transition-colors ${isActive ? "text-primary" : "text-text-caption"}`}>
                {item.icon(isActive)}
                {showDot && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-danger rounded-full border-[1.5px] border-bg-primary" />
                )}
              </span>
              <span className={`text-[10px] font-semibold transition-colors ${isActive ? "text-primary" : "text-text-caption"}`}>
                {item.label}
              </span>
              {/* Active indicator pill */}
              {isActive && (
                <span className="absolute -bottom-0.5 w-4 h-[3px] rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
