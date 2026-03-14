"use client";

import Image from "next/image";
import Link from "next/link";

const helpItems = [
  {
    title: "¿Cómo crear una partida?",
    text: "Desde la página principal, seleccione “Crear partida”. Luego podrá configurar si la sala será pública o privada y esperar a que entren otros jugadores.",
  },
  {
    title: "¿Cómo unirse a una partida?",
    text: "Puede entrar a una sala pública desde la opción “Unirse a partida” o usar un código de acceso si la sala es privada.",
  },
  {
    title: "¿Qué pasa en el lobby?",
    text: "En el lobby los jugadores esperan a que el anfitrión inicie la partida. Desde ahí se prepara la fase de orden y luego la selección de personajes.",
  },
  {
    title: "¿Cómo funciona la definición de orden?",
    text: "Cada jugador escoge un número y el sistema determina el orden comparándolo con un número aleatorio. Si no escoge a tiempo, el sistema puede asignarlo automáticamente.",
  },
  {
    title: "¿Cómo recupero mi contraseña?",
    text: "Desde la pantalla de inicio de sesión puede usar “¿Olvidó su contraseña?” para solicitar un enlace de recuperación.",
  },
  {
    title: "¿Qué hago si algo no funciona?",
    text: "Puede revisar la sección de soporte o escribir al correo oficial del proyecto para reportar el problema.",
  },
];

export default function HelpPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#1E2E2F_0%,#111B1D_32%,#090D0E_72%,#050607_100%)] text-[#F7F0DC]">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(84,214,255,0.06),transparent_18%,transparent_82%,rgba(217,180,91,0.05))]" />
      <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,rgba(255,244,214,0.75)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,244,214,0.75)_1px,transparent_1px)] [background-size:38px_38px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(84,214,255,0.14),transparent_18%),radial-gradient(circle_at_84%_14%,rgba(217,180,91,0.12),transparent_18%),radial-gradient(circle_at_18%_82%,rgba(134,182,75,0.10),transparent_16%),radial-gradient(circle_at_86%_80%,rgba(138,99,246,0.08),transparent_18%)]" />

      <div className="pointer-events-none absolute left-[8%] top-[12%] h-32 w-32 rounded-full bg-[#54D6FF]/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[10%] top-[14%] h-40 w-40 rounded-full bg-[#D9B45B]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[14%] left-[12%] h-28 w-28 rounded-full bg-[#86B64B]/8 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[10%] right-[14%] h-28 w-28 rounded-full bg-[#8A63F6]/8 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 overflow-hidden rounded-[32px] border border-[#E6D1A5]/10 bg-[linear-gradient(180deg,rgba(24,35,38,0.96),rgba(14,20,22,0.96))] shadow-[0_22px_70px_rgba(0,0,0,0.38)]">
          <div className="border-b border-[#E6D1A5]/8 bg-[linear-gradient(90deg,rgba(84,214,255,0.12),rgba(217,180,91,0.06),rgba(134,182,75,0.05))] px-5 py-3">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-[#D9B45B]">
              Mesa de mapas
            </p>
          </div>

          <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="pointer-events-none absolute inset-0 rounded-[24px] bg-[#54D6FF]/10 blur-xl" />
                <div className="relative rounded-[24px] border border-[#E6D1A5]/12 bg-[#0F1416] p-2 shadow-[0_10px_24px_rgba(0,0,0,0.35)]">
                  <Image
                    src="/logo/logopgw.png"
                    alt="Poorty Goblin Web"
                    width={90}
                    height={90}
                    className="h-16 w-16 rounded-[18px] object-cover"
                    priority
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.35em] text-[#8FDFFF]">
                  Centro de ayuda
                </p>
                <h1 className="mt-1 text-3xl font-black text-[#FFF5E3]">
                  Ayuda
                </h1>
              </div>
            </div>

            <Link
              href="/home"
              className="rounded-[20px] border border-[#E6D1A5]/10 bg-[#12191B] px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-[#F4E8D1] transition hover:border-[#54D6FF]/20 hover:bg-[#182225]"
            >
              Volver al inicio
            </Link>
          </div>
        </div>

        <section className="mb-8 overflow-hidden rounded-[32px] border border-[#E6D1A5]/10 bg-[linear-gradient(180deg,rgba(26,39,42,0.96),rgba(14,20,22,0.96))] shadow-[0_22px_70px_rgba(0,0,0,0.38)]">
          <div className="border-b border-[#E6D1A5]/8 bg-[linear-gradient(135deg,rgba(84,214,255,0.14),rgba(217,180,91,0.08),rgba(134,182,75,0.06))] px-6 py-5">
            <h2 className="text-4xl font-black leading-tight text-[#FFF5E3]">
              Todo lo que necesita para empezar a jugar.
            </h2>
            <p className="mt-4 max-w-3xl text-[#E3D3B5]/82">
              Aquí encontrará respuestas rápidas sobre partidas, lobby,
              recuperación de acceso y funcionamiento general de Poorty Goblin Web.
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {helpItems.map((item, index) => (
            <article
              key={item.title}
              className="overflow-hidden rounded-[28px] border border-[#E6D1A5]/10 bg-[linear-gradient(180deg,rgba(24,35,38,0.96),rgba(13,19,21,0.96))] shadow-[0_18px_55px_rgba(0,0,0,0.34)]"
            >
              <div
                className={`border-b border-[#E6D1A5]/8 px-5 py-4 ${
                  index % 3 === 0
                    ? "bg-[linear-gradient(90deg,rgba(84,214,255,0.10),rgba(217,180,91,0.04))]"
                    : index % 3 === 1
                    ? "bg-[linear-gradient(90deg,rgba(217,180,91,0.10),rgba(134,182,75,0.04))]"
                    : "bg-[linear-gradient(90deg,rgba(134,182,75,0.10),rgba(84,214,255,0.04))]"
                }`}
              >
                <h3 className="text-xl font-black text-[#FFF2DF]">{item.title}</h3>
              </div>
              <div className="p-5">
                <p className="text-sm leading-6 text-[#E3D3B5]/80">{item.text}</p>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}