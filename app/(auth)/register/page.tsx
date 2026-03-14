"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

const registerSchema = z.object({
  email: z.string().email("Ingresa un correo válido."),
  username: z
    .string()
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres.")
    .max(20, "El nombre de usuario no puede superar 20 caracteres."),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres."),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [serverError, setServerError] = useState<string>("");
  const [serverSuccess, setServerSuccess] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError("");
    setServerSuccess("");

    const normalizedEmail = data.email.trim().toLowerCase();
    const normalizedUsername = data.username.trim();

    const { data: existingProfile, error: usernameCheckError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", normalizedUsername)
      .maybeSingle();

    if (usernameCheckError) {
      setServerError("No se pudo validar el nombre de usuario.");
      return;
    }

    if (existingProfile) {
      setServerError("Ese nombre de usuario ya está en uso.");
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: data.password,
      options: {
        data: {
          username: normalizedUsername,
        },
      },
    });

    if (signUpError) {
      setServerError(signUpError.message);
      return;
    }

    setServerSuccess(
      "Cuenta creada correctamente. Revisa tu correo si se requiere confirmación."
    );
    reset();
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#2B1F3D_0%,#142019_30%,#0B130F_65%,#060A08_100%)] px-4 py-10">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(184,255,98,0.05),transparent_18%,transparent_82%,rgba(138,99,246,0.08))]" />
      <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:36px_36px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(184,255,98,0.16),transparent_18%),radial-gradient(circle_at_82%_16%,rgba(138,99,246,0.18),transparent_22%),radial-gradient(circle_at_20%_82%,rgba(84,214,255,0.10),transparent_20%),radial-gradient(circle_at_88%_78%,rgba(217,180,91,0.12),transparent_18%)]" />

      <div className="pointer-events-none absolute left-[8%] top-[12%] h-28 w-28 rounded-full bg-[#B8FF62]/12 blur-3xl" />
      <div className="pointer-events-none absolute right-[10%] top-[14%] h-36 w-36 rounded-full bg-[#8A63F6]/14 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[14%] left-[14%] h-24 w-24 rounded-full bg-[#54D6FF]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[12%] right-[12%] h-28 w-28 rounded-full bg-[#D9B45B]/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[34px] border border-[#F3E7C2]/10 bg-[linear-gradient(180deg,rgba(19,28,23,0.88),rgba(10,15,12,0.88))] shadow-[0_30px_90px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative hidden min-h-full overflow-hidden p-10 lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D9B45B]/25 bg-[#0B120E]/55 px-4 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#B8FF62] shadow-[0_0_12px_rgba(184,255,98,0.95)]" />
                <span className="text-[11px] font-extrabold uppercase tracking-[0.34em] text-[#D9B45B]">
                  Nuevo aventurero
                </span>
              </div>

              <div className="mt-8">
                <Image
                  src="/logo/logopgw.png"
                  alt="Poorty Goblin Web"
                  width={260}
                  height={260}
                  priority
                  className="h-auto w-[180px] drop-shadow-[0_12px_30px_rgba(0,0,0,0.45)]"
                />
              </div>

              <h1 className="mt-8 max-w-md text-4xl font-black leading-tight text-[#F8F2DE]">
                Forja tu lugar en
                <span className="bg-[linear-gradient(135deg,#B8FF62_0%,#D9B45B_55%,#8A63F6_100%)] bg-clip-text text-transparent">
                  {" "}
                  Poorty Goblin Web
                </span>
              </h1>

              <p className="mt-4 max-w-lg text-[15px] leading-7 text-[#D6CFB8]/82">
                Crea tu cuenta, elige tu identidad y prepárate para entrar a una
                experiencia caótica, competitiva y llena de energía goblin.
              </p>
            </div>

            <div className="mt-10 space-y-4">
              <div className="rounded-2xl border border-[#B8FF62]/12 bg-[#152019]/70 p-4">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#B8FF62]">
                  Identidad única
                </p>
                <p className="mt-2 text-sm leading-6 text-[#D8D2BF]/78">
                  Escoge un nombre de usuario propio para que todos te reconozcan
                  dentro de la partida.
                </p>
              </div>

              <div className="rounded-2xl border border-[#8A63F6]/14 bg-[#1A1726]/70 p-4">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#C8B0FF]">
                  Acceso inmediato
                </p>
                <p className="mt-2 text-sm leading-6 text-[#D8D2BF]/78">
                  Una vez dentro, podrás crear salas, unirte a lobbies y comenzar
                  a construir tu experiencia.
                </p>
              </div>

              <div className="rounded-2xl border border-[#D9B45B]/14 bg-[#211A12]/70 p-4">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#E7C772]">
                  Universo PGW
                </p>
                <p className="mt-2 text-sm leading-6 text-[#D8D2BF]/78">
                  Diseñado para sentirse como un mundo propio: brillante, travieso
                  y con personalidad.
                </p>
              </div>
            </div>

            <div className="pointer-events-none absolute -left-16 bottom-0 h-52 w-52 rounded-full bg-[#B8FF62]/10 blur-3xl" />
            <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-full bg-[#8A63F6]/12 blur-3xl" />
          </section>

          <section className="relative p-6 sm:p-8 lg:p-10">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-5 lg:hidden">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#D9B45B]/25 bg-[#0B120E]/55 px-4 py-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#B8FF62] shadow-[0_0_12px_rgba(184,255,98,0.95)]" />
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.34em] text-[#D9B45B]">
                    Nuevo aventurero
                  </span>
                </div>

                <div className="mt-5 flex items-center gap-4">
                  <Image
                    src="/logo/logopgw.png"
                    alt="Poorty Goblin Web"
                    width={140}
                    height={140}
                    priority
                    className="h-auto w-[90px]"
                  />
                  <div>
                    <h1 className="text-2xl font-black text-[#F8F2DE]">
                      Crear cuenta
                    </h1>
                    <p className="mt-1 text-sm text-[#D6CFB8]/78">
                      Únete al universo de Poorty Goblin Web.
                    </p>
                  </div>
                </div>
              </div>

              <div className="hidden lg:block">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#D9B45B]/20 bg-[#0B120E]/60 px-4 py-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#8A63F6] shadow-[0_0_12px_rgba(138,99,246,0.95)]" />
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.34em] text-[#D9B45B]">
                    Crear cuenta
                  </span>
                </div>

                <h2 className="mt-6 text-3xl font-black tracking-tight text-[#F8F2DE]">
                  Regístrate
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#D6CFB8]/78">
                  Crea tu cuenta con correo, contraseña y un nombre de usuario
                  único.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-bold tracking-wide text-[#D9B45B]">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    className="w-full rounded-2xl border border-[#E7D7A4]/12 bg-[#18211D]/90 px-4 py-3 text-[#F8F2DE] outline-none transition placeholder:text-[#A9B19D] focus:border-[#8A63F6]/55 focus:bg-[#1B2520] focus:shadow-[0_0_0_4px_rgba(138,99,246,0.12),0_0_18px_rgba(138,99,246,0.12)]"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="mt-2 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold tracking-wide text-[#D9B45B]">
                    Nombre de usuario
                  </label>
                  <input
                    type="text"
                    placeholder="tu_usuario"
                    className="w-full rounded-2xl border border-[#E7D7A4]/12 bg-[#18211D]/90 px-4 py-3 text-[#F8F2DE] outline-none transition placeholder:text-[#A9B19D] focus:border-[#B8FF62]/60 focus:bg-[#1B2520] focus:shadow-[0_0_0_4px_rgba(184,255,98,0.12),0_0_18px_rgba(184,255,98,0.12)]"
                    {...register("username")}
                  />
                  {errors.username && (
                    <p className="mt-2 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold tracking-wide text-[#D9B45B]">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    placeholder="********"
                    className="w-full rounded-2xl border border-[#E7D7A4]/12 bg-[#18211D]/90 px-4 py-3 text-[#F8F2DE] outline-none transition placeholder:text-[#A9B19D] focus:border-[#54D6FF]/55 focus:bg-[#1B2520] focus:shadow-[0_0_0_4px_rgba(84,214,255,0.12),0_0_18px_rgba(84,214,255,0.12)]"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="mt-2 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {serverError && (
                  <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {serverError}
                  </p>
                )}

                {serverSuccess && (
                  <p className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                    {serverSuccess}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-2xl border border-[#F2E5B8]/10 bg-[linear-gradient(135deg,#B8FF62_0%,#86F16B_28%,#D9B45B_68%,#8A63F6_100%)] px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-[#132117] shadow-[0_16px_32px_rgba(0,0,0,0.30),0_0_20px_rgba(184,255,98,0.10)] transition duration-300 hover:scale-[1.01] hover:shadow-[0_20px_38px_rgba(0,0,0,0.36),0_0_24px_rgba(138,99,246,0.16)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
                </button>
              </form>

              <div className="mt-7 text-center">
                <p className="text-sm text-[#D6CFB8]/80">
                  ¿Ya tienes una cuenta?{" "}
                  <Link
                    href="/"
                    className="font-extrabold text-[#B8FF62] underline decoration-[#D9B45B]/60 underline-offset-4 transition hover:text-[#DFFF9B]"
                  >
                    Volver al inicio
                  </Link>
                </p>
              </div>
            </div>

            <div className="pointer-events-none absolute bottom-0 right-0 h-44 w-44 rounded-full bg-[#8A63F6]/10 blur-3xl" />
          </section>
        </div>
      </div>
    </main>
  );
}