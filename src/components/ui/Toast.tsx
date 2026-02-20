"use client";

import { create } from "zustand";
import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface ToastState {
  message: string | null;
  show: () => void;
  hide: () => void;
  toast: (msg: string) => void;
}

export const useToast = create<ToastState>((set) => ({
  message: null,
  show: () => {},
  hide: () => set({ message: null }),
  toast: (msg: string) => {
    set({ message: msg });
    setTimeout(() => set({ message: null }), 2500);
  },
}));

export function ToastProvider() {
  const message = useToast((s) => s.message);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 bg-[#333D4B]/90 backdrop-blur-lg text-white text-[14px] font-medium rounded-2xl shadow-elevated max-w-[calc(100%-40px)] text-center"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
