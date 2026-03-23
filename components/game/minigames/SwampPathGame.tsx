"use client";

import { useMemo, useState } from "react";
import type { BaseMinigameProps } from "@/types/minigames";

const OPTIONS = ["Norte", "Sur", "Este", "Oeste"] as const;

function buildSequence(length: number): number[] {
  return Array.from({ length }, () => Math.floor(Math.random() * OPTIONS.length));
}

export default function SwampPathGame({ sessionId, tileIndex, onResolve, onCancel }: BaseMinigameProps<{ expected: string[]; selected: string[] }>) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const sequence = useMemo(() => buildSequence(4), []);
  const labels = sequence.map((value) => OPTIONS[value]!);

  async function choose(option: typeof OPTIONS[number]) {
    const expected = labels[step];
    const nextSelected = [...selected, option];
    setSelected(nextSelected);

    if (option !== expected) {
      await onResolve({ result: "lost", details: { expected: labels, selected: nextSelected } });
      return;
    }

    if (step + 1 >= labels.length) {
      await onResolve({ result: "won", details: { expected: labels, selected: nextSelected } });
      return;
    }

    setStep((current) => current + 1);
  }

  return (
    <div className="w-full max-w-3xl rounded-3xl border border-slate-700 bg-slate-950 shadow-2xl">
      <div className="border-b border-slate-800 px-6 py-5">
        <h2 className="text-2xl font-bold text-slate-100">Ruta del Pantano</h2>
        <p className="mt-2 text-sm text-slate-300">Casilla {tileIndex} · Sesión {sessionId}. Memoriza esta secuencia y repítela en orden.</p>
      </div>
      <div className="px-6 py-5">
        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
          Secuencia: <span className="font-semibold">{labels.join(" → ")}</span>
        </div>
        <p className="mt-4 text-sm text-slate-300">Paso actual: <span className="font-semibold text-slate-100">{step + 1}</span> / {labels.length}</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {OPTIONS.map((option) => (
            <button key={option} type="button" onClick={() => void choose(option)} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-5 text-base font-semibold text-slate-100 transition hover:bg-slate-800">{option}</button>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-3 border-t border-slate-800 px-6 py-4">
        {onCancel ? <button type="button" onClick={onCancel} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 font-semibold text-slate-100 transition hover:bg-slate-800">Cancelar</button> : null}
      </div>
    </div>
  );
}
