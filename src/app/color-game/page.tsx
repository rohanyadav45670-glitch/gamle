"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import { useGameEngine } from "@/hooks/useGameEngine";
import BalanceBar from "@/components/common/BalanceBar";
import GameTimer from "@/components/GameTimer";
import ResultReveal from "@/components/ResultReveal";
import BettingPanel from "@/components/color-game/BettingPanel";
import GameHistory from "@/components/GameHistory";
import MyBets from "@/components/MyBets";
import Header from "@/components/common/Header";

type Tab = "game" | "history" | "mybets";

export default function ColorGamePage() {
  const { state, placeBet, cancelBet, addFunds, config } = useGameEngine();
  const [tab, setTab] = useState<Tab>("game");

  const isRevealing = state.phase === "revealing" || state.phase === "result";

  return (
    <div className="min-h-screen bg-[#0b0d14] text-white flex flex-col">
      {/* ── Top Bar ─────────────────────────────────────────── */}
      <Header title="Colour Prediction" />
      
      {/* ── Balance Bar ─────────────────────────────────────── */}
      <BalanceBar balance={state.balance} onAddFunds={() => addFunds(500)} />

      {/* ── Timer + Result Area ─────────────────────────────── */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-linear-to-b from-[#13151f] to-[#0b0d14]" />

        {/* Animated background orbs */}
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-violet-700/10 rounded-full blur-3xl" />
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-amber-600/10 rounded-full blur-3xl" />

        <div className="relative px-4 pt-4 pb-5">
          {/* Result or Timer */}
          <div
            className={cn(
              "transition-all duration-500",
              isRevealing ? "opacity-100" : "opacity-100"
            )}
          >
            {isRevealing && state.lastResult ? (
              <ResultReveal
                result={state.lastResult}
                isWin={state.isWin}
                betChoice={state.currentBet?.choice}
                betAmount={state.currentBet?.amount}
                payout={
                  state.currentBet && state.lastResult
                    ? state.currentBet.amount *
                    config.multipliers[state.currentBet.choice as keyof typeof config.multipliers]
                    : undefined
                }
              />
            ) : (
              <div className="flex flex-col items-center gap-3">
                <GameTimer
                  timeLeft={state.timeLeft}
                  totalSeconds={state.totalSeconds}
                  phase={state.phase}
                  roundId={state.currentRoundId}
                />

                {/* Quick history dots strip */}
                {state.history.length > 0 && (
                  <div className="flex gap-1.5 items-center">
                    <span className="text-white/30 text-[10px]">Last:</span>
                    {state.history.slice(0, 8).map((r, i) => (
                      <div
                        key={r.roundId}
                        className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center text-white font-black text-[9px] transition-all",
                          i === 0 && "scale-110 ring-2 ring-white/20",
                          r.color === "red" && "bg-red-500",
                          r.color === "green" && "bg-green-500",
                          r.color === "violet" && "bg-violet-500",
                        )}
                      >
                        {r.number}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────── */}
      <div className="flex border-b border-white/5 bg-[#0f1117] sticky top-15.5 z-30">
        {(["game", "history", "mybets"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-2.5 text-xs font-bold tracking-widest transition-all relative capitalize",
              tab === t ? "text-amber-400" : "text-white/30 hover:text-white/60"
            )}
          >
            {t === "mybets" ? "My Bets" : t}
            {tab === t && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-amber-400 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* ── Tab Content ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto pb-6">
        {tab === "game" && (
          <BettingPanel
            phase={state.phase}
            balance={state.balance}
            currentBet={state.currentBet}
            onPlaceBet={placeBet}
            onCancelBet={cancelBet}
            multipliers={config.multipliers}
          />
        )}
        {tab === "history" && <GameHistory history={state.history} />}
        {tab === "mybets" && <MyBets bets={state.betHistory} />}
      </div>
    </div>
  );
}
