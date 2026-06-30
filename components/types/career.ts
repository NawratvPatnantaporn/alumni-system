export type CareerCategory =
  | "Frontend"
  | "Backend"
  | "Full Stack"
  | "Mobile"
  | "DevOps"
  | "Data/AI"
  | "AI/Automation"
  | "Design"
  | "QA"
  | "Database"
  | "Programming"
  | "Tools"
  | "Marketing"
  | "Business"
  | "Education"
  | "Other";

export type CareerLevel =
  | "Intern"
  | "Junior"
  | "Mid"
  | "Senior"
  | "Lead"
  | "Manager"
  | "Founder"
  | "Other";

export type CareerCategoryRow = {
  id: string;
  name: CareerCategory | string;
  label_th: string;
  label_en: string | null;
  description: string | null;
  icon_key: string | null;
  color: string | null;
  display_order: number | null;
  is_active: boolean | null;
};

export type CareerExperienceSkillForm = {
  userSkillId: string;
  skillName: string;
  selectedCategory: string;
  level: number;
  yearsExperience: number;
  isPrimary: boolean;
  relevanceScore: number;
};

export type CareerExperienceForm = {
  id?: string;
  company: string;
  position: string;
  employmentType: string;
  location: string;
  workMode: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  achievements: string;
  displayOrder: number;

  careerCategory: string;
  careerLevel: string;
  alignmentScore?: number;
  isAligned?: boolean;
  alignmentReason?: string;
  relatedSkills: CareerExperienceSkillForm[];
};