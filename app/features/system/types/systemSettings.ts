export type SystemSettings = {
  id: string;
  systemName: string;
  systemShortName: string;
  systemTagline: string;

  loginBrandTitle: string;
  registerBrandTitle: string;

  loginLogoUrl: string;
  registerLogoUrl: string;

  updatedAt: string | null;
};

export type RegistrationMajor = {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
  allowStudent: boolean;
  allowAlumni: boolean;
  allowManualYear: boolean;
  isActive: boolean;
  displayOrder: number;
};

export type RegistrationMajorForm = {
  id?: string;
  name: string;
  startYear: string;
  endYear: string;
  allowStudent: boolean;
  allowAlumni: boolean;
  allowManualYear: boolean;
  isActive: boolean;
  displayOrder: number;
};