import { supabase } from "@/lib/supabase/client";
import { createProfile } from "./profile.service";
import { saveEducations } from "./education.service";

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
  isPrimary: boolean;
  isCurrent: boolean;
  description: string;
  displayOrder: number;
};

function buildRegisterEducations(formData: any): EducationForm[] {
  return [
    {
      university: "มหาวิทยาลัยศรีปทุม",
      degree: "ปริญญาตรี",
      faculty: formData.education?.faculty || "",
      major: formData.major || "",
      admissionYear: formData.studyYear ? String(formData.studyYear) : "",
      graduationYear: "",
      gpa: formData.education?.gpa || "",
      honors: formData.education?.honors || "",
      isPrimary: true,
      isCurrent: formData.educationStatus === "studying",
      description: "",
      displayOrder: 0,
    },
  ];
}

// function withTimeout<T>(promise: Promise<T>, ms = 15000): Promise<T> {
//   return Promise.race([
//     promise,
//     new Promise<never>((_, reject) =>
//       setTimeout(() => reject(new Error("การสมัครใช้เวลานานเกินไป")), ms)
//     ),
//   ]);
// }

export async function registerUser(formData: any) {
  try {
    console.log("REGISTER START", formData);

    console.log("STEP 1: SIGNUP START");
    const { data, error } = await
      supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });
    console.log("STEP 1: SIGNUP DONE", { data, error });

    if (error) throw error;
    if (!data.user) {
      throw new Error("ไม่สามารถสร้างบัญชีผู้ใช้ได้");
    }

    const userId = data.user.id;
    console.log("STEP 2: CREATE PROFILE START", userId);

    const profile = await createProfile(userId, formData);
    console.log("STEP 2: CREATE PROFILE DONE", profile);

    const educations = buildRegisterEducations(formData);
    console.log("STEP 3: SAVE EDUCATIONS START", educations);

    await saveEducations(userId, educations);
    console.log("STEP 3: SAVE EDUCATIONS DONE");

    return userId;
  } catch (err) {
    console.error("REGISTER ERROR FULL:", err);
    throw err;
  }
}