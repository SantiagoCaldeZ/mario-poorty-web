import type { TileHandler } from "../types";

export const memoryReliquiasTileHandler: TileHandler = (context) => {
  const { tile, triggeredByPendingMinigameRetry } = context;

  return {
    tileType: tile.type,
    tileFamily: tile.family,
    title: tile.label,
    message: triggeredByPendingMinigameRetry
      ? `Sigues atrapado en ${tile.label}. Debes volver a superar el minijuego de memoria para liberarte.`
      : `Caíste en ${tile.label}. Debes superar el minijuego de memoria para considerar esta casilla como resuelta.`,
    tone: "challenge",
    implementationStatus: "placeholder",
    effects: [
      {
        kind: "start_minigame",
        minigameType: "memory_reliquias",
        reason:
          "Memory de Reliquias: si pierdes, quedas bloqueado en esta casilla hasta superarlo en un turno futuro.",
        blocksTurnFlowOnLoss: true,
      },
    ],
  };
};