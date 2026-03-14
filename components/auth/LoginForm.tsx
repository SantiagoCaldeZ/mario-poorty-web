"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  identifier: z.string().min(1, "Debes ingresar tu correo o usuario."),
  password: z.string().min(1, "Debes ingresar tu contraseña."),
});

type LoginFormData = z.infer<typeof loginSchema>;

type EmailLookupRow = {
  email: string;
};

type LoginFormProps = {
  showAuxLinks?: boolean;
};

export default function LoginForm({
  showAuxLinks = true,
}: LoginFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string>("");
  const [serverSuccess, setServerSuccess] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError("");
    setServerSuccess("");

    const normalizedIdentifier = data.identifier.trim().toLowerCase();
    const password = data.password;

    let emailToUse = normalizedIdentifier;
    const isEmail = normalizedIdentifier.includes("@");

    if (!isEmail) {
      const { data: result, error: rpcError } = await supabase.rpc(
        "get_email_by_username",
        { input_username: normalizedIdentifier }
      );

      if (rpcError) {
        setServerError("No se pudo validar el nombre de usuario.");
        return;
      }

      const rows = result as EmailLookupRow[] | null;

      if (!rows || rows.length === 0 || !rows[0]?.email) {
        setServerError("No existe una cuenta con ese nombre de usuario.");
        return;
      }

      emailToUse = rows[0].email;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password,
    });

    if (error) {
      setServerError(error.message);
      return;
    }

    router.push("/home");
  };

  return (
    <div className="w-full max-w-md rounded-[32px] border border-[#E7D7A4]/15 bg-[#101813]/88 p-8 text-[#F5EFD9] shadow-[0_24px_70px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl">
      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#D9B45B]/20 bg-[#0B120E]/70 px-4 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#B8FF62] shadow-[0_0_10px_rgba(184,255,98,0.95)]" />
        <span className="text-[11px] font-extrabold uppercase tracking-[0.34em] text-[#D9B45B]">
          Acceso
        </span>
      </div>

      <h1 className="text-3xl font-black tracking-tight text-[#F8F2DE]">
        Iniciar sesión
      </h1>

      <p className="mt-2 text-sm leading-6 text-[#D6CFB8]/78">
        Ingresa con tu correo o nombre de usuario para volver a la partida.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-bold tracking-wide text-[#D9B45B]">
            Correo o nombre de usuario
          </label>

          <input
            type="text"
            placeholder="correo o usuario"
            className="w-full rounded-2xl border border-[#D9B45B]/12 bg-[#18221D]/88 px-4 py-3 text-[#F8F2DE] outline-none transition placeholder:text-[#A9B19D] focus:border-[#86F16B]/65 focus:bg-[#1C2821] focus:shadow-[0_0_0_4px_rgba(134,241,107,0.12),0_0_18px_rgba(134,241,107,0.10)]"
            {...register("identifier")}
          />

          {errors.identifier && (
            <p className="mt-2 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {errors.identifier.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold tracking-wide text-[#D9B45B]">
            Contraseña
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="********"
              className="w-full rounded-2xl border border-[#D9B45B]/12 bg-[#18221D]/88 px-4 py-3 pr-14 text-[#F8F2DE] outline-none transition placeholder:text-[#A9B19D] focus:border-[#86F16B]/65 focus:bg-[#1C2821] focus:shadow-[0_0_0_4px_rgba(134,241,107,0.12),0_0_18px_rgba(134,241,107,0.10)]"
              {...register("password")}
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-2 flex items-center justify-center rounded-xl px-3 text-[#B9C4AE] transition hover:bg-[#223128] hover:text-[#B8FF62]"
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
          className="w-full rounded-2xl border border-[#F2E5B8]/10 bg-[linear-gradient(135deg,#B8FF62_0%,#86F16B_38%,#D9B45B_75%,#C77A33_100%)] px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-[#132117] shadow-[0_14px_28px_rgba(0,0,0,0.28),0_0_18px_rgba(184,255,98,0.10)] transition duration-300 hover:scale-[1.01] hover:shadow-[0_18px_34px_rgba(0,0,0,0.34),0_0_24px_rgba(184,255,98,0.16)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>
      </form>

      {showAuxLinks && (
        <div className="mt-6 space-y-3 text-center">
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-[#8FD8FF] transition hover:text-[#B8ECFF]"
          >
            ¿Olvidó su contraseña?
          </Link>

          <p className="text-sm text-[#D6CFB8]/82">
            ¿No tiene cuenta aún?{" "}
            <Link
              href="/register"
              className="font-extrabold text-[#B8FF62] underline decoration-[#D9B45B]/60 underline-offset-4 transition hover:text-[#D8FF9A]"
            >
              Regístrese aquí
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}