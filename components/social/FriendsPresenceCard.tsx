"use client";

import Link from "next/link";
import { FriendPresenceRow } from "@/lib/hooks/useFriendsPresence";

type FriendsPresenceCardProps = {
  friends: FriendPresenceRow[];
  loading: boolean;
  error: string;
  onOpenDrawer: () => void;
};

function getInitial(username: string | null) {
  return (username?.slice(0, 1) ?? "?").toUpperCase();
}

function getStatusText(status: FriendPresenceRow["presence_status"]) {
  if (status === "online") return "En línea";
  if (status === "away") return "Ausente";
  return "Desconectado";
}

function getStatusDotClass(status: FriendPresenceRow["presence_status"]) {
  if (status === "online") return "bg-[#86B64B]";
  if (status === "away") return "bg-[#D9B45B]";
  return "bg-[#7A6A5D]";
}

export default function FriendsPresenceCard({
  friends,
  loading,
  error,
  onOpenDrawer,
}: FriendsPresenceCardProps) {
  const connectedFriends = friends.filter(
    (friend) => friend.presence_status !== "offline"
  );

  const previewFriends = connectedFriends.slice(0, 6);

  return (
    <div className="overflow-hidden rounded-[32px] border border-[#E6D1A5]/10 bg-[linear-gradient(180deg,rgba(36,26,20,0.96),rgba(22,17,13,0.96))] shadow-[0_22px_70px_rgba(0,0,0,0.38)]">
      <div className="border-b border-[#E6D1A5]/8 bg-[linear-gradient(90deg,rgba(134,182,75,0.10),rgba(217,180,91,0.05))] px-6 py-4">
        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#D8F1AA]">
          Gremio social
        </p>
        <h3 className="mt-2 text-2xl font-black text-[#FFF2DF]">
          Amigos conectados
        </h3>
      </div>

      <div className="p-6">
        <div
          role="button"
          tabIndex={0}
          onClick={onOpenDrawer}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onOpenDrawer();
            }
          }}
          className="group cursor-pointer rounded-[28px] border border-[#D9B45B]/16 bg-[linear-gradient(135deg,rgba(58,36,26,0.98),rgba(25,20,18,0.98),rgba(16,24,22,0.98))] p-4 shadow-[0_20px_46px_rgba(0,0,0,0.30)] transition duration-300 hover:-translate-y-1 hover:border-[#D9B45B]/26"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#FFD7A8]">
                Centro de presencia
              </p>
              <h4 className="mt-2 text-2xl font-black text-[#FFF5E3]">
                Tribu activa
              </h4>
              <p className="mt-2 max-w-[220px] text-sm leading-6 text-[#E6D6B8]/80">
                Vista rápida del campamento. Toca este cuadro para abrir el panel social completo.
              </p>
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onOpenDrawer();
              }}
              className="rounded-[18px] bg-[linear-gradient(135deg,#D9B45B_0%,#C9773B_55%,#4FC3A1_100%)] px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#1A140F] shadow-[0_12px_26px_rgba(0,0,0,0.26)] transition hover:scale-[1.02]"
            >
              Abrir panel
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-[20px] border border-[#E6D1A5]/10 bg-[#120E0C]/70 px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#D8F1AA]">
                Activos ahora
              </p>
              <p className="mt-2 text-3xl font-black text-[#FFF5E3]">
                {connectedFriends.length}
              </p>
            </div>

            <div className="rounded-[20px] border border-[#E6D1A5]/10 bg-[#120E0C]/70 px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#FFD7A8]">
                Total amigos
              </p>
              <p className="mt-2 text-3xl font-black text-[#FFF5E3]">
                {friends.length}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-[22px] border border-[#E6D1A5]/10 bg-[#120E0C]/76 p-3">
            {loading ? (
              <div className="rounded-[18px] border border-[#E6D1A5]/8 bg-[#17110E] px-4 py-5 text-sm text-[#D9C8A8]/74">
                Cargando amigos conectados...
              </div>
            ) : error ? (
              <div className="rounded-[18px] border border-[#C9773B]/20 bg-[#2A1713] px-4 py-5 text-sm text-[#FFD0C2]">
                {error}
              </div>
            ) : previewFriends.length === 0 ? (
              <div className="rounded-[18px] border border-[#E6D1A5]/8 bg-[#17110E] px-4 py-5 text-sm text-[#D9C8A8]/74">
                No hay amigos conectados en este momento.
              </div>
            ) : (
              <div className="max-h-[238px] space-y-3 overflow-y-auto pr-1">
                {previewFriends.map((friend) => (
                  <div
                    key={friend.friend_user_id}
                    className="flex items-center justify-between gap-3 rounded-[18px] border border-[#E6D1A5]/8 bg-[#17110E] px-3 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative">
                        <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[linear-gradient(135deg,#86B64B_0%,#D9B45B_58%,#4FC3A1_100%)] font-black text-[#1A140F] shadow-[0_10px_20px_rgba(0,0,0,0.24)]">
                          {getInitial(friend.username)}
                        </div>

                        <span
                          className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-[#17110E] ${getStatusDotClass(
                            friend.presence_status
                          )}`}
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#FFF2DF]">
                          {friend.username ?? "Usuario"}
                        </p>
                        <p className="truncate text-xs text-[#D9C8A8]/60">
                          {friend.presence_status === "online"
                            ? friend.activity ?? "En línea"
                            : getStatusText(friend.presence_status)}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/friends/${friend.friend_user_id}`}
                      onClick={(event) => event.stopPropagation()}
                      className="shrink-0 rounded-[14px] border border-[#E6D1A5]/10 bg-[#211813] px-3 py-2 text-xs font-semibold text-[#F2EAD1]/85 transition hover:bg-[#2B1F18]"
                    >
                      Perfil
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-[18px] border border-[#E6D1A5]/10 bg-[#120E0C]/66 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#E9DEC7]/78">
              Ver conectados, ausentes y desconectados
            </p>

            <span className="rounded-full border border-[#E6D1A5]/10 bg-[#17110E] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#F4D89C]">
              Abrir →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}