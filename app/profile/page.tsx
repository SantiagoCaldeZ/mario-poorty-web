"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type OwnProfileRow = {
  id: string;
  username: string | null;
  created_at: string | null;
  avatar_url?: string | null;
};

type OwnStats = {
  matchesPlayed: number;
  matchesWon: number;
  winRate: number;
  friendsCount: number;
  unreadMessages: number;
};

type DmThreadRow = {
  thread_id: string;
  other_user_id: string;
  other_username: string | null;
  other_avatar_url: string | null;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
  unread_count: number;
};

export default function ProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [profile, setProfile] = useState<OwnProfileRow | null>(null);
  const [email, setEmail] = useState("");
  const [stats, setStats] = useState<OwnStats>({
    matchesPlayed: 0,
    matchesWon: 0,
    winRate: 0,
    friendsCount: 0,
    unreadMessages: 0,
  });
  const [recentThreads, setRecentThreads] = useState<DmThreadRow[]>([]);

  useEffect(() => {
    const loadProfile = async () => {
      setPageError("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/");
        return;
      }

      const userId = session.user.id;
      setEmail(session.user.email ?? "");

      const [
        { data: profileData, error: profileError },
        { count: matchesPlayedCount, error: matchesPlayedError },
        { count: matchesWonCount, error: matchesWonError },
        { count: friendsCountValue, error: friendsCountError },
        { data: dmData, error: dmError },
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, username, created_at, avatar_url")
          .eq("id", userId)
          .maybeSingle(),

        supabase
          .from("match_players")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId),

        supabase
          .from("matches")
          .select("*", { count: "exact", head: true })
          .eq("winner_user_id", userId),

        supabase
          .from("friendships")
          .select("*", { count: "exact", head: true })
          .eq("status", "accepted")
          .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`),

        supabase.rpc("list_my_dm_threads"),
      ]);

      if (profileError || !profileData) {
        setPageError(profileError?.message ?? "No se pudo cargar tu perfil.");
        setLoading(false);
        return;
      }

      if (matchesPlayedError || matchesWonError || friendsCountError) {
        setPageError("No se pudieron cargar tus estadísticas.");
        setLoading(false);
        return;
      }

      const threads = ((dmData ?? []) as DmThreadRow[]) ?? [];
      const unreadMessages = threads.reduce(
        (sum, thread) => sum + (thread.unread_count ?? 0),
        0
      );

      const matchesPlayed = matchesPlayedCount ?? 0;
      const matchesWon = matchesWonCount ?? 0;
      const friendsCount = friendsCountValue ?? 0;
      const winRate =
        matchesPlayed > 0 ? Math.round((matchesWon / matchesPlayed) * 100) : 0;

      if (dmError) {
        setRecentThreads([]);
      } else {
        setRecentThreads(threads.slice(0, 3));
      }

      setProfile(profileData as OwnProfileRow);
      setStats({
        matchesPlayed,
        matchesWon,
        winRate,
        friendsCount,
        unreadMessages,
      });
      setLoading(false);
    };

    loadProfile();
  }, [router]);

  const joinedLabel = useMemo(() => {
    if (!profile?.created_at) return "Miembro reciente";
    const date = new Date(profile.created_at);
    if (Number.isNaN(date.getTime())) return "Miembro reciente";

    return `Miembro desde ${date.toLocaleDateString("es-CR", {
      year: "numeric",
      month: "short",
    })}`;
  }, [profile?.created_at]);

  const username = profile?.username ?? "Jugador";
  const initial = username.slice(0, 1).toUpperCase();

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,#31251B_0%,#19130E_34%,#0D0A08_68%,#060505_100%)] px-4">
        <div className="rounded-[28px] border border-[#E6D1A5]/10 bg-[#17110E]/90 px-8 py-7 text-center shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <p className="text-xs font-black uppercase tracking-[0.34em] text-[#D9B45B]">
            Perfil del aventurero
          </p>
          <p className="mt-3 text-lg font-bold text-[#F7F0DC]">
            Cargando tu perfil...
          </p>
        </div>
      </main>
    );
  }

  if (pageError || !profile) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,#31251B_0%,#19130E_34%,#0D0A08_68%,#060505_100%)] px-4">
        <div className="w-full max-w-2xl rounded-[32px] border border-[#E6D1A5]/10 bg-[#17110E]/95 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <h1 className="text-2xl font-black text-[#FFF5E3]">Tu perfil</h1>

          <p className="mt-4 rounded-[20px] border border-[#C9773B]/18 bg-[#C9773B]/10 px-4 py-3 text-sm text-[#FFD7B8]">
            {pageError || "No se pudo cargar tu perfil."}
          </p>

          <div className="mt-6">
            <Link
              href="/home"
              className="rounded-[18px] border border-[#E6D1A5]/10 bg-[#211813] px-4 py-2 text-sm font-bold uppercase tracking-[0.12em] text-[#F2EAD1]/85 transition hover:bg-[#2B1F18]"
            >
              Volver al campamento
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#31251B_0%,#19130E_34%,#0D0A08_68%,#060505_100%)] text-[#F7F0DC]">
      <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,rgba(255,244,214,0.75)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,244,214,0.75)_1px,transparent_1px)] [background-size:38px_38px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(134,182,75,0.16),transparent_18%),radial-gradient(circle_at_84%_14%,rgba(217,180,91,0.12),transparent_18%),radial-gradient(circle_at_18%_82%,rgba(79,195,161,0.08),transparent_16%),radial-gradient(circle_at_86%_80%,rgba(201,119,59,0.10),transparent_18%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 overflow-hidden rounded-[32px] border border-[#E6D1A5]/10 bg-[linear-gradient(180deg,rgba(34,26,20,0.96),rgba(18,14,11,0.96))] shadow-[0_20px_70px_rgba(0,0,0,0.4)]">
          <div className="border-b border-[#E6D1A5]/8 bg-[linear-gradient(90deg,rgba(134,182,75,0.10),rgba(217,180,91,0.06),rgba(79,195,161,0.06))] px-5 py-3">
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[#D9B45B]">
              Ficha personal del campamento
            </p>
          </div>

          <div className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-[#D8F1AA]">
                Tu perfil
              </p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-[#FFF5E3]">
                {username}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/home"
                className="rounded-[20px] border border-[#E6D1A5]/10 bg-[#1D1612] px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-[#F4E8D1] transition hover:border-[#D9B45B]/20 hover:bg-[#2A1E18]"
              >
                Volver al campamento
              </Link>

              <Link
                href="/friends"
                className="rounded-[20px] border border-[#86B64B]/18 bg-[#86B64B]/10 px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-[#E2F5BE] transition hover:bg-[#86B64B]/18"
              >
                Amigos
              </Link>

              <Link
                href="/messages"
                className="rounded-[20px] border border-[#4FC3A1]/18 bg-[#4FC3A1]/10 px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-[#B6F4E0] transition hover:bg-[#4FC3A1]/18"
              >
                Mensajes
              </Link>
            </div>
          </div>
        </header>

        <section className="mb-6 overflow-hidden rounded-[32px] border border-[#E6D1A5]/10 bg-[linear-gradient(180deg,rgba(42,31,23,0.96),rgba(24,18,14,0.96))] shadow-[0_22px_70px_rgba(0,0,0,0.38)]">
          <div className="grid gap-6 px-6 py-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-center">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-28 w-28 items-center justify-center rounded-[28px] bg-[linear-gradient(135deg,#D9B45B_0%,#C9773B_55%,#86B64B_100%)] text-4xl font-black text-[#1A140F] shadow-[0_12px_30px_rgba(0,0,0,0.28)]">
                {initial}
              </div>

              <p className="mt-4 text-lg font-black text-[#FFF2DF]">{username}</p>
              <p className="mt-1 break-all text-sm text-[#D9C8A8]/70">{email}</p>

              <p className="mt-3 rounded-full border border-[#E6D1A5]/10 bg-[#17110E] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#F4D89C]">
                {joinedLabel}
              </p>
            </div>

            <div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[22px] border border-[#E6D1A5]/8 bg-[#17110E] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#D9C8A8]/64">
                    Partidas jugadas
                  </p>
                  <p className="mt-2 text-3xl font-black text-[#FFF2DF]">
                    {stats.matchesPlayed}
                  </p>
                </div>

                <div className="rounded-[22px] border border-[#E6D1A5]/8 bg-[#17110E] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#D9C8A8]/64">
                    Partidas ganadas
                  </p>
                  <p className="mt-2 text-3xl font-black text-[#FFF2DF]">
                    {stats.matchesWon}
                  </p>
                </div>

                <div className="rounded-[22px] border border-[#E6D1A5]/8 bg-[#17110E] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#D9C8A8]/64">
                    Win rate
                  </p>
                  <p className="mt-2 text-3xl font-black text-[#FFF2DF]">
                    {stats.winRate}%
                  </p>
                </div>

                <div className="rounded-[22px] border border-[#E6D1A5]/8 bg-[#17110E] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#D9C8A8]/64">
                    Amigos
                  </p>
                  <p className="mt-2 text-3xl font-black text-[#FFF2DF]">
                    {stats.friendsCount}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] border border-[#4FC3A1]/14 bg-[#4FC3A1]/10 px-4 py-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B6F4E0]">
                    Mensajes sin leer
                  </p>
                  <p className="mt-2 text-3xl font-black text-[#FFF2DF]">
                    {stats.unreadMessages}
                  </p>
                </div>

                <div className="rounded-[22px] border border-[#D9B45B]/14 bg-[#D9B45B]/10 px-4 py-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F4D89C]">
                    Estado del aventurero
                  </p>
                  <p className="mt-2 text-lg font-black text-[#FFF2DF]">
                    Cuenta activa y lista para jugar
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-[30px] border border-[#E6D1A5]/10 bg-[linear-gradient(180deg,rgba(38,29,22,0.96),rgba(22,17,13,0.96))] shadow-[0_22px_70px_rgba(0,0,0,0.38)]">
            <div className="border-b border-[#E6D1A5]/8 bg-[linear-gradient(90deg,rgba(79,195,161,0.10),rgba(134,182,75,0.05))] px-6 py-4">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#B6F4E0]">
                Resumen personal
              </p>
              <h3 className="mt-2 text-2xl font-black text-[#FFF2DF]">
                Tu actividad social
              </h3>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-2">
              <div className="rounded-[22px] border border-[#E6D1A5]/8 bg-[#17110E] p-4">
                <p className="text-sm font-bold text-[#FFF2DF]">Red social</p>
                <p className="mt-2 text-sm leading-6 text-[#D9C8A8]/76">
                  Ya formas parte del gremio y puedes administrar amistades, revisar perfiles y conversar por mensajes directos.
                </p>
              </div>

              <div className="rounded-[22px] border border-[#E6D1A5]/8 bg-[#17110E] p-4">
                <p className="text-sm font-bold text-[#FFF2DF]">Partidas</p>
                <p className="mt-2 text-sm leading-6 text-[#D9C8A8]/76">
                  Tu progreso de juego ya se refleja aquí con victorias, partidas jugadas y el estado general de tu cuenta.
                </p>
              </div>

              <div className="rounded-[22px] border border-[#E6D1A5]/8 bg-[#17110E] p-4">
                <p className="text-sm font-bold text-[#FFF2DF]">Lobby y aventura</p>
                <p className="mt-2 text-sm leading-6 text-[#D9C8A8]/76">
                  Desde el campamento puedes crear expediciones, unirte a salas activas y seguir creciendo dentro del universo PGW.
                </p>
              </div>

              <div className="rounded-[22px] border border-[#E6D1A5]/8 bg-[#17110E] p-4">
                <p className="text-sm font-bold text-[#FFF2DF]">Perfil propio</p>
                <p className="mt-2 text-sm leading-6 text-[#D9C8A8]/76">
                  Esta es la base de tu identidad dentro de la plataforma. Más adelante aquí podrás editar datos visuales y personalización.
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[30px] border border-[#E6D1A5]/10 bg-[linear-gradient(180deg,rgba(38,29,22,0.96),rgba(22,17,13,0.96))] shadow-[0_22px_70px_rgba(0,0,0,0.38)]">
            <div className="border-b border-[#E6D1A5]/8 bg-[linear-gradient(90deg,rgba(217,180,91,0.10),rgba(201,119,59,0.05))] px-6 py-4">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#F4D89C]">
                Conversaciones recientes
              </p>
              <h3 className="mt-2 text-2xl font-black text-[#FFF2DF]">
                Mensajes directos
              </h3>
            </div>

            <div className="p-6">
              {recentThreads.length === 0 ? (
                <div className="rounded-[22px] border border-[#E6D1A5]/8 bg-[#17110E] px-4 py-4 text-sm text-[#D9C8A8]/74">
                  Aún no tienes conversaciones activas.
                </div>
              ) : (
                <div className="space-y-3">
                  {recentThreads.map((thread) => (
                    <Link
                      key={thread.thread_id}
                      href={`/messages?user=${thread.other_user_id}`}
                      className="block rounded-[22px] border border-[#E6D1A5]/8 bg-[#17110E] px-4 py-4 text-sm text-[#D9C8A8]/74 transition hover:bg-[#211813]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-[#FFF2DF]">
                          {thread.other_username ?? "Usuario"}
                        </p>

                        {thread.unread_count > 0 && (
                          <span className="inline-flex min-w-[22px] items-center justify-center rounded-full bg-[#86B64B] px-2 py-1 text-[10px] font-black text-[#1A140F]">
                            {thread.unread_count}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 line-clamp-2">
                        {thread.last_message ?? "Sin mensajes todavía."}
                      </p>
                    </Link>
                  ))}
                </div>
              )}

              <div className="mt-4">
                <Link
                  href="/messages"
                  className="inline-flex rounded-[18px] border border-[#E6D1A5]/10 bg-[#211813] px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[#F2EAD1]/85 transition hover:bg-[#2B1F18]"
                >
                  Ir a mensajes
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
