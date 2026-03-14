"use client";

import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#2C1E34_0%,#17111D_34%,#0B0910_72%,#050507_100%)] text-[#F7F0DC]">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(138,99,246,0.08),transparent_18%,transparent_82%,rgba(217,180,91,0.06))]" />
      <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,rgba(255,244,214,0.75)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,244,214,0.75)_1px,transparent_1px)] [background-size:38px_38px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(138,99,246,0.16),transparent_18%),radial-gradient(circle_at_84%_14%,rgba(217,180,91,0.12),transparent_18%),radial-gradient(circle_at_18%_82%,rgba(84,214,255,0.08),transparent_16%),radial-gradient(circle_at_86%_80%,rgba(201,119,59,0.08),transparent_18%)]" />

      <div className="pointer-events-none absolute left-[8%] top-[12%] h-32 w-32 rounded-full bg-[#8A63F6]/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[10%] top-[14%] h-40 w-40 rounded-full bg-[#D9B45B]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[14%] left-[12%] h-28 w-28 rounded-full bg-[#54D6FF]/8 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[10%] right-[14%] h-28 w-28 rounded-full bg-[#C9773B]/8 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 overflow-hidden rounded-[32px] border border-[#E6D1A5]/10 bg-[linear-gradient(180deg,rgba(32,22,39,0.96),rgba(18,13,22,0.96))] shadow-[0_22px_70px_rgba(0,0,0,0.38)]">
          <div className="border-b border-[#E6D1A5]/8 bg-[linear-gradient(90deg,rgba(138,99,246,0.12),rgba(217,180,91,0.06),rgba(84,214,255,0.05))] px-5 py-3">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-[#D9B45B]">
              Archivo del proyecto
            </p>
          </div>

          <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="pointer-events-none absolute inset-0 rounded-[24px] bg-[#8A63F6]/10 blur-xl" />
                <div className="relative rounded-[24px] border border-[#E6D1A5]/12 bg-[#120E16] p-2 shadow-[0_10px_24px_rgba(0,0,0,0.35)]">
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
                <p className="text-xs font-black uppercase tracking-[0.35em] text-[#CDB9FF]">
                  Información del proyecto
                </p>
                <h1 className="mt-1 text-3xl font-black text-[#FFF5E3]">
                  Acerca de
                </h1>
              </div>
            </div>

            <Link
              href="/home"
              className="rounded-[20px] border border-[#E6D1A5]/10 bg-[#1A1420] px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-[#F4E8D1] transition hover:border-[#8A63F6]/20 hover:bg-[#241A2C]"
            >
              Volver al inicio
            </Link>
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-[32px] border border-[#E6D1A5]/10 bg-[linear-gradient(180deg,rgba(36,25,43,0.96),rgba(19,14,24,0.96))] shadow-[0_22px_70px_rgba(0,0,0,0.38)]">
            <div className="border-b border-[#E6D1A5]/8 bg-[linear-gradient(135deg,rgba(138,99,246,0.14),rgba(217,180,91,0.08),rgba(84,214,255,0.05))] px-6 py-5">
              <p className="text-xs font-black uppercase tracking-[0.35em] text-[#D9B45B]">
                Poorty Goblin Web
              </p>
              <h2 className="mt-3 text-4xl font-black leading-tight text-[#FFF5E3]">
                Una adaptación web pensada para jugar en línea.
              </h2>
            </div>

            <div className="p-6">
              <div className="rounded-[26px] border border-[#E6D1A5]/10 bg-[#140F18] p-5">
                <p className="text-base leading-7 text-[#E3D3B5]/84">
                  Poorty Goblin Web nace como una evolución de un proyecto original,
                  con el objetivo de trasladar la experiencia multijugador a
                  una plataforma moderna, accesible desde navegador y preparada para
                  crecer con funciones sociales y de juego en tiempo real.
                </p>

                <p className="mt-4 text-base leading-7 text-[#E3D3B5]/84">
                  Esta versión busca integrar autenticación, lobbies, selección de
                  orden, selección de personaje, partida compartida y futuras
                  funciones como amigos, mensajes directos, estadísticas y soporte
                  integrado.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="overflow-hidden rounded-[30px] border border-[#E6D1A5]/10 bg-[linear-gradient(180deg,rgba(34,24,41,0.96),rgba(18,13,22,0.96))] shadow-[0_18px_55px_rgba(0,0,0,0.34)]">
              <div className="border-b border-[#E6D1A5]/8 bg-[linear-gradient(90deg,rgba(84,214,255,0.10),rgba(138,99,246,0.05))] px-6 py-4">
                <h3 className="text-2xl font-black text-[#BDEEFF]">Objetivo</h3>
              </div>
              <div className="p-6">
                <p className="text-sm leading-6 text-[#E3D3B5]/80">
                  Convertir el proyecto en una plataforma de juego web más social,
                  visual y accesible, sin depender de configuraciones locales
                  complejas.
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-[30px] border border-[#E6D1A5]/10 bg-[linear-gradient(180deg,rgba(34,24,41,0.96),rgba(18,13,22,0.96))] shadow-[0_18px_55px_rgba(0,0,0,0.34)]">
              <div className="border-b border-[#E6D1A5]/8 bg-[linear-gradient(90deg,rgba(217,180,91,0.10),rgba(201,119,59,0.05))] px-6 py-4">
                <h3 className="text-2xl font-black text-[#F4D89C]">Estado actual</h3>
              </div>
              <div className="p-6">
                <p className="text-sm leading-6 text-[#E3D3B5]/80">
                  El proyecto ya cuenta con autenticación, recuperación de
                  contraseña, creación y unión a lobbies, y varias interfaces
                  principales del flujo de juego.
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-[30px] border border-[#E6D1A5]/10 bg-[linear-gradient(180deg,rgba(34,24,41,0.96),rgba(18,13,22,0.96))] shadow-[0_18px_55px_rgba(0,0,0,0.34)]">
              <div className="border-b border-[#E6D1A5]/8 bg-[linear-gradient(90deg,rgba(134,182,75,0.10),rgba(138,99,246,0.05))] px-6 py-4">
                <h3 className="text-2xl font-black text-[#D8F1AA]">Próximas metas</h3>
              </div>
              <div className="p-6">
                <p className="text-sm leading-6 text-[#E3D3B5]/80">
                  Perfil más completo, estadísticas reales, amigos, mensajes
                  directos, mejoras visuales del tablero y expansión de la
                  experiencia social del juego.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}