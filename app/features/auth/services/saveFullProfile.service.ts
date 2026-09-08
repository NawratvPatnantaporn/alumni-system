import { supabase } from "@/lib/supabase/client";
import { updateProfileData } from "./updateprofile.service";
import { upsertAddress } from "./address.service";
import { saveEducations } from "./education.service";
import { saveUserSkills } from "../../skills/services/saveUserSkills.service";
import { saveCareerExperiences } from "../../profile/services/careerExperience.service";
import { saveUserAchievements } from "../../profile/services/userAchievement.service";
import { calculateProfileCompletion } from "../../profile/services/profileCompletion.service";
import { syncUserBadges } from "../../profile/services/syncBadges.service";
import { saveUserInterests } from "../../profile/services/userInterest.service";

export async function saveFullProfile(userId: string, payload: any) {
  console.log("SAVE FULL PROFILE START");

  await updateProfileData(userId, payload);
  await upsertAddress(userId, payload.address ?? {});
  await saveEducations(userId, payload.educations ?? []);
  await saveUserSkills(userId, payload.skills ?? []);
  await saveCareerExperiences(userId, payload.careerExperiences ?? []);
  await saveUserAchievements(userId, payload.achievements ?? []);
  await saveUserInterests(userId, payload.interests ?? []);

  const profileCompletion = calculateProfileCompletion({
    firstName: payload.firstName,
    lastName: payload.lastName,
    avatar: payload.avatar,
    phone: payload.phone,
    bio: payload.bio,
    address: payload.address,
    educations: payload.educations ?? [],
    skills: payload.skills ?? [],
    careerExperiences: payload.careerExperiences ?? [],
    achievements: payload.achievements ?? [],
    linkedin: payload.linkedin,
    github: payload.github,
    lineID: payload.lineID,
    website: payload.website,
    interests: payload.interests ?? [],
  });

  console.log("PROFILE COMPLETION:", profileCompletion);

  const { error } = await supabase
    .from("profiles")
    .update({
      profile_completion: profileCompletion,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) throw error;

  await syncUserBadges();

  // console.log("SAVE FULL PROFILE DONE");
  return profileCompletion;
}