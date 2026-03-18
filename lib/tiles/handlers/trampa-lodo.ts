import type { TileHandler } from "../types";

export const trampaLodoTileHandler: TileHandler = (context) => {
  const { tile, triggeredByChain } = context;

  return {
    tileType: tile.type,
    tileFamily: tile.family,
    title: tile.label,
    message: triggeredByChain
      ? `El movimiento encadenado te llevó a ${tile.label}. El lodo te hace retroceder 2 casillas.`
      : `Caíste en ${tile.label}. El lodo te hace retroceder 2 casillas.`,
    tone: "negative",
    implementationStatus: "ready",
    effects: [
      {
        kind: "move_by",
        amount: -2,
        reason: "Lodo Pegajoso: retrocedes 2 casillas.",
        canChain: true,
      },
    ],
  };
};