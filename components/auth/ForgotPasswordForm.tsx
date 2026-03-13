"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";

const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, "Debes ingresar tu correo o nombre de usuario."),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

type EmailLookupRow = {
  email: string;
};

export default function ForgotPasswordForm() {
  const [serverError, setServerError] = useState("");
  const [serverSuccess, setServerSuccess] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      identifier: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordData) => {
    setServerError("");
    setServerSuccess("");

    const normalizedIdentifier = data.identifier.trim().toLowerCase();
    let emailToUse = normalizedIdentifier;

    if (!normalizedIdentifier.includes("@")) {
      const { data: result, error: rpcError } = await supabase.rpc(
        "get_email_by_username",
        { input_username: normalizedIdentifier }
      );

      if (rpcError) {
        setServerError("No se pudo procesar la recuperación en este momento.");
        return;
      }

      const rows = result as EmailLookupRow[] | null;

      if (!rows || rows.length === 0 || !rows[0]?.email) {
        setServerSuccess(
          "Si existe una cuenta asociada, te enviaremos instrucciones para restablecer tu contraseña."
        );
        return;
      }

      emailToUse = rows[0].email;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(emailToUse, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
        console.error("Error recovery:", error);
        setServerError(error.message);
        return;
    }

    setServerSuccess(
      "Si existe una cuenta asociada, te enviaremos instrucciones para restablecer tu contraseña."
    );
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-blue-900 via-indigo-800 to-purple-700 px-4 py-10">
      <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:30px_30px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_35%)]" />

      <div className="pointer-events-none absolute left-[10%] top-[12%] h-24 w-24 rounded-full bg-cyan-300/20 blur-2xl" />
      <div className="pointer-events-none absolute right-[12%] top-[18%] h-28 w-28 rounded-full bg-fuchsia-300/20 blur-2xl" />
      <div className="pointer-events-none absolute bottom-[15%] left-[14%] h-24 w-24 rounded-full bg-yellow-200/15 blur-2xl" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1fr_440px]">
          <section className="hidden lg:block">
            <div className="max-w-xl">
              <p className="text-sm font-extrabold uppercase tracking-[0.4em] text-cyan-200">
                Recuperación
              </p>

              <h1 className="mt-4 text-5xl font-black leading-tight text-white">
                Vuelva a la partida sin perder el ritmo.
              </h1>

              <p className="mt-5 text-lg text-white/80">
                Ingrese su correo o nombre de usuario y le enviaremos las
                instrucciones para restablecer su contraseña.
              </p>

              <div className="mt-8">
                <Image
                  src="/logo/logopgw.png"
                  alt="Poorty Web"
                  width={420}
                  height={420}
                  priority
                  className="h-auto w-[220px] drop-shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
                />
              </div>
            </div>
          </section>

          <section className="w-full">
            <div className="mx-auto w-full max-w-md rounded-[32px] border border-cyan-200/40 bg-white/95 p-8 shadow-2xl backdrop-blur">
              <div className="mb-6 flex flex-col items-center text-center lg:hidden">
                <Image
                  src="/logo/logopgw.png"
                  alt="Poorty Web"
                  width={240}
                  height={240}
                  priority
                  className="mb-4 h-auto w-[150px]"
                />
              </div>

              <p className="text-sm font-extrabold uppercase tracking-[0.35em] text-cyan-700">
                ¿Olvidó su contraseña?
              </p>

              <h2 className="mt-3 text-3xl font-black text-gray-900">
                Recuperar acceso
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                Puede usar su correo o su nombre de usuario.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-indigo-700">
                    Correo o nombre de usuario
                  </label>
                  <input
                    type="text"
                    placeholder="correo o usuario"
                    className="w-full rounded-2xl border border-cyan-200 bg-cyan-50/40 px-4 py-3 text-gray-900 outline-none transition focus:border-indigo-500"
                    {...register("identifier")}
                  />
                  {errors.identifier && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.identifier.message}
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
                  className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-extrabold uppercase tracking-[0.15em] text-white transition hover:bg-indigo-700 disabled:opacity-60"
                >
                  {isSubmitting ? "Enviando..." : "Enviar instrucciones"}
                </button>
              </form>

              <div className="mt-6 flex flex-col items-center gap-3 text-center">
                <Link
                  href="/"
                  className="text-sm font-bold text-blue-700 transition hover:text-blue-800"
                >
                  VOLVER AL INICIO
                </Link>

                <Link
                  href="/register"
                  className="text-sm font-semibold text-green-700 transition hover:text-green-800"
                >
                  ¿No tiene cuenta? Regístrese aquí
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}