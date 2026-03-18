import type { TileHandler } from "../types";

export const trampaMaldicionTileHandler: TileHandler = (context) => {
  const { tile, triggeredByChain } = context;

  return {
    tileType: tile.type,
    tileFamily: tile.family,
    title: tile.label,
    message: triggeredByChain
      ? `El movimiento encadenado te llevó a ${tile.label}. La maldición hará que pierdas tu próximo turno.`
      : `Caíste en ${tile.label}. La maldición hará que pierdas tu próximo turno.`,
    tone: "negative",
    implementationStatus: "ready",
    effects: [
      {
        kind: "skip_next_turn",
        turns: 1,
        reason: "Maldición del Tótem: pierdes tu próximo turno.",
      },
    ],
  };
};