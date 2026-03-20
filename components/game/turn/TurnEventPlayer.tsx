"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  ChaosCardDrawnEvent,
  DiceRolledEvent,
  MatchFinishedEvent,
  MinigamePendingEvent,
  MinigameResolvedEvent,
  MinigameStartedEvent,
  PieceMoveEvent,
  StatusAppliedEvent,
  TileLandedEvent,
  TileMessageEvent,
  TurnBlockedByPendingMinigameEvent,
  TurnEndedEvent,
  TurnEvent,
  TurnPlan,
} from "@/lib/game/turn-engine/turn-event-types";

type MaybePromise<T = void> = T | Promise<T>;

export type TurnEventPlayerPlaybackState =
  | "idle"
  | "running"
  | "completed"
  | "cancelled"
  | "error";

export type TurnEventPlayerProps = {
  plan: TurnPlan | null;
  enabled?: boolean;

  /**
   * Reproduce el plan una sola vez por matchId + turnNumber.
   * Si lo pones en false, el plan puede volver a ejecutarse si cambia la referencia.
   */
  playOncePerTurn?: boolean;

  /**
   * Retrasos base entre eventos. Los callbacks pueden durar más si internamente
   * esperan una animación o interacción del usuario.
   */
  delays?: {
    defaultMs?: number;
    afterDiceMs?: number;
    afterMoveMs?: number;
    afterTileLandedMs?: number;
    afterStatusMs?: number;
    afterChaosMs?: number;
    afterTurnEndMs?: number;
  };

  onPlaybackStateChange?: (state: TurnEventPlayerPlaybackState) => void;
  onEventStart?: (event: TurnEvent) => MaybePromise;
  onEventEnd?: (event: TurnEvent) => MaybePromise;
  onPlaybackComplete?: (plan: TurnPlan) => MaybePromise;
  onPlaybackError?: (error: unknown, plan: TurnPlan) => MaybePromise;

  onTurnBlockedByPendingMinigame?: (
    event: TurnBlockedByPendingMinigameEvent,
  ) => MaybePromise;

  onDiceRolled?: (event: DiceRolledEvent) => MaybePromise;

  onPieceMove?: (event: PieceMoveEvent) => MaybePromise;

  onTileLanded?: (event: TileLandedEvent) => MaybePromise;

  onTileMessage?: (event: TileMessageEvent) => MaybePromise;

  onStatusApplied?: (event: StatusAppliedEvent) => MaybePromise;

  onChaosCardDrawn?: (event: ChaosCardDrawnEvent) => MaybePromise;

  onMinigameStarted?: (event: MinigameStartedEvent) => MaybePromise;

  onMinigamePending?: (event: MinigamePendingEvent) => MaybePromise;

  onMinigameResolved?: (event: MinigameResolvedEvent) => MaybePromise;

  onTurnEnded?: (event: TurnEndedEvent) => MaybePromise;

  onMatchFinished?: (event: MatchFinishedEvent) => MaybePromise;
};

function wait(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function getPlanPlaybackKey(plan: TurnPlan): string {
  return `${plan.matchId}:${plan.turnNumber}:${plan.actingUserId}`;
}

export default function TurnEventPlayer({
  plan,
  enabled = true,
  playOncePerTurn = true,
  delays,
  onPlaybackStateChange,
  onEventStart,
  onEventEnd,
  onPlaybackComplete,
  onPlaybackError,
  onTurnBlockedByPendingMinigame,
  onDiceRolled,
  onPieceMove,
  onTileLanded,
  onTileMessage,
  onStatusApplied,
  onChaosCardDrawn,
  onMinigameStarted,
  onMinigamePending,
  onMinigameResolved,
  onTurnEnded,
  onMatchFinished,
}: TurnEventPlayerProps) {
  const [playbackState, setPlaybackState] =
    useState<TurnEventPlayerPlaybackState>("idle");

  const playedKeysRef = useRef<Set<string>>(new Set());
  const runIdRef = useRef(0);

  const mergedDelays = useMemo(
    () => ({
      defaultMs: delays?.defaultMs ?? 250,
      afterDiceMs: delays?.afterDiceMs ?? 350,
      afterMoveMs: delays?.afterMoveMs ?? 250,
      afterTileLandedMs: delays?.afterTileLandedMs ?? 150,
      afterStatusMs: delays?.afterStatusMs ?? 250,
      afterChaosMs: delays?.afterChaosMs ?? 350,
      afterTurnEndMs: delays?.afterTurnEndMs ?? 150,
    }),
    [delays],
  );

  useEffect(() => {
    onPlaybackStateChange?.(playbackState);
  }, [onPlaybackStateChange, playbackState]);

  useEffect(() => {
    if (!enabled || !plan) {
      setPlaybackState("idle");
      return;
    }

    const playbackKey = getPlanPlaybackKey(plan);

    if (playOncePerTurn && playedKeysRef.current.has(playbackKey)) {
      setPlaybackState("completed");
      return;
    }

    let cancelled = false;
    const currentRunId = ++runIdRef.current;

    async function run(): Promise<void> {
      try {
        setPlaybackState("running");

        for (const event of plan.events) {
          if (cancelled || runIdRef.current !== currentRunId) {
            setPlaybackState("cancelled");
            return;
          }

          await onEventStart?.(event);

          switch (event.type) {
            case "turn_started":
              await wait(mergedDelays.defaultMs);
              break;

            case "turn_blocked_by_pending_minigame":
              await onTurnBlockedByPendingMinigame?.(event);
              await wait(mergedDelays.defaultMs);
              break;

            case "dice_rolled":
              await onDiceRolled?.(event);
              await wait(mergedDelays.afterDiceMs);
              break;

            case "piece_move":
              await onPieceMove?.(event);
              await wait(mergedDelays.afterMoveMs);
              break;

            case "tile_landed":
              await onTileLanded?.(event);
              await wait(mergedDelays.afterTileLandedMs);
              break;

            case "tile_message":
              await onTileMessage?.(event);
              await wait(event.autoCloseMs ?? mergedDelays.defaultMs);
              break;

            case "status_applied":
              await onStatusApplied?.(event);
              await wait(mergedDelays.afterStatusMs);
              break;

            case "chaos_card_drawn":
              await onChaosCardDrawn?.(event);
              await wait(mergedDelays.afterChaosMs);
              break;

            case "minigame_started":
              await onMinigameStarted?.(event);
              break;

            case "minigame_pending":
              await onMinigamePending?.(event);
              break;

            case "minigame_resolved":
              await onMinigameResolved?.(event);
              await wait(mergedDelays.defaultMs);
              break;

            case "turn_ended":
              await onTurnEnded?.(event);
              await wait(mergedDelays.afterTurnEndMs);
              break;

            case "match_finished":
              await onMatchFinished?.(event);
              await wait(mergedDelays.afterTurnEndMs);
              break;

            default: {
              const exhaustiveCheck: never = event;
              throw new Error(
                `Evento no soportado en TurnEventPlayer: ${(exhaustiveCheck as TurnEvent).type}`,
              );
            }
          }

          await onEventEnd?.(event);
        }

        if (!cancelled && runIdRef.current === currentRunId) {
          if (playOncePerTurn) {
            playedKeysRef.current.add(playbackKey);
          }

          setPlaybackState("completed");
          await onPlaybackComplete?.(plan);
        }
      } catch (error) {
        if (!cancelled) {
          setPlaybackState("error");
          await onPlaybackError?.(error, plan);
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [
    enabled,
    plan,
    playOncePerTurn,
    mergedDelays,
    onEventStart,
    onEventEnd,
    onPlaybackComplete,
    onPlaybackError,
    onTurnBlockedByPendingMinigame,
    onDiceRolled,
    onPieceMove,
    onTileLanded,
    onTileMessage,
    onStatusApplied,
    onChaosCardDrawn,
    onMinigameStarted,
    onMinigamePending,
    onMinigameResolved,
    onTurnEnded,
    onMatchFinished,
  ]);

  return null;
}