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
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-sky-950 via-blue-900 to-cyan-900 text-white">
      <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_35%)]" />

      <div className="relative mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/logo/logopgw.png"
              alt="Poorty Goblin Web"
              width={90}
              height={90}
              className="h-16 w-16 rounded-2xl object-cover"
              priority
            />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-300">
                Centro de ayuda
              </p>
              <h1 className="mt-1 text-3xl font-black">Ayuda</h1>
            </div>
          </div>

          <Link
            href="/home"
            className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-white/15"
          >
            Volver al inicio
          </Link>
        </div>

        <section className="mb-8 rounded-[30px] border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
          <h2 className="text-4xl font-black leading-tight">
            Todo lo que necesita para empezar a jugar.
          </h2>
          <p className="mt-4 max-w-3xl text-white/80">
            Aquí encontrará respuestas rápidas sobre partidas, lobby,
            recuperación de acceso y funcionamiento general de Poorty Goblin Web.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {helpItems.map((item) => (
            <article
              key={item.title}
              className="rounded-[28px] border border-white/10 bg-black/20 p-5"
            >
              <h3 className="text-xl font-black text-cyan-200">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/78">{item.text}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}