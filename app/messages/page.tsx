"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ThreadRow = {
  thread_id: string;
  other_user_id: string;
  other_username: string | null;
  other_avatar_url: string | null;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
  unread_count: number;
};

type MessageRow = {
  id: string;
  thread_id: string;
  sender_id: string;
  sender_username: string | null;
  content: string;
  created_at: string;
};

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedUserFromQuery = searchParams.get("user");

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [actionError, setActionError] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [composer, setComposer] = useState("");
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.thread_id === selectedThreadId) ?? null,
    [threads, selectedThreadId]
  );

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

    const loadThreads = async () => {
        const { data, error } = await supabase.rpc("list_my_dm_threads");

        if (error) {
            setPageError(error.message);
            return;
        }

        const threadRows = (data ?? []) as ThreadRow[];
        setThreads(threadRows);
        };

    const loadMessages = async (threadId: string) => {
        const { data, error } = await supabase.rpc("get_dm_messages", {
            target_thread_id: threadId,
        });

        if (error) {
            setActionError(error.message);
            return;
        }

        setMessages((data ?? []) as MessageRow[]);
        scrollToBottom();
    };

    const openThread = async (threadId: string) => {
        setSelectedThreadId(threadId);
        setActionError("");

        await loadMessages(threadId);

        await supabase.rpc("mark_dm_thread_as_read", {
            target_thread_id: threadId,
        });

        await loadThreads();
    };

  useEffect(() => {
    const bootstrap = async () => {
      setPageError("");
      setActionError("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/");
        return;
      }

      setCurrentUserId(session.user.id);

      if (selectedUserFromQuery) {
        const { data: threadId, error } = await supabase.rpc("start_or_get_dm_thread", {
          target_user_id: selectedUserFromQuery,
        });

        if (error) {
          setPageError(error.message);
          setLoading(false);
          return;
        }

        if (threadId) {
          setSelectedThreadId(threadId);
        }
      }

      await loadThreads();
      setLoading(false);
    };

    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserFromQuery]);

  useEffect(() => {
    if (!selectedThreadId) return;
    loadMessages(selectedThreadId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedThreadId]);

  useEffect(() => {
    if (!selectedThreadId) return;

    const messagesChannel = supabase
      .channel(`dm-thread-${selectedThreadId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "direct_messages",
          filter: `thread_id=eq.${selectedThreadId}`,
        },
        async () => {
          await loadMessages(selectedThreadId);
          await loadThreads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedThreadId]);

  useEffect(() => {
    const threadsChannel = supabase
      .channel("dm-threads-list")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "direct_message_threads",
        },
        async () => {
          await loadThreads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(threadsChannel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendMessage = async () => {
    if (!selectedThreadId || !composer.trim() || sending) return;

    setSending(true);
    setActionError("");

    const { error } = await supabase.rpc("send_direct_message", {
      target_thread_id: selectedThreadId,
      message_content: composer,
    });

    setSending(false);

    if (error) {
      setActionError(error.message);
      return;
    }

    setComposer("");
    await loadMessages(selectedThreadId);
    await loadThreads();
  };

  const handleKeyDown = async (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      await handleSendMessage();
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#31251B_0%,#19130E_34%,#0D0A08_68%,#060505_100%)] px-4 text-[#F7F0DC]">
        <div className="rounded-[28px] border border-[#E6D1A5]/10 bg-[#17110E]/90 px-8 py-7 text-center shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <p className="text-xs font-black uppercase tracking-[0.34em] text-[#D9B45B]">
            Correo del campamento
          </p>
          <p className="mt-3 text-lg font-bold text-[#F7F0DC]">
            Cargando mensajes directos...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#31251B_0%,#19130E_34%,#0D0A08_68%,#060505_100%)] text-[#F7F0DC]">
      <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,rgba(255,244,214,0.75)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,244,214,0.75)_1px,transparent_1px)] [background-size:38px_38px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(134,182,75,0.16),transparent_18%),radial-gradient(circle_at_84%_14%,rgba(217,180,91,0.12),transparent_18%),radial-gradient(circle_at_18%_82%,rgba(79,195,161,0.08),transparent_16%),radial-gradient(circle_at_86%_80%,rgba(201,119,59,0.10),transparent_18%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="flex w-full max-w-[360px] flex-col overflow-hidden rounded-[32px] border border-[#E6D1A5]/10 bg-[linear-gradient(180deg,rgba(34,26,20,0.96),rgba(18,14,11,0.96))] shadow-[0_20px_70px_rgba(0,0,0,0.4)]">
          <div className="border-b border-[#E6D1A5]/8 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[#D9B45B]">
                  Correo del campamento
                </p>
                <h1 className="mt-2 text-2xl font-black text-[#FFF5E3]">
                  Mensajes
                </h1>
              </div>

              <Link
                href="/home"
                className="rounded-[18px] border border-[#E6D1A5]/10 bg-[#1D1612] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#F4E8D1] transition hover:border-[#D9B45B]/20 hover:bg-[#2A1E18]"
              >
                Inicio
              </Link>
            </div>
          </div>

          <div className="border-b border-[#E6D1A5]/8 px-5 py-4">
            <p className="text-sm text-[#D9C8A8]/75">
              Conversaciones activas con tu tribu.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {threads.length === 0 ? (
              <div className="rounded-[22px] border border-[#E6D1A5]/8 bg-[#17110E] px-4 py-4 text-sm text-[#D9C8A8]/74">
                Todavía no tienes conversaciones directas.
              </div>
            ) : (
              <div className="space-y-2">
                {threads.map((thread) => {
                  const active = thread.thread_id === selectedThreadId;

                  return (
                    <button
                      key={thread.thread_id}
                      type="button"
                      onClick={() => openThread(thread.thread_id)}
                      className={`w-full rounded-[22px] border px-4 py-4 text-left transition ${
                        active
                          ? "border-[#86B64B]/24 bg-[linear-gradient(135deg,rgba(134,182,75,0.14),rgba(217,180,91,0.08),rgba(79,195,161,0.08))]"
                          : "border-[#E6D1A5]/8 bg-[#17110E] hover:bg-[#211813]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#86B64B_0%,#D9B45B_55%,#4FC3A1_100%)] font-black text-[#1A140F] shadow-[0_10px_22px_rgba(0,0,0,0.24)]">
                          {thread.other_username?.slice(0, 1).toUpperCase() ?? "A"}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-base font-black text-[#FFF2DF]">
                                {thread.other_username ?? "Usuario"}
                            </p>

                            <div className="flex items-center gap-2">
                                {thread.unread_count > 0 && (
                                <span className="inline-flex min-w-[24px] items-center justify-center rounded-full bg-[#86B64B] px-2 py-1 text-[11px] font-black text-[#1A140F]">
                                    {thread.unread_count}
                                </span>
                                )}

                                <span className="shrink-0 text-[11px] text-[#D9C8A8]/55">
                                {thread.last_message_at
                                    ? new Date(thread.last_message_at).toLocaleDateString()
                                    : ""}
                                </span>
                            </div>
                          </div>
                          <p className="mt-1 line-clamp-2 text-sm text-[#D9C8A8]/68">
                            {thread.last_message ?? "Todavía no hay mensajes."}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[32px] border border-[#E6D1A5]/10 bg-[linear-gradient(180deg,rgba(42,31,23,0.96),rgba(24,18,14,0.96))] shadow-[0_22px_70px_rgba(0,0,0,0.38)]">
          {selectedThread ? (
            <>
              <header className="border-b border-[#E6D1A5]/8 px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,#86B64B_0%,#D9B45B_55%,#4FC3A1_100%)] text-xl font-black text-[#1A140F] shadow-[0_12px_28px_rgba(0,0,0,0.25)]">
                    {selectedThread.other_username?.slice(0, 1).toUpperCase() ?? "A"}
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-[#D8F1AA]">
                      Chat directo
                    </p>
                    <h2 className="mt-1 text-2xl font-black text-[#FFF5E3]">
                      {selectedThread.other_username ?? "Usuario"}
                    </h2>
                  </div>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="rounded-[24px] border border-[#E6D1A5]/8 bg-[#17110E] px-5 py-4 text-center text-sm text-[#D9C8A8]/72">
                      Aún no hay mensajes. Inicia la conversación.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const mine = message.sender_id === currentUserId;

                      return (
                        <div
                          key={message.id}
                          className={`flex ${mine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-[24px] px-4 py-3 shadow-[0_10px_22px_rgba(0,0,0,0.18)] ${
                              mine
                                ? "bg-[linear-gradient(135deg,#86B64B_0%,#D9B45B_55%,#C9773B_100%)] text-[#1A140F]"
                                : "border border-[#E6D1A5]/8 bg-[#17110E] text-[#F7F0DC]"
                            }`}
                          >
                            {!mine && (
                              <p className="mb-1 text-xs font-black uppercase tracking-[0.14em] text-[#D8F1AA]">
                                {message.sender_username ?? "Usuario"}
                              </p>
                            )}

                            <p className="whitespace-pre-wrap break-words text-sm leading-6">
                              {message.content}
                            </p>

                            <p
                              className={`mt-2 text-[11px] ${
                                mine ? "text-[#241A12]/70" : "text-[#D9C8A8]/55"
                              }`}
                            >
                              {new Date(message.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <div className="border-t border-[#E6D1A5]/8 px-6 py-5">
                {actionError && (
                  <div className="mb-4 rounded-[18px] border border-[#C9773B]/18 bg-[#C9773B]/10 px-4 py-3 text-sm text-[#FFD7B8]">
                    {actionError}
                  </div>
                )}

                <div className="flex items-end gap-3">
                  <textarea
                    value={composer}
                    onChange={(event) => setComposer(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe un mensaje a tu aliado..."
                    rows={3}
                    className="min-h-[78px] flex-1 resize-none rounded-[24px] border border-[#E6D1A5]/10 bg-[#17110E] px-4 py-3 text-[#FFF2DF] outline-none transition placeholder:text-[#BFAF91] focus:border-[#86B64B]/40 focus:shadow-[0_0_0_4px_rgba(134,182,75,0.10)]"
                  />

                  <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={sending || !composer.trim()}
                    className="rounded-[22px] border border-[#E6D1A5]/10 bg-[linear-gradient(135deg,#86B64B_0%,#D9B45B_55%,#C9773B_100%)] px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-[#1A140F] shadow-[0_12px_28px_rgba(0,0,0,0.28)] transition hover:scale-[1.01] disabled:opacity-50"
                  >
                    {sending ? "Enviando..." : "Enviar"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full min-h-[70vh] items-center justify-center px-6">
              <div className="rounded-[28px] border border-[#E6D1A5]/8 bg-[#17110E] px-8 py-7 text-center">
                <p className="text-xs font-black uppercase tracking-[0.34em] text-[#D9B45B]">
                  Mensajería directa
                </p>
                <p className="mt-3 text-lg font-bold text-[#F7F0DC]">
                  Selecciona una conversación para comenzar.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}