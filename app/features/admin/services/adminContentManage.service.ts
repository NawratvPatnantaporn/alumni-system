import { supabase } from "@/lib/supabase/client";

export type ContentType = "news" | "event";

export type NewsContentItem = {
  id: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  category: string | null;
  cover_image_url: string | null;
  is_published: boolean;
  is_featured: boolean;
  target_audience?: string | null;
  created_at: string;
  updated_at: string | null;
};

export type EventContentItem = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  cover_image_url: string | null;
  event_date: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  event_mode: string | null;
  capacity: number | null;
  is_published: boolean;
  is_featured: boolean;
  target_audience?: string | null;
  created_at: string;
  updated_at: string | null;
};

export type ContentItem = NewsContentItem | EventContentItem;

export async function getNewsList(search = "") {
  let query = supabase
    .from("news_posts")
    .select("*")
    .order("created_at", { ascending: false });

  const keyword = search.trim();

  if (keyword) {
    query = query.or(
      `title.ilike.%${keyword}%,excerpt.ilike.%${keyword}%,content.ilike.%${keyword}%,category.ilike.%${keyword}%`
    );
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data ?? []) as NewsContentItem[];
}

export async function getEventsList(search = "") {
  let query = supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  const keyword = search.trim();

  if (keyword) {
    query = query.or(
      `title.ilike.%${keyword}%,description.ilike.%${keyword}%,category.ilike.%${keyword}%,location.ilike.%${keyword}%`
    );
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data ?? []) as EventContentItem[];
}

export async function updateNewsPost(
  id: string,
  payload: {
    title?: string;
    excerpt?: string | null;
    content?: string | null;
    category?: string | null;
    coverImageUrl?: string | null;
    isPublished?: boolean;
    isFeatured?: boolean;
    targetAudience?: string | null;
  }
) {
  const { error } = await supabase
    .from("news_posts")
    .update({
      title: payload.title,
      excerpt: payload.excerpt,
      content: payload.content,
      category: payload.category,
      cover_image_url: payload.coverImageUrl,
      is_published: payload.isPublished,
      is_featured: payload.isFeatured,
      target_audience: payload.targetAudience,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

export async function updateEvent(
  id: string,
  payload: {
    title?: string;
    description?: string | null;
    category?: string | null;
    coverImageUrl?: string | null;
    eventDate?: string | null;
    startTime?: string | null;
    endTime?: string | null;
    location?: string | null;
    eventMode?: string | null;
    capacity?: number | null;
    isPublished?: boolean;
    isFeatured?: boolean;
    targetAudience?: string | null;
  }
) {
  const { error } = await supabase
    .from("events")
    .update({
      title: payload.title,
      description: payload.description,
      category: payload.category,
      cover_image_url: payload.coverImageUrl,
      event_date: payload.eventDate,
      start_time: payload.startTime,
      end_time: payload.endTime,
      location: payload.location,
      event_mode: payload.eventMode,
      capacity: payload.capacity,
      is_published: payload.isPublished,
      is_featured: payload.isFeatured,
      target_audience: payload.targetAudience,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

export async function toggleNewsPublished(id: string, isPublished: boolean) {
  return updateNewsPost(id, {
    isPublished,
  });
}

export async function toggleEventPublished(id: string, isPublished: boolean) {
  return updateEvent(id, {
    isPublished,
  });
}

export async function deleteNews(id: string) {
  const { error } = await supabase.from("news_posts").delete().eq("id", id);

  if (error) throw error;
}

export async function deleteEvent(id: string) {
  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) throw error;
}