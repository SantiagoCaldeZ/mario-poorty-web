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
    const normalizedUsername = data.username.trim().toLowerCase();

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
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-600 via-blue-700 to-red-700 px-4">
      <div className="flex w-full max-w-md flex-col items-center">
        <Image
          src="/logo/logopgw.png"
          alt="Poorty Web"
          width={260}
          height={260}
          priority
          className="mb-4 -mt-10 h-auto w-[170px] sm:w-[200px]"
        />

        <div className="w-full rounded-3xl border border-green-200 bg-white/95 p-8 shadow-2xl backdrop-blur">
          <h1 className="text-2xl font-bold text-gray-900">Crear cuenta</h1>
          <p className="mt-2 text-sm text-gray-600">
            Regístrate con correo, contraseña y un nombre de usuario único.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-green-700">
                Correo electrónico
              </label>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                className="w-full rounded-xl border border-blue-200 px-3 py-2 outline-none transition focus:border-green-500"
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-green-700">
                Nombre de usuario
              </label>
              <input
                type="text"
                placeholder="tu_usuario"
                className="w-full rounded-xl border border-blue-200 px-3 py-2 outline-none transition focus:border-green-500"
                {...register("username")}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-green-700">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="********"
                className="w-full rounded-xl border border-blue-200 px-3 py-2 outline-none transition focus:border-green-500"
                {...register("password")}
              />
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
              className="w-full rounded-xl bg-green-600 px-4 py-2 text-white transition hover:bg-green-700 disabled:opacity-60"
            >
              {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm font-semibold text-blue-700 transition hover:text-blue-800"
            >
              VOLVER AL INICIO
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}