"use client";

import { useEffect, useMemo } from "react";
import type { TileKind } from "@/lib/game/board/tile-types";

export type TileResolutionModalProps = {
  open: boolean;
  title: string;
  description: string;
  tileKind?: TileKind | null;
  tileIndex?: number | null;
  autoCloseMs?: number | null;
  continueLabel?: string;
  disableManualClose?: boolean;
  isBusy?: boolean;
  onClose: () => void;
};

type TilePresentation = {
  emoji: string;
  badge: string;
  accentClassName: string;
};

function getTilePresentation(tileKind?: TileKind | null): TilePresentation {
  switch (tileKind) {
    case "bonus_loot":
      return {
        emoji: "💰",
        badge: "Bonus",
        accentClassName:
          "border-emerald-400/50 bg-emerald-500/10 text-emerald-100",
      };

    case "bonus_blessing":
      return {
        emoji: "🛡️",
        badge: "Bonus",
        accentClassName:
          "border-cyan-400/50 bg-cyan-500/10 text-cyan-100",
      };

    case "bonus_favorable_die":
      return {
        emoji: "🎲",
        badge: "Bonus",
        accentClassName:
          "border-lime-400/50 bg-lime-500/10 text-lime-100",
      };

    case "trap_mud":
      return {
        emoji: "🪵",
        badge: "Trampa",
        accentClassName:
          "border-amber-500/50 bg-amber-500/10 text-amber-100",
      };

    case "trap_curse":
      return {
        emoji: "☠️",
        badge: "Trampa",
        accentClassName:
          "border-rose-500/50 bg-rose-500/10 text-rose-100",
      };

    case "trap_weakened_die":
      return {
        emoji: "🎲",
        badge: "Trampa",
        accentClassName:
          "border-orange-500/50 bg-orange-500/10 text-orange-100",
      };

    case "movement_mushroom_portal":
      return {
        emoji: "🍄",
        badge: "Movimiento",
        accentClassName:
          "border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-100",
      };

    case "movement_root_shortcut":
      return {
        emoji: "🌿",
        badge: "Movimiento",
        accentClassName:
          "border-green-500/50 bg-green-500/10 text-green-100",
      };

    case "chaos_deck":
      return {
        emoji: "🃏",
        badge: "Caos",
        accentClassName:
          "border-violet-500/50 bg-violet-500/10 text-violet-100",
      };

    case "memory_relics":
      return {
        emoji: "🧠",
        badge: "Minijuego",
        accentClassName:
          "border-sky-500/50 bg-sky-500/10 text-sky-100",
      };

    case "goblin_card_war":
      return {
        emoji: "♠️",
        badge: "Minijuego",
        accentClassName:
          "border-red-500/50 bg-red-500/10 text-red-100",
      };

    case "swamp_path":
      return {
        emoji: "🗺️",
        badge: "Minijuego",
        accentClassName:
          "border-teal-500/50 bg-teal-500/10 text-teal-100",
      };

    case "totem_ritual":
      return {
        emoji: "🗿",
        badge: "Minijuego",
        accentClassName:
          "border-yellow-500/50 bg-yellow-500/10 text-yellow-100",
      };

    case "shaman_runes":
      return {
        emoji: "🔮",
        badge: "Minijuego",
        accentClassName:
          "border-indigo-500/50 bg-indigo-500/10 text-indigo-100",
      };

    case "finish":
      return {
        emoji: "🏁",
        badge: "Meta",
        accentClassName:
          "border-emerald-400/50 bg-emerald-500/10 text-emerald-100",
      };

    case "start":
      return {
        emoji: "🚩",
        badge: "Inicio",
        accentClassName:
          "border-slate-400/50 bg-slate-500/10 text-slate-100",
      };

    case "normal":
    default:
      return {
        emoji: "🪨",
        badge: "Casilla",
        accentClassName:
          "border-slate-500/50 bg-slate-500/10 text-slate-100",
      };
  }
}

export default function TileResolutionModal({
  open,
  title,
  description,
  tileKind = null,
  tileIndex = null,
  autoCloseMs = null,
  continueLabel = "Continuar",
  disableManualClose = false,
  isBusy = false,
  onClose,
}: TileResolutionModalProps) {
  const presentation = useMemo(
    () => getTilePresentation(tileKind),
    [tileKind],
  );

  useEffect(() => {
    if (!open) return;
    if (!autoCloseMs || autoCloseMs <= 0) return;
    if (disableManualClose) return;

    const timeout = window.setTimeout(() => {
      onClose();
    }, autoCloseMs);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [open, autoCloseMs, disableManualClose, onClose]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !disableManualClose && !isBusy) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, disableManualClose, isBusy, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4">
      <div
        className="absolute inset-0"
        onClick={() => {
          if (!disableManualClose && !isBusy) {
            onClose();
          }
        }}
      />

      <div className="relative z-[121] w-full max-w-md overflow-hidden rounded-3xl border border-slate-700 bg-slate-950 shadow-2xl">
        <div
          className={`border-b px-5 py-4 ${presentation.accentClassName}`}
        >
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-3xl">
              <span aria-hidden="true">{presentation.emoji}</span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide">
                  {presentation.badge}
                </span>

                {tileIndex != null && (
                  <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-semibold">
                    Casilla {tileIndex}
                  </span>
                )}
              </div>

              <h2 className="text-lg font-bold leading-tight sm:text-xl">
                {title}
              </h2>
            </div>
          </div>
        </div>

        <div className="px-5 py-5">
          <p className="text-sm leading-6 text-slate-200 sm:text-base">
            {description}
          </p>

          {autoCloseMs != null && autoCloseMs > 0 && !disableManualClose && (
            <p className="mt-3 text-xs text-slate-400">
              Este mensaje se cerrará automáticamente.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-800 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={disableManualClose || isBusy}
            className="inline-flex min-w-28 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isBusy ? "Procesando..." : continueLabel}
          </button>
        </div>
      </div>
    </div>
  );
}