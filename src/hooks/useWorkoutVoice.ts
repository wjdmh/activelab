"use client";

import { useCallback, useRef } from "react";

/**
 * 운동 코칭 TTS State Machine
 * Web Speech API SpeechSynthesis 기반 일방향 음성 가이드
 *
 * 상태 흐름: IDLE → INSTRUCTING → DETECTING → SUCCESS_FEEDBACK → NEXT_STEP
 */

export type VoicePhase = "IDLE" | "INSTRUCTING" | "DETECTING" | "SUCCESS_FEEDBACK" | "NEXT_STEP";

interface SpeakOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
}

export function useWorkoutVoice() {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
  }, [isSupported]);

  const speak = useCallback(
    (text: string, options: SpeakOptions = {}, onEnd?: () => void) => {
      if (!isSupported || !text) return;
      stop();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ko-KR";
      utterance.rate = options.rate ?? 0.92;
      utterance.pitch = options.pitch ?? 1.05;
      utterance.volume = options.volume ?? 1;

      // 한국어 음성 선택 (가능한 경우)
      const voices = window.speechSynthesis.getVoices();
      const korVoice = voices.find(
        (v) => v.lang === "ko-KR" || v.lang.startsWith("ko")
      );
      if (korVoice) utterance.voice = korVoice;

      if (onEnd) utterance.onend = onEnd;

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, stop]
  );

  // ── INSTRUCTING: 운동 시작 전 동작 안내 ──
  const speakInstruction = useCallback(
    (exerciseName: string, description: string) => {
      const text = `${exerciseName}입니다. ${description} 준비되셨으면 시작 버튼을 눌러주세요.`;
      speak(text, { rate: 0.9 });
    },
    [speak]
  );

  // ── DETECTING: 운동 수행 중 카운트/격려 ──
  const speakDetecting = useCallback(
    (exerciseName: string, targetReps: number) => {
      const text = `좋습니다! ${exerciseName}을 ${targetReps}회 반복해주세요.`;
      speak(text, { rate: 0.95 });
    },
    [speak]
  );

  // ── SUCCESS_FEEDBACK: 세트 완료 칭찬 ──
  const speakSetSuccess = useCallback(
    (currentSet: number, totalSets: number) => {
      const messages =
        currentSet < totalSets
          ? [
              `완벽해요! ${currentSet}세트 완료입니다. 잠시 쉬어가요.`,
              `훌륭해요! ${currentSet}세트 끝났어요. 잠깐 호흡을 고르세요.`,
              `아주 잘하셨어요! ${currentSet}세트 완료. 잠시 쉬세요.`,
            ]
          : [
              `완벽해요! 마지막 세트까지 다 하셨어요. 정말 대단해요!`,
              `끝까지 해내셨어요! 훌륭한 퍼포먼스예요!`,
            ];
      const text = messages[Math.floor(Math.random() * messages.length)];
      speak(text, { rate: 0.9, pitch: 1.1 });
    },
    [speak]
  );

  // ── SUCCESS_FEEDBACK: 운동 완료 칭찬 ──
  const speakExerciseDone = useCallback(
    (exerciseName: string) => {
      const text = `${exerciseName} 완료입니다! 정말 잘하셨어요. 이제 다음 운동으로 넘어갈게요.`;
      speak(text, { rate: 0.9, pitch: 1.1 });
    },
    [speak]
  );

  // ── NEXT_STEP: 다음 운동 예고 ──
  const speakNextExercise = useCallback(
    (nextName: string) => {
      const text = `다음은 ${nextName}입니다. 준비해주세요!`;
      speak(text, { rate: 0.95 });
    },
    [speak]
  );

  // ── 휴식 안내 ──
  const speakRest = useCallback(
    (seconds: number) => {
      const text = `${seconds}초 동안 쉬세요. 잘하고 계세요!`;
      speak(text, { rate: 0.88 });
    },
    [speak]
  );

  // ── 운동 전체 완료 ──
  const speakAllDone = useCallback(() => {
    speak(
      "오늘 운동을 모두 완료하셨어요! 정말 대단합니다. 꾸준함이 최고의 실력이에요!",
      { rate: 0.88, pitch: 1.1 }
    );
  }, [speak]);

  // ── ACSM 응급 경고 (이상 증상 발생 시) ──
  const speakEmergencyWarning = useCallback(() => {
    stop();
    speak(
      "이상 증상이 감지되었습니다. 즉시 운동을 중단하고 의사의 진료를 받으세요.",
      { rate: 0.85, pitch: 0.95, volume: 1 }
    );
  }, [speak, stop]);

  return {
    isSupported,
    speak,
    stop,
    speakInstruction,
    speakDetecting,
    speakSetSuccess,
    speakExerciseDone,
    speakNextExercise,
    speakRest,
    speakAllDone,
    speakEmergencyWarning,
  };
}
