type MatchData = {
  id: string;
  lobby_id: string;
  status: "active" | "finished" | "abandoned";
  phase: "choosing_order" | "choosing_character" | "active" | "finished" | "abandoned";
  order_target_number: number | null;
  current_turn_user_id: string | null;
  turn_number: number;
  winner_user_id: string | null;
  started_at: string;
  finished_at: string | null;
};

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

type MatchSummaryProps = {
  match: MatchData | null;
  currentTurnPlayer: MatchPlayerRow | undefined;
  winnerPlayer: MatchPlayerRow | undefined;
};

export default function MatchSummary({
  match,
  currentTurnPlayer,
  winnerPlayer,
}: MatchSummaryProps) {
  if (!match) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
      <h2 className="text-xl font-semibold text-gray-900">Resumen de partida</h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">ID de partida:</span> {match.id}
        </p>

        <p className="text-sm text-gray-700">
          <span className="font-semibold">Lobby ID:</span> {match.lobby_id}
        </p>

        <p className="text-sm text-gray-700">
          <span className="font-semibold">Estado:</span> {match.status}
        </p>

        <p className="text-sm text-gray-700">
          <span className="font-semibold">Turno número:</span> {match.turn_number}
        </p>

        {match.order_target_number !== null && (
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Número objetivo del orden:</span>{" "}
            {match.order_target_number}
          </p>
        )}

        <p className="text-sm text-gray-700 sm:col-span-2">
          <span className="font-semibold">Turno actual:</span>{" "}
          {match.status === "finished"
            ? "Partida terminada"
            : currentTurnPlayer?.username ?? "No definido"}
        </p>

        {match.status === "finished" && (
          <p className="text-sm text-gray-700 sm:col-span-2">
            <span className="font-semibold">Ganador:</span>{" "}
            {winnerPlayer?.username ?? "Jugador ganador"}
          </p>
        )}
      </div>
    </div>
  );
}