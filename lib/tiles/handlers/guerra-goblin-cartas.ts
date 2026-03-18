import type { TileHandler } from "../types";

export const guerraGoblinCartasTileHandler: TileHandler = (context) => {
  const { tile, triggeredByPendingMinigameRetry } = context;

  return {
    tileType: tile.type,
    tileFamily: tile.family,
    title: tile.label,
    message: triggeredByPendingMinigameRetry
      ? `Sigues atrapado en ${tile.label}. Debes volver a ganar la Guerra Goblin de Cartas para liberarte.`
      : `Caíste en ${tile.label}. Debes ganar la Guerra Goblin de Cartas para superar esta casilla.`,
    tone: "challenge",
    implementationStatus: "placeholder",
    effects: [
      {
        kind: "start_minigame",
        minigameType: "guerra_goblin_cartas",
        reason:
          "Guerra Goblin de Cartas: si pierdes, la casilla queda pendiente y no podrás lanzar el dado en tu siguiente turno.",
        blocksTurnFlowOnLoss: true,
      },
    ],
  };
};