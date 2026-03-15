"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type LobbyData = {
  id: string;
  host_id: string;
  type: "public" | "private";
  room_code: string | null;
  status: "waiting" | "in_game" | "finished" | "closed";
  created_at: string;
  game_mode: string | null;
};

type LobbyPlayerRow = {
  id: string;
  user_id: string;
  is_host: boolean;
  joined_at: string;
  username: string | null;
  avatar_url: string | null;
};

type PublicProfileRow = {
  id: string;
  username: string | null;
  avatar_url: string | null;
};

const MAX_PLAYERS = 6;

function getLobbyTypeLabel(type: LobbyData["type"]) {
  return type === "public" ? "Pública" : "Privada";
}

function getLobbyTypeFlavor(type: LobbyData["type"]) {
  return type === "public" ? "Expedición abierta" : "Círculo sellado";
}

function getLobbyStatusLabel(status: LobbyData["status"]) {
  switch (status) {
    case "waiting":
      return "Esperando jugadores";
    case "in_game":
      return "En partida";
    case "finished":
      return "Finalizada";
    case "closed":
      return "Cerrada";
    default:
      return status;
  }
}

function getGameModeLabel(gameMode: string | null | undefined) {
  switch (gameMode) {
    case "classic_expedition":
      return "Expedición clásica";
    default:
      return "Expedición clásica";
  }
}

function formatLobbyDate(value: string | null | undefined) {
  if (!value) return "Fecha desconocida";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha desconocida";

  return date.toLocaleString("es-CR");
}

export default function LobbyDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [lobby, setLobby] = useState<LobbyData | null>(null);
  const [players, setPlayers] = useState<LobbyPlayerRow[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const lobbyId = params.id;

    if (!lobbyId || typeof lobbyId !== "string") {
      setServerError("ID de sala inválido.");
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadLobby = async (showLoading = false) => {
      if (showLoading && isMounted) {
        setLoading(true);
      }

      setServerError("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/");
        return;
      }

      const userId = session.user.id;

      if (isMounted) {
        setCurrentUserId(userId);
      }

      const { data: membership, error: membershipError } = await supabase
        .from("lobby_players")
        .select("id, is_host")
        .eq("lobby_id", lobbyId)
        .eq("user_id", userId)
        .maybeSingle();

      if (membershipError) {
        if (isMounted) {
          setServerError("No se pudo validar tu acceso a esta sala.");
          setLoading(false);
        }
        return;
      }

      if (!membership) {
        router.replace("/home");
        return;
      }

      const { data: lobbyData, error: lobbyError } = await supabase
        .from("lobbies")
        .select("id, host_id, type, room_code, status, created_at, game_mode")
        .eq("id", lobbyId)
        .maybeSingle();

      if (lobbyError) {
        if (isMounted) {
          setServerError(lobbyError.message);
          setLoading(false);
        }
        return;
      }

      if (!lobbyData) {
        if (isMounted) {
          setServerError("La sala no existe.");
          setLoading(false);
        }
        return;
      }

      const { data: playerData, error: playerError } = await supabase
        .from("lobby_players")
        .select("id, user_id, is_host, joined_at")
        .eq("lobby_id", lobbyId)
        .order("joined_at", { ascending: true });

      if (playerError) {
        if (isMounted) {
          setServerError(playerError.message);
          setLoading(false);
        }
        return;
      }

      const userIds = (playerData ?? []).map((player) => player.user_id);

      const { data: profileData, error: profileError } = await supabase.rpc(
        "get_public_profiles",
        { profile_ids: userIds }
      );

      if (profileError) {
        if (isMounted) {
          setServerError(profileError.message);
          setLoading(false);
        }
        return;
      }

      const publicProfiles = (profileData ?? []) as PublicProfileRow[];

      const profilesMap = new Map(
        publicProfiles.map((profile) => [profile.id, profile])
      );

      const mergedPlayers: LobbyPlayerRow[] = (playerData ?? []).map((player) => {
        const profile = profilesMap.get(player.user_id);

        return {
          id: player.id,
          user_id: player.user_id,
          is_host: player.is_host,
          joined_at: player.joined_at,
          username: profile?.username ?? null,
          avatar_url: profile?.avatar_url ?? null,
        };
      });

      if (isMounted) {
        setLobby(lobbyData as LobbyData);
        setPlayers(mergedPlayers);
        setLoading(false);
      }
    };

    loadLobby(true);

    const channel = supabase
      .channel(`lobby-detail-${lobbyId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lobbies",
          filter: `id=eq.${lobbyId}`,
        },
        async () => {
          await loadLobby(false);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lobby_players",
          filter: `lobby_id=eq.${lobbyId}`,
        },
        async () => {
          await loadLobby(false);
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [params.id, router]);

  useEffect(() => {
    if (lobby?.status === "in_game" && lobby.id) {
      router.replace(`/game/${lobby.id}`);
    }
  }, [lobby?.status, lobby?.id, router]);

  const currentPlayer = useMemo(
    () => players.find((player) => player.user_id === currentUserId),
    [players, currentUserId]
  );

  const hostPlayer = useMemo(
    () => players.find((player) => player.is_host),
    [players]
  );

  const isHost = currentPlayer?.is_host ?? false;
  const fatalError = !loading && !lobby && !!serverError;
  const playerCount = players.length;

  const handleLeaveLobby = async () => {
    if (!currentUserId || !lobby) return;

    setServerError("");
    setActionLoading(true);

    const { error } = await supabase
      .from("lobby_players")
      .delete()
      .eq("lobby_id", lobby.id)
      .eq("user_id", currentUserId);

    if (error) {
      setServerError(error.message);
      setActionLoading(false);
      return;
    }

    router.push("/home");
  };

  const handleStartGame = async () => {
    if (!lobby) return;

    setServerError("");

    if (!isHost) {
      setServerError("Solo el host puede iniciar la partida.");
      return;
    }

    setActionLoading(true);

    const { error } = await supabase.rpc("start_match_from_lobby", {
      target_lobby_id: lobby.id,
    });

    if (error) {
      setServerError(error.message);
      setActionLoading(false);
      return;
    }

    router.replace(`/game/${lobby.id}`);
  };

  const handleCloseLobby = async () => {
    if (!lobby) return;

    setServerError("");
    setActionLoading(true);

    const { error: lobbyError } = await supabase
      .from("lobbies")
      .update({ status: "closed" })
      .eq("id", lobby.id);

    if (lobbyError) {
      setServerError(lobbyError.message);
      setActionLoading(false);
      return;
    }

    const { error: playersError } = await supabase
      .from("lobby_players")
      .delete()
      .eq("lobby_id", lobby.id);

    if (playersError) {
      setServerError(playersError.message);
      setActionLoading(false);
      return;
    }

    router.push("/home");
  };

  const handleCopyRoomCode = async () => {
    if (!lobby?.room_code) return;

    try {
      await navigator.clipboard.writeText(lobby.room_code);
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 1800);
    } catch {
      setServerError("No se pudo copiar el código de sala.");
    }
  };

  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#221028_0%,#120818_42%,#060409_100%)] px-4">
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,rgba(240,222,255,0.8)_1px,transparent_1px),linear-gradient(to_bottom,rgba(240,222,255,0.8)_1px,transparent_1px)] [background-size:40px_40px]" />
        <div className="absolute left-[10%] top-[12%] h-36 w-36 rounded-full bg-[#B06CFF]/12 blur-3xl" />
        <div className="absolute right-[12%] top-[16%] h-40 w-40 rounded-full bg-[#4FE0A7]/10 blur-3xl" />
        <div className="absolute bottom-[12%] left-[24%] h-32 w-32 rounded-full bg-[#6D5CFF]/10 blur-3xl" />

        <div className="relative flex min-h-screen items-center justify-center">
          <div className="rounded-[32px] border border-[#E9D7FF]/10 bg-[#120916]/88 px-8 py-7 text-center shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-md">
            <p className="text-xs font-black uppercase tracking-[0.34em] text-[#C9A8FF]">
              Cámara de espera
            </p>
            <p className="mt-3 text-lg font-bold text-[#FAF4FF]">
              Reuniendo a la tribu en la sala...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (fatalError) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#221028_0%,#120818_42%,#060409_100%)] px-4">
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,rgba(240,222,255,0.8)_1px,transparent_1px),linear-gradient(to_bottom,rgba(240,222,255,0.8)_1px,transparent_1px)] [background-size:40px_40px]" />
        <div className="relative flex min-h-screen items-center justify-center">
          <div className="w-full max-w-2xl rounded-[34px] border border-[#E9D7FF]/10 bg-[#120916]/92 p-8 shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
            <p className="text-[11px] font-black uppercase tracking-[0.34em] text-[#C9A8FF]">
              Sala inaccesible
            </p>
            <h1 className="mt-3 text-3xl font-black text-[#FAF4FF]">
              No pudimos abrir esta cámara
            </h1>
            <p className="mt-5 rounded-[20px] border border-[#FF8AA8]/14 bg-[#31111B] px-4 py-4 text-sm text-[#FFD5DF]">
              {serverError}
            </p>

            <button
              type="button"
              onClick={() => router.push("/home")}
              className="mt-6 rounded-[20px] border border-[#E9D7FF]/10 bg-[#1A0D20] px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-[#F2E9FF] transition hover:bg-[#23112B]"
            >
              Volver al campamento
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#23102B_0%,#13091A_38%,#060409_100%)] text-[#F8F2FF]">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(176,108,255,0.08),transparent_24%,transparent_76%,rgba(79,224,167,0.05))]" />
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,rgba(240,222,255,0.85)_1px,transparent_1px),linear-gradient(to_bottom,rgba(240,222,255,0.85)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(176,108,255,0.15),transparent_18%),radial-gradient(circle_at_86%_16%,rgba(79,224,167,0.10),transparent_18%),radial-gradient(circle_at_20%_84%,rgba(109,92,255,0.12),transparent_18%)]" />

      <div className="pointer-events-none absolute left-[8%] top-[14%] h-40 w-40 rounded-full bg-[#B06CFF]/12 blur-3xl" />
      <div className="pointer-events-none absolute right-[10%] top-[16%] h-44 w-44 rounded-full bg-[#4FE0A7]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[10%] left-[20%] h-36 w-36 rounded-full bg-[#6D5CFF]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[38px] border border-[#E9D7FF]/10 bg-[linear-gradient(180deg,rgba(24,11,30,0.96),rgba(12,7,16,0.98))] shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
          <div className="border-b border-[#E9D7FF]/10 bg-[linear-gradient(90deg,rgba(176,108,255,0.18),rgba(109,92,255,0.10),rgba(79,224,167,0.06))] px-6 py-5">
            <p className="text-[11px] font-black uppercase tracking-[0.36em] text-[#C9A8FF]">
              Sala de espera ritual
            </p>
          </div>

          <div className="grid gap-6 p-6 xl:grid-cols-[1.02fr_0.98fr]">
            <section className="space-y-6">
              <div className="overflow-hidden rounded-[34px] border border-[#E9D7FF]/10 bg-[linear-gradient(135deg,rgba(44,18,56,0.98),rgba(17,10,24,0.98))] shadow-[0_20px_48px_rgba(0,0,0,0.24)]">
                <div className="border-b border-[#E9D7FF]/10 bg-[linear-gradient(90deg,rgba(176,108,255,0.16),rgba(79,224,167,0.05))] px-6 py-5">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#D7C0FF]">
                    Cámara reunida
                  </p>
                </div>

                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[#B06CFF]/16 bg-[#B06CFF]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#DCC7FF]">
                      {lobby ? getLobbyTypeFlavor(lobby.type) : "Sala"}
                    </span>
                    <span className="rounded-full border border-[#4FE0A7]/16 bg-[#4FE0A7]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#C7FCE3]">
                      {lobby ? getGameModeLabel(lobby.game_mode) : "Expedición clásica"}
                    </span>
                    <span className="rounded-full border border-[#6D5CFF]/16 bg-[#6D5CFF]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#D6D0FF]">
                      {playerCount}/{MAX_PLAYERS} en sala
                    </span>
                  </div>

                  <h1 className="mt-4 text-4xl font-black leading-tight text-[#FBF7FF] sm:text-5xl">
                    {lobby ? getGameModeLabel(lobby.game_mode) : "Sala de espera"}
                  </h1>

                  <p className="mt-4 max-w-2xl text-base leading-7 text-[#DCCFEA]/82">
                    {isHost
                      ? "Tu tribu está reunida en la cámara ritual. Cuando todos estén listos, podrás iniciar la expedición."
                      : "Ya estás dentro de la cámara de espera. Aguarda a que el host prepare el inicio de la expedición."}
                  </p>

                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <div className="rounded-[24px] border border-[#E9D7FF]/10 bg-[#120916]/76 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#D7C0FF]">
                        Estado
                      </p>
                      <p className="mt-2 text-lg font-black text-[#FBF7FF]">
                        {lobby ? getLobbyStatusLabel(lobby.status) : "Desconocido"}
                      </p>
                    </div>

                    <div className="rounded-[24px] border border-[#E9D7FF]/10 bg-[#120916]/76 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#C7FCE3]">
                        Anfitrión
                      </p>
                      <p className="mt-2 text-lg font-black text-[#FBF7FF]">
                        {hostPlayer?.username ?? "Host"}
                      </p>
                    </div>

                    <div className="rounded-[24px] border border-[#E9D7FF]/10 bg-[#120916]/76 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#D6D0FF]">
                        Creada
                      </p>
                      <p className="mt-2 text-lg font-black text-[#FBF7FF]">
                        {lobby ? formatLobbyDate(lobby.created_at) : "Desconocida"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-[26px] border border-[#E9D7FF]/10 bg-[linear-gradient(135deg,rgba(109,92,255,0.10),rgba(18,9,22,0.96))] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#DCC7FF]">
                          Progreso de la sala
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[#DCCFEA]/76">
                          La expedición admite hasta {MAX_PLAYERS} jugadores en esta
                          etapa de espera.
                        </p>
                      </div>

                      <div className="rounded-[18px] border border-[#4FE0A7]/16 bg-[#4FE0A7]/10 px-4 py-3 text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#C7FCE3]">
                          Reunidos
                        </p>
                        <p className="mt-1 text-2xl font-black text-[#FBF7FF]">
                          {playerCount}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 h-3 rounded-full bg-[#1A0D21]">
                      <div
                        className="h-3 rounded-full bg-[linear-gradient(90deg,#B06CFF_0%,#6D5CFF_55%,#4FE0A7_100%)] transition-all duration-300"
                        style={{
                          width: `${Math.min((playerCount / MAX_PLAYERS) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {lobby?.room_code ? (
                <div className="overflow-hidden rounded-[32px] border border-[#E9D7FF]/10 bg-[linear-gradient(180deg,rgba(20,10,26,0.98),rgba(11,7,16,0.98))] shadow-[0_18px_45px_rgba(0,0,0,0.24)]">
                  <div className="border-b border-[#E9D7FF]/10 bg-[linear-gradient(90deg,rgba(79,224,167,0.12),rgba(176,108,255,0.08))] px-6 py-5">
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#C7FCE3]">
                      Sello de acceso privado
                    </p>
                  </div>

                  <div className="p-6">
                    <p className="text-sm leading-6 text-[#DCCFEA]/76">
                      Comparte este código con tu círculo para que entren a la misma
                      expedición.
                    </p>

                    <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="rounded-[24px] border border-[#E9D7FF]/10 bg-[#120916]/82 px-5 py-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#C7FCE3]">
                          Código
                        </p>
                        <p className="mt-2 text-4xl font-black tracking-[0.22em] text-[#FBF7FF]">
                          {lobby.room_code}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyRoomCode}
                        className="rounded-[20px] bg-[linear-gradient(135deg,#4FE0A7_0%,#7CF1C2_100%)] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#07140F] shadow-[0_14px_30px_rgba(79,224,167,0.18)] transition hover:scale-[1.01]"
                      >
                        {copiedCode ? "Copiado" : "Copiar código"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden rounded-[32px] border border-[#E9D7FF]/10 bg-[linear-gradient(180deg,rgba(20,10,26,0.98),rgba(11,7,16,0.98))] shadow-[0_18px_45px_rgba(0,0,0,0.24)]">
                  <div className="border-b border-[#E9D7FF]/10 bg-[linear-gradient(90deg,rgba(79,224,167,0.12),rgba(176,108,255,0.08))] px-6 py-5">
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#C7FCE3]">
                      Acceso de la sala
                    </p>
                  </div>

                  <div className="p-6">
                    <p className="text-lg font-black text-[#FBF7FF]">
                      Esta es una expedición pública
                    </p>
                    <p className="mt-3 text-sm leading-6 text-[#DCCFEA]/76">
                      Los jugadores pueden encontrarla desde la lista de partidas
                      públicas del campamento mientras siga en espera.
                    </p>
                  </div>
                </div>
              )}

              {serverError && lobby && (
                <div className="rounded-[24px] border border-[#FF9DB3]/14 bg-[#341520] px-5 py-4 text-sm text-[#FFD6DF]">
                  {serverError}
                </div>
              )}
            </section>

            <section className="space-y-6">
              <div className="overflow-hidden rounded-[34px] border border-[#E9D7FF]/10 bg-[linear-gradient(180deg,rgba(18,10,24,0.98),rgba(10,7,14,0.98))] shadow-[0_20px_48px_rgba(0,0,0,0.24)]">
                <div className="border-b border-[#E9D7FF]/10 bg-[linear-gradient(90deg,rgba(109,92,255,0.16),rgba(176,108,255,0.08))] px-6 py-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#D6D0FF]">
                        Tribu reunida
                      </p>
                      <h2 className="mt-2 text-3xl font-black text-[#FBF7FF]">
                        Jugadores en sala
                      </h2>
                    </div>

                    <div className="rounded-[18px] border border-[#B06CFF]/16 bg-[#B06CFF]/10 px-4 py-3 text-center">
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#DCC7FF]">
                        Total
                      </p>
                      <p className="mt-1 text-2xl font-black text-[#FBF7FF]">
                        {playerCount}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {players.length === 0 ? (
                    <div className="rounded-[24px] border border-[#E9D7FF]/10 bg-[#120916]/80 px-5 py-5">
                      <p className="text-lg font-black text-[#FBF7FF]">
                        La cámara está vacía
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#DCCFEA]/74">
                        Todavía no hay jugadores registrados en esta sala.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {players.map((player, index) => {
                        const isCurrent = player.user_id === currentUserId;
                        const playerInitial =
                          player.username?.slice(0, 1).toUpperCase() ?? "G";

                        return (
                          <div
                            key={player.id}
                            className={`rounded-[26px] border px-4 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.16)] transition ${
                              isCurrent
                                ? "border-[#4FE0A7]/18 bg-[linear-gradient(135deg,rgba(79,224,167,0.14),rgba(18,9,22,0.98))]"
                                : "border-[#E9D7FF]/10 bg-[linear-gradient(135deg,rgba(109,92,255,0.08),rgba(18,9,22,0.98))]"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`flex h-14 w-14 items-center justify-center rounded-[20px] text-xl font-black shadow-[0_10px_22px_rgba(0,0,0,0.22)] ${
                                  player.is_host
                                    ? "bg-[linear-gradient(135deg,#B06CFF_0%,#6D5CFF_100%)] text-white"
                                    : isCurrent
                                    ? "bg-[linear-gradient(135deg,#4FE0A7_0%,#7CF1C2_100%)] text-[#08140F]"
                                    : "bg-[linear-gradient(135deg,#2D1A36_0%,#4B2A5D_100%)] text-[#F7F0FF]"
                                }`}
                              >
                                {playerInitial}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="truncate text-lg font-black text-[#FBF7FF]">
                                    {player.username ?? "Sin username"}
                                  </p>

                                  {player.is_host && (
                                    <span className="rounded-full border border-[#B06CFF]/16 bg-[#B06CFF]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#DCC7FF]">
                                      Host
                                    </span>
                                  )}

                                  {isCurrent && (
                                    <span className="rounded-full border border-[#4FE0A7]/16 bg-[#4FE0A7]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#C7FCE3]">
                                      Tú
                                    </span>
                                  )}
                                </div>

                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#DCCFEA]/72">
                                  <p>
                                    <span className="font-bold text-[#EFE7FF]">Rol:</span>{" "}
                                    {player.is_host ? "Anfitrión" : "Jugador"}
                                  </p>
                                  <p>
                                    <span className="font-bold text-[#EFE7FF]">
                                      Entrada:
                                    </span>{" "}
                                    #{index + 1}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="overflow-hidden rounded-[34px] border border-[#E9D7FF]/10 bg-[linear-gradient(180deg,rgba(18,10,24,0.98),rgba(10,7,14,0.98))] shadow-[0_20px_48px_rgba(0,0,0,0.24)]">
                <div className="border-b border-[#E9D7FF]/10 bg-[linear-gradient(90deg,rgba(79,224,167,0.12),rgba(109,92,255,0.08))] px-6 py-5">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#C7FCE3]">
                    Control de expedición
                  </p>
                </div>

                <div className="p-6">
                  <p className="text-sm leading-6 text-[#DCCFEA]/76">
                    {isHost
                      ? "Tú controlas el inicio y el cierre de esta cámara. Cuando lo decidas, podrás lanzar la partida."
                      : "Mientras esperas, puedes quedarte en la sala o abandonar la expedición antes de que inicie."}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    {isHost && lobby?.status === "waiting" && (
                      <button
                        type="button"
                        onClick={handleStartGame}
                        disabled={actionLoading}
                        className="rounded-[20px] bg-[linear-gradient(135deg,#4FE0A7_0%,#7CF1C2_100%)] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#07140F] shadow-[0_14px_30px_rgba(79,224,167,0.18)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {actionLoading ? "Iniciando..." : "Iniciar partida"}
                      </button>
                    )}

                    {isHost ? (
                      <button
                        type="button"
                        onClick={handleCloseLobby}
                        disabled={actionLoading}
                        className="rounded-[20px] border border-[#FF9DB3]/16 bg-[#341520] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#FFD6DF] transition hover:bg-[#431A28] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {actionLoading ? "Cerrando..." : "Cerrar partida"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleLeaveLobby}
                        disabled={actionLoading}
                        className="rounded-[20px] border border-[#FF9DB3]/16 bg-[#341520] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#FFD6DF] transition hover:bg-[#431A28] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {actionLoading ? "Saliendo..." : "Salir del lobby"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}