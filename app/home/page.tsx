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
      color: "from-blue-500 to-cyan-400",
    },
    {
      label: "Partidas ganadas",
      value: String(stats.matchesWon),
      color: "from-green-500 to-emerald-400",
    },
    {
      label: "Win rate",
      value: `${stats.winRate}%`,
      color: "from-yellow-500 to-orange-400",
    },
    {
      label: "Amigos",
      value: String(stats.friendsCount),
      color: "from-pink-500 to-rose-400",
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
      <main className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <p className="text-white/90">Cargando centro principal...</p>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-blue-950 to-emerald-950 text-white">
      <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_34%)]" />

      <div className="pointer-events-none absolute left-[8%] top-[10%] h-28 w-28 rounded-full bg-red-400/15 blur-3xl" />
      <div className="pointer-events-none absolute right-[10%] top-[12%] h-24 w-24 rounded-full bg-yellow-300/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[16%] left-[14%] h-24 w-24 rounded-full bg-green-300/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[14%] right-[12%] h-28 w-28 rounded-full bg-cyan-300/15 blur-3xl" />

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
                <p className="text-xs font-black uppercase tracking-[0.35em] text-yellow-300">
                  Plataforma social de juego
                </p>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-white">
                  Poorty Goblin Web
                </h1>
              </div>
            </div>

            <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold">
              {[
                { label: "Inicio", href: "/home" },
                { label: "Amigos", href: "/home" },
                { label: "Mensajes", href: "/home" },
                { label: "Ayuda", href: "/help" },
                { label: "Acerca de", href: "/about" },
                { label: "Soporte", href: "/support" },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => router.push(item.href)}
                  className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-white/85 transition hover:bg-white/15"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 via-yellow-400 to-green-500 text-lg font-black text-slate-950">
                {profile?.username?.slice(0, 1).toUpperCase() ?? "P"}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">
                  {profile?.username ?? "Jugador"}
                </p>
                <p className="truncate text-xs text-white/65">{profile?.email ?? ""}</p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-red-300/30 bg-red-500/15 px-3 py-2 text-xs font-bold uppercase tracking-[0.15em] text-red-200 transition hover:bg-red-500/25"
              >
                Salir
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
          <aside className="space-y-6">
            <div className="rounded-[30px] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-red-500 via-yellow-400 to-green-500 text-3xl font-black text-slate-950 shadow-xl">
                  {profile?.username?.slice(0, 1).toUpperCase() ?? "P"}
                </div>

                <h2 className="mt-4 text-2xl font-black text-white">
                  {profile?.username ?? "Jugador"}
                </h2>

                <p className="mt-1 text-sm text-white/75">{profile?.email ?? ""}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                  {joinedLabel}
                </p>

                <button
                  type="button"
                  className="mt-5 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 px-5 py-3 text-sm font-black uppercase tracking-[0.15em] text-slate-950 shadow-lg transition hover:scale-[1.02]"
                >
                  Ver perfil
                </button>
              </div>

              <div className="mt-6 grid gap-3">
                {profileStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div
                      className={`mb-3 h-2 rounded-full bg-gradient-to-r ${stat.color}`}
                    />
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-2xl font-black text-white">{stat.value}</p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => router.push("/friends")}
                className="mt-5 w-full rounded-2xl border border-green-300/20 bg-green-500/15 px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-green-100 transition hover:bg-green-500/25"
              >
                Añadir amigos
              </button>
            </div>
          </aside>

          <section className="space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
              <p className="text-sm font-black uppercase tracking-[0.35em] text-yellow-300">
                Centro principal
              </p>
              <h2 className="mt-3 text-4xl font-black leading-tight text-white">
                Bienvenido a Poorty Goblin Web
              </h2>
              <p className="mt-4 max-w-3xl text-base text-white/78">
                Cree una partida, únase a una sala o prepárese para futuras
                funciones sociales como amigos, mensajes directos, invitaciones y
                perfiles de jugadores.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => router.push("/lobby/create")}
                  className="group rounded-[28px] bg-gradient-to-br from-red-500 via-red-600 to-orange-500 p-6 text-left shadow-2xl transition hover:scale-[1.01]"
                >
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-white/80">
                    Acción principal
                  </p>
                  <h3 className="mt-3 text-3xl font-black text-white">
                    Crear partida
                  </h3>
                  <p className="mt-3 max-w-xs text-sm text-white/85">
                    Abra un lobby nuevo, conviértase en anfitrión y reúna a los
                    jugadores.
                  </p>
                  <p className="mt-6 text-sm font-bold text-white/90 group-hover:translate-x-1 transition">
                    Ir a creación →
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/lobby/join")}
                  className="group rounded-[28px] bg-gradient-to-br from-blue-500 via-cyan-500 to-emerald-400 p-6 text-left shadow-2xl transition hover:scale-[1.01]"
                >
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-950/70">
                    Acción principal
                  </p>
                  <h3 className="mt-3 text-3xl font-black text-slate-950">
                    Unirse a partida
                  </h3>
                  <p className="mt-3 max-w-xs text-sm text-slate-950/80">
                    Entre a un lobby público o use un código privado para
                    conectarse.
                  </p>
                  <p className="mt-6 text-sm font-bold text-slate-950 group-hover:translate-x-1 transition">
                    Ir a unión →
                  </p>
                </button>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-pink-200">
                    Social
                  </p>
                  <h4 className="mt-2 text-xl font-black text-white">
                    Invitar amigos
                  </h4>
                  <p className="mt-2 text-sm text-white/72">
                    Pronto podrá invitar amigos directamente a su lobby y crear
                    sesiones más rápidas.
                  </p>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">
                    Actividad
                  </p>
                  <h4 className="mt-2 text-xl font-black text-white">
                    Actividad reciente
                  </h4>
                  <p className="mt-2 text-sm text-white/72">
                    Aquí aparecerán sus últimas partidas, resultados y movimientos
                    importantes.
                  </p>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-200">
                    Próximamente
                  </p>
                  <h4 className="mt-2 text-xl font-black text-white">
                    Centro de eventos
                  </h4>
                  <p className="mt-2 text-sm text-white/72">
                    Podrá ver novedades, retos y noticias de la plataforma desde
                    esta misma página.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/help")}
              className="rounded-[28px] border border-white/10 bg-white/10 p-5 text-left backdrop-blur-xl transition hover:bg-white/15"
            >
              <p className="text-xs font-black uppercase tracking-[0.24em] text-yellow-300">
                Ayuda
              </p>
              <h3 className="mt-3 text-2xl font-black text-white">
                ¿Cómo empiezo?
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-white/78">
                <li>• Cree una partida o únase a una ya existente.</li>
                <li>• Espere en el lobby hasta iniciar el juego.</li>
                <li>• Defina su orden y seleccione personaje.</li>
                <li>• Use recuperación si olvida su contraseña.</li>
              </ul>
            </button>

              <button
                type="button"
                onClick={() => router.push("/about")}
                className="rounded-[28px] border border-white/10 bg-white/10 p-5 text-left backdrop-blur-xl transition hover:bg-white/15"
              >
                <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">
                  Acerca de
                </p>
                <h3 className="mt-3 text-2xl font-black text-white">
                  Sobre PGW
                </h3>
                <p className="mt-4 text-sm text-white/78">
                  Poorty Goblin Web es la adaptación web de un proyecto original,
                  pensada para llevar la experiencia multijugador a un entorno más
                  moderno, accesible y social.
                </p>
              </button>

              <button
                type="button"
                onClick={() => router.push("/support")}
                className="rounded-[28px] border border-white/10 bg-white/10 p-5 text-left backdrop-blur-xl transition hover:bg-white/15"
              >
                <p className="text-xs font-black uppercase tracking-[0.24em] text-green-300">
                  Soporte
                </p>
                <h3 className="mt-3 text-2xl font-black text-white">
                  ¿Necesita ayuda?
                </h3>
                <p className="mt-4 text-sm text-white/78">
                  Para problemas de cuenta, recuperación de contraseña o errores
                  de la plataforma, puede escribir a:
                </p>
                <p className="mt-3 w-full break-all rounded-2xl bg-black/20 px-3 py-2 text-sm font-bold text-white">
                  poortygoblinweb@gmail.com
                </p>
              </button>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[30px] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-200">
                    Social
                  </p>
                  <h3 className="mt-2 text-2xl font-black text-white">
                    Amigos conectados
                  </h3>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/85"
                >
                  Ver todos
                </button>
              </div>

              <div className="mt-5 space-y-3">
                {mockFriends.map((friend) => (
                  <div
                    key={friend.name}
                    className="flex items-center justify-between rounded-2xl bg-black/20 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 font-black text-slate-950">
                        {friend.name.slice(0, 1)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{friend.name}</p>
                        <p className="text-xs text-white/60">{friend.status}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-white/85 transition hover:bg-white/15"
                    >
                      Perfil
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-pink-200">
                Mensajes directos
              </p>
              <h3 className="mt-2 text-2xl font-black text-white">Bandeja social</h3>

              <div className="mt-5 space-y-3">
                {mockMessages.map((message, index) => (
                  <div
                    key={`${message.from}-${index}`}
                    className="rounded-2xl bg-black/20 p-4"
                  >
                    <p className="text-sm font-bold text-white">{message.from}</p>
                    <p className="mt-1 text-sm text-white/70">{message.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-yellow-200">
                Notificaciones
              </p>
              <h3 className="mt-2 text-2xl font-black text-white">
                Estado de la plataforma
              </h3>

              <div className="mt-5 space-y-3">
                {mockNotifications.map((notification, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75"
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