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
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#203A31_0%,#121E1B_34%,#0A1210_68%,#060A08_100%)] px-4 py-10">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(184,255,98,0.04),transparent_18%,transparent_82%,rgba(84,214,255,0.05))]" />
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,rgba(255,255,255,0.75)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.75)_1px,transparent_1px)] [background-size:34px_34px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(184,255,98,0.14),transparent_18%),radial-gradient(circle_at_82%_14%,rgba(84,214,255,0.14),transparent_20%),radial-gradient(circle_at_18%_82%,rgba(217,180,91,0.10),transparent_16%),radial-gradient(circle_at_86%_78%,rgba(138,99,246,0.10),transparent_18%)]" />

      <div className="pointer-events-none absolute left-[8%] top-[12%] h-28 w-28 rounded-full bg-[#B8FF62]/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[10%] top-[14%] h-36 w-36 rounded-full bg-[#54D6FF]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[14%] left-[14%] h-24 w-24 rounded-full bg-[#D9B45B]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[12%] right-[12%] h-28 w-28 rounded-full bg-[#8A63F6]/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1fr_460px]">
          <section className="hidden lg:block">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D9B45B]/20 bg-[#0B120E]/55 px-4 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#54D6FF] shadow-[0_0_12px_rgba(84,214,255,0.95)]" />
                <span className="text-[11px] font-extrabold uppercase tracking-[0.34em] text-[#D9B45B]">
                  Recuperación arcana
                </span>
              </div>

              <h1 className="mt-6 text-5xl font-black leading-tight text-[#F8F2DE]">
                Recupere el acceso
                <span className="bg-[linear-gradient(135deg,#54D6FF_0%,#B8FF62_45%,#D9B45B_100%)] bg-clip-text text-transparent">
                  {" "}
                  a su guarida
                </span>
              </h1>

              <p className="mt-5 max-w-lg text-lg leading-8 text-[#D6CFB8]/82">
                Ingrese su correo o nombre de usuario y enviaremos el enlace para
                restaurar su acceso de forma segura.
              </p>

              <div className="mt-8">
                <Image
                  src="/logo/logopgw.png"
                  alt="Poorty Goblin Web"
                  width={420}
                  height={420}
                  priority
                  className="h-auto w-[220px] drop-shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
                />
              </div>

              <div className="mt-8 max-w-md rounded-[28px] border border-[#54D6FF]/14 bg-[#111A17]/72 p-5 shadow-[0_12px_35px_rgba(0,0,0,0.28)]">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#8FDFFF]">
                  Nota
                </p>
                <p className="mt-3 text-sm leading-7 text-[#D8D2BF]/78">
                  Por seguridad, mostraremos el mismo mensaje tanto si la cuenta
                  existe como si no.
                </p>
              </div>
            </div>
          </section>

          <section className="w-full">
            <div className="mx-auto w-full max-w-md rounded-[32px] border border-[#E7D7A4]/12 bg-[#101813]/88 p-8 text-[#F5EFD9] shadow-[0_24px_70px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl">
              <div className="mb-6 flex flex-col items-center text-center lg:hidden">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#D9B45B]/20 bg-[#0B120E]/70 px-4 py-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#54D6FF] shadow-[0_0_10px_rgba(84,214,255,0.95)]" />
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.34em] text-[#D9B45B]">
                    Recuperación arcana
                  </span>
                </div>

                <Image
                  src="/logo/logopgw.png"
                  alt="Poorty Goblin Web"
                  width={240}
                  height={240}
                  priority
                  className="mt-5 h-auto w-[130px]"
                />
              </div>

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#D9B45B]/20 bg-[#0B120E]/70 px-4 py-2 lg:hidden" />

              <h2 className="text-3xl font-black tracking-tight text-[#F8F2DE]">
                Recuperar acceso
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#D6CFB8]/78">
                Puede usar su correo o su nombre de usuario.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-bold tracking-wide text-[#D9B45B]">
                    Correo o nombre de usuario
                  </label>
                  <input
                    type="text"
                    placeholder="correo o usuario"
                    className="w-full rounded-2xl border border-[#D9B45B]/12 bg-[#18221D]/88 px-4 py-3 text-[#F8F2DE] outline-none transition placeholder:text-[#A9B19D] focus:border-[#54D6FF]/60 focus:bg-[#1C2821] focus:shadow-[0_0_0_4px_rgba(84,214,255,0.12),0_0_18px_rgba(84,214,255,0.10)]"
                    {...register("identifier")}
                  />
                  {errors.identifier && (
                    <p className="mt-2 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                      {errors.identifier.message}
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
                  className="w-full rounded-2xl border border-[#F2E5B8]/10 bg-[linear-gradient(135deg,#54D6FF_0%,#8BE3FF_22%,#B8FF62_62%,#D9B45B_100%)] px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-[#132117] shadow-[0_14px_28px_rgba(0,0,0,0.28),0_0_18px_rgba(84,214,255,0.10)] transition duration-300 hover:scale-[1.01] hover:shadow-[0_18px_34px_rgba(0,0,0,0.34),0_0_24px_rgba(84,214,255,0.16)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Enviando..." : "Enviar instrucciones"}
                </button>
              </form>

              <div className="mt-6 flex flex-col items-center gap-3 text-center">
                <Link
                  href="/"
                  className="text-sm font-bold text-[#8FDFFF] transition hover:text-[#BDEEFF]"
                >
                  VOLVER AL INICIO
                </Link>

                <Link
                  href="/register"
                  className="text-sm font-semibold text-[#B8FF62] transition hover:text-[#DFFF9B]"
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