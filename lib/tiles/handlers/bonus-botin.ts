import type { TileHandler } from "../types";

export const bonusBotinTileHandler: TileHandler = (context) => {
  const { tile, triggeredByChain } = context;

  return {
    tileType: tile.type,
    tileFamily: tile.family,
    title: tile.label,
    message: triggeredByChain
      ? `El movimiento encadenado te llevó a ${tile.label}. Este bonus te impulsa 2 casillas hacia adelante.`
      : `Caíste en ${tile.label}. Este bonus te impulsa 2 casillas hacia adelante.`,
    tone: "positive",
    implementationStatus: "ready",
    effects: [
      {
        kind: "move_by",
        amount: 2,
        reason: "Botín Goblin: avanzas 2 casillas.",
        canChain: true,
      },
    ],
  };
};