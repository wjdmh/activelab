"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

type ViewMode = "login" | "signup" | "otp";

function LoginContent() {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [otpMessage, setOtpMessage] = useState("");

    const router = useRouter();
    const searchParams = useSearchParams();
    const next = searchParams.get("next") || "/";
    const initialView = searchParams.get("view") === "login" ? "login" : "signup";
    const [view, setView] = useState<ViewMode>(initialView);
    const supabase = createClient();

    // 이미 로그인되어 있으면 next로 리다이렉트
    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) router.replace(next);
        }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSignup = async () => {
        if (!email.trim() || !password.trim()) {
            setError("이메일과 비밀번호를 입력해주세요.");
            return;
        }
        if (password.length < 6) {
            setError("비밀번호는 6자 이상이어야 해요.");
            return;
        }
        setIsLoading(true);
        setError("");
        try {
            const { error: signUpError } = await supabase.auth.signUp({
                email: email.trim(),
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
                },
            });
            if (signUpError) {
                if (signUpError.message.includes("already registered")) {
                    setError("이미 가입된 이메일이에요. 로그인해주세요.");
                    setView("login");
                } else {
                    setError(signUpError.message);
                }
            } else {
                setView("otp");
                setOtpMessage("인증 메일을 보냈어요! 이메일에서 확인 링크를 눌러주세요.");
            }
        } catch {
            setError("회원가입 중 문제가 발생했어요.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            setError("이메일과 비밀번호를 입력해주세요.");
            return;
        }
        setIsLoading(true);
        setError("");
        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            });
            if (signInError) {
                if (signInError.message.includes("Invalid login")) {
                    setError("이메일 또는 비밀번호가 맞지 않아요.");
                } else if (signInError.message.includes("Email not confirmed")) {
                    setError("이메일 인증이 아직 완료되지 않았어요. 메일함을 확인해주세요.");
                } else {
                    setError(signInError.message);
                }
            } else {
                router.replace(next);
            }
        } catch {
            setError("로그인 중 문제가 발생했어요.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (view === "signup") handleSignup();
        else handleLogin();
    };

    const switchView = (newView: ViewMode) => {
        setView(newView);
        setError("");
        setShowPassword(false);
    };

    // OTP 확인 화면
    if (view === "otp") {
        return (
            <div className="flex flex-col items-center justify-center min-h-dvh px-6 bg-bg-primary">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-sm flex flex-col items-center text-center"
                >
                    <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-8">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="#34C759" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h2 className="text-[22px] font-bold text-text-primary mb-2 tracking-tight">이메일을 확인해주세요</h2>
                    <p className="text-[15px] text-text-secondary leading-relaxed mb-1">
                        <span className="font-semibold text-primary">{email}</span>
                    </p>
                    <p className="text-[14px] text-text-caption leading-relaxed mb-10">
                        {otpMessage}
                    </p>
                    <button
                        onClick={() => switchView("login")}
                        className="w-full min-h-[56px] rounded-2xl bg-primary text-white text-[17px] font-bold active:brightness-95 transition-all shadow-button"
                    >
                        로그인하기
                    </button>
                    <button
                        onClick={handleSignup}
                        disabled={isLoading}
                        className="mt-4 text-[14px] text-text-caption font-medium active:text-primary transition-colors min-h-[44px]"
                    >
                        인증 메일 다시 보내기
                    </button>
                </motion.div>
            </div>
        );
    }

    const isSignup = view === "signup";

    return (
        <div className="flex flex-col min-h-dvh bg-bg-primary relative overflow-hidden">
            {/* Background decoration - 회원가입: 밝은 그라데이션, 로그인: 차분한 톤 */}
            {isSignup ? (
                <>
                    <div className="absolute top-[-10%] right-[-20%] w-[60vw] h-[60vw] max-w-[320px] max-h-[320px] bg-primary/[0.05] rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-[10%] left-[-15%] w-[50vw] h-[50vw] max-w-[260px] max-h-[260px] bg-[#6BABFF]/[0.06] rounded-full blur-3xl pointer-events-none" />
                </>
            ) : (
                <>
                    <div className="absolute top-[-10%] right-[-20%] w-[60vw] h-[60vw] max-w-[320px] max-h-[320px] bg-text-primary/[0.02] rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-[10%] left-[-15%] w-[50vw] h-[50vw] max-w-[260px] max-h-[260px] bg-text-caption/[0.03] rounded-full blur-3xl pointer-events-none" />
                </>
            )}

            <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-sm flex flex-col items-center"
                >
                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="mb-6"
                    >
                        <div className="w-[72px] h-[72px] rounded-[22px] bg-gradient-to-br from-primary via-[#4B95F9] to-[#6BABFF] flex items-center justify-center shadow-elevated">
                            <span className="text-white text-[18px] font-black tracking-tighter">ON-U</span>
                        </div>
                    </motion.div>

                    {/* Tab Switcher - 회원가입/로그인 명확하게 구분 */}
                    <div className="w-full bg-bg-warm rounded-2xl p-1 flex mb-6">
                        <button
                            onClick={() => switchView("signup")}
                            className={`flex-1 py-3 rounded-xl text-[15px] font-semibold transition-all ${
                                isSignup
                                    ? "bg-white text-primary shadow-sm"
                                    : "text-text-caption"
                            }`}
                        >
                            회원가입
                        </button>
                        <button
                            onClick={() => switchView("login")}
                            className={`flex-1 py-3 rounded-xl text-[15px] font-semibold transition-all ${
                                !isSignup
                                    ? "bg-white text-text-primary shadow-sm"
                                    : "text-text-caption"
                            }`}
                        >
                            로그인
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={view}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="w-full flex flex-col items-center"
                        >
                            {/* 모드별 다른 헤더 */}
                            <h1 className="text-[22px] font-bold text-text-primary mb-1 text-center tracking-tight">
                                {isSignup ? "ON-U와 함께 시작해요" : "다시 만나서 반가워요!"}
                            </h1>
                            <p className="text-[14px] text-text-caption text-center mb-6">
                                {isSignup
                                    ? "3분 진단으로 맞춤 트레이닝을 받아보세요"
                                    : "기존 계정으로 로그인하세요"}
                            </p>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="w-full space-y-3">
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-caption pointer-events-none">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); setError(""); }}
                                        placeholder="이메일 주소"
                                        autoComplete="email"
                                        className="w-full h-[56px] pl-11 pr-4 rounded-2xl bg-bg-warm border-2 border-transparent text-[15px] text-text-primary placeholder-text-disabled outline-none focus:bg-bg-primary focus:border-primary/30 transition-all"
                                    />
                                </div>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-caption pointer-events-none">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                            <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
                                            <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); setError(""); }}
                                        placeholder={isSignup ? "비밀번호 설정 (6자 이상)" : "비밀번호"}
                                        autoComplete={isSignup ? "new-password" : "current-password"}
                                        className="w-full h-[56px] pl-11 pr-12 rounded-2xl bg-bg-warm border-2 border-transparent text-[15px] text-text-primary placeholder-text-disabled outline-none focus:bg-bg-primary focus:border-primary/30 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-caption active:text-text-secondary transition-colors p-1"
                                        aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                                    >
                                        {showPassword ? (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                                <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                            </svg>
                                        ) : (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                                                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
                                            </svg>
                                        )}
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="flex items-start gap-2 px-1 pt-1">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-danger flex-shrink-0 mt-0.5">
                                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                                    <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                    <circle cx="12" cy="16" r="1" fill="currentColor" />
                                                </svg>
                                                <p className="text-[13px] text-danger font-medium leading-snug">{error}</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="pt-1">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`w-full min-h-[56px] rounded-2xl text-white text-[17px] font-bold active:brightness-95 active:translate-y-[1px] transition-all shadow-button disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center ${
                                            isSignup
                                                ? "bg-gradient-to-r from-primary to-[#4B95F9]"
                                                : "bg-text-primary"
                                        }`}
                                    >
                                        {isLoading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            isSignup ? "무료로 시작하기" : "로그인"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </div>

            <div className="px-6 pb-8 relative z-10">
                <p className="text-[12px] text-text-disabled text-center leading-relaxed">
                    계속하면 ON-U의 <span className="underline underline-offset-2">이용약관</span> 및 <span className="underline underline-offset-2">개인정보처리방침</span>에 동의하게 됩니다.
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-dvh bg-bg-primary">
                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
