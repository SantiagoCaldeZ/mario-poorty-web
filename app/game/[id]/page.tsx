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
  profiles: {
    username: string;
    email: string;
  }[];
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
          "id, match_id, user_id, character_name, turn_order, board_position, is_finished, joined_at, profiles(username, email)"
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

      if (isMounted) {
        setMatch(matchData);
        setPlayers((playerData ?? []) as MatchPlayerRow[]);
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

  const currentPlayer = players.find((player) => player.user_id === currentUserId);
  const isHost = currentPlayer?.turn_order === 1;
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
          Esta es una vista temporal mientras se construye el tablero principal.
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
                : currentTurnPlayer?.profiles?.[0]?.username ?? "No definido"}
            </p>

            {match.status === "finished" && (
              <p className="text-sm text-gray-700 sm:col-span-2">
                <span className="font-semibold">Ganador:</span>{" "}
                {winnerPlayer?.profiles?.[0]?.username ?? "Jugador ganador"}
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
                      {player.profiles?.[0]?.username ?? "Sin username"}
                      {isCurrentUser ? " (Tú)" : ""}
                    </p>
                    <p>
                      <span className="font-semibold">Correo:</span>{" "}
                      {player.profiles?.[0]?.email ?? "Sin correo"}
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

        {turnMessage && (
          <p className="mt-6 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
            {turnMessage}
          </p>
        )}

        <div className="mt-8 rounded-xl border border-dashed border-gray-300 p-6">
          <h2 className="text-xl font-semibold text-gray-900">Próximo paso</h2>
          <p className="mt-2 text-sm text-gray-600">
            Aquí es donde después van a colocar el tablero, el turno actual, los
            dados, las fichas y las casillas especiales.
          </p>
        </div>

        <div className="mt-8 flex gap-3">
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

          {isHost && (
            <button
              type="button"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition hover:bg-gray-50"
            >
              Preparar tablero
            </button>
          )}
        </div>
      </div>
    </main>
  );
}