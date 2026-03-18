import type { TileHandler } from "../types";

export const trampaDadoDebilitadoTileHandler: TileHandler = (context) => {
  const { tile, triggeredByChain } = context;

  return {
    tileType: tile.type,
    tileFamily: tile.family,
    title: tile.label,
    message: triggeredByChain
      ? `El movimiento encadenado te llevó a ${tile.label}. En tu próximo turno, tu dado quedará limitado a un máximo de 3.`
      : `Caíste en ${tile.label}. En tu próximo turno, tu dado quedará limitado a un máximo de 3.`,
    tone: "negative",
    implementationStatus: "ready",
    effects: [
      {
        kind: "limit_next_roll_max",
        max: 3,
        reason: "Dado Debilitado: el próximo lanzamiento tendrá un máximo de 3.",
      },
    ],
  };
};