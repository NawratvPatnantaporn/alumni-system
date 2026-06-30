import { supabase } from "@/lib/supabase/client";

import type { RegistrationMajor, RegistrationMajorForm, SystemSettings } from "../types/systemSettings";

function mapSystemSettings(row: any): SystemSettings {
  return {
    id: row.id,
    systemName: row.system_name ?? "Sripatum Alumni",
    systemShortName: row.system_short_name ?? "Alumni SPU",
    systemTagline:
      row.system_tagline ??
      "เชื่อมต่อศิษย์เก่า สร้างเครือข่ายที่แข็งแกร่ง",
    loginBrandTitle: row.login_brand_title ?? "Alumni SPU",
    registerBrandTitle: row.register_brand_title ?? "Alumni Connect",
    loginLogoUrl: row.login_logo_url ?? "",
    registerLogoUrl: row.register_logo_url ?? "",
    updatedAt: row.updated_at ?? null,
  };
}

function mapRegistrationMajor(row: any): RegistrationMajor {
  return {
    id: row.id,
    name: row.name ?? "",
    startYear: Number(row.start_year),
    endYear: Number(row.end_year),
    allowStudent: Boolean(row.allow_student),
    allowAlumni: Boolean(row.allow_alumni),
    allowManualYear: Boolean(row.allow_manual_year),
    isActive: Boolean(row.is_active),
    displayOrder: Number(row.display_order ?? 0),
  };
}

export async function getSystemSettings(): Promise<SystemSettings> {
  const { data, error } = await supabase
    .from("system_settings")
    .select(
      `
      id,
      system_name,
      system_short_name,
      system_tagline,
      login_brand_title,
      register_brand_title,
      login_logo_url,
      register_logo_url,
      updated_at
      `,
    )
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("GET SYSTEM SETTINGS ERROR:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw error;
  }

  if (!data) {
    return {
      id: "",
      systemName: "Sripatum Alumni",
      systemShortName: "Alumni SPU",
      systemTagline: "เชื่อมต่อศิษย์เก่า สร้างเครือข่ายที่แข็งแกร่ง",
      loginBrandTitle: "Alumni SPU",
      registerBrandTitle: "Alumni Connect",
      loginLogoUrl: "",
      registerLogoUrl: "",
      updatedAt: null,
    };
  }

  return mapSystemSettings(data);
}

export async function updateSystemSettings(
  settingsId: string,
  payload: {
    systemName: string;
    systemShortName: string;
    systemTagline: string;
    loginBrandTitle: string;
    registerBrandTitle: string;
    loginLogoUrl: string;
    registerLogoUrl: string;
    updatedBy: string;
  },
) {
  if (!settingsId) {
    throw new Error("ไม่พบ ID ของการตั้งค่าระบบ");
  }

  const systemName = payload.systemName.trim();
  const systemShortName = payload.systemShortName.trim();

  if (!systemName) throw new Error("กรุณากรอกชื่อระบบ");
  if (!systemShortName) throw new Error("กรุณากรอกชื่อย่อระบบ");

  const { error } = await supabase
    .from("system_settings")
    .update({
      system_name: systemName,
      system_short_name: systemShortName,
      system_tagline: payload.systemTagline.trim(),
      login_brand_title: payload.loginBrandTitle.trim(),
      register_brand_title: payload.registerBrandTitle.trim(),
      login_logo_url: payload.loginLogoUrl || null,
      register_logo_url: payload.registerLogoUrl || null,
      updated_by: payload.updatedBy,
      updated_at: new Date().toISOString(),
    })
    .eq("id", settingsId);

  if (error) {
    console.error("UPDATE SYSTEM SETTINGS ERROR:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw error;
  }
}

export async function getRegistrationMajors(options?: {
  includeInactive?: boolean;
}): Promise<RegistrationMajor[]> {
  let query = supabase
    .from("registration_majors")
    .select(
      `
      id,
      name,
      start_year,
      end_year,
      allow_student,
      allow_alumni,
      allow_manual_year,
      is_active,
      display_order
      `,
    )
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (!options?.includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("GET REGISTRATION MAJORS ERROR:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw error;
  }

  return (data ?? []).map(mapRegistrationMajor);
}

export async function upsertRegistrationMajor(
  form: RegistrationMajorForm,
  userId: string,
) {
  const name = form.name.trim();
  const startYear = Number(form.startYear);
  const endYear = Number(form.endYear);

  if (!name) throw new Error("กรุณากรอกชื่อสาขา");
  if (!startYear || !endYear) throw new Error("กรุณากรอกช่วงปีให้ครบ");
  if (startYear > endYear) {
    throw new Error("ปีเริ่มต้นต้องไม่มากกว่าปีสิ้นสุด");
  }

  if (!form.allowStudent && !form.allowAlumni) {
    throw new Error("ต้องเปิดใช้งานอย่างน้อยหนึ่งกลุ่มผู้สมัคร");
  }

  const payload = {
    name,
    start_year: startYear,
    end_year: endYear,
    allow_student: form.allowStudent,
    allow_alumni: form.allowAlumni,
    allow_manual_year: form.allowManualYear,
    is_active: form.isActive,
    display_order: form.displayOrder,
    updated_by: userId,
    updated_at: new Date().toISOString(),
    ...(form.id ? {} : { created_by: userId }),
  };

  const query = form.id
    ? supabase.from("registration_majors").update(payload).eq("id", form.id)
    : supabase.from("registration_majors").insert(payload);

  const { error } = await query;

  if (error) {
    console.error("UPSERT REGISTRATION MAJOR ERROR:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw error;
  }
}

export async function setRegistrationMajorActive(
  id: string,
  isActive: boolean,
  userId: string,
) {
  const { error } = await supabase
    .from("registration_majors")
    .update({
      is_active: isActive,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("UPDATE REGISTRATION MAJOR ACTIVE ERROR:", error);
    throw error;
  }
}

export async function uploadSystemLogo({
  file,
  type,
}: {
  file: File;
  type: "login" | "register";
}) {
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "png";

  const filePath = `logos/${type}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("system-assets")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    console.error("UPLOAD SYSTEM LOGO ERROR:", {
      message: uploadError.message,
      name: uploadError.name,
    });

    throw uploadError;
  }

  const { data } = supabase.storage
    .from("system-assets")
    .getPublicUrl(filePath);

  return data.publicUrl;
}