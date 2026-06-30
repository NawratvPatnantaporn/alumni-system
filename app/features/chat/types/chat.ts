export type ChatProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  role: string | null;
  avatar_url: string | null;
  is_active: boolean | null;
};

export type ChatConversation = {
  id: string;
  type: "direct";
  direct_key: string | null;
  created_by: string | null;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  otherUser?: ChatProfile | null;
  unreadCount?: number;
};

export type ChatMember = {
  id: string;
  conversation_id: string;
  user_id: string;
  last_read_at: string | null;
  is_archived: boolean;
  joined_at: string;
  profile?: ChatProfile | null;
};

export type ChatAttachment = {
  id: string;
  message_id: string;
  file_url: string;
  file_path: string | null;
  file_name: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
};

export type ChatMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_type: "text" | "image" | "mixed";
  body: string | null;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  attachments?: ChatAttachment[];
  sender?: ChatProfile | null;
};

export type ChatUnreadSummaryItem = {
  conversation_id: string;
  other_user_id: string | null;
  other_first_name: string | null;
  other_last_name: string | null;
  other_email: string | null;
  other_role: string | null;
  other_avatar_url: string | null;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
};