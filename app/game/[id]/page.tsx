"use client";

import { useCallback, useEffect, useMemo, useLayoutEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import GameBoard from "@/components/game/GameBoard";
import GameSidebar from "@/components/game/GameSidebar";
import MatchSummary from "@/components/game/MatchSummary";
import PlayersPanel from "@/components/game/PlayersPanel";
import CharacterSelectionScreen from "@/components/game/CharacterSelectionScreen";
import OrderSelectionScreen from "@/components/game/OrderSelectionScreen";
import CharacterRevealScreen from "@/components/game/CharacterRevealScreen";
import { getTileLandingPreview } from "@/lib/board";
import TurnController from "@/components/game/turn/TurnController";
import MinigameHost from "@/components/game/minigames/MinigameHost";
import type {
  ChaosCardDrawnEvent,
  MatchFinishedEvent,
  StatusAppliedEvent,
  TileLandedEvent,
  TurnBlockedByPendingMinigameEvent,
  TurnEndedEvent,
  TurnPlan,
} from "@/lib/game/turn-engine/turn-event-types";

type MatchData = {
  id: string;
  lobby_id: string;
  status: "active" | "finished" | "abandoned";
  phase: "choosing_order" | "choosing_character" | "active" | "finished" | "abandoned";
  order_target_number: number | null;
  order_selection_deadline_at: string | null;
  order_finalized_at: string | null;
  current_turn_user_id: string | null;
  turn_number: number;
  winner_user_id: string | null;
  started_at: string;
  finished_at: string | null;
  current_character_turn_order: number | null;
  current_character_turn_started_at: string | null;
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
};

type PublicProfileRow = {
  id: string;
  username: string | null;
  avatar_url: string | null;
};

type PlayTurnResult = {
  rolled_value: number;
  updated_position: number;
  next_turn_user_id: string | null;
  updated_turn_number: number;
  match_finished: boolean;
  turn_plan?: TurnPlan | null;
};

type FinalizeOrderResult = {
  target_number: number | null;
  first_turn_user_id: string | null;
  finalized: boolean;
  next_phase: string | null;
};

export default function GamePage() {
  const params = useParams();
  const router = useRouter();

  const lobbyId = typeof params.id === "string" ? params.id : null;

  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");
  const [turnMessage, setTurnMessage] = useState("");
  const [match, setMatch] = useState<MatchData | null>(null);
  const [players, setPlayers] = useState<MatchPlayerRow[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState("");
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderFinalizing, setOrderFinalizing] = useState(false);
  const [selectionSubmitting, setSelectionSubmitting] = useState(false);
  const [selectingCharacter, setSelectingCharacter] = useState<string | null>(null);
  const [currentTurnPlan, setCurrentTurnPlan] = useState<TurnPlan | null>(null);

  const currentCharacterPickerUserId = useMemo(() => {
    if (!match) return null;
    if (match.phase !== "choosing_character") return null;
    if (match.current_character_turn_order === null) return null;

    return (
      players.find(
        (player) => player.turn_order === match.current_character_turn_order
      )?.user_id ?? null
    );
  }, [
    match?.phase,
    match?.current_character_turn_order,
    players,
  ]);

  const characterTurnResetKey = [
    match?.id ?? "none",
    match?.phase ?? "none",
    match?.current_character_turn_order ?? "none",
    match?.current_character_turn_started_at ?? "none",
    currentCharacterPickerUserId ?? "none",
  ].join(":");

  useEffect(() => {
    setServerError("");
    setSelectionSubmitting(false);
    setSelectingCharacter(null);
  }, [characterTurnResetKey]);

  const [characterRevealState, setCharacterRevealState] = useState<"hidden" | "showing">(
    "hidden"
  );

  const myPlayer = players.find((player) => player.user_id === currentUserId) ?? null;
  const myChosenCharacterName = myPlayer?.character_name ?? null;

  const activeMatchIdRef = useRef<string | null>(null);

  const selectedOrderNumberRef = useRef(selectedOrderNumber);

  useEffect(() => {
    selectedOrderNumberRef.current = selectedOrderNumber;
  }, [selectedOrderNumber]);


  const loadPlayersSnapshot = useCallback(async (matchId: string) => {
    const { data: playerData, error: playerError } = await supabase
      .from("match_players")
      .select(
        "id, match_id, user_id, character_name, turn_order, board_position, is_finished, joined_at, selected_order_number, order_number_submitted_at"
      )
      .eq("match_id", matchId)
      .order("turn_order", { ascending: true });

    if (playerError) {
      setServerError(playerError.message);
      return null;
    }

    const userIds = (playerData ?? []).map((player) => player.user_id);

    const { data: profileData, error: profileError } = await supabase.rpc(
      "get_public_profiles",
      { profile_ids: userIds }
    );

    if (profileError) {
      setServerError(profileError.message);
      return null;
    }

    const publicProfiles = (profileData ?? []) as PublicProfileRow[];

    const profilesMap = new Map(
      publicProfiles.map((profile) => [profile.id, profile])
    );

    const mergedPlayers: MatchPlayerRow[] = (playerData ?? []).map((player) => {
      const profile = profilesMap.get(player.user_id);

      return {
        id: player.id,
        match_id: player.match_id,
        user_id: player.user_id,
        character_name: player.character_name,
        turn_order: player.turn_order,
        board_position: player.board_position,
        is_finished: player.is_finished,
        joined_at: player.joined_at,
        selected_order_number: player.selected_order_number,
        order_number_submitted_at: player.order_number_submitted_at,
        username: profile?.username ?? null,
      };
    });

    return mergedPlayers;
  }, []);

  const loadGame = useCallback(
    async (showLoading = false) => {
      if (!lobbyId) {
        setServerError("ID de partida inválido.");
        setLoading(false);
        return;
      }

      if (showLoading) {
        setLoading(true);
      }

      setServerError("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/");
        return;
      }

      const userId = session.user.id;
      setCurrentUserId(userId);

      const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .select(
          "id, lobby_id, status, phase, order_target_number, order_selection_deadline_at, order_finalized_at, current_character_turn_order, current_character_turn_started_at, current_turn_user_id, turn_number, winner_user_id, started_at, finished_at"
        )
        .eq("lobby_id", lobbyId)
        .maybeSingle();

      if (matchError) {
        setServerError(matchError.message);
        setLoading(false);
        return;
      }

      if (!matchData) {
        const { data: lobbyData, error: lobbyError } = await supabase
          .from("lobbies")
          .select("id, status")
          .eq("id", lobbyId)
          .maybeSingle();

        if (lobbyError) {
          setServerError(lobbyError.message);
          setLoading(false);
          return;
        }

        if (!lobbyData) {
          setServerError("La partida no existe.");
          setLoading(false);
          return;
        }

        if (lobbyData.status === "waiting") {
          router.replace(`/lobby/${lobbyId}`);
          return;
        }

        if (lobbyData.status === "closed") {
          router.replace("/home");
          return;
        }

        setServerError("La partida todavía no ha sido creada correctamente.");
        setLoading(false);
        return;
      }

      activeMatchIdRef.current = matchData.id;

      const { data: membership, error: membershipError } = await supabase
        .from("match_players")
        .select("id")
        .eq("match_id", matchData.id)
        .eq("user_id", userId)
        .maybeSingle();

      if (membershipError) {
        setServerError("No se pudo validar tu acceso a la partida.");
        setLoading(false);
        return;
      }

      if (!membership) {
        router.replace("/home");
        return;
      }

      const mergedPlayers = await loadPlayersSnapshot(matchData.id);

      if (!mergedPlayers) {
        setLoading(false);
        return;
      }

      setMatch(matchData);
      setPlayers(mergedPlayers);
      setLoading(false);
    },
    [lobbyId, loadPlayersSnapshot, router]
  );

  useEffect(() => {
    if (match?.phase !== "active") {
      setCurrentTurnPlan(null);
    }
  }, [match?.phase]);

  useEffect(() => {
    if (!lobbyId) {
      setServerError("ID de partida inválido.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const init = async () => {
      if (cancelled) return;
      await loadGame(true);
    };

    init();

    const lobbyChannel = supabase
      .channel(`game-lobby-${lobbyId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
        },
        async (payload) => {
          const newRow = payload.new as { lobby_id?: string } | undefined;
          const oldRow = payload.old as { lobby_id?: string } | undefined;

          if (newRow?.lobby_id === lobbyId || oldRow?.lobby_id === lobbyId) {
            await loadGame(false);
          }
        }
      )
      .subscribe();

    const playersChannel = supabase
      .channel(`game-players-${lobbyId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "match_players",
        },
        async (payload) => {
          const newRow = payload.new as { match_id?: string } | undefined;
          const oldRow = payload.old as { match_id?: string } | undefined;

          if (
            (activeMatchIdRef.current && newRow?.match_id === activeMatchIdRef.current) ||
            (activeMatchIdRef.current && oldRow?.match_id === activeMatchIdRef.current)
          ) {
            await loadGame(false);
          }
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(lobbyChannel);
      supabase.removeChannel(playersChannel);
    };
  }, [lobbyId, loadGame]);

  useEffect(() => {
    if (!match?.id) return;
    if (match.phase !== "choosing_character") return;
    if (match.current_character_turn_order === null) return;
    if (match.current_character_turn_started_at) return;

    let cancelled = false;

    const ensureStarted = async () => {
      const { data, error } = await supabase.rpc(
        "ensure_character_selection_turn_started",
        {
          target_match_id: match.id,
        }
      );

      if (cancelled) return;

      if (error) {
        setServerError(error.message);
        return;
      }

      if (data) {
        setMatch((prev) =>
          prev
            ? {
                ...prev,
                current_character_turn_started_at: data as string,
              }
            : prev
        );
      }
    };

    ensureStarted();

    return () => {
      cancelled = true;
    };
  }, [
    match?.id,
    match?.phase,
    match?.current_character_turn_order,
    match?.current_character_turn_started_at,
  ]);

  useLayoutEffect(() => {
    if (!match?.id || !currentUserId || match.phase !== "active" || !myChosenCharacterName) {
      setCharacterRevealState("hidden");
      return;
    }

    const storageKey = `pwg-character-reveal:${match.id}:${currentUserId}`;
    const alreadyShown = window.sessionStorage.getItem(storageKey) === "1";

    setCharacterRevealState(alreadyShown ? "hidden" : "showing");
  }, [match?.id, match?.phase, currentUserId, myChosenCharacterName]);

  const currentTurnPlayer =
    players.find((player) => player.user_id === match?.current_turn_user_id) ?? null;

  const winnerPlayer =
    players.find((player) => player.user_id === match?.winner_user_id) ?? null;

  const leadingPlayer =
  [...players].sort((a, b) => b.board_position - a.board_position)[0] ?? null;

  const isMyTurn = currentUserId === match?.current_turn_user_id;
  const currentMatchId = match?.id ?? null;

  const handlePlayTurn = useCallback(async (): Promise<PlayTurnResult | null> => {
    if (!currentMatchId) return null;

    setServerError("");
    setTurnMessage("");

    const { data, error } = await supabase.rpc("play_turn", {
      target_match_id: currentMatchId,
    });

    if (error) {
      setServerError(error.message);
      return null;
    }

    const result = Array.isArray(data) ? data[0] : data;
    return result ? (result as PlayTurnResult) : null;
  }, [currentMatchId]);

  const handleRollResolved = useCallback(
    async (turnResult: PlayTurnResult) => {
      const landingPreview = currentMatchId
        ? getTileLandingPreview(currentMatchId, turnResult.updated_position)
        : null;

      const landingText = landingPreview
        ? ` ${landingPreview.previewText}`
        : "";

      if (turnResult.match_finished) {
        setTurnMessage(
          `Sacaste ${turnResult.rolled_value}. Llegaste a la meta en la posición ${turnResult.updated_position}. ¡Ganaste la partida!${landingText}`
        );
      } else {
        setTurnMessage(
          `Sacaste ${turnResult.rolled_value}. Tu nueva posición es ${turnResult.updated_position}.${landingText}`
        );
      }

      await loadGame(false);

      if (turnResult.turn_plan) {
        setCurrentTurnPlan(turnResult.turn_plan);
      } else {
        setCurrentTurnPlan(null);
      }
    },
    [currentMatchId, loadGame]
  );

  const handleSubmitOrderNumber = useCallback(async (forcedNumber?: number) => {
    if (!match?.id) return;

    const parsedNumber =
      typeof forcedNumber === "number"
        ? forcedNumber
        : Number(selectedOrderNumberRef.current);

    if (!Number.isInteger(parsedNumber) || parsedNumber < 1 || parsedNumber > 1000) {
      setServerError("Debes ingresar un número entero entre 1 y 1000.");
      return;
    }

    setServerError("");
    setOrderSubmitting(true);

    const { error } = await supabase.rpc("submit_order_number", {
      target_match_id: match.id,
      chosen_number: parsedNumber,
    });

    setOrderSubmitting(false);

    if (error) {
      setServerError(error.message);
      return;
    }

    const refreshedPlayers = await loadPlayersSnapshot(match.id);

    if (refreshedPlayers) {
      setPlayers(refreshedPlayers);
    } else {
      setPlayers((prev) =>
        prev.map((player) =>
          player.user_id === currentUserId
            ? {
                ...player,
                selected_order_number: parsedNumber,
                order_number_submitted_at: new Date().toISOString(),
              }
            : player
        )
      );
    }

    setSelectedOrderNumber("");
  }, [currentUserId, loadPlayersSnapshot, match?.id]);


  const handleFinalizeOrder = useCallback(async (): Promise<FinalizeOrderResult | null> => {
    if (!match?.id) return null;

    setServerError("");
    setOrderFinalizing(true);

    const { data, error } = await supabase.rpc("finalize_turn_order", {
      target_match_id: match.id,
    });

    setOrderFinalizing(false);

    if (error) {
      setServerError(error.message);
      return null;
    }

    const result = Array.isArray(data) ? data[0] : data;

    const refreshedPlayers = await loadPlayersSnapshot(match.id);

    if (refreshedPlayers) {
      setPlayers(refreshedPlayers);
    }

    if (result?.finalized) {
      setTimeout(() => {
        window.location.reload();
      }, 12010);
    }

    return {
      target_number: result?.target_number ?? null,
      first_turn_user_id: result?.first_turn_user_id ?? null,
      finalized: Boolean(result?.finalized),
      next_phase: result?.next_phase ?? null,
    };
  }, [loadPlayersSnapshot, match?.id]);

  const handleSelectCharacter = useCallback(async (characterName: string) => {
    if (!match?.id) return;

    setServerError("");
    setSelectionSubmitting(true);
    setSelectingCharacter(characterName);

    const { error } = await supabase.rpc("select_character", {
      target_match_id: match.id,
      chosen_character: characterName,
    });

    setSelectionSubmitting(false);
    setSelectingCharacter(null);

    if (error) {
      setServerError(error.message);
      return;
    }

    await loadGame(false);
  }, [loadGame, match?.id]);


  const handleAutoSelectCharacter = useCallback(async (): Promise<"ok" | "retry"> => {
    if (!match?.id) return "retry";

    setServerError("");
    setSelectionSubmitting(true);
    setSelectingCharacter("__AUTO__");

    const { error } = await supabase.rpc("auto_select_character", {
      target_match_id: match.id,
    });

    setSelectionSubmitting(false);
    setSelectingCharacter(null);

    if (!error) {
      await loadGame(false);
      return "ok";
    }

    if (error.message === "El tiempo de selección aún no terminó.") {
      return "retry";
    }

    const ignorableMessages = [
      "La partida no está en fase de selección de personajes.",
      "No hay un turno de selección de personaje definido.",
      "El jugador actual ya tiene un personaje asignado.",
    ];

    if (ignorableMessages.includes(error.message)) {
      await loadGame(false);
      return "ok";
    }

    setServerError(error.message);
    return "ok";
  }, [loadGame, match?.id]);

  const handleCharacterRevealDone = useCallback(() => {
    if (match?.id && currentUserId) {
      const storageKey = `pwg-character-reveal:${match.id}:${currentUserId}`;
      window.sessionStorage.setItem(storageKey, "1");
    }

    setCharacterRevealState("hidden");
  }, [match?.id, currentUserId]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <p className="text-gray-700">Cargando partida...</p>
      </main>
    );
  }

  if (match?.phase === "choosing_order") {
    return (
      <OrderSelectionScreen
        players={players}
        currentUserId={currentUserId}
        selectedOrderNumber={selectedOrderNumber}
        onSelectedOrderNumberChange={setSelectedOrderNumber}
        onSubmitOrderNumber={handleSubmitOrderNumber}
        onFinalizeOrder={handleFinalizeOrder}
        onGoHome={() => router.push("/home")}
        orderSubmitting={orderSubmitting}
        orderFinalizing={orderFinalizing}
        serverError={serverError}
        orderTargetNumber={match.order_target_number}
        orderSelectionDeadlineAt={match.order_selection_deadline_at}
        orderFinalizedAt={match.order_finalized_at}
      />
    );
  }

  if (match?.phase === "choosing_character") {
    return (
      <CharacterSelectionScreen
        players={players}
        currentUserId={currentUserId}
        currentCharacterTurnOrder={match.current_character_turn_order}
        currentCharacterTurnStartedAt={match.current_character_turn_started_at}
        orderTargetNumber={match.order_target_number}
        selectingCharacter={selectingCharacter}
        onSelectCharacter={handleSelectCharacter}
        onAutoSelectCharacter={handleAutoSelectCharacter}
        onGoHome={() => router.push("/home")}
        selectionSubmitting={selectionSubmitting}
        serverError={serverError}
      />
    );
  }

  if (
    match?.phase === "active" &&
    characterRevealState === "showing" &&
    myChosenCharacterName
  ) {
    return (
      <CharacterRevealScreen
        characterName={myChosenCharacterName}
        onDone={handleCharacterRevealDone}
        durationMs={4000}
      />
    );
  }

  if (serverError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-md">
          <h1 className="text-2xl font-bold text-gray-900">Partida</h1>
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {serverError}
          </p>

          <button
            type="button"
            onClick={() => router.push("/home")}
            className="mt-6 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition hover:bg-gray-50"
          >
            Volver al inicio
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#17121C_0%,#0C0F12_38%,#050607_100%)] text-[#F8FFF0]">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(111,214,255,0.06),transparent_20%,transparent_78%,rgba(255,216,107,0.06))]" />
      <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,rgba(240,247,229,0.85)_1px,transparent_1px),linear-gradient(to_bottom,rgba(240,247,229,0.85)_1px,transparent_1px)] [background-size:44px_44px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(111,214,255,0.10),transparent_18%),radial-gradient(circle_at_85%_14%,rgba(255,123,165,0.08),transparent_18%),radial-gradient(circle_at_20%_80%,rgba(134,240,127,0.08),transparent_16%),radial-gradient(circle_at_80%_78%,rgba(255,216,107,0.08),transparent_16%)]" />

      <div className="pointer-events-none absolute left-[8%] top-[12%] h-40 w-40 rounded-full bg-[#6FD6FF]/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[10%] top-[12%] h-40 w-40 rounded-full bg-[#FF7BA5]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[8%] left-[20%] h-32 w-32 rounded-full bg-[#86F07F]/8 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[10%] right-[18%] h-32 w-32 rounded-full bg-[#FFD86B]/8 blur-3xl" />

      <div className="relative mx-auto max-w-[1900px] px-4 py-6 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[40px] border border-[#F1F6E8]/10 bg-[linear-gradient(180deg,rgba(14,16,18,0.96),rgba(7,8,10,0.98))] shadow-[0_32px_100px_rgba(0,0,0,0.48)]">
          <div className="border-b border-[#F1F6E8]/10 bg-[linear-gradient(90deg,rgba(111,214,255,0.08),rgba(134,240,127,0.08),rgba(255,216,107,0.08),rgba(255,123,165,0.07))] px-6 py-6">
            <div className="flex flex-col gap-6 2xl:flex-row 2xl:items-end 2xl:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[#6FD6FF]/20 bg-[#6FD6FF]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#DDF7FF]">
                    Mesa activa
                  </span>
                  <span className="rounded-full border border-[#86F07F]/20 bg-[#86F07F]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#E6FFD9]">
                    Tablero principal
                  </span>
                  <span className="rounded-full border border-[#FFD86B]/20 bg-[#FFD86B]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#FFF0BA]">
                    Turno #{match?.turn_number ?? "-"}
                  </span>
                  <span className="rounded-full border border-[#FF7BA5]/20 bg-[#FF7BA5]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#FFD7E6]">
                    Estado: {match?.status ?? "-"}
                  </span>
                </div>

                <h1 className="mt-4 text-4xl font-black leading-tight text-[#F8FFF0] sm:text-5xl">
                  Cámara de
                  <span className="bg-[linear-gradient(135deg,#6FD6FF_0%,#86F07F_28%,#FFD86B_62%,#FF7BA5_100%)] bg-clip-text text-transparent">
                    {" "}
                    expedición
                  </span>
                </h1>

                <p className="mt-3 max-w-4xl text-base leading-7 text-[#DBE8D6]/80">
                  Esta pantalla ya está construida alrededor del tablero. El recorrido es
                  el centro de la experiencia y el resto de paneles ahora acompaña la
                  partida desde abajo, sin robarle protagonismo.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[24px] border border-[#6FD6FF]/16 bg-[linear-gradient(135deg,rgba(111,214,255,0.12),rgba(11,18,22,0.98))] px-4 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.18)]">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#DDF7FF]">
                    Turno actual
                  </p>
                  <p className="mt-2 break-all text-lg font-black leading-tight text-[#F8FFF0]">
                    {currentTurnPlayer?.username ?? "No definido"}
                    {currentTurnPlayer?.user_id === currentUserId ? " (Tú)" : ""}
                  </p>
                </div>

                <div className="rounded-[24px] border border-[#86F07F]/16 bg-[linear-gradient(135deg,rgba(134,240,127,0.12),rgba(12,20,13,0.98))] px-4 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.18)]">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#E6FFD9]">
                    Tu campeón
                  </p>
                  <p className="mt-2 break-all text-lg font-black leading-tight text-[#F8FFF0]">
                    {myChosenCharacterName ?? "No definido"}
                  </p>
                </div>

                <div className="rounded-[24px] border border-[#FFD86B]/16 bg-[linear-gradient(135deg,rgba(255,216,107,0.12),rgba(24,20,10,0.98))] px-4 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.18)]">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#FFF0BA]">
                    Líder actual
                  </p>
                  <p className="mt-2 break-all text-lg font-black leading-tight text-[#F8FFF0]">
                    {leadingPlayer?.username ?? "No definido"}
                  </p>
                  <p className="mt-1 text-sm text-[#FFF3CC]/74">
                    Casilla {leadingPlayer?.board_position ?? "-"}
                  </p>
                </div>

                <div className="rounded-[24px] border border-[#FF7BA5]/16 bg-[linear-gradient(135deg,rgba(255,123,165,0.12),rgba(24,11,17,0.98))] px-4 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.18)]">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#FFD7E6]">
                    Ganador
                  </p>
                  <p className="mt-2 break-all text-lg font-black leading-tight text-[#F8FFF0]">
                    {winnerPlayer?.username ?? (match?.status === "finished" ? "Definido" : "Aún no")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-6">
            <GameBoard
              matchId={match?.id ?? ""}
              players={players}
              currentUserId={currentUserId}
              currentTurnUserId={match?.current_turn_user_id ?? null}
              winnerUserId={match?.winner_user_id ?? null}
              matchStatus={match?.status ?? null}
              turnMessage={turnMessage}
              isMyTurn={isMyTurn}
              onPlayTurn={handlePlayTurn}
              onRollResolved={handleRollResolved}
            />

            <div className="grid gap-6 2xl:grid-cols-[430px_430px_minmax(0,1fr)]">
              <GameSidebar
                matchStatus={match?.status ?? null}
                turnNumber={match?.turn_number ?? null}
                currentTurnPlayer={currentTurnPlayer}
                winnerPlayer={winnerPlayer}
                turnMessage={turnMessage}
                isMyTurn={isMyTurn}
                onPlayTurn={handlePlayTurn}
                onRollResolved={handleRollResolved}
                onGoHome={() => router.push("/home")}
                finishedAt={match?.finished_at ?? null}
              />

              <MatchSummary
                match={match}
                currentTurnPlayer={currentTurnPlayer}
                winnerPlayer={winnerPlayer}
              />

              <PlayersPanel
                players={players}
                currentUserId={currentUserId}
                currentTurnUserId={match?.current_turn_user_id ?? null}
              />

              <TurnController
                plan={currentTurnPlan}
                enabled={match?.phase === "active"}
                onTileLanded={async (event: TileLandedEvent) => {
                  setTurnMessage(`Cayó en la casilla ${event.tileIndex}.`);
                }}
                onStatusApplied={async (event: StatusAppliedEvent) => {
                  setTurnMessage(event.message.description);
                }}
                onChaosCardDrawn={async (event: ChaosCardDrawnEvent) => {
                  setTurnMessage(`${event.message.title}: ${event.message.description}`);
                }}
                onBlockedByPendingMinigame={async (
                  event: TurnBlockedByPendingMinigameEvent,
                ) => {
                  setTurnMessage(event.message.description);
                }}
                onTurnEnded={async (event: TurnEndedEvent) => {
                  if (event.endedBecause !== "match_finished") {
                    setTurnMessage("El turno terminó.");
                  }
                }}
                onMatchFinished={async (event: MatchFinishedEvent) => {
                  setTurnMessage(event.message.description);
                  await loadGame(false);
                }}
                onPlaybackComplete={async () => {
                  setCurrentTurnPlan(null);
                }}
                onPlaybackError={async (error) => {
                  console.error("Error reproduciendo el turn plan:", error);
                  setCurrentTurnPlan(null);
                }}
                renderActiveMinigame={({ activeMinigame, closeMinigame }) => {
                  if (!activeMinigame.open || !activeMinigame.event) {
                    return null;
                  }

                  const event = activeMinigame.event;

                  return (
                    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/75 p-4">
                      <div className="w-full max-w-5xl rounded-3xl border border-slate-700 bg-slate-950 shadow-2xl">
                        <div className="border-b border-slate-800 px-6 py-4">
                          <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                            Minijuego activo
                          </p>
                          <h2 className="mt-1 text-2xl font-bold text-slate-100">
                            {event.message.title}
                          </h2>
                          <p className="mt-2 text-sm text-slate-300">
                            {event.message.description}
                          </p>
                        </div>

                        <div className="px-6 py-5">
                          <MinigameHost
                            event={event}
                            onResolve={async (payload) => {
                              closeMinigame();

                              if (payload.result === "won") {
                                setTurnMessage(
                                  `Ganaste ${event.message.title}. Quedas liberado de la casilla.`,
                                );
                              } else {
                                setTurnMessage(
                                  `Perdiste ${event.message.title}. Quedarás pendiente en esta casilla.`,
                                );
                              }

                              setCurrentTurnPlan(null);
                            }}
                            onCancel={() => {
                              closeMinigame();
                              setTurnMessage("Se cerró el minijuego activo.");
                              setCurrentTurnPlan(null);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}