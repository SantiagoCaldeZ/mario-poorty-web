"use client";

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

type SummaryPlayer = {
  username?: string | null;
};

type MatchSummaryProps = {
  match: MatchData | null;
  currentTurnPlayer: SummaryPlayer | null;
  winnerPlayer: SummaryPlayer | null;
};

export default function MatchSummary({
  match,
  currentTurnPlayer,
  winnerPlayer,
}: MatchSummaryProps) {
  return (
    <section className="overflow-hidden rounded-[30px] border border-[#F1F6E8]/10 bg-[linear-gradient(180deg,rgba(14,18,16,0.98),rgba(8,10,9,0.98))] shadow-[0_22px_60px_rgba(0,0,0,0.34)]">
      <div className="border-b border-[#F1F6E8]/10 bg-[linear-gradient(90deg,rgba(255,123,165,0.10),rgba(255,216,107,0.08),rgba(111,214,255,0.07))] px-6 py-5">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#FFD7E6]">
          Estado global
        </p>
        <h3 className="mt-2 text-3xl font-black text-[#F8FFF0]">
          Resumen de partida
        </h3>
      </div>

      <div className="grid gap-4 p-6 sm:grid-cols-2">

        <div className="rounded-[22px] border border-[#F1F6E8]/10 bg-[#101511] px-4 py-4">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#86F07F]">
            Fase
          </p>
          <p className="mt-2 text-lg font-black capitalize text-[#F8FFF0]">
            {match?.phase ?? "-"}
          </p>
        </div>

        <div className="rounded-[22px] border border-[#F1F6E8]/10 bg-[#101511] px-4 py-4">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#FF7BA5]">
            Estado
          </p>
          <p className="mt-2 text-lg font-black capitalize text-[#F8FFF0]">
            {match?.status ?? "-"}
          </p>
        </div>

        <div className="rounded-[22px] border border-[#F1F6E8]/10 bg-[#101511] px-4 py-4">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#6FD6FF]">
            Turno actual
          </p>
          <p className="mt-2 break-all text-lg font-black leading-tight text-[#F8FFF0]">
            {currentTurnPlayer?.username ?? "No definido"}
          </p>
        </div>

        <div className="rounded-[22px] border border-[#F1F6E8]/10 bg-[#101511] px-4 py-4">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#FFD86B]">
            Ganador
          </p>
          <p className="mt-2 break-all text-lg font-black leading-tight text-[#F8FFF0]">
            {winnerPlayer?.username ?? "Aún no"}
          </p>
        </div>

        <div className="rounded-[22px] border border-[#F1F6E8]/10 bg-[#101511] px-4 py-4">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#86F07F]">
            Número objetivo del orden
          </p>
          <p className="mt-2 text-lg font-black text-[#F8FFF0]">
            {match?.order_target_number ?? "-"}
          </p>
        </div>

        <div className="rounded-[22px] border border-[#F1F6E8]/10 bg-[#101511] px-4 py-4">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#FF7BA5]">
            Turno número
          </p>
          <p className="mt-2 text-lg font-black text-[#F8FFF0]">
            {match?.turn_number ?? "-"}
          </p>
        </div>
      </div>
    </section>
  );
}