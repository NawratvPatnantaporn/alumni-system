"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ImagePlus, Loader2, MessageCircle, MoreVertical, Search, Send, UserPlus, X } from "lucide-react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createOrGetDirectConversation, getConversationMessagesPage, getFullName, getMyConversations, getSingleMessage, markConversationAsRead, searchChatUsers, sendImageMessage, sendTextMessage, subscribeToConversationMessages, subscribeToMyConversations, CHAT_MESSAGE_PAGE_SIZE } from "@/app/features/chat/services/chat.service";
import type { ChatConversation, ChatMessage, ChatProfile } from "@/app/features/chat/types/chat";
type LocalChatMessage = ChatMessage & {
  clientStatus?: "sending" | "sent" | "failed";
  clientTempId?: string;
  failedText?: string;
  retryPayload?: {
    text: string;
    file?: File | null;
  };
};
import { useSearchParams } from "next/navigation";

function formatTime(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getInitials(profile?: ChatProfile | null) {
  const name = getFullName(profile);
  return name.slice(0, 2).toUpperCase();
}

function roleLabel(role?: string | null) {
  if (role === "student") return "นักศึกษา";
  if (role === "alumni") return "ศิษย์เก่า";
  if (role === "admin") return "Admin";
  if (role === "super_admin") return "Super Admin";
  return "ผู้ใช้";
}

export default function MessagesPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const conversationIdFromUrl = searchParams.get("conversationId");

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<LocalChatMessage[]>([]);
  const [oldestMessageAt, setOldestMessageAt] = useState<string | null>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);

  const [conversationLoading, setConversationLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [composerText, setComposerText] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const [newChatOpen, setNewChatOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<ChatProfile[]>([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const loadingOlderRef = useRef(false);

  const selectedConversation = useMemo(() => {
    return (
      conversations.find((item) => item.id === selectedConversationId) ?? null
    );
  }, [conversations, selectedConversationId]);

  const filteredConversations = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return conversations;

    return conversations.filter((item) => {
      const name = getFullName(item.otherUser).toLowerCase();
      const email = item.otherUser?.email?.toLowerCase() ?? "";
      const last = item.last_message?.toLowerCase() ?? "";

      return (
        name.includes(keyword) ||
        email.includes(keyword) ||
        last.includes(keyword)
      );
    });
  }, [conversations, searchText]);

  const scrollToBottom = (behavior: ScrollBehavior = "auto") => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  };

  const loadConversations = async (options?: { silent?: boolean }) => {
    if (!user?.id) return;

    try {
      if (!options?.silent) {
        setConversationLoading(true);
      }
      const result = await getMyConversations(user.id);

      setConversations(result);

      setSelectedConversationId((current) => {
        if (
          conversationIdFromUrl &&
          result.some((item) => item.id === conversationIdFromUrl)
        ) {
          return conversationIdFromUrl;
        }

        if (current && result.some((item) => item.id === current)) {
          return current;
        }

        if (result.length > 0) {
          return result[0].id;
        }

        return null;
      })
    } catch (error: any) {
      console.error("LOAD CONVERSATIONS ERROR:", error);
      Swal.fire({
        icon: "error",
        title: "โหลดบทสนทนาไม่สำเร็จ",
        text: error?.message ?? "เกิดข้อผิดพลาด",
      });
    } finally {
      if (!options?.silent) {
        setConversationLoading(false);
      }
    }
  };

  const loadMessages = async (conversationId: string) => {
    if (!user?.id) return;

    try {
      setMessageLoading(true);
      setHasMoreMessages(true);
      setOldestMessageAt(null);

      const result = await getConversationMessagesPage({
        conversationId,
        limit: CHAT_MESSAGE_PAGE_SIZE,
      });

      setMessages(
        result.map((message) => ({
          ...message,
          clientStatus: "sent" as const,
        })),
      );

      setOldestMessageAt(result[0]?.created_at ?? null);
      setHasMoreMessages(result.length === CHAT_MESSAGE_PAGE_SIZE);

      await markConversationAsRead({
        conversationId,
        userId: user.id,
      });

      await loadConversations({ silent: true });
    } catch (error: any) {
      console.error("LOAD MESSAGES ERROR:", error);
      Swal.fire({
        icon: "error",
        title: "โหลดข้อความไม่สำเร็จ",
        text: error?.message ?? "เกิดข้อผิดพลาด",
      });
    } finally {
      setMessageLoading(false);
    }
  };

  const loadOlderMessages = async () => {
    if (!selectedConversationId) return;
    if (!oldestMessageAt) return;
    if (!hasMoreMessages) return;
    if (loadingOlderRef.current) return;

    const container = messagesContainerRef.current;
    if (!container) return;

    try {
      loadingOlderRef.current = true;
      setLoadingOlderMessages(true);

      const previousScrollHeight = container.scrollHeight;
      const prevLoadingScrollTop = container.scrollTop;

      const olderMessages = await getConversationMessagesPage({
        conversationId: selectedConversationId,
        before: oldestMessageAt,
        limit: CHAT_MESSAGE_PAGE_SIZE,
      });

      if (olderMessages.length ==0) {
        setHasMoreMessages(false);
        return;
      }

      setMessages((prev) => {
        const existingIds = new Set(prev.map((message) => message.id));

        const cleanOlder = olderMessages
          .filter((message) => !existingIds.has(message.id))
          .map((message) => ({
            ...message,
            clientStatus: "sent" as const,
          }));

        return [...cleanOlder, ...prev];
      });

      setOldestMessageAt(olderMessages[0]?.created_at ?? oldestMessageAt);
      setHasMoreMessages(olderMessages.length === CHAT_MESSAGE_PAGE_SIZE);

      requestAnimationFrame(() => {
        const newScrollHeight = container.scrollHeight;
        container.scrollTop =
          newScrollHeight - previousScrollHeight + prevLoadingScrollTop;
      });
    } catch (error: any) {
      console.error("LOAD OLDER MESSAGES ERROR:", error);
      Swal.fire({
        icon: "error",
        title: "โหลดข้อความเก่าไม่สำเร็จ",
        text: error?.message ?? "เกิดข้อผิดพลาด",
      });
    } finally {
      loadingOlderRef.current = false;
      setLoadingOlderMessages(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    loadConversations();
  }, [user?.id, conversationIdFromUrl]);

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      setOldestMessageAt(null);
      setHasMoreMessages(true);
      return;
    }

    setMessages([]);
    setOldestMessageAt(null);
    setHasMoreMessages(true);
    setLoadingOlderMessages(false);
    loadingOlderRef.current = false;

    loadMessages(selectedConversationId);
  }, [selectedConversationId]);

  useEffect(() => {
    if (!user?.id) return;

    const channel = subscribeToMyConversations({
      userId: user.id,
      onChange: () => {
        loadConversations({ silent: true });
      },
    });

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id]);

  useEffect(() => {
    if (!selectedConversationId) return;

    const channel = subscribeToConversationMessages({
      conversationId: selectedConversationId,
      onInsert: async (messageId) => {
        const newMessage = await getSingleMessage(messageId);
        if (!newMessage) return;

        setMessages((prev) => {
          if (prev.some((item) => item.id === newMessage.id)) return prev;

          const hasSendingOwnMessage = prev.some(
            (item) =>
              item.sender_id === newMessage.sender_id &&
              item.sender_id === user?.id &&
              item.clientStatus === "sending" &&
              item.body === newMessage.body,
          );

          if (hasSendingOwnMessage) return prev;

          return [
            ...prev,
            {
              ...newMessage,
              clientStatus: "sent",
            },
          ];
        });

        if (user?.id) {
          await markConversationAsRead({
            conversationId: selectedConversationId,
            userId: user.id,
          });
        }

        loadConversations({ silent: true });
      },
    });

    return () => {
      channel.unsubscribe();
    };
  }, [selectedConversationId, user?.id]);

  useLayoutEffect(() => {
    if (messageLoading) return;
    if(!selectedConversationId) return;
    if (messages.length === 0) return;

    scrollToBottom("auto");
  }, [messageLoading, selectedConversationId, messages.length]);

  useEffect(() => {
    if (!selectedImage) {
      setImagePreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(selectedImage);
    setImagePreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [selectedImage]);

  useEffect(() => {
    const search = async () => {
      if (!user?.id) return;

      try {
        setUserSearchLoading(true);
        const result = await searchChatUsers({
          keyword: userSearch,
          currentUserId: user.id,
        });
        setSearchResults(result);
      } catch (error) {
        console.error("SEARCH USERS ERROR:", error);
      } finally {
        setUserSearchLoading(false);
      }
    };

    if (!newChatOpen) return;

    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [userSearch, user?.id, newChatOpen]);

  const handleStartConversation = async (targetUserId: string) => {
    if (!user?.id) return;

    try {
      const conversationId = await createOrGetDirectConversation({
        currentUserId: user.id,
        targetUserId,
      });

      setSelectedConversationId(conversationId);
      setNewChatOpen(false);
      setUserSearch("");
      await loadConversations();
    } catch (error: any) {
      console.error("START CONVERSATION ERROR:", error);
      Swal.fire({
        icon: "error",
        title: "เริ่มแชทไม่สำเร็จ",
        text: error?.message ?? "เกิดข้อผิดพลาด",
      });
    }
  };

  const handleSend = async () => {
    if (!user?.id || !selectedConversationId) return;

    const text = composerText.trim();
    const fileToSend = selectedImage;

    if (!text && !fileToSend) return;

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const now = new Date().toISOString();

    const optimisticMessage: LocalChatMessage = {
      id: tempId,
      clientTempId: tempId,
      conversation_id: selectedConversationId,
      sender_id: user.id,
      message_type: fileToSend ? (text ? "mixed" : "image") : "text",
      body: text || null,
      created_at: now,
      updated_at: null,
      deleted_at: null,
      clientStatus: "sending",
      retryPayload: {
        text,
        file: fileToSend,
      },
      sender: {
        id: user.id,
        first_name: (user as any).firstName ?? (user as any).first_name ?? null,
        last_name: (user as any).lastName ?? (user as any).last_name ?? null,
        email: user.email ?? null,
        role: user.role ?? null,
        avatar_url: (user as any).avatarUrl ?? (user as any).avatar_url ?? null,
        is_active: true,
      },
      attachments: fileToSend
        ? [
            {
              id: `temp-attachment-${tempId}`,
              message_id: tempId,
              file_url: URL.createObjectURL(fileToSend),
              file_path: null,
              file_name: fileToSend.name,
              mime_type: fileToSend.type,
              size_bytes: fileToSend.size,
              created_at: now,
            },
          ]
        : [],
    };

    // โชว์ข้อความทันที
    setMessages((prev) => [...prev, optimisticMessage]);

    requestAnimationFrame(() => {
      scrollToBottom("smooth");
    });

    // clear input ทันที
    setComposerText("");
    setSelectedImage(null);

    try {
      setSending(true);

      let realMessageId: string;

      if (fileToSend) {
        realMessageId = await sendImageMessage({
          conversationId: selectedConversationId,
          senderId: user.id,
          file: fileToSend,
          caption: text,
        });
      } else {
        realMessageId = await sendTextMessage({
          conversationId: selectedConversationId,
          senderId: user.id,
          body: text,
        });
      }

      const realMessage = await getSingleMessage(realMessageId);

      if (realMessage) {
        setMessages((prev) => {
          const withoutRealDuplicate = prev.filter(
            (message) => message.id != realMessage.id,
          );

          return withoutRealDuplicate.map((message) =>
            message.id === tempId
              ? {
                  ...realMessage,
                  clientStatus: "sent" as const,
                }
              : message,
          );
        });
      } else {
        setMessages((prev) =>
          prev.map((message) =>
            message.id === tempId
              ? {
                  ...message,
                  clientStatus: "sent",
                }
              : message,
          ),
        );
      }

      await loadConversations({ silent: true });
    } catch (error: any) {
      console.error("SEND MESSAGE ERROR:", error);

      setMessages((prev) =>
        prev.map((message) =>
          message.id === tempId
            ? {
                ...message,
                clientStatus: "failed",
                failedText: error?.message ?? "ส่งข้อความไม่สำเร็จ",
              }
            : message,
        ),
      );
    } finally {
      setSending(false);
    }
  };

  const handleRetryMessage = async (failedMessage: LocalChatMessage) => {
    if (!user?.id || !selectedConversationId || !failedMessage.retryPayload)
      return;

    const tempId = failedMessage.id;
    const { text, file } = failedMessage.retryPayload;

    setMessages((prev) =>
      prev.map((message) =>
        message.id === tempId
          ? {
              ...message,
              clientStatus: "sending",
              failedText: undefined,
            }
          : message,
      ),
    );

    try {
      let realMessageId: string;

      if (file) {
        realMessageId = await sendImageMessage({
          conversationId: selectedConversationId,
          senderId: user.id,
          file,
          caption: text,
        });
      } else {
        realMessageId = await sendTextMessage({
          conversationId: selectedConversationId,
          senderId: user.id,
          body: text,
        });
      }

      const realMessage = await getSingleMessage(realMessageId);

      if (realMessage) {
        setMessages((prev) =>
          prev.map((message) =>
            message.id === tempId
              ? {
                  ...realMessage,
                  clientStatus: "sent",
                }
              : message,
          ),
        );
      }

      await loadConversations({ silent: true });
    } catch (error: any) {
      console.error("RETRY MESSAGE ERROR:", error);

      setMessages((prev) =>
        prev.map((message) =>
          message.id === tempId
            ? {
                ...message,
                clientStatus: "failed",
                failedText: error?.message ?? "ส่งข้อความไม่สำเร็จ",
              }
            : message,
        ),
      );
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      Swal.fire({
        icon: "warning",
        title: "ไฟล์ไม่ถูกต้อง",
        text: "รองรับเฉพาะไฟล์รูปภาพเท่านั้น",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: "warning",
        title: "ไฟล์ใหญ่เกินไป",
        text: "กรุณาเลือกรูปภาพขนาดไม่เกิน 5MB",
      });
      return;
    }

    setSelectedImage(file);
    event.target.value = "";
  };

  const handleComposerKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  if (!user?.id) {
    return (
      <div className="p-6 text-muted-foreground">
        กรุณาเข้าสู่ระบบก่อนใช้งานข้อความ
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] overflow-hidden px-4 py-4 sm:px-6 lg:px-8">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-2xl bg-primary/10 p-2 text-primary">
              <MessageCircle className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              ข้อความ
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            สนทนากับนักศึกษาและศิษย์เก่าภายในระบบ Alumni Connect
          </p>
        </div>

        <Button onClick={() => setNewChatOpen(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          เริ่มแชทใหม่
        </Button>
      </div>

      <div className="grid h-[calc(100%-84px)] overflow-hidden rounded-3xl border bg-card shadow-sm lg:grid-cols-[360px_1fr]">
        <aside
          className={`border-r bg-muted/20 ${
            selectedConversationId ? "hidden lg:block" : "block"
          }`}
        >
          <div className="border-b p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="ค้นหาบทสนทนา..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="h-[calc(100%-73px)] overflow-y-auto p-2">
            {conversationLoading ? (
              <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังโหลดบทสนทนา...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex h-60 flex-col items-center justify-center rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                <MessageCircle className="mb-3 h-10 w-10 opacity-50" />
                ยังไม่มีบทสนทนา
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setNewChatOpen(true)}
                >
                  เริ่มแชทใหม่
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredConversations.map((conversation) => {
                  const active = conversation.id === selectedConversationId;
                  const other = conversation.otherUser;
                  const unread = conversation.unreadCount ?? 0;

                  return (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversationId(conversation.id)}
                      className={`w-full rounded-2xl p-3 text-left transition ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex gap-3">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full ${
                            active
                              ? "bg-white/20"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {other?.avatar_url ? (
                            <img
                              src={other.avatar_url}
                              alt={getFullName(other)}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-bold">
                              {getInitials(other)}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="truncate font-semibold">
                              {getFullName(other)}
                            </p>
                            <span
                              className={`shrink-0 text-xs ${
                                active
                                  ? "text-primary-foreground/80"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {formatTime(conversation.last_message_at)}
                            </span>
                          </div>

                          <div className="mt-1 flex items-center justify-between gap-2">
                            <p
                              className={`truncate text-sm ${
                                active
                                  ? "text-primary-foreground/80"
                                  : unread > 0
                                    ? "font-semibold text-foreground"
                                    : "text-muted-foreground"
                              }`}
                            >
                              {conversation.last_message || "เริ่มบทสนทนา"}
                            </p>

                            {unread > 0 && (
                              <span
                                className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold ${
                                  active
                                    ? "bg-white text-primary"
                                    : "bg-primary text-primary-foreground"
                                }`}
                              >
                                {unread}
                              </span>
                            )}
                          </div>

                          <Badge
                            variant={active ? "secondary" : "outline"}
                            className="mt-2 rounded-full text-[10px]"
                          >
                            {roleLabel(other?.role)}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        <main
          className={`min-h-0 flex-col ${
            selectedConversationId ? "flex" : "hidden lg:flex"
          }`}
        >
          {!selectedConversation ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <MessageCircle className="mb-4 h-14 w-14 opacity-40" />
              <h2 className="text-lg font-semibold text-foreground">
                เลือกบทสนทนา
              </h2>
              <p className="mt-1 text-sm">
                เลือกห้องแชทจากด้านซ้าย หรือเริ่มแชทใหม่
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b bg-background/80 p-4 backdrop-blur">
                <div className="flex min-w-0 items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={() => setSelectedConversationId(null)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
                    {selectedConversation.otherUser?.avatar_url ? (
                      <img
                        src={selectedConversation.otherUser.avatar_url}
                        alt={getFullName(selectedConversation.otherUser)}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold">
                        {getInitials(selectedConversation.otherUser)}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {getFullName(selectedConversation.otherUser)}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="rounded-full text-[10px]"
                      >
                        {roleLabel(selectedConversation.otherUser?.role)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {selectedConversation.otherUser?.email}
                      </span>
                    </div>
                  </div>
                </div>

                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>

              <div 
                ref={messagesContainerRef}
                onScroll={(event) => {
                  const element = event.currentTarget;

                  if (element.scrollTop <= 80) {
                    loadOlderMessages();
                  }
                }}
                className="min-h-0 flex-1 overflow-y-auto bg-muted/20 p-4"
              >
                {messageLoading ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังโหลดข้อความ...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                    <MessageCircle className="mb-3 h-12 w-12 opacity-40" />
                    <p className="font-medium text-foreground">
                      ยังไม่มีข้อความ
                    </p>
                    <p className="text-sm">ส่งข้อความแรกเพื่อเริ่มบทสนทนา</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex h-8 items-center justify-center">
                      {loadingOlderMessages ? (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          กำลังโหลดข้อความเก่า...
                        </div>
                      ) : !hasMoreMessages && messages.length > 0 ? (
                        <p className="text-xs text-muted-foreground">
                          เริ่มต้นบทสนทนาแล้ว
                        </p>
                      ) : null}
                    </div>

                    {messages.map((message) => {
                      const isMine = message.sender_id === user.id;

                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`flex max-w-[82%] gap-2 sm:max-w-[70%] ${
                              isMine ? "flex-row-reverse" : "flex-row"
                            }`}
                          >
                            {!isMine && (
                              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-bold text-primary">
                                {message.sender?.avatar_url ? (
                                  <img
                                    src={message.sender.avatar_url}
                                    alt={getFullName(message.sender)}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  getInitials(message.sender)
                                )}
                              </div>
                            )}

                            <div>
                              {!isMine && (
                                <p className="mb-1 text-xs text-muted-foreground">
                                  {getFullName(message.sender)}
                                </p>
                              )}

                              <div
                                className={`rounded-3xl px-4 py-3 shadow-sm ${
                                  isMine
                                    ? "rounded-br-md bg-primary text-primary-foreground"
                                    : "rounded-bl-md border bg-background"
                                }`}
                              >
                                {message.attachments &&
                                  message.attachments.length > 0 && (
                                    <div className="mb-2 grid gap-2">
                                      {message.attachments.map((attachment) => (
                                        <a
                                          key={attachment.id}
                                          href={attachment.file_url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="block overflow-hidden rounded-2xl border bg-muted"
                                        >
                                          <img
                                            src={attachment.file_url}
                                            alt={
                                              attachment.file_name ??
                                              "chat image"
                                            }
                                            className="max-h-72 w-full object-cover"
                                          />
                                        </a>
                                      ))}
                                    </div>
                                  )}

                                {message.body && (
                                  <p className="whitespace-pre-wrap break-words text-sm leading-6">
                                    {message.body}
                                  </p>
                                )}
                              </div>

                              <div
                                className={`mt-1 text-xs ${
                                  message.clientStatus === "failed"
                                    ? "text-red-600"
                                    : "text-muted-foreground"
                                } ${isMine ? "text-right" : "text-left"}`}
                              >
                                {message.clientStatus === "sending" ? (
                                  <span>กำลังส่ง...</span>
                                ) : message.clientStatus === "failed" ? (
                                  <button
                                    type="button"
                                    onClick={() => handleRetryMessage(message)}
                                    className="font-medium underline underline-offset-2"
                                  >
                                    ส่งไม่สำเร็จ · กดส่งใหม่
                                  </button>
                                ) : (
                                  <span>
                                    {formatDate(message.created_at)} ·{" "}
                                    {formatTime(message.created_at)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}

                    <div ref={scrollRef} />
                  </div>
                )}
              </div>

              <div className="border-t bg-background p-4">
                {imagePreviewUrl && (
                  <div className="mb-3 flex items-start gap-3 rounded-2xl border bg-muted/40 p-3">
                    <img
                      src={imagePreviewUrl}
                      alt="preview"
                      className="h-20 w-20 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {selectedImage?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        รูปภาพจะถูกส่งพร้อมข้อความ
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedImage(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <div className="flex items-end gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleImageChange}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus className="h-5 w-5" />
                  </Button>

                  <textarea
                    value={composerText}
                    onChange={(event) => setComposerText(event.target.value)}
                    onKeyDown={handleComposerKeyDown}
                    placeholder="พิมพ์ข้อความ..."
                    rows={1}
                    className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border bg-background px-4 py-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  />

                  <Button
                    onClick={handleSend}
                    disabled={!composerText.trim() && !selectedImage}
                    size="icon"
                    className="h-11 w-11 rounded-2xl"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  Enter เพื่อส่ง · Shift + Enter เพื่อขึ้นบรรทัดใหม่ ·
                  รูปภาพไม่เกิน 5MB
                </p>
              </div>
            </>
          )}
        </main>
      </div>

      <Dialog open={newChatOpen} onOpenChange={setNewChatOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>เริ่มแชทใหม่</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={userSearch}
                onChange={(event) => setUserSearch(event.target.value)}
                placeholder="ค้นหาชื่อ อีเมล นักศึกษา หรือศิษย์เก่า..."
                className="pl-9"
              />
            </div>

            <div className="max-h-[420px] overflow-y-auto rounded-2xl border">
              {userSearchLoading ? (
                <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังค้นหา...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                  ไม่พบผู้ใช้
                </div>
              ) : (
                <div className="divide-y">
                  {searchResults.map((profile) => (
                    <button
                      key={profile.id}
                      onClick={() => handleStartConversation(profile.id)}
                      className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-muted"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
                        {profile.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt={getFullName(profile)}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-bold">
                            {getInitials(profile)}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">
                          {getFullName(profile)}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          {profile.email}
                        </p>
                      </div>

                      <Badge variant="outline" className="rounded-full">
                        {roleLabel(profile.role)}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}