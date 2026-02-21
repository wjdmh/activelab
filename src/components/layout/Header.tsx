"use client";

import { useRouter, usePathname } from "next/navigation";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";

  const pageTitle: Record<string, string> = {
    "/coach": "AI 피지컬 코치",
    "/records": "기록",
    "/programs": "프로그램",
    "/report": "리포트",
    "/daily": "데일리 체크인",
  };

  return (
    <header className="sticky top-0 z-50 bg-bg-primary/90 backdrop-blur-xl border-b border-border-card/30">
      <div className="flex items-center h-[56px] px-5 relative">
        {!isHome ? (
          <button
            onClick={() => router.back()}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-text-primary rounded-xl active:bg-bg-warm transition-colors -ml-2"
            aria-label="뒤로 가기"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 19l-7-7 7-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : (
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2.5"
            aria-label="홈으로 이동"
          >
            <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-primary via-[#4B95F9] to-[#6BABFF] flex items-center justify-center shadow-sm">
              <span className="text-white text-[10px] font-black tracking-tighter leading-none">
                ON
              </span>
            </div>
            <span className="text-[18px] font-bold text-text-primary tracking-tight">
              ON-U
            </span>
          </button>
        )}

        {/* Center title for sub-pages */}
        {!isHome && pageTitle[pathname] && (
          <span className="absolute left-1/2 -translate-x-1/2 text-[16px] font-bold text-text-primary tracking-tight">
            {pageTitle[pathname]}
          </span>
        )}

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          {isHome && (
            <>
              <div className="flex items-center gap-1.5 bg-success/8 px-2.5 py-1 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-[12px] text-success font-semibold">코칭 중</span>
              </div>
              <button
                onClick={() => router.push("/my")}
                className="w-10 h-10 rounded-full bg-bg-warm flex items-center justify-center active:bg-border-card transition-colors"
                aria-label="마이페이지"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="#8B95A1" strokeWidth="1.8" />
                  <path d="M4 21v-1a6 6 0 0112 0v1" stroke="#8B95A1" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
