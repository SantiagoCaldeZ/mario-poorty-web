export type TileType =
  | "start"
  | "normal"
  | "bonus"
  | "trap"
  | "event"
  | "duel"
  | "finish";

export type TileSlot = {
  x: number;
  y: number;
};

export type BoardTile = {
  index: number;
  x: number;
  y: number;
  type: TileType;
  slots: TileSlot[];
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

export const DEFAULT_TILE_SLOTS: TileSlot[] = [
  { x: -22, y: -20 },
  { x: 22, y: -20 },
  { x: -22, y: 12 },
  { x: 22, y: 12 },
  { x: -38, y: 38 },
  { x: 38, y: 38 },
];

export const GOBLIN_SWAMP_BOARD: BoardDefinition = {
  id: "goblin-swamp-01",
  name: "Pantano Goblin",
  theme: "swamp",
  backgroundImage: "/boards/goblin-swamp-bg.png",
  width: 1340,
  height: 720,
  tiles: [
    { index: 0, x: 110, y: 585, type: "start", slots: DEFAULT_TILE_SLOTS },
    { index: 1, x: 245, y: 600, type: "normal", slots: DEFAULT_TILE_SLOTS },
    { index: 2, x: 390, y: 612, type: "normal", slots: DEFAULT_TILE_SLOTS },
    { index: 3, x: 540, y: 596, type: "normal", slots: DEFAULT_TILE_SLOTS },
    { index: 4, x: 695, y: 582, type: "normal", slots: DEFAULT_TILE_SLOTS },
    { index: 5, x: 845, y: 596, type: "bonus", slots: DEFAULT_TILE_SLOTS },
    { index: 6, x: 995, y: 608, type: "normal", slots: DEFAULT_TILE_SLOTS },
    { index: 7, x: 1135, y: 594, type: "trap", slots: DEFAULT_TILE_SLOTS },
    { index: 8, x: 1245, y: 570, type: "normal", slots: DEFAULT_TILE_SLOTS },

    { index: 9, x: 1245, y: 410, type: "event", slots: DEFAULT_TILE_SLOTS },
    { index: 10, x: 1100, y: 394, type: "normal", slots: DEFAULT_TILE_SLOTS },
    { index: 11, x: 950, y: 406, type: "bonus", slots: DEFAULT_TILE_SLOTS },
    { index: 12, x: 800, y: 420, type: "normal", slots: DEFAULT_TILE_SLOTS },
    { index: 13, x: 650, y: 408, type: "normal", slots: DEFAULT_TILE_SLOTS },
    { index: 14, x: 500, y: 392, type: "trap", slots: DEFAULT_TILE_SLOTS },
    { index: 15, x: 350, y: 406, type: "normal", slots: DEFAULT_TILE_SLOTS },
    { index: 16, x: 210, y: 420, type: "event", slots: DEFAULT_TILE_SLOTS },
    { index: 17, x: 100, y: 398, type: "normal", slots: DEFAULT_TILE_SLOTS },

    { index: 18, x: 100, y: 230, type: "normal", slots: DEFAULT_TILE_SLOTS },
    { index: 19, x: 245, y: 214, type: "bonus", slots: DEFAULT_TILE_SLOTS },
    { index: 20, x: 395, y: 226, type: "normal", slots: DEFAULT_TILE_SLOTS },
    { index: 21, x: 550, y: 210, type: "trap", slots: DEFAULT_TILE_SLOTS },
    { index: 22, x: 710, y: 220, type: "normal", slots: DEFAULT_TILE_SLOTS },
    { index: 23, x: 880, y: 204, type: "event", slots: DEFAULT_TILE_SLOTS },
    { index: 24, x: 1060, y: 186, type: "normal", slots: DEFAULT_TILE_SLOTS },
    { index: 25, x: 1245, y: 165, type: "finish", slots: DEFAULT_TILE_SLOTS },
  ],
};

export const BOARD_DEFINITIONS: BoardDefinition[] = [GOBLIN_SWAMP_BOARD];

export const BOARD_DEFINITIONS_BY_ID = Object.fromEntries(
  BOARD_DEFINITIONS.map((board) => [board.id, board])
) as Record<string, BoardDefinition>;

export function getBoardDefinitionById(boardId: string): BoardDefinition | null {
  return BOARD_DEFINITIONS_BY_ID[boardId] ?? null;
}

export function getRandomBoardDefinition(): BoardDefinition {
  const randomIndex = Math.floor(Math.random() * BOARD_DEFINITIONS.length);
  return BOARD_DEFINITIONS[randomIndex];
}