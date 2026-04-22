"use client";

import { useState, useRef, useCallback } from "react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Coin3D from "@/components/heads-tails/Coin3D";
import {BetPanel, FlipHistory, StatsBar, ParticlesBurst } from "@/components/heads-tails/components";
// import FlipHistory from "@/components/heads-tails/FlipHistory";
// import StatsBar from "@/components/heads-tails/StatsBar";
// import ParticlesBurst from "@/components/heads-tails/ParticlesBurst";

export type CoinSide = "heads" | "tails";

export interface FlipRecord {
  result: CoinSide;
  bet: CoinSide;
  amount: number;
  won: boolean;
  payout: number;
}

export interface GameStats {
  balance: number;
  wins: number;
  losses: number;
  pnl: number;
  history: FlipRecord[];
}

// ── API adapter ──────────────────────────────────────────────────────────────
// Replace this with a real API call to get provably-fair results from backend.
// Expected: Promise<{ result: "heads" | "tails" }>
async function fetchFlipResult(_roundId: string): Promise<CoinSide> {
  // DEMO MODE — remove this and call your API below
  await new Promise((r) => setTimeout(r, 50));
  return Math.random() < 0.5 ? "heads" : "tails";

  // REAL API MODE (uncomment):
  // const res = await fetch(`/api/heads-tails/flip?round=${_roundId}`);
  // const data = await res.json();
  // return data.result as CoinSide;
}

export default function HeadsTailsPage() {
  const [stats, setStats] = useState<GameStats>({
    balance: 1000,
    wins: 0,
    losses: 0,
    pnl: 0,
    history: [],
  });
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState<CoinSide | null>(null);
  const [isWin, setIsWin] = useState<boolean | null>(null);
  const [showParticles, setShowParticles] = useState(false);
  const roundRef = useRef(0);

  const handleFlip = useCallback(
    async (side: CoinSide, amount: number) => {
      if (flipping || amount > stats.balance) return;

      setFlipping(true);
      setResult(null);
      setIsWin(null);

      roundRef.current++;
      const roundId = `ht-${Date.now()}-${roundRef.current}`;

      try {
        const flipResult = await fetchFlipResult(roundId);
        const won = flipResult === side;
        const payout = won ? amount * 2 : 0;

        // Delay state update to sync with coin animation land
        setTimeout(() => {
          setResult(flipResult);
          setIsWin(won);
          setShowParticles(won);

          setStats((prev) => ({
            balance: prev.balance - amount + payout,
            wins: prev.wins + (won ? 1 : 0),
            losses: prev.losses + (won ? 0 : 1),
            pnl: prev.pnl + (won ? amount : -amount),
            history: [
              { result: flipResult, bet: side, amount, won, payout },
              ...prev.history,
            ].slice(0, 50),
          }));

          setTimeout(() => setFlipping(false), 2000);
        }, 1600); // matches coin flip duration
      } catch (err) {
        console.error("Flip error:", err);
        setFlipping(false);
      }
    },
    [flipping, stats.balance]
  );

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: "#080b12", fontFamily: "'DM Sans', sans-serif", color: "#fff" }}
    >
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-16 -left-16 w-56 h-56 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(251,191,36,0.1) 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-24 -right-20 w-64 h-64 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)" }}
        />
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Particle burst overlay */}
      {showParticles && (
        <ParticlesBurst onDone={() => setShowParticles(false)} />
      )}

      {/* Header */}
      <header
        className="flex items-center gap-3 px-4 py-3 relative z-10 border-b"
        style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.06)" }}
      >
        <Link href="/" className="text-white/50 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1
            className="font-black text-base leading-tight"
            style={{ fontFamily: "'Orbitron', sans-serif", color: "#fbbf24" }}
          >
            Heads & Tails
          </h1>
          <p className="text-white/40 text-[10px]">Evoplay · RTP: 96%</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 rounded-full px-2.5 py-1"
          style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)" }}>
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-[10px] font-bold tracking-wide">LIVE</span>
        </div>
      </header>

      {/* Balance */}
      <div
        className="flex items-center justify-between px-4 py-2.5 relative z-10 border-b"
        style={{ background: "rgba(251,191,36,0.04)", borderColor: "rgba(251,191,36,0.08)" }}
      >
        <div>
          <p className="text-[10px] text-white/35 font-semibold uppercase tracking-widest">Balance</p>
          <p
            className="text-xl font-bold tabular-nums"
            style={{ fontFamily: "'Orbitron', sans-serif", color: "#fbbf24" }}
          >
            ₹{stats.balance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <button
          onClick={() => setStats((s) => ({ ...s, balance: s.balance + 500 }))}
          className="text-xs font-semibold rounded-full px-4 py-2 transition-all"
          style={{
            background: "rgba(251,191,36,0.12)",
            border: "1px solid rgba(251,191,36,0.3)",
            color: "#fbbf24",
          }}
        >
          + Add ₹500
        </button>
      </div>

      {/* Coin */}
      <div className="flex flex-col items-center py-8 relative z-5">
        <Coin3D flipping={flipping} result={result} />

        {/* Result label */}
        <div
          className={cn(
            "mt-4 px-5 py-2 rounded-full text-sm font-bold transition-all duration-500",
            isWin === null
              ? "opacity-0"
              : isWin
              ? "opacity-100 scale-100"
              : "opacity-100 scale-100"
          )}
          style={
            isWin === null
              ? {}
              : isWin
              ? { background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.35)", color: "#4ade80" }
              : { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }
          }
        >
          {isWin === null
            ? ""
            : isWin
            ? `🎉 YOU WON  +₹${stats.history[0]?.amount ?? 0}`
            : `💫 ${result?.toUpperCase()} — Better luck!`}
        </div>
      </div>

      {/* Bet Panel */}
      <BetPanel
        balance={stats.balance}
        flipping={flipping}
        onFlip={handleFlip}
      />

      {/* Stats */}
      <StatsBar wins={stats.wins} losses={stats.losses} pnl={stats.pnl} />

      {/* History */}
      <FlipHistory history={stats.history} />
    </div>
  );
}
