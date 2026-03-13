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
    <div className="w-full max-w-md rounded-3xl border border-red-200 bg-white/95 p-8 shadow-2xl backdrop-blur">
      <h1 className="text-2xl font-bold text-gray-900">Iniciar sesión</h1>
      <p className="mt-2 text-sm text-gray-600">
        Ingresa con tu correo o nombre de usuario y tu contraseña.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-red-700">
            Correo o nombre de usuario
          </label>
          <input
            type="text"
            placeholder="correo o usuario"
            className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 outline-none transition focus:border-red-500"
            {...register("identifier")}
          />
          {errors.identifier && (
            <p className="mt-1 text-sm text-red-600">
              {errors.identifier.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-red-700">
            Contraseña
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="********"
              className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 pr-12 outline-none transition focus:border-red-500"
              {...register("password")}
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-red-600"
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
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        {serverError && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {serverError}
          </p>
        )}

        {serverSuccess && (
          <p className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">
            {serverSuccess}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-red-600 px-4 py-2 text-white transition hover:bg-red-700 disabled:opacity-60"
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>
      </form>

      {showAuxLinks && (
        <div className="mt-6 space-y-3 text-center">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-blue-700 transition hover:text-blue-800"
          >
            ¿Olvidó su contraseña?
          </Link>

          <p className="text-sm text-gray-700">
            ¿No tiene cuenta aún?{" "}
            <Link
              href="/register"
              className="font-bold text-green-700 underline underline-offset-2 transition hover:text-green-800"
            >
              Regístrese AQUÍ.
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}