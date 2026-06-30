export type ProfileVisibility = "public" | "members" | "private";
export type PreferredLanguage = "th" | "en";

export type ThemeMode = "light" | "dark" | "system";
export type FontSize = "small" | "medium" | "large";

export type AccountSettingsForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredLanguage: PreferredLanguage;
};

export type NotificationSettingsForm = {
  emailEnabled: boolean;
  pushEnabled: boolean;
  newsEnabled: boolean;
  eventsEnabled: boolean;
  jobsEnabled: boolean;
  messagesEnabled: boolean;
  marketingEnabled: boolean;
};

export type PrivacySettingsForm = {
  profileVisibility: ProfileVisibility;
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
  showLinkedin: boolean;
  showWebsite: boolean;
  allowMessages: boolean;
};

export type AppearanceSettingsForm = {
  theme: ThemeMode;
  fontSize: FontSize;
  reducedMotion: boolean;
};

export type SettingsForm = {
  account: AccountSettingsForm;
  notifications: NotificationSettingsForm;
  privacy: PrivacySettingsForm;
  appearance: AppearanceSettingsForm;
};