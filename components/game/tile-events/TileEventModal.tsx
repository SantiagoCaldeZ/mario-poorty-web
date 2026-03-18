"use client";

import Image from "next/image";
import { useEffect } from "react";
import type { BoardTile, TileFamily, TileHandlerResult } from "@/lib/tiles/types";
import type { TileResolutionStep } from "@/lib/tiles/engine";

type TileEventModalProps = {
  isOpen: boolean;
  tile: BoardTile | null;
  result: TileHandlerResult | null;
  steps?: TileResolutionStep[];
  onClose: () => void;
  onContinue?: () => void;
  busy?: boolean;
};

function getFamilyLabel(family: TileFamily | null | undefined) {
  switch (family) {
    case "start":
      return "Inicio";
    case "normal":
      return "Normal";
    case "bonus":
      return "Bonus";
    case "trap":
      return "Trampa";
    case "special_move":
      return "Movimiento especial";
    case "minigame":
      return "Minijuego";
    case "finish":
      return "Meta";
    default:
      return "Casilla";
  }
}

function getToneClasses(result: TileHandlerResult | null, tile: BoardTile | null) {
  const family = tile?.family ?? null;
  const tone = result?.tone ?? "neutral";

  if (tone === "positive" || family === "bonus") {
    return {
      badge: "border-[#86F07F]/25 bg-[#86F07F]/12 text-[#E6FFD9]",
      panel:
        "border-[#86F07F]/18 bg-[linear-gradient(180deg,rgba(134,240,127,0.10),rgba(10,18,11,0.96))]",
      glow: "shadow-[0_24px_80px_rgba(134,240,127,0.10)]",
    };
  }

  if (tone === "negative" || family === "trap") {
    return {
      badge: "border-[#FF7BA5]/25 bg-[#FF7BA5]/12 text-[#FFD7E6]",
      panel:
        "border-[#FF7BA5]/18 bg-[linear-gradient(180deg,rgba(255,123,165,0.10),rgba(20,10,15,0.96))]",
      glow: "shadow-[0_24px_80px_rgba(255,123,165,0.10)]",
    };
  }

  if (tone === "challenge" || family === "minigame") {
    return {
      badge: "border-[#6FD6FF]/25 bg-[#6FD6FF]/12 text-[#DDF7FF]",
      panel:
        "border-[#6FD6FF]/18 bg-[linear-gradient(180deg,rgba(111,214,255,0.10),rgba(9,15,20,0.96))]",
      glow: "shadow-[0_24px_80px_rgba(111,214,255,0.10)]",
    };
  }

  if (family === "special_move") {
    return {
      badge: "border-[#C6A6FF]/25 bg-[#C6A6FF]/12 text-[#F0E6FF]",
      panel:
        "border-[#C6A6FF]/18 bg-[linear-gradient(180deg,rgba(198,166,255,0.10),rgba(14,11,20,0.96))]",
      glow: "shadow-[0_24px_80px_rgba(198,166,255,0.10)]",
    };
  }

  return {
    badge: "border-[#FFD86B]/25 bg-[#FFD86B]/12 text-[#FFF0BA]",
    panel:
      "border-[#F1F6E8]/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(9,11,12,0.96))]",
    glow: "shadow-[0_24px_80px_rgba(0,0,0,0.36)]",
  };
}

function buildFooterText(result: TileHandlerResult | null) {
  if (!result) return "Sin resolución disponible.";

  if (result.implementationStatus === "placeholder") {
    return "Esta casilla ya está detectada y clasificada, pero su mecánica todavía está en construcción.";
  }

  return "La resolución de esta casilla ya está lista para integrarse al flujo completo de la partida.";
}

export default function TileEventModal({
  isOpen,
  tile,
  result,
  steps = [],
  onClose,
  onContinue,
  busy = false,
}: TileEventModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, busy]);

  if (!isOpen || !tile || !result) {
    return null;
  }

  const familyLabel = getFamilyLabel(tile.family);
  const toneClasses = getToneClasses(result, tile);
  const footerText = buildFooterText(result);

  const hasChainedSteps = steps.length > 1;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(3,6,5,0.78)] px-4 py-6 backdrop-blur-[4px]"
      onClick={() => {
        if (!busy) onClose();
      }}
    >
      <div
        className={`w-full max-w-2xl overflow-hidden rounded-[30px] border ${toneClasses.panel} ${toneClasses.glow}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-[#F1F6E8]/10 px-6 py-5 sm:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${toneClasses.badge}`}
            >
              Evento de casilla
            </span>

            <span className="rounded-full border border-[#F1F6E8]/10 bg-[#FFFFFF]/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#F8FFF0]">
              {familyLabel}
            </span>

            <span className="rounded-full border border-[#F1F6E8]/10 bg-[#FFFFFF]/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#D7E4D2]">
              {result.implementationStatus === "ready" ? "Listo" : "Placeholder"}
            </span>
          </div>

          <h3 className="mt-4 text-3xl font-black leading-tight text-[#F8FFF0] sm:text-4xl">
            {result.title}
          </h3>

          <p className="mt-3 text-sm leading-7 text-[#D7E4D2]/82 sm:text-base">
            {result.message}
          </p>
        </div>

        <div className="grid gap-6 px-6 py-6 sm:px-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div className="flex justify-center">
            <div className="relative flex h-[210px] w-[210px] items-center justify-center rounded-[28px] border border-[#F1F6E8]/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.09),rgba(9,12,11,0.95))]">
              <div className="absolute inset-3 rounded-[20px] border border-[#F1F6E8]/8" />
              <Image
                src={tile.image}
                alt={tile.label}
                width={150}
                height={150}
                className="relative h-36 w-36 object-contain drop-shadow-[0_8px_22px_rgba(0,0,0,0.34)]"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[22px] border border-[#F1F6E8]/10 bg-[#FFFFFF]/4 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#FFD7E6]">
                Casilla detectada
              </p>
              <p className="mt-2 text-xl font-black text-[#F8FFF0]">{tile.label}</p>
              <p className="mt-2 text-sm leading-6 text-[#D7E4D2]/80">
                Tipo específico: <span className="font-bold text-[#F8FFF0]">{tile.type}</span>
              </p>
              <p className="mt-1 text-sm leading-6 text-[#D7E4D2]/80">
                Familia: <span className="font-bold text-[#F8FFF0]">{familyLabel}</span>
              </p>
              <p className="mt-1 text-sm leading-6 text-[#D7E4D2]/80">
                Posición del tablero:{" "}
                <span className="font-bold text-[#F8FFF0]">#{tile.index}</span>
              </p>
            </div>

            <div className="rounded-[22px] border border-[#F1F6E8]/10 bg-[#FFFFFF]/4 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#6FD6FF]">
                Resolución actual
              </p>
              <p className="mt-2 text-sm leading-7 text-[#DDF7FF]">{footerText}</p>

              {hasChainedSteps ? (
                <div className="mt-4 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#FFD86B]">
                    Secuencia encadenada
                    </p>

                    {steps.map((step) => {
                    const stepTile = step.preview.tile;

                    return (
                        <div
                        key={`${step.stepNumber}-${step.position}-${stepTile?.type ?? "unknown"}`}
                        className="rounded-[16px] border border-[#F1F6E8]/10 bg-[#000000]/18 px-3 py-3"
                        >
                        <p className="text-xs font-black uppercase tracking-[0.12em] text-[#FFF0BA]">
                            Paso {step.stepNumber}
                        </p>
                        <p className="mt-1 text-sm font-bold text-[#F8FFF0]">
                            {stepTile?.label ?? "Casilla desconocida"} · posición #{step.position}
                        </p>
                        {step.result ? (
                            <p className="mt-1 text-sm leading-6 text-[#D7E4D2]/80">
                            {step.result.message}
                            </p>
                        ) : (
                            <p className="mt-1 text-sm leading-6 text-[#D7E4D2]/80">
                            No hubo resolución disponible para este paso.
                            </p>
                        )}
                        </div>
                    );
                    })}
                </div>
              ) : null}

              {result.effects.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {result.effects.map((effect, index) => (
                    <div
                      key={`${effect.kind}-${index}`}
                      className="rounded-[16px] border border-[#F1F6E8]/10 bg-[#000000]/18 px-3 py-3 text-sm text-[#E8F2E3]"
                    >
                      <span className="font-black uppercase tracking-[0.08em] text-[#FFF0BA]">
                        {effect.kind}
                      </span>
                      {"reason" in effect && effect.reason ? (
                        <p className="mt-1 text-sm leading-6 text-[#D7E4D2]/80">
                          {effect.reason}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-[16px] border border-[#F1F6E8]/10 bg-[#000000]/18 px-3 py-3 text-sm text-[#D7E4D2]/78">
                  Esta resolución no devolvió efectos adicionales todavía.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-[#F1F6E8]/10 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-[18px] border border-[#F1F6E8]/14 bg-[#FFFFFF]/5 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#F8FFF0] transition hover:bg-[#FFFFFF]/8 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cerrar
          </button>

          <button
            type="button"
            onClick={onContinue ?? onClose}
            disabled={busy}
            className="rounded-[18px] bg-[linear-gradient(135deg,#FFD86B_0%,#86F07F_42%,#6FD6FF_100%)] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#08110A] shadow-[0_14px_28px_rgba(111,214,255,0.16)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Procesando..." : "Continuar"}
          </button>
        </div>
      </div>
    </div>
  );
}