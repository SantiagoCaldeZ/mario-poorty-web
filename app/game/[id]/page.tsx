"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import GameBoard from "@/components/game/GameBoard";
import GameSidebar from "@/components/game/GameSidebar";
import MatchSummary from "@/components/game/MatchSummary";
import PlayersPanel from "@/components/game/PlayersPanel";

type MatchData = {
  id: string;
  lobby_id: string;
  status: "active" | "finished" | "abandoned";
  phase: "choosing_order" | "active" | "finished" | "abandoned";
  order_target_number: number | null;
  current_turn_user_id: string | null;
  turn_number: number;
  winner_user_id: string | null;
  started_at: string;
  finished_at: string | null;
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
  email: string | null;
};
type PlayTurnResult = {
  rolled_value: number;
  updated_position: number;
  next_turn_user_id: string | null;
  updated_turn_number: number;
  match_finished: boolean;
};

export default function GamePage() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");
  const [turnMessage, setTurnMessage] = useState("");
  const [match, setMatch] = useState<MatchData | null>(null);
  const [players, setPlayers] = useState<MatchPlayerRow[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState("");
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderFinalizing, setOrderFinalizing] = useState(false);

  useEffect(() => {
    const lobbyId = params.id;

    if (!lobbyId || typeof lobbyId !== "string") {
      setServerError("ID de partida inválido.");
      setLoading(false);
      return;
    }

    let isMounted = true;
    let activeMatchId: string | null = null;

    const loadGame = async (showLoading = false) => {
      if (showLoading && isMounted) {
        setLoading(true);
      }

      setServerError("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/login");
        return;
      }

      const userId = session.user.id;

      if (isMounted) {
        setCurrentUserId(userId);
      }

      const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .select(
          "id, lobby_id, status, phase, order_target_number, current_turn_user_id, turn_number, winner_user_id, started_at, finished_at"
        )
        .eq("lobby_id", lobbyId)
        .maybeSingle();

      if (matchError) {
        if (isMounted) {
          setServerError(matchError.message);
          setLoading(false);
        }
        return;
      }

      if (!matchData) {
        const { data: lobbyData, error: lobbyError } = await supabase
          .from("lobbies")
          .select("id, status")
          .eq("id", lobbyId)
          .maybeSingle();

        if (lobbyError) {
          if (isMounted) {
            setServerError(lobbyError.message);
            setLoading(false);
          }
          return;
        }

        if (!lobbyData) {
          if (isMounted) {
            setServerError("La partida no existe.");
            setLoading(false);
          }
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

        if (isMounted) {
          setServerError("La partida todavía no ha sido creada correctamente.");
          setLoading(false);
        }
        return;
      }

      activeMatchId = matchData.id;

      const { data: membership, error: membershipError } = await supabase
        .from("match_players")
        .select("id")
        .eq("match_id", matchData.id)
        .eq("user_id", userId)
        .maybeSingle();

      if (membershipError) {
        if (isMounted) {
          setServerError("No se pudo validar tu acceso a la partida.");
          setLoading(false);
        }
        return;
      }

      if (!membership) {
        router.replace("/home");
        return;
      }

      const { data: playerData, error: playerError } = await supabase
        .from("match_players")
        .select(
          "id, match_id, user_id, character_name, turn_order, board_position, is_finished, joined_at, selected_order_number, order_number_submitted_at"
        )
        .eq("match_id", matchData.id)
        .order("turn_order", { ascending: true });

      if (playerError) {
        if (isMounted) {
          setServerError(playerError.message);
          setLoading(false);
        }
        return;
      }

      const userIds = (playerData ?? []).map((player) => player.user_id);

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, email")
        .in("id", userIds);

      if (profileError) {
        if (isMounted) {
          setServerError(profileError.message);
          setLoading(false);
        }
        return;
      }

      const profilesMap = new Map(
        (profileData ?? []).map((profile) => [profile.id, profile])
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
          email: profile?.email ?? null,
        };
      });

      if (isMounted) {
        setMatch(matchData);
        setPlayers(mergedPlayers);
        setLoading(false);
      }
    };

    loadGame(true);

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
            (activeMatchId && newRow?.match_id === activeMatchId) ||
            (activeMatchId && oldRow?.match_id === activeMatchId)
          ) {
            await loadGame(false);
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(lobbyChannel);
      supabase.removeChannel(playersChannel);
    };
  }, [params.id, router]);

  const currentTurnPlayer = players.find(
    (player) => player.user_id === match?.current_turn_user_id
  );
  const winnerPlayer = players.find(
    (player) => player.user_id === match?.winner_user_id
  );
  const isMyTurn = currentUserId === match?.current_turn_user_id;
  const currentMatchId = match?.id ?? null;

  const handlePlayTurn = async () => {
    if (!currentMatchId) return;

    setServerError("");
    setTurnMessage("");

    const { data, error } = await supabase.rpc("play_turn", {
      target_match_id: currentMatchId,
    });

    if (error) {
      setServerError(error.message);
      return;
    }

    const result = Array.isArray(data) ? data[0] : data;

    if (result) {
      const turnResult = result as PlayTurnResult;

      if (turnResult.match_finished) {
        setTurnMessage(
          `Sacaste ${turnResult.rolled_value}. Llegaste a la meta en la posición ${turnResult.updated_position}. ¡Ganaste la partida!`
        );
      } else {
        setTurnMessage(
          `Sacaste ${turnResult.rolled_value}. Tu nueva posición es ${turnResult.updated_position}.`
        );
      }
    }

    const { data: updatedMatch, error: updatedMatchError } = await supabase
      .from("matches")
      .select(
      "id, lobby_id, status, phase, order_target_number, current_turn_user_id, turn_number, winner_user_id, started_at, finished_at"
    )
      .eq("id", currentMatchId)
      .maybeSingle();

    if (updatedMatchError) {
      setServerError(updatedMatchError.message);
      return;
    }

    const { data: updatedPlayers, error: updatedPlayersError } = await supabase
      .from("match_players")
      .select(
        "id, match_id, user_id, character_name, turn_order, board_position, is_finished, joined_at, selected_order_number, order_number_submitted_at"
      )
      .eq("match_id", currentMatchId)
      .order("turn_order", { ascending: true });

    if (updatedPlayersError) {
      setServerError(updatedPlayersError.message);
      return;
    }

    const userIds = (updatedPlayers ?? []).map((player) => player.user_id);

    const { data: updatedProfiles, error: updatedProfilesError } = await supabase
      .from("profiles")
      .select("id, username, email")
      .in("id", userIds);

    if (updatedProfilesError) {
      setServerError(updatedProfilesError.message);
      return;
    }

    const profilesMap = new Map(
      (updatedProfiles ?? []).map((profile) => [profile.id, profile])
    );

    const mergedPlayers: MatchPlayerRow[] = (updatedPlayers ?? []).map((player) => {
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
        email: profile?.email ?? null,
      };
    });

    if (updatedMatch) {
      setMatch(updatedMatch);
    }

    setPlayers(mergedPlayers);
  };

  const handleSubmitOrderNumber = async () => {
    if (!match?.id) return;

    const parsedNumber = Number(selectedOrderNumber);

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

    setSelectedOrderNumber("");
    window.location.reload();
  };

  const handleFinalizeOrder = async () => {
    if (!match?.id) return;

    setServerError("");
    setOrderFinalizing(true);

    const { error } = await supabase.rpc("finalize_turn_order", {
      target_match_id: match.id,
    });

    setOrderFinalizing(false);

    if (error) {
      setServerError(error.message);
      return;
    }

    window.location.reload();
  };

  const submittedPlayersCount = players.filter(
    (player) => player.selected_order_number !== null
  ).length;

  const myPlayer = players.find((player) => player.user_id === currentUserId);
  const iAlreadySubmittedOrder = myPlayer?.selected_order_number !== null;

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <p className="text-gray-700">Cargando partida...</p>
      </main>
    );
  }

  if (serverError) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
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

  if (match?.phase === "choosing_order") {
    return (
      <main className="min-h-screen bg-gray-100 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-md">
          <h1 className="text-3xl font-bold text-gray-900">Definición de orden</h1>
          <p className="mt-2 text-gray-600">
            Antes de comenzar, cada jugador debe escoger un número entre 1 y 1000.
            Luego se generará un número aleatorio y el orden se definirá según qué tan
            cerca quede cada jugador.
          </p>

          {serverError && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {serverError}
            </p>
          )}

          <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Jugadores que ya eligieron:</span>{" "}
              {submittedPlayersCount} / {players.length}
            </p>

            {match.order_target_number && (
              <p className="mt-2 text-sm text-gray-700">
                <span className="font-semibold">Número objetivo:</span>{" "}
                {match.order_target_number}
              </p>
            )}
          </div>

          <div className="mt-6 rounded-xl border border-gray-200 p-5">
            <h2 className="text-xl font-semibold text-gray-900">Tu elección</h2>

            {iAlreadySubmittedOrder ? (
              <p className="mt-3 text-sm text-green-700">
                Ya enviaste tu número:{" "}
                <span className="font-semibold">{myPlayer?.selected_order_number}</span>
              </p>
            ) : (
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={selectedOrderNumber}
                  onChange={(event) => setSelectedOrderNumber(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-black"
                  placeholder="Ingresa un número del 1 al 1000"
                />

                <button
                  type="button"
                  onClick={handleSubmitOrderNumber}
                  disabled={orderSubmitting}
                  className="rounded-lg bg-black px-4 py-2 text-white transition hover:opacity-90 disabled:opacity-60"
                >
                  {orderSubmitting ? "Enviando..." : "Confirmar número"}
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 rounded-xl border border-gray-200 p-5">
            <h2 className="text-xl font-semibold text-gray-900">Jugadores</h2>

            <div className="mt-4 space-y-3">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700"
                >
                  <p>
                    <span className="font-semibold">Jugador:</span>{" "}
                    {player.username ?? "Sin username"}
                    {player.user_id === currentUserId ? " (Tú)" : ""}
                  </p>
                  <p>
                    <span className="font-semibold">Estado:</span>{" "}
                    {player.selected_order_number !== null ? "Ya eligió número" : "Pendiente"}
                  </p>
                  {player.selected_order_number !== null && (
                    <p>
                      <span className="font-semibold">Número elegido:</span>{" "}
                      {player.selected_order_number}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => router.push("/home")}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition hover:bg-gray-50"
            >
              Volver al inicio
            </button>

            <button
              type="button"
              onClick={handleFinalizeOrder}
              disabled={orderFinalizing}
              className="rounded-lg bg-black px-4 py-2 text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {orderFinalizing ? "Definiendo orden..." : "Definir orden y continuar"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-2xl bg-white p-8 shadow-md">
          <h1 className="text-3xl font-bold text-gray-900">Partida en progreso</h1>
          <p className="mt-2 text-gray-600">
            Esta es una primera versión visual de la partida mientras se sigue
            construyendo el tablero principal.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <MatchSummary
              match={match}
              currentTurnPlayer={currentTurnPlayer}
              winnerPlayer={winnerPlayer}
            />

            <GameBoard
              players={players}
              currentUserId={currentUserId}
              currentTurnUserId={match?.current_turn_user_id ?? null}
              winnerUserId={match?.winner_user_id ?? null}
              matchStatus={match?.status ?? null}
            />

            <PlayersPanel
              players={players}
              currentUserId={currentUserId}
              currentTurnUserId={match?.current_turn_user_id ?? null}
            />
          </div>

          <div>
            <GameSidebar
              matchStatus={match?.status ?? null}
              turnNumber={match?.turn_number ?? null}
              currentTurnPlayer={currentTurnPlayer}
              winnerPlayer={winnerPlayer}
              turnMessage={turnMessage}
              isMyTurn={isMyTurn}
              onPlayTurn={handlePlayTurn}
              onGoHome={() => router.push("/home")}
              finishedAt={match?.finished_at ?? null}
            />
          </div>
        </div>
      </div>
    </main>
  );
}