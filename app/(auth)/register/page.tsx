export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md">
        <h1 className="text-2xl font-bold text-gray-900">Crear cuenta</h1>
        <p className="mt-2 text-sm text-gray-600">
          Regístrate con correo, contraseña y un nombre de usuario único.
        </p>

        <form className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nombre de usuario
            </label>
            <input
              type="text"
              placeholder="tu_usuario"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="********"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-black"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-black px-4 py-2 text-white transition hover:opacity-90"
          >
            Crear cuenta
          </button>
        </form>
      </div>
    </main>
  );
}