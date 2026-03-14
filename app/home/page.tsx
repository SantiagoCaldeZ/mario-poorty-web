"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type UserProfile = {
  id?: string;
  username: string;
  email: string;
  created_at?: string | null;
};

type UserStats = {
  matchesPlayed: number;
  matchesWon: number;
  winRate: number;
  friendsCount: number;
};

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({
    matchesPlayed: 0,
    matchesWon: 0,
    winRate: 0,
    friendsCount: 0,
  });

  useEffect(() => {
    const checkSessionAndLoadProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/");
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
        setLoading(false);
        return;
      }

      if (activeMembership?.lobby_id) {
        router.replace(`/lobby/${activeMembership.lobby_id}`);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, email, created_at")
        .eq("id", userId)
        .maybeSingle();

      if (error || !data) {
        setLoading(false);
        return;
      }

      const { count: matchesPlayedCount, error: matchesPlayedError } = await supabase
        .from("match_players")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      const { count: matchesWonCount, error: matchesWonError } = await supabase
        .from("matches")
        .select("*", { count: "exact", head: true })
        .eq("winner_user_id", userId);

      const { count: friendsCountValue, error: friendsCountError } = await supabase
        .from("friendships")
        .select("*", { count: "exact", head: true })
        .eq("status", "accepted")
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

      if (matchesPlayedError || matchesWonError || friendsCountError) {
        setLoading(false);
        return;
      }

      const matchesPlayed = matchesPlayedCount ?? 0;
      const matchesWon = matchesWonCount ?? 0;
      const friendsCount = friendsCountValue ?? 0;
      const winRate =
        matchesPlayed > 0 ? Math.round((matchesWon / matchesPlayed) * 100) : 0;

      setProfile(data);
      setStats({
        matchesPlayed,
        matchesWon,
        winRate,
        friendsCount,
      });
      setLoading(false);
    };

    checkSessionAndLoadProfile();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const joinedLabel = useMemo(() => {
    if (!profile?.created_at) return "Jugador reciente";
    const date = new Date(profile.created_at);
    if (Number.isNaN(date.getTime())) return "Jugador reciente";
    return `Miembro desde ${date.toLocaleDateString("es-CR", {
      year: "numeric",
      month: "short",
    })}`;
  }, [profile?.created_at]);

  const profileStats = [
    {
      label: "Partidas jugadas",
      value: String(stats.matchesPlayed),
      tone: "from-[#7A5A2F] to-[#C7923A]",
      glow: "bg-[#C7923A]/15",
      text: "text-[#F4D89C]",
    },
    {
      label: "Partidas ganadas",
      value: String(stats.matchesWon),
      tone: "from-[#4F6B2B] to-[#86B64B]",
      glow: "bg-[#86B64B]/15",
      text: "text-[#D8F1AA]",
    },
    {
      label: "Win rate",
      value: `${stats.winRate}%`,
      tone: "from-[#255C4C] to-[#4FC3A1]",
      glow: "bg-[#4FC3A1]/15",
      text: "text-[#B6F4E0]",
    },
    {
      label: "Amigos",
      value: String(stats.friendsCount),
      tone: "from-[#5F3F2D] to-[#C9773B]",
      glow: "bg-[#C9773B]/15",
      text: "text-[#FFD0A8]",
    },
  ];

  const mockFriends = [
    { name: "LuigiFan", status: "En línea" },
    { name: "PeachPlayer", status: "Ausente" },
    { name: "ToadRush", status: "Próximamente" },
  ];

  const mockMessages = [
    { from: "Sistema", text: "Tus mensajes directos aparecerán aquí." },
    { from: "Amigos", text: "Podrás chatear e invitar jugadores más adelante." },
  ];

  const mockNotifications = [
    "La sección de amigos estará disponible próximamente.",
    "Los mensajes directos se activarán en una futura versión.",
    "Tu cuenta ya está lista para crear o unirte a partidas.",
  ];

  if (loading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,#2A2018_0%,#15110D_42%,#090807_100%)] px-4">
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,rgba(255,248,220,0.7)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,248,220,0.7)_1px,transparent_1px)] [background-size:36px_36px]" />
        <div className="pointer-events-none absolute left-[12%] top-[12%] h-32 w-32 rounded-full bg-[#C7923A]/12 blur-3xl" />
        <div className="pointer-events-none absolute right-[12%] top-[18%] h-40 w-40 rounded-full bg-[#86B64B]/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[14%] left-[20%] h-28 w-28 rounded-full bg-[#C9773B]/10 blur-3xl" />

        <div className="rounded-[34px] border border-[#E6D1A5]/10 bg-[#17110E]/88 px-8 py-7 text-center shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-md">
          <p className="text-xs font-black uppercase tracking-[0.34em] text-[#D9B45B]">
            Campamento central
          </p>
          <p className="mt-3 text-lg font-bold text-[#F7F0DC]">
            Cargando la taberna goblin...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#34251B_0%,#1A140F_34%,#0D0B09_68%,#060505_100%)] text-[#F7F0DC]">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(201,119,59,0.06),transparent_18%,transparent_82%,rgba(134,182,75,0.05))]" />
      <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,rgba(255,244,214,0.8)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,244,214,0.8)_1px,transparent_1px)] [background-size:38px_38px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(201,119,59,0.18),transparent_18%),radial-gradient(circle_at_86%_16%,rgba(217,180,91,0.14),transparent_18%),radial-gradient(circle_at_18%_82%,rgba(134,182,75,0.12),transparent_18%),radial-gradient(circle_at_86%_82%,rgba(79,195,161,0.08),transparent_18%)]" />

      <div className="pointer-events-none absolute left-[5%] top-[8%] h-32 w-32 rounded-full bg-[#C9773B]/12 blur-3xl" />
      <div className="pointer-events-none absolute right-[8%] top-[12%] h-40 w-40 rounded-full bg-[#D9B45B]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[12%] left-[10%] h-32 w-32 rounded-full bg-[#86B64B]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[8%] right-[14%] h-32 w-32 rounded-full bg-[#4FC3A1]/8 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 overflow-hidden rounded-[32px] border border-[#E6D1A5]/10 bg-[linear-gradient(180deg,rgba(39,28,21,0.96),rgba(24,18,14,0.96))] shadow-[0_20px_70px_rgba(0,0,0,0.4)]">
          <div className="border-b border-[#E6D1A5]/8 bg-[linear-gradient(90deg,rgba(201,119,59,0.10),rgba(217,180,91,0.06),rgba(134,182,75,0.08))] px-5 py-3">
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[#D9B45B]">
              Taberna principal del campamento
            </p>
          </div>

          <div className="flex flex-col gap-5 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="pointer-events-none absolute inset-0 rounded-[24px] bg-[#D9B45B]/10 blur-xl" />
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
                <h1 className="text-2xl font-black tracking-tight text-[#F7F0DC] sm:text-3xl">
                  Poorty Goblin Web
                </h1>
                <p className="mt-1 text-sm text-[#D9C8A8]/72">
                  Reúne a la tribu, organiza partidas y mantén viva la aventura.
                </p>
              </div>
            </div>

            <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold">
              {[
                { label: "Inicio", href: "/home" },
                { label: "Amigos", href: "/friends" },
                { label: "Mensajes", href: "/home" },
                { label: "Ayuda", href: "/help" },
                { label: "Acerca de", href: "/about" },
                { label: "Soporte", href: "/support" },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => router.push(item.href)}
                  className="rounded-full border border-[#E6D1A5]/10 bg-[#1D1612] px-4 py-2 text-[#E9DEC7]/80 transition duration-300 hover:border-[#D9B45B]/20 hover:bg-[#2A1E18] hover:text-[#FFF5DF]"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3 rounded-[24px] border border-[#E6D1A5]/10 bg-[#130F0D]/85 px-4 py-3 shadow-[0_10px_24px_rgba(0,0,0,0.28)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#D9B45B_0%,#C9773B_58%,#86B64B_100%)] text-lg font-black text-[#1A140F] shadow-[0_8px_20px_rgba(0,0,0,0.28)]">
                {profile?.username?.slice(0, 1).toUpperCase() ?? "P"}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[#F7F0DC]">
                  {profile?.username ?? "Jugador"}
                </p>
                <p className="truncate text-xs text-[#D9C8A8]/55">
                  {profile?.email ?? ""}
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-2xl border border-[#C9773B]/20 bg-[#C9773B]/10 px-3 py-2 text-xs font-black uppercase tracking-[0.15em] text-[#FFD7B8] transition hover:bg-[#C9773B]/18"
              >
                Salir
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_330px]">
          <aside className="space-y-6">
            <div className="overflow-hidden rounded-[32px] border border-[#E6D1A5]/10 bg-[linear-gradient(180deg,rgba(44,31,23,0.96),rgba(24,18,14,0.96))] shadow-[0_22px_70px_rgba(0,0,0,0.38)]">
              <div className="border-b border-[#E6D1A5]/8 bg-[linear-gradient(90deg,rgba(217,180,91,0.10),rgba(201,119,59,0.06))] px-6 py-4">
                <p className="text-[11px] font-black uppercase tracking-[0.34em] text-[#D9B45B]">
                  Ficha del aventurero
                </p>
              </div>

              <div className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-[30px] border border-[#E6D1A5]/12 bg-[linear-gradient(135deg,#D9B45B_0%,#C9773B_55%,#86B64B_100%)] text-3xl font-black text-[#1A140F] shadow-[0_18px_35px_rgba(0,0,0,0.32)]">
                    {profile?.username?.slice(0, 1).toUpperCase() ?? "P"}
                  </div>

                  <h2 className="mt-4 text-2xl font-black text-[#F7F0DC]">
                    {profile?.username ?? "Jugador"}
                  </h2>

                  <p className="mt-1 break-all text-sm text-[#D9C8A8]/72">
                    {profile?.email ?? ""}
                  </p>

                  <p className="mt-3 rounded-full border border-[#E6D1A5]/10 bg-[#17110E] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#F4D89C]">
                    {joinedLabel}
                  </p>

                  <button
                    type="button"
                    className="mt-5 rounded-[20px] border border-[#E6D1A5]/10 bg-[linear-gradient(135deg,#D9B45B_0%,#C7923A_100%)] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#1A140F] shadow-[0_12px_28px_rgba(0,0,0,0.28)] transition hover:scale-[1.02]"
                  >
                    Ver perfil
                  </button>
                </div>

                <div className="mt-6 grid gap-3">
                  {profileStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-[24px] border border-[#E6D1A5]/10 bg-[#17110E] p-4"
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-2xl ${stat.glow}`} />
                        <div className="min-w-0">
                          <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${stat.text}`}>
                            {stat.label}
                          </p>
                          <p className="mt-1 text-3xl font-black text-[#F7F0DC]">
                            {stat.value}
                          </p>
                        </div>
                      </div>
                      <div className={`h-2 rounded-full bg-gradient-to-r ${stat.tone}`} />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/friends")}
                  className="mt-5 w-full rounded-[22px] border border-[#86B64B]/18 bg-[#86B64B]/10 px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#E2F5BE] transition hover:bg-[#86B64B]/18"
                >
                  Gestionar amigos
                </button>
              </div>
            </div>
          </aside>

          <section className="space-y-6">
            <div className="overflow-hidden rounded-[34px] border border-[#E6D1A5]/10 bg-[linear-gradient(180deg,rgba(44,31,23,0.96),rgba(24,18,14,0.96))] shadow-[0_22px_70px_rgba(0,0,0,0.38)]">
              <div className="relative overflow-hidden border-b border-[#E6D1A5]/8 bg-[linear-gradient(135deg,rgba(201,119,59,0.18),rgba(217,180,91,0.12),rgba(134,182,75,0.10))] px-6 py-6">
                <div className="pointer-events-none absolute -left-8 top-0 h-28 w-28 rounded-full bg-[#C9773B]/15 blur-3xl" />
                <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-[#D9B45B]/12 blur-3xl" />

                <p className="text-[11px] font-black uppercase tracking-[0.38em] text-[#F4D89C]">
                  Plaza del campamento
                </p>

                <h2 className="mt-3 max-w-3xl text-4xl font-black leading-tight text-[#FFF5E3] sm:text-5xl">
                  Bienvenido a la
                  <span className="bg-[linear-gradient(135deg,#D9B45B_0%,#C9773B_50%,#86B64B_100%)] bg-clip-text text-transparent">
                    {" "}
                    taberna goblin
                  </span>
                </h2>

                <p className="mt-4 max-w-3xl text-base leading-7 text-[#E3D3B5]/84">
                  Este es el punto de encuentro de la tribu: aquí podrá abrir
                  expediciones, entrar a lobbies, revisar su progreso y seguir el
                  movimiento social de Poorty Goblin Web.
                </p>
              </div>

              <div className="p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => router.push("/lobby/create")}
                    className="group relative overflow-hidden rounded-[30px] border border-[#E6D1A5]/10 bg-[linear-gradient(180deg,#3A2418_0%,#2A1B13_100%)] p-6 text-left shadow-[0_18px_45px_rgba(0,0,0,0.3)] transition duration-300 hover:-translate-y-1"
                  >
                    <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-full bg-[#C9773B]/14 blur-3xl" />
                    <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#FFD0A8]">
                      Fogata central
                    </p>
                    <h3 className="mt-3 text-3xl font-black text-[#FFF2DF]">
                      Crear partida
                    </h3>
                    <p className="mt-3 max-w-xs text-sm leading-6 text-[#E7D6B7]/82">
                      Monte su propio campamento, sea anfitrión y reúna a los
                      jugadores alrededor de la mesa.
                    </p>
                    <p className="mt-6 text-sm font-bold text-[#FFD0A8] transition group-hover:translate-x-1">
                      Ir a creación →
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push("/lobby/join")}
                    className="group relative overflow-hidden rounded-[30px] border border-[#E6D1A5]/10 bg-[linear-gradient(180deg,#25311F_0%,#182117_100%)] p-6 text-left shadow-[0_18px_45px_rgba(0,0,0,0.3)] transition duration-300 hover:-translate-y-1"
                  >
                    <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-full bg-[#86B64B]/14 blur-3xl" />
                    <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#D8F1AA]">
                      Ruta de expedición
                    </p>
                    <h3 className="mt-3 text-3xl font-black text-[#FFF2DF]">
                      Unirse a partida
                    </h3>
                    <p className="mt-3 max-w-xs text-sm leading-6 text-[#E7D6B7]/82">
                      Encuentre una sala activa, entre por código y súmese a la
                      siguiente aventura del campamento.
                    </p>
                    <p className="mt-6 text-sm font-bold text-[#D8F1AA] transition group-hover:translate-x-1">
                      Ir a unión →
                    </p>
                  </button>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <div className="rounded-[26px] border border-[#E6D1A5]/10 bg-[#17110E] p-5">
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#FFD0A8]">
                      Tablón
                    </p>
                    <h4 className="mt-2 text-xl font-black text-[#FFF2DF]">
                      Invitar aliados
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-[#D9C8A8]/78">
                      Muy pronto podrá llamar a sus amigos directo al lobby y
                      montar sesiones más rápidas.
                    </p>
                  </div>

                  <div className="rounded-[26px] border border-[#E6D1A5]/10 bg-[#17110E] p-5">
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#D8F1AA]">
                      Registro
                    </p>
                    <h4 className="mt-2 text-xl font-black text-[#FFF2DF]">
                      Actividad reciente
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-[#D9C8A8]/78">
                      Aquí verá sus últimas partidas, avances y resultados dentro
                      del universo PGW.
                    </p>
                  </div>

                  <div className="rounded-[26px] border border-[#E6D1A5]/10 bg-[#17110E] p-5">
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#B6F4E0]">
                      Eventos
                    </p>
                    <h4 className="mt-2 text-xl font-black text-[#FFF2DF]">
                      Noticias del campamento
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-[#D9C8A8]/78">
                      Retos, novedades y anuncios aparecerán aquí como parte del
                      movimiento vivo de la plataforma.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <button
                type="button"
                onClick={() => router.push("/help")}
                className="rounded-[28px] border border-[#E6D1A5]/10 bg-[linear-gradient(180deg,rgba(44,31,23,0.96),rgba(24,18,14,0.96))] p-5 text-left shadow-[0_18px_50px_rgba(0,0,0,0.3)] transition hover:-translate-y-1"
              >
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#F4D89C]">
                  Guía rápida
                </p>
                <h3 className="mt-3 text-2xl font-black text-[#FFF2DF]">
                  ¿Cómo empiezo?
                </h3>
                <ul className="mt-4 space-y-2 text-sm leading-6 text-[#D9C8A8]/80">
                  <li>• Cree una partida o únase a una ya existente.</li>
                  <li>• Espere en el lobby hasta iniciar el juego.</li>
                  <li>• Defina su orden y seleccione personaje.</li>
                  <li>• Use recuperación si olvida su contraseña.</li>
                </ul>
              </button>

              <button
                type="button"
                onClick={() => router.push("/about")}
                className="rounded-[28px] border border-[#E6D1A5]/10 bg-[linear-gradient(180deg,rgba(44,31,23,0.96),rgba(24,18,14,0.96))] p-5 text-left shadow-[0_18px_50px_rgba(0,0,0,0.3)] transition hover:-translate-y-1"
              >
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#D8F1AA]">
                  Sobre PGW
                </p>
                <h3 className="mt-3 text-2xl font-black text-[#FFF2DF]">
                  Historia del proyecto
                </h3>
                <p className="mt-4 text-sm leading-6 text-[#D9C8A8]/80">
                  Poorty Goblin Web es la adaptación web de un proyecto original,
                  pensada para llevar la experiencia multijugador a un entorno
                  moderno, accesible y social.
                </p>
              </button>

              <button
                type="button"
                onClick={() => router.push("/support")}
                className="rounded-[28px] border border-[#E6D1A5]/10 bg-[linear-gradient(180deg,rgba(44,31,23,0.96),rgba(24,18,14,0.96))] p-5 text-left shadow-[0_18px_50px_rgba(0,0,0,0.3)] transition hover:-translate-y-1"
              >
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#FFD0A8]">
                  Soporte
                </p>
                <h3 className="mt-3 text-2xl font-black text-[#FFF2DF]">
                  Mesa de ayuda
                </h3>
                <p className="mt-4 text-sm leading-6 text-[#D9C8A8]/80">
                  Para problemas de cuenta, recuperación de contraseña o errores
                  de la plataforma, puede escribir a:
                </p>
                <p className="mt-3 break-all rounded-[20px] border border-[#E6D1A5]/10 bg-[#17110E] px-3 py-3 text-sm font-bold text-[#FFF2DF]">
                  poortygoblinweb@gmail.com
                </p>
              </button>
            </div>
          </section>

          <aside className="space-y-6">
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
                <div className="mb-4 flex items-center justify-end">
                  <button
                    type="button"
                    className="rounded-full border border-[#E6D1A5]/10 bg-[#17110E] px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#E9DEC7]/85"
                  >
                    Ver todos
                  </button>
                </div>

                <div className="space-y-3">
                  {mockFriends.map((friend, index) => (
                    <div
                      key={friend.name}
                      className="flex items-center justify-between rounded-[22px] border border-[#E6D1A5]/8 bg-[#17110E] px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-[16px] font-black text-[#1A140F] shadow-[0_10px_20px_rgba(0,0,0,0.24)] ${
                            index === 0
                              ? "bg-[linear-gradient(135deg,#86B64B_0%,#D9B45B_100%)]"
                              : index === 1
                              ? "bg-[linear-gradient(135deg,#D9B45B_0%,#C9773B_100%)]"
                              : "bg-[linear-gradient(135deg,#4FC3A1_0%,#86B64B_100%)]"
                          }`}
                        >
                          {friend.name.slice(0, 1)}
                        </div>

                        <div>
                          <p className="text-sm font-bold text-[#FFF2DF]">{friend.name}</p>
                          <p className="text-xs text-[#D9C8A8]/58">{friend.status}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="rounded-[14px] border border-[#E6D1A5]/10 bg-[#211813] px-3 py-2 text-xs font-semibold text-[#F2EAD1]/85 transition hover:bg-[#2B1F18]"
                      >
                        Perfil
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[32px] border border-[#E6D1A5]/10 bg-[linear-gradient(180deg,rgba(36,26,20,0.96),rgba(22,17,13,0.96))] shadow-[0_22px_70px_rgba(0,0,0,0.38)]">
              <div className="border-b border-[#E6D1A5]/8 bg-[linear-gradient(90deg,rgba(79,195,161,0.10),rgba(217,180,91,0.05))] px-6 py-4">
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#B6F4E0]">
                  Correo del campamento
                </p>
                <h3 className="mt-2 text-2xl font-black text-[#FFF2DF]">
                  Mensajes directos
                </h3>
              </div>

              <div className="p-6 space-y-3">
                {mockMessages.map((message, index) => (
                  <div
                    key={`${message.from}-${index}`}
                    className="rounded-[22px] border border-[#E6D1A5]/8 bg-[#17110E] p-4"
                  >
                    <p className="text-sm font-bold text-[#FFF2DF]">{message.from}</p>
                    <p className="mt-1 text-sm leading-6 text-[#D9C8A8]/74">
                      {message.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-[32px] border border-[#E6D1A5]/10 bg-[linear-gradient(180deg,rgba(36,26,20,0.96),rgba(22,17,13,0.96))] shadow-[0_22px_70px_rgba(0,0,0,0.38)]">
              <div className="border-b border-[#E6D1A5]/8 bg-[linear-gradient(90deg,rgba(201,119,59,0.10),rgba(217,180,91,0.05))] px-6 py-4">
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#FFD0A8]">
                  Tablón de anuncios
                </p>
                <h3 className="mt-2 text-2xl font-black text-[#FFF2DF]">
                  Notificaciones
                </h3>
              </div>

              <div className="p-6 space-y-3">
                {mockNotifications.map((notification, index) => (
                  <div
                    key={index}
                    className="rounded-[22px] border border-[#E6D1A5]/8 bg-[#17110E] px-4 py-3 text-sm leading-6 text-[#D9C8A8]/78"
                  >
                    {notification}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}