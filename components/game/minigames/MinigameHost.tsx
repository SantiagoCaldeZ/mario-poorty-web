"use client";

import type { MinigameStartedEvent } from "@/lib/game/turn-engine/turn-event-types";
import type { MinigameResolvePayload } from "@/types/minigames";
import GoblinCardWarGame from "./GoblinCardWarGame";
import MemoryRelicsGame from "./MemoryRelicsGame";
import ShamanRunesGame from "./ShamanRunesGame";
import SwampPathGame from "./SwampPathGame";
import TotemRitualGame from "./TotemRitualGame";

export type MinigameHostProps = {
  event: MinigameStartedEvent;
  onResolve: (payload: MinigameResolvePayload) => void | Promise<void>;
  onCancel?: () => void;
};

export default function MinigameHost({ event, onResolve, onCancel }: MinigameHostProps) {
  const commonProps = {
    sessionId: event.sessionId,
    tileIndex: event.tileIndex,
    opponentUserId: event.opponentUserId ?? null,
    onResolve,
    onCancel,
  };

  switch (event.minigameKey) {
    case "goblin_card_war":
      return <GoblinCardWarGame {...commonProps} />;
    case "memory_relics":
      return <MemoryRelicsGame {...commonProps} />;
    case "swamp_path":
      return <SwampPathGame {...commonProps} />;
    case "totem_ritual":
      return <TotemRitualGame {...commonProps} />;
    case "shaman_runes":
      return <ShamanRunesGame {...commonProps} />;
  }
}
