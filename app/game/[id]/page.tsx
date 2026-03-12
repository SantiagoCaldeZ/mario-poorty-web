"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type MatchData = {
  id: string;
  lobby_id: string;
  status: "active" | "finished" | "abandoned";
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

const TOTAL_CELLS = 30;

function clampBoardPosition(position: number) {
  if (position < 0) return 0;
  if (position > TOTAL_CELLS) return TOTAL_CELLS;
  return position;
}

function getPlayersByCell(players: MatchPlayerRow[]) {
  const grouped = new Map<number, MatchPlayerRow[]>();

  for (const player of players) {
    const position = clampBoardPosition(player.board_position);

    if (!grouped.has(position)) {
      grouped.set(position, []);
    }

    grouped.get(position)!.push(player);
  }

  return grouped;
}

export default function GamePage() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");
  const [turnMessage, setTurnMessage] = useState("");
  const [match, setMatch] = useState<MatchData | null>(null);
  const [players, setPlayers] = useState<MatchPlayerRow[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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
          "id, lobby_id, status, current_turn_user_id, turn_number, winner_user_id, started_at, finished_at"
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
          "id, match_id, user_id, character_name, turn_order, board_position, is_finished, joined_at"
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
  const playersByCell = getPlayersByCell(players);
  const boardCells = Array.from({ length: TOTAL_CELLS + 1 }, (_, index) => index);

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
        "id, lobby_id, status, current_turn_user_id, turn_number, winner_user_id, started_at, finished_at"
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
        "id, match_id, user_id, character_name, turn_order, board_position, is_finished, joined_at"
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
        username: profile?.username ?? null,
        email: profile?.email ?? null,
      };
    });

    if (updatedMatch) {
      setMatch(updatedMatch);
    }

    setPlayers(mergedPlayers);
  };

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

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-md">
        <h1 className="text-3xl font-bold text-gray-900">Partida en progreso</h1>
        <p className="mt-2 text-gray-600">
          Esta es una primera versión visual de la partida mientras se sigue construyendo el tablero principal.
        </p>

        {match && (
          <div className="mt-8 grid gap-4 rounded-xl bg-gray-50 p-5 sm:grid-cols-2">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">ID de partida:</span> {match.id}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Lobby ID:</span> {match.lobby_id}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Estado:</span> {match.status}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Turno número:</span> {match.turn_number}
            </p>
            <p className="text-sm text-gray-700 sm:col-span-2">
              <span className="font-semibold">Turno actual:</span>{" "}
              {match.status === "finished"
                ? "Partida terminada"
                : currentTurnPlayer?.username ?? "No definido"}
            </p>

            {match.status === "finished" && (
              <p className="text-sm text-gray-700 sm:col-span-2">
                <span className="font-semibold">Ganador:</span>{" "}
                {winnerPlayer?.username ?? "Jugador ganador"}
              </p>
            )}
          </div>
        )}

        <div className="mt-8 rounded-xl border border-gray-200 p-5">
          <h2 className="text-xl font-semibold text-gray-900">Jugadores en partida</h2>

          {players.length === 0 ? (
            <p className="mt-3 text-sm text-gray-600">
              No hay jugadores cargados en esta partida.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {players.map((player) => {
                const isCurrentUser = player.user_id === currentUserId;
                const isCurrentTurn = player.user_id === match?.current_turn_user_id;

                return (
                  <div
                    key={player.id}
                    className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700"
                  >
                    <p>
                      <span className="font-semibold">Usuario:</span>{" "}
                      {player.username ?? "Sin username"}
                      {isCurrentUser ? " (Tú)" : ""}
                    </p>
                    <p>
                      <span className="font-semibold">Correo:</span>{" "}
                      {player.email ?? "Sin correo"}
                    </p>
                    <p>
                      <span className="font-semibold">Orden de turno:</span>{" "}
                      {player.turn_order}
                    </p>
                    <p>
                      <span className="font-semibold">Posición en tablero:</span>{" "}
                      {player.board_position}
                    </p>
                    <p>
                      <span className="font-semibold">Personaje:</span>{" "}
                      {player.character_name ?? "Sin asignar"}
                    </p>
                    <p>
                      <span className="font-semibold">Estado:</span>{" "}
                      {player.is_finished ? "Terminó" : "En juego"}
                    </p>
                    <p>
                      <span className="font-semibold">Rol:</span>{" "}
                      {player.turn_order === 1 ? "Host / Primer turno" : "Jugador"}
                    </p>
                    {isCurrentTurn && (
                      <p className="mt-2 font-semibold text-green-700">
                        Es el turno de este jugador.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {match?.status === "finished" && (
          <div className="mt-6 rounded-xl border border-yellow-300 bg-yellow-50 p-5">
            <h2 className="text-xl font-bold text-yellow-900">Partida finalizada</h2>
            <p className="mt-2 text-sm text-yellow-800">
              Ganador:{" "}
              <span className="font-semibold">
                {winnerPlayer?.username ?? "Jugador ganador"}
              </span>
            </p>

            {match.finished_at && (
              <p className="mt-1 text-xs text-yellow-700">
                Finalizó en: {new Date(match.finished_at).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {turnMessage && (
          <p className="mt-6 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
            {turnMessage}
          </p>
        )}

        <div className="mt-8 rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Tablero</h2>
              <p className="mt-1 text-sm text-gray-600">
                Vista mínima del recorrido actual de la partida.
              </p>
            </div>

            <div className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700">
              Meta: casilla {TOTAL_CELLS}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {boardCells.map((cellNumber) => {
              const cellPlayers = playersByCell.get(cellNumber) ?? [];
              const hasCurrentTurnPlayer = cellPlayers.some(
                (player) => player.user_id === match?.current_turn_user_id
              );
              const hasWinner = winnerPlayer
                ? cellPlayers.some((player) => player.user_id === winnerPlayer.user_id)
                : false;

              return (
                <div
                  key={cellNumber}
                  className={`rounded-xl border p-3 shadow-sm transition ${
                    cellNumber === TOTAL_CELLS
                      ? "border-yellow-300 bg-yellow-50"
                      : "border-gray-200 bg-gray-50"
                  } ${hasCurrentTurnPlayer ? "ring-2 ring-green-500" : ""}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-gray-900">
                      Casilla {cellNumber}
                    </span>

                    {cellNumber === 0 && (
                      <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-700">
                        Inicio
                      </span>
                    )}

                    {cellNumber === TOTAL_CELLS && (
                      <span className="rounded-full bg-yellow-200 px-2 py-0.5 text-[11px] font-medium text-yellow-800">
                        Meta
                      </span>
                    )}
                  </div>

                  <div className="mt-3 min-h-[72px]">
                    {cellPlayers.length === 0 ? (
                      <p className="text-xs text-gray-400">Sin jugadores</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {cellPlayers.map((player) => {
                          const isCurrentUser = player.user_id === currentUserId;
                          const isCurrentTurn = player.user_id === match?.current_turn_user_id;
                          const isWinner = player.user_id === match?.winner_user_id;

                          return (
                            <div
                              key={player.id}
                              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                                isWinner
                                  ? "bg-yellow-200 text-yellow-900"
                                  : isCurrentTurn
                                  ? "bg-green-100 text-green-800"
                                  : isCurrentUser
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-white text-gray-700 border border-gray-200"
                              }`}
                            >
                              <p className="font-semibold">
                                {player.username ?? "Jugador"}
                                {isCurrentUser ? " (Tú)" : ""}
                              </p>
                              <p className="text-[11px] opacity-80">
                                Orden {player.turn_order}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {hasWinner && (
                    <p className="mt-2 text-xs font-semibold text-yellow-700">
                      Jugador ganador en esta casilla.
                    </p>
                  )}

                  {hasCurrentTurnPlayer && match?.status === "active" && (
                    <p className="mt-2 text-xs font-semibold text-green-700">
                      Turno actual aquí.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => router.push("/home")}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition hover:bg-gray-50"
          >
            Volver al inicio
          </button>

          {match?.status === "active" && isMyTurn && (
            <button
              type="button"
              onClick={handlePlayTurn}
              className="rounded-lg bg-black px-4 py-2 text-white transition hover:opacity-90"
            >
              Lanzar dado
            </button>
          )}
        </div>
      </div>
    </main>
  );
}