"use client";

import { useMemo, useState } from "react";
import type { BaseMinigameProps } from "@/types/minigames";

const RUNES = ["ᚠ", "ᚢ", "ᚦ", "ᚨ"] as const;

function createRuneSequence(length: number): number[] {
  return Array.from({ length }, () => Math.floor(Math.random() * RUNES.length));
}

export default function ShamanRunesGame({ sessionId, tileIndex, onResolve, onCancel }: BaseMinigameProps<{ expected: string[]; selected: string[] }>) {
  const [selected, setSelected] = useState<string[]>([]);
  const sequence = useMemo(() => createRuneSequence(4), []);
  const expected = sequence.map((index) => RUNES[index]!);

  async function choose(rune: string) {
    const next = [...selected, rune];
    setSelected(next);

    const currentIndex = next.length - 1;
    if (rune !== expected[currentIndex]) {
      await onResolve({ result: "lost", details: { expected, selected: next } });
      return;
    }

    if (next.length === expected.length) {
      await onResolve({ result: "won", details: { expected, selected: next } });
    }
  }

  return (
    <div className="w-full max-w-3xl rounded-3xl border border-slate-700 bg-slate-950 shadow-2xl">
      <div className="border-b border-slate-800 px-6 py-5">
        <h2 className="text-2xl font-bold text-slate-100">Runas del Chamán</h2>
        <p className="mt-2 text-sm text-slate-300">Casilla {tileIndex} · Sesión {sessionId}. Repite la secuencia de runas en orden.</p>
      </div>
      <div className="px-6 py-5">
        <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-100">
          Secuencia objetivo: <span className="font-semibold">{expected.join(" ")}</span>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {RUNES.map((rune) => (
            <button key={rune} type="button" onClick={() => void choose(rune)} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-5 text-3xl font-semibold text-slate-100 transition hover:bg-slate-800">{rune}</button>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-3 border-t border-slate-800 px-6 py-4">
        {onCancel ? <button type="button" onClick={onCancel} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 font-semibold text-slate-100 transition hover:bg-slate-800">Cancelar</button> : null}
      </div>
    </div>
  );
}
