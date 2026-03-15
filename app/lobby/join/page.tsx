"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

type PublicLobbyRow = {
  id: string;
  room_code: string | null;
  status: "waiting" | "in_game" | "finished" | "closed";
  created_at: string;
  host_id: string;
  host_username: string | null;
  player_count: number;
  game_mode: string;
};

function getGameModeLabel(gameMode: string | null | undefined) {
  switch (gameMode) {
    case "classic_expedition":
      return "Expedición clásica";
    default:
      return "Expedición clásica";
  }
}

export default function JoinLobbyPage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [publicLobbies, setPublicLobbies] = useState<PublicLobbyRow[]>([]);
  const [serverError, setServerError] = useState("");

  const loadPublicLobbies = async () => {
    const { data, error } = await supabase.rpc("list_public_lobbies");

    if (error) {
      setServerError("No se pudieron cargar las partidas públicas.");
      return;
    }

    setPublicLobbies((data ?? []) as PublicLobbyRow[]);
  };

  useEffect(() => {
    const initializePage = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/login");
        return;
      }

      const userId = session.user.id;

      const { data: activeMembership, error: membershipError } = await supabase
        .from("lobby_players")
        .select("lobby_id, lobbies!inner(status)")
        .eq("user_id", userId)
        .in("lobbies.status", ["waiting", "in_game"])
        .maybeSingle();

      if (membershipError) {
        setServerError("No se pudo validar tu estado actual de lobby.");
        setPageLoading(false);
        return;
      }

      if (activeMembership?.lobby_id) {
        router.replace(`/lobby/${activeMembership.lobby_id}`);
        return;
      }

      await loadPublicLobbies();
      setPageLoading(false);
    };

    initializePage();

    const channel = supabase
      .channel("public-lobbies-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lobbies",
        },
        async () => {
          await loadPublicLobbies();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lobby_players",
        },
        async () => {
          await loadPublicLobbies();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  const handleJoinLobbyByCode = async () => {
    setServerError("");
    setLoading(true);

    const normalizedCode = roomCode.trim().toUpperCase();

    if (!normalizedCode) {
      setServerError("Debes ingresar un código de sala.");
      setLoading(false);
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setServerError("Debes iniciar sesión para unirte a una sala.");
      setLoading(false);
      return;
    }

    const userId = session.user.id;

    const { data: existingMembership, error: membershipError } = await supabase
      .from("lobby_players")
      .select("id, lobby_id, lobbies!inner(status)")
      .eq("user_id", userId)
      .in("lobbies.status", ["waiting", "in_game"])
      .maybeSingle();

    if (membershipError) {
      setServerError("No se pudo validar si ya perteneces a una sala.");
      setLoading(false);
      return;
    }

    if (existingMembership) {
      setServerError(
        "Ya perteneces a una sala activa. Debes salir de ella primero."
      );
      setLoading(false);
      return;
    }

    const { data: lobbyData, error: lobbyError } = await supabase
      .from("lobbies")
      .select("id, room_code, type, status, game_mode")
      .eq("room_code", normalizedCode)
      .eq("type", "private")
      .maybeSingle();

    if (lobbyError) {
      setServerError(lobbyError.message);
      setLoading(false);
      return;
    }

    if (!lobbyData) {
      setServerError("No existe una sala privada con ese código.");
      setLoading(false);
      return;
    }

    if (lobbyData.status !== "waiting") {
      setServerError("La sala privada ya no está disponible para unirse.");
      setLoading(false);
      await loadPublicLobbies();
      return;
    }

    const { data: joinedLobbyId, error: joinError } = await supabase.rpc(
      "join_lobby_safely",
      { target_lobby_id: lobbyData.id }
    );

    if (joinError) {
      setServerError(joinError.message);
      setLoading(false);
      return;
    }

    router.push(`/lobby/${joinedLobbyId}`);
  };

  const handleJoinPublicLobby = async (lobbyId: string) => {
    setServerError("");
    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setServerError("Debes iniciar sesión para unirte a una sala.");
      setLoading(false);
      return;
    }

    const userId = session.user.id;

    const { data: existingMembership, error: membershipError } = await supabase
      .from("lobby_players")
      .select("id, lobby_id, lobbies!inner(status)")
      .eq("user_id", userId)
      .in("lobbies.status", ["waiting", "in_game"])
      .maybeSingle();

    if (membershipError) {
      setServerError("No se pudo validar si ya perteneces a una sala.");
      setLoading(false);
      return;
    }

    if (existingMembership) {
      setServerError(
        "Ya perteneces a una sala activa. Debes salir de ella primero."
      );
      setLoading(false);
      return;
    }

    const { data: lobbyData, error: lobbyError } = await supabase
      .from("lobbies")
      .select("id, type, status, game_mode")
      .eq("id", lobbyId)
      .maybeSingle();

    if (lobbyError) {
      setServerError(lobbyError.message);
      setLoading(false);
      return;
    }

    if (!lobbyData) {
      setServerError("La sala seleccionada ya no existe.");
      setLoading(false);
      await loadPublicLobbies();
      return;
    }

    if (lobbyData.type !== "public") {
      setServerError("Solo puedes unirte aquí a partidas públicas.");
      setLoading(false);
      return;
    }

    if (lobbyData.status !== "waiting") {
      setServerError("La sala ya no está disponible para unirse.");
      setLoading(false);
      await loadPublicLobbies();
      return;
    }

    const { data: joinedLobbyId, error: joinError } = await supabase.rpc(
      "join_lobby_safely",
      { target_lobby_id: lobbyData.id }
    );

    if (joinError) {
      setServerError(joinError.message);
      setLoading(false);
      return;
    }

    router.push(`/lobby/${joinedLobbyId}`);
  };

  if (pageLoading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#0E1B1D_0%,#091114_42%,#040708_100%)] px-4">
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,rgba(205,255,245,0.8)_1px,transparent_1px),linear-gradient(to_bottom,rgba(205,255,245,0.8)_1px,transparent_1px)] [background-size:40px_40px]" />
        <div className="absolute left-[12%] top-[14%] h-36 w-36 rounded-full bg-[#4FE0C4]/12 blur-3xl" />
        <div className="absolute right-[10%] top-[16%] h-40 w-40 rounded-full bg-[#6CC3FF]/12 blur-3xl" />
        <div className="absolute bottom-[10%] right-[18%] h-32 w-32 rounded-full bg-[#A1FF7A]/10 blur-3xl" />

        <div className="relative flex min-h-screen items-center justify-center">
          <div className="rounded-[32px] border border-[#D6FFF5]/10 bg-[#071012]/88 px-8 py-7 text-center shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-md">
            <p className="text-xs font-black uppercase tracking-[0.34em] text-[#8EF6E2]">
              Portal de exploración
            </p>
            <p className="mt-3 text-lg font-bold text-[#E9FFF9]">
              Buscando expediciones activas...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#102327_0%,#091317_38%,#040708_100%)] text-[#EAFFFB]">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(79,224,196,0.07),transparent_24%,transparent_80%,rgba(108,195,255,0.06))]" />
      <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,rgba(214,255,245,0.8)_1px,transparent_1px),linear-gradient(to_bottom,rgba(214,255,245,0.8)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(79,224,196,0.14),transparent_18%),radial-gradient(circle_at_86%_16%,rgba(108,195,255,0.14),transparent_18%),radial-gradient(circle_at_22%_84%,rgba(161,255,122,0.10),transparent_18%)]" />

      <div className="pointer-events-none absolute left-[8%] top-[12%] h-40 w-40 rounded-full bg-[#4FE0C4]/12 blur-3xl" />
      <div className="pointer-events-none absolute right-[10%] top-[14%] h-44 w-44 rounded-full bg-[#6CC3FF]/12 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[10%] left-[20%] h-36 w-36 rounded-full bg-[#A1FF7A]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[38px] border border-[#D6FFF5]/10 bg-[linear-gradient(180deg,rgba(13,27,31,0.96),rgba(7,14,16,0.98))] shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
          <div className="border-b border-[#D6FFF5]/10 bg-[linear-gradient(90deg,rgba(79,224,196,0.16),rgba(108,195,255,0.10),rgba(161,255,122,0.06))] px-6 py-5">
            <p className="text-[11px] font-black uppercase tracking-[0.36em] text-[#8EF6E2]">
              Cámara de exploración
            </p>
          </div>

          <div className="grid gap-6 p-6 xl:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-[32px] border border-[#D6FFF5]/10 bg-[linear-gradient(180deg,rgba(12,24,27,0.98),rgba(7,13,15,0.98))] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.24)]">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#A7FFF0]">
                Acceso secreto
              </p>

              <h1 className="mt-3 text-4xl font-black leading-tight text-[#F2FFFC] sm:text-5xl">
                Unirse a una
                <span className="bg-[linear-gradient(135deg,#A1FF7A_0%,#4FE0C4_45%,#6CC3FF_100%)] bg-clip-text text-transparent">
                  {" "}
                  partida
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-base leading-7 text-[#CBE8E1]/82">
                Entra por código a una sala privada o explora expediciones públicas
                disponibles en tiempo real dentro del campamento.
              </p>

              <div className="mt-6 rounded-[28px] border border-[#D6FFF5]/10 bg-[linear-gradient(135deg,rgba(79,224,196,0.10),rgba(8,16,18,0.98))] p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#8EF6E2]">
                  Unirse con código
                </p>

                <div className="mt-4">
                  <label className="mb-2 block text-sm font-bold text-[#E7FFFB]">
                    Código de sala
                  </label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="ABC123"
                    className="w-full rounded-[18px] border border-[#D6FFF5]/12 bg-[#081214] px-4 py-3 text-base font-bold uppercase tracking-[0.16em] text-[#F1FFFC] outline-none placeholder:text-[#9DCAC2]/45 focus:border-[#4FE0C4]/30"
                  />
                </div>

                <p className="mt-3 text-sm leading-6 text-[#CBE8E1]/74">
                  Usa el código que te comparta el anfitrión para entrar directo a
                  una expedición privada.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleJoinLobbyByCode}
                    disabled={loading}
                    className="rounded-[20px] bg-[linear-gradient(135deg,#A1FF7A_0%,#4FE0C4_45%,#6CC3FF_100%)] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#071214] shadow-[0_16px_34px_rgba(79,224,196,0.18)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Entrando..." : "Unirse por código"}
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push("/home")}
                    className="rounded-[20px] border border-[#D6FFF5]/10 bg-[#081214] px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-[#E7FFFB] transition hover:bg-[#0D171A]"
                  >
                    Volver
                  </button>
                </div>
              </div>

              {serverError && (
                <div className="mt-5 rounded-[22px] border border-[#6CC3FF]/18 bg-[#0C1B22] px-4 py-4 text-sm text-[#D6F2FF]">
                  {serverError}
                </div>
              )}
            </section>

            <section className="rounded-[32px] border border-[#D6FFF5]/10 bg-[linear-gradient(180deg,rgba(10,20,23,0.98),rgba(6,11,13,0.98))] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.24)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#A7FFF0]">
                    Expediciones abiertas
                  </p>
                  <h2 className="mt-2 text-3xl font-black text-[#F2FFFC]">
                    Partidas públicas
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#CBE8E1]/78">
                    Estas salas están disponibles para unirte ahora mismo.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadPublicLobbies}
                  className="rounded-[18px] border border-[#4FE0C4]/16 bg-[#4FE0C4]/10 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-[#A7FFF0] transition hover:bg-[#4FE0C4]/16"
                >
                  Actualizar
                </button>
              </div>

              {publicLobbies.length === 0 ? (
                <div className="mt-5 rounded-[24px] border border-[#D6FFF5]/10 bg-[#081214] px-5 py-5">
                  <p className="text-lg font-black text-[#F2FFFC]">
                    No hay expediciones abiertas
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#CBE8E1]/74">
                    En este momento no hay partidas públicas disponibles. Puedes
                    volver a revisar en unos segundos o crear una nueva desde el
                    campamento.
                  </p>
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  {publicLobbies.map((lobby) => (
                    <div
                      key={lobby.id}
                      className="rounded-[26px] border border-[#D6FFF5]/10 bg-[linear-gradient(135deg,rgba(108,195,255,0.08),rgba(8,18,20,0.98))] p-5 shadow-[0_14px_28px_rgba(0,0,0,0.18)]"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-[#4FE0C4]/16 bg-[#4FE0C4]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#A7FFF0]">
                              Pública
                            </span>
                            <span className="rounded-full border border-[#A1FF7A]/16 bg-[#A1FF7A]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#D9FFC6]">
                              {lobby.player_count ?? 0}/6 jugadores
                            </span>
                            <span className="rounded-full border border-[#6CC3FF]/16 bg-[#6CC3FF]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#D6F2FF]">
                              {getGameModeLabel(lobby.game_mode)}
                            </span>
                          </div>

                          <h3 className="mt-3 text-2xl font-black text-[#F2FFFC]">
                            Sala de {lobby.host_username ?? "Sin username"}
                          </h3>

                          <div className="mt-3 grid gap-2 text-sm text-[#CBE8E1]/76 sm:grid-cols-2">
                            <p>
                              <span className="font-bold text-[#E9FFFB]">Estado:</span>{" "}
                              {lobby.status}
                            </p>
                            <p>
                              <span className="font-bold text-[#E9FFFB]">Creada:</span>{" "}
                              {new Date(lobby.created_at).toLocaleString()}
                            </p>
                            <p>
                              <span className="font-bold text-[#E9FFFB]">Modo:</span>{" "}
                              {getGameModeLabel(lobby.game_mode)}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0">
                          <button
                            type="button"
                            onClick={() => handleJoinPublicLobby(lobby.id)}
                            disabled={loading}
                            className="rounded-[20px] bg-[linear-gradient(135deg,#A1FF7A_0%,#4FE0C4_45%,#6CC3FF_100%)] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#071214] shadow-[0_16px_34px_rgba(79,224,196,0.18)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {loading ? "Entrando..." : "Unirse"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}