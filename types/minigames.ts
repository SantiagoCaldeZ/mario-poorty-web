import type { MinigameKey } from "@/lib/game/board/tile-types";

export type MinigameMode = "solo" | "versus" | "group";

export type MinigameResultStatus = "won" | "lost";

export type MinigameResolvePayload<TDetails = unknown> = {
  result: MinigameResultStatus;
  details?: TDetails;
};

export type BaseMinigameProps<TDetails = unknown> = {
  sessionId: string;
  tileIndex: number;
  opponentUserId?: string | null;
  onResolve: (payload: MinigameResolvePayload<TDetails>) => void | Promise<void>;
  onCancel?: () => void;
};

export type MinigameHostRequest = {
  minigameKey: MinigameKey;
  sessionId: string;
  tileIndex: number;
  opponentUserId?: string | null;
};
