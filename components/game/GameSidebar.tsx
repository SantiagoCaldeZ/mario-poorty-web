"use client";

type SidebarPlayer = {
  id?: string;
  username?: string | null;
  user_id?: string | null;
};

type GameSidebarProps = {
  matchStatus: "active" | "finished" | "abandoned" | null;
  turnNumber: number | null;
  currentTurnPlayer: SidebarPlayer | null;
  winnerPlayer: SidebarPlayer | null;
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
  const statusTone =
    matchStatus === "finished"
      ? "border-[#FFD86B]/18 bg-[linear-gradient(135deg,rgba(255,216,107,0.14),rgba(20,16,8,0.98))]"
      : matchStatus === "active"
      ? "border-[#86F07F]/18 bg-[linear-gradient(135deg,rgba(134,240,127,0.12),rgba(13,18,12,0.98))]"
      : "border-[#FF7BA5]/18 bg-[linear-gradient(135deg,rgba(255,123,165,0.10),rgba(20,10,14,0.98))]";

  const actionTone =
    matchStatus === "finished"
      ? "border-[#FFD86B]/18 bg-[#FFD86B]/10 text-[#FFF0BA]"
      : isMyTurn
      ? "border-[#86F07F]/18 bg-[#86F07F]/10 text-[#E6FFD9]"
      : "border-[#6FD6FF]/18 bg-[#6FD6FF]/10 text-[#DDF7FF]";

  return (
    <section className="overflow-hidden rounded-[32px] border border-[#F1F6E8]/10 bg-[linear-gradient(180deg,rgba(14,18,16,0.98),rgba(8,10,9,0.98))] shadow-[0_22px_60px_rgba(0,0,0,0.34)]">
      <div className="border-b border-[#F1F6E8]/10 bg-[linear-gradient(90deg,rgba(111,214,255,0.10),rgba(255,123,165,0.08),rgba(255,216,107,0.08))] px-6 py-5">
        <p className="text-[11px] font-black uppercase tracking-[0.26em] text-[#DDF7FF]">
          Control del turno
        </p>
        <h3 className="mt-2 text-3xl font-black text-[#F8FFF0]">Panel de juego</h3>
      </div>

      <div className="space-y-5 p-6">
        <div className={`rounded-[24px] border px-4 py-4 ${statusTone}`}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#DDF7FF]">
                Estado
              </p>
              <p className="mt-2 text-2xl font-black capitalize text-[#F8FFF0]">
                {matchStatus ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#FFF0BA]">
                Turno número
              </p>
              <p className="mt-2 text-2xl font-black text-[#F8FFF0]">
                {turnNumber ?? "-"}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-[18px] border border-[#F1F6E8]/10 bg-[#0C120D]/72 px-4 py-4">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#E6FFD9]">
              Turno actual
            </p>
            <p className="mt-2 break-all text-lg font-black leading-tight text-[#F8FFF0]">
              {currentTurnPlayer?.username ?? "No definido"}
            </p>
          </div>

          {winnerPlayer?.username && (
            <div className="mt-4 rounded-[18px] border border-[#FFD86B]/18 bg-[#FFD86B]/10 px-4 py-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#FFF0BA]">
                Ganador
              </p>
              <p className="mt-2 break-all text-lg font-black leading-tight text-[#FFF6D5]">
                {winnerPlayer.username}
              </p>
            </div>
          )}

          {finishedAt && (
            <p className="mt-4 text-sm text-[#DBE8D6]/72">
              Finalizó: {new Date(finishedAt).toLocaleString()}
            </p>
          )}
        </div>

        <div className="rounded-[24px] border border-[#F1F6E8]/10 bg-[linear-gradient(180deg,rgba(10,13,11,0.98),rgba(7,9,8,0.98))] p-5">
          <div className="flex items-center gap-2">
            <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${actionTone}`}>
              {matchStatus === "finished"
                ? "Partida cerrada"
                : isMyTurn
                ? "Tu turno"
                : "Esperando"}
            </span>
          </div>

          <p className="mt-4 text-sm leading-6 text-[#DBE8D6]/78">
            {matchStatus === "finished"
              ? "La partida ya terminó. Puedes revisar el resultado final o volver al inicio."
              : isMyTurn
              ? "Lanza el dado para avanzar por el tablero. Tu resultado se actualizará en tiempo real."
              : "Espera a que el turno llegue a ti. El tablero y los estados seguirán actualizándose automáticamente."}
          </p>

          {turnMessage && (
            <div className="mt-4 rounded-[20px] border border-[#6FD6FF]/18 bg-[linear-gradient(135deg,rgba(111,214,255,0.12),rgba(12,20,24,0.96))] px-4 py-4 text-sm leading-6 text-[#DDF7FF]">
              {turnMessage}
            </div>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onGoHome}
              className="rounded-[22px] border border-[#F1F6E8]/10 bg-[#121714] px-5 py-4 text-sm font-black uppercase tracking-[0.12em] text-[#F8FFF0] transition hover:bg-[#18201A]"
            >
              Volver al inicio
            </button>

            <button
              type="button"
              onClick={onPlayTurn}
              disabled={!isMyTurn || matchStatus !== "active"}
              className="rounded-[22px] bg-[linear-gradient(135deg,#FFD86B_0%,#86F07F_42%,#6FD6FF_100%)] px-5 py-4 text-sm font-black uppercase tracking-[0.12em] text-[#08110A] shadow-[0_14px_28px_rgba(111,214,255,0.16)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Lanzar dado
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}