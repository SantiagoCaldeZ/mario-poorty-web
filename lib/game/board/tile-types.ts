export const BOARD_START_INDEX = 0 as const;
export const BOARD_FINISH_INDEX = 30 as const;

export type TileFamily =
  | "start"
  | "normal"
  | "bonus"
  | "trap"
  | "movement"
  | "chaos"
  | "minigame"
  | "finish";

export type BonusTileKind =
  | "bonus_loot"
  | "bonus_blessing"
  | "bonus_favorable_die";

export type TrapTileKind =
  | "trap_mud"
  | "trap_curse"
  | "trap_weakened_die";

export type MovementTileKind =
  | "movement_mushroom_portal"
  | "movement_root_shortcut";

export type ChaosTileKind = "chaos_deck";

export type MinigameKey =
  | "memory_relics"
  | "goblin_card_war"
  | "swamp_path"
  | "totem_ritual"
  | "shaman_runes";

export type MinigameTileKind = MinigameKey;

export type TileKind =
  | "start"
  | "normal"
  | BonusTileKind
  | TrapTileKind
  | MovementTileKind
  | ChaosTileKind
  | MinigameTileKind
  | "finish";

export type TileEffectCategory =
  | "none"
  | "move_by"
  | "move_to"
  | "grant_shield"
  | "grant_next_roll_bonus"
  | "grant_skip_turns"
  | "grant_next_roll_max"
  | "draw_chaos_card"
  | "start_minigame";

export type TileTheme =
  | "neutral"
  | "loot"
  | "blessing"
  | "favorable_die"
  | "mud"
  | "curse"
  | "weakened_die"
  | "portal"
  | "roots"
  | "chaos"
  | "memory"
  | "cards"
  | "path"
  | "ritual"
  | "runes"
  | "finish";

export type BaseTile = {
  index: number;
  family: TileFamily;
  kind: TileKind;
  label: string;
  shortLabel?: string;
  description: string;
  theme: TileTheme;
  assetKey?: string | null;
  chainable: boolean;
};

export type StartTile = BaseTile & {
  family: "start";
  kind: "start";
  chainable: false;
};

export type FinishTile = BaseTile & {
  family: "finish";
  kind: "finish";
  chainable: false;
};

export type NormalTile = BaseTile & {
  family: "normal";
  kind: "normal";
  chainable: false;
};

export type BonusLootTile = BaseTile & {
  family: "bonus";
  kind: "bonus_loot";
  payload: {
    steps: 2;
  };
  chainable: true;
};

export type BonusBlessingTile = BaseTile & {
  family: "bonus";
  kind: "bonus_blessing";
  payload: {
    shieldCharges: 1;
  };
  chainable: false;
};

export type BonusFavorableDieTile = BaseTile & {
  family: "bonus";
  kind: "bonus_favorable_die";
  payload: {
    nextRollBonus: 1;
  };
  chainable: false;
};

export type TrapMudTile = BaseTile & {
  family: "trap";
  kind: "trap_mud";
  payload: {
    steps: -2;
  };
  chainable: true;
};

export type TrapCurseTile = BaseTile & {
  family: "trap";
  kind: "trap_curse";
  payload: {
    skipTurns: 1;
  };
  chainable: false;
};

export type TrapWeakenedDieTile = BaseTile & {
  family: "trap";
  kind: "trap_weakened_die";
  payload: {
    nextRollMax: 3;
  };
  chainable: false;
};

export type MovementMushroomPortalTile = BaseTile & {
  family: "movement";
  kind: "movement_mushroom_portal";
  payload: {
    destination: number;
    portalGroup?: string;
  };
  chainable: true;
};

export type MovementRootShortcutTile = BaseTile & {
  family: "movement";
  kind: "movement_root_shortcut";
  payload: {
    destination: number;
  };
  chainable: true;
};

export type ChaosDeckTile = BaseTile & {
  family: "chaos";
  kind: "chaos_deck";
  payload: {
    deckId: "goblin_chaos_v1";
  };
  chainable: false;
};

export type MemoryRelicsTile = BaseTile & {
  family: "minigame";
  kind: "memory_relics";
  payload: {
    minigameKey: "memory_relics";
    mode: "versus";
    requiresOpponent: true;
  };
  chainable: false;
};

export type GoblinCardWarTile = BaseTile & {
  family: "minigame";
  kind: "goblin_card_war";
  payload: {
    minigameKey: "goblin_card_war";
    mode: "versus";
    requiresOpponent: false;
  };
  chainable: false;
};

export type SwampPathTile = BaseTile & {
  family: "minigame";
  kind: "swamp_path";
  payload: {
    minigameKey: "swamp_path";
    mode: "solo";
    requiresOpponent: false;
  };
  chainable: false;
};

export type TotemRitualTile = BaseTile & {
  family: "minigame";
  kind: "totem_ritual";
  payload: {
    minigameKey: "totem_ritual";
    mode: "solo";
    requiresOpponent: false;
  };
  chainable: false;
};

export type ShamanRunesTile = BaseTile & {
  family: "minigame";
  kind: "shaman_runes";
  payload: {
    minigameKey: "shaman_runes";
    mode: "solo";
    requiresOpponent: false;
  };
  chainable: false;
};

export type BoardTile =
  | StartTile
  | FinishTile
  | NormalTile
  | BonusLootTile
  | BonusBlessingTile
  | BonusFavorableDieTile
  | TrapMudTile
  | TrapCurseTile
  | TrapWeakenedDieTile
  | MovementMushroomPortalTile
  | MovementRootShortcutTile
  | ChaosDeckTile
  | MemoryRelicsTile
  | GoblinCardWarTile
  | SwampPathTile
  | TotemRitualTile
  | ShamanRunesTile;

export const TILE_FAMILIES = [
  "start",
  "normal",
  "bonus",
  "trap",
  "movement",
  "chaos",
  "minigame",
  "finish",
] as const satisfies readonly TileFamily[];

export const BONUS_TILE_KINDS = [
  "bonus_loot",
  "bonus_blessing",
  "bonus_favorable_die",
] as const satisfies readonly BonusTileKind[];

export const TRAP_TILE_KINDS = [
  "trap_mud",
  "trap_curse",
  "trap_weakened_die",
] as const satisfies readonly TrapTileKind[];

export const MOVEMENT_TILE_KINDS = [
  "movement_mushroom_portal",
  "movement_root_shortcut",
] as const satisfies readonly MovementTileKind[];

export const CHAOS_TILE_KINDS = [
  "chaos_deck",
] as const satisfies readonly ChaosTileKind[];

export const MINIGAME_KEYS = [
  "memory_relics",
  "goblin_card_war",
  "swamp_path",
  "totem_ritual",
  "shaman_runes",
] as const satisfies readonly MinigameKey[];

export const MINIGAME_TILE_KINDS = MINIGAME_KEYS;

export const CHAINABLE_TILE_KINDS: ReadonlySet<TileKind> = new Set([
  "bonus_loot",
  "trap_mud",
  "movement_mushroom_portal",
  "movement_root_shortcut",
]);

export function isMinigameKey(value: string): value is MinigameKey {
  return (MINIGAME_KEYS as readonly string[]).includes(value);
}

export function isMinigameTile(tile: BoardTile): tile is Extract<BoardTile, { family: "minigame" }> {
  return tile.family === "minigame";
}

export function isChainableTile(tile: BoardTile): boolean {
  return tile.chainable;
}

export function isMovementTile(tile: BoardTile): tile is Extract<BoardTile, { family: "movement" }> {
  return tile.family === "movement";
}

export function isBonusTile(tile: BoardTile): tile is Extract<BoardTile, { family: "bonus" }> {
  return tile.family === "bonus";
}

export function isTrapTile(tile: BoardTile): tile is Extract<BoardTile, { family: "trap" }> {
  return tile.family === "trap";
}

export function isChaosTile(tile: BoardTile): tile is Extract<BoardTile, { family: "chaos" }> {
  return tile.family === "chaos";
}