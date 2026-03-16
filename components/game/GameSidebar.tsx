"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type SidebarPlayer = {
  id?: string;
  username?: string | null;
  user_id?: string | null;
};

type PlayTurnResult = {
  rolled_value: number;
  updated_position: number;
  next_turn_user_id: string | null;
  updated_turn_number: number;
  match_finished: boolean;
};

type GameSidebarProps = {
  matchStatus: "active" | "finished" | "abandoned" | null;
  turnNumber: number | null;
  currentTurnPlayer: SidebarPlayer | null;
  winnerPlayer: SidebarPlayer | null;
  turnMessage: string;
  isMyTurn: boolean;
  onPlayTurn: () => Promise<PlayTurnResult | null>;
  onRollResolved: (result: PlayTurnResult) => Promise<void> | void;
  onGoHome: () => void;
  finishedAt: string | null;
};

const DICE_ANIMATION_STEPS = 13;
const DICE_ANIMATION_DELAY_MS = 200;
const DICE_PRE_BLINK_WAIT_MS = 700;
const DICE_BLINK_REPEATS = 6;
const DICE_BLINK_DELAY_MS = 100;
const DICE_POST_BLINK_WAIT_MS = 400;

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export default function GameSidebar({
  matchStatus,
  turnNumber,
  currentTurnPlayer,
  winnerPlayer,
  turnMessage,
  isMyTurn,
  onPlayTurn,
  onRollResolved,
  onGoHome,
  finishedAt,
}: GameSidebarProps) {
  const [displayedDieValue, setDisplayedDieValue] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [isDieVisible, setIsDieVisible] = useState(true);
  const [localStatusText, setLocalStatusText] = useState("Esperando lanzamiento");

  const diceAudioRef = useRef<HTMLAudioElement | null>(null);
  const unmountedRef = useRef(false);

  useEffect(() => {
    unmountedRef.current = false;

    return () => {
      unmountedRef.current = true;

      if (diceAudioRef.current) {
        diceAudioRef.current.pause();
        diceAudioRef.current.currentTime = 0;
      }
    };
  }, []);

  const playDiceSound = () => {
    if (!diceAudioRef.current) {
      diceAudioRef.current = new Audio("/dados/SonidoDados.wav");
      diceAudioRef.current.volume = 0.80;
      diceAudioRef.current.loop = true;
    }

    diceAudioRef.current.currentTime = 0;
    diceAudioRef.current.play().catch(() => {});
  };

  const stopDiceSound = () => {
    if (!diceAudioRef.current) return;
    diceAudioRef.current.pause();
    diceAudioRef.current.currentTime = 0;
  };

  const handleRollClick = async () => {
    if (!isMyTurn || matchStatus !== "active" || isRolling) return;

    setIsRolling(true);
    setIsDieVisible(true);
    setLocalStatusText("Lanzando dado...");

    playDiceSound();

    const turnResult = await onPlayTurn();

    if (!turnResult) {
      stopDiceSound();
      setIsRolling(false);
      setLocalStatusText("No se pudo completar el lanzamiento");
      return;
    }
    
    for (let i = 0; i < DICE_ANIMATION_STEPS; i++) {
      if (unmountedRef.current) return;

      const valueForThisStep =
        i === DICE_ANIMATION_STEPS - 1
          ? turnResult.rolled_value
          : Math.floor(Math.random() * 6) + 1;

      setDisplayedDieValue(valueForThisStep);
      await sleep(DICE_ANIMATION_DELAY_MS);
    }

    setLocalStatusText(`Resultado final: ${turnResult.rolled_value}`);

    // Pausa exacta antes del parpadeo
    await sleep(DICE_PRE_BLINK_WAIT_MS);

    // Parpadeo final exacto
    for (let i = 0; i < DICE_BLINK_REPEATS; i++) {
      if (unmountedRef.current) return;

      setIsDieVisible(false);
      await sleep(DICE_BLINK_DELAY_MS);

      setIsDieVisible(true);
      await sleep(DICE_BLINK_DELAY_MS);
    }

    // En el original todavía queda un pequeño margen antes de resolver
    await sleep(DICE_POST_BLINK_WAIT_MS);

    stopDiceSound();
    await onRollResolved(turnResult);

    if (unmountedRef.current) return;

    setIsRolling(false);
    setLocalStatusText("Lanzamiento resuelto");
  };

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
      </div>
    </section>
  );
}