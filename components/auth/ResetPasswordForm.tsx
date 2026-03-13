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
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-emerald-700 via-teal-700 to-blue-800 px-4 py-10">
      <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:30px_30px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_35%)]" />

      <div className="pointer-events-none absolute left-[12%] top-[10%] h-24 w-24 rounded-full bg-emerald-200/20 blur-2xl" />
      <div className="pointer-events-none absolute right-[10%] top-[16%] h-28 w-28 rounded-full bg-sky-200/20 blur-2xl" />
      <div className="pointer-events-none absolute bottom-[14%] right-[16%] h-24 w-24 rounded-full bg-yellow-200/15 blur-2xl" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[430px_1fr]">
          <section className="w-full order-2 lg:order-1">
            <div className="mx-auto w-full max-w-md rounded-[32px] border border-emerald-200/40 bg-white/95 p-8 shadow-2xl backdrop-blur">
              <div className="mb-6 flex justify-center lg:hidden">
                <Image
                  src="/logo/logopgw.png"
                  alt="Poorty Web"
                  width={240}
                  height={240}
                  priority
                  className="h-auto w-[150px]"
                />
              </div>

              <p className="text-sm font-extrabold uppercase tracking-[0.35em] text-emerald-700">
                Seguridad
              </p>

              <h2 className="mt-3 text-3xl font-black text-gray-900">
                Nueva contraseña
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                Defina una nueva contraseña para volver a entrar al juego.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-emerald-700">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="********"
                      className="w-full rounded-2xl border border-sky-200 bg-sky-50/40 px-4 py-3 pr-12 text-gray-900 outline-none transition focus:border-emerald-500"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 px-4 text-gray-500 hover:text-emerald-600"
                    >
                      {showPassword ? "Ocultar" : "Ver"}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-emerald-700">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="********"
                      className="w-full rounded-2xl border border-sky-200 bg-sky-50/40 px-4 py-3 pr-12 text-gray-900 outline-none transition focus:border-emerald-500"
                      {...register("confirmPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 px-4 text-gray-500 hover:text-emerald-600"
                    >
                      {showConfirmPassword ? "Ocultar" : "Ver"}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {serverError && (
                  <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    {serverError}
                  </p>
                )}

                {serverSuccess && (
                  <p className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">
                    {serverSuccess}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-extrabold uppercase tracking-[0.15em] text-white transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  {isSubmitting ? "Guardando..." : "Guardar nueva contraseña"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/"
                  className="text-sm font-bold text-blue-700 transition hover:text-blue-800"
                >
                  VOLVER AL INICIO
                </Link>
              </div>
            </div>
          </section>

          <section className="order-1 lg:order-2 hidden lg:flex justify-center">
            <div className="max-w-xl text-center lg:text-left">
              <p className="text-sm font-extrabold uppercase tracking-[0.4em] text-emerald-200">
                Restablecer
              </p>

              <h1 className="mt-4 text-5xl font-black leading-tight text-white">
                Prepare su regreso a Poorty Goblin Web.
              </h1>

              <p className="mt-5 text-lg text-white/80">
                Defina una contraseña nueva y vuelva a entrar con seguridad a su
                partida.
              </p>

              <div className="mt-8 flex justify-center lg:justify-start">
                <Image
                  src="/logo/logopgw.png"
                  alt="Poorty Web"
                  width={420}
                  height={420}
                  priority
                  className="h-auto w-[230px] drop-shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}