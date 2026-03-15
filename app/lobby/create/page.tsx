"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const GAME_MODE_KEY = "classic_expedition";
const GAME_MODE_LABEL = "Expedición clásica";

export default function CreateLobbyPage() {
  const router = useRouter();
  const [matchType, setMatchType] = useState<"public" | "private">("public");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    const redirectIfAlreadyInLobby = async () => {
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
        setPageLoading(false);
        return;
      }

      if (activeMembership?.lobby_id) {
        router.replace(`/lobby/${activeMembership.lobby_id}`);
        return;
      }

      setPageLoading(false);
    };

    redirectIfAlreadyInLobby();
  }, [router]);

  const handleCreateLobby = async () => {
    setServerError("");
    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setServerError("Debes iniciar sesión para crear una sala.");
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
      setServerError("Ya perteneces a una sala activa. Debes salir de ella primero.");
      setLoading(false);
      return;
    }

    const { data: lobbyId, error } = await supabase.rpc("create_lobby_safely", {
      target_type: matchType,
      target_game_mode: GAME_MODE_KEY,
    });

    if (error || !lobbyId) {
      setServerError(error?.message ?? "No se pudo crear la sala.");
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push(`/lobby/${lobbyId}`);
  };

  if (pageLoading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#2B130E_0%,#160A08_44%,#070405_100%)] px-4">
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,rgba(255,221,196,0.8)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,221,196,0.8)_1px,transparent_1px)] [background-size:40px_40px]" />
        <div className="absolute left-[10%] top-[12%] h-36 w-36 rounded-full bg-[#FF7B39]/14 blur-3xl" />
        <div className="absolute right-[12%] top-[18%] h-40 w-40 rounded-full bg-[#FFB34D]/12 blur-3xl" />
        <div className="absolute bottom-[10%] left-[24%] h-32 w-32 rounded-full bg-[#FF4D6D]/10 blur-3xl" />

        <div className="relative flex min-h-screen items-center justify-center">
          <div className="rounded-[32px] border border-[#FFD4B3]/12 bg-[#140B09]/88 px-8 py-7 text-center shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-md">
            <p className="text-xs font-black uppercase tracking-[0.34em] text-[#FFB76A]">
              Círculo de forja
            </p>
            <p className="mt-3 text-lg font-bold text-[#FFF3E4]">
              Preparando el ritual de creación...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#351610_0%,#1B0D0A_38%,#090506_100%)] text-[#FFF2E6]">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,123,57,0.08),transparent_24%,transparent_78%,rgba(255,179,77,0.06))]" />
      <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,rgba(255,221,196,0.8)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,221,196,0.8)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(255,123,57,0.16),transparent_18%),radial-gradient(circle_at_86%_14%,rgba(255,179,77,0.14),transparent_18%),radial-gradient(circle_at_20%_84%,rgba(255,77,109,0.12),transparent_16%)]" />

      <div className="pointer-events-none absolute left-[8%] top-[14%] h-40 w-40 rounded-full bg-[#FF7B39]/14 blur-3xl" />
      <div className="pointer-events-none absolute right-[9%] top-[16%] h-44 w-44 rounded-full bg-[#FFB34D]/12 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[10%] right-[16%] h-36 w-36 rounded-full bg-[#FF4D6D]/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="overflow-hidden rounded-[36px] border border-[#FFD4B3]/10 bg-[linear-gradient(180deg,rgba(46,21,16,0.96),rgba(20,10,8,0.96))] shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
            <div className="border-b border-[#FFD4B3]/10 bg-[linear-gradient(90deg,rgba(255,123,57,0.18),rgba(255,179,77,0.08),rgba(255,77,109,0.08))] px-6 py-5">
              <p className="text-[11px] font-black uppercase tracking-[0.36em] text-[#FFB76A]">
                Altar del campamento
              </p>
            </div>

            <div className="p-6">
              <div className="rounded-[30px] border border-[#FFD4B3]/10 bg-[linear-gradient(135deg,rgba(72,26,18,0.98),rgba(28,14,12,0.98))] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.28)]">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#FF9F74]">
                  Invocación
                </p>

                <h1 className="mt-3 text-4xl font-black leading-tight text-[#FFF5EA] sm:text-5xl">
                  Crear
                  <span className="bg-[linear-gradient(135deg,#FFB34D_0%,#FF7B39_45%,#FF4D6D_100%)] bg-clip-text text-transparent">
                    {" "}
                    partida
                  </span>
                </h1>

                <p className="mt-4 max-w-xl text-base leading-7 text-[#F3D5C0]/82">
                  Levanta una nueva mesa del campamento y decide si la expedición
                  será abierta a todos o guardada para tu círculo privado.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[22px] border border-[#FFD4B3]/10 bg-[#140B09]/72 px-4 py-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#FFB76A]">
                      Modalidad pública
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#F3D5C0]/76">
                      Visible para jugadores disponibles en la lista pública.
                    </p>
                  </div>

                  <div className="rounded-[22px] border border-[#FFD4B3]/10 bg-[#140B09]/72 px-4 py-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#FF92A8]">
                      Modalidad privada
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#F3D5C0]/76">
                      Protegida con código para reunir solo a tu propio grupo.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-[28px] border border-[#FFD4B3]/10 bg-[#140B09]/78 p-5">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FFD09C]">
                  Ritual del anfitrión
                </p>

                <ul className="mt-4 space-y-3 text-sm leading-6 text-[#F3D5C0]/78">
                  <li>• La sala se crea de inmediato bajo tu mando como host.</li>
                  <li>• Desde el lobby podrás esperar jugadores e iniciar la partida.</li>
                  <li>• La opción privada generará un código único para compartir.</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-[36px] border border-[#FFD4B3]/10 bg-[linear-gradient(180deg,rgba(31,14,12,0.96),rgba(16,9,8,0.98))] shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
            <div className="border-b border-[#FFD4B3]/10 bg-[linear-gradient(90deg,rgba(255,123,57,0.16),rgba(255,179,77,0.06))] px-6 py-5">
              <p className="text-[11px] font-black uppercase tracking-[0.34em] text-[#FFD09C]">
                Forja de sala
              </p>
            </div>

            <div className="p-6">
              <div className="grid gap-4">
                <button
                  type="button"
                  onClick={() => setMatchType("public")}
                  className={`group rounded-[28px] border p-5 text-left transition duration-300 ${
                    matchType === "public"
                      ? "border-[#FFB34D]/28 bg-[linear-gradient(135deg,rgba(255,179,77,0.22),rgba(49,24,16,0.98),rgba(19,10,8,0.98))] shadow-[0_18px_40px_rgba(255,179,77,0.08)]"
                      : "border-[#FFD4B3]/10 bg-[#140B09]/72 hover:border-[#FFB34D]/18 hover:bg-[#1B0E0B]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FFB76A]">
                        Expedición abierta
                      </p>
                      <h2 className="mt-2 text-2xl font-black text-[#FFF5EA]">
                        Partida pública
                      </h2>
                      <p className="mt-3 max-w-xl text-sm leading-6 text-[#F3D5C0]/78">
                        Ideal para que nuevos jugadores entren desde la lista de
                        salas disponibles del campamento.
                      </p>
                    </div>

                    <div
                      className={`mt-1 h-5 w-5 rounded-full border-2 ${
                        matchType === "public"
                          ? "border-[#FFB34D] bg-[#FFB34D]"
                          : "border-[#FFD4B3]/24 bg-transparent"
                      }`}
                    />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMatchType("private")}
                  className={`group rounded-[28px] border p-5 text-left transition duration-300 ${
                    matchType === "private"
                      ? "border-[#FF7AA2]/28 bg-[linear-gradient(135deg,rgba(255,77,109,0.22),rgba(54,18,22,0.98),rgba(19,10,8,0.98))] shadow-[0_18px_40px_rgba(255,77,109,0.08)]"
                      : "border-[#FFD4B3]/10 bg-[#140B09]/72 hover:border-[#FF7AA2]/18 hover:bg-[#1B0E0B]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FF92A8]">
                        Círculo sellado
                      </p>
                      <h2 className="mt-2 text-2xl font-black text-[#FFF5EA]">
                        Partida privada
                      </h2>
                      <p className="mt-3 max-w-xl text-sm leading-6 text-[#F3D5C0]/78">
                        Se crea con código de acceso para que invites solo a quienes
                        quieras dentro de la expedición.
                      </p>
                    </div>

                    <div
                      className={`mt-1 h-5 w-5 rounded-full border-2 ${
                        matchType === "private"
                          ? "border-[#FF7AA2] bg-[#FF7AA2]"
                          : "border-[#FFD4B3]/24 bg-transparent"
                      }`}
                    />
                  </div>
                </button>
              </div>

              <div className="mt-5 rounded-[26px] border border-[#FFD4B3]/10 bg-[linear-gradient(135deg,rgba(255,179,77,0.08),rgba(20,11,9,0.94))] p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#FFD09C]">
                  Modo de expedición
                </p>
                <p className="mt-2 text-lg font-black text-[#FFF5EA]">
                  {GAME_MODE_LABEL}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#F3D5C0]/76">
                  Modo principal de PGW. Una aventura por rutas, casillas, eventos
                  y competencia entre jugadores.
                </p>
              </div>

              {serverError && (
                <div className="mt-5 rounded-[22px] border border-[#FF7B39]/18 bg-[#381611] px-4 py-4 text-sm text-[#FFD2C2]">
                  {serverError}
                </div>
              )}

              <div className="mt-6 rounded-[26px] border border-[#FFD4B3]/10 bg-[linear-gradient(135deg,rgba(255,179,77,0.08),rgba(20,11,9,0.94))] p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#FFD09C]">
                  Selección actual
                </p>
                <p className="mt-2 text-lg font-black text-[#FFF5EA]">
                  {matchType === "public" ? "Sala pública" : "Sala privada"}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#F3D5C0]/76">
                  {matchType === "public"
                    ? "Tu sala aparecerá disponible para exploradores del campamento."
                    : "Tu sala quedará protegida y lista para compartir por código."}
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/home")}
                  className="rounded-[20px] border border-[#FFD4B3]/10 bg-[#140B09]/80 px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-[#F5E6D6] transition hover:bg-[#1B0E0B]"
                >
                  Volver
                </button>

                <button
                  type="button"
                  onClick={handleCreateLobby}
                  disabled={loading}
                  className="rounded-[20px] bg-[linear-gradient(135deg,#FFB34D_0%,#FF7B39_45%,#FF4D6D_100%)] px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#210C08] shadow-[0_16px_34px_rgba(255,123,57,0.22)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Invocando sala..." : "Crear sala"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}