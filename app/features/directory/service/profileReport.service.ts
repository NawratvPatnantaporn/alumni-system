import { supabase } from "@/lib/supabase/client";

export async function reportProfile({
  reporterId,
  reportedUserId,
  reason,
  details,
}: {
  reporterId: string;
  reportedUserId: string;
  reason: string;
  details?: string;
}) {
  const { error } = await supabase.from("profile_reports").upsert(
    {
      reporter_id: reporterId,
      reported_user_id: reportedUserId,
      reason,
      details: details || null,
      status: "pending",
    },
    {
      onConflict: "reporter_id, reported_user_id",
    },
  );

  if (error) {
    console.error("REPORT PROFILE ERROR:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    throw error;
  }
}