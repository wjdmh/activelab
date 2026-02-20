"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface CoachState {
  messages: ChatMessage[];
  isLoading: boolean;

  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
}

export const useCoachStore = create<CoachState>()(
  persist(
    (set) => ({
      messages: [],
      isLoading: false,

      addMessage: (message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          timestamp: new Date().toISOString(),
        };
        set((state) => {
          // Keep max 100 messages
          const updated = [...state.messages, newMessage];
          return { messages: updated.slice(-100) };
        });
      },

      setLoading: (loading) => set({ isLoading: loading }),

      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: "active-lab-coach",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        messages: state.messages,
      }),
    }
  )
);
