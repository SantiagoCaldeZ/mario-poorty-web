"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function generateRoomCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

export default function CreateLobbyPage() {
  const router = useRouter();
  const [matchType, setMatchType] = useState<"public" | "private">("public");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    const redirectIfAlreadyInLobby = async () => {
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
        setPageLoading(false);
        return;
      }

      if (activeMembership?.lobby_id) {
        router.replace(`/lobby/${activeMembership.lobby_id}`);
        return;
      }

      setPageLoading(false);
    };

    redirectIfAlreadyInLobby();
  }, [router]);

  const handleCreateLobby = async () => {
    setServerError("");
    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setServerError("Debes iniciar sesión para crear una sala.");
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
      setServerError("Ya perteneces a una sala activa. Debes salir de ella primero.");
      setLoading(false);
      return;
    }

    const maxAttempts = matchType === "private" ? 5 : 1;
    let lobbyData: { id: string } | null = null;
    let lobbyError: { message: string; code?: string } | null = null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const roomCode = matchType === "private" ? generateRoomCode() : null;

      const { data, error } = await supabase
        .from("lobbies")
        .insert({
          host_id: userId,
          type: matchType,
          room_code: roomCode,
          status: "waiting",
        })
        .select("id")
        .single();

      if (!error && data) {
        lobbyData = data;
        lobbyError = null;
        break;
      }

      lobbyError = error;

      const isUniqueViolation = error?.code === "23505";

      if (!(matchType === "private" && isUniqueViolation)) {
        break;
      }
    }

    if (lobbyError || !lobbyData) {
      setServerError(
        lobbyError?.code === "23505"
          ? "No se pudo generar un código de sala único. Intenta nuevamente."
          : lobbyError?.message ?? "No se pudo crear la sala."
      );
      setLoading(false);
      return;
    }

    const { error: playerError } = await supabase.from("lobby_players").insert({
      lobby_id: lobbyData.id,
      user_id: userId,
      is_host: true,
    });

    if (playerError) {
      await supabase.from("lobbies").delete().eq("id", lobbyData.id);

      setServerError(
        "No se pudo registrar al host en la sala. Se canceló la creación del lobby."
      );
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push(`/lobby/${lobbyData.id}`);
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
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-md">
        <h1 className="text-3xl font-bold text-gray-900">Crear partida</h1>
        <p className="mt-2 text-gray-600">
          Configura una nueva partida pública o privada.
        </p>

        <div className="mt-8 space-y-6">
          <div className="rounded-xl border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Tipo de partida
            </h2>

            <div className="mt-4 flex gap-4">
              <button
                type="button"
                onClick={() => setMatchType("public")}
                className={`rounded-lg px-4 py-2 border ${
                  matchType === "public"
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-900 border-gray-300"
                }`}
              >
                Pública
              </button>

              <button
                type="button"
                onClick={() => setMatchType("private")}
                className={`rounded-lg px-4 py-2 border ${
                  matchType === "private"
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-900 border-gray-300"
                }`}
              >
                Privada
              </button>
            </div>
          </div>
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

          <button
            type="button"
            onClick={handleCreateLobby}
            disabled={loading}
            className="rounded-lg bg-black px-4 py-2 text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Creando..." : "Crear sala"}
          </button>
        </div>
      </div>
    </main>
  );
}