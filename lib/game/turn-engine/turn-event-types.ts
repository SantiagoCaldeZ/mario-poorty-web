import type {
  MinigameKey,
  TileFamily,
  TileKind,
} from "../board/tile-types";

export type TurnEventActor = {
  userId: string;
  username?: string | null;
};

export type TurnMessage = {
  title: string;
  description: string;
};

export type TurnEventBase = {
  id: string;
  order: number;
  actorUserId: string;
};

export type TurnStartedEvent = TurnEventBase & {
  type: "turn_started";
  turnNumber: number;
};

export type TurnBlockedByPendingMinigameEvent = TurnEventBase & {
  type: "turn_blocked_by_pending_minigame";
  pendingMinigameKey: MinigameKey;
  pendingTileIndex: number;
  message: TurnMessage;
};

export type DiceRolledEvent = TurnEventBase & {
  type: "dice_rolled";
  rawRoll: number;
  appliedBonus: number;
  appliedMaxCap: number | null;
  finalSteps: number;
};

export type PieceMoveReason =
  | "dice"
  | "tile_effect"
  | "bounce"
  | "chaos_card";

export type PieceMoveEvent = TurnEventBase & {
  type: "piece_move";
  from: number;
  to: number;
  reason: PieceMoveReason;
};

export type TileLandedEvent = TurnEventBase & {
  type: "tile_landed";
  tileIndex: number;
  tileKind: TileKind;
  tileFamily: TileFamily;
};

export type TileMessageEvent = TurnEventBase & {
  type: "tile_message";
  tileIndex: number;
  tileKind: TileKind;
  message: TurnMessage;
  autoCloseMs?: number;
};

export type StatusAppliedKind =
  | "shield_gained"
  | "shield_consumed"
  | "next_roll_bonus_gained"
  | "skip_turns_gained"
  | "next_roll_max_set";

export type StatusAppliedEvent = TurnEventBase & {
  type: "status_applied";
  statusKind: StatusAppliedKind;
  value?: number;
  message: TurnMessage;
};

export type ChaosCardSuit = "hearts" | "diamonds" | "clubs" | "spades";
export type ChaosCardRank =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K"
  | "A";

export type ChaosCardDrawnEvent = TurnEventBase & {
  type: "chaos_card_drawn";
  cardId: string;
  suit: ChaosCardSuit;
  rank: ChaosCardRank;
  message: TurnMessage;
};

export type MinigameStartedEvent = TurnEventBase & {
  type: "minigame_started";
  minigameKey: MinigameKey;
  tileIndex: number;
  sessionId: string;
  mode: "solo" | "versus";
  requiresOpponent: boolean;
  opponentUserId?: string | null;
  message: TurnMessage;
};

export type MinigamePendingEvent = TurnEventBase & {
  type: "minigame_pending";
  minigameKey: MinigameKey;
  tileIndex: number;
  sessionId: string | null;
  message: TurnMessage;
};

export type MinigameResolvedEvent = TurnEventBase & {
  type: "minigame_resolved";
  minigameKey: MinigameKey;
  tileIndex: number;
  result: "won" | "lost";
  message: TurnMessage;
};

export type TurnEndedEvent = TurnEventBase & {
  type: "turn_ended";
  nextPlayerUserId: string | null;
  endedBecause:
    | "normal_resolution"
    | "pending_minigame_retry_finished"
    | "match_finished";
};

export type MatchFinishedEvent = TurnEventBase & {
  type: "match_finished";
  winnerUserId: string;
  finalPosition: number;
  message: TurnMessage;
};

export type TurnEvent =
  | TurnStartedEvent
  | TurnBlockedByPendingMinigameEvent
  | DiceRolledEvent
  | PieceMoveEvent
  | TileLandedEvent
  | TileMessageEvent
  | StatusAppliedEvent
  | ChaosCardDrawnEvent
  | MinigameStartedEvent
  | MinigamePendingEvent
  | MinigameResolvedEvent
  | TurnEndedEvent
  | MatchFinishedEvent;

export type TurnPlan = {
  matchId: string;
  actingUserId: string;
  turnNumber: number;
  events: TurnEvent[];
};

export function createTurnEventId(
  turnNumber: number,
  order: number,
  type: TurnEvent["type"],
): string {
  return `turn-${turnNumber}-step-${order}-${type}`;
}

export function createTurnEventBase(
  turnNumber: number,
  order: number,
  actorUserId: string,
  type: TurnEvent["type"],
): TurnEventBase {
  return {
    id: createTurnEventId(turnNumber, order, type),
    order,
    actorUserId,
  };
}

export function isMovementTurnEvent(
  event: TurnEvent,
): event is PieceMoveEvent {
  return event.type === "piece_move";
}

export function isTileMessageTurnEvent(
  event: TurnEvent,
): event is TileMessageEvent {
  return event.type === "tile_message";
}

export function isMinigameTurnEvent(
  event: TurnEvent,
): event is
  | MinigameStartedEvent
  | MinigamePendingEvent
  | MinigameResolvedEvent
  | TurnBlockedByPendingMinigameEvent {
  return (
    event.type === "minigame_started" ||
    event.type === "minigame_pending" ||
    event.type === "minigame_resolved" ||
    event.type === "turn_blocked_by_pending_minigame"
  );
}

export function isTerminalTurnEvent(
  event: TurnEvent,
): event is TurnEndedEvent | MatchFinishedEvent {
  return event.type === "turn_ended" || event.type === "match_finished";
}