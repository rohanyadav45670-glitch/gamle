"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { GameState, ColorChoice, Bet, RoundResult } from "@/types/game";
import {
  DEFAULT_CONFIG,
  generateRoundId,
  fetchRoundResult,
  calculatePayout,
} from "@/lib/gameEngine";

const INITIAL_STATE: GameState = {
  phase: "betting",
  currentRoundId: generateRoundId(),
  timeLeft: DEFAULT_CONFIG.roundDuration,
  totalSeconds: DEFAULT_CONFIG.roundDuration,
  balance: DEFAULT_CONFIG.startingBalance,
  currentBet: null,
  lastResult: null,
  history: [],
  betHistory: [],
  isWin: null,
};

export function useGameEngine() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<GameState["phase"]>("betting");
  const roundIdRef = useRef(INITIAL_STATE.currentRoundId);

  // Keep refs in sync with state
  useEffect(() => {
    phaseRef.current = state.phase;
    roundIdRef.current = state.currentRoundId;
  }, [state.phase, state.currentRoundId]);

  // ── Resolve round ──────────────────────────────────────────────────────────
  const resolveRound = useCallback(async (roundId: string, pendingBet: GameState["currentBet"], balance: number) => {
    setState((s) => ({ ...s, phase: "revealing" }));

    try {
      const result = await fetchRoundResult(roundId);

      let newBalance = balance;
      let isWin = false;
      let betRecord: Bet | null = null;

      if (pendingBet) {
        const { won, payout } = calculatePayout(
          pendingBet.choice,
          result,
          pendingBet.amount,
          DEFAULT_CONFIG.multipliers
        );
        isWin = won;
        newBalance = balance - pendingBet.amount + payout;

        betRecord = {
          id: `${roundId}-${Date.now()}`,
          roundId,
          choice: pendingBet.choice,
          amount: pendingBet.amount,
          multiplier: DEFAULT_CONFIG.multipliers[pendingBet.choice as keyof typeof DEFAULT_CONFIG.multipliers] ?? 2,
          status: won ? "won" : "lost",
          payout,
          timestamp: Date.now(),
        };
      }

      setState((s) => ({
        ...s,
        phase: "result",
        lastResult: result,
        isWin,
        balance: newBalance,
        history: [result, ...s.history].slice(0, 50),
        betHistory: betRecord ? [betRecord, ...s.betHistory].slice(0, 100) : s.betHistory,
      }));

      // Auto-advance to next round after 3s
      setTimeout(() => {
        const nextId = generateRoundId();
        setState((s) => ({
          ...s,
          phase: "betting",
          currentRoundId: nextId,
          timeLeft: DEFAULT_CONFIG.roundDuration,
          currentBet: null,
          lastResult: s.lastResult,
          isWin: null,
        }));
      }, 3000);
    } catch (err) {
      console.error("Failed to resolve round:", err);
      setState((s) => ({ ...s, phase: "betting" }));
    }
  }, []);

  // ── Countdown timer ────────────────────────────────────────────────────────
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setState((s) => {
        if (s.phase !== "betting" && s.phase !== "locked") return s;

        const next = s.timeLeft - 1;

        // Lock bets when lockout threshold reached
        if (next <= DEFAULT_CONFIG.lockoutSeconds && s.phase === "betting") {
          return { ...s, phase: "locked", timeLeft: next };
        }

        // Time's up — trigger resolution
        if (next <= 0) {
          // Capture current values for async resolve
          const { currentRoundId, currentBet, balance } = s;
          // Kick off async resolve outside setState
          setTimeout(() => resolveRound(currentRoundId, currentBet, balance), 0);
          return { ...s, timeLeft: 0, phase: "revealing" };
        }

        return { ...s, timeLeft: next };
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resolveRound]);

  // ── Place bet ──────────────────────────────────────────────────────────────
  const placeBet = useCallback((choice: ColorChoice | "big" | "small", amount: number) => {
    setState((s) => {
      if (s.phase !== "betting") return s;
      if (amount > s.balance) return s;
      return { ...s, currentBet: { choice, amount } };
    });
  }, []);

  // ── Cancel bet ─────────────────────────────────────────────────────────────
  const cancelBet = useCallback(() => {
    setState((s) => {
      if (s.phase !== "betting") return s;
      return { ...s, currentBet: null };
    });
  }, []);

  // ── Add demo funds ─────────────────────────────────────────────────────────
  const addFunds = useCallback((amount: number) => {
    setState((s) => ({ ...s, balance: s.balance + amount }));
  }, []);

  return { state, placeBet, cancelBet, addFunds, config: DEFAULT_CONFIG };
}
