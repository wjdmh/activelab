"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useUserStore } from "@/stores/useUserStore";
import { useAssessmentStore } from "@/stores/useAssessmentStore";
import { useWorkoutStore } from "@/stores/useWorkoutStore";
import { useCoachStore } from "@/stores/useCoachStore";
import { useHydration } from "@/hooks/useHydration";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/layout/BottomNav";
import { useToast } from "@/components/ui/Toast";

interface AuthUser {
  email: string | undefined;
  created_at: string;
}

// ===== Menu Item Component =====
function MenuItem({
  icon,
  label,
  value,
  onClick,
  danger,
  chevron = true,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onClick?: () => void;
  danger?: boolean;
  chevron?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3.5 py-3.5 min-h-[48px] text-left active:bg-bg-warm/50 transition-colors ${danger ? "text-danger" : ""}`}
    >
      <span className={`flex-shrink-0 ${danger ? "text-danger/60" : "text-text-caption"}`}>{icon}</span>
      <span className={`flex-1 text-[15px] ${danger ? "text-danger font-medium" : "text-text-primary"}`}>{label}</span>
      {value && <span className="text-[13px] text-text-caption mr-1">{value}</span>}
      {chevron && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-text-disabled flex-shrink-0">
          <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

// ===== Plan Badge =====
const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "무료",
    priceNum: 0,
    desc: "기본 체력 진단 및 운동 추천",
    features: ["월 1회 맞춤 체력 진단 리포트", "광고 포함 운동 및 스트레칭 추천", "데일리 체크인 및 보상"],
    current: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "19,900원",
    priceNum: 19900,
    period: "/월",
    desc: "전문 코칭과 심층 분석",
    features: [
      "주 1회 심층 체력 진단 및 리포트",
      "맞춤형 주간 운동 루틴 생성 및 추천",
      "1:1 전문 AI 코칭",
    ],
    popular: true,
    badge: "BETA",
  },
  {
    id: "premium",
    name: "Premium",
    price: "149,000원",
    priceNum: 149000,
    period: "/월",
    desc: "프로 선수급 종합 관리",
    features: [
      "Pro 플랜 전체 기능",
      "전문 트레이너 매칭",
      "월 1회 근기능 및 체력 정밀 측정",
      "종목별 맞춤 퍼포먼스 분석",
      "맞춤형 루틴 무제한 생성",
      "대회 준비 프로그램",
    ],
    badge: "BETA",
  },
];

// ===== Edit Profile Modal =====
function EditProfileModal({
  isOpen,
  onClose,
  profile,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  profile: { nickname: string; age: number | null; height: number | null; weight: number | null; sport: string };
  onSave: (data: { nickname: string; age: number | null; height: number | null; weight: number | null }) => void;
}) {
  const [nickname, setNickname] = useState(profile.nickname);
  const [age, setAge] = useState(profile.age?.toString() || "");
  const [height, setHeight] = useState(profile.height?.toString() || "");
  const [weight, setWeight] = useState(profile.weight?.toString() || "");

  useEffect(() => {
    if (isOpen) {
      setNickname(profile.nickname);
      setAge(profile.age?.toString() || "");
      setHeight(profile.height?.toString() || "");
      setWeight(profile.weight?.toString() || "");
    }
  }, [isOpen, profile]);

  const handleSave = () => {
    onSave({
      nickname: nickname.trim() || profile.nickname,
      age: age ? parseInt(age) : null,
      height: height ? parseInt(height) : null,
      weight: weight ? parseInt(weight) : null,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative bg-white rounded-t-3xl w-full max-w-lg p-6 pb-10"
          >
            <div className="w-10 h-1 rounded-full bg-border-card mx-auto mb-6" />
            <h3 className="text-[18px] font-bold text-text-primary mb-5">개인정보 수정</h3>

            <div className="space-y-4">
              <div>
                <label className="text-[13px] text-text-caption font-medium mb-1.5 block">닉네임</label>
                <input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full h-[48px] px-4 rounded-xl bg-bg-warm border border-transparent text-[15px] text-text-primary outline-none focus:border-primary/30 transition-all"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[13px] text-text-caption font-medium mb-1.5 block">나이</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="세"
                    className="w-full h-[48px] px-4 rounded-xl bg-bg-warm border border-transparent text-[15px] text-text-primary outline-none focus:border-primary/30 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[13px] text-text-caption font-medium mb-1.5 block">키</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="cm"
                    className="w-full h-[48px] px-4 rounded-xl bg-bg-warm border border-transparent text-[15px] text-text-primary outline-none focus:border-primary/30 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[13px] text-text-caption font-medium mb-1.5 block">몸무게</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="kg"
                    className="w-full h-[48px] px-4 rounded-xl bg-bg-warm border border-transparent text-[15px] text-text-primary outline-none focus:border-primary/30 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 min-h-[48px] rounded-2xl bg-bg-warm text-text-secondary text-[15px] font-semibold active:bg-border-card transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="flex-1 min-h-[48px] rounded-2xl bg-primary text-white text-[15px] font-bold active:brightness-95 transition-all"
              >
                저장
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ===== Pricing Modal =====
function PricingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const toast = useToast((s) => s.toast);

  const handleSelectPlan = (plan: typeof PLANS[number]) => {
    if (plan.id === "free") {
      onClose();
      return;
    }
    onClose();
    toast("아직 준비중인 기능이에요");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative bg-white rounded-t-3xl w-full max-w-lg p-6 pb-10 max-h-[85dvh] overflow-y-auto"
          >
            <div className="w-10 h-1 rounded-full bg-border-card mx-auto mb-5" />
            <div className="text-center mb-6">
              <h3 className="text-[20px] font-bold text-text-primary tracking-tight">요금제 선택</h3>
              <p className="text-[14px] text-text-caption mt-1">나에게 맞는 플랜을 선택하세요</p>
            </div>

            <div className="space-y-3">
              {PLANS.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full text-left rounded-2xl border-2 p-4 transition-all active:scale-[0.98] ${
                    plan.current
                      ? "border-primary bg-primary/5"
                      : plan.popular
                        ? "border-[#6BABFF]/40 bg-gradient-to-br from-white to-primary/3"
                        : "border-border-card/50 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[16px] font-bold text-text-primary">{plan.name}</span>
                        {plan.badge && (
                          <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold">
                            {plan.badge}
                          </span>
                        )}
                        {plan.current && (
                          <span className="px-1.5 py-0.5 rounded-md bg-success/10 text-success text-[10px] font-bold">
                            현재
                          </span>
                        )}
                        {plan.popular && (
                          <span className="px-1.5 py-0.5 rounded-md bg-[#FF9F0A]/10 text-[#FF9F0A] text-[10px] font-bold">
                            추천
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-text-caption mt-0.5">{plan.desc}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <span className="text-[18px] font-bold text-text-primary">{plan.price}</span>
                      {plan.period && <span className="text-[12px] text-text-caption">{plan.period}</span>}
                    </div>
                  </div>
                  <div className="space-y-1.5 mt-3">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-primary flex-shrink-0">
                          <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="text-[13px] text-text-secondary">{f}</span>
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="w-full min-h-[48px] rounded-2xl bg-bg-warm text-text-secondary text-[15px] font-semibold active:bg-border-card transition-colors mt-4"
            >
              닫기
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ===== Confirm Modal =====
function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  desc,
  confirmText,
  danger,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  desc: string;
  confirmText: string;
  danger?: boolean;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-8">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white rounded-3xl p-6 w-full max-w-sm shadow-elevated"
          >
            <h3 className="text-[18px] font-bold text-text-primary text-center mb-2">{title}</h3>
            <p className="text-[14px] text-text-caption text-center mb-6 leading-relaxed">{desc}</p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 min-h-[48px] rounded-2xl bg-bg-warm text-text-secondary text-[15px] font-semibold active:bg-border-card transition-colors"
              >
                취소
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 min-h-[48px] rounded-2xl text-white text-[15px] font-bold active:brightness-95 transition-all ${
                  danger ? "bg-danger" : "bg-primary"
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ===== ICONS =====
const Icons = {
  person: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 21v-1a6 6 0 0 1 12 0v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  crown: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M2 17l3-11 5 5 2-7 2 7 5-5 3 11H2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  ),
  bell: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  shield: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 16v-4m0-4h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  logout: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  trash: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  refresh: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

// ===== MAIN PAGE =====
export default function MyPage() {
  const hydrated = useHydration();
  const router = useRouter();
  const toast = useToast((s) => s.toast);
  const profile = useUserStore((s) => s.profile);
  const resetUser = useUserStore((s) => s.resetAll);
  const assessmentProfile = useAssessmentStore((s) => s.userProfile);
  const updateProfile = useAssessmentStore((s) => s.updateProfile);
  const result = useAssessmentStore((s) => s.result);
  const resetAssessment = useAssessmentStore((s) => s.resetAssessment);
  const resetPlan = useWorkoutStore((s) => s.resetPlan);
  const clearCoachMessages = useCoachStore((s) => s.clearMessages);
  const totalWorkouts = useAssessmentStore((s) => s.totalWorkoutsCompleted);
  const streak = useAssessmentStore((s) => s.streak);

  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setAuthUser({ email: user.email, created_at: user.created_at });
        }
      } catch {
        // Not logged in
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      resetUser();
      resetAssessment();
      resetPlan();
      clearCoachMessages();
      setAuthUser(null);
      setShowLogoutConfirm(false);
      toast("로그아웃되었습니다");
      router.replace("/");
    } catch {
      // ignore
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      resetUser();
      resetAssessment();
      setShowDeleteConfirm(false);
      toast("탈퇴가 완료되었습니다");
      router.replace("/");
    } catch {
      // ignore
    }
  };

  const handleResetAll = () => {
    resetUser();
    resetAssessment();
    resetPlan();
    clearCoachMessages();
    setShowResetConfirm(false);
    toast("모든 데이터가 초기화되었습니다");
    router.replace("/");
  };

  const handleSaveProfile = (data: { nickname: string; age: number | null; height: number | null; weight: number | null }) => {
    updateProfile({
      nickname: data.nickname,
      age: data.age,
      height: data.height,
      weight: data.weight,
    });
    toast("개인정보가 수정되었습니다");
  };

  if (!hydrated) return null;

  const nickname = profile?.nickname || assessmentProfile?.nickname || "사용자";
  const sport = assessmentProfile?.sportLabel || assessmentProfile?.sport || "";
  const age = assessmentProfile?.age || null;
  const height = assessmentProfile?.height || null;
  const weight = assessmentProfile?.weight || null;
  const sportsAge = result?.sportsAge;

  return (
    <div className="flex flex-col min-h-dvh bg-bg-primary pb-28">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-bg-primary/90 backdrop-blur-xl border-b border-border-card/30">
        <div className="flex items-center h-[56px] px-5 relative">
          <button
            onClick={() => router.back()}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-text-primary rounded-xl active:bg-bg-warm transition-colors -ml-2"
            aria-label="뒤로 가기"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="absolute left-1/2 -translate-x-1/2 text-[16px] font-bold text-text-primary tracking-tight">
            마이페이지
          </span>
        </div>
      </header>

      <div className="flex-1 px-5 pt-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white rounded-3xl shadow-card border border-border-card/50 p-5 mb-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary via-[#4B95F9] to-[#6BABFF] flex items-center justify-center flex-shrink-0">
              <span className="text-[22px] font-bold text-white">{nickname.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[20px] font-bold text-text-primary tracking-tight truncate">
                {nickname}
              </h2>
              {authUser?.email ? (
                <p className="text-[13px] text-text-caption mt-0.5 truncate">{authUser.email}</p>
              ) : (
                <p className="text-[13px] text-text-caption mt-0.5">비회원</p>
              )}
            </div>
            {!authUser && !isLoading && (
              <button
                onClick={() => router.push("/login?next=/my")}
                className="px-4 py-2 rounded-xl bg-primary text-white text-[13px] font-bold active:brightness-95 transition-all flex-shrink-0"
              >
                로그인
              </button>
            )}
          </div>

          {/* Quick Stats */}
          {result && (
            <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-border-card/50">
              <div className="text-center">
                <p className="text-[22px] font-bold text-primary">{sportsAge}</p>
                <p className="text-[12px] font-medium text-text-caption mt-1">스포츠 나이</p>
              </div>
              <div className="text-center">
                <p className="text-[22px] font-bold text-text-primary">{totalWorkouts}</p>
                <p className="text-[12px] font-medium text-text-caption mt-1">총 운동</p>
              </div>
              <div className="text-center">
                <p className="text-[22px] font-bold text-success">{streak}</p>
                <p className="text-[12px] font-medium text-text-caption mt-1">연속 일수</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Subscription Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
        >
          <button
            onClick={() => setShowPricing(true)}
            className="w-full bg-gradient-to-r from-primary/8 to-[#6BABFF]/8 rounded-2xl p-4 mb-4 border border-primary/10 active:scale-[0.98] transition-transform text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-primary">
                    <path d="M2 17l3-11 5 5 2-7 2 7 5-5 3 11H2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-bold text-text-primary">Free 플랜</span>
                    <span className="px-1.5 py-0.5 rounded-md bg-success/10 text-success text-[10px] font-bold">현재</span>
                  </div>
                  <p className="text-[12px] text-text-caption mt-0.5">업그레이드하고 더 많은 기능을 사용하세요</p>
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-text-disabled flex-shrink-0">
                <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>
        </motion.div>

        {/* Menu Sections */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="bg-white rounded-3xl shadow-card border border-border-card/50 px-5 mb-4"
        >
          <div className="divide-y divide-border-card/50">
            <MenuItem
              icon={Icons.person}
              label="개인정보 수정"
              value={sport || undefined}
              onClick={() => setShowEditProfile(true)}
            />
            <MenuItem
              icon={Icons.crown}
              label="요금제 관리"
              value="Free"
              onClick={() => setShowPricing(true)}
            />
            <MenuItem
              icon={Icons.bell}
              label="알림 설정"
              onClick={() => toast("아직 준비중인 기능이에요")}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="bg-white rounded-3xl shadow-card border border-border-card/50 px-5 mb-4"
        >
          <div className="divide-y divide-border-card/50">
            <MenuItem
              icon={Icons.shield}
              label="개인정보처리방침"
              onClick={() => toast("아직 준비중인 기능이에요")}
            />
            <MenuItem
              icon={Icons.info}
              label="서비스 정보"
              value="v1.0.0"
              chevron={false}
            />
          </div>
        </motion.div>

        {/* Account Actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="bg-white rounded-3xl shadow-card border border-border-card/50 px-5 mb-4"
        >
          <div className="divide-y divide-border-card/50">
            {authUser ? (
              <MenuItem
                icon={Icons.logout}
                label="로그아웃"
                onClick={() => setShowLogoutConfirm(true)}
                chevron={false}
              />
            ) : (
              <MenuItem
                icon={Icons.logout}
                label="로그인"
                onClick={() => router.push("/login?next=/my")}
                chevron={false}
              />
            )}
            <MenuItem
              icon={Icons.refresh}
              label="처음부터 다시하기"
              onClick={() => setShowResetConfirm(true)}
              danger
              chevron={false}
            />
            <MenuItem
              icon={Icons.trash}
              label="회원 탈퇴"
              onClick={() => setShowDeleteConfirm(true)}
              danger
              chevron={false}
            />
          </div>
        </motion.div>

        {/* Footer */}
        <p className="text-[12px] text-text-disabled text-center py-4">
          ON-U 피지컬 코칭 | contact@on-u.kr
        </p>
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="로그아웃"
        desc="정말 로그아웃 하시겠습니까?"
        confirmText="로그아웃"
      />

      <ConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetAll}
        title="처음부터 다시하기"
        desc="모든 진단 결과와 운동 데이터가 초기화됩니다. 정말 처음부터 다시 시작하시겠습니까?"
        confirmText="초기화"
        danger
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
        title="회원 탈퇴"
        desc="탈퇴하면 모든 데이터가 삭제되며 복구할 수 없습니다. 정말 탈퇴하시겠습니까?"
        confirmText="탈퇴하기"
        danger
      />

      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        profile={{ nickname, age, height, weight, sport }}
        onSave={handleSaveProfile}
      />

      <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} />

      <BottomNav />
    </div>
  );
}
