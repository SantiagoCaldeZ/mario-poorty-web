import type { TileHandler } from "../types";

const ATAJO_RAICES_ADVANCE = 4;

export const atajoRaicesTileHandler: TileHandler = (context) => {
  const { tile, triggeredByChain } = context;

  return {
    tileType: tile.type,
    tileFamily: tile.family,
    title: tile.label,
    message: triggeredByChain
      ? `El movimiento encadenado te llevó a ${tile.label}. Las raíces te levantan sobre el pantano y avanzas ${ATAJO_RAICES_ADVANCE} casillas.`
      : `Caíste en ${tile.label}. Las raíces te levantan sobre el pantano y avanzas ${ATAJO_RAICES_ADVANCE} casillas.`,
    tone: "positive",
    implementationStatus: "ready",
    effects: [
      {
        kind: "move_by",
        amount: ATAJO_RAICES_ADVANCE,
        reason: `Atajo de Raíces: avanzas ${ATAJO_RAICES_ADVANCE} casillas por el atajo.`,
        canChain: true,
      },
    ],
  };
};