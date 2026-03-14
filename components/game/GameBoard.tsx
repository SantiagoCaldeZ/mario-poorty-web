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

type GameBoardProps = {
  players: MatchPlayerRow[];
  currentUserId: string | null;
  currentTurnUserId: string | null;
  winnerUserId: string | null;
  matchStatus: "active" | "finished" | "abandoned" | null;
};

const TOTAL_CELLS = 30;

function clampBoardPosition(position: number) {
  if (position < 0) return 0;
  if (position > TOTAL_CELLS) return TOTAL_CELLS;
  return position;
}

function getPlayersByCell(players: MatchPlayerRow[]) {
  const grouped = new Map<number, MatchPlayerRow[]>();

  for (const player of players) {
    const position = clampBoardPosition(player.board_position);

    if (!grouped.has(position)) {
      grouped.set(position, []);
    }

    grouped.get(position)!.push(player);
  }

  return grouped;
}

export default function GameBoard({
  players,
  currentUserId,
  currentTurnUserId,
  winnerUserId,
  matchStatus,
}: GameBoardProps) {
  const playersByCell = getPlayersByCell(players);
  const boardCells = Array.from({ length: TOTAL_CELLS + 1 }, (_, index) => index);

  return (
    <div className="rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Tablero</h2>
          <p className="mt-1 text-sm text-gray-600">
            Vista mínima del recorrido actual de la partida.
          </p>
        </div>

        <div className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700">
          Meta: casilla {TOTAL_CELLS}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {boardCells.map((cellNumber) => {
          const cellPlayers = playersByCell.get(cellNumber) ?? [];
          const hasCurrentTurnPlayer = cellPlayers.some(
            (player) => player.user_id === currentTurnUserId
          );
          const hasWinner = cellPlayers.some(
            (player) => player.user_id === winnerUserId
          );

          return (
            <div
              key={cellNumber}
              className={`rounded-xl border p-3 shadow-sm transition ${
                cellNumber === TOTAL_CELLS
                  ? "border-yellow-300 bg-yellow-50"
                  : "border-gray-200 bg-gray-50"
              } ${hasCurrentTurnPlayer && matchStatus === "active" ? "ring-2 ring-green-500" : ""}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-gray-900">
                  Casilla {cellNumber}
                </span>

                {cellNumber === 0 && (
                  <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-700">
                    Inicio
                  </span>
                )}

                {cellNumber === TOTAL_CELLS && (
                  <span className="rounded-full bg-yellow-200 px-2 py-0.5 text-[11px] font-medium text-yellow-800">
                    Meta
                  </span>
                )}
              </div>

              <div className="mt-3 min-h-[72px]">
                {cellPlayers.length === 0 ? (
                  <p className="text-xs text-gray-400">Sin jugadores</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {cellPlayers.map((player) => {
                      const isCurrentUser = player.user_id === currentUserId;
                      const isCurrentTurn = player.user_id === currentTurnUserId;
                      const isWinner = player.user_id === winnerUserId;

                      return (
                        <div
                          key={player.id}
                          className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium ${
                            isWinner
                              ? "border-yellow-300 bg-yellow-200 text-yellow-900"
                              : isCurrentTurn && matchStatus === "active"
                              ? "border-green-200 bg-green-100 text-green-800"
                              : isCurrentUser
                              ? "border-blue-200 bg-blue-100 text-blue-800"
                              : "border-gray-200 bg-white text-gray-700"
                          }`}
                        >
                          <p className="font-semibold">
                            {player.username ?? "Jugador"}
                            {isCurrentUser ? " (Tú)" : ""}
                          </p>
                          <p className="text-[11px] opacity-80">
                            Orden {player.turn_order}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {hasWinner && (
                <p className="mt-2 text-xs font-semibold text-yellow-700">
                  Jugador ganador en esta casilla.
                </p>
              )}

              {hasCurrentTurnPlayer && matchStatus === "active" && (
                <p className="mt-2 text-xs font-semibold text-green-700">
                  Turno actual aquí.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}