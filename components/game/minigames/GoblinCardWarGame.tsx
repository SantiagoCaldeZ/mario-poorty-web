"use client";

import { useMemo, useState } from "react";

type CardSuit = "hearts" | "diamonds" | "clubs" | "spades";

type GoblinCard = {
  id: string;
  rank: number;
  suit: CardSuit;
  label: string;
};

type GoblinCardWarResult = {
  result: "won" | "lost";
  playerCards: GoblinCard[];
  opponentCards: GoblinCard[];
  playerTotal: number;
  opponentTotal: number;
};

type GoblinCardWarGameProps = {
  sessionId: string;
  tileIndex: number;
  opponentUserId?: string | null;
  onResolve: (result: GoblinCardWarResult) => void | Promise<void>;
  onCancel?: () => void;
};

const SUITS: readonly CardSuit[] = ["hearts", "diamonds", "clubs", "spades"];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getSuitSymbol(suit: CardSuit): string {
  switch (suit) {
    case "hearts":
      return "♥";
    case "diamonds":
      return "♦";
    case "clubs":
      return "♣";
    case "spades":
      return "♠";
  }
}

function createRandomCard(index: number): GoblinCard {
  const rank = randomInt(1, 13);
  const suit = SUITS[randomInt(0, SUITS.length - 1)];
  const rankLabel =
    rank === 1
      ? "A"
      : rank === 11
        ? "J"
        : rank === 12
          ? "Q"
          : rank === 13
            ? "K"
            : String(rank);

  return {
    id: `card-${index}-${rank}-${suit}-${Math.random().toString(36).slice(2, 8)}`,
    rank,
    suit,
    label: `${rankLabel} ${getSuitSymbol(suit)}`,
  };
}

function drawHand(size: number): GoblinCard[] {
  return Array.from({ length: size }, (_, index) => createRandomCard(index));
}

function getSuitClassName(suit: CardSuit): string {
  return suit === "hearts" || suit === "diamonds"
    ? "text-rose-300"
    : "text-slate-100";
}

function sumHand(cards: GoblinCard[]): number {
  return cards.reduce((total, card) => total + card.rank, 0);
}

export default function GoblinCardWarGame({
  sessionId,
  tileIndex,
  opponentUserId,
  onResolve,
  onCancel,
}: GoblinCardWarGameProps) {
  const [isDealing, setIsDealing] = useState(false);
  const [isResolved, setIsResolved] = useState(false);
  const [playerCards, setPlayerCards] = useState<GoblinCard[]>([]);
  const [opponentCards, setOpponentCards] = useState<GoblinCard[]>([]);

  const playerTotal = useMemo(() => sumHand(playerCards), [playerCards]);
  const opponentTotal = useMemo(() => sumHand(opponentCards), [opponentCards]);

  const resolvedOutcome = useMemo<"won" | "lost" | null>(() => {
    if (!isResolved) return null;
    return playerTotal > opponentTotal ? "won" : "lost";
  }, [isResolved, playerTotal, opponentTotal]);

  const playerSlots = useMemo<Array<GoblinCard | null>>(() => {
    return playerCards.length > 0 ? playerCards : [null, null, null];
  }, [playerCards]);

  const opponentSlots = useMemo<Array<GoblinCard | null>>(() => {
    return opponentCards.length > 0 ? opponentCards : [null, null, null];
  }, [opponentCards]);

  async function handleDealCards() {
    setIsDealing(true);

    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 550);
    });

    const nextPlayerCards = drawHand(3);
    const nextOpponentCards = drawHand(3);

    setPlayerCards(nextPlayerCards);
    setOpponentCards(nextOpponentCards);
    setIsResolved(true);
    setIsDealing(false);
  }

  async function handleContinue() {
    if (!isResolved || !resolvedOutcome) return;

    await onResolve({
      result: resolvedOutcome,
      playerCards,
      opponentCards,
      playerTotal,
      opponentTotal,
    });
  }

  return (
    <div className="w-full max-w-3xl rounded-3xl border border-slate-700 bg-slate-950 shadow-2xl">
      <div className="border-b border-slate-800 px-6 py-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-100">
            Minijuego
          </span>
          <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-200">
            Casilla {tileIndex}
          </span>
          <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-200">
            Sesión {sessionId}
          </span>
        </div>

        <h2 className="mt-4 text-2xl font-bold text-slate-100">
          Guerra Goblin de Cartas
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-300">
          Cada lado roba 3 cartas. La suma mayor gana. Si pierdes, quedas
          bloqueado en esta casilla y deberás reintentar el minijuego en tu
          próximo turno.
        </p>

        <p className="mt-2 text-xs text-slate-400">
          Rival: {opponentUserId ?? "Rival automático del pantano"}
        </p>
      </div>

      <div className="grid gap-5 px-6 py-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
          <h3 className="text-lg font-bold text-slate-100">Tus cartas</h3>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {playerSlots.map((card, index) => (
              <div
                key={card ? card.id : `empty-player-${index}`}
                className="flex h-32 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950 text-center shadow-lg"
              >
                {card ? (
                  <div>
                    <div
                      className={`text-3xl font-bold ${getSuitClassName(card.suit)}`}
                    >
                      {card.label}
                    </div>
                    <div className="mt-2 text-sm text-slate-400">
                      Valor {card.rank}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">Sin revelar</div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
            <p className="text-sm text-slate-400">Tu total</p>
            <p className="mt-1 text-2xl font-bold text-slate-100">
              {isResolved ? playerTotal : "—"}
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
          <h3 className="text-lg font-bold text-slate-100">Rival</h3>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {opponentSlots.map((card, index) => (
              <div
                key={card ? card.id : `empty-opponent-${index}`}
                className="flex h-32 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950 text-center shadow-lg"
              >
                {card ? (
                  <div>
                    <div
                      className={`text-3xl font-bold ${getSuitClassName(card.suit)}`}
                    >
                      {card.label}
                    </div>
                    <div className="mt-2 text-sm text-slate-400">
                      Valor {card.rank}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">Sin revelar</div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
            <p className="text-sm text-slate-400">Total rival</p>
            <p className="mt-1 text-2xl font-bold text-slate-100">
              {isResolved ? opponentTotal : "—"}
            </p>
          </div>
        </section>
      </div>

      <div className="px-6 pb-6">
        {resolvedOutcome && (
          <div
            className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${
              resolvedOutcome === "won"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
                : "border-rose-500/30 bg-rose-500/10 text-rose-100"
            }`}
          >
            {resolvedOutcome === "won"
              ? "Ganaste la Guerra Goblin de Cartas. Quedas liberado de esta casilla."
              : "Perdiste la Guerra Goblin de Cartas. Quedarás pendiente en esta casilla."}
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isDealing}
              className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 font-semibold text-slate-100 transition hover:bg-slate-800 disabled:opacity-50"
            >
              Cancelar
            </button>
          )}

          {!isResolved ? (
            <button
              type="button"
              onClick={handleDealCards}
              disabled={isDealing}
              className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2 font-semibold text-red-100 transition hover:bg-red-500/20 disabled:opacity-50"
            >
              {isDealing ? "Repartiendo..." : "Repartir cartas"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleContinue}
              className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 font-semibold text-emerald-100 transition hover:bg-emerald-500/20"
            >
              Continuar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}