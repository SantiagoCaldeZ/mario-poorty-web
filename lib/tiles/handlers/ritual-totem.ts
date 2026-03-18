import type { TileHandler } from "../types";

export const ritualTotemTileHandler: TileHandler = (context) => {
  const { tile, triggeredByPendingMinigameRetry } = context;

  return {
    tileType: tile.type,
    tileFamily: tile.family,
    title: tile.label,
    message: triggeredByPendingMinigameRetry
      ? `Sigues atrapado en ${tile.label}. Debes volver a completar el Ritual del Tótem para liberarte.`
      : `Caíste en ${tile.label}. Debes completar el Ritual del Tótem para superar esta casilla.`,
    tone: "challenge",
    implementationStatus: "placeholder",
    effects: [
      {
        kind: "start_minigame",
        minigameType: "ritual_totem",
        reason:
          "Ritual del Tótem: si fallas, el reto queda pendiente y no podrás lanzar el dado hasta superarlo.",
        blocksTurnFlowOnLoss: true,
      },
    ],
  };
};