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
  const submitOrderRef = useRef(onSubmitOrderNumber);
  const finalizeOrderRef = useRef(onFinalizeOrder);

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
    submitOrderRef.current = onSubmitOrderNumber;
  }, [onSubmitOrderNumber]);

  useEffect(() => {
    finalizeOrderRef.current = onFinalizeOrder;
  }, [onFinalizeOrder]);


  useEffect(() => {
    if (orderTargetNumber !== null && !hasStartedRollingRef.current) {
      setRollingNumber(orderTargetNumber);
      setShowResolvedOrder(true);
      setIsRolling(false);
      stopRandomSound();
      return;
    }

    const interval = window.setInterval(() => {
      const nextSeconds = calculateSecondsLeft();
      setSecondsLeft(nextSeconds);
      setTimeExpired(nextSeconds <= 0);
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
        await submitOrderRef.current(randomNumber);
      } finally {
        setIsAutoSubmitting(false);
      }
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [timeExpired, iAlreadySubmittedOrder, onSelectedOrderNumberChange]);


  useEffect(() => {
    if (!timeExpired) return;
    if (submittedPlayersCount !== players.length) return;
    if (hasStartedRollingRef.current) return;

    const start = async () => {
      hasStartedRollingRef.current = true;
      setIsFinalizingAutomatically(true);

      let finalNumber = orderTargetNumber;

      if (finalNumber === null && !hasAutoFinalizedRef.current) {
        hasAutoFinalizedRef.current = true;
        finalNumber = await finalizeOrderRef.current();
      }

      if (finalNumber !== null) {
        await runRollingSequence(finalNumber);
      }

      setIsFinalizingAutomatically(false);
    };

    start();
  }, [timeExpired, submittedPlayersCount, players.length, orderTargetNumber]);

  const statusText = (() => {
    if (orderTargetNumber !== null) return "Número ritual resuelto";
    if (isRolling) return "El tótem del tiempo está decidiendo el orden...";
    if (isFinalizingAutomatically || orderFinalizing) return "Calculando el orden final...";
    if (isAutoSubmitting) return "Asignando un número automáticamente...";
    if (timeExpired) return "El tiempo terminó";
    return "La tribu aún está fijando sus números";
  })();

  const secondsProgress = Math.max(
    0,
    Math.min((secondsLeft / ORDER_SELECTION_SECONDS) * 100, 100)
  );

  const phaseLabel = (() => {
    if (orderTargetNumber !== null) return "Orden sellado";
    if (isRolling) return "Resolviendo";
    if (timeExpired) return "Tiempo agotado";
    return "Selección abierta";
  })();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#132417_0%,#0B140D_38%,#040706_100%)] text-[#F3F8EF]">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(123,181,90,0.08),transparent_22%,transparent_78%,rgba(226,197,117,0.06))]" />
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,rgba(235,245,220,0.85)_1px,transparent_1px),linear-gradient(to_bottom,rgba(235,245,220,0.85)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(123,181,90,0.16),transparent_18%),radial-gradient(circle_at_86%_14%,rgba(226,197,117,0.14),transparent_18%),radial-gradient(circle_at_22%_84%,rgba(79,224,167,0.09),transparent_16%)]" />

      <div className="pointer-events-none absolute left-[8%] top-[14%] h-40 w-40 rounded-full bg-[#7BB55A]/12 blur-3xl" />
      <div className="pointer-events-none absolute right-[8%] top-[14%] h-44 w-44 rounded-full bg-[#E2C575]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[10%] left-[18%] h-36 w-36 rounded-full bg-[#4FE0A7]/8 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[38px] border border-[#E3EDD5]/10 bg-[linear-gradient(180deg,rgba(16,25,18,0.96),rgba(8,12,9,0.98))] shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
          <div className="border-b border-[#E3EDD5]/10 bg-[linear-gradient(90deg,rgba(123,181,90,0.18),rgba(226,197,117,0.10),rgba(79,224,167,0.05))] px-6 py-5">
            <p className="text-[11px] font-black uppercase tracking-[0.36em] text-[#CAE9B8]">
              Ritual de orden
            </p>
          </div>

          <div className="grid gap-6 p-6 xl:grid-cols-[1.06fr_0.94fr]">
            <section className="space-y-6">
              <div className="overflow-hidden rounded-[34px] border border-[#E3EDD5]/10 bg-[linear-gradient(135deg,rgba(27,40,23,0.98),rgba(12,19,13,0.98))] shadow-[0_18px_45px_rgba(0,0,0,0.24)]">
                <div className="border-b border-[#E3EDD5]/10 bg-[linear-gradient(90deg,rgba(123,181,90,0.16),rgba(226,197,117,0.08))] px-6 py-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[#7BB55A]/16 bg-[#7BB55A]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#CAE9B8]">
                      Fase de selección
                    </span>
                    <span className="rounded-full border border-[#E2C575]/16 bg-[#E2C575]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#F4E4A5]">
                      {phaseLabel}
                    </span>
                    <span className="rounded-full border border-[#4FE0A7]/16 bg-[#4FE0A7]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#C8FFE5]">
                      {submittedPlayersCount}/{players.length} listos
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h1 className="text-4xl font-black leading-tight text-[#FAFCEE] sm:text-5xl">
                    Definición de
                    <span className="bg-[linear-gradient(135deg,#E2C575_0%,#7BB55A_45%,#4FE0A7_100%)] bg-clip-text text-transparent">
                      {" "}
                      orden
                    </span>
                  </h1>

                  <p className="mt-4 max-w-3xl text-base leading-7 text-[#D6E2D0]/82">
                    Cada goblin debe fijar un número entre 1 y 1000 antes de que
                    el reloj sagrado se agote. Si alguien no lo hace a tiempo, el
                    ritual decidirá por él.
                  </p>

                  {serverError && (
                    <div className="mt-5 rounded-[22px] border border-[#FFB7A7]/14 bg-[#341D16] px-4 py-4 text-sm text-[#FFD7CF]">
                      {serverError}
                    </div>
                  )}

                  <div className="mt-6 grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
                    <div className="rounded-[28px] border border-[#E3EDD5]/10 bg-[#0E160F]/78 p-5">
                      <div className="flex items-center justify-center">
                        <Image
                          src="/order/Reloj.gif"
                          alt="Reloj ritual"
                          width={150}
                          height={150}
                          className="h-32 w-32 object-contain drop-shadow-[0_10px_22px_rgba(0,0,0,0.22)]"
                          unoptimized
                        />
                      </div>

                      <div className="mt-5 rounded-[22px] border border-[#E3EDD5]/10 bg-[linear-gradient(135deg,rgba(123,181,90,0.08),rgba(15,22,16,0.92))] p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#CAE9B8]">
                          Tiempo restante
                        </p>
                        <div className="mt-3 flex items-end justify-between gap-3">
                          <p className="text-4xl font-black text-[#FAFCEE]">
                            {secondsLeft}s
                          </p>
                          <p className="text-sm font-semibold text-[#D6E2D0]/70">
                            {timeExpired ? "Tiempo agotado" : "Reloj en curso"}
                          </p>
                        </div>

                        <div className="mt-4 h-3 rounded-full bg-[#172119]">
                          <div
                            className="h-3 rounded-full bg-[linear-gradient(90deg,#E2C575_0%,#7BB55A_52%,#4FE0A7_100%)] transition-all duration-300"
                            style={{ width: `${secondsProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[28px] border border-[#E3EDD5]/10 bg-[linear-gradient(135deg,rgba(226,197,117,0.08),rgba(15,22,16,0.95))] p-5">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#F4E4A5]">
                        Número ritual aleatorio
                      </p>

                      <div className="mt-5 flex flex-col items-center text-center">
                        <div className="relative flex h-52 w-52 items-center justify-center rounded-full border-[10px] border-[#E2C575]/40 bg-[radial-gradient(circle_at_top,#F7FAF1_0%,#E7F0D8_42%,#D7E3C7_100%)] shadow-[0_0_0_10px_rgba(123,181,90,0.06),0_18px_45px_rgba(0,0,0,0.22)]">
                          <div className="absolute inset-4 rounded-full border border-[#7BB55A]/20" />
                          <span className="text-6xl font-black text-[#152215]">
                            {rollingNumber ?? "?"}
                          </span>
                        </div>

                        <p className="mt-5 text-sm leading-6 text-[#D6E2D0]/78">
                          {statusText}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-[34px] border border-[#E3EDD5]/10 bg-[linear-gradient(180deg,rgba(16,24,17,0.98),rgba(9,13,10,0.98))] shadow-[0_18px_45px_rgba(0,0,0,0.24)]">
                <div className="border-b border-[#E3EDD5]/10 bg-[linear-gradient(90deg,rgba(79,224,167,0.12),rgba(123,181,90,0.08))] px-6 py-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#C8FFE5]">
                        Tu elección
                      </p>
                      <h2 className="mt-2 text-3xl font-black text-[#FAFCEE]">
                        Número del goblin
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-[#E2C575]/16 bg-[#E2C575]/10 px-4 py-2 text-sm font-black text-[#F4E4A5]">
                        Tiempo: {secondsLeft}s
                      </span>
                      <span className="rounded-full border border-[#E3EDD5]/10 bg-[#121A13] px-4 py-2 text-sm font-semibold text-[#E7F0DC]">
                        {submittedPlayersCount} / {players.length} listos
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {iAlreadySubmittedOrder ? (
                    <div className="rounded-[26px] border border-[#4FE0A7]/16 bg-[linear-gradient(135deg,rgba(79,224,167,0.12),rgba(15,22,16,0.98))] p-5">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#C8FFE5]">
                        Número fijado
                      </p>
                      <p className="mt-3 text-5xl font-black text-[#FAFCEE]">
                        {myPlayer?.selected_order_number}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-[#D6E2D0]/76">
                        Tu número ya quedó sellado dentro del ritual. Ahora solo
                        espera a que la tribu termine de elegir.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm leading-6 text-[#D6E2D0]/78">
                        Escribe un número entero del 1 al 1000 y pulsa
                        <span className="font-bold text-[#FAFCEE]"> Fijar</span> para
                        confirmar tu elección.
                      </p>

                      <div className="flex flex-col gap-4 lg:flex-row">
                        <input
                          type="number"
                          min={1}
                          max={1000}
                          value={selectedOrderNumber}
                          onChange={(event) =>
                            onSelectedOrderNumberChange(event.target.value)
                          }
                          disabled={timeExpired || orderSubmitting || isAutoSubmitting}
                          className="w-full rounded-[24px] border-2 border-[#E2C575]/20 bg-[linear-gradient(135deg,rgba(226,197,117,0.10),rgba(15,22,16,0.98))] px-5 py-5 text-3xl font-black text-[#FAFCEE] outline-none transition placeholder:text-[#A7B29B]/44 focus:border-[#E2C575]/50 disabled:cursor-not-allowed disabled:opacity-60"
                          placeholder="1 - 1000"
                        />

                        <button
                          type="button"
                          onMouseEnter={playHoverSound}
                          onClick={handleSubmitClick}
                          disabled={timeExpired || orderSubmitting || isAutoSubmitting}
                          className="rounded-[24px] bg-[linear-gradient(135deg,#E2C575_0%,#9ECB63_45%,#4FE0A7_100%)] px-7 py-5 text-lg font-black uppercase tracking-[0.12em] text-[#112013] shadow-[0_16px_34px_rgba(123,181,90,0.18)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {orderSubmitting || isAutoSubmitting ? "Fijando..." : "Fijar"}
                        </button>
                      </div>

                      <div className="rounded-[22px] border border-[#E3EDD5]/10 bg-[#101711] px-4 py-4">
                        <p className="text-sm leading-6 text-[#D6E2D0]/74">
                          Si el reloj termina antes de que fijes tu número, el
                          sistema elegirá uno aleatorio automáticamente por ti.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {showResolvedOrder && orderedPlayers.length > 0 && (
                <div className="overflow-hidden rounded-[34px] border border-[#E3EDD5]/10 bg-[linear-gradient(180deg,rgba(18,28,20,0.98),rgba(10,14,11,0.98))] shadow-[0_18px_45px_rgba(0,0,0,0.24)]">
                  <div className="border-b border-[#E3EDD5]/10 bg-[linear-gradient(90deg,rgba(226,197,117,0.14),rgba(79,224,167,0.08))] px-6 py-5">
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#F4E4A5]">
                      Orden resultante
                    </p>
                    <h2 className="mt-2 text-3xl font-black text-[#FAFCEE]">
                      La ruta quedó definida
                    </h2>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4">
                      {orderedPlayers.map((player, index) => {
                        const isCurrentUser = player.user_id === currentUserId;
                        const badgeTone =
                          index === 0
                            ? "border-[#E2C575]/16 bg-[#E2C575]/10 text-[#F4E4A5]"
                            : index === 1
                            ? "border-[#C0D7A0]/16 bg-[#C0D7A0]/10 text-[#EAF3D0]"
                            : index === 2
                            ? "border-[#4FE0A7]/16 bg-[#4FE0A7]/10 text-[#C8FFE5]"
                            : "border-[#E3EDD5]/10 bg-[#131A14] text-[#E7F0DC]";

                        return (
                          <div
                            key={player.id}
                            className={`rounded-[24px] border px-4 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.16)] ${
                              isCurrentUser
                                ? "border-[#4FE0A7]/16 bg-[linear-gradient(135deg,rgba(79,224,167,0.12),rgba(15,22,16,0.98))]"
                                : "border-[#E3EDD5]/10 bg-[linear-gradient(135deg,rgba(226,197,117,0.05),rgba(15,22,16,0.98))]"
                            }`}
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`rounded-full border px-4 py-2 text-sm font-black uppercase tracking-[0.12em] ${badgeTone}`}
                                >
                                  {player.turn_order}°
                                </div>

                                <div>
                                  <p className="text-lg font-black text-[#FAFCEE]">
                                    {player.username ?? "Sin username"}
                                    {isCurrentUser ? " (Tú)" : ""}
                                  </p>
                                  <p className="mt-1 text-sm text-[#D6E2D0]/72">
                                    Número elegido: {player.selected_order_number ?? "-"}
                                  </p>
                                </div>
                              </div>

                              {index === 0 && (
                                <span className="rounded-full border border-[#E2C575]/16 bg-[#E2C575]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#F4E4A5]">
                                  Primer turno
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </section>

            <aside className="space-y-6">
              <div className="overflow-hidden rounded-[34px] border border-[#E3EDD5]/10 bg-[linear-gradient(180deg,rgba(17,25,18,0.98),rgba(9,13,10,0.98))] shadow-[0_18px_45px_rgba(0,0,0,0.24)]">
                <div className="border-b border-[#E3EDD5]/10 bg-[linear-gradient(90deg,rgba(123,181,90,0.14),rgba(79,224,167,0.08))] px-6 py-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#CAE9B8]">
                        Tribu del ritual
                      </p>
                      <h2 className="mt-2 text-3xl font-black text-[#FAFCEE]">
                        Jugadores
                      </h2>
                    </div>

                    <div className="rounded-[18px] border border-[#7BB55A]/16 bg-[#7BB55A]/10 px-4 py-3 text-center">
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#CAE9B8]">
                        Total
                      </p>
                      <p className="mt-1 text-2xl font-black text-[#FAFCEE]">
                        {players.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {players.map((player) => {
                      const isCurrentUser = player.user_id === currentUserId;
                      const hasSubmitted = player.selected_order_number !== null;
                      const playerInitial =
                        player.username?.slice(0, 1).toUpperCase() ?? "G";

                      return (
                        <div
                          key={player.id}
                          className={`rounded-[24px] border px-4 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.16)] ${
                            isCurrentUser
                              ? "border-[#E2C575]/18 bg-[linear-gradient(135deg,rgba(226,197,117,0.12),rgba(15,22,16,0.98))]"
                              : "border-[#E3EDD5]/10 bg-[linear-gradient(135deg,rgba(123,181,90,0.08),rgba(15,22,16,0.98))]"
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className={`flex h-14 w-14 items-center justify-center rounded-[20px] text-xl font-black shadow-[0_10px_20px_rgba(0,0,0,0.22)] ${
                                isCurrentUser
                                  ? "bg-[linear-gradient(135deg,#E2C575_0%,#9ECB63_100%)] text-[#102012]"
                                  : hasSubmitted
                                  ? "bg-[linear-gradient(135deg,#4FE0A7_0%,#88F0C1_100%)] text-[#08140F]"
                                  : "bg-[linear-gradient(135deg,#243025_0%,#3B4E3E_100%)] text-[#F2F7EA]"
                              }`}
                            >
                              {playerInitial}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="truncate text-lg font-black text-[#FAFCEE]">
                                  {player.username ?? "Sin username"}
                                  {isCurrentUser ? " (Tú)" : ""}
                                </p>

                                <span
                                  className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${
                                    hasSubmitted
                                      ? "border border-[#4FE0A7]/16 bg-[#4FE0A7]/10 text-[#C8FFE5]"
                                      : "border border-[#E3EDD5]/10 bg-[#121912] text-[#D7E0CE]"
                                  }`}
                                >
                                  {hasSubmitted ? "Listo" : "Esperando"}
                                </span>
                              </div>

                              <p className="mt-2 text-sm text-[#D6E2D0]/72">
                                {hasSubmitted
                                  ? "Ya selló su número dentro del ritual."
                                  : "Todavía no ha fijado un número."}
                              </p>

                              {hasSubmitted && (
                                <div className="mt-3 rounded-[18px] border border-[#E3EDD5]/10 bg-[#111811] px-3 py-3 text-sm text-[#E7F0DC]">
                                  <span className="font-bold">Número elegido:</span>{" "}
                                  {player.selected_order_number}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-[34px] border border-[#E3EDD5]/10 bg-[linear-gradient(180deg,rgba(17,25,18,0.98),rgba(9,13,10,0.98))] shadow-[0_18px_45px_rgba(0,0,0,0.24)]">
                <div className="border-b border-[#E3EDD5]/10 bg-[linear-gradient(90deg,rgba(79,224,167,0.12),rgba(123,181,90,0.08))] px-6 py-5">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#C8FFE5]">
                    Acciones del campamento
                  </p>
                </div>

                <div className="p-6">
                  <button
                    type="button"
                    onMouseEnter={playHoverSound}
                    onClick={onGoHome}
                    className="rounded-[22px] border border-[#E3EDD5]/10 bg-[#121912] px-5 py-4 text-sm font-black uppercase tracking-[0.12em] text-[#F2F7EA] transition hover:bg-[#182019]"
                  >
                    Volver al inicio
                  </button>

                  <p className="mt-4 text-sm leading-6 text-[#D6E2D0]/74">
                    Cuando el tiempo termine, el ritual finalizará automáticamente
                    y el sistema definirá el orden de turnos para toda la tribu.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}