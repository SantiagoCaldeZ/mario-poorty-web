import type { TileHandler } from "../types";

/**
 * Ajusta estas salidas cuando cierres el diseño final del tablero.
 * La idea es que el portal no sea totalmente aleatorio, sino controlado.
 */
const PORTAL_HONGOS_EXIT_OPTIONS = [8, 22] as const;

function hashString(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function getPortalHongosExit(matchId: string): number {
  const hash = hashString(matchId);
  return PORTAL_HONGOS_EXIT_OPTIONS[hash % PORTAL_HONGOS_EXIT_OPTIONS.length];
}

export const portalHongosTileHandler: TileHandler = (context) => {
  const { tile, matchId, landedPosition, triggeredByChain } = context;
  const destination = getPortalHongosExit(matchId);

  const isForwardMove = destination > landedPosition;
  const isBackwardMove = destination < landedPosition;

  const movementText = isForwardMove
    ? `El portal te impulsa hacia la casilla ${destination}.`
    : isBackwardMove
      ? `El portal te arrastra hacia la casilla ${destination}.`
      : `El portal te deja en la misma zona rúnica (${destination}).`;

  return {
    tileType: tile.type,
    tileFamily: tile.family,
    title: tile.label,
    message: triggeredByChain
      ? `El movimiento encadenado te llevó a ${tile.label}. ${movementText}`
      : `Caíste en ${tile.label}. ${movementText}`,
    tone: isBackwardMove ? "negative" : "challenge",
    implementationStatus: "placeholder",
    effects: [
      {
        kind: "move_to",
        position: destination,
        reason: `Portal de Hongos: teletransporte controlado hacia la casilla ${destination}.`,
        canChain: true,
      },
    ],
  };
};