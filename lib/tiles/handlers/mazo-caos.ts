import type { TileHandler } from "../types";

export const mazoCaosTileHandler: TileHandler = (context) => {
  const { tile, triggeredByPendingMinigameRetry } = context;

  return {
    tileType: tile.type,
    tileFamily: tile.family,
    title: tile.label,
    message: triggeredByPendingMinigameRetry
      ? `Sigues atrapado en ${tile.label}. Debes volver a resolver una carta del Mazo del Caos para liberarte.`
      : `Caíste en ${tile.label}. Se abre la interfaz del Mazo del Caos, robas una carta al azar y debes resolver su evento para superar esta casilla.`,
    tone: "challenge",
    implementationStatus: "placeholder",
    effects: [
      {
        kind: "start_minigame",
        minigameType: "mazo_caos",
        reason:
          "Mazo del Caos: se revela una carta con efecto inmediato. Si no superas el reto asociado, quedas bloqueado en esta casilla hasta resolverlo en un turno futuro.",
        blocksTurnFlowOnLoss: true,
      },
    ],
  };
};