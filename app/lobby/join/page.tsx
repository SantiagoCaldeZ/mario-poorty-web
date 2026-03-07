"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function JoinLobbyPage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleJoinLobby = async () => {
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

    const { data, error } = await supabase
      .from("lobbies")
      .select("id, room_code, type, status")
      .eq("room_code", normalizedCode)
      .maybeSingle();

    if (error) {
      setServerError(error.message);
      setLoading(false);
      return;
    }

    if (!data) {
      setServerError("No existe una sala con ese código.");
      setLoading(false);
      return;
    }

    if (data.status !== "waiting") {
      setServerError("La sala ya no está disponible para unirse.");
      setLoading(false);
      return;
    }

    router.push(`/lobby/${data.id}`);
  };

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-md">
        <h1 className="text-3xl font-bold text-gray-900">Unirse a partida</h1>
        <p className="mt-2 text-gray-600">
          Ingresa el código de una sala privada para unirte.
        </p>

        <div className="mt-8">
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
          <p className="mt-2 text-sm text-gray-500">
            Debe coincidir con el código de una sala privada existente.
          </p>
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
            onClick={handleJoinLobby}
            disabled={loading}
            className="rounded-lg bg-black px-4 py-2 text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Buscando..." : "Unirse"}
          </button>
        </div>
      </div>
    </main>
  );
}