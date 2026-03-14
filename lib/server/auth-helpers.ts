import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/server/supabase-admin";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL en variables de entorno.");
}

if (!supabaseAnonKey) {
  throw new Error("Falta NEXT_PUBLIC_SUPABASE_ANON_KEY en variables de entorno.");
}

function createServerAuthClient() {
  return createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export function normalizeIdentifier(value: string) {
  return value.trim();
}

export function isEmailIdentifier(value: string) {
  return value.includes("@");
}

export async function resolveEmailFromIdentifier(
  identifier: string
): Promise<string | null> {
  const normalized = normalizeIdentifier(identifier);

  if (!normalized) return null;

  if (isEmailIdentifier(normalized)) {
    return normalized.toLowerCase();
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("email")
    .ilike("username", normalized)
    .maybeSingle();

  if (error) {
    console.error("resolveEmailFromIdentifier error:", error);
    throw new Error(`Lookup de username falló: ${error.message}`);
  }

  return data?.email?.trim().toLowerCase() ?? null;
}

export async function signInWithIdentifier(
  identifier: string,
  password: string
) {
  const email = await resolveEmailFromIdentifier(identifier);

  if (!email) {
    return {
      ok: false as const,
      error: "No se encontró una cuenta asociada a ese usuario o correo.",
    };
  }

  const authClient = createServerAuthClient();

  const { data, error } = await authClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      ok: false as const,
      error: error.message,
    };
  }

  if (!data.session) {
    return {
      ok: false as const,
      error: "No se pudo crear la sesión.",
    };
  }

  return {
    ok: true as const,
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    },
  };
}

export async function sendPasswordResetForIdentifier(
  identifier: string,
  redirectTo: string
) {
  const email = await resolveEmailFromIdentifier(identifier);

  if (!email) {
    return {
      ok: true as const,
    };
  }

  const authClient = createServerAuthClient();

  const { error } = await authClient.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    console.error("sendPasswordResetForIdentifier error:", error);
    throw new Error(`Reset password falló: ${error.message}`);
  }

  return {
    ok: true as const,
  };
}