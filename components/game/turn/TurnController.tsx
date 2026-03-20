"use client";

import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { TileKind } from "@/lib/game/board/tile-types";
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
  TurnEndedEvent,
  TurnEvent,
  TurnPlan,
  TurnEventPlayerPlaybackState,
} from "@/lib/game/turn-engine/turn-event-types";
import TurnEventPlayer from "./TurnEventPlayer";
import TileResolutionModal from "./TileResolutionModal";

type MaybePromise<T = void> = T | Promise<T>;

type TileModalState = {
  open: boolean;
  title: string;
  description: string;
  tileKind: TileKind | null;
  tileIndex: number | null;
  autoCloseMs: number | null;
  resolve?: () => void;
};

type ActiveMinigameState = {
  open: boolean;
  event: MinigameStartedEvent | null;
};

export type TurnControllerProps = {
  plan: TurnPlan | null;
  enabled?: boolean;
  playOncePerTurn?: boolean;

  delays?: {
    defaultMs?: number;
    afterDiceMs?: number;
    afterMoveMs?: number;
    afterTileLandedMs?: number;
    afterStatusMs?: number;
    afterChaosMs?: number;
    afterTurnEndMs?: number;
  };

  onPlaybackStateChange?: (
    state: TurnEventPlayerPlaybackState,
  ) => MaybePromise;

  onEventStart?: (event: TurnEvent) => MaybePromise;
  onEventEnd?: (event: TurnEvent) => MaybePromise;
  onPlaybackComplete?: (plan: TurnPlan) => MaybePromise;
  onPlaybackError?: (error: unknown, plan: TurnPlan) => MaybePromise;

  onDiceRolled?: (event: DiceRolledEvent) => MaybePromise;
  onPieceMove?: (event: PieceMoveEvent) => MaybePromise;
  onTileLanded?: (event: TileLandedEvent) => MaybePromise;
  onStatusApplied?: (event: StatusAppliedEvent) => MaybePromise;
  onChaosCardDrawn?: (event: ChaosCardDrawnEvent) => MaybePromise;
  onMinigamePending?: (event: MinigamePendingEvent) => MaybePromise;
  onMinigameResolved?: (event: MinigameResolvedEvent) => MaybePromise;
  onTurnEnded?: (event: TurnEndedEvent) => MaybePromise;
  onMatchFinished?: (event: MatchFinishedEvent) => MaybePromise;

  /**
   * Si quieres mostrar toasts o banners al quedar bloqueado por minijuego.
   */
  onBlockedByPendingMinigame?: (
    event: import("@/lib/game/turn-engine/turn-event-types").TurnBlockedByPendingMinigameEvent,
  ) => MaybePromise;

  /**
   * Render opcional del minijuego activo.
   * TurnController controla cuándo se abre; tú decides cómo renderizarlo.
   */
  renderActiveMinigame?: (args: {
    activeMinigame: ActiveMinigameState;
    closeMinigame: () => void;
  }) => ReactNode;

  /**
   * Para personalizar el modal si luego quieres otra presentación.
   * Si no lo pasas, usa TileResolutionModal por defecto.
   */
  renderTileModal?: (args: {
    tileModal: TileModalState;
    closeTileModal: () => void;
  }) => ReactNode;
};

export default function TurnController({
  plan,
  enabled = true,
  playOncePerTurn = true,
  delays,
  onPlaybackStateChange,
  onEventStart,
  onEventEnd,
  onPlaybackComplete,
  onPlaybackError,
  onDiceRolled,
  onPieceMove,
  onTileLanded,
  onStatusApplied,
  onChaosCardDrawn,
  onMinigamePending,
  onMinigameResolved,
  onTurnEnded,
  onMatchFinished,
  onBlockedByPendingMinigame,
  renderActiveMinigame,
  renderTileModal,
}: TurnControllerProps) {
  const [tileModal, setTileModal] = useState<TileModalState>({
    open: false,
    title: "",
    description: "",
    tileKind: null,
    tileIndex: null,
    autoCloseMs: null,
  });

  const [activeMinigame, setActiveMinigame] = useState<ActiveMinigameState>({
    open: false,
    event: null,
  });

  const closeTileModal = useCallback(() => {
    setTileModal((current) => {
      current.resolve?.();

      return {
        open: false,
        title: "",
        description: "",
        tileKind: null,
        tileIndex: null,
        autoCloseMs: null,
      };
    });
  }, []);

  const openTileModal = useCallback((event: TileMessageEvent) => {
    return new Promise<void>((resolve) => {
      setTileModal({
        open: true,
        title: event.message.title,
        description: event.message.description,
        tileKind: event.tileKind,
        tileIndex: event.tileIndex,
        autoCloseMs: event.autoCloseMs ?? null,
        resolve,
      });
    });
  }, []);

  const closeMinigame = useCallback(() => {
    setActiveMinigame({
      open: false,
      event: null,
    });
  }, []);

  const defaultTileModal = useMemo(() => {
    return (
      <TileResolutionModal
        open={tileModal.open}
        title={tileModal.title}
        description={tileModal.description}
        tileKind={tileModal.tileKind}
        tileIndex={tileModal.tileIndex}
        autoCloseMs={tileModal.autoCloseMs}
        onClose={closeTileModal}
      />
    );
  }, [tileModal, closeTileModal]);

  return (
    <>
      <TurnEventPlayer
        plan={plan}
        enabled={enabled}
        playOncePerTurn={playOncePerTurn}
        delays={delays}
        onPlaybackStateChange={onPlaybackStateChange}
        onEventStart={onEventStart}
        onEventEnd={onEventEnd}
        onPlaybackComplete={onPlaybackComplete}
        onPlaybackError={onPlaybackError}
        onTurnBlockedByPendingMinigame={async (event) => {
          await onBlockedByPendingMinigame?.(event);
        }}
        onDiceRolled={async (event) => {
          await onDiceRolled?.(event);
        }}
        onPieceMove={async (event) => {
          await onPieceMove?.(event);
        }}
        onTileLanded={async (event) => {
          await onTileLanded?.(event);
        }}
        onTileMessage={async (event) => {
          await openTileModal(event);
        }}
        onStatusApplied={async (event) => {
          await onStatusApplied?.(event);
        }}
        onChaosCardDrawn={async (event) => {
          await onChaosCardDrawn?.(event);
        }}
        onMinigameStarted={async (event) => {
          setActiveMinigame({
            open: true,
            event,
          });
        }}
        onMinigamePending={async (event) => {
          await onMinigamePending?.(event);
        }}
        onMinigameResolved={async (event) => {
          await onMinigameResolved?.(event);
        }}
        onTurnEnded={async (event) => {
          await onTurnEnded?.(event);
        }}
        onMatchFinished={async (event) => {
          await onMatchFinished?.(event);
        }}
      />

      {renderTileModal
        ? renderTileModal({
            tileModal,
            closeTileModal,
          })
        : defaultTileModal}

      {renderActiveMinigame?.({
        activeMinigame,
        closeMinigame,
      })}
    </>
  );
}