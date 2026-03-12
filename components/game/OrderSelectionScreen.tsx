type MatchPlayerRow = {
  id: string;
  match_id: string;
  user_id: string;
  character_name: string | null;
  turn_order: number;
  board_position: number;
  is_finished: boolean;
  joined_at: string;
  selected_order_number: number | null;
  order_number_submitted_at: string | null;
  username: string | null;
  email: string | null;
};

type OrderSelectionScreenProps = {
  players: MatchPlayerRow[];
  currentUserId: string | null;
  selectedOrderNumber: string;
  onSelectedOrderNumberChange: (value: string) => void;
  onSubmitOrderNumber: () => void;
  onFinalizeOrder: () => void;
  onGoHome: () => void;
  orderSubmitting: boolean;
  orderFinalizing: boolean;
  serverError: string;
  orderTargetNumber: number | null;
};

export default function OrderSelectionScreen({
  players,
  currentUserId,
  selectedOrderNumber,
  onSelectedOrderNumberChange,
  onSubmitOrderNumber,
  onFinalizeOrder,
  onGoHome,
  orderSubmitting,
  orderFinalizing,
  serverError,
  orderTargetNumber,
}: OrderSelectionScreenProps) {
  const submittedPlayersCount = players.filter(
    (player) => player.selected_order_number !== null
  ).length;

  const myPlayer = players.find((player) => player.user_id === currentUserId);
  const iAlreadySubmittedOrder = myPlayer?.selected_order_number !== null;

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-md">
        <h1 className="text-3xl font-bold text-gray-900">Definición de orden</h1>
        <p className="mt-2 text-gray-600">
          Antes de comenzar, cada jugador debe escoger un número entre 1 y 1000.
          Luego se generará un número aleatorio y el orden se definirá según qué tan
          cerca quede cada jugador.
        </p>

        {serverError && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {serverError}
          </p>
        )}

        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Jugadores que ya eligieron:</span>{" "}
            {submittedPlayersCount} / {players.length}
          </p>

          {orderTargetNumber !== null && (
            <p className="mt-2 text-sm text-gray-700">
              <span className="font-semibold">Número objetivo:</span>{" "}
              {orderTargetNumber}
            </p>
          )}
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 p-5">
          <h2 className="text-xl font-semibold text-gray-900">Tu elección</h2>

          {iAlreadySubmittedOrder ? (
            <p className="mt-3 text-sm text-green-700">
              Ya enviaste tu número:{" "}
              <span className="font-semibold">{myPlayer?.selected_order_number}</span>
            </p>
          ) : (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                type="number"
                min={1}
                max={1000}
                value={selectedOrderNumber}
                onChange={(event) => onSelectedOrderNumberChange(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-black"
                placeholder="Ingresa un número del 1 al 1000"
              />

              <button
                type="button"
                onClick={onSubmitOrderNumber}
                disabled={orderSubmitting}
                className="rounded-lg bg-black px-4 py-2 text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {orderSubmitting ? "Enviando..." : "Confirmar número"}
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 p-5">
          <h2 className="text-xl font-semibold text-gray-900">Jugadores</h2>

          <div className="mt-4 space-y-3">
            {players.map((player) => (
              <div
                key={player.id}
                className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700"
              >
                <p>
                  <span className="font-semibold">Jugador:</span>{" "}
                  {player.username ?? "Sin username"}
                  {player.user_id === currentUserId ? " (Tú)" : ""}
                </p>
                <p>
                  <span className="font-semibold">Estado:</span>{" "}
                  {player.selected_order_number !== null
                    ? "Ya eligió número"
                    : "Pendiente"}
                </p>
                {player.selected_order_number !== null && (
                  <p>
                    <span className="font-semibold">Número elegido:</span>{" "}
                    {player.selected_order_number}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onGoHome}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition hover:bg-gray-50"
          >
            Volver al inicio
          </button>

          <button
            type="button"
            onClick={onFinalizeOrder}
            disabled={orderFinalizing}
            className="rounded-lg bg-black px-4 py-2 text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {orderFinalizing ? "Definiendo orden..." : "Definir orden y continuar"}
          </button>
        </div>
      </div>
    </main>
  );
}