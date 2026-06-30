import { supabase } from "@/lib/supabase/client";

export async function updateUserPassword({
  newPassword,
}: {
  newPassword: string;
}) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error("UPDATE PASSWORD ERROR:", {
      message: error.message,
      status: error.status,
      name: error.name,
    });

    throw error;
  }
}