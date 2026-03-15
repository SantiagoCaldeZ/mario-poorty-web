"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { FriendPresenceRow } from "@/lib/hooks/useFriendsPresence";

type FriendsPresenceDrawerProps = {
  open: boolean;
  onClose: () => void;
  friends: FriendPresenceRow[];
  loading: boolean;
  error: string;
};

function getInitial(username: string | null) {
  return (username?.slice(0, 1) ?? "?").toUpperCase();
}

function getStatusLabel(status: FriendPresenceRow["presence_status"]) {
  if (status === "online") return "En línea";
  if (status === "away") return "Ausente";
  return "Desconectado";
}

function getStatusStyles(status: FriendPresenceRow["presence_status"]) {
  if (status === "online") {
    return {
      dot: "bg-[#86B64B]",
      chip:
        "border-[#86B64B]/22 bg-[#86B64B]/12 text-[#DDF4B8]",
      card:
        "border-[#86B64B]/12 bg-[linear-gradient(135deg,rgba(134,182,75,0.12),rgba(23,17,14,0.96))]",
    };
  }

  if (status === "away") {
    return {
      dot: "bg-[#D9B45B]",
      chip:
        "border-[#D9B45B]/22 bg-[#D9B45B]/12 text-[#F5DEAB]",
      card:
        "border-[#D9B45B]/12 bg-[linear-gradient(135deg,rgba(217,180,91,0.10),rgba(23,17,14,0.96))]",
    };
  }

  return {
    dot: "bg-[#7A6A5D]",
    chip:
      "border-[#7A6A5D]/22 bg-[#7A6A5D]/12 text-[#D1C5BA]",
    card:
      "border-[#E6D1A5]/8 bg-[#17110E]",
  };
}

function formatLastSeen(lastSeenAt: string | null) {
  if (!lastSeenAt) return "Sin actividad reciente";

  const time = new Date(lastSeenAt).getTime();

  if (Number.isNaN(time)) return "Sin actividad reciente";

  const diffMs = Date.now() - time;
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes <= 0) return "Activo hace unos segundos";
  if (diffMinutes < 60) return `Activo hace ${diffMinutes} min`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Activo hace ${diffHours} h`;

  const diffDays = Math.floor(diffHours / 24);
  return `Activo hace ${diffDays} d`;
}

type SectionProps = {
  title: string;
  caption: string;
  friends: FriendPresenceRow[];
  emptyText: string;
  status: FriendPresenceRow["presence_status"];
  onClose: () => void;
};

function FriendSection({
  title,
  caption,
  friends,
  emptyText,
  status,
  onClose,
}: SectionProps) {
  return (
    <section className="mb-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h4 className="text-lg font-black text-[#FFF5E3]">{title}</h4>
          <p className="text-xs text-[#D9C8A8]/64">{caption}</p>
        </div>

        <span className="rounded-full border border-[#E6D1A5]/10 bg-[#17110E] px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-[#E9DEC7]/82">
          {friends.length}
        </span>
      </div>

      {friends.length === 0 ? (
        <div className="rounded-[22px] border border-[#E6D1A5]/8 bg-[#17110E] px-4 py-4 text-sm text-[#D9C8A8]/74">
          {emptyText}
        </div>
      ) : (
        <div className="space-y-3">
          {friends.map((friend) => {
            const styles = getStatusStyles(friend.presence_status);

            return (
              <div
                key={friend.friend_user_id}
                className={`rounded-[24px] border px-4 py-4 ${styles.card}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="relative">
                      <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#86B64B_0%,#D9B45B_55%,#4FC3A1_100%)] font-black text-[#1A140F] shadow-[0_10px_22px_rgba(0,0,0,0.24)]">
                        {getInitial(friend.username)}
                      </div>

                      <span
                        className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-[#17110E] ${styles.dot}`}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-base font-black text-[#FFF2DF]">
                          {friend.username ?? "Usuario"}
                        </p>

                        <span
                          className={`rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${styles.chip}`}
                        >
                          {getStatusLabel(friend.presence_status)}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-[#D9C8A8]/76">
                        {status === "offline"
                          ? formatLastSeen(friend.last_seen_at)
                          : friend.activity ?? "En línea"}
                      </p>

                      {status !== "offline" && friend.route && (
                        <p className="mt-1 text-xs text-[#D9C8A8]/50">
                          {friend.route}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <Link
                    href={`/friends/${friend.friend_user_id}`}
                    onClick={onClose}
                    className="rounded-[16px] border border-[#E6D1A5]/10 bg-[#211813] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#F2EAD1]/85 transition hover:bg-[#2B1F18]"
                  >
                    Perfil
                  </Link>

                  <Link
                    href={`/messages?user=${friend.friend_user_id}`}
                    onClick={onClose}
                    className="rounded-[16px] border border-[#86B64B]/16 bg-[#86B64B]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#E2F5BE] transition hover:bg-[#86B64B]/18"
                  >
                    Mensaje
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default function FriendsPresenceDrawer({
  open,
  onClose,
  friends,
  loading,
  error,
}: FriendsPresenceDrawerProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  const onlineFriends = useMemo(
    () => friends.filter((friend) => friend.presence_status === "online"),
    [friends]
  );

  const awayFriends = useMemo(
    () => friends.filter((friend) => friend.presence_status === "away"),
    [friends]
  );

  const offlineFriends = useMemo(
    () => friends.filter((friend) => friend.presence_status === "offline"),
    [friends]
  );

  const activeNow = onlineFriends.length + awayFriends.length;

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] transition duration-300 ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed right-0 top-0 z-50 h-screen w-full max-w-[430px] transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="relative flex h-full flex-col overflow-hidden border-l border-[#E6D1A5]/10 bg-[linear-gradient(180deg,#231914_0%,#17110E_45%,#0F0C0A_100%)] text-[#F7F0DC] shadow-[-18px_0_60px_rgba(0,0,0,0.45)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(201,119,59,0.16),transparent_20%),radial-gradient(circle_at_88%_12%,rgba(79,195,161,0.12),transparent_18%),radial-gradient(circle_at_30%_88%,rgba(134,182,75,0.10),transparent_20%)]" />

          <div className="relative border-b border-[#E6D1A5]/10 bg-[linear-gradient(135deg,rgba(58,36,26,0.98),rgba(21,29,25,0.98),rgba(12,17,15,0.98))] px-5 py-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.34em] text-[#D9B45B]">
                  Gremio social
                </p>
                <h3 className="mt-2 text-3xl font-black text-[#FFF5E3]">
                  Panel de amigos
                </h3>
                <p className="mt-2 max-w-[280px] text-sm leading-6 text-[#E6D6B8]/80">
                  Revisa quién está conectado, quién anda ausente y quién se desconectó recientemente.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-[18px] border border-[#E6D1A5]/10 bg-[#17110E]/70 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#F4E8D1] transition hover:bg-[#211813]"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-[20px] border border-[#E6D1A5]/10 bg-[#120E0C]/72 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#D8F1AA]">
                  Activos
                </p>
                <p className="mt-2 text-3xl font-black text-[#FFF5E3]">
                  {activeNow}
                </p>
              </div>

              <div className="rounded-[20px] border border-[#E6D1A5]/10 bg-[#120E0C]/72 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#F5DEAB]">
                  Ausentes
                </p>
                <p className="mt-2 text-3xl font-black text-[#FFF5E3]">
                  {awayFriends.length}
                </p>
              </div>

              <div className="rounded-[20px] border border-[#E6D1A5]/10 bg-[#120E0C]/72 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#D1C5BA]">
                  Offline
                </p>
                <p className="mt-2 text-3xl font-black text-[#FFF5E3]">
                  {offlineFriends.length}
                </p>
              </div>
            </div>
          </div>

          <div className="relative flex-1 overflow-y-auto px-4 py-4">
            {loading ? (
              <div className="rounded-[22px] border border-[#E6D1A5]/8 bg-[#17110E] px-4 py-5 text-sm text-[#D9C8A8]/74">
                Cargando panel social...
              </div>
            ) : error ? (
              <div className="rounded-[22px] border border-[#C9773B]/20 bg-[#2A1713] px-4 py-5 text-sm text-[#FFD0C2]">
                {error}
              </div>
            ) : friends.length === 0 ? (
              <div className="rounded-[24px] border border-[#E6D1A5]/10 bg-[#17110E] px-5 py-5">
                <p className="text-lg font-black text-[#FFF2DF]">
                  Aún no tienes amigos agregados
                </p>
                <p className="mt-2 text-sm leading-6 text-[#D9C8A8]/76">
                  Cuando ya tengas amistades aceptadas, aquí verás quién está conectado y qué está haciendo.
                </p>

                <div className="mt-4">
                  <Link
                    href="/friends"
                    onClick={onClose}
                    className="inline-flex rounded-[18px] border border-[#86B64B]/18 bg-[#86B64B]/10 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#E2F5BE] transition hover:bg-[#86B64B]/18"
                  >
                    Ir a amigos
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <FriendSection
                  title="Conectados"
                  caption="Jugadores activos ahora mismo"
                  friends={onlineFriends}
                  emptyText="No hay amigos en línea en este momento."
                  status="online"
                  onClose={onClose}
                />

                <FriendSection
                  title="Ausentes"
                  caption="Siguen activos, pero no están enfocados en la pestaña"
                  friends={awayFriends}
                  emptyText="No hay amigos ausentes ahora mismo."
                  status="away"
                  onClose={onClose}
                />

                <FriendSection
                  title="Desconectados"
                  caption="Última actividad reciente"
                  friends={offlineFriends}
                  emptyText="No hay amigos desconectados para mostrar."
                  status="offline"
                  onClose={onClose}
                />
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}