import { getTileForPosition } from "@/lib/board";
import type { BoardTile, TileFamily } from "./types";
import type { TileLandingPreview } from "./types";

export const TILE_FAMILY_LABELS: Record<TileFamily, string> = {
  start: "inicio",
  normal: "normal",
  bonus: "bonus",
  trap: "trampa",
  special_move: "movimiento especial",
  minigame: "minijuego",
  finish: "meta",
};

export function getTileFamilyLabel(family: TileFamily): string {
  return TILE_FAMILY_LABELS[family] ?? "desconocida";
}

export function buildTilePreviewText(tile: BoardTile): string {
  const familyLabel = getTileFamilyLabel(tile.family);

  if (tile.type === "start") {
    return "Casilla detectada: inicio.";
  }

  if (tile.type === "finish") {
    return "Casilla detectada: meta.";
  }

  return `Casilla detectada: ${familyLabel} (${tile.label}).`;
}

export function getTileLandingPreview(
  matchId: string,
  boardPosition: number
): TileLandingPreview {
  const tile = getTileForPosition(matchId, boardPosition);

  if (!tile) {
    return {
      tile: null,
      familyLabel: "desconocida",
      previewText: "No se pudo detectar la casilla en la que cayó el jugador.",
    };
  }

  return {
    tile,
    familyLabel: getTileFamilyLabel(tile.family),
    previewText: buildTilePreviewText(tile),
  };
}