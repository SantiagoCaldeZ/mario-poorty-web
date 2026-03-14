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
};

type PlayersPanelProps = {
  players: MatchPlayerRow[];
  currentUserId: string | null;
  currentTurnUserId: string | null;
};

export default function PlayersPanel({
  players,
  currentUserId,
  currentTurnUserId,
}: PlayersPanelProps) {
  return (
    <div className="rounded-xl border border-gray-200 p-5">
      <h2 className="text-xl font-semibold text-gray-900">Jugadores en partida</h2>

      {players.length === 0 ? (
        <p className="mt-3 text-sm text-gray-600">
          No hay jugadores cargados en esta partida.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {players.map((player) => {
            const isCurrentUser = player.user_id === currentUserId;
            const isCurrentTurn = player.user_id === currentTurnUserId;

            return (
              <div
                key={player.id}
                className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700"
              >
                <p>
                  <span className="font-semibold">Usuario:</span>{" "}
                  {player.username ?? "Sin username"}
                  {isCurrentUser ? " (Tú)" : ""}
                </p>
                <p>
                  <span className="font-semibold">Orden de turno:</span>{" "}
                  {player.turn_order}
                </p>
                <p>
                  <span className="font-semibold">Posición en tablero:</span>{" "}
                  {player.board_position}
                </p>
                <p>
                  <span className="font-semibold">Personaje:</span>{" "}
                  {player.character_name ?? "Sin asignar"}
                </p>
                <p>
                  <span className="font-semibold">Estado:</span>{" "}
                  {player.is_finished ? "Terminó" : "En juego"}
                </p>
                <p>
                  <span className="font-semibold">Rol:</span>{" "}
                  {player.turn_order === 1 ? "Host / Primer turno" : "Jugador"}
                </p>

                {isCurrentTurn && (
                  <p className="mt-2 font-semibold text-green-700">
                    Es el turno de este jugador.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}