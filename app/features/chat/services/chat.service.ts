import { supabase } from "@/lib/supabase/client";
import type { ChatAttachment, ChatConversation, ChatMessage, ChatProfile, ChatUnreadSummaryItem } from "../types/chat";

export const CHAT_MESSAGE_PAGE_SIZE = 30;

export function getDirectKey(userA: string, userB: string) {
  return [userA, userB].sort().join(":");
}

function getFullName(profile?: ChatProfile | null) {
  if (!profile) return "ไม่ทราบชื่อ";
  const fullName = `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim();
  return fullName || profile.email || "ไม่ทราบชื่อ";
}

export async function searchChatUsers({
  keyword,
  currentUserId,
}: {
  keyword: string;
  currentUserId: string;
}) {
  let query = supabase
    .from("profiles")
    .select(
      `
      id,
      first_name,
      last_name,
      email,
      role,
      avatar_url,
      is_active
    `,
    )
    .neq("id", currentUserId)
    .eq("is_active", true)
    .limit(20);

  const trimmed = keyword.trim();

  if (trimmed) {
    query = query.or(
      `first_name.ilike.%${trimmed}%,last_name.ilike.%${trimmed}%,email.ilike.%${trimmed}%`,
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("SEARCH CHAT USERS ERROR:", error.message, error.details, error.hint);
    throw error;
  }

  return (data ?? []) as ChatProfile[];
}

export async function createOrGetDirectConversation({
  currentUserId,
  targetUserId,
}: {
  currentUserId: string;
  targetUserId: string;
}) {
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    console.error("GET AUTH USER ERROR:", authError.message);
    throw authError;
  }

  if (!authUser?.id) {
    throw new Error("กรุณาเข้าสู่ระบบก่อนเริ่มแชท");
  }

  if (!targetUserId) {
    throw new Error("ไม่พบผู้ใช้ปลายทาง");
  }

  if (authUser.id === targetUserId) {
    throw new Error("ไม่สามารถเริ่มแชทกับตัวเองได้");
  }

  if (currentUserId !== authUser.id) {
    console.warn("CHAT CURRENT USER MISMATCH:", {
      currentUserId,
      authUid: authUser.id,
      targetUserId,
    });
  }

  const directKey = getDirectKey(authUser.id, targetUserId);

  const { data: existing, error: findError } = await supabase
    .from("chat_conversations")
    .select("id")
    .eq("direct_key", directKey)
    .maybeSingle();

  if (findError) {
    console.error(
      "FIND DIRECT CONVERSATION ERROR:",
      findError.message,
      findError.details,
      findError.hint,
    );
    throw findError;
  }

  if (existing?.id) {
    return existing.id as string;
  }

  const { data: conversation, error: createError } = await supabase
    .from("chat_conversations")
    .insert({
      type: "direct",
      direct_key: directKey,
      created_by: authUser.id,
      last_message: null,
      last_message_at: null,
    })
    .select("id")
    .single();

  if (createError) {
    console.error("CREATE CONVERSATION ERROR FULL:", {
      message: createError.message,
      details: createError.details,
      hint: createError.hint,
      code: createError.code,
      authUid: authUser.id,
      currentUserId,
      targetUserId,
      directKey,
    });
    throw createError;
  }

  const conversationId = conversation.id as string;

  const { error: membersError } = await supabase.from("chat_members").insert([
    {
      conversation_id: conversationId,
      user_id: authUser.id,
      last_read_at: new Date().toISOString(),
    },
    {
      conversation_id: conversationId,
      user_id: targetUserId,
      last_read_at: null,
    },
  ]);

  if (membersError) {
    console.error("CREATE CHAT MEMBERS ERROR FULL:", {
      message: membersError.message,
      details: membersError.details,
      hint: membersError.hint,
      code: membersError.code,
      authUid: authUser.id,
      targetUserId,
      conversationId,
    });
    throw membersError;
  }

  return conversationId;
}

export async function getMyConversations(userId: string): Promise<ChatConversation[]> {
  const { data: memberRows, error: memberError } = await supabase
    .from("chat_members")
    .select(
      `
      conversation_id,
      last_read_at,
      chat_conversations (
        id,
        type,
        direct_key,
        created_by,
        last_message,
        last_message_at,
        created_at,
        updated_at
      )
    `,
    )
    .eq("user_id", userId)
    .eq("is_archived", false);

  if (memberError) {
    console.error("GET MY CONVERSATIONS ERROR:", memberError.message, memberError.details, memberError.hint);
    throw memberError;
  }

  const conversations = (memberRows ?? [])
    .map((row: any) => row.chat_conversations)
    .filter(Boolean) as ChatConversation[];

  if (!conversations.length) return [];

  const conversationIds = conversations.map((item) => item.id);

  const { data: allMembers, error: allMembersError } = await supabase
    .from("chat_members")
    .select(
      `
      conversation_id,
      user_id,
      last_read_at,
      profiles (
        id,
        first_name,
        last_name,
        email,
        role,
        avatar_url,
        is_active
      )
    `,
    )
    .in("conversation_id", conversationIds);

  if (allMembersError) {
    console.error("GET CONVERSATION MEMBERS ERROR:", allMembersError.message, allMembersError.details, allMembersError.hint);
    throw allMembersError;
  }

  const { data: unreadRows, error: unreadError } = await supabase
    .from("chat_messages")
    .select("id, conversation_id, sender_id, created_at")
    .in("conversation_id", conversationIds)
    .neq("sender_id", userId)
    .is("deleted_at", null);

  if (unreadError) {
    console.error("GET UNREAD MESSAGES ERROR:", unreadError.message, unreadError.details, unreadError.hint);
    throw unreadError;
  }

  const myMemberMap = new Map<string, any>();
  const otherUserMap = new Map<string, ChatProfile | null>();

  (allMembers ?? []).forEach((row: any) => {
    if (row.user_id === userId) {
      myMemberMap.set(row.conversation_id, row);
    } else {
      otherUserMap.set(row.conversation_id, row.profiles ?? null);
    }
  });

  const unreadMap = new Map<string, number>();

  (unreadRows ?? []).forEach((msg: any) => {
    const myMember = myMemberMap.get(msg.conversation_id);
    const lastReadAt = myMember?.last_read_at;

    const isUnread =
      !lastReadAt || new Date(msg.created_at).getTime() > new Date(lastReadAt).getTime();

    if (isUnread) {
      unreadMap.set(msg.conversation_id, (unreadMap.get(msg.conversation_id) ?? 0) + 1);
    }
  });

  return conversations
    .map((conversation) => ({
      ...conversation,
      otherUser: otherUserMap.get(conversation.id) ?? null,
      unreadCount: unreadMap.get(conversation.id) ?? 0,
    }))
    .sort((a, b) => {
      const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
      const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
      return bTime - aTime;
    });
}

export async function getConversationMessagesPage({
  conversationId,
  before,
  limit = CHAT_MESSAGE_PAGE_SIZE,
}: {
  conversationId: string;
  before?: string | null;
  limit?: number;
}): Promise<ChatMessage[]> {
  let query = supabase
    .from("chat_messages")
    .select(
      `
      id,
      conversation_id,
      sender_id,
      message_type,
      body,
      created_at,
      updated_at,
      deleted_at,
      profiles (
        id,
        first_name,
        last_name,
        email,
        role,
        avatar_url,
        is_active
      ),
      chat_attachments (
        id,
        message_id,
        file_url,
        file_path,
        file_name,
        mime_type,
        size_bytes,
        created_at
      )
    `,
    )
    .eq("conversation_id", conversationId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (before) {
    query = query.lt("created_at", before);
  }

  const { data, error } = await query;

  if (error) {
    console.error(
      "GET CONVERSATION MESSAGES PAGE ERROR:",
      error.message,
      error.details,
      error.hint,
    );
    throw error;
  }

  // DB ดึง desc เพื่อเร็ว แต่ UI ต้องแสดงเก่า -> ใหม่
  return (data ?? [])
    .reverse()
    .map((item: any) => ({
      id: item.id,
      conversation_id: item.conversation_id,
      sender_id: item.sender_id,
      message_type: item.message_type,
      body: item.body,
      created_at: item.created_at,
      updated_at: item.updated_at,
      deleted_at: item.deleted_at,
      sender: item.profiles ?? null,
      attachments: item.chat_attachments ?? [],
    }));
}

export async function markConversationAsRead({
  conversationId,
  userId,
}: {
  conversationId: string;
  userId: string;
}) {
  const { error } = await supabase
    .from("chat_members")
    .update({
      last_read_at: new Date().toISOString(),
    })
    .eq("conversation_id", conversationId)
    .eq("user_id", userId);

  if (error) {
    console.error("MARK CONVERSATION READ ERROR:", error.message, error.details, error.hint);
    throw error;
  }
}

export async function updateConversationLastMessage({
  conversationId,
  lastMessage,
  lastMessageAt,
}: {
  conversationId: string;
  lastMessage: string;
  lastMessageAt?: string;
}) {
  const { error } = await supabase
    .from("chat_conversations")
    .update({
      last_message: lastMessage,
      last_message_at: lastMessageAt ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversationId);

  if (error) {
    console.error("UPDATE CONVERSATION LAST MESSAGE ERROR:", error.message, error.details, error.hint);
    throw error;
  }
}

export async function sendTextMessage({
  conversationId,
  senderId,
  body,
}: {
  conversationId: string;
  senderId: string;
  body: string;
}) {
  const trimmed = body.trim();
  if (!trimmed) throw new Error("กรุณาพิมพ์ข้อความ");

  const { data: message, error } = await supabase
    .from("chat_messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      message_type: "text",
      body: trimmed,
    })
    .select("id, created_at")
    .single();

  if (error) {
    console.error("SEND TEXT MESSAGE ERROR:", error.message, error.details, error.hint);
    throw error;
  }

  await updateConversationLastMessage({
    conversationId,
    lastMessage: trimmed,
    lastMessageAt: message.created_at,
  });

  return message.id as string;
}

export async function sendImageMessage({
  conversationId,
  senderId,
  file,
  caption,
}: {
  conversationId: string;
  senderId: string;
  file: File;
  caption?: string;
}) {
  if (!file.type.startsWith("image/")) {
    throw new Error("รองรับเฉพาะไฟล์รูปภาพเท่านั้น");
  }

  const maxSize = 5 * 1024 * 1024;

  if (file.size > maxSize) {
    throw new Error("รูปภาพต้องมีขนาดไม่เกิน 5MB");
  }

  const messageType = caption?.trim() ? "mixed" : "image";

  const { data: message, error: messageError } = await supabase
    .from("chat_messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      message_type: messageType,
      body: caption?.trim() || null,
    })
    .select("id, created_at")
    .single();

  if (messageError) {
    console.error("CREATE IMAGE MESSAGE ERROR:", messageError.message, messageError.details, messageError.hint);
    throw messageError;
  }

  const messageId = message.id as string;
  const safeFileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  const filePath = `${conversationId}/${messageId}/${safeFileName}`;

  const { error: uploadError } = await supabase.storage
    .from("chat-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("UPLOAD CHAT IMAGE ERROR:", uploadError.message, uploadError);
    throw uploadError;
  }

  const { data: publicUrlData } = supabase.storage
    .from("chat-images")
    .getPublicUrl(filePath);

  const fileUrl = publicUrlData.publicUrl;

  const { error: attachmentError } = await supabase
    .from("chat_attachments")
    .insert({
      message_id: messageId,
      file_url: fileUrl,
      file_path: filePath,
      file_name: file.name,
      mime_type: file.type,
      size_bytes: file.size,
    });

  if (attachmentError) {
    console.error("CREATE CHAT ATTACHMENT ERROR:", attachmentError.message, attachmentError.details, attachmentError.hint);
    throw attachmentError;
  }

  await updateConversationLastMessage({
    conversationId,
    lastMessage: caption?.trim() || "ส่งรูปภาพ",
    lastMessageAt: message.created_at,
  });

  return messageId;
}

export function subscribeToConversationMessages({
  conversationId,
  onInsert,
}: {
  conversationId: string;
  onInsert: (messageId: string) => void;
}) {
  return supabase
    .channel(`chat-messages:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onInsert(payload.new.id as string);
      },
    )
    .subscribe();
}

export function subscribeToMyConversations({
  userId,
  onChange,
}: {
  userId: string;
  onChange: () => void;
}) {
  return supabase
    .channel(`my-conversations:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "chat_conversations",
      },
      () => {
        onChange();
      },
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "chat_messages",
      },
      () => {
        onChange();
      },
    )
    .subscribe();
}

export async function getSingleMessage(messageId: string): Promise<ChatMessage | null> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select(
      `
      id,
      conversation_id,
      sender_id,
      message_type,
      body,
      created_at,
      updated_at,
      deleted_at,
      profiles (
        id,
        first_name,
        last_name,
        email,
        role,
        avatar_url,
        is_active
      ),
      chat_attachments (
        id,
        message_id,
        file_url,
        file_path,
        file_name,
        mime_type,
        size_bytes,
        created_at
      )
    `,
    )
    .eq("id", messageId)
    .maybeSingle();

  if (error) {
    console.error("GET SINGLE MESSAGE ERROR:", error.message, error.details, error.hint);
    throw error;
  }

  if (!data) return null;

  const item: any = data;

  return {
    id: item.id,
    conversation_id: item.conversation_id,
    sender_id: item.sender_id,
    message_type: item.message_type,
    body: item.body,
    created_at: item.created_at,
    updated_at: item.updated_at,
    deleted_at: item.deleted_at,
    sender: item.profiles ?? null,
    attachments: item.chat_attachments ?? [],
  };
}

function isAbortLikeError(error: any) {
  const message = String(error?.message ?? error ?? "");
  const name = String(error?.name ?? "");

  return (
    name === "AbortError" ||
    message.includes("AbortError") ||
    message.includes("signal is aborted") ||
    message.includes("Request was aborted") ||
    message.includes("timeout or manual cancellation")
  );
}

export async function getMyChatUnreadSummary(limit = 8) {
  const { data, error } = await supabase.rpc("get_my_chat_unread_summary", {
    p_limit: limit,
  });

  if (error) {
    if (isAbortLikeError(error)) {
      return {
        items: [],
        totalUnread: 0,
        aborted: true,
      };
    }

    console.error("GET CHAT UNREAD SUMMARY ERROR:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      raw: error,
    });

    throw error;
  }

  const items = (data ?? []).map((item: any): ChatUnreadSummaryItem => ({
    conversation_id: item.conversation_id,
    other_user_id: item.other_user_id,
    other_first_name: item.other_first_name,
    other_last_name: item.other_last_name,
    other_email: item.other_email,
    other_role: item.other_role,
    other_avatar_url: item.other_avatar_url,
    last_message: item.last_message,
    last_message_at: item.last_message_at,
    unread_count: Number(item.unread_count ?? 0),
  }));

  const totalUnread = items.reduce(
    (sum: number, item: ChatUnreadSummaryItem) => sum + item.unread_count,
    0,
  );

  return {
    items,
    totalUnread,
    aborted: false,
  };
}

export { getFullName };