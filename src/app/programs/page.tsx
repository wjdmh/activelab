"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Card } from "@/components/ui/Card";
import { useUserStore } from "@/stores/useUserStore";
import { useProgramStore } from "@/stores/useProgramStore";
import { useHydration } from "@/hooks/useHydration";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { PROGRAM_TEMPLATES } from "@/types/program";

export default function ProgramsPage() {
  const hydrated = useHydration();
  const router = useRouter();
  const hasCompleted = useUserStore((s) => s.hasCompletedAssessment);
  const activeProgram = useProgramStore((s) => s.activeProgram);
  const getWeekProgress = useProgramStore((s) => s.getWeekProgress);
  const getPhaseProgress = useProgramStore((s) => s.getPhaseProgress);

  const shouldRedirect = hydrated && !hasCompleted;

  useEffect(() => {
    if (shouldRedirect) router.replace("/");
  }, [shouldRedirect, router]);

  if (!hydrated) return <PageSkeleton />;
  if (shouldRedirect) return null;

  const weekProgress = getWeekProgress();
  const phaseProgress = getPhaseProgress();

  return (
    <>
      <Header />
      <main className="px-5 pt-4 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <h1 className="text-[24px] font-bold text-text-primary tracking-tight">
            프로그램
          </h1>
          <p className="text-[15px] text-text-caption mt-1">
            목표에 맞는 프로그램을 선택해보세요
          </p>
        </motion.div>

        {/* Active program banner */}
        {activeProgram && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="mb-6"
          >
            <Card variant="elevated" className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/15">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <span className="text-[28px]">
                    {PROGRAM_TEMPLATES.find((t) => t.category === activeProgram.category)?.icon || "💪"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-text-caption font-medium">진행 중</p>
                  <p className="text-[17px] font-bold text-text-primary tracking-tight">
                    {activeProgram.name}
                  </p>
                  <p className="text-[13px] text-text-caption mt-0.5">
                    {weekProgress.current}주차 / {weekProgress.total}주
                    {phaseProgress && ` · ${phaseProgress.phaseName}`}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="h-2 bg-bg-warm rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-success rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${weekProgress.total > 0 ? (weekProgress.current / weekProgress.total) * 100 : 0}%`,
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <p className="text-[12px] text-text-caption mt-1 text-right">
                  {Math.round((weekProgress.current / Math.max(weekProgress.total, 1)) * 100)}% 완료
                </p>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Program catalog */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          <h2 className="text-[18px] font-bold text-text-primary mb-3 tracking-tight">
            {activeProgram ? "다른 프로그램" : "프로그램 목록"}
          </h2>
          <div className="space-y-3">
            {PROGRAM_TEMPLATES.map((template, idx) => {
              const isActive = activeProgram?.category === template.category;
              return (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + idx * 0.05 }}
                >
                  <button
                    className={`w-full text-left p-4 rounded-2xl border transition-all active:scale-[0.98] ${
                      isActive
                        ? "bg-primary/5 border-primary/20"
                        : "bg-bg-card border-border-card hover:border-primary/20"
                    }`}
                    onClick={() => {
                      // For now, just show the template info
                      // In the future, this would start the program
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-bg-warm flex items-center justify-center flex-shrink-0">
                        <span className="text-[24px]">{template.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[16px] font-bold text-text-primary tracking-tight">
                            {template.name}
                          </p>
                          {isActive && (
                            <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                              진행 중
                            </span>
                          )}
                        </div>
                        <p className="text-[14px] text-text-caption mt-0.5">
                          {template.description}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[12px] text-text-disabled">
                            {template.durationWeeks}주 프로그램
                          </span>
                          <span className="text-[12px] text-text-disabled">
                            목표: {template.goal}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </main>
      <BottomNav />
    </>
  );
}
