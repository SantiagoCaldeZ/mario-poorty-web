"use client";

import Image from "next/image";
import { CHARACTER_OPTIONS } from "@/lib/characters";

type MatchPlayerRow = {
  id: string;
  match_id: string;
  user_id: string;
  character_name: string | null;
  turn_order: number;
  board_position: number;
  is_finished: boolean;
  joined_at: string;
  selected_order_number: number | null;
  order_number_submitted_at: string | null;
  username: string | null;
  email: string | null;
};

type CharacterSelectionScreenProps = {
  players: MatchPlayerRow[];
  currentUserId: string | null;
  currentCharacterTurnOrder: number | null;
  orderTargetNumber: number | null;
  selectingCharacter: string | null;
  onSelectCharacter: (characterName: string) => void;
  onGoHome: () => void;
  selectionSubmitting: boolean;
  serverError: string;
};

export default function CharacterSelectionScreen({
  players,
  currentUserId,
  currentCharacterTurnOrder,
  orderTargetNumber,
  selectingCharacter,
  onSelectCharacter,
  onGoHome,
  selectionSubmitting,
  serverError,
}: CharacterSelectionScreenProps) {

  const currentPicker = players.find(
    (player) => player.turn_order === currentCharacterTurnOrder
  );

  const myPlayer = players.find((player) => player.user_id === currentUserId);
  const isMyTurnToPick =
    myPlayer?.turn_order === currentCharacterTurnOrder &&
    myPlayer?.character_name === null;

  const takenCharacters = new Set(
    players
      .map((player) => player.character_name)
      .filter((character): character is string => character !== null)
  );

  const playHoverSound = () => {
    if (!isMyTurnToPick) return;

    const audio = new Audio("/sounds/seleccion.wav");
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-6xl rounded-2xl bg-white p-8 shadow-md">
        <h1 className="text-3xl font-bold text-gray-900">Selección de personajes</h1>
        <p className="mt-2 text-gray-600">
          Los personajes se escogen según el orden definido anteriormente. Cada
          jugador selecciona cuando le corresponde su turno.
        </p>

        {serverError && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {serverError}
          </p>
        )}

        <div className="mt-6 grid gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 sm:grid-cols-2">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Número objetivo del orden:</span>{" "}
            {orderTargetNumber ?? "No definido"}
          </p>

          <p className="text-sm text-gray-700">
            <span className="font-semibold">Turno de selección:</span>{" "}
            {currentCharacterTurnOrder ?? "No definido"}
          </p>

          <p className="text-sm text-gray-700 sm:col-span-2">
            <span className="font-semibold">Jugador que selecciona ahora:</span>{" "}
            {currentPicker?.username ?? "No definido"}
            {currentPicker?.user_id === currentUserId ? " (Tú)" : ""}
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 p-5">
          <h2 className="text-xl font-semibold text-gray-900">Estado actual</h2>

          {isMyTurnToPick ? (
            <p className="mt-3 text-sm font-medium text-green-700">
              Es tu turno de escoger personaje.
            </p>
          ) : (
            <p className="mt-3 text-sm text-gray-600">
              Esperando a que{" "}
              <span className="font-medium">
                {currentPicker?.username ?? "otro jugador"}
              </span>{" "}
              escoja personaje.
            </p>
          )}
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 p-5">
          <h2 className="text-xl font-semibold text-gray-900">Personajes disponibles</h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {CHARACTER_OPTIONS.map((character) => {
              const isTaken = takenCharacters.has(character.name);
              const isSelectingThisCharacter = selectingCharacter === character.name;

              return (
                <button
                  key={character.name}
                  type="button"
                  onMouseEnter={playHoverSound}
                  onClick={() => onSelectCharacter(character.name)}
                  disabled={!isMyTurnToPick || isTaken || selectionSubmitting}
                  className={`rounded-xl border p-4 text-left transition ${
                    isTaken
                      ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                      : isMyTurnToPick
                      ? "border-gray-300 bg-white text-gray-900 hover:border-black hover:shadow-md"
                      : "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-500"
                  } ${isSelectingThisCharacter ? "opacity-60" : ""}`}
                >
                  <div className="flex flex-col items-center text-center">
                    <Image
                      src={character.image}
                      alt={character.name}
                      width={110}
                      height={110}
                      className="h-28 w-28 object-contain"
                    />

                    <p className="mt-3 font-semibold">{character.name}</p>
                    <p className="mt-1 text-xs">
                      {isTaken
                        ? "Ya fue escogido"
                        : isMyTurnToPick
                        ? "Disponible para escoger"
                        : "Esperando turno"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 p-5">
          <h2 className="text-xl font-semibold text-gray-900">Jugadores</h2>

          <div className="mt-4 space-y-3">
            {players.map((player) => (
              <div
                key={player.id}
                className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700"
              >
                <p>
                  <span className="font-semibold">Jugador:</span>{" "}
                  {player.username ?? "Sin username"}
                  {player.user_id === currentUserId ? " (Tú)" : ""}
                </p>
                <p>
                  <span className="font-semibold">Orden:</span> {player.turn_order}
                </p>
                <p>
                  <span className="font-semibold">Personaje:</span>{" "}
                  {player.character_name ?? "Aún no seleccionado"}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onGoHome}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition hover:bg-gray-50"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </main>
  );
}