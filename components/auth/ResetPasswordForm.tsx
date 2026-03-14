"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres."),
    confirmPassword: z.string().min(1, "Debes confirmar tu contraseña."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [serverSuccess, setServerSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordData) => {
    setServerError("");
    setServerSuccess("");

    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      const message = error.message.toLowerCase();

      if (
        message.includes("same password") ||
        message.includes("different") ||
        message.includes("new password should be different")
      ) {
        setServerError("La nueva contraseña debe ser diferente a la actual.");
        return;
      }

      if (
        message.includes("expired") ||
        message.includes("invalid") ||
        message.includes("token")
      ) {
        setServerError(
          "El enlace de recuperación ya no es válido o expiró. Solicite uno nuevo."
        );
        return;
      }

      setServerError("No se pudo actualizar la contraseña en este momento.");
      return;
    }

    setServerSuccess("La contraseña se actualizó correctamente.");

    window.setTimeout(() => {
      router.push("/");
    }, 1800);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#153C34_0%,#0F211C_34%,#08120F_68%,#050908_100%)] px-4 py-10">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(84,214,255,0.04),transparent_18%,transparent_82%,rgba(184,255,98,0.05))]" />
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,rgba(255,255,255,0.75)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.75)_1px,transparent_1px)] [background-size:34px_34px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(84,214,255,0.12),transparent_18%),radial-gradient(circle_at_82%_14%,rgba(184,255,98,0.12),transparent_20%),radial-gradient(circle_at_18%_82%,rgba(217,180,91,0.10),transparent_16%),radial-gradient(circle_at_86%_78%,rgba(138,99,246,0.08),transparent_18%)]" />

      <div className="pointer-events-none absolute left-[10%] top-[12%] h-28 w-28 rounded-full bg-[#54D6FF]/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[12%] top-[14%] h-36 w-36 rounded-full bg-[#B8FF62]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[12%] left-[14%] h-24 w-24 rounded-full bg-[#D9B45B]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[14%] right-[14%] h-28 w-28 rounded-full bg-[#8A63F6]/8 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[440px_1fr]">
          <section className="order-2 w-full lg:order-1">
            <div className="mx-auto w-full max-w-md rounded-[32px] border border-[#E7D7A4]/12 bg-[#101813]/88 p-8 text-[#F5EFD9] shadow-[0_24px_70px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl">
              <div className="mb-6 flex justify-center lg:hidden">
                <Image
                  src="/logo/logopgw.png"
                  alt="Poorty Goblin Web"
                  width={240}
                  height={240}
                  priority
                  className="h-auto w-[130px]"
                />
              </div>

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#D9B45B]/20 bg-[#0B120E]/70 px-4 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#B8FF62] shadow-[0_0_10px_rgba(184,255,98,0.95)]" />
                <span className="text-[11px] font-extrabold uppercase tracking-[0.34em] text-[#D9B45B]">
                  Renovación del sello
                </span>
              </div>

              <h2 className="text-3xl font-black tracking-tight text-[#F8F2DE]">
                Nueva contraseña
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#D6CFB8]/78">
                Defina una nueva contraseña para volver a entrar con seguridad.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-bold tracking-wide text-[#D9B45B]">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="********"
                      className="w-full rounded-2xl border border-[#D9B45B]/12 bg-[#18221D]/88 px-4 py-3 pr-14 text-[#F8F2DE] outline-none transition placeholder:text-[#A9B19D] focus:border-[#54D6FF]/60 focus:bg-[#1C2821] focus:shadow-[0_0_0_4px_rgba(84,214,255,0.12),0_0_18px_rgba(84,214,255,0.10)]"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-2 flex items-center justify-center rounded-xl px-3 text-[#B9C4AE] transition hover:bg-[#223128] hover:text-[#54D6FF]"
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.89 1 12c.73-2.06 1.94-3.93 3.5-5.44" />
                          <path d="M10.58 10.58A2 2 0 0 0 12 14a2 2 0 0 0 1.42-.58" />
                          <path d="M9.88 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.11 11 8a11.83 11.83 0 0 1-4.24 5.18" />
                          <path d="M1 1l22 22" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold tracking-wide text-[#D9B45B]">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="********"
                      className="w-full rounded-2xl border border-[#D9B45B]/12 bg-[#18221D]/88 px-4 py-3 pr-14 text-[#F8F2DE] outline-none transition placeholder:text-[#A9B19D] focus:border-[#B8FF62]/60 focus:bg-[#1C2821] focus:shadow-[0_0_0_4px_rgba(184,255,98,0.12),0_0_18px_rgba(184,255,98,0.10)]"
                      {...register("confirmPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-2 flex items-center justify-center rounded-xl px-3 text-[#B9C4AE] transition hover:bg-[#223128] hover:text-[#B8FF62]"
                      aria-label={
                        showConfirmPassword
                          ? "Ocultar confirmación de contraseña"
                          : "Mostrar confirmación de contraseña"
                      }
                    >
                      {showConfirmPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.89 1 12c.73-2.06 1.94-3.93 3.5-5.44" />
                          <path d="M10.58 10.58A2 2 0 0 0 12 14a2 2 0 0 0 1.42-.58" />
                          <path d="M9.88 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.11 11 8a11.83 11.83 0 0 1-4.24 5.18" />
                          <path d="M1 1l22 22" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                      {errors.confirmPassword.message}
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
                  className="w-full rounded-2xl border border-[#F2E5B8]/10 bg-[linear-gradient(135deg,#54D6FF_0%,#86F16B_38%,#B8FF62_68%,#D9B45B_100%)] px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-[#132117] shadow-[0_14px_28px_rgba(0,0,0,0.28),0_0_18px_rgba(184,255,98,0.10)] transition duration-300 hover:scale-[1.01] hover:shadow-[0_18px_34px_rgba(0,0,0,0.34),0_0_24px_rgba(184,255,98,0.16)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Guardando..." : "Guardar nueva contraseña"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/"
                  className="text-sm font-bold text-[#8FDFFF] transition hover:text-[#BDEEFF]"
                >
                  VOLVER AL INICIO
                </Link>
              </div>
            </div>
          </section>

          <section className="order-1 hidden justify-center lg:order-2 lg:flex">
            <div className="max-w-xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D9B45B]/20 bg-[#0B120E]/55 px-4 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#B8FF62] shadow-[0_0_12px_rgba(184,255,98,0.95)]" />
                <span className="text-[11px] font-extrabold uppercase tracking-[0.34em] text-[#D9B45B]">
                  Renovación segura
                </span>
              </div>

              <h1 className="mt-6 text-5xl font-black leading-tight text-[#F8F2DE]">
                Vuelva con una
                <span className="bg-[linear-gradient(135deg,#54D6FF_0%,#B8FF62_50%,#D9B45B_100%)] bg-clip-text text-transparent">
                  {" "}
                  nueva protección
                </span>
              </h1>

              <p className="mt-5 max-w-lg text-lg leading-8 text-[#D6CFB8]/82">
                Defina una contraseña nueva para reingresar a Poorty Goblin Web
                con seguridad y continuar la partida.
              </p>

              <div className="mt-8 flex justify-center lg:justify-start">
                <Image
                  src="/logo/logopgw.png"
                  alt="Poorty Goblin Web"
                  width={420}
                  height={420}
                  priority
                  className="h-auto w-[230px] drop-shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
                />
              </div>

              <div className="mt-8 max-w-md rounded-[28px] border border-[#B8FF62]/14 bg-[#111A17]/72 p-5 shadow-[0_12px_35px_rgba(0,0,0,0.28)]">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#B8FF62]">
                  Consejo
                </p>
                <p className="mt-3 text-sm leading-7 text-[#D8D2BF]/78">
                  Use una contraseña diferente a la anterior para evitar rechazos
                  al momento de actualizarla.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}