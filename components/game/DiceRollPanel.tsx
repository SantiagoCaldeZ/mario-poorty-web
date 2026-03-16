"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type PlayTurnResult = {
  rolled_value: number;
  updated_position: number;
  next_turn_user_id: string | null;
  updated_turn_number: number;
  match_finished: boolean;
};

type DiceRollPanelProps = {
  matchStatus: "active" | "finished" | "abandoned" | null;
  isMyTurn: boolean;
  turnMessage: string;
  onPlayTurn: () => Promise<PlayTurnResult | null>;
  onRollResolved: (result: PlayTurnResult) => Promise<void> | void;
};

const DICE_ANIMATION_STEPS = 13;
const DICE_ANIMATION_DELAY_MS = 200;
const DICE_PRE_BLINK_WAIT_MS = 800;
const DICE_BLINK_REPEATS = 8;
const DICE_BLINK_DELAY_MS = 100;
const DICE_POST_BLINK_WAIT_MS = 400;

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export default function DiceRollPanel({
  matchStatus,
  isMyTurn,
  turnMessage,
  onPlayTurn,
  onRollResolved,
}: DiceRollPanelProps) {
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
      diceAudioRef.current.volume = 0.55;
      diceAudioRef.current.loop = false;
    }

    diceAudioRef.current.pause();
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

    await sleep(DICE_PRE_BLINK_WAIT_MS);

    for (let i = 0; i < DICE_BLINK_REPEATS; i++) {
      if (unmountedRef.current) return;

      setIsDieVisible(false);
      await sleep(DICE_BLINK_DELAY_MS);
      setIsDieVisible(true);
      await sleep(DICE_BLINK_DELAY_MS);
    }

    await sleep(DICE_POST_BLINK_WAIT_MS);

    stopDiceSound();
    await onRollResolved(turnResult);

    if (unmountedRef.current) return;

    setIsRolling(false);
    setLocalStatusText("Lanzamiento resuelto");
  };

  return (
    <div className="rounded-[28px] border border-[#F1F6E8]/10 bg-[linear-gradient(135deg,rgba(18,13,28,0.98),rgba(10,11,18,0.98))] p-5 shadow-[0_18px_34px_rgba(0,0,0,0.24)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#FFD7E6]">
            Cámara del dado
          </p>
          <h4 className="mt-2 text-2xl font-black text-[#F8FFF0]">Lanzamiento</h4>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${
            matchStatus === "finished"
              ? "border-[#FFD86B]/18 bg-[#FFD86B]/10 text-[#FFF0BA]"
              : isRolling
              ? "border-[#FF7BA5]/18 bg-[#FF7BA5]/10 text-[#FFD7E6]"
              : isMyTurn
              ? "border-[#86F07F]/18 bg-[#86F07F]/10 text-[#E6FFD9]"
              : "border-[#6FD6FF]/18 bg-[#6FD6FF]/10 text-[#DDF7FF]"
          }`}
        >
          {matchStatus === "finished"
            ? "Partida cerrada"
            : isRolling
            ? "Rodando..."
            : isMyTurn
            ? "Tu turno"
            : "Esperando"}
        </span>
      </div>

      <div className="mt-5 flex flex-col items-center text-center">
        <div className="relative flex h-64 w-64 items-center justify-center rounded-[34px] border border-[#F1F6E8]/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),rgba(13,16,19,0.98))] shadow-[0_18px_40px_rgba(0,0,0,0.26)]">
          <div className="absolute inset-3 rounded-[26px] border border-[#F1F6E8]/8" />
          <Image
            src={`/dados/${displayedDieValue}.png`}
            alt={`Dado ${displayedDieValue}`}
            width={200}
            height={200}
            className={`h-44 w-44 object-contain transition duration-150 ${
              isDieVisible ? "scale-100 opacity-100" : "scale-90 opacity-0"
            }`}
            priority
          />
        </div>

        <p className="mt-5 text-sm font-semibold text-[#DDF7FF]">{localStatusText}</p>

        {turnMessage && (
          <div className="mt-4 w-full rounded-[20px] border border-[#6FD6FF]/18 bg-[linear-gradient(135deg,rgba(111,214,255,0.12),rgba(12,20,24,0.96))] px-4 py-4 text-sm leading-6 text-[#DDF7FF]">
            {turnMessage}
          </div>
        )}

        <button
          type="button"
          onClick={handleRollClick}
          disabled={!isMyTurn || matchStatus !== "active" || isRolling}
          className="mt-5 w-full rounded-[22px] bg-[linear-gradient(135deg,#FFD86B_0%,#86F07F_42%,#6FD6FF_100%)] px-5 py-4 text-sm font-black uppercase tracking-[0.12em] text-[#08110A] shadow-[0_14px_28px_rgba(111,214,255,0.16)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRolling ? "Lanzando..." : "Lanzar dado"}
        </button>
      </div>
    </div>
  );
}