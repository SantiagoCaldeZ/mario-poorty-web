"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinLobbyPage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");

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
            Más adelante esta pantalla buscará la sala real en Supabase.
          </p>
        </div>

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
            Unirse
          </button>
        </div>
      </div>
    </main>
  );
}