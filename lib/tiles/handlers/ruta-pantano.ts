import type { TileHandler } from "../types";

export const rutaPantanoTileHandler: TileHandler = (context) => {
  const { tile, triggeredByPendingMinigameRetry } = context;

  return {
    tileType: tile.type,
    tileFamily: tile.family,
    title: tile.label,
    message: triggeredByPendingMinigameRetry
      ? `Sigues atrapado en ${tile.label}. Debes volver a completar Ruta del Pantano para liberarte.`
      : `Caíste en ${tile.label}. Debes completar Ruta del Pantano para considerar esta casilla superada.`,
    tone: "challenge",
    implementationStatus: "placeholder",
    effects: [
      {
        kind: "start_minigame",
        minigameType: "ruta_pantano",
        reason:
          "Ruta del Pantano: si pierdes, quedas bloqueado en esta casilla y volverás a intentarlo en tus próximos turnos.",
        blocksTurnFlowOnLoss: true,
      },
    ],
  };
};