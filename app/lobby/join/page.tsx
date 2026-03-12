"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

type PublicLobbyRow = {
  id: string;
  room_code: string | null;
  status: "waiting" | "in_game" | "finished" | "closed";
  created_at: string;
  host_id: string;
  host_username: string | null;
  host_email: string | null;
  lobby_players: { id: string }[];
};

export default function JoinLobbyPage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [publicLobbies, setPublicLobbies] = useState<PublicLobbyRow[]>([]);
  const [serverError, setServerError] = useState("");

  const loadPublicLobbies = async () => {
    const { data: lobbyData, error: lobbyError } = await supabase
      .from("lobbies")
      .select("id, room_code, status, created_at, host_id, lobby_players(id)")
      .eq("type", "public")
      .eq("status", "waiting")
      .order("created_at", { ascending: false });

    if (lobbyError) {
      setServerError("No se pudieron cargar las partidas públicas.");
      return;
    }

    const hostIds = (lobbyData ?? []).map((lobby) => lobby.host_id);

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, username, email")
      .in("id", hostIds);

    if (profileError) {
      setServerError("No se pudieron cargar los perfiles de los hosts.");
      return;
    }

    const profilesMap = new Map(
      (profileData ?? []).map((profile) => [profile.id, profile])
    );

    const mergedLobbies: PublicLobbyRow[] = (lobbyData ?? []).map((lobby) => {
      const hostProfile = profilesMap.get(lobby.host_id);

      return {
        id: lobby.id,
        room_code: lobby.room_code,
        status: lobby.status,
        created_at: lobby.created_at,
        host_id: lobby.host_id,
        host_username: hostProfile?.username ?? null,
        host_email: hostProfile?.email ?? null,
        lobby_players: lobby.lobby_players ?? [],
      };
    });

    setPublicLobbies(mergedLobbies);
  };

  useEffect(() => {
    const initializePage = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/login");
        return;
      }

      const userId = session.user.id;

      const { data: activeMembership, error: membershipError } = await supabase
        .from("lobby_players")
        .select("lobby_id, lobbies!inner(status)")
        .eq("user_id", userId)
        .in("lobbies.status", ["waiting", "in_game"])
        .maybeSingle();

      if (membershipError) {
        setServerError("No se pudo validar tu estado actual de lobby.");
        setPageLoading(false);
        return;
      }

      if (activeMembership?.lobby_id) {
        router.replace(`/lobby/${activeMembership.lobby_id}`);
        return;
      }

      await loadPublicLobbies();
      setPageLoading(false);
    };

    initializePage();

    const channel = supabase
      .channel("public-lobbies-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lobbies",
        },
        async () => {
          await loadPublicLobbies();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lobby_players",
        },
        async () => {
          await loadPublicLobbies();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  const handleJoinLobbyByCode = async () => {
    setServerError("");
    setLoading(true);

    const normalizedCode = roomCode.trim().toUpperCase();

    if (!normalizedCode) {
      setServerError("Debes ingresar un código de sala.");
      setLoading(false);
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setServerError("Debes iniciar sesión para unirte a una sala.");
      setLoading(false);
      return;
    }

    const userId = session.user.id;

    const { data: existingMembership, error: membershipError } = await supabase
      .from("lobby_players")
      .select("id, lobby_id, lobbies!inner(status)")
      .eq("user_id", userId)
      .in("lobbies.status", ["waiting", "in_game"])
      .maybeSingle();

    if (membershipError) {
      setServerError("No se pudo validar si ya perteneces a una sala.");
      setLoading(false);
      return;
    }

    if (existingMembership) {
      setServerError(
        "Ya perteneces a una sala activa. Debes salir de ella primero."
      );
      setLoading(false);
      return;
    }

    const { data: lobbyData, error: lobbyError } = await supabase
      .from("lobbies")
      .select("id, room_code, type, status")
      .eq("room_code", normalizedCode)
      .eq("type", "private")
      .maybeSingle();

    if (lobbyError) {
      setServerError(lobbyError.message);
      setLoading(false);
      return;
    }

    if (!lobbyData) {
      setServerError("No existe una sala privada con ese código.");
      setLoading(false);
      return;
    }

    if (lobbyData.status !== "waiting") {
      setServerError("La sala privada ya no está disponible para unirse.");
      setLoading(false);
      await loadPublicLobbies();
      return;
    }

    const { data: joinedLobbyId, error: joinError } = await supabase.rpc(
      "join_lobby_safely",
      { target_lobby_id: lobbyData.id }
    );

    if (joinError) {
      setServerError(joinError.message);
      setLoading(false);
      return;
    }

    router.push(`/lobby/${joinedLobbyId}`);
  };

  const handleJoinPublicLobby = async (lobbyId: string) => {
    setServerError("");
    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setServerError("Debes iniciar sesión para unirte a una sala.");
      setLoading(false);
      return;
    }

    const userId = session.user.id;

    const { data: existingMembership, error: membershipError } = await supabase
      .from("lobby_players")
      .select("id, lobby_id, lobbies!inner(status)")
      .eq("user_id", userId)
      .in("lobbies.status", ["waiting", "in_game"])
      .maybeSingle();

    if (membershipError) {
      setServerError("No se pudo validar si ya perteneces a una sala.");
      setLoading(false);
      return;
    }

    if (existingMembership) {
      setServerError(
        "Ya perteneces a una sala activa. Debes salir de ella primero."
      );
      setLoading(false);
      return;
    }

    const { data: lobbyData, error: lobbyError } = await supabase
      .from("lobbies")
      .select("id, type, status")
      .eq("id", lobbyId)
      .maybeSingle();

    if (lobbyError) {
      setServerError(lobbyError.message);
      setLoading(false);
      return;
    }

    if (!lobbyData) {
      setServerError("La sala seleccionada ya no existe.");
      setLoading(false);
      await loadPublicLobbies();
      return;
    }

    if (lobbyData.type !== "public") {
      setServerError("Solo puedes unirte aquí a partidas públicas.");
      setLoading(false);
      return;
    }

    if (lobbyData.status !== "waiting") {
      setServerError("La sala ya no está disponible para unirse.");
      setLoading(false);
      await loadPublicLobbies();
      return;
    }

    const { data: joinedLobbyId, error: joinError } = await supabase.rpc(
      "join_lobby_safely",
      { target_lobby_id: lobbyData.id }
    );

    if (joinError) {
      setServerError(joinError.message);
      setLoading(false);
      return;
    }

    router.push(`/lobby/${joinedLobbyId}`);
  };

  if (pageLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <p className="text-gray-700">Cargando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-md">
        <h1 className="text-3xl font-bold text-gray-900">Unirse a partida</h1>
        <p className="mt-2 text-gray-600">
          Puedes ingresar un código privado o unirte a una partida pública disponible.
        </p>

        <div className="mt-8 rounded-xl border border-gray-200 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Unirse con código
          </h2>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Código de sala
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-black"
            />
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={handleJoinLobbyByCode}
              disabled={loading}
              className="rounded-lg bg-black px-4 py-2 text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Uniéndose..." : "Unirse por código"}
            </button>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-gray-200 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Partidas públicas disponibles
          </h2>

          {publicLobbies.length === 0 ? (
            <p className="mt-4 text-sm text-gray-600">
              No hay partidas públicas disponibles en este momento.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {publicLobbies.map((lobby) => (
                <div
                  key={lobby.id}
                  className="flex flex-col gap-3 rounded-lg bg-gray-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="text-sm text-gray-700">
                    <p>
                      <span className="font-semibold">ID:</span> {lobby.id}
                    </p>
                    <p>
                      <span className="font-semibold">Host:</span>{" "}
                      {lobby.host_username ?? "Sin username"}
                    </p>
                    <p>
                      <span className="font-semibold">Estado:</span> {lobby.status}
                    </p>
                    <p>
                      <span className="font-semibold">Creada en:</span>{" "}
                      {new Date(lobby.created_at).toLocaleString()}
                    </p>
                    <p>
                      <span className="font-semibold">Jugadores:</span>{" "}
                      {lobby.lobby_players?.length ?? 0}/6
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleJoinPublicLobby(lobby.id)}
                    disabled={loading}
                    className="rounded-lg bg-black px-4 py-2 text-white transition hover:opacity-90 disabled:opacity-60"
                  >
                    Unirse
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {serverError && (
          <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {serverError}
          </p>
        )}

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/home")}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition hover:bg-gray-50"
          >
            Volver
          </button>
        </div>
      </div>
    </main>
  );
}