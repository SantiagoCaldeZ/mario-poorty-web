"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

function getActivityFromPath(pathname: string) {
  if (pathname.startsWith("/game/")) return "En partida";
  if (pathname.startsWith("/lobby/")) return "En lobby";
  if (pathname.startsWith("/messages")) return "En mensajes";
  if (pathname.startsWith("/friends")) return "En amigos";
  if (pathname.startsWith("/home")) return "En inicio";
  return "En línea";
}

function getAvailability() {
  if (typeof document === "undefined") return "online";
  if (document.visibilityState === "hidden") return "away";
  if (typeof document.hasFocus === "function" && !document.hasFocus()) return "away";
  return "online";
}

export default function PresenceHeartbeat() {
  const pathname = usePathname();

  const activity = useMemo(() => getActivityFromPath(pathname), [pathname]);

  useEffect(() => {
    let mounted = true;
    let intervalId: number | null = null;

    const pushPresence = async () => {
      if (!mounted) return;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) return;

      await supabase.rpc("touch_my_presence", {
        p_availability: getAvailability(),
        p_activity: activity,
        p_route: pathname,
      });
    };

    const handleFocus = () => {
      void pushPresence();
    };

    const handleBlur = () => {
      void pushPresence();
    };

    const handleVisibilityChange = () => {
      void pushPresence();
    };

    void pushPresence();

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    intervalId = window.setInterval(() => {
      void pushPresence();
    }, 25000);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        void pushPresence();
      }
    });

    return () => {
      mounted = false;

      if (intervalId) {
        window.clearInterval(intervalId);
      }

      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      subscription.unsubscribe();
    };
  }, [activity, pathname]);

  return null;
}