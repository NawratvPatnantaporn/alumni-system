"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { getSystemSettings } from "@/app/features/system/services/systemSettings.service";
import type { SystemSettings } from "@/app/features/system/types/systemSettings";

const fallbackSettings: SystemSettings = {
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

type SystemSettingsContextType = {
  settings: SystemSettings;
  loading: boolean;
  reloadSettings: () => Promise<void>;
};

const SystemSettingsContext =
  createContext<SystemSettingsContextType | undefined>(undefined);

export function SystemSettingsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [settings, setSettings] =
    useState<SystemSettings>(fallbackSettings);
  const [loading, setLoading] = useState(true);

  const reloadSettings = async () => {
    try {
      setLoading(true);
      const result = await getSystemSettings();
      setSettings(result);
    } catch (error) {
      console.error("LOAD SYSTEM SETTINGS ERROR:", error);
      setSettings(fallbackSettings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadSettings();
  }, []);

  return (
    <SystemSettingsContext.Provider
      value={{
        settings,
        loading,
        reloadSettings,
      }}
    >
      {children}
    </SystemSettingsContext.Provider>
  );
}

export function useSystemSettings() {
  const context = useContext(SystemSettingsContext);

  if (!context) {
    throw new Error(
      "useSystemSettings must be used within SystemSettingsProvider",
    );
  }

  return context;
}