import { supabase } from "@/lib/supabase/client";

export async function getMyNotifications(userId: string) {
  const { data, error } = await supabase
    .from("notifications")
    .select(`
      id,
      user_id,
      type,
      title,
      message,
      related_job_post_id,
      related_skill_id,
      matched_skill_names,
      channel,
      is_read,
      is_email_sent,
      created_at,
      read_at
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error(
      "GET MY NOTIFICATIONS ERROR:",
      error.message,
      error.details,
      error.hint
    );
    throw error;
  }

  return data ?? [];
}

export async function markNotificationAsRead(notificationId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq("id", notificationId);

  if (error) {
    console.error(
      "MARK NOTIFICATION AS READ ERROR:",
      error.message,
      error.details,
      error.hint
    );
    throw error;
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    console.error(
      "MARK ALL NOTIFICATIONS AS READ ERROR:",
      error.message,
      error.details,
      error.hint
    );
    throw error;
  }
}