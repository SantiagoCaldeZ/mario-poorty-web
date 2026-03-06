import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-100">
      <div className="w-full max-w-lg rounded-2xl bg-white p-10 shadow-md">
        <h1 className="text-3xl font-bold text-gray-900">Mario Poorty Web</h1>
        <p className="mt-3 text-gray-600">
          Bienvenido al proyecto base. Desde aquí puedes probar las pantallas
          iniciales de autenticación.
        </p>

        <div className="mt-6 flex gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-black px-5 py-2 text-white transition hover:opacity-90"
          >
            Ir a login
          </Link>

          <Link
            href="/register"
            className="rounded-lg border border-black px-5 py-2 text-black transition hover:bg-gray-100"
          >
            Ir a registro
          </Link>
        </div>
      </div>
    </main>
  );
}