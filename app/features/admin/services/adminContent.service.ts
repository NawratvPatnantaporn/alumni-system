import { supabase } from "@/lib/supabase/client";

export type TargetAudience = "all" | "alumni" | "student";

export type CreateNewsInput = {
  authorId: string;
  title: string;
  excerpt?: string;
  content?: string;
  category?: string;
  coverImageUrl?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  sendNotification?: boolean;
  targetAudience?: TargetAudience;
};

export type CreateEventInput = {
  authorId: string;
  title: string;
  description?: string;
  category?: string;
  coverImageUrl?: string;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  eventMode?: "on-site" | "online" | "hybrid";
  capacity?: number | null;
  isPublished?: boolean;
  isFeatured?: boolean;
  sendNotification?: boolean;
  targetAudience?: TargetAudience;
};

export async function createNewsPost(input: CreateNewsInput) {
  const { data, error } = await supabase
    .from("news_posts")
    .insert({
      author_id: input.authorId,
      title: input.title,
      excerpt: input.excerpt || null,
      content: input.content || null,
      category: input.category || null,
      cover_image_url: input.coverImageUrl || null,
      is_published: input.isPublished ?? true,
      is_featured: input.isFeatured ?? false,
      send_notification: input.sendNotification ?? false,
      target_audience: input.targetAudience ?? "all",
      published_at:
        input.isPublished === false ? null : new Date().toISOString(),
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("CREATE NEWS ERROR:", error);
    throw error;
  }

  // ✅ log หลัง insert สำเร็จ
  await supabase.from("admin_activity_logs").insert({
    actor_id: input.authorId,
    action_type: "news_created",
    title: `สร้างข่าวสาร: ${input.title}`,
    description: input.excerpt || null,
    related_news_id: data.id,
  });

  // ✅ notification
  if (input.sendNotification) {
    await notifyUsersForContent({
      type: "news",
      title: "มีข่าวสารใหม่",
      message: input.title,
      relatedNewsPostId: data.id,
      targetAudience: input.targetAudience ?? "all",
    });
  }

  return data;
}

export async function createEvent(input: CreateEventInput) {
  const { data, error } = await supabase
    .from("events")
    .insert({
      author_id: input.authorId,
      title: input.title,
      description: input.description || null,
      category: input.category || null,
      cover_image_url: input.coverImageUrl || null,
      event_date: input.eventDate,
      start_time: input.startTime || null,
      end_time: input.endTime || null,
      location: input.location || null,
      event_mode: input.eventMode ?? "on-site",
      capacity: input.capacity ?? null,
      is_published: input.isPublished ?? true,
      is_featured: input.isFeatured ?? false,
      send_notification: input.sendNotification ?? false,
      target_audience: input.targetAudience ?? "all",
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("CREATE EVENT ERROR:", error);
    throw error;
  }

  // ✅ log
  await supabase.from("admin_activity_logs").insert({
    actor_id: input.authorId,
    action_type: "event_created",
    title: `สร้างกิจกรรม: ${input.title}`,
    description: input.description || null,
    related_event_id: data.id,
  });

  if (input.sendNotification) {
    await notifyUsersForContent({
      type: "event",
      title: "มีกิจกรรมใหม่",
      message: input.title,
      relatedEventId: data.id,
      targetAudience: input.targetAudience ?? "all",
    });
  }

  return data;
}

async function notifyUsersForContent(input: {
  type: "news" | "event";
  title: string;
  message: string;
  relatedNewsPostId?: string;
  relatedEventId?: string;
  targetAudience: TargetAudience;
}) {
  let query = supabase.from("profiles").select("id, role");

  if (input.targetAudience !== "all") {
    query = query.eq("role", input.targetAudience);
  }

  const { data: users, error } = await query;

  if (error) throw error;
  if (!users?.length) return;

  const rows = users.map((u) => ({
    user_id: u.id,
    type: input.type,
    title: input.title,
    message: input.message,
    related_news_post_id: input.relatedNewsPostId ?? null,
    related_event_id: input.relatedEventId ?? null,
    is_read: false,
    channel: "in_app",
  }));

  await supabase.from("notifications").insert(rows);
}