"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type LobbyData = {
  id: string;
  host_id: string;
  type: "public" | "private";
  room_code: string | null;
  status: "waiting" | "in_game" | "finished" | "closed";
  created_at: string;
};

type LobbyPlayerRow = {
  id: string;
  user_id: string;
  is_host: boolean;
  joined_at: string;
  profiles: {
    username: string;
    email: string;
  } | null;
};

export default function LobbyDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [lobby, setLobby] = useState<LobbyData | null>(null);
  const [players, setPlayers] = useState<LobbyPlayerRow[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadLobby = async () => {
      setServerError("");
      setLoading(true);

      const lobbyId = params.id;

      if (!lobbyId || typeof lobbyId !== "string") {
        setServerError("ID de sala inválido.");
        setLoading(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/login");
        return;
      }

      const userId = session.user.id;
      setCurrentUserId(userId);

      // Verificar que el usuario pertenezca a esta sala
      const { data: membership, error: membershipError } = await supabase
        .from("lobby_players")
        .select("id, is_host")
        .eq("lobby_id", lobbyId)
        .eq("user_id", userId)
        .maybeSingle();

      if (membershipError) {
        setServerError("No se pudo validar tu acceso a esta sala.");
        setLoading(false);
        return;
      }

      if (!membership) {
        setServerError("No perteneces a esta sala.");
        setLoading(false);
        return;
      }

      const { data: lobbyData, error: lobbyError } = await supabase
        .from("lobbies")
        .select("id, host_id, type, room_code, status, created_at")
        .eq("id", lobbyId)
        .maybeSingle();

      if (lobbyError) {
        setServerError(lobbyError.message);
        setLoading(false);
        return;
      }

      if (!lobbyData) {
        setServerError("La sala no existe.");
        setLoading(false);
        return;
      }

      const { data: playerData, error: playerError } = await supabase
        .from("lobby_players")
        .select("id, user_id, is_host, joined_at, profiles(username, email)")
        .eq("lobby_id", lobbyId)
        .order("joined_at", { ascending: true });

      if (playerError) {
        setServerError(playerError.message);
        setLoading(false);
        return;
      }

      setLobby(lobbyData);
      setPlayers((playerData ?? []) as LobbyPlayerRow[]);
      setLoading(false);
    };

    loadLobby();
  }, [params.id, router]);

  const currentPlayer = players.find((player) => player.user_id === currentUserId);
  const isHost = currentPlayer?.is_host ?? false;

  const handleLeaveLobby = async () => {
    if (!currentUserId || !lobby) return;

    setServerError("");
    setActionLoading(true);

    const { error } = await supabase
      .from("lobby_players")
      .delete()
      .eq("lobby_id", lobby.id)
      .eq("user_id", currentUserId);

    if (error) {
      setServerError(error.message);
      setActionLoading(false);
      return;
    }

    router.push("/home");
  };

  const handleCloseLobby = async () => {
    if (!lobby) return;

    setServerError("");
    setActionLoading(true);

    const { error: lobbyError } = await supabase
        .from("lobbies")
        .update({ status: "closed" })
        .eq("id", lobby.id);

    if (lobbyError) {
        setServerError(lobbyError.message);
        setActionLoading(false);
        return;
    }

    const { error: playersError } = await supabase
        .from("lobby_players")
        .delete()
        .eq("lobby_id", lobby.id);

    if (playersError) {
        setServerError(playersError.message);
        setActionLoading(false);
        return;
    }

    router.push("/home");
    };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <p className="text-gray-700">Cargando sala...</p>
      </main>
    );
  }

  if (serverError) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-md">
          <h1 className="text-2xl font-bold text-gray-900">Lobby</h1>
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
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-md">
        <h1 className="text-3xl font-bold text-gray-900">Sala de espera</h1>
        <p className="mt-2 text-gray-600">
          Aquí puedes ver la información del lobby y las personas dentro.
        </p>

        {lobby && (
          <div className="mt-8 space-y-4 rounded-xl bg-gray-50 p-5">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">ID de sala:</span> {lobby.id}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Tipo:</span> {lobby.type}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Código:</span>{" "}
              {lobby.room_code ?? "No aplica"}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Estado:</span> {lobby.status}
            </p>
          </div>
        )}

        <div className="mt-8 rounded-xl border border-gray-200 p-5">
          <h2 className="text-xl font-semibold text-gray-900">Jugadores en sala</h2>

          {players.length === 0 ? (
            <p className="mt-3 text-sm text-gray-600">
              Todavía no hay jugadores registrados en esta sala.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700"
                >
                  <p>
                    <span className="font-semibold">Usuario:</span>{" "}
                    {player.profiles?.username ?? "Sin username"}
                  </p>
                  <p>
                    <span className="font-semibold">Correo:</span>{" "}
                    {player.profiles?.email ?? "Sin email"}
                  </p>
                  <p>
                    <span className="font-semibold">Rol:</span>{" "}
                    {player.is_host ? "Host" : "Jugador"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => router.push("/home")}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition hover:bg-gray-50"
          >
            Volver
          </button>

          <button
            type="button"
            className="rounded-lg bg-black px-4 py-2 text-white transition hover:opacity-90"
          >
            Iniciar partida
          </button>

          {isHost ? (
            <button
              type="button"
              onClick={handleCloseLobby}
              disabled={actionLoading}
              className="rounded-lg border border-red-300 bg-white px-4 py-2 text-red-700 transition hover:bg-red-50 disabled:opacity-60"
            >
              {actionLoading ? "Cerrando..." : "Cerrar partida"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLeaveLobby}
              disabled={actionLoading}
              className="rounded-lg border border-red-300 bg-white px-4 py-2 text-red-700 transition hover:bg-red-50 disabled:opacity-60"
            >
              {actionLoading ? "Saliendo..." : "Salir del lobby"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}