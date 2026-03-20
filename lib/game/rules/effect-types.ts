import type {
  MinigameKey,
  TileKind,
} from "../board/tile-types";

export type EffectSource = {
  tileIndex: number;
  tileKind: TileKind;
};

export type EffectMessage = {
  title: string;
  description: string;
};

export type NoEffect = {
  type: "none";
  source: EffectSource;
  message?: EffectMessage;
};

export type MoveByEffect = {
  type: "move_by";
  source: EffectSource;
  steps: number;
  message: EffectMessage;
};

export type MoveToEffect = {
  type: "move_to";
  source: EffectSource;
  destination: number;
  message: EffectMessage;
};

export type GrantShieldEffect = {
  type: "grant_shield";
  source: EffectSource;
  shieldCharges: number;
  message: EffectMessage;
};

export type GrantNextRollBonusEffect = {
  type: "grant_next_roll_bonus";
  source: EffectSource;
  nextRollBonus: number;
  message: EffectMessage;
};

export type GrantSkipTurnsEffect = {
  type: "grant_skip_turns";
  source: EffectSource;
  skipTurns: number;
  message: EffectMessage;
};

export type GrantNextRollMaxEffect = {
  type: "grant_next_roll_max";
  source: EffectSource;
  nextRollMax: number;
  message: EffectMessage;
};

export type DrawChaosCardEffect = {
  type: "draw_chaos_card";
  source: EffectSource;
  deckId: "goblin_chaos_v1";
  message: EffectMessage;
};

export type StartMinigameEffect = {
  type: "start_minigame";
  source: EffectSource;
  minigameKey: MinigameKey;
  requiresOpponent: boolean;
  mode: "solo" | "versus";
  message: EffectMessage;
};

export type GameEffect =
  | NoEffect
  | MoveByEffect
  | MoveToEffect
  | GrantShieldEffect
  | GrantNextRollBonusEffect
  | GrantSkipTurnsEffect
  | GrantNextRollMaxEffect
  | DrawChaosCardEffect
  | StartMinigameEffect;

export type TileResolutionResult = {
  effects: GameEffect[];
};

export function createEffectSource(
  tileIndex: number,
  tileKind: TileKind,
): EffectSource {
  return {
    tileIndex,
    tileKind,
  };
}

export function createMessage(
  title: string,
  description: string,
): EffectMessage {
  return {
    title,
    description,
  };
}

export function isMovementEffect(
  effect: GameEffect,
): effect is MoveByEffect | MoveToEffect {
  return effect.type === "move_by" || effect.type === "move_to";
}

export function isPersistentStatusEffect(
  effect: GameEffect,
): effect is
  | GrantShieldEffect
  | GrantNextRollBonusEffect
  | GrantSkipTurnsEffect
  | GrantNextRollMaxEffect {
  return (
    effect.type === "grant_shield" ||
    effect.type === "grant_next_roll_bonus" ||
    effect.type === "grant_skip_turns" ||
    effect.type === "grant_next_roll_max"
  );
}

export function isMinigameEffect(
  effect: GameEffect,
): effect is StartMinigameEffect {
  return effect.type === "start_minigame";
}

export function isChaosEffect(
  effect: GameEffect,
): effect is DrawChaosCardEffect {
  return effect.type === "draw_chaos_card";
}

export function isNoEffect(effect: GameEffect): effect is NoEffect {
  return effect.type === "none";
}