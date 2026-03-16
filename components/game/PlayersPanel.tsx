"use client";

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
  const orderedPlayers = [...players].sort((a, b) => {
    if (b.board_position !== a.board_position) {
      return b.board_position - a.board_position;
    }
    return a.turn_order - b.turn_order;
  });

  return (
    <section className="overflow-hidden rounded-[30px] border border-[#F1F6E8]/10 bg-[linear-gradient(180deg,rgba(14,18,16,0.98),rgba(8,10,9,0.98))] shadow-[0_22px_60px_rgba(0,0,0,0.34)]">
      <div className="border-b border-[#F1F6E8]/10 bg-[linear-gradient(90deg,rgba(111,214,255,0.10),rgba(134,240,127,0.08),rgba(255,216,107,0.08))] px-6 py-5">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#DDF7FF]">
          Tribu en partida
        </p>
        <h3 className="mt-2 text-3xl font-black text-[#F8FFF0]">
          Jugadores en expedición
        </h3>
      </div>

      <div className="space-y-4 p-6">
        {orderedPlayers.map((player) => {
          const isCurrentUser = player.user_id === currentUserId;
          const isCurrentTurn = player.user_id === currentTurnUserId;

          return (
            <div
              key={player.id}
              className={`rounded-[24px] border px-4 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.14)] ${
                isCurrentTurn
                  ? "border-[#86F07F]/18 bg-[linear-gradient(135deg,rgba(134,240,127,0.12),rgba(14,20,14,0.98))]"
                  : isCurrentUser
                  ? "border-[#6FD6FF]/18 bg-[linear-gradient(135deg,rgba(111,214,255,0.12),rgba(12,18,20,0.98))]"
                  : "border-[#F1F6E8]/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.03),rgba(12,16,13,0.98))]"
              }`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="break-all text-lg font-black leading-tight text-[#F8FFF0]">
                      {player.username ?? "Jugador"}
                      {isCurrentUser ? " (Tú)" : ""}
                    </p>

                    {isCurrentTurn && (
                      <span className="rounded-full border border-[#86F07F]/20 bg-[#86F07F]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#E6FFD9]">
                        Turno actual
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[#F1F6E8]/10 bg-[#111612] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#F0F7E5]">
                      Posición {player.board_position}
                    </span>
                    <span className="rounded-full border border-[#F1F6E8]/10 bg-[#111612] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#DBE8D6]">
                      Orden {player.turn_order}
                    </span>
                    <span className="rounded-full border border-[#FFD86B]/16 bg-[#FFD86B]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#FFF0BA]">
                      {player.character_name ?? "Sin personaje"}
                    </span>
                  </div>
                </div>

                <div className="rounded-[20px] border border-[#F1F6E8]/10 bg-[#0E130F]/82 px-4 py-4 text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#6FD6FF]">
                    Casilla
                  </p>
                  <p className="mt-1 text-3xl font-black text-[#F8FFF0]">
                    {player.board_position}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}