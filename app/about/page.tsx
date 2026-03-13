"use client";

import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-violet-950 via-indigo-900 to-blue-950 text-white">
      <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_35%)]" />

      <div className="relative mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/logo/logompw.png"
              alt="Mario Poorty Web"
              width={90}
              height={90}
              className="h-16 w-16 rounded-2xl object-cover"
              priority
            />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-fuchsia-300">
                Información del proyecto
              </p>
              <h1 className="mt-1 text-3xl font-black">Acerca de</h1>
            </div>
          </div>

          <Link
            href="/home"
            className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-white/15"
          >
            Volver al inicio
          </Link>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[30px] border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-fuchsia-300">
              Mario Poorty Web
            </p>
            <h2 className="mt-3 text-4xl font-black leading-tight">
              Una adaptación web pensada para jugar en línea.
            </h2>

            <p className="mt-5 text-base leading-7 text-white/80">
              Mario Poorty Web nace como una evolución del proyecto original Mario
              Poorty, con el objetivo de trasladar la experiencia multijugador a
              una plataforma moderna, accesible desde navegador y preparada para
              crecer con funciones sociales y de juego en tiempo real.
            </p>

            <p className="mt-4 text-base leading-7 text-white/80">
              Esta versión busca integrar autenticación, lobbies, selección de
              orden, selección de personaje, partida compartida y futuras
              funciones como amigos, mensajes directos, estadísticas y soporte
              integrado.
            </p>
          </div>

          <div className="space-y-6">
            <div className="rounded-[30px] border border-white/10 bg-black/20 p-6">
              <h3 className="text-2xl font-black text-cyan-200">Objetivo</h3>
              <p className="mt-3 text-sm leading-6 text-white/78">
                Convertir el proyecto en una plataforma de juego web más social,
                visual y accesible, sin depender de configuraciones locales
                complejas.
              </p>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-black/20 p-6">
              <h3 className="text-2xl font-black text-yellow-200">Estado actual</h3>
              <p className="mt-3 text-sm leading-6 text-white/78">
                El proyecto ya cuenta con autenticación, recuperación de
                contraseña, creación y unión a lobbies, y varias interfaces
                principales del flujo de juego.
              </p>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-black/20 p-6">
              <h3 className="text-2xl font-black text-green-200">Próximas metas</h3>
              <p className="mt-3 text-sm leading-6 text-white/78">
                Perfil más completo, estadísticas reales, amigos, mensajes
                directos, mejoras visuales del tablero y expansión de la
                experiencia social del juego.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}