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
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-emerald-950 via-teal-900 to-cyan-950 text-white">
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
              <p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-300">
                Atención y contacto
              </p>
              <h1 className="mt-1 text-3xl font-black">Soporte</h1>
            </div>
          </div>

          <Link
            href="/home"
            className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-white/15"
          >
            Volver al inicio
          </Link>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[30px] border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-300">
              ¿Necesita ayuda?
            </p>
            <h2 className="mt-3 text-4xl font-black leading-tight">
              Escríbanos y cuéntenos qué ocurrió.
            </h2>

            <p className="mt-5 text-base leading-7 text-white/80">
              Si tiene problemas con su cuenta, recuperación de contraseña,
              errores de la plataforma o dudas de uso, puede escribir al correo
              oficial del proyecto.
            </p>

            <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-5">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/70">
                Correo de soporte
              </p>
              <a
                href="mailto:mariopoortyweb@gmail.com"
                className="mt-3 block break-all text-xl font-black text-white underline decoration-emerald-300 underline-offset-4"
              >
                mariopoortyweb@gmail.com
              </a>
            </div>

            <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-5">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/70">
                Recomendación
              </p>
              <p className="mt-3 text-sm leading-6 text-white/78">
                Incluya su nombre de usuario y una descripción clara del problema
                para que el soporte sea más rápido y preciso.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[30px] border border-white/10 bg-black/20 p-6">
              <h3 className="text-2xl font-black text-cyan-200">
                Temas comunes de soporte
              </h3>

              <ul className="mt-4 space-y-3 text-sm text-white/80">
                {supportTopics.map((topic) => (
                  <li
                    key={topic}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    {topic}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-black/20 p-6">
              <h3 className="text-2xl font-black text-yellow-200">
                Estado actual del soporte
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/78">
                Por ahora el soporte funciona principalmente por correo
                electrónico. Más adelante podrá integrarse un sistema de
                solicitudes o reportes desde la misma plataforma.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}