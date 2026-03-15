"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export type PresenceStatus = "online" | "away" | "offline";

export type FriendPresenceRow = {
  friend_user_id: string;
  username: string | null;
  avatar_url: string | null;
  presence_status: PresenceStatus;
  activity: string | null;
  route: string | null;
  last_seen_at: string | null;
};

export function useFriendsPresence() {
  const [friendsPresence, setFriendsPresence] = useState<FriendPresenceRow[]>([]);
  const [loadingPresence, setLoadingPresence] = useState(true);
  const [presenceError, setPresenceError] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const refreshTimerRef = useRef<number | null>(null);

  const loadFriendsPresence = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setCurrentUserId(null);
      setFriendsPresence([]);
      setLoadingPresence(false);
      return;
    }

    setCurrentUserId(session.user.id);

    const { data, error } = await supabase.rpc("list_my_friends_presence");

    if (error) {
      setPresenceError(error.message);
      setLoadingPresence(false);
      return;
    }

    setPresenceError("");
    setFriendsPresence((data ?? []) as FriendPresenceRow[]);
    setLoadingPresence(false);
  }, []);

  const scheduleRefresh = useCallback(() => {
    if (typeof window === "undefined") return;
    if (refreshTimerRef.current) return;

    refreshTimerRef.current = window.setTimeout(() => {
      refreshTimerRef.current = null;
      void loadFriendsPresence();
    }, 180);
  }, [loadFriendsPresence]);

  useEffect(() => {
    void loadFriendsPresence();

    return () => {
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
      }
    };
  }, [loadFriendsPresence]);

  const friendIds = useMemo(
    () => friendsPresence.map((friend) => friend.friend_user_id),
    [friendsPresence]
  );

  const friendIdsKey = useMemo(() => friendIds.join(","), [friendIds]);

  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase.channel(`friends-presence-${currentUserId}`);

    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "friendships",
        filter: `requester_id=eq.${currentUserId}`,
      },
      scheduleRefresh
    );

    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "friendships",
        filter: `addressee_id=eq.${currentUserId}`,
      },
      scheduleRefresh
    );

    friendIds.forEach((friendId) => {
      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_presence",
          filter: `user_id=eq.${friendId}`,
        },
        scheduleRefresh
      );

      channel.on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${friendId}`,
        },
        scheduleRefresh
      );
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, friendIdsKey, scheduleRefresh]);

  return {
    friendsPresence,
    loadingPresence,
    presenceError,
    refreshFriendsPresence: loadFriendsPresence,
  };
}