"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { CHARACTER_OPTIONS } from "@/lib/characters";

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

type CharacterSelectionScreenProps = {
  players: MatchPlayerRow[];
  currentUserId: string | null;
  currentCharacterTurnOrder: number | null;
  currentCharacterTurnStartedAt: string | null;
  orderTargetNumber: number | null;
  selectingCharacter: string | null;
  onSelectCharacter: (characterName: string) => Promise<void> | void;
  onAutoSelectCharacter: () => Promise<"ok" | "retry">;
  onGoHome: () => void;
  selectionSubmitting: boolean;
  serverError: string;
};

const CHARACTER_SELECTION_SECONDS = 15;

export default function CharacterSelectionScreen({
  players,
  currentUserId,
  currentCharacterTurnOrder,
  currentCharacterTurnStartedAt,
  orderTargetNumber,
  selectingCharacter,
  onSelectCharacter,
  onAutoSelectCharacter,
  onGoHome,
  selectionSubmitting,
  serverError,
}: CharacterSelectionScreenProps) {
  const currentPicker = useMemo(
    () => players.find((player) => player.turn_order === currentCharacterTurnOrder) ?? null,
    [players, currentCharacterTurnOrder]
  );

  const myPlayer = useMemo(
    () => players.find((player) => player.user_id === currentUserId) ?? null,
    [players, currentUserId]
  );

  const isMyTurnToPick =
    myPlayer?.turn_order === currentCharacterTurnOrder &&
    myPlayer?.character_name === null;

  const takenCharacters = useMemo(
    () =>
      new Set(
        players
          .map((player) => player.character_name)
          .filter((character): character is string => character !== null)
      ),
    [players]
  );

  const availableCharacters = useMemo(
    () => CHARACTER_OPTIONS.filter((character) => !takenCharacters.has(character.name)),
    [takenCharacters]
  );

  const takenByMap = useMemo(
    () =>
      new Map(
        players
          .filter((player) => player.character_name !== null)
          .map((player) => [player.character_name as string, player.username ?? "Jugador"])
      ),
    [players]
  );

  const orderedPlayers = useMemo(
    () => [...players].sort((a, b) => a.turn_order - b.turn_order),
    [players]
  );

  const selectedCharactersCount = useMemo(
    () => players.filter((player) => player.character_name !== null).length,
    [players]
  );

  const progressPercentage =
    players.length > 0 ? Math.min((selectedCharactersCount / players.length) * 100, 100) : 0;

  const myChosenCharacter = myPlayer?.character_name ?? null;

  const calculateSecondsLeft = () => {
    if (!currentCharacterTurnStartedAt || currentCharacterTurnOrder === null) {
      return CHARACTER_SELECTION_SECONDS;
    }

    const startedAtMs = new Date(currentCharacterTurnStartedAt).getTime();
    const deadlineMs = startedAtMs + CHARACTER_SELECTION_SECONDS * 1000;
    const nowMs = Date.now();

    return Math.max(0, Math.ceil((deadlineMs - nowMs) / 1000));
  };

  const [secondsLeft, setSecondsLeft] = useState<number>(calculateSecondsLeft);
  const [timeExpired, setTimeExpired] = useState<boolean>(false);
  const [isAutoSelecting, setIsAutoSelecting] = useState<boolean>(false);
  const [autoRetryTick, setAutoRetryTick] = useState<number>(0);

  const currentTurnKey = `${currentCharacterTurnOrder ?? "none"}-${currentCharacterTurnStartedAt ?? "none"}`;
  const autoSelectionKeyRef = useRef<string | null>(null);

  const playHoverSound = () => {
    if (!isMyTurnToPick) return;

    const audio = new Audio("/sounds/seleccion.wav");
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  useEffect(() => {
    const nextSeconds = calculateSecondsLeft();
    setSecondsLeft(nextSeconds);
    setTimeExpired(nextSeconds <= 0);
    setIsAutoSelecting(false);
    autoSelectionKeyRef.current = null;
    setAutoRetryTick(0);
  }, [currentTurnKey]);

  useEffect(() => {
    if (!currentCharacterTurnStartedAt || currentCharacterTurnOrder === null) {
      setSecondsLeft(CHARACTER_SELECTION_SECONDS);
      setTimeExpired(false);
      return;
    }

    const updateClock = () => {
      const nextSeconds = calculateSecondsLeft();
      setSecondsLeft(nextSeconds);
      setTimeExpired(nextSeconds <= 0);
    };

    updateClock();

    const interval = window.setInterval(updateClock, 250);

    return () => window.clearInterval(interval);
  }, [currentCharacterTurnStartedAt, currentCharacterTurnOrder]);

  useEffect(() => {
    if (!timeExpired) return;
    if (!currentCharacterTurnStartedAt) return;
    if (!currentPicker) return;
    if (currentPicker.character_name !== null) return;
    if (availableCharacters.length === 0) return;
    if (autoSelectionKeyRef.current === currentTurnKey) return;

    autoSelectionKeyRef.current = currentTurnKey;
    setIsAutoSelecting(true);

    const timeout = window.setTimeout(async () => {
      const outcome = await onAutoSelectCharacter();

      if (outcome === "retry") {
        setIsAutoSelecting(false);
        autoSelectionKeyRef.current = null;

        window.setTimeout(() => {
          setAutoRetryTick((value) => value + 1);
        }, 400);

        return;
      }

      setIsAutoSelecting(false);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [
    availableCharacters.length,
    currentCharacterTurnStartedAt,
    currentPicker,
    currentTurnKey,
    onAutoSelectCharacter,
    timeExpired,
    autoRetryTick,
  ]);

  const statusTitle = (() => {
    if (isAutoSelecting) return "Asignando personaje automáticamente";
    if (isMyTurnToPick && !timeExpired) return "Es tu turno de elegir";
    if (timeExpired) return "Tiempo agotado";
    if (currentPicker?.character_name) return "Turno resuelto";
    return "Esperando selección";
  })();

  const statusBody = (() => {
    if (isAutoSelecting) {
      return "El tiempo terminó y el sistema está reclamando un campeón disponible para que la expedición continúe sin pausas.";
    }

    if (isMyTurnToPick && !timeExpired) {
      return "El salón de campeones está abierto para ti. Reclama tu personaje antes de que otro goblin ocupe su lugar.";
    }

    if (timeExpired) {
      return "Se acabó el tiempo de este turno. En cualquier momento se asignará un personaje disponible y avanzará el siguiente jugador.";
    }

    if (currentPicker) {
      return `Ahora mismo selecciona ${currentPicker.username ?? "otro jugador"}${
        currentPicker.user_id === currentUserId ? " (Tú)" : ""
      }.`;
    }

    return "La expedición aún no tiene un selector activo en este momento.";
  })();

  const phaseLabel = (() => {
    if (isAutoSelecting) return "Autoasignando";
    if (timeExpired) return "Tiempo agotado";
    if (currentPicker?.character_name) return "Turno resuelto";
    return "Selección abierta";
  })();

  const secondsProgress = Math.max(
    0,
    Math.min((secondsLeft / CHARACTER_SELECTION_SECONDS) * 100, 100)
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#241220_0%,#140A12_38%,#060408_100%)] text-[#FAF5F8]">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(205,105,157,0.08),transparent_22%,transparent_78%,rgba(110,197,255,0.05))]" />
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,rgba(247,229,240,0.85)_1px,transparent_1px),linear-gradient(to_bottom,rgba(247,229,240,0.85)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(205,105,157,0.16),transparent_18%),radial-gradient(circle_at_86%_14%,rgba(110,197,255,0.14),transparent_18%),radial-gradient(circle_at_22%_84%,rgba(255,203,104,0.10),transparent_16%)]" />

      <div className="pointer-events-none absolute left-[8%] top-[14%] h-40 w-40 rounded-full bg-[#CD699D]/12 blur-3xl" />
      <div className="pointer-events-none absolute right-[8%] top-[14%] h-44 w-44 rounded-full bg-[#6EC5FF]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[10%] left-[20%] h-36 w-36 rounded-full bg-[#FFCB68]/8 blur-3xl" />

      <div className="relative mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[38px] border border-[#F0D7E6]/10 bg-[linear-gradient(180deg,rgba(25,12,20,0.96),rgba(12,7,11,0.98))] shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
          <div className="border-b border-[#F0D7E6]/10 bg-[linear-gradient(90deg,rgba(205,105,157,0.18),rgba(255,203,104,0.08),rgba(110,197,255,0.08))] px-6 py-5">
            <p className="text-[11px] font-black uppercase tracking-[0.36em] text-[#E9B7D0]">
              Galería de campeones
            </p>
          </div>

          <div className="grid gap-6 p-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <section className="space-y-6">
              <div className="overflow-hidden rounded-[34px] border border-[#F0D7E6]/10 bg-[linear-gradient(135deg,rgba(53,22,40,0.98),rgba(17,10,15,0.98))] shadow-[0_18px_45px_rgba(0,0,0,0.24)]">
                <div className="border-b border-[#F0D7E6]/10 bg-[linear-gradient(90deg,rgba(205,105,157,0.16),rgba(110,197,255,0.08))] px-6 py-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[#CD699D]/16 bg-[#CD699D]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#F3C9DE]">
                      {phaseLabel}
                    </span>
                    <span className="rounded-full border border-[#FFCB68]/16 bg-[#FFCB68]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#FFE7B1]">
                      Orden objetivo: {orderTargetNumber ?? "?"}
                    </span>
                    <span className="rounded-full border border-[#6EC5FF]/16 bg-[#6EC5FF]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#D8F1FF]">
                      {selectedCharactersCount}/{players.length} elegidos
                    </span>
                    <span className="rounded-full border border-[#F0D7E6]/10 bg-[#171018] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#F7EAF2]">
                      Tiempo: {secondsLeft}s
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h1 className="text-4xl font-black leading-tight text-[#FFF8FB] sm:text-5xl">
                    Selección de
                    <span className="bg-[linear-gradient(135deg,#FFCB68_0%,#CD699D_45%,#6EC5FF_100%)] bg-clip-text text-transparent">
                      {" "}
                      personajes
                    </span>
                  </h1>

                  <p className="mt-4 max-w-3xl text-base leading-7 text-[#E5D4DE]/82">
                    La expedición ya tiene su orden definido. Ahora cada goblin debe
                    entrar al salón y reclamar un campeón antes de que el siguiente
                    turno avance.
                  </p>

                  {serverError && (
                    <div className="mt-5 rounded-[22px] border border-[#FFADB9]/14 bg-[#39151E] px-4 py-4 text-sm text-[#FFD6DD]">
                      {serverError}
                    </div>
                  )}

                  <div className="mt-6 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
                    <div className="rounded-[28px] border border-[#F0D7E6]/10 bg-[#130B11]/76 p-5">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#F3C9DE]">
                        Estado ritual
                      </p>

                      <div className="mt-4 rounded-[24px] border border-[#F0D7E6]/10 bg-[linear-gradient(135deg,rgba(205,105,157,0.10),rgba(19,11,17,0.96))] p-5">
                        <p className="text-2xl font-black text-[#FFF8FB]">
                          {statusTitle}
                        </p>
                        <p className="mt-3 text-sm leading-6 text-[#E5D4DE]/78">
                          {statusBody}
                        </p>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-[20px] border border-[#F0D7E6]/10 bg-[#171018] px-4 py-4">
                          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#F3C9DE]">
                            Turno actual
                          </p>
                          <p className="mt-2 text-xl font-black text-[#FFF8FB]">
                            {currentCharacterTurnOrder ?? "No definido"}
                          </p>
                        </div>

                        <div className="rounded-[20px] border border-[#F0D7E6]/10 bg-[#171018] px-4 py-4">
                          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#D8F1FF]">
                            Selector actual
                          </p>
                          <div className="mt-2 min-h-[3.75rem]">
                            <p className="break-all text-lg font-black leading-tight text-[#FFF8FB] sm:text-xl">
                              {currentPicker?.username ?? "No definido"}
                            </p>

                            {currentPicker?.user_id === currentUserId && (
                              <span className="mt-2 inline-flex rounded-full border border-[#6EC5FF]/16 bg-[#6EC5FF]/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#D8F1FF]">
                                Tú
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="rounded-[20px] border border-[#F0D7E6]/10 bg-[#171018] px-4 py-4">
                          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#FFE7B1]">
                            Reloj
                          </p>
                          <p className="mt-2 text-xl font-black text-[#FFF8FB]">
                            {timeExpired ? "0s" : `${secondsLeft}s`}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 h-3 rounded-full bg-[#1B1117]">
                        <div
                          className="h-3 rounded-full bg-[linear-gradient(90deg,#6EC5FF_0%,#FFCB68_55%,#CD699D_100%)] transition-all duration-300"
                          style={{ width: `${secondsProgress}%` }}
                        />
                      </div>
                    </div>

                    <div className="rounded-[28px] border border-[#F0D7E6]/10 bg-[linear-gradient(135deg,rgba(255,203,104,0.08),rgba(19,11,17,0.96))] p-5">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#FFE7B1]">
                        Progreso de elección
                      </p>

                      <div className="mt-5 flex flex-col items-center text-center">
                        <div className="relative flex h-52 w-52 items-center justify-center rounded-full border-[10px] border-[#FFCB68]/30 bg-[radial-gradient(circle_at_top,#FFF8EE_0%,#F3E6D3_42%,#E8D9C1_100%)] shadow-[0_0_0_10px_rgba(205,105,157,0.05),0_18px_45px_rgba(0,0,0,0.22)]">
                          <div className="absolute inset-4 rounded-full border border-[#CD699D]/18" />
                          <span className="text-5xl font-black text-[#251712]">
                            {selectedCharactersCount}
                            <span className="text-2xl text-[#6C5148]">/{players.length}</span>
                          </span>
                        </div>

                        <p className="mt-5 text-sm leading-6 text-[#E5D4DE]/78">
                          Personajes reclamados por la tribu hasta este momento.
                        </p>
                      </div>

                      <div className="mt-5 h-3 rounded-full bg-[#1B1117]">
                        <div
                          className="h-3 rounded-full bg-[linear-gradient(90deg,#FFCB68_0%,#CD699D_50%,#6EC5FF_100%)] transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {myChosenCharacter && (
                    <div className="mt-6 rounded-[26px] border border-[#6EC5FF]/14 bg-[linear-gradient(135deg,rgba(110,197,255,0.10),rgba(18,10,15,0.96))] p-5">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#D8F1FF]">
                        Tu personaje actual
                      </p>
                      <p className="mt-2 text-2xl font-black text-[#FFF8FB]">
                        {myChosenCharacter}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#E5D4DE]/76">
                        Tu lugar dentro de la expedición ya quedó ligado a este campeón.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="overflow-hidden rounded-[34px] border border-[#F0D7E6]/10 bg-[linear-gradient(180deg,rgba(19,11,16,0.98),rgba(10,7,10,0.98))] shadow-[0_18px_45px_rgba(0,0,0,0.24)]">
                <div className="border-b border-[#F0D7E6]/10 bg-[linear-gradient(90deg,rgba(255,203,104,0.14),rgba(205,105,157,0.08))] px-6 py-5">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#FFE7B1]">
                    Salón de elección
                  </p>

                  <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                      <h2 className="text-3xl font-black text-[#FFF8FB]">
                        Personajes disponibles
                      </h2>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-[#E5D4DE]/76">
                        Si nadie elige dentro de 15 segundos, el sistema asignará
                        automáticamente uno de los personajes que sigan libres y la
                        pantalla avanzará en tiempo real al siguiente turno.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-[#FFCB68]/14 bg-[#FFCB68]/10 px-4 py-2 text-sm font-black text-[#FFE7B1]">
                        Tiempo: {secondsLeft}s
                      </span>
                      <span className="rounded-full border border-[#F0D7E6]/10 bg-[#171018] px-4 py-2 text-sm font-semibold text-[#F7EAF2]">
                        Disponibles: {availableCharacters.length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
                    {CHARACTER_OPTIONS.map((character) => {
                      const isTaken = takenCharacters.has(character.name);
                      const isSelectingThisCharacter = selectingCharacter === character.name;
                      const takenBy = takenByMap.get(character.name);

                      return (
                        <button
                          key={character.name}
                          type="button"
                          onMouseEnter={playHoverSound}
                          onClick={() => onSelectCharacter(character.name)}
                          disabled={
                            !isMyTurnToPick ||
                            isTaken ||
                            selectionSubmitting ||
                            isAutoSelecting ||
                            timeExpired
                          }
                          className={`group relative overflow-hidden rounded-[28px] border p-4 text-left transition duration-300 ${
                            isTaken
                              ? "cursor-not-allowed border-[#F0D7E6]/10 bg-[linear-gradient(180deg,rgba(28,19,24,0.96),rgba(16,11,14,0.98))] text-[#A6959F]"
                              : isMyTurnToPick && !timeExpired
                              ? "border-[#F0D7E6]/10 bg-[linear-gradient(180deg,rgba(31,19,26,0.96),rgba(15,10,14,0.98))] text-[#FFF8FB] hover:-translate-y-1 hover:border-[#FFCB68]/20 hover:shadow-[0_18px_40px_rgba(0,0,0,0.20)]"
                              : "cursor-not-allowed border-[#F0D7E6]/10 bg-[linear-gradient(180deg,rgba(24,17,21,0.96),rgba(13,9,12,0.98))] text-[#B5A8AF]"
                          } ${isSelectingThisCharacter ? "opacity-60" : ""}`}
                        >
                          <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-[#CD699D]/8 blur-3xl" />

                          <div className="flex flex-col items-center text-center">
                            <div className="flex h-36 w-full items-center justify-center rounded-[22px] border border-[#F0D7E6]/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))]">
                              <Image
                                src={character.image}
                                alt={character.name}
                                width={120}
                                height={120}
                                className="h-28 w-28 object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.20)]"
                              />
                            </div>

                            <p className="mt-4 text-lg font-black">{character.name}</p>

                            <div className="mt-3">
                              {isTaken ? (
                                <span className="rounded-full border border-[#CD699D]/14 bg-[#CD699D]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#F3C9DE]">
                                  Elegido por {takenBy ?? "otro jugador"}
                                </span>
                              ) : isMyTurnToPick && !timeExpired ? (
                                <span className="rounded-full border border-[#FFCB68]/14 bg-[#FFCB68]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#FFE7B1]">
                                  Disponible
                                </span>
                              ) : timeExpired ? (
                                <span className="rounded-full border border-[#6EC5FF]/14 bg-[#6EC5FF]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#D8F1FF]">
                                  Autoasignando...
                                </span>
                              ) : (
                                <span className="rounded-full border border-[#F0D7E6]/10 bg-[#171018] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#D8CBD2]">
                                  Esperando turno
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="overflow-hidden rounded-[34px] border border-[#F0D7E6]/10 bg-[linear-gradient(180deg,rgba(18,10,15,0.98),rgba(10,7,10,0.98))] shadow-[0_18px_45px_rgba(0,0,0,0.24)]">
                <div className="border-b border-[#F0D7E6]/10 bg-[linear-gradient(90deg,rgba(110,197,255,0.14),rgba(205,105,157,0.08))] px-6 py-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#D8F1FF]">
                        Expedición en orden
                      </p>
                      <h2 className="mt-2 text-3xl font-black text-[#FFF8FB]">
                        Jugadores
                      </h2>
                    </div>

                    <div className="rounded-[18px] border border-[#6EC5FF]/16 bg-[#6EC5FF]/10 px-4 py-3 text-center">
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#D8F1FF]">
                        Total
                      </p>
                      <p className="mt-1 text-2xl font-black text-[#FFF8FB]">
                        {players.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {orderedPlayers.map((player) => {
                      const isCurrentUser = player.user_id === currentUserId;
                      const isCurrentPicker = player.turn_order === currentCharacterTurnOrder;
                      const playerInitial =
                        player.username?.slice(0, 1).toUpperCase() ?? "G";

                      return (
                        <div
                          key={player.id}
                          className={`rounded-[24px] border px-4 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.16)] ${
                            isCurrentPicker
                              ? "border-[#FFCB68]/16 bg-[linear-gradient(135deg,rgba(255,203,104,0.12),rgba(18,10,15,0.98))]"
                              : isCurrentUser
                              ? "border-[#6EC5FF]/16 bg-[linear-gradient(135deg,rgba(110,197,255,0.12),rgba(18,10,15,0.98))]"
                              : "border-[#F0D7E6]/10 bg-[linear-gradient(135deg,rgba(205,105,157,0.06),rgba(18,10,15,0.98))]"
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className={`flex h-14 w-14 items-center justify-center rounded-[20px] text-xl font-black shadow-[0_10px_20px_rgba(0,0,0,0.22)] ${
                                isCurrentPicker
                                  ? "bg-[linear-gradient(135deg,#FFCB68_0%,#FFE09C_100%)] text-[#20150C]"
                                  : isCurrentUser
                                  ? "bg-[linear-gradient(135deg,#6EC5FF_0%,#A6DEFF_100%)] text-[#08131B]"
                                  : "bg-[linear-gradient(135deg,#3A2431_0%,#5A364B_100%)] text-[#FFF4F9]"
                              }`}
                            >
                              {playerInitial}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="truncate text-lg font-black text-[#FFF8FB]">
                                  {player.username ?? "Sin username"}
                                  {isCurrentUser ? " (Tú)" : ""}
                                </p>

                                <span className="rounded-full border border-[#F0D7E6]/10 bg-[#171018] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#E4D8DE]">
                                  {player.turn_order}°
                                </span>

                                {isCurrentPicker && (
                                  <span className="rounded-full border border-[#FFCB68]/14 bg-[#FFCB68]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#FFE7B1]">
                                    Selecciona ahora
                                  </span>
                                )}
                              </div>

                              <p className="mt-2 text-sm text-[#E5D4DE]/74">
                                {player.character_name
                                  ? `Personaje: ${player.character_name}`
                                  : "Aún no ha elegido personaje."}
                              </p>

                              {player.character_name && (
                                <div className="mt-3 rounded-[18px] border border-[#F0D7E6]/10 bg-[#171018] px-3 py-3 text-sm text-[#F4ECF0]">
                                  <span className="font-bold">Elegido:</span>{" "}
                                  {player.character_name}
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

              <div className="overflow-hidden rounded-[34px] border border-[#F0D7E6]/10 bg-[linear-gradient(180deg,rgba(18,10,15,0.98),rgba(10,7,10,0.98))] shadow-[0_18px_45px_rgba(0,0,0,0.24)]">
                <div className="border-b border-[#F0D7E6]/10 bg-[linear-gradient(90deg,rgba(255,203,104,0.12),rgba(110,197,255,0.08))] px-6 py-5">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#FFE7B1]">
                    Acciones del campamento
                  </p>
                </div>

                <div className="p-6">
                  <button
                    type="button"
                    onClick={onGoHome}
                    className="rounded-[22px] border border-[#F0D7E6]/10 bg-[#171018] px-5 py-4 text-sm font-black uppercase tracking-[0.12em] text-[#FAF5F8] transition hover:bg-[#21151D]"
                  >
                    Volver al inicio
                  </button>

                  <p className="mt-4 text-sm leading-6 text-[#E5D4DE]/74">
                    Los personajes se reclaman estrictamente según el orden definido
                    en la fase anterior. Cuando todos elijan, la expedición podrá
                    continuar al siguiente paso.
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