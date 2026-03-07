"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type LobbyData = {
  id: string;
  host_id: string;
  type: "public" | "private";
  room_code: string | null;
  status: "waiting" | "in_game" | "finished";
  created_at: string;
};

export default function LobbyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");
  const [lobby, setLobby] = useState<LobbyData | null>(null);

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

      const { data, error } = await supabase
        .from("lobbies")
        .select("id, host_id, type, room_code, status, created_at")
        .eq("id", lobbyId)
        .maybeSingle();

      if (error) {
        setServerError(error.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setServerError("La sala no existe.");
        setLoading(false);
        return;
      }

      setLobby(data);
      setLoading(false);
    };

    loadLobby();
  }, [params.id, router]);

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
          Esta es la vista básica del lobby. Aquí luego mostraremos jugadores,
          host, estado e inicio de partida.
        </p>

        {lobby && (
          <div className="mt-8 space-y-4 rounded-xl bg-gray-50 p-5">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">ID de sala:</span> {lobby.id}
            </p>

            <p className="text-sm text-gray-700">
              <span className="font-semibold">Host ID:</span> {lobby.host_id}
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

            <p className="text-sm text-gray-700">
              <span className="font-semibold">Creada en:</span> {lobby.created_at}
            </p>
          </div>
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
            className="rounded-lg bg-black px-4 py-2 text-white transition hover:opacity-90"
          >
            Iniciar partida
          </button>
        </div>
      </div>
    </main>
  );
}