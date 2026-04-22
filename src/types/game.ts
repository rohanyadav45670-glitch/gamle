// ─── Color Game Types ────────────────────────────────────────────────────────

export type ColorChoice = "red" | "green" | "violet";
export type GamePhase = "betting" | "locked" | "revealing" | "result";
export type NumberColor = "red" | "green" | "violet-red" | "violet-green";

export interface RoundResult {
  roundId: string;
  number: number;        // 0-9
  color: ColorChoice;    // primary colour (red/green/violet)
  bigSmall: "big" | "small"; // 5-9 big, 0-4 small
  timestamp: number;
}

export interface Bet {
  id: string;
  roundId: string;
  choice: ColorChoice | "big" | "small";
  amount: number;
  multiplier: number;
  status: "pending" | "won" | "lost";
  payout: number;
  timestamp: number;
}

export interface GameState {
  phase: GamePhase;
  currentRoundId: string;
  timeLeft: number;         // seconds
  totalSeconds: number;
  balance: number;
  currentBet: { choice: ColorChoice | "big" | "small"; amount: number } | null;
  lastResult: RoundResult | null;
  history: RoundResult[];
  betHistory: Bet[];
  isWin: boolean | null;
}

export interface GameConfig {
  roundDuration: number;    // seconds
  lockoutSeconds: number;   // seconds before end when bets lock
  startingBalance: number;
  multipliers: Record<ColorChoice | "big" | "small", number>;
}
