import type { MinigameKey } from "@/lib/game/board/tile-types";

export type PlayerBoardStateSnapshot = {
  position: number;
  shieldCharges: number;
  skipTurns: number;
  nextRollBonus: number;
  nextRollMax: number | null;
  pendingMinigameKey: MinigameKey | null;
  pendingMinigameTileIndex: number | null;
  pendingMinigameSessionId: string | null;
};

export type MatchTurnState =
  | "awaiting_roll"
  | "resolving_turn"
  | "awaiting_minigame_result"
  | "finished";
