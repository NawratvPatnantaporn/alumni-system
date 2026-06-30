import { supabase } from "@/lib/supabase/client";

export async function createProfile(userId: string, formData: any) {
  const derivedRole =
    formData.educationStatus === "studying" ? "student" : "alumni";

  const payload = {
    id: userId,
    first_name: formData.firstName?.trim() || null,
    last_name: formData.lastName?.trim() || null,
    email: formData.email?.trim() || null,
    role: derivedRole,
    education_status: formData.educationStatus || null,
    student_id:
      formData.educationStatus === "studying"
        ? formData.studentId?.trim() || null
        : null,
    profile_completion: 20,
    is_verified: false,
  };

  console.log("CREATE PROFILE PAYLOAD:", payload);

  const { data, error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" })
    .select()
    .single();

  console.log("CREATE PROFILE RESULT:", data);
  console.log("CREATE PROFILE ERROR:", error);

  if (error) throw error;
  return data;
}