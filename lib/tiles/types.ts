import type { BoardTile, TileFamily, TileType } from "@/lib/board";

export type { BoardTile, TileFamily, TileType };

/**
 * Familias realmente accionables desde el sistema de casillas.
 * "start" y "finish" existen en el tablero, pero no requieren handler propio.
 */
export type ActionableTileFamily = Exclude<TileFamily, "start" | "finish">;

/**
 * Tipos realmente accionables desde el sistema de casillas.
 * "start" y "finish" quedan fuera del registry.
 */
export const ACTIONABLE_TILE_TYPES = [
  "normal",
  "bonus_botin",
  "bonus_bendicion",
  "bonus_dado_favorable",
  "trampa_lodo",
  "trampa_maldicion",
  "trampa_dado_debilitado",
  "portal_hongos",
  "atajo_raices",
  "memory_reliquias",
  "guerra_goblin_cartas",
  "ruta_pantano",
  "ritual_totem",
  "runas_chaman",
  "mazo_caos",
] as const;

export type ActionableTileType = (typeof ACTIONABLE_TILE_TYPES)[number];

export const BONUS_TILE_TYPES = [
  "bonus_botin",
  "bonus_bendicion",
  "bonus_dado_favorable",
] as const;

export type BonusTileType = (typeof BONUS_TILE_TYPES)[number];

export const TRAP_TILE_TYPES = [
  "trampa_lodo",
  "trampa_maldicion",
  "trampa_dado_debilitado",
] as const;

export type TrapTileType = (typeof TRAP_TILE_TYPES)[number];

export const SPECIAL_MOVE_TILE_TYPES = [
  "portal_hongos",
  "atajo_raices",
] as const;

export type SpecialMoveTileType = (typeof SPECIAL_MOVE_TILE_TYPES)[number];

export const MINIGAME_TILE_TYPES = [
  "memory_reliquias",
  "guerra_goblin_cartas",
  "ruta_pantano",
  "ritual_totem",
  "runas_chaman",
  "mazo_caos",
] as const;

export type MinigameTileType = (typeof MINIGAME_TILE_TYPES)[number];

/**
 * Casillas cuyo efecto puede mover al jugador a otra posición
 * y por eso potencialmente disparar una nueva resolución.
 */
export const CHAINING_TILE_TYPES = [
  "bonus_botin",
  "trampa_lodo",
  "portal_hongos",
  "atajo_raices",
] as const;

export type ChainingTileType = (typeof CHAINING_TILE_TYPES)[number];

export function isActionableTileType(tileType: TileType): tileType is ActionableTileType {
  return (ACTIONABLE_TILE_TYPES as readonly string[]).includes(tileType);
}

export function isBonusTileType(tileType: TileType): tileType is BonusTileType {
  return (BONUS_TILE_TYPES as readonly string[]).includes(tileType);
}

export function isTrapTileType(tileType: TileType): tileType is TrapTileType {
  return (TRAP_TILE_TYPES as readonly string[]).includes(tileType);
}

export function isSpecialMoveTileType(tileType: TileType): tileType is SpecialMoveTileType {
  return (SPECIAL_MOVE_TILE_TYPES as readonly string[]).includes(tileType);
}

export function isMinigameTileType(tileType: TileType): tileType is MinigameTileType {
  return (MINIGAME_TILE_TYPES as readonly string[]).includes(tileType);
}

export function isChainingTileType(tileType: TileType): tileType is ChainingTileType {
  return (CHAINING_TILE_TYPES as readonly string[]).includes(tileType);
}

export type TileLandingPreview = {
  tile: BoardTile | null;
  familyLabel: string;
  previewText: string;
};

export type TileEventTone = "neutral" | "positive" | "negative" | "challenge";

/**
 * Efectos que un handler puede devolver.
 * No significa que todos se apliquen ya mismo en backend:
 * esto deja la arquitectura lista para engine.ts y para persistencia futura.
 */
export type TileEffect =
  | {
      kind: "none";
      reason?: string;
    }
  | {
      kind: "move_by";
      amount: number;
      reason: string;
      canChain: true;
    }
  | {
      kind: "move_to";
      position: number;
      reason: string;
      canChain: true;
    }
  | {
      kind: "grant_shield";
      shieldKey: "bendicion_chaman";
      charges: number;
      reason: string;
    }
  | {
      kind: "grant_next_roll_bonus";
      amount: number;
      reason: string;
    }
  | {
      kind: "limit_next_roll_max";
      max: number;
      reason: string;
    }
  | {
      kind: "skip_next_turn";
      turns: number;
      reason: string;
    }
  | {
      kind: "start_minigame";
      minigameType: MinigameTileType;
      reason: string;
      blocksTurnFlowOnLoss: true;
    };

export type TileHandlerContext = {
  matchId: string;
  playerId: string;
  tile: BoardTile;
  landedPosition: number;
  previousPosition: number;
  rolledValue: number | null;
  triggeredByChain: boolean;
  triggeredByPendingMinigameRetry: boolean;
};

export type TileHandlerResult = {
  tileType: TileType;
  tileFamily: TileFamily;
  title: string;
  message: string;
  tone: TileEventTone;
  effects: TileEffect[];
  implementationStatus: "placeholder" | "ready";
};

export type TileHandler = (context: TileHandlerContext) => TileHandlerResult;

export type TileRegistryEntry = {
  type: ActionableTileType;
  family: ActionableTileFamily;
  title: string;
  handler: TileHandler;

  /**
   * Si esta casilla puede mandar al jugador a otra casilla
   * y por lo tanto potencialmente disparar una nueva resolución.
   */
  canChainResolution: boolean;

  /**
   * Si esta casilla inicia un minijuego de los que se deben superar
   * para quedar libre y volver a tirar en el futuro.
   */
  createsPendingMinigame: boolean;

  /**
   * Si al perder aquí el jugador queda bloqueado sin tirar dado
   * hasta superar el minijuego.
   */
  blocksTurnFlowOnLoss: boolean;
};

export type TileRegistry = Record<ActionableTileType, TileRegistryEntry>;
export type TileHandlerRegistry = Record<ActionableTileType, TileHandler>;