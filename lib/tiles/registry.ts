import type { TileType } from "@/lib/board";
import type {
  ActionableTileType,
  TileHandler,
  TileHandlerRegistry,
  TileRegistry,
  TileRegistryEntry,
} from "./types";
import { isActionableTileType } from "./types";

import { normalTileHandler } from "./handlers/normal";
import { bonusBotinTileHandler } from "./handlers/bonus-botin";
import { bonusBendicionTileHandler } from "./handlers/bonus-bendicion";
import { bonusDadoFavorableTileHandler } from "./handlers/bonus-dado-favorable";
import { trampaLodoTileHandler } from "./handlers/trampa-lodo";
import { trampaMaldicionTileHandler } from "./handlers/trampa-maldicion";
import { trampaDadoDebilitadoTileHandler } from "./handlers/trampa-dado-debilitado";
import { portalHongosTileHandler } from "./handlers/portal-hongos";
import { atajoRaicesTileHandler } from "./handlers/atajo-raices";
import { memoryReliquiasTileHandler } from "./handlers/memory-reliquias";
import { guerraGoblinCartasTileHandler } from "./handlers/guerra-goblin-cartas";
import { rutaPantanoTileHandler } from "./handlers/ruta-pantano";
import { ritualTotemTileHandler } from "./handlers/ritual-totem";
import { runasChamanTileHandler } from "./handlers/runas-chaman";
import { mazoCaosTileHandler } from "./handlers/mazo-caos";

/**
 * Registry maestro de casillas accionables.
 * Aquí defines:
 * - qué handler usa cada tipo
 * - si puede encadenar otra casilla
 * - si crea minijuego pendiente
 * - si bloquea el flujo al perder
 */
export const TILE_REGISTRY: TileRegistry = {
  normal: {
    type: "normal",
    family: "normal",
    title: "Casilla normal",
    handler: normalTileHandler,
    canChainResolution: false,
    createsPendingMinigame: false,
    blocksTurnFlowOnLoss: false,
  },

  bonus_botin: {
    type: "bonus_botin",
    family: "bonus",
    title: "Botín Goblin",
    handler: bonusBotinTileHandler,
    canChainResolution: true,
    createsPendingMinigame: false,
    blocksTurnFlowOnLoss: false,
  },

  bonus_bendicion: {
    type: "bonus_bendicion",
    family: "bonus",
    title: "Bendición del Chamán",
    handler: bonusBendicionTileHandler,
    canChainResolution: false,
    createsPendingMinigame: false,
    blocksTurnFlowOnLoss: false,
  },

  bonus_dado_favorable: {
    type: "bonus_dado_favorable",
    family: "bonus",
    title: "Dado Favorable",
    handler: bonusDadoFavorableTileHandler,
    canChainResolution: false,
    createsPendingMinigame: false,
    blocksTurnFlowOnLoss: false,
  },

  trampa_lodo: {
    type: "trampa_lodo",
    family: "trap",
    title: "Lodo Pegajoso",
    handler: trampaLodoTileHandler,
    canChainResolution: true,
    createsPendingMinigame: false,
    blocksTurnFlowOnLoss: false,
  },

  trampa_maldicion: {
    type: "trampa_maldicion",
    family: "trap",
    title: "Maldición del Tótem",
    handler: trampaMaldicionTileHandler,
    canChainResolution: false,
    createsPendingMinigame: false,
    blocksTurnFlowOnLoss: false,
  },

  trampa_dado_debilitado: {
    type: "trampa_dado_debilitado",
    family: "trap",
    title: "Dado Debilitado",
    handler: trampaDadoDebilitadoTileHandler,
    canChainResolution: false,
    createsPendingMinigame: false,
    blocksTurnFlowOnLoss: false,
  },

  portal_hongos: {
    type: "portal_hongos",
    family: "special_move",
    title: "Portal de Hongos",
    handler: portalHongosTileHandler,
    canChainResolution: true,
    createsPendingMinigame: false,
    blocksTurnFlowOnLoss: false,
  },

  atajo_raices: {
    type: "atajo_raices",
    family: "special_move",
    title: "Atajo de Raíces",
    handler: atajoRaicesTileHandler,
    canChainResolution: true,
    createsPendingMinigame: false,
    blocksTurnFlowOnLoss: false,
  },

  memory_reliquias: {
    type: "memory_reliquias",
    family: "minigame",
    title: "Memory de Reliquias",
    handler: memoryReliquiasTileHandler,
    canChainResolution: false,
    createsPendingMinigame: true,
    blocksTurnFlowOnLoss: true,
  },

  guerra_goblin_cartas: {
    type: "guerra_goblin_cartas",
    family: "minigame",
    title: "Guerra Goblin de Cartas",
    handler: guerraGoblinCartasTileHandler,
    canChainResolution: false,
    createsPendingMinigame: true,
    blocksTurnFlowOnLoss: true,
  },

  ruta_pantano: {
    type: "ruta_pantano",
    family: "minigame",
    title: "Ruta del Pantano",
    handler: rutaPantanoTileHandler,
    canChainResolution: false,
    createsPendingMinigame: true,
    blocksTurnFlowOnLoss: true,
  },

  ritual_totem: {
    type: "ritual_totem",
    family: "minigame",
    title: "Ritual del Tótem",
    handler: ritualTotemTileHandler,
    canChainResolution: false,
    createsPendingMinigame: true,
    blocksTurnFlowOnLoss: true,
  },

  runas_chaman: {
    type: "runas_chaman",
    family: "minigame",
    title: "Runas del Chamán",
    handler: runasChamanTileHandler,
    canChainResolution: false,
    createsPendingMinigame: true,
    blocksTurnFlowOnLoss: true,
  },

  mazo_caos: {
    type: "mazo_caos",
    family: "minigame",
    title: "Mazo del Caos",
    handler: mazoCaosTileHandler,
    canChainResolution: false,
    createsPendingMinigame: true,
    blocksTurnFlowOnLoss: true,
  },
};

export const TILE_HANDLER_REGISTRY: TileHandlerRegistry = {
  normal: TILE_REGISTRY.normal.handler,
  bonus_botin: TILE_REGISTRY.bonus_botin.handler,
  bonus_bendicion: TILE_REGISTRY.bonus_bendicion.handler,
  bonus_dado_favorable: TILE_REGISTRY.bonus_dado_favorable.handler,
  trampa_lodo: TILE_REGISTRY.trampa_lodo.handler,
  trampa_maldicion: TILE_REGISTRY.trampa_maldicion.handler,
  trampa_dado_debilitado: TILE_REGISTRY.trampa_dado_debilitado.handler,
  portal_hongos: TILE_REGISTRY.portal_hongos.handler,
  atajo_raices: TILE_REGISTRY.atajo_raices.handler,
  memory_reliquias: TILE_REGISTRY.memory_reliquias.handler,
  guerra_goblin_cartas: TILE_REGISTRY.guerra_goblin_cartas.handler,
  ruta_pantano: TILE_REGISTRY.ruta_pantano.handler,
  ritual_totem: TILE_REGISTRY.ritual_totem.handler,
  runas_chaman: TILE_REGISTRY.runas_chaman.handler,
  mazo_caos: TILE_REGISTRY.mazo_caos.handler,
};

export function getTileRegistryEntry(tileType: TileType): TileRegistryEntry | null {
  if (!isActionableTileType(tileType)) {
    return null;
  }

  return TILE_REGISTRY[tileType];
}

export function getTileHandler(tileType: TileType): TileHandler | null {
  if (!isActionableTileType(tileType)) {
    return null;
  }

  return TILE_HANDLER_REGISTRY[tileType];
}

export function isTileTypeRegistered(tileType: TileType): tileType is ActionableTileType {
  return isActionableTileType(tileType);
}