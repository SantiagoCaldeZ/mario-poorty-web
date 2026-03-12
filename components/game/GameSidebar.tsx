type MatchPlayerRow = {
  id: string;
  match_id: string;
  user_id: string;
  character_name: string | null;
  turn_order: number;
  board_position: number;
  is_finished: boolean;
  joined_at: string;
  username: string | null;
  email: string | null;
};

type GameSidebarProps = {
  matchStatus: "active" | "finished" | "abandoned" | null;
  turnNumber: number | null;
  currentTurnPlayer: MatchPlayerRow | undefined;
  winnerPlayer: MatchPlayerRow | undefined;
  turnMessage: string;
  isMyTurn: boolean;
  onPlayTurn: () => void;
  onGoHome: () => void;
  finishedAt: string | null;
};

export default function GameSidebar({
  matchStatus,
  turnNumber,
  currentTurnPlayer,
  winnerPlayer,
  turnMessage,
  isMyTurn,
  onPlayTurn,
  onGoHome,
  finishedAt,
}: GameSidebarProps) {
  return (
    <aside className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Panel de juego</h2>

        <div className="mt-4 space-y-2 text-sm text-gray-700">
          <p>
            <span className="font-semibold">Estado:</span>{" "}
            {matchStatus ?? "No definido"}
          </p>

          <p>
            <span className="font-semibold">Turno número:</span>{" "}
            {turnNumber ?? "-"}
          </p>

          <p>
            <span className="font-semibold">Turno actual:</span>{" "}
            {matchStatus === "finished"
              ? "Partida terminada"
              : currentTurnPlayer?.username ?? "No definido"}
          </p>
        </div>
      </div>

      {matchStatus === "finished" && (
        <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-5">
          <h2 className="text-xl font-bold text-yellow-900">Partida finalizada</h2>
          <p className="mt-2 text-sm text-yellow-800">
            Ganador:{" "}
            <span className="font-semibold">
              {winnerPlayer?.username ?? "Jugador ganador"}
            </span>
          </p>

          {finishedAt && (
            <p className="mt-1 text-xs text-yellow-700">
              Finalizó en: {new Date(finishedAt).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {turnMessage && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-700">{turnMessage}</p>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onGoHome}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition hover:bg-gray-50"
          >
            Volver al inicio
          </button>

          {matchStatus === "active" && isMyTurn && (
            <button
              type="button"
              onClick={onPlayTurn}
              className="rounded-lg bg-black px-4 py-2 text-white transition hover:opacity-90"
            >
              Lanzar dado
            </button>
          )}
        </div>

        {matchStatus === "active" && !isMyTurn && (
          <p className="mt-3 text-sm text-gray-600">
            Esperando el turno de{" "}
            <span className="font-medium">
              {currentTurnPlayer?.username ?? "otro jugador"}
            </span>
            .
          </p>
        )}
      </div>
    </aside>
  );
}