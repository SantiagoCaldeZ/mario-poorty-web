import {
  BOARD_FINISH_INDEX,
  BOARD_LAYOUT_V1,
  BOARD_LAYOUT_V1_BY_INDEX,
  BOARD_START_INDEX,
  getBoardTileByIndex,
  isBoardIndexInRange,
} from "./board-layout-v1";
import type { BoardTile } from "./tile-types";

export type MoveOutcome = {
  from: number;
  to: number;
  bounced: boolean;
  overflow: number;
};

export function clampBoardIndex(index: number): number {
  return Math.max(BOARD_START_INDEX, Math.min(BOARD_FINISH_INDEX, index));
}

export function ensureBoardIndex(index: number): number {
  if (!Number.isInteger(index) || !isBoardIndexInRange(index)) {
    throw new Error(`Índice de casilla fuera del tablero: ${index}.`);
  }

  return index;
}

export function getBoardLength(): number {
  return BOARD_LAYOUT_V1.length;
}

export function getLastBoardIndex(): number {
  return BOARD_FINISH_INDEX;
}

export function getOverflowPastFinish(index: number): number {
  return Math.max(0, index - BOARD_FINISH_INDEX);
}

export function distanceToFinish(index: number): number {
  return Math.max(0, BOARD_FINISH_INDEX - clampBoardIndex(index));
}

export function moveForwardWithBounce(from: number, steps: number): MoveOutcome {
  const safeFrom = clampBoardIndex(from);
  const safeSteps = Math.max(0, Math.trunc(steps));
  const tentative = safeFrom + safeSteps;

  if (tentative <= BOARD_FINISH_INDEX) {
    return {
      from: safeFrom,
      to: tentative,
      bounced: false,
      overflow: 0,
    };
  }

  const overflow = tentative - BOARD_FINISH_INDEX;
  return {
    from: safeFrom,
    to: BOARD_FINISH_INDEX - overflow,
    bounced: true,
    overflow,
  };
}

export function moveRelativeOnBoard(from: number, delta: number): MoveOutcome {
  const safeFrom = clampBoardIndex(from);
  const safeDelta = Math.trunc(delta);

  if (safeDelta >= 0) {
    return moveForwardWithBounce(safeFrom, safeDelta);
  }

  return {
    from: safeFrom,
    to: clampBoardIndex(safeFrom + safeDelta),
    bounced: false,
    overflow: 0,
  };
}

export function moveToBoardIndex(from: number, destination: number): MoveOutcome {
  const safeFrom = clampBoardIndex(from);
  return {
    from: safeFrom,
    to: clampBoardIndex(destination),
    bounced: false,
    overflow: 0,
  };
}

export function getBoardTileOrNull(index: number): BoardTile | null {
  return BOARD_LAYOUT_V1_BY_INDEX.get(index) ?? null;
}

export function getBoardTileSafe(index: number): BoardTile {
  return getBoardTileByIndex(ensureBoardIndex(index));
}

export function isTerminalBoardIndex(index: number): boolean {
  return clampBoardIndex(index) === BOARD_FINISH_INDEX;
}

export function normalizeBoardIndex(index: number): number {
  return clampBoardIndex(Math.trunc(index));
}
