"use client";

import { useState } from "react";
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
  const [serverError, setServerError] = useState("");
  const [serverSuccess, setServerSuccess] = useState("");

  const handleCreateLobby = async () => {
    setServerError("");
    setServerSuccess("");
    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setServerError("Debes iniciar sesión para crear una sala.");
      setLoading(false);
      return;
    }

    const hostId = session.user.id;
    const roomCode = matchType === "private" ? generateRoomCode() : null;

    const { data, error } = await supabase
      .from("lobbies")
      .insert({
        host_id: hostId,
        type: matchType,
        room_code: roomCode,
        status: "waiting",
      })
      .select()
      .single();

    if (error) {
      setServerError(error.message);
      setLoading(false);
      return;
    }

    setServerSuccess(
      matchType === "private"
        ? `Sala privada creada. Código: ${data.room_code}`
        : "Sala pública creada correctamente."
    );

    setLoading(false);
  };

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

        {serverSuccess && (
          <p className="mt-6 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            {serverSuccess}
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