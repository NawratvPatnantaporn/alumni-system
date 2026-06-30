import { supabase } from "@/lib/supabase/client";
import type { AccountSettingsForm, AppearanceSettingsForm, NotificationSettingsForm, PrivacySettingsForm, SettingsForm } from "../types/settings";

function splitFullName(firstName?: string | null, lastName?: string | null) {
  return {
    firstName: firstName ?? "",
    lastName: lastName ?? "",
  };
}

export async function getUserSettings(userId: string): Promise<SettingsForm> {
  const [profileResult, notificationResult, appearanceResult] =
    await Promise.all([
      supabase
        .from("profiles")
        .select(
          `
          id,
          first_name,
          last_name,
          email,
          phone,
          preferred_language,
          profile_visibility,
          show_email,
          show_phone,
          show_location,
          show_linkedin,
          show_website,
          allow_messages
        `,
        )
        .eq("id", userId)
        .single(),

      supabase
        .from("user_notification_settings")
        .select(
          `
          email_enabled,
          push_enabled,
          news_enabled,
          events_enabled,
          jobs_enabled,
          messages_enabled,
          marketing_enabled
        `,
        )
        .eq("user_id", userId)
        .maybeSingle(),

      supabase
        .from("user_appearance_settings")
        .select(
          `
          theme,
          font_size,
          reduced_motion
        `,
        )
        .eq("user_id", userId)
        .maybeSingle(),
    ]);

  if (profileResult.error) {
    console.error("GET SETTINGS PROFILE ERROR:", {
      message: profileResult.error.message,
      details: profileResult.error.details,
      hint: profileResult.error.hint,
      code: profileResult.error.code,
    });

    throw profileResult.error;
  }

  if (notificationResult.error) {
    console.error("GET NOTIFICATION SETTINGS ERROR:", {
      message: notificationResult.error.message,
      details: notificationResult.error.details,
      hint: notificationResult.error.hint,
      code: notificationResult.error.code,
    });

    throw notificationResult.error;
  }

  if (appearanceResult.error) {
    console.error("GET APPEARANCE SETTINGS ERROR:", {
      message: appearanceResult.error.message,
      details: appearanceResult.error.details,
      hint: appearanceResult.error.hint,
      code: appearanceResult.error.code,
    });

    throw appearanceResult.error;
  }

  const profile = profileResult.data;
  const notifications = notificationResult.data;
  const appearance = appearanceResult.data;

  const name = splitFullName(profile.first_name, profile.last_name);

  return {
    account: {
      firstName: name.firstName,
      lastName: name.lastName,
      email: profile.email ?? "",
      phone: profile.phone ?? "",
      preferredLanguage: profile.preferred_language ?? "th",
    },

    notifications: {
      emailEnabled: notifications?.email_enabled ?? true,
      pushEnabled: notifications?.push_enabled ?? true,
      newsEnabled: notifications?.news_enabled ?? true,
      eventsEnabled: notifications?.events_enabled ?? true,
      jobsEnabled: notifications?.jobs_enabled ?? true,
      messagesEnabled: notifications?.messages_enabled ?? true,
      marketingEnabled: notifications?.marketing_enabled ?? false,
    },

    privacy: {
      profileVisibility: profile.profile_visibility ?? "members",
      showEmail: Boolean(profile.show_email),
      showPhone: Boolean(profile.show_phone),
      showLocation: profile.show_location !== false,
      showLinkedin: profile.show_linkedin !== false,
      showWebsite: profile.show_website !== false,
      allowMessages: profile.allow_messages !== false,
    },

    appearance: {
      theme: appearance?.theme ?? "system",
      fontSize: appearance?.font_size ?? "medium",
      reducedMotion: Boolean(appearance?.reduced_motion),
    },
  };
}

export async function saveAccountSettings(
  userId: string,
  account: AccountSettingsForm,
) {
  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: account.firstName.trim(),
      last_name: account.lastName.trim(),
      phone: account.phone.trim(),
      preferred_language: account.preferredLanguage,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    console.error("SAVE ACCOUNT SETTINGS ERROR:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw error;
  }
}

export async function saveNotificationSettings(
  userId: string,
  notifications: NotificationSettingsForm,
) {
  const { error } = await supabase
    .from("user_notification_settings")
    .upsert(
      {
        user_id: userId,
        email_enabled: notifications.emailEnabled,
        push_enabled: notifications.pushEnabled,
        news_enabled: notifications.newsEnabled,
        events_enabled: notifications.eventsEnabled,
        jobs_enabled: notifications.jobsEnabled,
        messages_enabled: notifications.messagesEnabled,
        marketing_enabled: notifications.marketingEnabled,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

  if (error) {
    console.error("SAVE NOTIFICATION SETTINGS ERROR:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw error;
  }
}

export async function savePrivacySettings(
  userId: string,
  privacy: PrivacySettingsForm,
) {
  const { error } = await supabase
    .from("profiles")
    .update({
      profile_visibility: privacy.profileVisibility,
      show_email: privacy.showEmail,
      show_phone: privacy.showPhone,
      show_location: privacy.showLocation,
      show_linkedin: privacy.showLinkedin,
      show_website: privacy.showWebsite,
      allow_messages: privacy.allowMessages,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    console.error("SAVE PRIVACY SETTINGS ERROR:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw error;
  }
}

export async function saveAppearanceSettings(
  userId: string,
  appearance: AppearanceSettingsForm,
) {
  const { error } = await supabase
    .from("user_appearance_settings")
    .upsert(
      {
        user_id: userId,
        theme: appearance.theme,
        font_size: appearance.fontSize,
        reduced_motion: appearance.reducedMotion,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

  if (error) {
    console.error("SAVE APPEARANCE SETTINGS ERROR:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw error;
  }
}