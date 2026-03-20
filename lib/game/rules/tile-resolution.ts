import type { BoardTile, TileKind } from "../board/tile-types";
import {
  isBonusTile,
  isChaosTile,
  isMinigameTile,
  isMovementTile,
  isTrapTile,
} from "../board/tile-types";
import type { TileResolutionResult, GameEffect } from "./effect-types";
import {
  createEffectSource,
  createMessage,
} from "./effect-types";

export type ResolveTileOptions = {
  /**
   * Si más adelante necesitas personalizar el deck de caos o
   * la selección de portal por contexto, este objeto te deja
   * extender la resolución sin romper la firma principal.
   */
  preferredPortalDestination?: number | null;
};

export function resolveTile(
  tile: BoardTile,
  _options: ResolveTileOptions = {},
): TileResolutionResult {
  const effects: GameEffect[] = [];
  const source = createEffectSource(tile.index, tile.kind);

  switch (tile.kind) {
    case "start":
      effects.push({
        type: "none",
        source,
        message: createMessage(tile.label, tile.description),
      });
      break;

    case "finish":
      effects.push({
        type: "none",
        source,
        message: createMessage(tile.label, tile.description),
      });
      break;

    case "normal":
      effects.push({
        type: "none",
        source,
        message: createMessage(tile.label, tile.description),
      });
      break;

    case "bonus_loot":
      effects.push({
        type: "move_by",
        source,
        steps: tile.payload.steps,
        message: createMessage(
          tile.label,
          `Avanzas ${tile.payload.steps} casillas inmediatamente.`,
        ),
      });
      break;

    case "bonus_blessing":
      effects.push({
        type: "grant_shield",
        source,
        shieldCharges: tile.payload.shieldCharges,
        message: createMessage(
          tile.label,
          "Obtienes un escudo contra la próxima trampa o efecto negativo.",
        ),
      });
      break;

    case "bonus_favorable_die":
      effects.push({
        type: "grant_next_roll_bonus",
        source,
        nextRollBonus: tile.payload.nextRollBonus,
        message: createMessage(
          tile.label,
          `En tu próximo turno, tu dado tendrá +${tile.payload.nextRollBonus}.`,
        ),
      });
      break;

    case "trap_mud":
      effects.push({
        type: "move_by",
        source,
        steps: tile.payload.steps,
        message: createMessage(
          tile.label,
          `Retrocedes ${Math.abs(tile.payload.steps)} casillas inmediatamente.`,
        ),
      });
      break;

    case "trap_curse":
      effects.push({
        type: "grant_skip_turns",
        source,
        skipTurns: tile.payload.skipTurns,
        message: createMessage(
          tile.label,
          "Perderás tu próximo turno.",
        ),
      });
      break;

    case "trap_weakened_die":
      effects.push({
        type: "grant_next_roll_max",
        source,
        nextRollMax: tile.payload.nextRollMax,
        message: createMessage(
          tile.label,
          `En tu próximo turno, tu dado tendrá un máximo de ${tile.payload.nextRollMax}.`,
        ),
      });
      break;

    case "movement_mushroom_portal":
      effects.push({
        type: "move_to",
        source,
        destination: tile.payload.destination,
        message: createMessage(
          tile.label,
          `El portal te transporta a la casilla ${tile.payload.destination}.`,
        ),
      });
      break;

    case "movement_root_shortcut":
      effects.push({
        type: "move_to",
        source,
        destination: tile.payload.destination,
        message: createMessage(
          tile.label,
          `El atajo de raíces te lleva a la casilla ${tile.payload.destination}.`,
        ),
      });
      break;

    case "chaos_deck":
      effects.push({
        type: "draw_chaos_card",
        source,
        deckId: tile.payload.deckId,
        message: createMessage(
          tile.label,
          "Robas una carta del Mazo del Caos y aplicas su efecto inmediato.",
        ),
      });
      break;

    case "memory_relics":
      effects.push({
        type: "start_minigame",
        source,
        minigameKey: tile.payload.minigameKey,
        requiresOpponent: tile.payload.requiresOpponent,
        mode: tile.payload.mode,
        message: createMessage(
          tile.label,
          "Debes superar el minijuego para considerar esta casilla superada.",
        ),
      });
      break;

    case "goblin_card_war":
      effects.push({
        type: "start_minigame",
        source,
        minigameKey: tile.payload.minigameKey,
        requiresOpponent: tile.payload.requiresOpponent,
        mode: tile.payload.mode,
        message: createMessage(
          tile.label,
          "Se inicia una Guerra Goblin de Cartas.",
        ),
      });
      break;

    case "swamp_path":
      effects.push({
        type: "start_minigame",
        source,
        minigameKey: tile.payload.minigameKey,
        requiresOpponent: tile.payload.requiresOpponent,
        mode: tile.payload.mode,
        message: createMessage(
          tile.label,
          "Debes memorizar y superar la ruta del pantano.",
        ),
      });
      break;

    case "totem_ritual":
      effects.push({
        type: "start_minigame",
        source,
        minigameKey: tile.payload.minigameKey,
        requiresOpponent: tile.payload.requiresOpponent,
        mode: tile.payload.mode,
        message: createMessage(
          tile.label,
          "Debes completar el ritual del tótem para liberarte.",
        ),
      });
      break;

    case "shaman_runes":
      effects.push({
        type: "start_minigame",
        source,
        minigameKey: tile.payload.minigameKey,
        requiresOpponent: tile.payload.requiresOpponent,
        mode: tile.payload.mode,
        message: createMessage(
          tile.label,
          "Debes repetir correctamente la secuencia de runas.",
        ),
      });
      break;

    default: {
      const exhaustiveCheck: never = tile;
      throw new Error(
        `No existe una resolución implementada para la casilla ${(exhaustiveCheck as BoardTile).kind}.`,
      );
    }
  }

  return { effects };
}

export function tileProducesImmediateMovement(tile: BoardTile): boolean {
  return (
    tile.kind === "bonus_loot" ||
    tile.kind === "trap_mud" ||
    tile.kind === "movement_mushroom_portal" ||
    tile.kind === "movement_root_shortcut"
  );
}

export function tileStartsMinigame(tile: BoardTile): boolean {
  return isMinigameTile(tile);
}

export function tileDrawsChaosCard(tile: BoardTile): boolean {
  return isChaosTile(tile);
}

export function isNegativeTileKind(tileKind: TileKind): boolean {
  return (
    tileKind === "trap_mud" ||
    tileKind === "trap_curse" ||
    tileKind === "trap_weakened_die" ||
    tileKind === "chaos_deck"
  );
}

export function isNegativeTile(tile: BoardTile): boolean {
  return isNegativeTileKind(tile.kind);
}

export function getTileResolutionTitle(tile: BoardTile): string {
  return tile.label;
}

export function getTileResolutionDescription(tile: BoardTile): string {
  return tile.description;
}

export function isPureInformationalTile(tile: BoardTile): boolean {
  return tile.kind === "start" || tile.kind === "finish" || tile.kind === "normal";
}

export function isSpecialNonMinigameTile(tile: BoardTile): boolean {
  return isBonusTile(tile) || isTrapTile(tile) || isMovementTile(tile) || isChaosTile(tile);
}