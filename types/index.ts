export type LobbyType = "public" | "private";

export type LobbyStatus = "waiting" | "in_game" | "finished" | "cancelled";

export type MatchStatus = "active" | "finished" | "abandoned";

export interface Profile {
  id: string;
  username: string;
  email: string;
  avatar_url?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Lobby {
  id: string;
  host_user_id: string;
  lobby_type: LobbyType;
  join_code?: string | null;
  status: LobbyStatus;
  max_players: number;
  created_at?: string;
  started_at?: string | null;
}