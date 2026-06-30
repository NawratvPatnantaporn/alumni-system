export type PublicProfileInterest = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
};

export type PublicProfileExperience = {
  id: string;
  company: string;
  position: string;
  duration: string;
  current: boolean;
  description: string;
};

export type PublicProfileEducation = {
  id: string;
  institution: string;
  degree: string;
  field: string;
  faculty: string;
  admissionYear: number | null;
  graduationYear: number | null;
};

export type PublicProfileAchievement = {
  id: string;
  title: string;
  issuer: string;
  achievementType: string;
  achievementDate: string | null;
  year: number | null;
  description: string;
  url: string | null;
  isFeatured: boolean;
};

export type PublicAlumniProfile = {
  id: string;
  name: string;
  avatar: string;
  bio: string;

  company: string;
  position: string;
  location: string;

  email: string;
  phone: string;
  linkedin: string;
  website: string;

  faculty: string;
  department: string;
  admissionYear: number | null;
  graduationYear: number | null;

  isVerified: boolean;
  isActive: boolean;

  joinedDate: string | null;
  lastUpdated: string | null;

  skills: string[];
  interests: PublicProfileInterest[];
  experience: PublicProfileExperience[];
  education: PublicProfileEducation[];
  achievements: PublicProfileAchievement[];
};