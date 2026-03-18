import type { TileHandler } from "../types";

export const bonusDadoFavorableTileHandler: TileHandler = (context) => {
  const { tile, triggeredByChain } = context;

  return {
    tileType: tile.type,
    tileFamily: tile.family,
    title: tile.label,
    message: triggeredByChain
      ? `El movimiento encadenado te llevó a ${tile.label}. Tu próximo dado recibirá un bono de +1.`
      : `Caíste en ${tile.label}. Tu próximo dado recibirá un bono de +1.`,
    tone: "positive",
    implementationStatus: "ready",
    effects: [
      {
        kind: "grant_next_roll_bonus",
        amount: 1,
        reason: "Dado Favorable: el próximo lanzamiento recibe +1.",
      },
    ],
  };
};