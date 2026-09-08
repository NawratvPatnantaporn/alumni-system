import { supabase } from "@/lib/supabase/client";

export async function syncUserBadges() {
  const { error } = await supabase.rpc("sync_my_badges");

  if (error) {
    console.error("SYNC USER BADGES ERROR:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw error;
  }
}