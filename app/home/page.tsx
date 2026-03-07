"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type UserProfile = {
  username: string;
  email: string;
};

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const checkSessionAndLoadProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/login");
        return;
      }

      const userId = session.user.id;

      const { data: activeMembership, error: membershipError } = await supabase
        .from("lobby_players")
        .select("lobby_id, lobbies!inner(status)")
        .eq("user_id", userId)
        .in("lobbies.status", ["waiting", "in_game"])
        .maybeSingle();

      if (membershipError) {
        setLoading(false);
        return;
      }

      if (activeMembership?.lobby_id) {
        router.replace(`/lobby/${activeMembership.lobby_id}`);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("username, email")
        .eq("id", userId)
        .maybeSingle();

      if (error || !data) {
        setLoading(false);
        return;
      }

      setProfile(data);
      setLoading(false);
    };

    checkSessionAndLoadProfile();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <p className="text-gray-700">Cargando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl bg-white p-8 shadow-md">
          <h1 className="text-3xl font-bold text-gray-900">
            Bienvenido a Mario Poorty Web
          </h1>

          <p className="mt-3 text-gray-600">
            Has iniciado sesión correctamente.
          </p>

          {profile && (
            <div className="mt-6 rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Usuario:</span> {profile.username}
              </p>
              <p className="mt-1 text-sm text-gray-700">
                <span className="font-semibold">Correo:</span> {profile.email}
              </p>
            </div>
          )}

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => router.push("/lobby/create")}
              className="rounded-lg bg-black px-4 py-3 text-white transition hover:opacity-90"
            >
              Crear partida
            </button>

            <button
              type="button"
              onClick={() => router.push("/lobby/join")}
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition hover:bg-gray-50"
            >
              Unirse a partida
            </button>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-red-300 bg-white px-4 py-2 text-red-700 transition hover:bg-red-50"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}