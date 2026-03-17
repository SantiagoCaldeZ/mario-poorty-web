export type TileType =
  | "start"
  | "normal"
  | "bonus_botin"
  | "bonus_bendicion"
  | "bonus_dado_favorable"
  | "trampa_lodo"
  | "trampa_maldicion"
  | "trampa_dado_debilitado"
  | "portal_hongos"
  | "atajo_raices"
  | "memory_reliquias"
  | "guerra_goblin_cartas"
  | "ruta_pantano"
  | "ritual_totem"
  | "runas_chaman"
  | "mazo_caos"
  | "finish";

export type TileFamily =
  | "start"
  | "normal"
  | "bonus"
  | "trap"
  | "special_move"
  | "minigame"
  | "finish";

export type TileSlot = {
  x: number;
  y: number;
};

export type BoardTile = {
  index: number;
  x: number;
  y: number;
  slots: TileSlot[];
  type: TileType;
  family: TileFamily;
  label: string;
  image: string;
};

export type BoardDefinition = {
  id: string;
  name: string;
  theme: string;
  backgroundImage: string;
  width: number;
  height: number;
  tiles: BoardTile[];
};

type BaseBoardTile = {
  index: number;
  x: number;
  y: number;
  slots: TileSlot[];
};

type TileVisualConfig = {
  family: TileFamily;
  label: string;
  image: string;
};

export const DEFAULT_TILE_SLOTS: TileSlot[] = [
  { x: -22, y: -20 },
  { x: 22, y: -20 },
  { x: -22, y: 12 },
  { x: 22, y: 12 },
  { x: -38, y: 38 },
  { x: 38, y: 38 },
];

const BASE_TILES: BaseBoardTile[] = [
  { index: 0, x: 110, y: 585, slots: DEFAULT_TILE_SLOTS },
  { index: 1, x: 245, y: 600, slots: DEFAULT_TILE_SLOTS },
  { index: 2, x: 390, y: 612, slots: DEFAULT_TILE_SLOTS },
  { index: 3, x: 540, y: 596, slots: DEFAULT_TILE_SLOTS },
  { index: 4, x: 695, y: 582, slots: DEFAULT_TILE_SLOTS },
  { index: 5, x: 845, y: 596, slots: DEFAULT_TILE_SLOTS },
  { index: 6, x: 995, y: 608, slots: DEFAULT_TILE_SLOTS },
  { index: 7, x: 1135, y: 594, slots: DEFAULT_TILE_SLOTS },
  { index: 8, x: 1245, y: 570, slots: DEFAULT_TILE_SLOTS },

  { index: 9, x: 1245, y: 448, slots: DEFAULT_TILE_SLOTS },
  { index: 10, x: 1100, y: 432, slots: DEFAULT_TILE_SLOTS },
  { index: 11, x: 950, y: 444, slots: DEFAULT_TILE_SLOTS },
  { index: 12, x: 800, y: 458, slots: DEFAULT_TILE_SLOTS },
  { index: 13, x: 650, y: 446, slots: DEFAULT_TILE_SLOTS },
  { index: 14, x: 500, y: 430, slots: DEFAULT_TILE_SLOTS },
  { index: 15, x: 350, y: 444, slots: DEFAULT_TILE_SLOTS },
  { index: 16, x: 210, y: 458, slots: DEFAULT_TILE_SLOTS },
  { index: 17, x: 100, y: 436, slots: DEFAULT_TILE_SLOTS },

  { index: 18, x: 100, y: 288, slots: DEFAULT_TILE_SLOTS },
  { index: 19, x: 245, y: 272, slots: DEFAULT_TILE_SLOTS },
  { index: 20, x: 395, y: 284, slots: DEFAULT_TILE_SLOTS },
  { index: 21, x: 550, y: 268, slots: DEFAULT_TILE_SLOTS },
  { index: 22, x: 710, y: 280, slots: DEFAULT_TILE_SLOTS },
  { index: 23, x: 880, y: 264, slots: DEFAULT_TILE_SLOTS },
  { index: 24, x: 1060, y: 246, slots: DEFAULT_TILE_SLOTS },
  { index: 25, x: 1245, y: 230, slots: DEFAULT_TILE_SLOTS },

  { index: 26, x: 1110, y: 118, slots: DEFAULT_TILE_SLOTS },
  { index: 27, x: 920, y: 102, slots: DEFAULT_TILE_SLOTS },
  { index: 28, x: 740, y: 114, slots: DEFAULT_TILE_SLOTS },
  { index: 29, x: 560, y: 100, slots: DEFAULT_TILE_SLOTS },
  { index: 30, x: 390, y: 116, slots: DEFAULT_TILE_SLOTS },
];

const TILE_VISUALS: Record<TileType, TileVisualConfig> = {
  start: {
    family: "start",
    label: "Inicio",
    image: "/casillas/inicio.png",
  },
  normal: {
    family: "normal",
    label: "Normal",
    image: "/casillas/normal.png",
  },
  bonus_botin: {
    family: "bonus",
    label: "Botín Goblin",
    image: "/casillas/bonus1.png",
  },
  bonus_bendicion: {
    family: "bonus",
    label: "Bendición del Chamán",
    image: "/casillas/bonus2.png",
  },
  bonus_dado_favorable: {
    family: "bonus",
    label: "Dado Favorable",
    image: "/casillas/bonus3.png",
  },
  trampa_lodo: {
    family: "trap",
    label: "Lodo Pegajoso",
    image: "/casillas/trampa1.png",
  },
  trampa_maldicion: {
    family: "trap",
    label: "Maldición del Tótem",
    image: "/casillas/trampa2.png",
  },
  trampa_dado_debilitado: {
    family: "trap",
    label: "Dado Debilitado",
    image: "/casillas/trampa3.png",
  },
  portal_hongos: {
    family: "special_move",
    label: "Portal de Hongos",
    image: "/casillas/movespecial1.png",
  },
  atajo_raices: {
    family: "special_move",
    label: "Atajo de Raíces",
    image: "/casillas/movespecial2.png",
  },
  memory_reliquias: {
    family: "minigame",
    label: "Memory de Reliquias",
    image: "/casillas/memory.png",
  },
  guerra_goblin_cartas: {
    family: "minigame",
    label: "Guerra Goblin de Cartas",
    image: "/casillas/guerradecartas.png",
  },
  ruta_pantano: {
    family: "minigame",
    label: "Ruta del Pantano",
    image: "/casillas/rutadelpantano.png",
  },
  ritual_totem: {
    family: "minigame",
    label: "Ritual del Tótem",
    image: "/casillas/ritualdeltotem.png",
  },
  runas_chaman: {
    family: "minigame",
    label: "Runas del Chamán",
    image: "/casillas/runasdelchaman.png",
  },
  mazo_caos: {
    family: "minigame",
    label: "Mazo del Caos",
    image: "/casillas/mazodelcaos.png",
  },
  finish: {
    family: "finish",
    label: "Meta",
    image: "/casillas/meta.png",
  },
};

const RANDOM_TILE_POOL: TileType[] = [
  "memory_reliquias",
  "memory_reliquias",

  "guerra_goblin_cartas",
  "guerra_goblin_cartas",

  "ruta_pantano",
  "ruta_pantano",
  "ruta_pantano",

  "ritual_totem",
  "ritual_totem",
  "ritual_totem",

  "runas_chaman",
  "runas_chaman",
  "runas_chaman",

  "mazo_caos",
  "mazo_caos",

  "normal",
  "normal",
  "normal",
  "normal",
  "normal",
  "normal",

  "bonus_botin",
  "bonus_bendicion",
  "bonus_dado_favorable",

  "trampa_lodo",
  "trampa_maldicion",
  "trampa_dado_debilitado",

  "portal_hongos",
  "atajo_raices",
];

function hashStringToSeed(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function mulberry32(seed: number) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithSeed<T>(items: T[], seedText: string): T[] {
  const result = [...items];
  const random = mulberry32(hashStringToSeed(seedText));

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}

function buildTile(index: number, x: number, y: number, slots: TileSlot[], type: TileType): BoardTile {
  const visual = TILE_VISUALS[type];

  return {
    index,
    x,
    y,
    slots,
    type,
    family: visual.family,
    label: visual.label,
    image: visual.image,
  };
}

export function getMatchBoard(matchId: string): BoardDefinition {
  const shuffledMiddleTiles = shuffleWithSeed(
    RANDOM_TILE_POOL,
    `board-layout:${matchId}`
  );

  const tiles = BASE_TILES.map((tile) => {
    if (tile.index === 0) {
      return buildTile(tile.index, tile.x, tile.y, tile.slots, "start");
    }

    if (tile.index === 30) {
      return buildTile(tile.index, tile.x, tile.y, tile.slots, "finish");
    }

    const middleType = shuffledMiddleTiles[tile.index - 1];
    return buildTile(tile.index, tile.x, tile.y, tile.slots, middleType);
  });

  return {
    id: "goblin-swamp-01",
    name: "Pantano Goblin",
    theme: "swamp",
    backgroundImage: "/boards/goblin-swamp-bg.png",
    width: 1340,
    height: 720,
    tiles,
  };
}

export function getTileForPosition(matchId: string, boardPosition: number): BoardTile | null {
  const board = getMatchBoard(matchId);
  return board.tiles.find((tile) => tile.index === boardPosition) ?? null;
}

export type TileLandingPreview = {
  tile: BoardTile | null;
  familyLabel: string;
  previewText: string;
};

function getTileFamilyLabel(family: TileFamily): string {
  switch (family) {
    case "start":
      return "inicio";
    case "normal":
      return "normal";
    case "bonus":
      return "bonus";
    case "trap":
      return "trampa";
    case "special_move":
      return "movimiento especial";
    case "minigame":
      return "minijuego";
    case "finish":
      return "meta";
    default:
      return "desconocida";
  }
}

export function getTileLandingPreview(
  matchId: string,
  boardPosition: number
): TileLandingPreview {
  const tile = getTileForPosition(matchId, boardPosition);

  if (!tile) {
    return {
      tile: null,
      familyLabel: "desconocida",
      previewText: "No se pudo detectar la casilla en la que cayó el jugador.",
    };
  }

  const familyLabel = getTileFamilyLabel(tile.family);

  return {
    tile,
    familyLabel,
    previewText: `Casilla detectada: ${familyLabel} (${tile.label}).`,
  };
}
