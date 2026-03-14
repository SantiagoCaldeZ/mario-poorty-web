"use client";

import Image from "next/image";
import Link from "next/link";

const supportTopics = [
  "Problemas de inicio de sesión",
  "Recuperación de contraseña",
  "Errores al crear o unirse a partidas",
  "Dudas sobre funcionamiento del lobby",
  "Reportes de bugs visuales o técnicos",
];

export default function SupportPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#2C2218_0%,#17120D_32%,#0A0907_72%,#050505_100%)] text-[#F7F0DC]">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(201,119,59,0.07),transparent_18%,transparent_82%,rgba(134,182,75,0.05))]" />
      <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,rgba(255,244,214,0.75)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,244,214,0.75)_1px,transparent_1px)] [background-size:38px_38px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(201,119,59,0.16),transparent_18%),radial-gradient(circle_at_84%_14%,rgba(217,180,91,0.12),transparent_18%),radial-gradient(circle_at_18%_82%,rgba(134,182,75,0.10),transparent_16%),radial-gradient(circle_at_86%_80%,rgba(79,195,161,0.08),transparent_18%)]" />

      <div className="pointer-events-none absolute left-[8%] top-[12%] h-32 w-32 rounded-full bg-[#C9773B]/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[10%] top-[14%] h-40 w-40 rounded-full bg-[#D9B45B]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[14%] left-[12%] h-28 w-28 rounded-full bg-[#86B64B]/8 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[10%] right-[14%] h-28 w-28 rounded-full bg-[#4FC3A1]/8 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 overflow-hidden rounded-[32px] border border-[#E6D1A5]/10 bg-[linear-gradient(180deg,rgba(39,29,22,0.96),rgba(21,16,12,0.96))] shadow-[0_22px_70px_rgba(0,0,0,0.38)]">
          <div className="border-b border-[#E6D1A5]/8 bg-[linear-gradient(90deg,rgba(201,119,59,0.12),rgba(217,180,91,0.06),rgba(134,182,75,0.05))] px-5 py-3">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-[#D9B45B]">
              Mesa de reparación
            </p>
          </div>

          <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="pointer-events-none absolute inset-0 rounded-[24px] bg-[#C9773B]/10 blur-xl" />
                <div className="relative rounded-[24px] border border-[#E6D1A5]/12 bg-[#120F0C] p-2 shadow-[0_10px_24px_rgba(0,0,0,0.35)]">
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
                <p className="text-xs font-black uppercase tracking-[0.35em] text-[#FFD0A8]">
                  Atención y contacto
                </p>
                <h1 className="mt-1 text-3xl font-black text-[#FFF5E3]">
                  Soporte
                </h1>
              </div>
            </div>

            <Link
              href="/home"
              className="rounded-[20px] border border-[#E6D1A5]/10 bg-[#1B1511] px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-[#F4E8D1] transition hover:border-[#C9773B]/20 hover:bg-[#241B16]"
            >
              Volver al inicio
            </Link>
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="overflow-hidden rounded-[32px] border border-[#E6D1A5]/10 bg-[linear-gradient(180deg,rgba(42,31,23,0.96),rgba(24,18,14,0.96))] shadow-[0_22px_70px_rgba(0,0,0,0.38)]">
            <div className="border-b border-[#E6D1A5]/8 bg-[linear-gradient(135deg,rgba(201,119,59,0.14),rgba(217,180,91,0.08),rgba(134,182,75,0.05))] px-6 py-5">
              <p className="text-xs font-black uppercase tracking-[0.35em] text-[#FFD0A8]">
                ¿Necesita ayuda?
              </p>
              <h2 className="mt-3 text-4xl font-black leading-tight text-[#FFF5E3]">
                Escríbanos y cuéntenos qué ocurrió.
              </h2>
            </div>

            <div className="p-6">
              <p className="text-base leading-7 text-[#E3D3B5]/84">
                Si tiene problemas con su cuenta, recuperación de contraseña,
                errores de la plataforma o dudas de uso, puede escribir al correo
                oficial del proyecto.
              </p>

              <div className="mt-6 overflow-hidden rounded-[24px] border border-[#E6D1A5]/10 bg-[#17110E] shadow-[0_12px_30px_rgba(0,0,0,0.24)]">
                <div className="border-b border-[#E6D1A5]/8 bg-[linear-gradient(90deg,rgba(217,180,91,0.10),rgba(201,119,59,0.05))] px-5 py-4">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#F4D89C]">
                    Correo de soporte
                  </p>
                </div>
                <div className="p-5">
                  <a
                    href="mailto:poortygoblinweb@gmail.com"
                    className="block break-all text-xl font-black text-[#FFF5E3] underline decoration-[#C9773B] underline-offset-4"
                  >
                    poortygoblinweb@gmail.com
                  </a>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-[24px] border border-[#E6D1A5]/10 bg-[#17110E] shadow-[0_12px_30px_rgba(0,0,0,0.24)]">
                <div className="border-b border-[#E6D1A5]/8 bg-[linear-gradient(90deg,rgba(134,182,75,0.10),rgba(79,195,161,0.05))] px-5 py-4">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#D8F1AA]">
                    Recomendación
                  </p>
                </div>
                <div className="p-5">
                  <p className="text-sm leading-6 text-[#E3D3B5]/80">
                    Incluya su nombre de usuario y una descripción clara del problema
                    para que el soporte sea más rápido y preciso.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="overflow-hidden rounded-[30px] border border-[#E6D1A5]/10 bg-[linear-gradient(180deg,rgba(36,27,20,0.96),rgba(20,15,11,0.96))] shadow-[0_18px_55px_rgba(0,0,0,0.34)]">
              <div className="border-b border-[#E6D1A5]/8 bg-[linear-gradient(90deg,rgba(84,214,255,0.10),rgba(217,180,91,0.05))] px-6 py-4">
                <h3 className="text-2xl font-black text-[#BDEEFF]">
                  Temas comunes de soporte
                </h3>
              </div>

              <div className="p-6">
                <ul className="space-y-3 text-sm text-[#E3D3B5]/82">
                  {supportTopics.map((topic) => (
                    <li
                      key={topic}
                      className="rounded-[20px] border border-[#E6D1A5]/10 bg-[#17110E] px-4 py-3"
                    >
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="overflow-hidden rounded-[30px] border border-[#E6D1A5]/10 bg-[linear-gradient(180deg,rgba(36,27,20,0.96),rgba(20,15,11,0.96))] shadow-[0_18px_55px_rgba(0,0,0,0.34)]">
              <div className="border-b border-[#E6D1A5]/8 bg-[linear-gradient(90deg,rgba(217,180,91,0.10),rgba(201,119,59,0.05))] px-6 py-4">
                <h3 className="text-2xl font-black text-[#F4D89C]">
                  Estado actual del soporte
                </h3>
              </div>
              <div className="p-6">
                <p className="text-sm leading-6 text-[#E3D3B5]/80">
                  Por ahora el soporte funciona principalmente por correo
                  electrónico. Más adelante podrá integrarse un sistema de
                  solicitudes o reportes desde la misma plataforma.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}