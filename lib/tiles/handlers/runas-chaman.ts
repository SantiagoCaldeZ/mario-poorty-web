import type { TileHandler } from "../types";

export const runasChamanTileHandler: TileHandler = (context) => {
  const { tile, triggeredByPendingMinigameRetry } = context;

  return {
    tileType: tile.type,
    tileFamily: tile.family,
    title: tile.label,
    message: triggeredByPendingMinigameRetry
      ? `Sigues atrapado en ${tile.label}. Debes volver a resolver las Runas del Chamán para liberarte.`
      : `Caíste en ${tile.label}. Debes resolver las Runas del Chamán para considerar esta casilla como superada.`,
    tone: "challenge",
    implementationStatus: "placeholder",
    effects: [
      {
        kind: "start_minigame",
        minigameType: "runas_chaman",
        reason:
          "Runas del Chamán: si pierdes, el reto queda pendiente y en tu próximo turno no lanzarás el dado.",
        blocksTurnFlowOnLoss: true,
      },
    ],
  };
};