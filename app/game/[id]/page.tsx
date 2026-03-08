"use client";

import { useParams } from "next/navigation";

export default function GamePage() {
  const params = useParams();

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-md">
        <h1 className="text-3xl font-bold text-gray-900">Partida iniciada</h1>
        <p className="mt-3 text-gray-600">
          La partida del lobby <span className="font-semibold">{params.id}</span> ha comenzado.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Esta es una pantalla temporal mientras construyen el tablero.
        </p>
      </div>
    </main>
  );
}