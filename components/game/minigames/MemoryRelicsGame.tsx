"use client";

import { useMemo, useState } from "react";
import type { BaseMinigameProps } from "@/types/minigames";

type MemoryCard = {
  id: string;
  symbol: string;
  pairId: string;
};

const SYMBOLS = ["🪙", "🗝️", "📜", "💎", "🍄", "🗡️"] as const;

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

function createDeck(): MemoryCard[] {
  const base = SYMBOLS.flatMap((symbol, index) => [
    { id: `${index}-a`, symbol, pairId: `${index}` },
    { id: `${index}-b`, symbol, pairId: `${index}` },
  ]);
  return shuffle(base);
}

export default function MemoryRelicsGame({ sessionId, tileIndex, opponentUserId, onResolve, onCancel }: BaseMinigameProps<{ matchedPairs: number }>) {
  const [deck, setDeck] = useState<MemoryCard[]>(() => createDeck());
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const matchedPairs = matchedPairIds.size;
  const totalPairs = SYMBOLS.length;
  const won = matchedPairs >= 3;

  const visibleIds = useMemo(() => new Set([...revealedIds, ...deck.filter((card) => matchedPairIds.has(card.pairId)).map((card) => card.id)]), [revealedIds, matchedPairIds, deck]);

  async function reveal(card: MemoryCard) {
    if (busy) return;
    if (visibleIds.has(card.id)) return;
    if (revealedIds.length >= 2) return;

    const nextRevealed = [...revealedIds, card.id];
    setRevealedIds(nextRevealed);

    if (nextRevealed.length < 2) return;

    setBusy(true);
    const [firstId, secondId] = nextRevealed;
    const firstCard = deck.find((entry) => entry.id === firstId)!;
    const secondCard = deck.find((entry) => entry.id === secondId)!;

    await new Promise<void>((resolve) => window.setTimeout(resolve, 650));

    if (firstCard.pairId === secondCard.pairId) {
      setMatchedPairIds((current) => new Set([...current, firstCard.pairId]));
    }

    setRevealedIds([]);
    setBusy(false);
  }

  return (
    <div className="w-full max-w-4xl rounded-3xl border border-slate-700 bg-slate-950 shadow-2xl">
      <div className="border-b border-slate-800 px-6 py-5">
        <h2 className="text-2xl font-bold text-slate-100">Memory de Reliquias</h2>
        <p className="mt-2 text-sm text-slate-300">Casilla {tileIndex} · Sesión {sessionId} · Rival {opponentUserId ?? "auto"}. Consigue al menos 3 pares para ganar esta versión inicial.</p>
      </div>
      <div className="px-6 py-5">
        <div className="mb-4 text-sm text-slate-300">Pares encontrados: <span className="font-semibold text-slate-100">{matchedPairs}</span> / {totalPairs}</div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {deck.map((card) => {
            const isVisible = visibleIds.has(card.id);
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => void reveal(card)}
                className="flex h-24 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 text-3xl transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={busy || isVisible}
              >
                {isVisible ? card.symbol : "❔"}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex flex-wrap justify-end gap-3 border-t border-slate-800 px-6 py-4">
        {onCancel ? <button type="button" onClick={onCancel} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 font-semibold text-slate-100 transition hover:bg-slate-800">Cancelar</button> : null}
        <button type="button" onClick={() => void onResolve({ result: won ? "won" : "lost", details: { matchedPairs } })} className="rounded-2xl bg-emerald-500 px-4 py-2 font-semibold text-emerald-950 transition hover:bg-emerald-400">{won ? "Confirmar victoria" : "Cerrar como derrota"}</button>
      </div>
    </div>
  );
}
