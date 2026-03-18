import type { TileHandler } from "../types";

export const normalTileHandler: TileHandler = (context) => {
  const { tile, triggeredByChain } = context;

  return {
    tileType: tile.type,
    tileFamily: tile.family,
    title: tile.label,
    message: triggeredByChain
      ? `Después del movimiento encadenado, terminaste en una casilla normal: ${tile.label}. No ocurre ningún efecto adicional.`
      : `Caíste en una casilla normal: ${tile.label}. No ocurre ningún efecto adicional.`,
    tone: "neutral",
    implementationStatus: "ready",
    effects: [
      {
        kind: "none",
        reason: "Las casillas normales no aplican efectos especiales.",
      },
    ],
  };
};