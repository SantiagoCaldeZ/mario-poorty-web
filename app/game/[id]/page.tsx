"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import GameBoard from "@/components/game/GameBoard";
import GameSidebar from "@/components/game/GameSidebar";
import MatchSummary from "@/components/game/MatchSummary";
import PlayersPanel from "@/components/game/PlayersPanel";
import CharacterSelectionScreen from "@/components/game/CharacterSelectionScreen";
import OrderSelectionScreen from "@/components/game/OrderSelectionScreen";

type MatchData = {
  id: string;
  lobby_id: string;
  status: "active" | "finished" | "abandoned";
  phase: "choosing_order" | "choosing_character" | "active" | "finished" | "abandoned";
  order_target_number: number | null;
  current_turn_user_id: string | null;
  turn_number: number;
  winner_user_id: string | null;
  started_at: string;
  finished_at: string | null;
  current_character_turn_order: number | null;
};

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
};

type PublicProfileRow = {
  id: string;
  username: string | null;
  avatar_url: string | null;
};

type PlayTurnResult = {
  rolled_value: number;
  updated_position: number;
  next_turn_user_id: string | null;
  updated_turn_number: number;
  match_finished: boolean;
};

export default function GamePage() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");
  const [turnMessage, setTurnMessage] = useState("");
  const [match, setMatch] = useState<MatchData | null>(null);
  const [players, setPlayers] = useState<MatchPlayerRow[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState("");
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderFinalizing, setOrderFinalizing] = useState(false);
  const [selectionSubmitting, setSelectionSubmitting] = useState(false);
  const [selectingCharacter, setSelectingCharacter] = useState<string | null>(null);

  useEffect(() => {
    const lobbyId = params.id;

    if (!lobbyId || typeof lobbyId !== "string") {
      setServerError("ID de partida inválido.");
      setLoading(false);
      return;
    }

    let isMounted = true;
    let activeMatchId: string | null = null;

    const loadGame = async (showLoading = false) => {
      if (showLoading && isMounted) {
        setLoading(true);
      }

      setServerError("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/");
        return;
      }

      const userId = session.user.id;

      if (isMounted) {
        setCurrentUserId(userId);
      }

      const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .select(
          "id, lobby_id, status, phase, order_target_number, current_character_turn_order, current_turn_user_id, turn_number, winner_user_id, started_at, finished_at"
        )
        .eq("lobby_id", lobbyId)
        .maybeSingle();

      if (matchError) {
        if (isMounted) {
          setServerError(matchError.message);
          setLoading(false);
        }
        return;
      }

      if (!matchData) {
        const { data: lobbyData, error: lobbyError } = await supabase
          .from("lobbies")
          .select("id, status")
          .eq("id", lobbyId)
          .maybeSingle();

        if (lobbyError) {
          if (isMounted) {
            setServerError(lobbyError.message);
            setLoading(false);
          }
          return;
        }

        if (!lobbyData) {
          if (isMounted) {
            setServerError("La partida no existe.");
            setLoading(false);
          }
          return;
        }

        if (lobbyData.status === "waiting") {
          router.replace(`/lobby/${lobbyId}`);
          return;
        }

        if (lobbyData.status === "closed") {
          router.replace("/home");
          return;
        }

        if (isMounted) {
          setServerError("La partida todavía no ha sido creada correctamente.");
          setLoading(false);
        }
        return;
      }

      activeMatchId = matchData.id;

      const { data: membership, error: membershipError } = await supabase
        .from("match_players")
        .select("id")
        .eq("match_id", matchData.id)
        .eq("user_id", userId)
        .maybeSingle();

      if (membershipError) {
        if (isMounted) {
          setServerError("No se pudo validar tu acceso a la partida.");
          setLoading(false);
        }
        return;
      }

      if (!membership) {
        router.replace("/home");
        return;
      }

      const { data: playerData, error: playerError } = await supabase
        .from("match_players")
        .select(
          "id, match_id, user_id, character_name, turn_order, board_position, is_finished, joined_at, selected_order_number, order_number_submitted_at"
        )
        .eq("match_id", matchData.id)
        .order("turn_order", { ascending: true });

      if (playerError) {
        if (isMounted) {
          setServerError(playerError.message);
          setLoading(false);
        }
        return;
      }

      const userIds = (playerData ?? []).map((player) => player.user_id);

      const { data: profileData, error: profileError } = await supabase.rpc(
        "get_public_profiles",
        { profile_ids: userIds }
      );

      if (profileError) {
        if (isMounted) {
          setServerError(profileError.message);
          setLoading(false);
        }
        return;
      }

      const publicProfiles = (profileData ?? []) as PublicProfileRow[];

      const profilesMap = new Map(
        publicProfiles.map((profile) => [profile.id, profile])
      );

      const mergedPlayers: MatchPlayerRow[] = (playerData ?? []).map((player) => {
        const profile = profilesMap.get(player.user_id);

        return {
          id: player.id,
          match_id: player.match_id,
          user_id: player.user_id,
          character_name: player.character_name,
          turn_order: player.turn_order,
          board_position: player.board_position,
          is_finished: player.is_finished,
          joined_at: player.joined_at,
          selected_order_number: player.selected_order_number,
          order_number_submitted_at: player.order_number_submitted_at,
          username: profile?.username ?? null,
        };
      });

      if (isMounted) {
        setMatch(matchData);
        setPlayers(mergedPlayers);
        setLoading(false);
      }
    };

    loadGame(true);

    const lobbyChannel = supabase
      .channel(`game-lobby-${lobbyId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
        },
        async (payload) => {
          const newRow = payload.new as { lobby_id?: string } | undefined;
          const oldRow = payload.old as { lobby_id?: string } | undefined;

          if (newRow?.lobby_id === lobbyId || oldRow?.lobby_id === lobbyId) {
            await loadGame(false);
          }
        }
      )
      .subscribe();

    const playersChannel = supabase
      .channel(`game-players-${lobbyId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "match_players",
        },
        async (payload) => {
          const newRow = payload.new as { match_id?: string } | undefined;
          const oldRow = payload.old as { match_id?: string } | undefined;

          if (
            (activeMatchId && newRow?.match_id === activeMatchId) ||
            (activeMatchId && oldRow?.match_id === activeMatchId)
          ) {
            await loadGame(false);
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(lobbyChannel);
      supabase.removeChannel(playersChannel);
    };
  }, [params.id, router]);

  const currentTurnPlayer = players.find(
    (player) => player.user_id === match?.current_turn_user_id
  );
  const winnerPlayer = players.find(
    (player) => player.user_id === match?.winner_user_id
  );
  const isMyTurn = currentUserId === match?.current_turn_user_id;
  const currentMatchId = match?.id ?? null;

  const handlePlayTurn = async () => {
    if (!currentMatchId) return;

    setServerError("");
    setTurnMessage("");

    const { data, error } = await supabase.rpc("play_turn", {
      target_match_id: currentMatchId,
    });

    if (error) {
      setServerError(error.message);
      return;
    }

    const result = Array.isArray(data) ? data[0] : data;

    if (result) {
      const turnResult = result as PlayTurnResult;

      if (turnResult.match_finished) {
        setTurnMessage(
          `Sacaste ${turnResult.rolled_value}. Llegaste a la meta en la posición ${turnResult.updated_position}. ¡Ganaste la partida!`
        );
      } else {
        setTurnMessage(
          `Sacaste ${turnResult.rolled_value}. Tu nueva posición es ${turnResult.updated_position}.`
        );
      }
    }

    const { data: updatedMatch, error: updatedMatchError } = await supabase
      .from("matches")
      .select(
        "id, lobby_id, status, phase, order_target_number, current_character_turn_order, current_turn_user_id, turn_number, winner_user_id, started_at, finished_at"
      )
      .eq("id", currentMatchId)
      .maybeSingle();

    if (updatedMatchError) {
      setServerError(updatedMatchError.message);
      return;
    }

    const { data: updatedPlayers, error: updatedPlayersError } = await supabase
      .from("match_players")
      .select(
        "id, match_id, user_id, character_name, turn_order, board_position, is_finished, joined_at, selected_order_number, order_number_submitted_at"
      )
      .eq("match_id", currentMatchId)
      .order("turn_order", { ascending: true });

    if (updatedPlayersError) {
      setServerError(updatedPlayersError.message);
      return;
    }

    const userIds = (updatedPlayers ?? []).map((player) => player.user_id);

    const { data: updatedProfiles, error: updatedProfilesError } = await supabase.rpc(
      "get_public_profiles",
      { profile_ids: userIds }
    );

    if (updatedProfilesError) {
      setServerError(updatedProfilesError.message);
      return;
    }

    const publicProfiles = (updatedProfiles ?? []) as PublicProfileRow[];

    const profilesMap = new Map(
      publicProfiles.map((profile) => [profile.id, profile])
    );

    const mergedPlayers: MatchPlayerRow[] = (updatedPlayers ?? []).map((player) => {
      const profile = profilesMap.get(player.user_id);

      return {
        id: player.id,
        match_id: player.match_id,
        user_id: player.user_id,
        character_name: player.character_name,
        turn_order: player.turn_order,
        board_position: player.board_position,
        is_finished: player.is_finished,
        joined_at: player.joined_at,
        selected_order_number: player.selected_order_number,
        order_number_submitted_at: player.order_number_submitted_at,
        username: profile?.username ?? null,
      };
    });

    if (updatedMatch) {
      setMatch(updatedMatch);
    }

    setPlayers(mergedPlayers);
  };

  const handleSubmitOrderNumber = async (forcedNumber?: number) => {
    if (!match?.id) return;

    const parsedNumber =
      typeof forcedNumber === "number"
        ? forcedNumber
        : Number(selectedOrderNumber);

    if (!Number.isInteger(parsedNumber) || parsedNumber < 1 || parsedNumber > 1000) {
      setServerError("Debes ingresar un número entero entre 1 y 1000.");
      return;
    }

    setServerError("");
    setOrderSubmitting(true);

    const { error } = await supabase.rpc("submit_order_number", {
      target_match_id: match.id,
      chosen_number: parsedNumber,
    });

    setOrderSubmitting(false);

    if (error) {
      setServerError(error.message);
      return;
    }

    setPlayers((prev) =>
      prev.map((player) =>
        player.user_id === currentUserId
          ? {
              ...player,
              selected_order_number: parsedNumber,
              order_number_submitted_at: new Date().toISOString(),
            }
          : player
      )
    );

    setSelectedOrderNumber("");
  };

  const handleFinalizeOrder = async (): Promise<number | null> => {
    if (!match?.id) return null;

    setServerError("");
    setOrderFinalizing(true);

    const { data, error } = await supabase.rpc("finalize_turn_order", {
      target_match_id: match.id,
    });

    setOrderFinalizing(false);

    if (error) {
      setServerError(error.message);
      return null;
    }

    const result = Array.isArray(data) ? data[0] : data;

    setTimeout(() => {
      window.location.reload();
    }, 12010);

    return result?.target_number ?? null;
  };

  const handleSelectCharacter = async (characterName: string) => {
    if (!match?.id) return;

    setServerError("");
    setSelectionSubmitting(true);
    setSelectingCharacter(characterName);

    const { error } = await supabase.rpc("select_character", {
      target_match_id: match.id,
      chosen_character: characterName,
    });

    setSelectionSubmitting(false);
    setSelectingCharacter(null);

    if (error) {
      setServerError(error.message);
      return;
    }

    window.location.reload();
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <p className="text-gray-700">Cargando partida...</p>
      </main>
    );
  }

  if (match?.phase === "choosing_order") {
    return (
      <OrderSelectionScreen
        players={players}
        currentUserId={currentUserId}
        selectedOrderNumber={selectedOrderNumber}
        onSelectedOrderNumberChange={setSelectedOrderNumber}
        onSubmitOrderNumber={handleSubmitOrderNumber}
        onFinalizeOrder={handleFinalizeOrder}
        onGoHome={() => router.push("/home")}
        orderSubmitting={orderSubmitting}
        orderFinalizing={orderFinalizing}
        serverError={serverError}
        orderTargetNumber={match.order_target_number}
        startedAt={match.started_at}
      />
    );
  }

  if (match?.phase === "choosing_character") {
    return (
      <CharacterSelectionScreen
        players={players}
        currentUserId={currentUserId}
        currentCharacterTurnOrder={match.current_character_turn_order}
        orderTargetNumber={match.order_target_number}
        selectingCharacter={selectingCharacter}
        onSelectCharacter={handleSelectCharacter}
        onGoHome={() => router.push("/home")}
        selectionSubmitting={selectionSubmitting}
        serverError={serverError}
      />
    );
  }

  if (serverError) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-md">
          <h1 className="text-2xl font-bold text-gray-900">Partida</h1>
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {serverError}
          </p>

          <button
            type="button"
            onClick={() => router.push("/home")}
            className="mt-6 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition hover:bg-gray-50"
          >
            Volver al inicio
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-2xl bg-white p-8 shadow-md">
          <h1 className="text-3xl font-bold text-gray-900">Partida en progreso</h1>
          <p className="mt-2 text-gray-600">
            Esta es una primera versión visual de la partida mientras se sigue
            construyendo el tablero principal.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <MatchSummary
              match={match}
              currentTurnPlayer={currentTurnPlayer}
              winnerPlayer={winnerPlayer}
            />

            <GameBoard
              players={players}
              currentUserId={currentUserId}
              currentTurnUserId={match?.current_turn_user_id ?? null}
              winnerUserId={match?.winner_user_id ?? null}
              matchStatus={match?.status ?? null}
            />

            <PlayersPanel
              players={players}
              currentUserId={currentUserId}
              currentTurnUserId={match?.current_turn_user_id ?? null}
            />
          </div>

          <div>
            <GameSidebar
              matchStatus={match?.status ?? null}
              turnNumber={match?.turn_number ?? null}
              currentTurnPlayer={currentTurnPlayer}
              winnerPlayer={winnerPlayer}
              turnMessage={turnMessage}
              isMyTurn={isMyTurn}
              onPlayTurn={handlePlayTurn}
              onGoHome={() => router.push("/home")}
              finishedAt={match?.finished_at ?? null}
            />
          </div>
        </div>
      </div>
    </main>
  );
}