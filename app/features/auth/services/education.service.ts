import { Map } from 'lucide-react';
import { supabase } from "@/lib/supabase/client";

type EducationForm = {
  id?: string;
  university: string;
  degree: string;
  faculty: string;
  major: string;
  admissionYear: string;
  graduationYear: string;
  gpa: string;
  honors: string;
  isCurrent: boolean;
  description: string;
  displayOrder: number;
  isPrimary: boolean;
};

export async function saveEducations(userId: string, educations: EducationForm[] = []) {
  if (!Array.isArray(educations)) {
    return;
  }

  const rows = educations.map((edu, index) => ({
    id: edu.id,
    user_id: userId,
    university: edu.university || null,
    degree: edu.degree || null,
    faculty: edu.faculty || null,
    major: edu.major || null,
    admission_year: edu.admissionYear ? Number(edu.admissionYear) : null,
    graduation_year: edu.graduationYear ? Number(edu.graduationYear) : null,
    gpa: edu.gpa ? Number(edu.gpa) : null,
    honors: edu.honors || null,
    is_current: !!edu.isCurrent,
    description: edu.description || null,
    display_order: edu.displayOrder ?? index,
    is_primary: !!edu.isPrimary,
  }));

  const existingIds = rows
    .map((e) => e.id)
    .filter(Boolean) as string[];

  const { data: existingRows, error: fetchError } = await supabase
    .from("educations")
    .select("id")
    .eq("user_id", userId);

  if (fetchError) {
    console.error("FETCH EDUCATION ERROR:", fetchError.message, fetchError.details, fetchError.hint);
    throw fetchError;
  }

  const existingDbIds = (existingRows ?? []).map((row) => row.id);

  // แถวใหม่ = ไม่มี id
  const rowsToInsert = rows
    .filter((row) => !row.id)
    .map(({ id, ...rest }) => rest)
  
  // แถวเดิม = มี id
  const rowsToUpdate = rows.filter((row) => !!row.id);
    
  // ลบเฉพาะตอนที่ user ส่ง "ทั้งลิสต์" มาจริง
  // และมีรายการเดิมอยู่ใน payload ให้เทียบได้
  const idsToDelete = 
    educations.length === 0
      ? []
      : existingDbIds.filter((id) => !existingIds.includes(id));

  if (idsToDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("educations")
      .delete()
      .eq("user_id", userId)
      .in("id", idsToDelete);

    if (deleteError) {
      console.error("DELETE EDUCATION ERROR:", deleteError.message, deleteError.details, deleteError.hint);
      throw deleteError;
    }
  }

  if (rowsToInsert.length > 0) {
    const { error: insertError } = await supabase
      .from("educations")
      .insert(rowsToInsert);

    if (insertError) {
      console.error("INSERT EDUCATION ERROR:", insertError.message, insertError.details, insertError.hint);
      throw insertError;
    }
  }

  if (rowsToUpdate.length > 0) {
    const { error: upsertError } = await supabase
      .from("educations")
      .upsert(rowsToUpdate, { onConflict: "id" });

    if (upsertError) {
      console.error("UPSERT EDUCATION ERROR:", upsertError.message, upsertError.details, upsertError.hint);
      throw upsertError;
    }
  }
}