"use client";

import { useEffect, useState } from "react";
import type { BaseMinigameProps } from "@/types/minigames";

export default function TotemRitualGame({ sessionId, tileIndex, onResolve, onCancel }: BaseMinigameProps<{ power: number }>) {
  const [power, setPower] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setPower((current) => {
        const next = current + direction * 6;
        if (next >= 100) {
          setDirection(-1);
          return 100;
        }
        if (next <= 0) {
          setDirection(1);
          return 0;
        }
        return next;
      });
    }, 70);

    return () => window.clearInterval(interval);
  }, [direction]);

  const inTarget = power >= 44 && power <= 62;

  return (
    <div className="w-full max-w-2xl rounded-3xl border border-slate-700 bg-slate-950 shadow-2xl">
      <div className="border-b border-slate-800 px-6 py-5">
        <h2 className="text-2xl font-bold text-slate-100">Ritual del Tótem</h2>
        <p className="mt-2 text-sm text-slate-300">Casilla {tileIndex} · Sesión {sessionId}. Detén la energía dentro de la zona marcada.</p>
      </div>
      <div className="px-6 py-6">
        <div className="relative h-8 overflow-hidden rounded-full border border-slate-700 bg-slate-900">
          <div className="absolute inset-y-0 left-[44%] w-[18%] bg-emerald-500/35" />
          <div className="absolute inset-y-0 bg-amber-300 transition-all" style={{ width: `${power}%` }} />
        </div>
        <p className="mt-4 text-sm text-slate-300">Energía actual: <span className="font-semibold text-slate-100">{power}</span></p>
      </div>
      <div className="flex flex-wrap justify-end gap-3 border-t border-slate-800 px-6 py-4">
        {onCancel ? <button type="button" onClick={onCancel} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 font-semibold text-slate-100 transition hover:bg-slate-800">Cancelar</button> : null}
        <button type="button" onClick={() => void onResolve({ result: inTarget ? "won" : "lost", details: { power } })} className="rounded-2xl bg-emerald-500 px-4 py-2 font-semibold text-emerald-950 transition hover:bg-emerald-400">Detener ritual</button>
      </div>
    </div>
  );
}
