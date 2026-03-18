import type { TileHandler } from "../types";

export const bonusBendicionTileHandler: TileHandler = (context) => {
  const { tile, triggeredByChain } = context;

  return {
    tileType: tile.type,
    tileFamily: tile.family,
    title: tile.label,
    message: triggeredByChain
      ? `El movimiento encadenado te llevó a ${tile.label}. Obtienes una bendición protectora contra el próximo efecto negativo.`
      : `Caíste en ${tile.label}. Obtienes una bendición protectora contra el próximo efecto negativo.`,
    tone: "positive",
    implementationStatus: "ready",
    effects: [
      {
        kind: "grant_shield",
        shieldKey: "bendicion_chaman",
        charges: 1,
        reason: "Bendición del Chamán: protege contra el próximo efecto negativo.",
      },
    ],
  };
};