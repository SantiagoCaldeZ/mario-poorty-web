import type { BoardTile } from "./tile-types";
import {
  BOARD_FINISH_INDEX,
  BOARD_START_INDEX,
} from "./tile-types";

export const BOARD_LAYOUT_V1: readonly BoardTile[] = [
  {
    index: 0,
    family: "start",
    kind: "start",
    label: "Inicio",
    shortLabel: "Inicio",
    description: "Punto de partida de todos los jugadores.",
    theme: "neutral",
    chainable: false,
  },

  {
    index: 1,
    family: "normal",
    kind: "normal",
    label: "Roca Seca",
    shortLabel: "Normal",
    description: "El pantano está en calma. No ocurre nada.",
    theme: "neutral",
    chainable: false,
  },
  {
    index: 2,
    family: "minigame",
    kind: "memory_relics",
    label: "Memory de Reliquias",
    shortLabel: "Memory",
    description: "Debes superar el memory para considerar esta casilla superada.",
    theme: "memory",
    chainable: false,
    payload: {
      minigameKey: "memory_relics",
      mode: "versus",
      requiresOpponent: true,
    },
  },
  {
    index: 3,
    family: "trap",
    kind: "trap_mud",
    label: "Lodo Pegajoso",
    shortLabel: "Lodo",
    description: "El lodo te arrastra 2 casillas hacia atrás.",
    theme: "mud",
    chainable: true,
    payload: {
      steps: -2,
    },
  },
  {
    index: 4,
    family: "normal",
    kind: "normal",
    label: "Claro del Pantano",
    shortLabel: "Normal",
    description: "Avanzas sin inconvenientes.",
    theme: "neutral",
    chainable: false,
  },
  {
    index: 5,
    family: "bonus",
    kind: "bonus_loot",
    label: "Botín Goblin",
    shortLabel: "Botín",
    description: "Encuentras un botín y avanzas 2 casillas inmediatamente.",
    theme: "loot",
    chainable: true,
    payload: {
      steps: 2,
    },
  },
  {
    index: 6,
    family: "minigame",
    kind: "goblin_card_war",
    label: "Guerra Goblin de Cartas",
    shortLabel: "Cartas",
    description: "Se activa un duelo rápido de cartas goblin.",
    theme: "cards",
    chainable: false,
    payload: {
      minigameKey: "goblin_card_war",
      mode: "versus",
      requiresOpponent: false,
    },
  },
  {
    index: 7,
    family: "movement",
    kind: "movement_root_shortcut",
    label: "Atajo de Raíces",
    shortLabel: "Raíces",
    description: "Las raíces te llevan por un atajo hacia adelante.",
    theme: "roots",
    chainable: true,
    payload: {
      destination: 11,
    },
  },
  {
    index: 8,
    family: "minigame",
    kind: "totem_ritual",
    label: "Ritual del Tótem",
    shortLabel: "Ritual",
    description: "Debes completar el ritual para superar esta casilla.",
    theme: "ritual",
    chainable: false,
    payload: {
      minigameKey: "totem_ritual",
      mode: "solo",
      requiresOpponent: false,
    },
  },
  {
    index: 9,
    family: "chaos",
    kind: "chaos_deck",
    label: "Mazo del Caos",
    shortLabel: "Caos",
    description: "Robas una carta del mazo goblin y ocurre un efecto inmediato.",
    theme: "chaos",
    chainable: false,
    payload: {
      deckId: "goblin_chaos_v1",
    },
  },
  {
    index: 10,
    family: "minigame",
    kind: "shaman_runes",
    label: "Runas del Chamán",
    shortLabel: "Runas",
    description: "Debes repetir la secuencia de runas para superar la casilla.",
    theme: "runes",
    chainable: false,
    payload: {
      minigameKey: "shaman_runes",
      mode: "solo",
      requiresOpponent: false,
    },
  },
  {
    index: 11,
    family: "normal",
    kind: "normal",
    label: "Puente Torcido",
    shortLabel: "Normal",
    description: "Cruzas sin activar nada especial.",
    theme: "neutral",
    chainable: false,
  },
  {
    index: 12,
    family: "minigame",
    kind: "swamp_path",
    label: "Ruta del Pantano",
    shortLabel: "Ruta",
    description: "Debes memorizar la ruta correcta del pantano.",
    theme: "path",
    chainable: false,
    payload: {
      minigameKey: "swamp_path",
      mode: "solo",
      requiresOpponent: false,
    },
  },
  {
    index: 13,
    family: "bonus",
    kind: "bonus_blessing",
    label: "Bendición del Chamán",
    shortLabel: "Escudo",
    description: "Obtienes un escudo contra la próxima trampa o efecto negativo.",
    theme: "blessing",
    chainable: false,
    payload: {
      shieldCharges: 1,
    },
  },
  {
    index: 14,
    family: "movement",
    kind: "movement_mushroom_portal",
    label: "Portal de Hongos",
    shortLabel: "Portal",
    description: "Los hongos rúnicos te teletransportan a una salida predeterminada.",
    theme: "portal",
    chainable: true,
    payload: {
      destination: 18,
      portalGroup: "portal_a",
    },
  },
  {
    index: 15,
    family: "normal",
    kind: "normal",
    label: "Niebla Serena",
    shortLabel: "Normal",
    description: "La niebla pasa, pero no altera tu turno.",
    theme: "neutral",
    chainable: false,
  },
  {
    index: 16,
    family: "trap",
    kind: "trap_curse",
    label: "Maldición del Tótem",
    shortLabel: "Maldición",
    description: "Pierdes tu próximo turno.",
    theme: "curse",
    chainable: false,
    payload: {
      skipTurns: 1,
    },
  },
  {
    index: 17,
    family: "minigame",
    kind: "memory_relics",
    label: "Memory de Reliquias",
    shortLabel: "Memory",
    description: "Otra prueba de reliquias. Debes ganarla para quedar libre.",
    theme: "memory",
    chainable: false,
    payload: {
      minigameKey: "memory_relics",
      mode: "versus",
      requiresOpponent: true,
    },
  },
  {
    index: 18,
    family: "minigame",
    kind: "totem_ritual",
    label: "Ritual del Tótem",
    shortLabel: "Ritual",
    description: "Una nueva prueba ritual te detiene aquí hasta superarla.",
    theme: "ritual",
    chainable: false,
    payload: {
      minigameKey: "totem_ritual",
      mode: "solo",
      requiresOpponent: false,
    },
  },
  {
    index: 19,
    family: "chaos",
    kind: "chaos_deck",
    label: "Mazo del Caos",
    shortLabel: "Caos",
    description: "Robas otra carta del mazo y aplicas su efecto inmediato.",
    theme: "chaos",
    chainable: false,
    payload: {
      deckId: "goblin_chaos_v1",
    },
  },
  {
    index: 20,
    family: "minigame",
    kind: "goblin_card_war",
    label: "Guerra Goblin de Cartas",
    shortLabel: "Cartas",
    description: "Un nuevo duelo goblin pondrá a prueba tu suerte y estrategia.",
    theme: "cards",
    chainable: false,
    payload: {
      minigameKey: "goblin_card_war",
      mode: "versus",
      requiresOpponent: false,
    },
  },
  {
    index: 21,
    family: "trap",
    kind: "trap_weakened_die",
    label: "Dado Debilitado",
    shortLabel: "Dado Débil",
    description: "En tu próximo turno, tu dado tendrá un máximo de 3.",
    theme: "weakened_die",
    chainable: false,
    payload: {
      nextRollMax: 3,
    },
  },
  {
    index: 22,
    family: "minigame",
    kind: "swamp_path",
    label: "Ruta del Pantano",
    shortLabel: "Ruta",
    description: "Otra ruta pantanosa aparece frente a ti.",
    theme: "path",
    chainable: false,
    payload: {
      minigameKey: "swamp_path",
      mode: "solo",
      requiresOpponent: false,
    },
  },
  {
    index: 23,
    family: "bonus",
    kind: "bonus_favorable_die",
    label: "Dado Favorable",
    shortLabel: "Dado +1",
    description: "En tu próximo turno obtendrás +1 al resultado del dado.",
    theme: "favorable_die",
    chainable: false,
    payload: {
      nextRollBonus: 1,
    },
  },
  {
    index: 24,
    family: "minigame",
    kind: "shaman_runes",
    label: "Runas del Chamán",
    shortLabel: "Runas",
    description: "Las runas vuelven a desafiar tu memoria.",
    theme: "runes",
    chainable: false,
    payload: {
      minigameKey: "shaman_runes",
      mode: "solo",
      requiresOpponent: false,
    },
  },
  {
    index: 25,
    family: "normal",
    kind: "normal",
    label: "Raíz Dormida",
    shortLabel: "Normal",
    description: "Nada interrumpe el avance en esta parte del tablero.",
    theme: "neutral",
    chainable: false,
  },
  {
    index: 26,
    family: "minigame",
    kind: "totem_ritual",
    label: "Ritual del Tótem",
    shortLabel: "Ritual",
    description: "Una última prueba ritual antes del tramo final.",
    theme: "ritual",
    chainable: false,
    payload: {
      minigameKey: "totem_ritual",
      mode: "solo",
      requiresOpponent: false,
    },
  },
  {
    index: 27,
    family: "minigame",
    kind: "swamp_path",
    label: "Ruta del Pantano",
    shortLabel: "Ruta",
    description: "El pantano te exige una ruta final para continuar.",
    theme: "path",
    chainable: false,
    payload: {
      minigameKey: "swamp_path",
      mode: "solo",
      requiresOpponent: false,
    },
  },
  {
    index: 28,
    family: "minigame",
    kind: "shaman_runes",
    label: "Runas del Chamán",
    shortLabel: "Runas",
    description: "La última secuencia de runas guarda el acceso al final.",
    theme: "runes",
    chainable: false,
    payload: {
      minigameKey: "shaman_runes",
      mode: "solo",
      requiresOpponent: false,
    },
  },
  {
    index: 29,
    family: "normal",
    kind: "normal",
    label: "Orilla del Santuario",
    shortLabel: "Normal",
    description: "Último respiro antes de la meta.",
    theme: "neutral",
    chainable: false,
  },

  {
    index: 30,
    family: "finish",
    kind: "finish",
    label: "Meta",
    shortLabel: "Meta",
    description: "Debes llegar exacto para ganar la partida.",
    theme: "finish",
    chainable: false,
  },
] as const satisfies readonly BoardTile[];

export const BOARD_LAYOUT_V1_BY_INDEX = new Map<number, BoardTile>(
  BOARD_LAYOUT_V1.map((tile) => [tile.index, tile]),
);

export function getBoardTileByIndex(index: number): BoardTile {
  const tile = BOARD_LAYOUT_V1_BY_INDEX.get(index);

  if (!tile) {
    throw new Error(`No existe una casilla para el índice ${index}.`);
  }

  return tile;
}

export function isBoardIndexInRange(index: number): boolean {
  return index >= BOARD_START_INDEX && index <= BOARD_FINISH_INDEX;
}

export function assertBoardLayoutV1(): void {
  if (BOARD_LAYOUT_V1.length !== BOARD_FINISH_INDEX + 1) {
    throw new Error(
      `BOARD_LAYOUT_V1 debe tener ${BOARD_FINISH_INDEX + 1} casillas y actualmente tiene ${BOARD_LAYOUT_V1.length}.`,
    );
  }

  BOARD_LAYOUT_V1.forEach((tile, expectedIndex) => {
    if (tile.index !== expectedIndex) {
      throw new Error(
        `La casilla en posición ${expectedIndex} tiene index=${tile.index}. El layout debe ser secuencial.`,
      );
    }
  });
}