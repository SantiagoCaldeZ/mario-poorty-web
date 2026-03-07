"use client";

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

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string>("");
  const [serverSuccess, setServerSuccess] = useState<string>("");

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

    const { data: signInData, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
    });

    console.log("emailToUse:", emailToUse);
    console.log("signInData:", signInData);
    console.log("signInError:", error);

    if (error) {
        setServerError(error.message);
        return;
    }

    router.push("/home");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md">
        <h1 className="text-2xl font-bold text-gray-900">Iniciar sesión</h1>
        <p className="mt-2 text-sm text-gray-600">
          Ingresa con tu correo o nombre de usuario y tu contraseña.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Correo o nombre de usuario
            </label>
            <input
              type="text"
              placeholder="correo o usuario"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-black"
              {...register("identifier")}
            />
            {errors.identifier && (
              <p className="mt-1 text-sm text-red-600">
                {errors.identifier.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="********"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-black"
              {...register("password")}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          {serverError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {serverError}
            </p>
          )}

          {serverSuccess && (
            <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
              {serverSuccess}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-black px-4 py-2 text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}