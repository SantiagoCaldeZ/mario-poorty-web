"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type MatchPlayerRow = {
  id: string;
  match_id: string;
  user_id: string;
  character_name: string | null;
  turn_order: number;
  board_position: number;
  is_finished: boolean;
  joined_at: string;
  selected_order_number: number | null;
  order_number_submitted_at: string | null;
  username: string | null;
};

type OrderSelectionScreenProps = {
  players: MatchPlayerRow[];
  currentUserId: string | null;
  selectedOrderNumber: string;
  onSelectedOrderNumberChange: (value: string) => void;
  onSubmitOrderNumber: (forcedNumber?: number) => Promise<void> | void;
  onFinalizeOrder: () => Promise<number | null>;
  onGoHome: () => void;
  orderSubmitting: boolean;
  orderFinalizing: boolean;
  serverError: string;
  orderTargetNumber: number | null;
  startedAt: string;
};

const ORDER_SELECTION_SECONDS = 15;

export default function OrderSelectionScreen({
  players,
  currentUserId,
  selectedOrderNumber,
  onSelectedOrderNumberChange,
  onSubmitOrderNumber,
  onFinalizeOrder,
  onGoHome,
  orderSubmitting,
  orderFinalizing,
  serverError,
  orderTargetNumber,
  startedAt,
}: OrderSelectionScreenProps) {
  const hoverAudioRef = useRef<HTMLAudioElement | null>(null);
  const randomAudioRef = useRef<HTMLAudioElement | null>(null);

  const calculateSecondsLeft = () => {
    const startedAtMs = new Date(startedAt).getTime();
    const deadlineMs = startedAtMs + ORDER_SELECTION_SECONDS * 1000;
    const nowMs = Date.now();
    return Math.max(0, Math.ceil((deadlineMs - nowMs) / 1000));
  };

  const [secondsLeft, setSecondsLeft] = useState(calculateSecondsLeft);
  const [timeExpired, setTimeExpired] = useState(false);
  const [rollingNumber, setRollingNumber] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false);
  const [isFinalizingAutomatically, setIsFinalizingAutomatically] = useState(false);
  const [showResolvedOrder, setShowResolvedOrder] = useState(false);

  const hasAutoSubmittedRef = useRef(false);
  const hasAutoFinalizedRef = useRef(false);
  const hasStartedRollingRef = useRef(false);

  const submittedPlayersCount = players.filter(
    (player) => player.selected_order_number !== null
  ).length;

  const myPlayer = players.find((player) => player.user_id === currentUserId);
  const iAlreadySubmittedOrder = myPlayer?.selected_order_number !== null;

  const orderedPlayers = [...players]
    .filter((player) => player.turn_order > 0)
    .sort((a, b) => a.turn_order - b.turn_order);

  const playHoverSound = () => {
    if (!hoverAudioRef.current) {
      hoverAudioRef.current = new Audio("/sounds/SonidoRandom.mav");
      hoverAudioRef.current.volume = 0.25;
    }

    hoverAudioRef.current.currentTime = 0;
    hoverAudioRef.current.play().catch(() => {});
  };

  const playRandomSound = () => {
    if (!randomAudioRef.current) {
      randomAudioRef.current = new Audio("/sounds/SonidoRandom.wav");
      randomAudioRef.current.volume = 0.45;
      randomAudioRef.current.loop = true;
    }

    randomAudioRef.current.currentTime = 0;
    randomAudioRef.current.play().catch(() => {});
  };

  const stopRandomSound = () => {
    if (!randomAudioRef.current) return;
    randomAudioRef.current.pause();
    randomAudioRef.current.currentTime = 0;
  };

  const runRollingSequence = async (finalNumber: number) => {
    setIsRolling(true);
    setShowResolvedOrder(false);
    playRandomSound();

    const phases = [
      { repeats: 10, delay: 150 },
      { repeats: 11, delay: 300 },
      { repeats: 3, delay: 500 },
    ];

    for (const phase of phases) {
      for (let i = 0; i < phase.repeats; i++) {
        setRollingNumber(Math.floor(Math.random() * 1000) + 1);
        await new Promise((resolve) => window.setTimeout(resolve, phase.delay));
      }
    }

    setRollingNumber(finalNumber);

    await new Promise((resolve) => window.setTimeout(resolve, 1200));

    stopRandomSound();
    setIsRolling(false);
    setShowResolvedOrder(true);
  };

  const handleSubmitClick = () => {
    playHoverSound();
    onSubmitOrder();
  };

  const onSubmitOrder = async () => {
    await onSubmitOrderNumber();
  };

  useEffect(() => {
    if (orderTargetNumber !== null) {
      setRollingNumber(orderTargetNumber);
      setShowResolvedOrder(true);
      setIsRolling(false);
      stopRandomSound();
      return;
    }

    const interval = window.setInterval(() => {
      const nextSeconds = calculateSecondsLeft();
      setSecondsLeft(nextSeconds);

      if (nextSeconds <= 0) {
        setTimeExpired(true);
      }
    }, 250);

    return () => window.clearInterval(interval);
  }, [orderTargetNumber, startedAt]);

  useEffect(() => {
    if (!timeExpired) return;
    if (iAlreadySubmittedOrder) return;
    if (hasAutoSubmittedRef.current) return;

    hasAutoSubmittedRef.current = true;
    setIsAutoSubmitting(true);

    const randomNumber = Math.floor(Math.random() * 1000) + 1;
    onSelectedOrderNumberChange(String(randomNumber));

    const timeout = window.setTimeout(async () => {
      try {
        await onSubmitOrderNumber(randomNumber);
      } finally {
        setIsAutoSubmitting(false);
      }
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [
    timeExpired,
    iAlreadySubmittedOrder,
    onSelectedOrderNumberChange,
    onSubmitOrderNumber,
  ]);

  useEffect(() => {
    if (!timeExpired) return;
    if (submittedPlayersCount !== players.length) return;
    if (hasStartedRollingRef.current) return;

    const start = async () => {
      hasStartedRollingRef.current = true;

      let finalNumber = orderTargetNumber;

      if (finalNumber === null) {
        finalNumber = await onFinalizeOrder();
      }

      if (finalNumber !== null) {
        await runRollingSequence(finalNumber);
      }
    };

    start();
  }, [timeExpired, submittedPlayersCount, players.length, orderTargetNumber, onFinalizeOrder]);

  const statusText = (() => {
    if (orderTargetNumber !== null) return "Orden definido";
    if (isRolling) return "Definiendo número aleatorio...";
    if (isFinalizingAutomatically || orderFinalizing) return "Calculando orden...";
    if (isAutoSubmitting) return "Asignando número automáticamente...";
    if (timeExpired) return "Tiempo terminado";
    return "Esperando números";
  })();

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 px-4 py-10">
      <div className="mx-auto max-w-6xl rounded-3xl border border-yellow-300/30 bg-white p-8 shadow-2xl">
        <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-6">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
                Definición de orden
              </h1>
              <p className="mt-3 max-w-3xl text-gray-600">
                Escoge un número entre 1 y 1000. Tienes 15 segundos. Si no lo fijas
                a tiempo, el sistema te asignará uno aleatorio automáticamente.
              </p>
            </div>

            {serverError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {serverError}
              </div>
            )}

            <div className="rounded-3xl border border-yellow-200 bg-gradient-to-br from-yellow-100 via-yellow-50 to-orange-100 p-6 shadow-sm">
              <div className="grid items-center gap-6 md:grid-cols-[auto_1fr]">
                <div className="flex justify-center">
                  <Image
                    src="/order/Reloj.gif"
                    alt="Reloj"
                    width={120}
                    height={120}
                    className="h-28 w-28 object-contain"
                    unoptimized
                  />
                </div>

                <div className="flex flex-col items-center text-center md:items-start md:text-left">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-700">
                    Número elegido aleatoriamente
                  </p>

                  <div className="mt-4 flex h-40 w-40 items-center justify-center rounded-full border-8 border-yellow-300 bg-white shadow-inner">
                    <span className="text-5xl font-black text-gray-900">
                      {rollingNumber ?? "?"}
                    </span>
                  </div>

                  <p className="mt-4 text-sm text-gray-600">{statusText}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Tu número</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Pulsa “Fijar” para confirmar tu elección.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="rounded-full bg-red-100 px-4 py-2 text-sm font-bold text-red-700">
                    Tiempo: {secondsLeft}s
                  </div>

                  <div className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
                    {submittedPlayersCount} / {players.length} listos
                  </div>
                </div>
              </div>

              {iAlreadySubmittedOrder ? (
                <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-4">
                  <p className="text-sm text-green-700">Ya fijaste tu número.</p>
                  <p className="mt-1 text-3xl font-black text-green-800">
                    {myPlayer?.selected_order_number}
                  </p>
                </div>
              ) : (
                <div className="mt-6 flex flex-col gap-4 lg:flex-row">
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={selectedOrderNumber}
                    onChange={(event) => onSelectedOrderNumberChange(event.target.value)}
                    disabled={timeExpired || orderSubmitting || isAutoSubmitting}
                    className="w-full rounded-2xl border-2 border-yellow-200 bg-yellow-50 px-5 py-4 text-2xl font-bold text-gray-900 outline-none transition focus:border-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
                    placeholder="1 - 1000"
                  />

                  <button
                    type="button"
                    onMouseEnter={playHoverSound}
                    onClick={handleSubmitClick}
                    disabled={timeExpired || orderSubmitting || isAutoSubmitting}
                    className="rounded-2xl bg-black px-6 py-4 text-lg font-bold text-white transition hover:scale-[1.02] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {orderSubmitting || isAutoSubmitting ? "Fijando..." : "Fijar"}
                  </button>
                </div>
              )}
            </div>

            {showResolvedOrder && orderedPlayers.length > 0 && (
              <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-blue-900">Orden resultante</h2>
                <div className="mt-4 space-y-3">
                  {orderedPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm text-gray-800"
                    >
                      <p className="font-semibold">
                        {player.turn_order}. {player.username ?? "Sin username"}
                        {player.user_id === currentUserId ? " (Tú)" : ""}
                      </p>
                      <p className="text-gray-600">
                        Número: {player.selected_order_number ?? "-"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900">Jugadores</h2>
              <p className="mt-1 text-sm text-gray-600">
                Estado actual de la selección de orden.
              </p>

              <div className="mt-5 space-y-3">
                {players.map((player) => {
                  const isCurrentUser = player.user_id === currentUserId;
                  const hasSubmitted = player.selected_order_number !== null;

                  return (
                    <div
                      key={player.id}
                      className={`rounded-2xl border px-4 py-4 transition ${
                        isCurrentUser
                          ? "border-yellow-300 bg-yellow-50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {player.username ?? "Sin username"}
                            {isCurrentUser ? " (Tú)" : ""}
                          </p>
                          <p className="mt-1 text-sm text-gray-600">
                            {hasSubmitted ? "Ya eligió número" : "Pendiente"}
                          </p>
                        </div>

                        <div
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            hasSubmitted
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {hasSubmitted ? "Listo" : "Esperando"}
                        </div>
                      </div>

                      {hasSubmitted && (
                        <div className="mt-3 rounded-xl bg-white px-3 py-2 text-sm text-gray-700">
                          <span className="font-semibold">Número elegido:</span>{" "}
                          {player.selected_order_number}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900">Acciones</h2>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onMouseEnter={playHoverSound}
                  onClick={onGoHome}
                  className="rounded-2xl border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-900 transition hover:bg-gray-50"
                >
                  Volver al inicio
                </button>
              </div>

              <p className="mt-4 text-sm text-gray-600">
                Cuando el tiempo termine, el sistema definirá el orden automáticamente.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}