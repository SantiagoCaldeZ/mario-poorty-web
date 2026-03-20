import {
  BOARD_FINISH_INDEX,
  BOARD_START_INDEX,
  getBoardTileByIndex,
} from "../board/board-layout-v1";
import type { BoardTile, MinigameKey } from "../board/tile-types";
import { isTrapTile } from "../board/tile-types";
import type { GameEffect } from "../rules/effect-types";
import {
  isChaosEffect,
  isMinigameEffect,
  isMovementEffect,
  isNoEffect,
  isPersistentStatusEffect,
} from "../rules/effect-types";
import { resolveTile } from "../rules/tile-resolution";
import type {
  ChaosCardRank,
  ChaosCardSuit,
  TurnPlan,
  TurnEvent,
  TurnMessage,
} from "./turn-event-types";
import { createTurnEventBase } from "./turn-event-types";

export type PlayerBoardState = {
  position: number;
  shieldCharges: number;
  skipTurns: number;
  nextRollBonus: number;
  nextRollMax: number | null;
  pendingMinigameKey: MinigameKey | null;
  pendingMinigameTileIndex: number | null;
  pendingMinigameSessionId: string | null;
};

export type BuildTurnPlanInput = {
  matchId: string;
  actingUserId: string;
  turnNumber: number;
  nextPlayerUserId: string | null;
  state: PlayerBoardState;
  rawRoll?: number | null;
  maxChainDepth?: number;
  chaosCardIndex?: number | null;
};

export type BuildTurnPlanResult = {
  plan: TurnPlan;
  nextState: PlayerBoardState;
  awaitingMinigameResult: boolean;
  winnerUserId: string | null;
};

type InternalContext = {
  input: BuildTurnPlanInput;
  nextState: PlayerBoardState;
  events: TurnEvent[];
  order: number;
};

type MoveComputation = {
  to: number;
  bounced: boolean;
};

type ChaosCardEffect =
  | { type: "move_by"; steps: number; negative: boolean }
  | { type: "grant_shield"; shieldCharges: number; negative: boolean }
  | { type: "grant_skip_turns"; skipTurns: number; negative: boolean }
  | { type: "grant_next_roll_bonus"; nextRollBonus: number; negative: boolean }
  | { type: "grant_next_roll_max"; nextRollMax: number; negative: boolean };

type ChaosCard = {
  id: string;
  suit: ChaosCardSuit;
  rank: ChaosCardRank;
  title: string;
  description: string;
  effect: ChaosCardEffect;
};

const CHAOS_DECK_V1: readonly ChaosCard[] = [
  {
    id: "chaos-loot-surge",
    suit: "hearts",
    rank: "8",
    title: "Impulso del Botín",
    description: "La codicia goblin te impulsa 2 casillas hacia adelante.",
    effect: {
      type: "move_by",
      steps: 2,
      negative: false,
    },
  },
  {
    id: "chaos-swamp-pull",
    suit: "spades",
    rank: "5",
    title: "Tirón del Pantano",
    description: "El pantano te arrastra 2 casillas hacia atrás.",
    effect: {
      type: "move_by",
      steps: -2,
      negative: true,
    },
  },
  {
    id: "chaos-rune-ward",
    suit: "diamonds",
    rank: "Q",
    title: "Amuleto Rúnico",
    description: "Obtienes un escudo contra la próxima trampa o efecto negativo.",
    effect: {
      type: "grant_shield",
      shieldCharges: 1,
      negative: false,
    },
  },
  {
    id: "chaos-cursed-fog",
    suit: "clubs",
    rank: "9",
    title: "Niebla Maldita",
    description: "Perderás tu próximo turno.",
    effect: {
      type: "grant_skip_turns",
      skipTurns: 1,
      negative: true,
    },
  },
  {
    id: "chaos-lucky-bones",
    suit: "hearts",
    rank: "A",
    title: "Huesos Afortunados",
    description: "En tu próximo turno, tu dado tendrá +1.",
    effect: {
      type: "grant_next_roll_bonus",
      nextRollBonus: 1,
      negative: false,
    },
  },
  {
    id: "chaos-heavy-bones",
    suit: "spades",
    rank: "J",
    title: "Huesos Pesados",
    description: "En tu próximo turno, tu dado tendrá un máximo de 3.",
    effect: {
      type: "grant_next_roll_max",
      nextRollMax: 3,
      negative: true,
    },
  },
] as const;

export function buildTurnPlan(
  input: BuildTurnPlanInput,
): BuildTurnPlanResult {
  if (input.state.pendingMinigameKey && input.state.pendingMinigameTileIndex !== null) {
    return buildPendingMinigameRetryPlan(input);
  }

  if (input.state.skipTurns > 0) {
    return buildSkippedTurnPlan(input);
  }

  if (input.rawRoll == null) {
    throw new Error(
      "buildTurnPlan requiere rawRoll cuando el jugador no está bloqueado ni pierde turno.",
    );
  }

  const ctx = createContext(input);
  pushTurnStarted(ctx);

  const appliedMaxCap = input.state.nextRollMax;
  const appliedBonus = input.state.nextRollBonus;

  const cappedRoll =
    appliedMaxCap == null ? input.rawRoll : Math.min(input.rawRoll, appliedMaxCap);

  const finalSteps = cappedRoll + appliedBonus;

  ctx.nextState.nextRollBonus = 0;
  ctx.nextState.nextRollMax = null;

  pushEvent(ctx, {
    type: "dice_rolled",
    rawRoll: input.rawRoll,
    appliedBonus,
    appliedMaxCap,
    finalSteps,
  });

  const diceMove = computeMoveBySteps(ctx.nextState.position, finalSteps);
  const diceMoveReason = diceMove.bounced ? "bounce" : "dice";

  pushEvent(ctx, {
    type: "piece_move",
    from: ctx.nextState.position,
    to: diceMove.to,
    reason: diceMoveReason,
  });

  ctx.nextState.position = diceMove.to;

  const landingResult = resolveLandingChain(ctx, {
    startingTileIndex: ctx.nextState.position,
    initialReason: "dice",
    maxChainDepth: input.maxChainDepth ?? 12,
    chaosCardIndex: input.chaosCardIndex ?? null,
  });

  if (landingResult.awaitingMinigameResult) {
    return finalizeResult(ctx, true, null);
  }

  if (ctx.nextState.position === BOARD_FINISH_INDEX) {
    pushEvent(ctx, {
      type: "match_finished",
      winnerUserId: input.actingUserId,
      finalPosition: BOARD_FINISH_INDEX,
      message: {
        title: "¡Victoria!",
        description: "Llegaste exacto a la meta y ganaste la partida.",
      },
    });

    return finalizeResult(ctx, false, input.actingUserId);
  }

  pushEvent(ctx, {
    type: "turn_ended",
    nextPlayerUserId: input.nextPlayerUserId,
    endedBecause: "normal_resolution",
  });

  return finalizeResult(ctx, false, null);
}

export function buildPendingMinigameRetryPlan(
  input: BuildTurnPlanInput,
): BuildTurnPlanResult {
  if (!input.state.pendingMinigameKey || input.state.pendingMinigameTileIndex == null) {
    throw new Error(
      "No se puede construir un reintento de minijuego si el jugador no tiene uno pendiente.",
    );
  }

  const ctx = createContext(input);
  pushTurnStarted(ctx);

  pushEvent(ctx, {
    type: "turn_blocked_by_pending_minigame",
    pendingMinigameKey: input.state.pendingMinigameKey,
    pendingTileIndex: input.state.pendingMinigameTileIndex,
    message: {
      title: "Minijuego pendiente",
      description:
        "No puedes lanzar el dado este turno. Debes volver a intentar el minijuego pendiente.",
    },
  });

  const sessionId =
    input.state.pendingMinigameSessionId ?? createSessionId();

  ctx.nextState.pendingMinigameSessionId = sessionId;

  pushEvent(ctx, {
    type: "minigame_started",
    minigameKey: input.state.pendingMinigameKey,
    tileIndex: input.state.pendingMinigameTileIndex,
    sessionId,
    mode: getMinigameMode(input.state.pendingMinigameKey),
    requiresOpponent: minigameRequiresOpponent(input.state.pendingMinigameKey),
    opponentUserId: null,
    message: {
      title: "Reintento del minijuego",
      description:
        "Debes superar este minijuego para liberarte de la casilla.",
    },
  });

  return finalizeResult(ctx, true, null);
}

export function buildSkippedTurnPlan(
  input: BuildTurnPlanInput,
): BuildTurnPlanResult {
  const ctx = createContext(input);
  pushTurnStarted(ctx);

  ctx.nextState.skipTurns = Math.max(0, ctx.nextState.skipTurns - 1);

  pushEvent(ctx, {
    type: "tile_message",
    tileIndex: ctx.nextState.position,
    tileKind: getBoardTileByIndex(ctx.nextState.position).kind,
    message: {
      title: "Turno perdido",
      description:
        "No puedes lanzar el dado en este turno por un castigo pendiente.",
    },
    autoCloseMs: 1800,
  });

  pushEvent(ctx, {
    type: "turn_ended",
    nextPlayerUserId: input.nextPlayerUserId,
    endedBecause: "normal_resolution",
  });

  return finalizeResult(ctx, false, null);
}

type LandingChainInput = {
  startingTileIndex: number;
  initialReason: "dice" | "tile_effect" | "chaos_card";
  maxChainDepth: number;
  chaosCardIndex: number | null;
};

type LandingChainResult = {
  awaitingMinigameResult: boolean;
};

function resolveLandingChain(
  ctx: InternalContext,
  input: LandingChainInput,
): LandingChainResult {
  let currentTileIndex = input.startingTileIndex;
  let chainDepth = 0;
  let awaitingMinigameResult = false;

  while (chainDepth <= input.maxChainDepth) {
    const tile = getBoardTileByIndex(currentTileIndex);

    pushEvent(ctx, {
      type: "tile_landed",
      tileIndex: tile.index,
      tileKind: tile.kind,
      tileFamily: tile.family,
    });

    if (tile.kind === "finish") {
      break;
    }

    if (isTrapTile(tile) && ctx.nextState.shieldCharges > 0) {
      ctx.nextState.shieldCharges -= 1;

      pushEvent(ctx, {
        type: "status_applied",
        statusKind: "shield_consumed",
        value: 1,
        message: {
          title: "Escudo consumido",
          description:
            "Tu escudo bloqueó la trampa y evitó que se aplicara su efecto.",
        },
      });

      break;
    }

    const resolution = resolveTile(tile);

    if (resolution.effects.length === 0) {
      break;
    }

    const effect = resolution.effects[0];

    if (isNoEffect(effect)) {
      pushTileMessage(ctx, tile, effect.message);
      break;
    }

    if (isMovementEffect(effect)) {
      pushTileMessage(ctx, tile, effect.message);

      const movement =
        effect.type === "move_by"
          ? computeMoveBySteps(ctx.nextState.position, effect.steps)
          : computeMoveTo(ctx.nextState.position, effect.destination);

      pushEvent(ctx, {
        type: "piece_move",
        from: ctx.nextState.position,
        to: movement.to,
        reason: "tile_effect",
      });

      ctx.nextState.position = movement.to;
      currentTileIndex = movement.to;
      chainDepth += 1;
      continue;
    }

    if (isPersistentStatusEffect(effect)) {
      pushTileMessage(ctx, tile, effect.message);

      switch (effect.type) {
        case "grant_shield":
          ctx.nextState.shieldCharges += effect.shieldCharges;
          pushEvent(ctx, {
            type: "status_applied",
            statusKind: "shield_gained",
            value: effect.shieldCharges,
            message: effect.message,
          });
          break;

        case "grant_next_roll_bonus":
          ctx.nextState.nextRollBonus += effect.nextRollBonus;
          pushEvent(ctx, {
            type: "status_applied",
            statusKind: "next_roll_bonus_gained",
            value: effect.nextRollBonus,
            message: effect.message,
          });
          break;

        case "grant_skip_turns":
          ctx.nextState.skipTurns += effect.skipTurns;
          pushEvent(ctx, {
            type: "status_applied",
            statusKind: "skip_turns_gained",
            value: effect.skipTurns,
            message: effect.message,
          });
          break;

        case "grant_next_roll_max":
          ctx.nextState.nextRollMax =
            ctx.nextState.nextRollMax == null
              ? effect.nextRollMax
              : Math.min(ctx.nextState.nextRollMax, effect.nextRollMax);

          pushEvent(ctx, {
            type: "status_applied",
            statusKind: "next_roll_max_set",
            value: effect.nextRollMax,
            message: effect.message,
          });
          break;
      }

      break;
    }

    if (isChaosEffect(effect)) {
      pushTileMessage(ctx, tile, effect.message);

      const chaosCard = pickChaosCard(effect.deckId, input.chaosCardIndex);
      pushEvent(ctx, {
        type: "chaos_card_drawn",
        cardId: chaosCard.id,
        suit: chaosCard.suit,
        rank: chaosCard.rank,
        message: {
          title: chaosCard.title,
          description: chaosCard.description,
        },
      });

      const chaosHandled = applyChaosCard(ctx, chaosCard);
      if (chaosHandled.continueChain) {
        currentTileIndex = ctx.nextState.position;
        chainDepth += 1;
        continue;
      }

      break;
    }

    if (isMinigameEffect(effect)) {
      const sessionId = createSessionId();

      ctx.nextState.pendingMinigameKey = effect.minigameKey;
      ctx.nextState.pendingMinigameTileIndex = tile.index;
      ctx.nextState.pendingMinigameSessionId = sessionId;

      pushTileMessage(ctx, tile, effect.message);

      pushEvent(ctx, {
        type: "minigame_started",
        minigameKey: effect.minigameKey,
        tileIndex: tile.index,
        sessionId,
        mode: effect.mode,
        requiresOpponent: effect.requiresOpponent,
        opponentUserId: null,
        message: effect.message,
      });

      awaitingMinigameResult = true;
      break;
    }

    break;
  }

  if (chainDepth > input.maxChainDepth) {
    throw new Error(
      `Se alcanzó la profundidad máxima de cadena (${input.maxChainDepth}). Revisa el layout del tablero para evitar bucles infinitos.`,
    );
  }

  return { awaitingMinigameResult };
}

function applyChaosCard(
  ctx: InternalContext,
  card: ChaosCard,
): { continueChain: boolean } {
  if (card.effect.negative && ctx.nextState.shieldCharges > 0) {
    ctx.nextState.shieldCharges -= 1;

    pushEvent(ctx, {
      type: "status_applied",
      statusKind: "shield_consumed",
      value: 1,
      message: {
        title: "Escudo consumido",
        description:
          "Tu escudo bloqueó el efecto negativo de la carta del caos.",
      },
    });

    return { continueChain: false };
  }

  switch (card.effect.type) {
    case "move_by": {
      const movement = computeMoveBySteps(ctx.nextState.position, card.effect.steps);

      pushEvent(ctx, {
        type: "piece_move",
        from: ctx.nextState.position,
        to: movement.to,
        reason: "chaos_card",
      });

      ctx.nextState.position = movement.to;
      return { continueChain: true };
    }

    case "grant_shield":
      ctx.nextState.shieldCharges += card.effect.shieldCharges;
      pushEvent(ctx, {
        type: "status_applied",
        statusKind: "shield_gained",
        value: card.effect.shieldCharges,
        message: {
          title: card.title,
          description: card.description,
        },
      });
      return { continueChain: false };

    case "grant_skip_turns":
      ctx.nextState.skipTurns += card.effect.skipTurns;
      pushEvent(ctx, {
        type: "status_applied",
        statusKind: "skip_turns_gained",
        value: card.effect.skipTurns,
        message: {
          title: card.title,
          description: card.description,
        },
      });
      return { continueChain: false };

    case "grant_next_roll_bonus":
      ctx.nextState.nextRollBonus += card.effect.nextRollBonus;
      pushEvent(ctx, {
        type: "status_applied",
        statusKind: "next_roll_bonus_gained",
        value: card.effect.nextRollBonus,
        message: {
          title: card.title,
          description: card.description,
        },
      });
      return { continueChain: false };

    case "grant_next_roll_max":
      ctx.nextState.nextRollMax =
        ctx.nextState.nextRollMax == null
          ? card.effect.nextRollMax
          : Math.min(ctx.nextState.nextRollMax, card.effect.nextRollMax);

      pushEvent(ctx, {
        type: "status_applied",
        statusKind: "next_roll_max_set",
        value: card.effect.nextRollMax,
        message: {
          title: card.title,
          description: card.description,
        },
      });
      return { continueChain: false };
  }
}

function computeMoveBySteps(from: number, steps: number): MoveComputation {
  if (steps >= 0) {
    const tentative = from + steps;

    if (tentative <= BOARD_FINISH_INDEX) {
      return {
        to: tentative,
        bounced: false,
      };
    }

    const overflow = tentative - BOARD_FINISH_INDEX;
    return {
      to: BOARD_FINISH_INDEX - overflow,
      bounced: true,
    };
  }

  return {
    to: Math.max(BOARD_START_INDEX, from + steps),
    bounced: false,
  };
}

function computeMoveTo(_from: number, destination: number): MoveComputation {
  return {
    to: clampBoardIndex(destination),
    bounced: false,
  };
}

function clampBoardIndex(index: number): number {
  return Math.max(BOARD_START_INDEX, Math.min(BOARD_FINISH_INDEX, index));
}

function pickChaosCard(
  deckId: "goblin_chaos_v1",
  requestedIndex: number | null,
): ChaosCard {
  if (deckId !== "goblin_chaos_v1") {
    throw new Error(`Deck de caos no soportado: ${deckId}`);
  }

  const safeIndex =
    requestedIndex == null
      ? 0
      : Math.abs(Math.trunc(requestedIndex)) % CHAOS_DECK_V1.length;

  return CHAOS_DECK_V1[safeIndex];
}

function createContext(input: BuildTurnPlanInput): InternalContext {
  return {
    input,
    nextState: { ...input.state },
    events: [],
    order: 0,
  };
}

function pushTurnStarted(ctx: InternalContext): void {
  pushEvent(ctx, {
    type: "turn_started",
    turnNumber: ctx.input.turnNumber,
  });
}

function pushTileMessage(
  ctx: InternalContext,
  tile: BoardTile,
  message: TurnMessage,
): void {
  pushEvent(ctx, {
    type: "tile_message",
    tileIndex: tile.index,
    tileKind: tile.kind,
    message,
    autoCloseMs: 1800,
  });
}

function pushEvent(
  ctx: InternalContext,
  event: Omit<TurnEvent, keyof ReturnType<typeof createTurnEventBase>>,
): void {
  const type = event.type;
  const base = createTurnEventBase(
    ctx.input.turnNumber,
    ctx.order,
    ctx.input.actingUserId,
    type,
  );

  ctx.events.push({
    ...base,
    ...event,
  } as TurnEvent);

  ctx.order += 1;
}

function finalizeResult(
  ctx: InternalContext,
  awaitingMinigameResult: boolean,
  winnerUserId: string | null,
): BuildTurnPlanResult {
  return {
    plan: {
      matchId: ctx.input.matchId,
      actingUserId: ctx.input.actingUserId,
      turnNumber: ctx.input.turnNumber,
      events: ctx.events,
    },
    nextState: ctx.nextState,
    awaitingMinigameResult,
    winnerUserId,
  };
}

function createSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `mg-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getMinigameMode(minigameKey: MinigameKey): "solo" | "versus" {
  switch (minigameKey) {
    case "memory_relics":
      return "versus";
    case "goblin_card_war":
      return "versus";
    case "swamp_path":
    case "totem_ritual":
    case "shaman_runes":
      return "solo";
  }
}

function minigameRequiresOpponent(minigameKey: MinigameKey): boolean {
  return minigameKey === "memory_relics";
}