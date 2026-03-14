"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type FriendProfileRow = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  friendship_since: string | null;
  are_friends: boolean;
  blocked_by_me: boolean;
  blocked_me: boolean;
};

type UserStatsRow = {
  matches_played: number;
  matches_won: number;
  win_rate: number;
};

type MutualFriendRow = {
  id: string;
  username: string | null;
  avatar_url: string | null;
};

export default function FriendProfilePage() {
  const params = useParams();
  const router = useRouter();
  const targetUserId = typeof params.id === "string" ? params.id : "";

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const [profile, setProfile] = useState<FriendProfileRow | null>(null);
  const [stats, setStats] = useState<UserStatsRow | null>(null);
  const [mutualFriends, setMutualFriends] = useState<MutualFriendRow[]>([]);

  const loadProfilePage = async () => {
    setPageError("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      router.replace("/");
      return;
    }

    if (!targetUserId) {
      setPageError("Perfil inválido.");
      setLoading(false);
      return;
    }

    const [
      { data: profileData, error: profileError },
      { data: statsData, error: statsError },
      { data: mutualData, error: mutualError },
    ] = await Promise.all([
      supabase.rpc("get_friend_profile", { target_user_id: targetUserId }),
      supabase.rpc("get_public_user_stats", { target_user_id: targetUserId }),
      supabase.rpc("get_mutual_friends", { target_user_id: targetUserId }),
    ]);

    if (profileError) {
      setPageError(profileError.message);
      setLoading(false);
      return;
    }

    const profileRow = ((profileData ?? []) as FriendProfileRow[])[0] ?? null;

    if (!profileRow) {
      setPageError("No puedes ver este perfil o ya no existe una relación válida con este usuario.");
      setLoading(false);
      return;
    }

    if (statsError && !profileRow.blocked_by_me && !profileRow.blocked_me) {
      setPageError(statsError.message);
      setLoading(false);
      return;
    }

    if (mutualError && !profileRow.blocked_by_me && !profileRow.blocked_me) {
      setPageError(mutualError.message);
      setLoading(false);
      return;
    }

    setProfile(profileRow);
    setStats((((statsData ?? []) as UserStatsRow[])[0] ?? null));
    setMutualFriends((mutualData ?? []) as MutualFriendRow[]);
    setLoading(false);
  };

  useEffect(() => {
    loadProfilePage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUserId]);

  const handleDirectChat = () => {
    if (!profile?.id) return;
    router.push(`/messages?user=${profile.id}`);
  };

  const handleRemoveFriend = async () => {
    if (!profile) return;

    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar a ${profile.username ?? "este usuario"} de tu lista de amigos?`
    );

    if (!confirmed) return;

    setActionLoading(true);
    setPageError("");
    setActionMessage("");

    const { error } = await supabase.rpc("remove_friend", {
      target_user_id: profile.id,
    });

    setActionLoading(false);

    if (error) {
      setPageError(error.message);
      return;
    }

    setActionMessage("La amistad fue eliminada correctamente.");

    setTimeout(() => {
      router.push("/friends");
    }, 900);
  };

  const handleBlockUser = async () => {
    if (!profile) return;

    const confirmed = window.confirm(
      `¿Seguro que deseas bloquear a ${profile.username ?? "este usuario"}? Esto eliminará la amistad y cancelará interacciones entre ambos.`
    );

    if (!confirmed) return;

    setActionLoading(true);
    setPageError("");
    setActionMessage("");

    const { error } = await supabase.rpc("block_user", {
      target_user_id: profile.id,
    });

    setActionLoading(false);

    if (error) {
      setPageError(error.message);
      return;
    }

    setActionMessage("Usuario bloqueado correctamente.");

    setTimeout(() => {
      router.push("/friends");
    }, 900);
  };

  const handleUnblockUser = async () => {
    if (!profile) return;

    const confirmed = window.confirm(
      `¿Seguro que deseas desbloquear a ${profile.username ?? "este usuario"}?`
    );

    if (!confirmed) return;

    setActionLoading(true);
    setPageError("");
    setActionMessage("");

    const { error } = await supabase.rpc("unblock_user", {
      target_user_id: profile.id,
    });

    setActionLoading(false);

    if (error) {
      setPageError(error.message);
      return;
    }

    setActionMessage("Usuario desbloqueado correctamente.");
    await loadProfilePage();
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,#31251B_0%,#19130E_34%,#0D0A08_68%,#060505_100%)] px-4">
        <div className="rounded-[28px] border border-[#E6D1A5]/10 bg-[#17110E]/90 px-8 py-7 text-center shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <p className="text-xs font-black uppercase tracking-[0.34em] text-[#D9B45B]">
            Perfil social
          </p>
          <p className="mt-3 text-lg font-bold text-[#F7F0DC]">
            Cargando perfil del amigo...
          </p>
        </div>
      </main>
    );
  }

  if (pageError && !profile) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,#31251B_0%,#19130E_34%,#0D0A08_68%,#060505_100%)] px-4">
        <div className="w-full max-w-2xl rounded-[32px] border border-[#E6D1A5]/10 bg-[#17110E]/95 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <h1 className="text-2xl font-black text-[#FFF5E3]">Perfil de amigo</h1>
          <p className="mt-4 rounded-[20px] border border-[#C9773B]/18 bg-[#C9773B]/10 px-4 py-3 text-sm text-[#FFD7B8]">
            {pageError}
          </p>

          <div className="mt-6">
            <Link
              href="/friends"
              className="rounded-[18px] border border-[#E6D1A5]/10 bg-[#211813] px-4 py-2 text-sm font-bold uppercase tracking-[0.12em] text-[#F2EAD1]/85 transition hover:bg-[#2B1F18]"
            >
              Volver a amigos
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const username = profile?.username ?? "Usuario";
  const initial = username.slice(0, 1).toUpperCase();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#31251B_0%,#19130E_34%,#0D0A08_68%,#060505_100%)] text-[#F7F0DC]">
      <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,rgba(255,244,214,0.75)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,244,214,0.75)_1px,transparent_1px)] [background-size:38px_38px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(134,182,75,0.16),transparent_18%),radial-gradient(circle_at_84%_14%,rgba(217,180,91,0.12),transparent_18%),radial-gradient(circle_at_18%_82%,rgba(79,195,161,0.08),transparent_16%),radial-gradient(circle_at_86%_80%,rgba(201,119,59,0.10),transparent_18%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 overflow-hidden rounded-[32px] border border-[#E6D1A5]/10 bg-[linear-gradient(180deg,rgba(34,26,20,0.96),rgba(18,14,11,0.96))] shadow-[0_20px_70px_rgba(0,0,0,0.4)]">
          <div className="border-b border-[#E6D1A5]/8 bg-[linear-gradient(90deg,rgba(134,182,75,0.10),rgba(217,180,91,0.06),rgba(79,195,161,0.06))] px-5 py-3">
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[#D9B45B]">
              Gremio social del campamento
            </p>
          </div>

          <div className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-[#D8F1AA]">
                Perfil de amigo
              </p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-[#FFF5E3]">
                {username}
              </h1>
            </div>

            <Link
              href="/friends"
              className="rounded-[20px] border border-[#E6D1A5]/10 bg-[#1D1612] px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-[#F4E8D1] transition hover:border-[#D9B45B]/20 hover:bg-[#2A1E18]"
            >
              Volver a amigos
            </Link>
          </div>
        </header>

        {(pageError || actionMessage) && (
          <div className="mb-6 space-y-3">
            {pageError && (
              <div className="rounded-[24px] border border-[#C9773B]/18 bg-[#C9773B]/10 px-4 py-3 text-sm text-[#FFD7B8]">
                {pageError}
              </div>
            )}

            {actionMessage && (
              <div className="rounded-[24px] border border-[#86B64B]/18 bg-[#86B64B]/10 px-4 py-3 text-sm text-[#E2F5BE]">
                {actionMessage}
              </div>
            )}
          </div>
        )}

        <section className="mb-6 overflow-hidden rounded-[32px] border border-[#E6D1A5]/10 bg-[linear-gradient(180deg,rgba(42,31,23,0.96),rgba(24,18,14,0.96))] shadow-[0_22px_70px_rgba(0,0,0,0.38)]">
          <div className="grid gap-6 px-6 py-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-28 w-28 items-center justify-center rounded-[28px] bg-[linear-gradient(135deg,#86B64B_0%,#D9B45B_55%,#4FC3A1_100%)] text-4xl font-black text-[#1A140F] shadow-[0_12px_30px_rgba(0,0,0,0.28)]">
                {initial}
              </div>

              <p className="mt-4 text-lg font-black text-[#FFF2DF]">{username}</p>

              <p className="mt-1 text-sm text-[#D9C8A8]/70">
                {profile?.blocked_by_me
                  ? "Usuario bloqueado"
                  : profile?.blocked_me
                  ? "Este usuario te ha bloqueado"
                  : profile?.are_friends
                  ? "Amigo agregado"
                  : "Relación no disponible"}
              </p>
            </div>

            <div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <button
                  type="button"
                  onClick={handleDirectChat}
                  disabled={actionLoading || !!profile?.blocked_by_me || !!profile?.blocked_me}
                  className="rounded-[18px] border border-[#E6D1A5]/10 bg-[#211813] px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-[#F2EAD1]/85 transition hover:bg-[#2B1F18] disabled:opacity-50"
                >
                  Chat directo
                </button>

                {!profile?.blocked_by_me && !profile?.blocked_me && (
                  <button
                    type="button"
                    onClick={handleRemoveFriend}
                    disabled={actionLoading || !profile?.are_friends}
                    className="rounded-[18px] border border-[#E6D1A5]/10 bg-[#211813] px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-[#F2EAD1]/85 transition hover:bg-[#2B1F18] disabled:opacity-50"
                  >
                    {actionLoading ? "Procesando..." : "Eliminar amigo"}
                  </button>
                )}

                {!profile?.blocked_by_me ? (
                  <button
                    type="button"
                    onClick={handleBlockUser}
                    disabled={actionLoading || !!profile?.blocked_me}
                    className="rounded-[18px] border border-[#C9773B]/18 bg-[#C9773B]/10 px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-[#FFD7B8] transition hover:bg-[#C9773B]/18 disabled:opacity-50"
                  >
                    {actionLoading ? "Procesando..." : "Bloquear"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleUnblockUser}
                    disabled={actionLoading}
                    className="rounded-[18px] border border-[#86B64B]/18 bg-[#86B64B]/10 px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-[#E2F5BE] transition hover:bg-[#86B64B]/18 disabled:opacity-50"
                  >
                    {actionLoading ? "Procesando..." : "Desbloquear"}
                  </button>
                )}

                <div className="rounded-[18px] border border-[#E6D1A5]/10 bg-[#17110E] px-4 py-3 text-sm text-[#D9C8A8]/78">
                  Amigos en común:{" "}
                  <span className="font-black text-[#FFF2DF]">{mutualFriends.length}</span>
                </div>
              </div>

              {profile?.friendship_since && !profile?.blocked_by_me && !profile?.blocked_me && (
                <p className="mt-4 text-sm text-[#D9C8A8]/68">
                  Amigos desde:{" "}
                  <span className="font-semibold text-[#FFF2DF]">
                    {new Date(profile.friendship_since).toLocaleDateString()}
                  </span>
                </p>
              )}
            </div>
          </div>
        </section>

        {!profile?.blocked_by_me && !profile?.blocked_me && (
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="overflow-hidden rounded-[30px] border border-[#E6D1A5]/10 bg-[linear-gradient(180deg,rgba(38,29,22,0.96),rgba(22,17,13,0.96))] shadow-[0_22px_70px_rgba(0,0,0,0.38)]">
              <div className="border-b border-[#E6D1A5]/8 bg-[linear-gradient(90deg,rgba(79,195,161,0.10),rgba(134,182,75,0.05))] px-6 py-4">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#B6F4E0]">
                  Estadísticas públicas
                </p>
                <h3 className="mt-2 text-2xl font-black text-[#FFF2DF]">
                  Rendimiento en partida
                </h3>
              </div>

              <div className="grid gap-4 p-6 sm:grid-cols-3">
                <div className="rounded-[22px] border border-[#E6D1A5]/8 bg-[#17110E] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#D9C8A8]/64">
                    Partidas jugadas
                  </p>
                  <p className="mt-2 text-3xl font-black text-[#FFF2DF]">
                    {stats?.matches_played ?? 0}
                  </p>
                </div>

                <div className="rounded-[22px] border border-[#E6D1A5]/8 bg-[#17110E] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#D9C8A8]/64">
                    Partidas ganadas
                  </p>
                  <p className="mt-2 text-3xl font-black text-[#FFF2DF]">
                    {stats?.matches_won ?? 0}
                  </p>
                </div>

                <div className="rounded-[22px] border border-[#E6D1A5]/8 bg-[#17110E] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#D9C8A8]/64">
                    Win rate
                  </p>
                  <p className="mt-2 text-3xl font-black text-[#FFF2DF]">
                    {Number(stats?.win_rate ?? 0).toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[30px] border border-[#E6D1A5]/10 bg-[linear-gradient(180deg,rgba(38,29,22,0.96),rgba(22,17,13,0.96))] shadow-[0_22px_70px_rgba(0,0,0,0.38)]">
              <div className="border-b border-[#E6D1A5]/8 bg-[linear-gradient(90deg,rgba(217,180,91,0.10),rgba(201,119,59,0.05))] px-6 py-4">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#F4D89C]">
                  Red compartida
                </p>
                <h3 className="mt-2 text-2xl font-black text-[#FFF2DF]">
                  Amigos en común
                </h3>
              </div>

              <div className="p-6">
                {mutualFriends.length === 0 ? (
                  <div className="rounded-[22px] border border-[#E6D1A5]/8 bg-[#17110E] px-4 py-4 text-sm text-[#D9C8A8]/74">
                    No tienen amigos en común todavía.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mutualFriends.map((friend) => (
                      <div
                        key={friend.id}
                        className="flex items-center gap-3 rounded-[22px] border border-[#E6D1A5]/8 bg-[#17110E] p-4"
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[linear-gradient(135deg,#86B64B_0%,#D9B45B_55%,#4FC3A1_100%)] font-black text-[#1A140F]">
                          {friend.username?.slice(0, 1).toUpperCase() ?? "A"}
                        </div>

                        <div>
                          <p className="text-base font-black text-[#FFF2DF]">
                            {friend.username ?? "Usuario"}
                          </p>
                          <p className="text-sm text-[#D9C8A8]/65">
                            Amigo en común
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}