import { getMatchBoard } from "@/lib/board";
import type {
  TileEffect,
  TileHandlerResult,
  TileLandingPreview,
} from "./types";
import { getTileLandingPreview } from "./preview";
import { getTileHandler, getTileRegistryEntry } from "./registry";

type RegistryEntryOrNull = ReturnType<typeof getTileRegistryEntry>;

export type ResolveTileEventInput = {
  matchId: string;
  playerId: string;
  landedPosition: number;
  previousPosition: number;
  rolledValue: number | null;
  triggeredByChain?: boolean;
  triggeredByPendingMinigameRetry?: boolean;
};

export type TileResolutionStep = {
  stepNumber: number;
  position: number;
  preview: TileLandingPreview;
  registryEntry: RegistryEntryOrNull;
  result: TileHandlerResult | null;
  triggeredByChain: boolean;
};

export type ResolvedTileEvent = {
  preview: TileLandingPreview;
  result: TileHandlerResult | null;
  registryEntry: RegistryEntryOrNull;
  shouldOpenModal: boolean;
  steps: TileResolutionStep[];
  finalPosition: number;
  wasChained: boolean;
  stoppedBecause: "stable" | "non_actionable" | "loop_guard" | "max_steps";
};

export const MAX_TILE_CHAIN_STEPS = 10;

function clampBoardPosition(matchId: string, position: number) {
  const board = getMatchBoard(matchId);
  const maxIndex = board.tiles.reduce(
    (max, tile) => Math.max(max, tile.index),
    0
  );

  return Math.max(0, Math.min(maxIndex, position));
}

function getChainingEffect(result: TileHandlerResult | null) {
  if (!result) return null;

  return (
    result.effects.find(
      (effect): effect is Extract<TileEffect, { kind: "move_by" | "move_to" }> =>
        (effect.kind === "move_by" || effect.kind === "move_to") &&
        "canChain" in effect &&
        effect.canChain === true
    ) ?? null
  );
}

function resolveNextPosition(
  matchId: string,
  currentPosition: number,
  effect: Extract<TileEffect, { kind: "move_by" | "move_to" }>
) {
  if (effect.kind === "move_by") {
    return clampBoardPosition(matchId, currentPosition + effect.amount);
  }

  return clampBoardPosition(matchId, effect.position);
}

export function resolveTileEvent(input: ResolveTileEventInput): ResolvedTileEvent {
  let currentPosition = clampBoardPosition(input.matchId, input.landedPosition);

  const visitedPositions = new Set<number>([currentPosition]);
  const steps: TileResolutionStep[] = [];

  let lastPreview = getTileLandingPreview(input.matchId, currentPosition);
  let lastRegistryEntry: RegistryEntryOrNull = null;
  let lastResult: TileHandlerResult | null = null;
  let stoppedBecause: ResolvedTileEvent["stoppedBecause"] = "stable";

  for (let stepIndex = 0; stepIndex < MAX_TILE_CHAIN_STEPS; stepIndex += 1) {
    const preview = getTileLandingPreview(input.matchId, currentPosition);

    lastPreview = preview;

    if (!preview.tile) {
      stoppedBecause = "non_actionable";
      break;
    }

    const registryEntry = getTileRegistryEntry(preview.tile.type);
    const handler = getTileHandler(preview.tile.type);

    if (!registryEntry || !handler) {
      lastRegistryEntry = null;
      lastResult = null;
      stoppedBecause = "non_actionable";
      break;
    }

    const result = handler({
      matchId: input.matchId,
      playerId: input.playerId,
      tile: preview.tile,
      landedPosition: currentPosition,
      previousPosition: stepIndex === 0 ? input.previousPosition : steps[steps.length - 1].position,
      rolledValue: stepIndex === 0 ? input.rolledValue : null,
      triggeredByChain: stepIndex > 0 || Boolean(input.triggeredByChain),
      triggeredByPendingMinigameRetry:
        stepIndex === 0 ? Boolean(input.triggeredByPendingMinigameRetry) : false,
    });

    const step: TileResolutionStep = {
      stepNumber: stepIndex + 1,
      position: currentPosition,
      preview,
      registryEntry,
      result,
      triggeredByChain: stepIndex > 0 || Boolean(input.triggeredByChain),
    };

    steps.push(step);

    lastPreview = preview;
    lastRegistryEntry = registryEntry;
    lastResult = result;

    if (!registryEntry.canChainResolution) {
      stoppedBecause = "stable";
      break;
    }

    const chainingEffect = getChainingEffect(result);

    if (!chainingEffect) {
      stoppedBecause = "stable";
      break;
    }

    const nextPosition = resolveNextPosition(
      input.matchId,
      currentPosition,
      chainingEffect
    );

    if (nextPosition === currentPosition) {
      stoppedBecause = "stable";
      break;
    }

    if (visitedPositions.has(nextPosition)) {
      stoppedBecause = "loop_guard";
      break;
    }

    visitedPositions.add(nextPosition);
    currentPosition = nextPosition;
  }

  if (steps.length === MAX_TILE_CHAIN_STEPS) {
    const lastStep = steps[steps.length - 1];
    const lastStepResult = lastStep?.result;
    const lastStepRegistryEntry = lastStep?.registryEntry;

    if (
      lastStepResult &&
      lastStepRegistryEntry?.canChainResolution &&
      getChainingEffect(lastStepResult)
    ) {
      stoppedBecause = "max_steps";
    }
  }

  return {
    preview: lastPreview,
    result: lastResult,
    registryEntry: lastRegistryEntry,
    shouldOpenModal: Boolean(steps.length && lastPreview.tile && lastResult),
    steps,
    finalPosition: currentPosition,
    wasChained: steps.length > 1,
    stoppedBecause,
  };
}