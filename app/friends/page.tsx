"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type FriendshipRow = {
  id: string;
  requester_id: string;
  addressee_id: string;
  user_low: string;
  user_high: string;
  status: "pending" | "accepted" | "rejected" | "blocked";
  created_at: string;
  updated_at: string;
};

type ProfileRow = {
  id: string;
  username: string | null;
  email: string | null;
};

export default function FriendsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [friendships, setFriendships] = useState<FriendshipRow[]>([]);
  const [profilesMap, setProfilesMap] = useState<Record<string, ProfileRow>>({});

  const [searchUsername, setSearchUsername] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const [pageError, setPageError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const loadFriendsPage = async () => {
    setPageError("");
    setActionMessage("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      router.replace("/");
      return;
    }

    const userId = session.user.id;
    setCurrentUserId(userId);

    const { data: friendshipData, error: friendshipError } = await supabase
      .from("friendships")
      .select(
        "id, requester_id, addressee_id, user_low, user_high, status, created_at, updated_at"
      )
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .order("updated_at", { ascending: false });

    if (friendshipError) {
      setPageError(friendshipError.message);
      setLoading(false);
      return;
    }

    const rows = (friendshipData ?? []) as FriendshipRow[];
    setFriendships(rows);

    const relatedUserIds = Array.from(
      new Set(
        rows.flatMap((row) => [row.requester_id, row.addressee_id, userId])
      )
    );

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, username, email")
      .in("id", relatedUserIds);

    if (profileError) {
      setPageError(profileError.message);
      setLoading(false);
      return;
    }

    const map: Record<string, ProfileRow> = {};
    (profileData ?? []).forEach((profile) => {
      map[profile.id] = profile;
    });

    setProfilesMap(map);
    setLoading(false);
  };

  useEffect(() => {
    loadFriendsPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const receivedRequests = useMemo(() => {
    if (!currentUserId) return [];
    return friendships.filter(
      (row) => row.status === "pending" && row.addressee_id === currentUserId
    );
  }, [friendships, currentUserId]);

  const sentRequests = useMemo(() => {
    if (!currentUserId) return [];
    return friendships.filter(
      (row) => row.status === "pending" && row.requester_id === currentUserId
    );
  }, [friendships, currentUserId]);

  const acceptedFriends = useMemo(() => {
    if (!currentUserId) return [];
    return friendships.filter(
      (row) =>
        row.status === "accepted" &&
        (row.requester_id === currentUserId || row.addressee_id === currentUserId)
    );
  }, [friendships, currentUserId]);

  const getOtherUser = (row: FriendshipRow) => {
    if (!currentUserId) return null;
    const otherUserId =
      row.requester_id === currentUserId ? row.addressee_id : row.requester_id;
    return profilesMap[otherUserId] ?? null;
  };

  const handleSendFriendRequest = async () => {
    if (!currentUserId) return;

    const trimmedUsername = searchUsername.trim();

    if (!trimmedUsername) {
    setActionMessage("Debes escribir un nombre de usuario.");
    return;
    }

    setSearchLoading(true);
    setActionMessage("");
    setPageError("");

    const { data: targetProfile, error: profileError } = await supabase
    .from("profiles")
    .select("id, username")
    .ilike("username", trimmedUsername)
    .maybeSingle();

    if (profileError) {
      setSearchLoading(false);
      setPageError("No se pudo buscar al usuario.");
      return;
    }

    if (!targetProfile) {
      setSearchLoading(false);
      setActionMessage("No existe un usuario con ese nombre.");
      return;
    }

    if (targetProfile.id === currentUserId) {
      setSearchLoading(false);
      setActionMessage("No puedes enviarte una solicitud a ti mismo.");
      return;
    }

    const { error } = await supabase.rpc("send_friend_request", {
      target_user_id: targetProfile.id,
    });

    setSearchLoading(false);

    if (error) {
      const message = error.message.toLowerCase();

      if (message.includes("already exists") || message.includes("friendship")) {
        setActionMessage("Ya existe una relación o solicitud entre ambos usuarios.");
        return;
      }

      if (message.includes("yourself")) {
        setActionMessage("No puedes enviarte una solicitud a ti mismo.");
        return;
      }

      setPageError(error.message);
      return;
    }

    setActionMessage(`Solicitud enviada a ${targetProfile.username}.`);
    setSearchUsername("");
    await loadFriendsPage();
  };

  const handleRespond = async (
    friendshipId: string,
    response: "accepted" | "rejected"
  ) => {
    setRespondingId(friendshipId);
    setPageError("");
    setActionMessage("");

    const { error } = await supabase.rpc("respond_to_friend_request", {
      target_friendship_id: friendshipId,
      response,
    });

    setRespondingId(null);

    if (error) {
      setPageError(error.message);
      return;
    }

    setActionMessage(
      response === "accepted"
        ? "Solicitud aceptada correctamente."
        : "Solicitud rechazada."
    );

    await loadFriendsPage();
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <p className="text-white/90">Cargando sección de amigos...</p>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950 to-emerald-950 text-white">
      <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_34%)]" />

      <div className="pointer-events-none absolute left-[8%] top-[10%] h-28 w-28 rounded-full bg-cyan-300/15 blur-3xl" />
      <div className="pointer-events-none absolute right-[10%] top-[12%] h-24 w-24 rounded-full bg-pink-300/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[16%] left-[14%] h-24 w-24 rounded-full bg-green-300/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[14%] right-[12%] h-28 w-28 rounded-full bg-yellow-300/15 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-[28px] border border-white/10 bg-white/8 backdrop-blur-xl">
          <div className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="/logo/logopgw.png"
                alt="Poorty Goblin Web"
                width={120}
                height={120}
                className="h-14 w-14 rounded-2xl object-cover shadow-lg"
                priority
              />
              <div>
                <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-300">
                  Centro social
                </p>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-white">
                  Amigos
                </h1>
              </div>
            </div>

            <Link
              href="/home"
              className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-white/15"
            >
              Volver al inicio
            </Link>
          </div>
        </header>

        {(pageError || actionMessage) && (
          <div className="mb-6 space-y-3">
            {pageError && (
              <div className="rounded-2xl border border-red-300/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {pageError}
              </div>
            )}

            {actionMessage && (
              <div className="rounded-2xl border border-green-300/20 bg-green-500/10 px-4 py-3 text-sm text-green-100">
                {actionMessage}
              </div>
            )}
          </div>
        )}

        <section className="mb-6 rounded-[30px] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
          <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-300">
            Red social de jugadores
          </p>
          <h2 className="mt-3 text-4xl font-black leading-tight text-white">
            Gestiona tus amistades dentro de Poorty Goblin Web
          </h2>
          <p className="mt-4 max-w-3xl text-base text-white/78">
            Envía solicitudes, revisa quién quiere agregarte y consulta tu lista
            de amigos actuales desde un solo lugar.
          </p>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[30px] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">
              Enviar solicitud
            </p>
            <h3 className="mt-2 text-2xl font-black text-white">
              Buscar jugador por username
            </h3>
            <p className="mt-3 text-sm text-white/72">
              Escribe el nombre de usuario exacto del jugador al que quieres agregar.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={searchUsername}
                onChange={(event) => setSearchUsername(event.target.value)}
                placeholder="Ejemplo: santi9007"
                className="w-full rounded-2xl border border-cyan-300/20 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-cyan-300/50"
              />

              <button
                type="button"
                onClick={handleSendFriendRequest}
                disabled={searchLoading}
                className="rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-slate-950 transition hover:scale-[1.01] disabled:opacity-60"
              >
                {searchLoading ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-yellow-300">
              Solicitudes recibidas
            </p>
            <h3 className="mt-2 text-2xl font-black text-white">
              Pendientes de respuesta
            </h3>

            <div className="mt-5 space-y-3">
              {receivedRequests.length === 0 ? (
                <div className="rounded-2xl bg-black/20 px-4 py-4 text-sm text-white/70">
                  No tienes solicitudes pendientes.
                </div>
              ) : (
                receivedRequests.map((row) => {
                  const otherUser = getOtherUser(row);

                  return (
                    <div
                      key={row.id}
                      className="rounded-2xl border border-white/10 bg-black/20 p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-lg font-black text-white">
                            {otherUser?.username ?? "Usuario"}
                          </p>
                          <p className="mt-1 text-sm text-white/70">
                            Te envió una solicitud de amistad.
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleRespond(row.id, "accepted")}
                            disabled={respondingId === row.id}
                            className="rounded-xl bg-green-500 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-green-600 disabled:opacity-60"
                          >
                            Aceptar
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRespond(row.id, "rejected")}
                            disabled={respondingId === row.id}
                            className="rounded-xl bg-red-500 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-red-600 disabled:opacity-60"
                          >
                            Rechazar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-pink-300">
              Solicitudes enviadas
            </p>
            <h3 className="mt-2 text-2xl font-black text-white">
              Esperando respuesta
            </h3>

            <div className="mt-5 space-y-3">
              {sentRequests.length === 0 ? (
                <div className="rounded-2xl bg-black/20 px-4 py-4 text-sm text-white/70">
                  No has enviado solicitudes todavía.
                </div>
              ) : (
                sentRequests.map((row) => {
                  const otherUser = getOtherUser(row);

                  return (
                    <div
                      key={row.id}
                      className="rounded-2xl border border-white/10 bg-black/20 p-4"
                    >
                      <p className="text-lg font-black text-white">
                        {otherUser?.username ?? "Usuario"}
                      </p>
                      <p className="mt-1 text-sm text-white/70">
                        Solicitud enviada. Estado: pendiente.
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-green-300">
              Mis amigos
            </p>
            <h3 className="mt-2 text-2xl font-black text-white">
              Lista de amistades aceptadas
            </h3>

            <div className="mt-5 space-y-3">
              {acceptedFriends.length === 0 ? (
                <div className="rounded-2xl bg-black/20 px-4 py-4 text-sm text-white/70">
                  Todavía no tienes amigos agregados.
                </div>
              ) : (
                acceptedFriends.map((row) => {
                  const otherUser = getOtherUser(row);

                  return (
                    <div
                      key={row.id}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 font-black text-slate-950">
                          {otherUser?.username?.slice(0, 1).toUpperCase() ?? "A"}
                        </div>
                        <div>
                          <p className="text-lg font-black text-white">
                            {otherUser?.username ?? "Usuario"}
                          </p>
                          <p className="text-sm text-white/65">
                            Amigo agregado
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white/85 transition hover:bg-white/15"
                      >
                        Perfil
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}