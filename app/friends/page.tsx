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
      new Set(rows.flatMap((row) => [row.requester_id, row.addressee_id, userId]))
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
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,#2B241B_0%,#17120E_42%,#080706_100%)] px-4">
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,rgba(255,244,214,0.8)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,244,214,0.8)_1px,transparent_1px)] [background-size:36px_36px]" />
        <div className="pointer-events-none absolute left-[12%] top-[14%] h-28 w-28 rounded-full bg-[#86B64B]/10 blur-3xl" />
        <div className="pointer-events-none absolute right-[12%] top-[18%] h-40 w-40 rounded-full bg-[#D9B45B]/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[14%] left-[20%] h-28 w-28 rounded-full bg-[#C9773B]/10 blur-3xl" />

        <div className="rounded-[34px] border border-[#E6D1A5]/10 bg-[#17110E]/90 px-8 py-7 text-center shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <p className="text-xs font-black uppercase tracking-[0.34em] text-[#D9B45B]">
            Sala de alianzas
          </p>
          <p className="mt-3 text-lg font-bold text-[#F7F0DC]">
            Cargando sección de amigos...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#31251B_0%,#19130E_34%,#0D0A08_68%,#060505_100%)] text-[#F7F0DC]">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(201,119,59,0.06),transparent_18%,transparent_82%,rgba(134,182,75,0.05))]" />
      <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,rgba(255,244,214,0.75)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,244,214,0.75)_1px,transparent_1px)] [background-size:38px_38px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(134,182,75,0.16),transparent_18%),radial-gradient(circle_at_84%_14%,rgba(217,180,91,0.12),transparent_18%),radial-gradient(circle_at_18%_82%,rgba(79,195,161,0.08),transparent_16%),radial-gradient(circle_at_86%_80%,rgba(201,119,59,0.10),transparent_18%)]" />

      <div className="pointer-events-none absolute left-[6%] top-[8%] h-32 w-32 rounded-full bg-[#86B64B]/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[10%] top-[12%] h-40 w-40 rounded-full bg-[#D9B45B]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[12%] left-[10%] h-32 w-32 rounded-full bg-[#4FC3A1]/8 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[8%] right-[14%] h-32 w-32 rounded-full bg-[#C9773B]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 overflow-hidden rounded-[32px] border border-[#E6D1A5]/10 bg-[linear-gradient(180deg,rgba(34,26,20,0.96),rgba(18,14,11,0.96))] shadow-[0_20px_70px_rgba(0,0,0,0.4)]">
          <div className="border-b border-[#E6D1A5]/8 bg-[linear-gradient(90deg,rgba(134,182,75,0.10),rgba(217,180,91,0.06),rgba(79,195,161,0.06))] px-5 py-3">
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[#D9B45B]">
              Gremio social del campamento
            </p>
          </div>

          <div className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="pointer-events-none absolute inset-0 rounded-[24px] bg-[#86B64B]/10 blur-xl" />
                <div className="relative rounded-[24px] border border-[#E6D1A5]/12 bg-[#120E0C] p-2 shadow-[0_10px_24px_rgba(0,0,0,0.35)]">
                  <Image
                    src="/logo/logopgw.png"
                    alt="Poorty Goblin Web"
                    width={120}
                    height={120}
                    className="h-14 w-14 rounded-[18px] object-cover"
                    priority
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.35em] text-[#D8F1AA]">
                  Sala de alianzas
                </p>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-[#FFF5E3]">
                  Amigos
                </h1>
              </div>
            </div>

            <Link
              href="/home"
              className="rounded-[20px] border border-[#E6D1A5]/10 bg-[#1D1612] px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-[#F4E8D1] transition hover:border-[#D9B45B]/20 hover:bg-[#2A1E18]"
            >
              Volver al inicio
            </Link>
          </div>
        </header>

        {(pageError || actionMessage) && (
          <div className="mb-6 space-y-3">
            {pageError && (
              <div className="rounded-[24px] border border-[#C9773B]/18 bg-[#C9773B]/10 px-4 py-3 text-sm text-[#FFD7B8] shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
                {pageError}
              </div>
            )}

            {actionMessage && (
              <div className="rounded-[24px] border border-[#86B64B]/18 bg-[#86B64B]/10 px-4 py-3 text-sm text-[#E2F5BE] shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
                {actionMessage}
              </div>
            )}
          </div>
        )}

        <section className="mb-6 overflow-hidden rounded-[32px] border border-[#E6D1A5]/10 bg-[linear-gradient(180deg,rgba(42,31,23,0.96),rgba(24,18,14,0.96))] shadow-[0_22px_70px_rgba(0,0,0,0.38)]">
          <div className="border-b border-[#E6D1A5]/8 bg-[linear-gradient(135deg,rgba(134,182,75,0.12),rgba(217,180,91,0.08),rgba(79,195,161,0.05))] px-6 py-5">
            <p className="text-sm font-black uppercase tracking-[0.35em] text-[#F4D89C]">
              Red social de jugadores
            </p>
            <h2 className="mt-3 text-4xl font-black leading-tight text-[#FFF5E3]">
              Gestiona tus amistades dentro de Poorty Goblin Web
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[#E3D3B5]/84">
              Envía solicitudes, revisa quién quiere agregarte y consulta tu lista
              de amigos actuales desde un solo lugar.
            </p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="overflow-hidden rounded-[30px] border border-[#E6D1A5]/10 bg-[linear-gradient(180deg,rgba(38,29,22,0.96),rgba(22,17,13,0.96))] shadow-[0_22px_70px_rgba(0,0,0,0.38)]">
            <div className="border-b border-[#E6D1A5]/8 bg-[linear-gradient(90deg,rgba(134,182,75,0.10),rgba(217,180,91,0.05))] px-6 py-4">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#D8F1AA]">
                Enviar solicitud
              </p>
              <h3 className="mt-2 text-2xl font-black text-[#FFF2DF]">
                Buscar jugador por username
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#D9C8A8]/78">
                Escribe el nombre de usuario exacto del jugador al que quieres agregar.
              </p>
            </div>

            <div className="p-6">
              <div className="mt-1 flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={searchUsername}
                  onChange={(event) => setSearchUsername(event.target.value)}
                  placeholder="Ejemplo: santi9007"
                  className="w-full rounded-[22px] border border-[#E6D1A5]/10 bg-[#17110E] px-4 py-3 text-[#FFF2DF] outline-none transition placeholder:text-[#BFAF91] focus:border-[#86B64B]/40 focus:shadow-[0_0_0_4px_rgba(134,182,75,0.10)]"
                />

                <button
                  type="button"
                  onClick={handleSendFriendRequest}
                  disabled={searchLoading}
                  className="rounded-[22px] border border-[#E6D1A5]/10 bg-[linear-gradient(135deg,#86B64B_0%,#D9B45B_55%,#C9773B_100%)] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#1A140F] shadow-[0_12px_28px_rgba(0,0,0,0.28)] transition hover:scale-[1.01] disabled:opacity-60"
                >
                  {searchLoading ? "Enviando..." : "Enviar"}
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[30px] border border-[#E6D1A5]/10 bg-[linear-gradient(180deg,rgba(38,29,22,0.96),rgba(22,17,13,0.96))] shadow-[0_22px_70px_rgba(0,0,0,0.38)]">
            <div className="border-b border-[#E6D1A5]/8 bg-[linear-gradient(90deg,rgba(217,180,91,0.10),rgba(201,119,59,0.05))] px-6 py-4">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#F4D89C]">
                Solicitudes recibidas
              </p>
              <h3 className="mt-2 text-2xl font-black text-[#FFF2DF]">
                Pendientes de respuesta
              </h3>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                {receivedRequests.length === 0 ? (
                  <div className="rounded-[22px] border border-[#E6D1A5]/8 bg-[#17110E] px-4 py-4 text-sm text-[#D9C8A8]/74">
                    No tienes solicitudes pendientes.
                  </div>
                ) : (
                  receivedRequests.map((row) => {
                    const otherUser = getOtherUser(row);

                    return (
                      <div
                        key={row.id}
                        className="rounded-[22px] border border-[#E6D1A5]/8 bg-[#17110E] p-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-lg font-black text-[#FFF2DF]">
                              {otherUser?.username ?? "Usuario"}
                            </p>
                            <p className="mt-1 text-sm text-[#D9C8A8]/70">
                              Te envió una solicitud de amistad.
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleRespond(row.id, "accepted")}
                              disabled={respondingId === row.id}
                              className="rounded-[16px] border border-[#86B64B]/18 bg-[#86B64B]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#E2F5BE] transition hover:bg-[#86B64B]/18 disabled:opacity-60"
                            >
                              Aceptar
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRespond(row.id, "rejected")}
                              disabled={respondingId === row.id}
                              className="rounded-[16px] border border-[#C9773B]/18 bg-[#C9773B]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#FFD7B8] transition hover:bg-[#C9773B]/18 disabled:opacity-60"
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
          </div>

          <div className="overflow-hidden rounded-[30px] border border-[#E6D1A5]/10 bg-[linear-gradient(180deg,rgba(38,29,22,0.96),rgba(22,17,13,0.96))] shadow-[0_22px_70px_rgba(0,0,0,0.38)]">
            <div className="border-b border-[#E6D1A5]/8 bg-[linear-gradient(90deg,rgba(201,119,59,0.10),rgba(217,180,91,0.05))] px-6 py-4">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FFD0A8]">
                Solicitudes enviadas
              </p>
              <h3 className="mt-2 text-2xl font-black text-[#FFF2DF]">
                Esperando respuesta
              </h3>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                {sentRequests.length === 0 ? (
                  <div className="rounded-[22px] border border-[#E6D1A5]/8 bg-[#17110E] px-4 py-4 text-sm text-[#D9C8A8]/74">
                    No has enviado solicitudes todavía.
                  </div>
                ) : (
                  sentRequests.map((row) => {
                    const otherUser = getOtherUser(row);

                    return (
                      <div
                        key={row.id}
                        className="rounded-[22px] border border-[#E6D1A5]/8 bg-[#17110E] p-4"
                      >
                        <p className="text-lg font-black text-[#FFF2DF]">
                          {otherUser?.username ?? "Usuario"}
                        </p>
                        <p className="mt-1 text-sm text-[#D9C8A8]/70">
                          Solicitud enviada. Estado: pendiente.
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[30px] border border-[#E6D1A5]/10 bg-[linear-gradient(180deg,rgba(38,29,22,0.96),rgba(22,17,13,0.96))] shadow-[0_22px_70px_rgba(0,0,0,0.38)]">
            <div className="border-b border-[#E6D1A5]/8 bg-[linear-gradient(90deg,rgba(79,195,161,0.10),rgba(134,182,75,0.05))] px-6 py-4">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#B6F4E0]">
                Mis amigos
              </p>
              <h3 className="mt-2 text-2xl font-black text-[#FFF2DF]">
                Lista de amistades aceptadas
              </h3>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                {acceptedFriends.length === 0 ? (
                  <div className="rounded-[22px] border border-[#E6D1A5]/8 bg-[#17110E] px-4 py-4 text-sm text-[#D9C8A8]/74">
                    Todavía no tienes amigos agregados.
                  </div>
                ) : (
                  acceptedFriends.map((row) => {
                    const otherUser = getOtherUser(row);

                    return (
                      <div
                        key={row.id}
                        className="flex items-center justify-between rounded-[22px] border border-[#E6D1A5]/8 bg-[#17110E] p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#86B64B_0%,#D9B45B_55%,#4FC3A1_100%)] font-black text-[#1A140F] shadow-[0_10px_22px_rgba(0,0,0,0.24)]">
                            {otherUser?.username?.slice(0, 1).toUpperCase() ?? "A"}
                          </div>
                          <div>
                            <p className="text-lg font-black text-[#FFF2DF]">
                              {otherUser?.username ?? "Usuario"}
                            </p>
                            <p className="text-sm text-[#D9C8A8]/65">
                              Amigo agregado
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="rounded-[16px] border border-[#E6D1A5]/10 bg-[#211813] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#F2EAD1]/85 transition hover:bg-[#2B1F18]"
                        >
                          Perfil
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}