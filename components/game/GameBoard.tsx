"use client";

import Image from "next/image";
import { useMemo } from "react";
import { GOBLIN_SWAMP_BOARD, type TileType } from "@/lib/board";
import DiceRollPanel from "@/components/game/DiceRollPanel";

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

type PlayTurnResult = {
  rolled_value: number;
  updated_position: number;
  next_turn_user_id: string | null;
  updated_turn_number: number;
  match_finished: boolean;
};

type GameBoardProps = {
  players: MatchPlayerRow[];
  currentUserId: string | null;
  currentTurnUserId: string | null;
  winnerUserId: string | null;
  matchStatus: "active" | "finished" | "abandoned" | null;
  turnMessage: string;
  isMyTurn: boolean;
  onPlayTurn: () => Promise<PlayTurnResult | null>;
  onRollResolved: (result: PlayTurnResult) => Promise<void> | void;
};

const BOARD = GOBLIN_SWAMP_BOARD;
const LAST_TILE_INDEX = BOARD.tiles[BOARD.tiles.length - 1]?.index ?? 0;

function clampBoardPosition(position: number) {
  if (position < 0) return 0;
  if (position > LAST_TILE_INDEX) return LAST_TILE_INDEX;
  return position;
}

function getTileTypeLabel(type: TileType) {
  switch (type) {
    case "start":
      return "Inicio";
    case "bonus":
      return "Bonus";
    case "trap":
      return "Trampa";
    case "event":
      return "Evento";
    case "duel":
      return "Duelo";
    case "finish":
      return "Meta";
    default:
      return "Normal";
  }
}

function getTileTone(type: TileType) {
  switch (type) {
    case "start":
      return {
        tile: "border-[#86F07F]/55 bg-[radial-gradient(circle_at_top,rgba(134,240,127,0.24),rgba(20,28,18,0.94))]",
        badge: "border-[#86F07F]/22 bg-[#86F07F]/12 text-[#E6FFD9]",
      };
    case "bonus":
      return {
        tile: "border-[#FFD86B]/55 bg-[radial-gradient(circle_at_top,rgba(255,216,107,0.22),rgba(31,24,10,0.94))]",
        badge: "border-[#FFD86B]/22 bg-[#FFD86B]/12 text-[#FFF0BA]",
      };
    case "trap":
      return {
        tile: "border-[#FF7BA5]/55 bg-[radial-gradient(circle_at_top,rgba(255,123,165,0.22),rgba(33,14,22,0.94))]",
        badge: "border-[#FF7BA5]/22 bg-[#FF7BA5]/12 text-[#FFD7E6]",
      };
    case "event":
      return {
        tile: "border-[#6FD6FF]/55 bg-[radial-gradient(circle_at_top,rgba(111,214,255,0.22),rgba(11,23,31,0.94))]",
        badge: "border-[#6FD6FF]/22 bg-[#6FD6FF]/12 text-[#DDF7FF]",
      };
    case "finish":
      return {
        tile: "border-[#F7DA7A]/70 bg-[radial-gradient(circle_at_top,rgba(247,218,122,0.28),rgba(37,28,10,0.96))]",
        badge: "border-[#F7DA7A]/22 bg-[#F7DA7A]/12 text-[#FFF3C5]",
      };
    default:
      return {
        tile: "border-[#F1F6E8]/18 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.07),rgba(12,18,13,0.95))]",
        badge: "border-[#F1F6E8]/12 bg-[#F1F6E8]/6 text-[#F0F7E5]",
      };
  }
}

function buildPathD(
  from: { x: number; y: number },
  to: { x: number; y: number }
) {
  const startX = from.x;
  const startY = from.y;
  const endX = to.x;
  const endY = to.y;

  const controlX = (startX + endX) / 2;
  const controlY =
    Math.abs(endY - startY) < 40
      ? Math.min(startY, endY) - 26
      : (startY + endY) / 2;

  return `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
}

export default function GameBoard({
  players,
  currentUserId,
  currentTurnUserId,
  winnerUserId,
  matchStatus,
  turnMessage,
  isMyTurn,
  onPlayTurn,
  onRollResolved,
}: GameBoardProps) {
  const currentUserPlayer = useMemo(
    () => players.find((player) => player.user_id === currentUserId) ?? null,
    [players, currentUserId]
  );

  const currentTurnPlayer = useMemo(
    () => players.find((player) => player.user_id === currentTurnUserId) ?? null,
    [players, currentTurnUserId]
  );

  const winnerPlayer = useMemo(
    () => players.find((player) => player.user_id === winnerUserId) ?? null,
    [players, winnerUserId]
  );

  const currentUserPosition = currentUserPlayer
    ? clampBoardPosition(currentUserPlayer.board_position)
    : null;

  const currentTurnPosition = currentTurnPlayer
    ? clampBoardPosition(currentTurnPlayer.board_position)
    : null;

  const winnerPosition = winnerPlayer
    ? clampBoardPosition(winnerPlayer.board_position)
    : null;

  const boardProgress =
    currentUserPosition !== null && LAST_TILE_INDEX > 0
      ? Math.max(0, Math.min((currentUserPosition / LAST_TILE_INDEX) * 100, 100))
      : 0;

  return (
    <section className="overflow-hidden rounded-[36px] border border-[#F1F6E8]/10 bg-[linear-gradient(180deg,rgba(12,18,13,0.96),rgba(7,10,8,0.98))] shadow-[0_30px_90px_rgba(0,0,0,0.46)]">
      <div className="border-b border-[#F1F6E8]/10 bg-[linear-gradient(90deg,rgba(120,255,168,0.10),rgba(111,214,255,0.07),rgba(255,123,165,0.06),rgba(255,216,107,0.08))] px-6 py-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px_260px] xl:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#86F07F]/20 bg-[#86F07F]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#E6FFD9]">
                Tablero principal
              </span>
              <span className="rounded-full border border-[#6FD6FF]/20 bg-[#6FD6FF]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#DDF7FF]">
                {BOARD.name}
              </span>
              <span className="rounded-full border border-[#FFD86B]/20 bg-[#FFD86B]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#FFF0BA]">
                {BOARD.tiles.length} casillas
              </span>
            </div>

            <h2 className="mt-4 text-4xl font-black leading-tight text-[#F8FFF0] sm:text-5xl">
              Mesa de
              <span className="bg-[linear-gradient(135deg,#FFD86B_0%,#86F07F_35%,#6FD6FF_65%,#FF7BA5_100%)] bg-clip-text text-transparent">
                {" "}
                expedición
              </span>
            </h2>

            <p className="mt-3 max-w-3xl text-base leading-7 text-[#DBE8D6]/80">
              El tablero ahora ocupa el centro visual de la partida. Aquí se concentra
              el recorrido, la posición actual, la meta y la lectura rápida del estado
              del juego.
            </p>

            <div className="mt-5 h-3 rounded-full bg-[#141A15]">
              <div
                className="h-3 rounded-full bg-[linear-gradient(90deg,#6FD6FF_0%,#86F07F_35%,#FFD86B_68%,#FF7BA5_100%)] transition-all duration-500"
                style={{ width: `${boardProgress}%` }}
              />
            </div>
          </div>

          <DiceRollPanel
            matchStatus={matchStatus}
            isMyTurn={isMyTurn}
            turnMessage={turnMessage}
            onPlayTurn={onPlayTurn}
            onRollResolved={onRollResolved}
          />

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-[24px] border border-[#F1F6E8]/10 bg-[#0D120E]/82 px-4 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.18)]">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#6FD6FF]">
                Tu posición
              </p>
              <p className="mt-2 text-3xl font-black text-[#F8FFF0]">
                {currentUserPosition ?? "-"}
              </p>
            </div>

            <div className="rounded-[24px] border border-[#F1F6E8]/10 bg-[#0D120E]/82 px-4 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.18)]">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#86F07F]">
                Turno actual
              </p>
              <p className="mt-2 break-all text-lg font-black leading-tight text-[#F8FFF0]">
                {currentTurnPlayer?.username ?? "No definido"}
              </p>
            </div>

            <div className="rounded-[24px] border border-[#F1F6E8]/10 bg-[#0D120E]/82 px-4 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.18)]">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#FFD86B]">
                Estado
              </p>
              <p className="mt-2 text-3xl font-black capitalize text-[#F8FFF0]">
                {matchStatus ?? "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 lg:p-6">
        <div className="rounded-[34px] border border-[#F1F6E8]/10 bg-[linear-gradient(180deg,rgba(8,12,9,0.96),rgba(5,8,6,0.98))] p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)] sm:p-4">
          <div className="relative aspect-[1340/720] overflow-hidden rounded-[28px] border border-[#F1F6E8]/8">
            <Image
              src={BOARD.backgroundImage}
              alt={BOARD.name}
              fill
              priority
              className="object-cover"
            />

            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,10,6,0.18),rgba(5,10,6,0.04)_22%,rgba(5,10,6,0.08)_78%,rgba(5,10,6,0.20))]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,239,170,0.10),transparent_42%)]" />
            <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,rgba(235,245,220,0.75)_1px,transparent_1px),linear-gradient(to_bottom,rgba(235,245,220,0.75)_1px,transparent_1px)] [background-size:52px_52px]" />

            <svg
              className="absolute inset-0 h-full w-full"
              viewBox={`0 0 ${BOARD.width} ${BOARD.height}`}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="boardPathPrimary" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(111,214,255,0.75)" />
                  <stop offset="38%" stopColor="rgba(134,240,127,0.70)" />
                  <stop offset="70%" stopColor="rgba(255,216,107,0.80)" />
                  <stop offset="100%" stopColor="rgba(255,123,165,0.70)" />
                </linearGradient>
              </defs>

              {BOARD.tiles.slice(0, -1).map((tile, index) => {
                const nextTile = BOARD.tiles[index + 1];
                const pathD = buildPathD(tile, nextTile);

                return (
                  <path
                    key={`${tile.index}-${nextTile.index}`}
                    d={pathD}
                    fill="none"
                    stroke="url(#boardPathPrimary)"
                    strokeWidth="18"
                    strokeLinecap="round"
                    opacity="0.82"
                  />
                );
              })}

              {BOARD.tiles.slice(0, -1).map((tile, index) => {
                const nextTile = BOARD.tiles[index + 1];
                const pathD = buildPathD(tile, nextTile);

                return (
                  <path
                    key={`outline-${tile.index}-${nextTile.index}`}
                    d={pathD}
                    fill="none"
                    stroke="rgba(7,12,8,0.70)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    opacity="0.95"
                  />
                );
              })}
            </svg>

            {BOARD.tiles.map((tile) => {
              const tileTone = getTileTone(tile.type);

              const isCurrentUserTile = currentUserPosition === tile.index;
              const isCurrentTurnTile = currentTurnPosition === tile.index;
              const isWinnerTile = winnerPosition === tile.index;

              return (
                <div
                  key={tile.index}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${(tile.x / BOARD.width) * 100}%`,
                    top: `${(tile.y / BOARD.height) * 100}%`,
                    width: "clamp(58px, 7vw, 96px)",
                    height: "clamp(58px, 7vw, 96px)",
                  }}
                >
                  <div
                    className={`relative h-full w-full rounded-[26px] border shadow-[0_18px_34px_rgba(0,0,0,0.28)] backdrop-blur-[2px] transition duration-300 ${tileTone.tile} ${
                      isCurrentTurnTile && matchStatus === "active"
                        ? "ring-4 ring-[#86F07F]/65 shadow-[0_0_0_12px_rgba(134,240,127,0.12),0_18px_34px_rgba(0,0,0,0.34)]"
                        : ""
                    } ${
                      isCurrentUserTile
                        ? "ring-4 ring-[#6FD6FF]/65 shadow-[0_0_0_12px_rgba(111,214,255,0.14),0_18px_34px_rgba(0,0,0,0.30)]"
                        : ""
                    } ${
                      isWinnerTile
                        ? "ring-4 ring-[#FFD86B]/75 shadow-[0_0_0_12px_rgba(255,216,107,0.16),0_18px_34px_rgba(0,0,0,0.34)]"
                        : ""
                    }`}
                  >
                    <div className="pointer-events-none absolute inset-0 rounded-[26px] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_40%,rgba(0,0,0,0.10))]" />

                    <div className="relative flex h-full flex-col justify-between p-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="rounded-full border border-[#F1F6E8]/10 bg-[#0C120D]/78 px-2 py-1 text-[10px] font-black text-[#F8FFF0]">
                          {tile.index}
                        </span>

                        <span
                          className={`rounded-full border px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] ${tileTone.badge}`}
                        >
                          {getTileTypeLabel(tile.type)}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {isCurrentTurnTile && matchStatus === "active" && (
                          <div className="rounded-full border border-[#86F07F]/20 bg-[#86F07F]/10 px-2 py-1 text-center text-[8px] font-black uppercase tracking-[0.12em] text-[#E6FFD9]">
                            Turno actual
                          </div>
                        )}

                        {isCurrentUserTile && (
                          <div className="rounded-full border border-[#6FD6FF]/20 bg-[#6FD6FF]/10 px-2 py-1 text-center text-[8px] font-black uppercase tracking-[0.12em] text-[#DDF7FF]">
                            Tu casilla
                          </div>
                        )}

                        {isWinnerTile && (
                          <div className="rounded-full border border-[#FFD86B]/20 bg-[#FFD86B]/10 px-2 py-1 text-center text-[8px] font-black uppercase tracking-[0.12em] text-[#FFF0BA]">
                            Ganadora
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="pointer-events-none absolute left-4 top-4 rounded-[22px] border border-[#86F07F]/18 bg-[linear-gradient(135deg,rgba(134,240,127,0.12),rgba(10,15,10,0.72))] px-4 py-4 shadow-[0_12px_28px_rgba(0,0,0,0.24)] backdrop-blur-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#E6FFD9]">
                Inicio
              </p>
              <p className="mt-2 text-sm font-semibold text-[#F8FFF0]">Casilla 0</p>
            </div>

            <div className="pointer-events-none absolute right-4 top-4 rounded-[22px] border border-[#FFD86B]/18 bg-[linear-gradient(135deg,rgba(255,216,107,0.14),rgba(18,14,7,0.72))] px-4 py-4 shadow-[0_12px_28px_rgba(0,0,0,0.24)] backdrop-blur-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#FFF0BA]">
                Meta
              </p>
              <p className="mt-2 text-sm font-semibold text-[#FFF4CF]">
                Casilla {LAST_TILE_INDEX}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          {[
            { label: "Inicio", tone: "border-[#86F07F]/20 bg-[#86F07F]/10 text-[#E6FFD9]" },
            { label: "Normal", tone: "border-[#F1F6E8]/12 bg-[#F1F6E8]/6 text-[#F0F7E5]" },
            { label: "Bonus", tone: "border-[#FFD86B]/20 bg-[#FFD86B]/10 text-[#FFF0BA]" },
            { label: "Trampa", tone: "border-[#FF7BA5]/20 bg-[#FF7BA5]/10 text-[#FFD7E6]" },
            { label: "Evento", tone: "border-[#6FD6FF]/20 bg-[#6FD6FF]/10 text-[#DDF7FF]" },
            { label: "Meta", tone: "border-[#F7DA7A]/20 bg-[#F7DA7A]/10 text-[#FFF3C5]" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-[20px] border border-[#F1F6E8]/10 bg-[#0E130F]/78 px-4 py-3"
            >
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${item.tone}`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}