"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CHARACTER_OPTIONS } from "@/lib/characters";
import TurnController from "@/components/game/turn/TurnController";
import {
  buildPendingMinigameRetryPlan,
  buildTurnPlan,
  type PlayerBoardState,
} from "@/lib/game/turn-engine/build-turn-plan";
import type {
  MinigameStartedEvent,
  TurnPlan,
} from "@/lib/game/turn-engine/turn-event-types";
import type { MinigameKey } from "@/lib/game/board/tile-types";

import RawGameBoard from "@/components/game/GameBoard";
import RawGameSidebar from "@/components/game/GameSidebar";
import RawPlayersPanel from "@/components/game/PlayersPanel";
import RawMatchSummary from "@/components/game/MatchSummary";
import RawCharacterSelectionScreen from "@/components/game/CharacterSelectionScreen";
import RawOrderSelectionScreen from "@/components/game/OrderSelectionScreen";

const GameBoard = RawGameBoard as unknown as ComponentType<any>;
const GameSidebar = RawGameSidebar as unknown as ComponentType<any>;
const PlayersPanel = RawPlayersPanel as unknown as ComponentType<any>;
const MatchSummary = RawMatchSummary as unknown as ComponentType<any>;
const CharacterSelectionScreen =
  RawCharacterSelectionScreen as unknown as ComponentType<any>;
const OrderSelectionScreen =
  RawOrderSelectionScreen as unknown as ComponentType<any>;

type MatchPhase =
  | "choosing_order"
  | "choosing_character"
  | "active"
  | "finished"
  | "abandoned";

type MatchStatus = "active" | "finished" | "abandoned";

type MatchData = {
  id: string;
  lobby_id: string;
  status: MatchStatus;
  phase: MatchPhase | null;
  order_target_number: number | null;
  current_turn_user_id: string | null;
  turn_number: number;
  winner_user_id: string | null;
  started_at: string | null;
  finished_at: string | null;
  current_character_turn_order: number | null;
  current_character_turn_started_at: string | null;
  // campos nuevos opcionales para cuando hagas los scripts
  board_version?: string | null;
  turn_state?: string | null;
  active_minigame_session_id?: string | null;
};

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

  // campos viejos o opcionales que pueden existir según tu estado actual
  selected_character_id?: string | null;
  final_position?: number | null;
  is_winner?: boolean | null;

  // campos nuevos opcionales para el rediseño
  shield_charges?: number | null;
  skip_turns?: number | null;
  next_roll_bonus?: number | null;
  next_roll_max?: number | null;
  pending_minigame_key?: MinigameKey | null;
  pending_minigame_tile_index?: number | null;
  pending_minigame_session_id?: string | null;
};

type PlayTurnRpcResult = {
  turn_plan?: TurnPlan | null;
  raw_roll?: number | null;
  roll?: number | null;
  next_player_user_id?: string | null;
  winner_user_id?: string | null;
  [key: string]: unknown;
};

type UserSummary = {
  id: string;
  email: string | null;
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getPhase(match: MatchData | null): MatchPhase {
  if (!match) return "abandoned";
  if (match.phase) return match.phase;
  if (match.status === "finished") return "finished";
  if (match.status === "abandoned") return "abandoned";
  return "active";
}

function sortPlayers(players: MatchPlayerRow[]): MatchPlayerRow[] {
  return [...players].sort((a, b) => {
    if (a.turn_order !== b.turn_order) {
      return a.turn_order - b.turn_order;
    }
    return a.joined_at.localeCompare(b.joined_at);
  });
}

function getNextPlayerUserId(
  players: MatchPlayerRow[],
  currentTurnUserId: string | null,
): string | null {
  const ordered = sortPlayers(players).filter((player) => !player.is_finished);

  if (ordered.length === 0) return null;
  if (!currentTurnUserId) return ordered[0]?.user_id ?? null;

  const currentIndex = ordered.findIndex(
    (player) => player.user_id === currentTurnUserId,
  );

  if (currentIndex === -1) {
    return ordered[0]?.user_id ?? null;
  }

  const nextIndex = (currentIndex + 1) % ordered.length;
  return ordered[nextIndex]?.user_id ?? null;
}

function mapPlayerBoardState(player: MatchPlayerRow): PlayerBoardState {
  return {
    position: player.board_position ?? 0,
    shieldCharges: player.shield_charges ?? 0,
    skipTurns: player.skip_turns ?? 0,
    nextRollBonus: player.next_roll_bonus ?? 0,
    nextRollMax: player.next_roll_max ?? null,
    pendingMinigameKey: player.pending_minigame_key ?? null,
    pendingMinigameTileIndex: player.pending_minigame_tile_index ?? null,
    pendingMinigameSessionId: player.pending_minigame_session_id ?? null,
  };
}

function mergeAnimatedPositions(
  players: MatchPlayerRow[],
  animatedPositions: Record<string, number>,
): MatchPlayerRow[] {
  return players.map((player) => ({
    ...player,
    board_position:
      animatedPositions[player.user_id] ?? player.board_position ?? 0,
  }));
}

function findFirstAvailableCharacter(players: MatchPlayerRow[]): string | null {
  const used = new Set(
    players
      .map((player) => player.character_name)
      .filter((value): value is string => Boolean(value)),
  );

  for (const option of CHARACTER_OPTIONS) {
    if (!used.has(option.name)) {
      return option.name;
    }
  }

  return null;
}

export default function GamePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const routeId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [currentUser, setCurrentUser] = useState<UserSummary | null>(null);
  const [match, setMatch] = useState<MatchData | null>(null);
  const [players, setPlayers] = useState<MatchPlayerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState<string>("");
  const [turnMessage, setTurnMessage] = useState<string>("");
  const [latestDiceValue, setLatestDiceValue] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [characterSubmitting, setCharacterSubmitting] = useState(false);
  const [currentTurnPlan, setCurrentTurnPlan] = useState<TurnPlan | null>(null);
  const [playbackState, setPlaybackState] = useState<string>("idle");
  const [animatedPositions, setAnimatedPositions] = useState<
    Record<string, number>
  >({});
  const [activeMinigameEvent, setActiveMinigameEvent] =
    useState<MinigameStartedEvent | null>(null);

  const subscriptionsReadyRef = useRef(false);

  const phase = useMemo(() => getPhase(match), [match]);

  const currentUserId = currentUser?.id ?? null;

  const orderedPlayers = useMemo(() => sortPlayers(players), [players]);

  const me = useMemo(
    () => orderedPlayers.find((player) => player.user_id === currentUserId) ?? null,
    [orderedPlayers, currentUserId],
  );

  const displayPlayers = useMemo(
    () => mergeAnimatedPositions(orderedPlayers, animatedPositions),
    [orderedPlayers, animatedPositions],
  );

  const isMyTurn =
    phase === "active" &&
    Boolean(currentUserId) &&
    match?.current_turn_user_id === currentUserId;

  const activeCharacterTurnPlayer = useMemo(() => {
    if (!match?.current_character_turn_order) return null;
    return orderedPlayers.find(
      (player) => player.turn_order === match.current_character_turn_order,
    ) ?? null;
  }, [match?.current_character_turn_order, orderedPlayers]);

  const orderScreenData = useMemo(() => {
    return {
      mySelectedNumber: me?.selected_order_number ?? null,
      targetNumber: match?.order_target_number ?? null,
    };
  }, [me?.selected_order_number, match?.order_target_number]);

  const reloadGameState = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!routeId) return;

      if (!options?.silent) {
        setLoading(true);
      }

      try {
        setServerError("");

        const userResult = await supabase.auth.getUser();
        const authUser = userResult.data.user;

        if (!authUser) {
          router.push("/login");
          return;
        }

        setCurrentUser({
          id: authUser.id,
          email: authUser.email ?? null,
        });

        // Primero intenta interpretar [id] como match.id; si no, como lobby_id.
        const directMatchQuery = await supabase
          .from("matches")
          .select("*")
          .eq("id", routeId)
          .limit(1);

        let resolvedMatch =
          (directMatchQuery.data?.[0] as MatchData | undefined) ?? null;

        if (!resolvedMatch) {
          const lobbyMatchQuery = await supabase
            .from("matches")
            .select("*")
            .eq("lobby_id", routeId)
            .order("started_at", { ascending: false })
            .limit(1);

          resolvedMatch =
            (lobbyMatchQuery.data?.[0] as MatchData | undefined) ?? null;
        }

        if (!resolvedMatch) {
          setMatch(null);
          setPlayers([]);
          setServerError("No se encontró una partida asociada a esta ruta.");
          return;
        }

        setMatch(resolvedMatch);

        const playersQuery = await supabase
          .from("match_players")
          .select("*")
          .eq("match_id", resolvedMatch.id)
          .order("turn_order", { ascending: true });

        const resolvedPlayers = (playersQuery.data ?? []) as MatchPlayerRow[];

        setPlayers(resolvedPlayers);
        setAnimatedPositions(
          Object.fromEntries(
            resolvedPlayers.map((player) => [
              player.user_id,
              player.board_position ?? 0,
            ]),
          ),
        );
      } catch (error) {
        console.error(error);
        setServerError("Ocurrió un error al cargar la partida.");
      } finally {
        if (!options?.silent) {
          setLoading(false);
        }
      }
    },
    [routeId, router],
  );

  useEffect(() => {
    void reloadGameState();
  }, [reloadGameState]);

  useEffect(() => {
    if (!match?.id || subscriptionsReadyRef.current) return;

    const matchChannel = supabase
      .channel(`game-match-${match.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
          filter: `id=eq.${match.id}`,
        },
        async () => {
          await reloadGameState({ silent: true });
        },
      )
      .subscribe();

    const playersChannel = supabase
      .channel(`game-match-players-${match.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "match_players",
          filter: `match_id=eq.${match.id}`,
        },
        async () => {
          await reloadGameState({ silent: true });
        },
      )
      .subscribe();

    subscriptionsReadyRef.current = true;

    return () => {
      subscriptionsReadyRef.current = false;
      void supabase.removeChannel(matchChannel);
      void supabase.removeChannel(playersChannel);
    };
  }, [match?.id, reloadGameState]);

  const handleGoHome = useCallback(() => {
    router.push("/home");
  }, [router]);

  const handleSubmitOrderNumber = useCallback(
    async (selectedNumber: number) => {
      if (!match || !currentUserId) return;

      try {
        setOrderSubmitting(true);
        setServerError("");

        const { error } = await supabase
          .from("match_players")
          .update({
            selected_order_number: selectedNumber,
            order_number_submitted_at: new Date().toISOString(),
          })
          .eq("match_id", match.id)
          .eq("user_id", currentUserId);

        if (error) {
          throw error;
        }

        setTurnMessage(`Elegiste el número ${selectedNumber}.`);
        await reloadGameState({ silent: true });
      } catch (error) {
        console.error(error);
        setServerError("No se pudo guardar tu número para el orden.");
      } finally {
        setOrderSubmitting(false);
      }
    },
    [match, currentUserId, reloadGameState],
  );

  const handleAutoSubmitOrder = useCallback(async (): Promise<"ok" | "retry"> => {
    try {
      await handleSubmitOrderNumber(randomInt(1, 1000));
      return "ok";
    } catch {
      return "retry";
    }
  }, [handleSubmitOrderNumber]);

  const handleSelectCharacter = useCallback(
    async (characterName: string) => {
      if (!match || !currentUserId) return;

      try {
        setCharacterSubmitting(true);
        setServerError("");

        const { error } = await supabase
          .from("match_players")
          .update({
            character_name: characterName,
          })
          .eq("match_id", match.id)
          .eq("user_id", currentUserId);

        if (error) {
          throw error;
        }

        setTurnMessage(`Seleccionaste a ${characterName}.`);
        await reloadGameState({ silent: true });
      } catch (error) {
        console.error(error);
        setServerError("No se pudo guardar el personaje seleccionado.");
      } finally {
        setCharacterSubmitting(false);
      }
    },
    [match, currentUserId, reloadGameState],
  );

  const handleAutoSelectCharacter = useCallback(async (): Promise<"ok" | "retry"> => {
    const fallback = findFirstAvailableCharacter(players);

    if (!fallback) {
      return "retry";
    }

    try {
      await handleSelectCharacter(fallback);
      return "ok";
    } catch {
      return "retry";
    }
  }, [players, handleSelectCharacter]);

  const handlePlayTurn = useCallback(async () => {
    if (!match || !me || !currentUserId || rolling) {
      return null;
    }

    try {
      setRolling(true);
      setServerError("");

      const localState = mapPlayerBoardState(me);
      const nextPlayerUserId = getNextPlayerUserId(
        players,
        match.current_turn_user_id,
      );

      // Caso 1: minijuego pendiente -> no lanza dado, solo reintenta.
      if (
        localState.pendingMinigameKey &&
        localState.pendingMinigameTileIndex !== null
      ) {
        const retry = buildPendingMinigameRetryPlan({
          matchId: match.id,
          actingUserId: currentUserId,
          turnNumber: match.turn_number,
          nextPlayerUserId,
          state: localState,
        });

        setCurrentTurnPlan(retry.plan);
        setTurnMessage("Tienes un minijuego pendiente. Debes reintentarlo.");
        return retry;
      }

      // Caso 2: intenta usar tu flujo actual del backend si existe.
      const rpcResponse = await supabase.rpc("play_turn", {
        p_match_id: match.id,
      });

      if (rpcResponse.error) {
        throw rpcResponse.error;
      }

      const rawData = rpcResponse.data as
        | PlayTurnRpcResult
        | PlayTurnRpcResult[]
        | null;

      const rpcResult = Array.isArray(rawData)
        ? (rawData[0] ?? null)
        : rawData;

      if (rpcResult?.turn_plan) {
        setCurrentTurnPlan(rpcResult.turn_plan);
        return rpcResult;
      }

      // Caso 3: fallback temporal mientras aún no tienes scripts nuevos.
      // Si el backend viejo no devuelve plan, construimos el plan local
      // solo para reproducir la nueva UI sin tirar abajo lo que ya te sirve.
      const rawRoll =
        (typeof rpcResult?.raw_roll === "number" && rpcResult.raw_roll) ||
        (typeof rpcResult?.roll === "number" && rpcResult.roll) ||
        randomInt(1, 6);

      const built = buildTurnPlan({
        matchId: match.id,
        actingUserId: currentUserId,
        turnNumber: match.turn_number,
        nextPlayerUserId:
          (rpcResult?.next_player_user_id as string | null | undefined) ??
          nextPlayerUserId,
        state: localState,
        rawRoll,
        chaosCardIndex: randomInt(0, 5),
      });

      setCurrentTurnPlan(built.plan);
      return built;
    } catch (error) {
      console.error(error);
      setServerError(
        "No se pudo ejecutar el turno con el backend actual. Se dejó preparado el flujo nuevo, pero todavía te faltan los scripts / persistencia nueva.",
      );
      return null;
    } finally {
      setRolling(false);
    }
  }, [match, me, currentUserId, rolling, players]);

  const activeTurnLabel = useMemo(() => {
    if (phase === "finished") return "La partida terminó.";
    if (phase === "abandoned") return "La partida fue abandonada.";
    if (!match || !players.length) return "Cargando partida...";

    const currentTurnPlayer = players.find(
      (player) => player.user_id === match.current_turn_user_id,
    );

    if (phase === "choosing_order") {
      return "Selección de orden en progreso.";
    }

    if (phase === "choosing_character") {
      if (activeCharacterTurnPlayer?.username) {
        return `Turno de personaje: ${activeCharacterTurnPlayer.username}.`;
      }
      return "Selección de personaje en progreso.";
    }

    if (currentTurnPlayer?.username) {
      return `Turno de ${currentTurnPlayer.username}.`;
    }

    if (isMyTurn) {
      return "Es tu turno.";
    }

    return "Esperando el siguiente turno.";
  }, [phase, match, players, activeCharacterTurnPlayer, isMyTurn]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
        <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 px-8 py-6 text-center shadow-2xl">
            <p className="text-lg font-semibold">Cargando partida...</p>
            <p className="mt-2 text-sm text-slate-400">
              Preparando el tablero y el estado actual.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!match) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
          <h1 className="text-2xl font-bold">No se encontró la partida</h1>
          <p className="mt-3 text-slate-300">
            {serverError || "La ruta actual no apunta a una partida válida."}
          </p>
          <button
            type="button"
            onClick={handleGoHome}
            className="mt-6 rounded-2xl border border-slate-700 bg-slate-800 px-5 py-2.5 font-semibold text-slate-100 transition hover:bg-slate-700"
          >
            Volver al inicio
          </button>
        </div>
      </main>
    );
  }

  if (phase === "choosing_order") {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100">
        <div className="mx-auto max-w-6xl">
          {serverError && (
            <div className="mb-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {serverError}
            </div>
          )}

          <OrderSelectionScreen
            players={orderedPlayers}
            currentUserId={currentUserId}
            orderTargetNumber={orderScreenData.targetNumber}
            mySelectedOrderNumber={orderScreenData.mySelectedNumber}
            selectionSubmitting={orderSubmitting}
            serverError={serverError}
            onSubmitNumber={handleSubmitOrderNumber}
            onAutoSubmitOrder={handleAutoSubmitOrder}
            onGoHome={handleGoHome}
            turnMessage={activeTurnLabel}
          />
        </div>
      </main>
    );
  }

  if (phase === "choosing_character") {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100">
        <div className="mx-auto max-w-6xl">
          {serverError && (
            <div className="mb-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {serverError}
            </div>
          )}

          <CharacterSelectionScreen
            players={orderedPlayers}
            currentUserId={currentUserId}
            currentCharacterTurnOrder={match.current_character_turn_order}
            currentCharacterTurnStartedAt={match.current_character_turn_started_at}
            orderTargetNumber={match.order_target_number}
            selectingCharacter={me?.character_name ?? null}
            onSelectCharacter={handleSelectCharacter}
            onAutoSelectCharacter={handleAutoSelectCharacter}
            onGoHome={handleGoHome}
            selectionSubmitting={characterSubmitting}
            serverError={serverError}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-5 text-slate-100">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4">
        {(serverError || turnMessage) && (
          <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
            {serverError ? (
              <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {serverError}
              </div>
            ) : (
              <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-100">
                {turnMessage}
              </div>
            )}

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-200">
              {activeTurnLabel}
            </div>
          </div>
        )}

        <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
          <aside className="space-y-4">
            <PlayersPanel
              players={displayPlayers}
              currentUserId={currentUserId}
              currentTurnUserId={match.current_turn_user_id}
              winnerUserId={match.winner_user_id}
              matchStatus={match.status}
            />

            <GameSidebar
              match={match}
              players={displayPlayers}
              currentUserId={currentUserId}
              currentTurnUserId={match.current_turn_user_id}
              latestDiceValue={latestDiceValue}
              turnMessage={activeTurnLabel}
              isMyTurn={isMyTurn}
              isRolling={rolling}
              onPlayTurn={handlePlayTurn}
            />
          </aside>

          <section className="min-w-0">
            <GameBoard
              players={displayPlayers}
              currentUserId={currentUserId}
              currentTurnUserId={match.current_turn_user_id}
              winnerUserId={match.winner_user_id}
              matchStatus={match.status}
              turnMessage={activeTurnLabel}
              isMyTurn={isMyTurn}
              onPlayTurn={handlePlayTurn}
              latestDiceValue={latestDiceValue}
            />
          </section>

          <aside className="space-y-4">
            <MatchSummary
              match={match}
              players={displayPlayers}
              currentUserId={currentUserId}
            />

            {me && (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
                <h2 className="text-lg font-bold">Tu estado actual</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
                    <p className="text-slate-400">Posición</p>
                    <p className="mt-1 text-lg font-bold">
                      {animatedPositions[me.user_id] ?? me.board_position ?? 0}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
                    <p className="text-slate-400">Orden</p>
                    <p className="mt-1 text-lg font-bold">{me.turn_order}</p>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
                    <p className="text-slate-400">Escudos</p>
                    <p className="mt-1 text-lg font-bold">
                      {me.shield_charges ?? 0}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
                    <p className="text-slate-400">Turnos perdidos</p>
                    <p className="mt-1 text-lg font-bold">
                      {me.skip_turns ?? 0}
                    </p>
                  </div>
                </div>

                {me.pending_minigame_key && (
                  <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                    Tienes pendiente el minijuego{" "}
                    <span className="font-semibold">
                      {me.pending_minigame_key}
                    </span>
                    . En tu siguiente turno no lanzarás dado; reintentarás esa
                    prueba.
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>

      <TurnController
        plan={currentTurnPlan}
        enabled={phase === "active"}
        onPlaybackStateChange={(state) => {
          setPlaybackState(state);
        }}
        onDiceRolled={async (event) => {
          setLatestDiceValue(event.rawRoll);
          setTurnMessage(
            `Dado: ${event.rawRoll}${
              event.appliedBonus ? `, bonus +${event.appliedBonus}` : ""
            }${event.appliedMaxCap ? `, máximo ${event.appliedMaxCap}` : ""}.`,
          );
        }}
        onPieceMove={async (event) => {
          setAnimatedPositions((current) => ({
            ...current,
            [event.actorUserId]: event.to,
          }));

          // pequeño delay para que el tablero tenga tiempo de animar visualmente
          await new Promise<void>((resolve) => {
            window.setTimeout(resolve, 450);
          });
        }}
        onTileLanded={async (event) => {
          setTurnMessage(`Cayó en la casilla ${event.tileIndex}.`);
        }}
        onStatusApplied={async (event) => {
          setTurnMessage(event.message.description);
        }}
        onChaosCardDrawn={async (event) => {
          setTurnMessage(`${event.message.title}: ${event.message.description}`);
        }}
        onBlockedByPendingMinigame={async (event) => {
          setTurnMessage(event.message.description);
        }}
        onMinigameStarted={async () => {
          // lo controla renderActiveMinigame
        }}
        onTurnEnded={async (event) => {
          if (event.endedBecause !== "match_finished") {
            setTurnMessage("El turno terminó.");
          }
          await reloadGameState({ silent: true });
        }}
        onMatchFinished={async (event) => {
          setTurnMessage(event.message.description);
          await reloadGameState({ silent: true });
        }}
        onPlaybackComplete={async () => {
          await reloadGameState({ silent: true });
        }}
        renderActiveMinigame={({ activeMinigame, closeMinigame }) => {
          if (!activeMinigame.open || !activeMinigame.event) {
            return null;
          }

          const event = activeMinigame.event;

          return (
            <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/75 p-4">
              <div className="w-full max-w-2xl rounded-3xl border border-slate-700 bg-slate-950 shadow-2xl">
                <div className="border-b border-slate-800 px-6 py-4">
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                    Minijuego activo
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-100">
                    {event.message.title}
                  </h2>
                </div>

                <div className="px-6 py-5">
                  <p className="text-slate-300">{event.message.description}</p>

                  <div className="mt-5 grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-sm text-slate-200 sm:grid-cols-2">
                    <div>
                      <span className="text-slate-400">Clave:</span>{" "}
                      <span className="font-semibold">{event.minigameKey}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Modo:</span>{" "}
                      <span className="font-semibold">{event.mode}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Casilla:</span>{" "}
                      <span className="font-semibold">{event.tileIndex}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Sesión:</span>{" "}
                      <span className="font-semibold">{event.sessionId}</span>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                    Aquí es donde luego conectarás tu{" "}
                    <span className="font-semibold">MinigameHost</span> real. Por
                    ahora te lo dejo preparado para que la nueva arquitectura ya
                    abra la prueba en el punto correcto del turno.
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-800 px-6 py-4">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMinigameEvent(event);
                      closeMinigame();
                    }}
                    className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 font-semibold text-slate-100 transition hover:bg-slate-800"
                  >
                    Cerrar placeholder
                  </button>
                </div>
              </div>
            </div>
          );
        }}
      />
    </main>
  );
}