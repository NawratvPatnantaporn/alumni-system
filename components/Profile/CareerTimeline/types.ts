import type { SkillForm } from "@/components/Skills/skillform";

export type CareerFilter = "all" | "current" | "aligned" | "not_aligned";

export type CareerSort =
  | "latest"
  | "oldest"
  | "alignment_high"
  | "alignment_low";

export type CareerCategoryOption = {
  id: string;
  name: string;
  label_th: string;
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
  alignmentScore: number;
  isAligned: boolean;
  alignmentReason: string;
  relatedSkills: CareerExperienceSkillForm[];
};

export type CareerSummary = {
  total: number;
  currentCount: number;
  alignedCount: number;
  notAlignedCount: number;
  averageAlignment: number;
  latestCategory: string;
};

export type CareerTimelineTabProps = {
  isEditing: boolean;
  careers: CareerExperienceForm[];
  skills: SkillForm[];
  careerCategories: CareerCategoryOption[];

  onAddCareer: () => void;
  onRemoveCareer: (index: number) => void;
  onUpdateCareerField: (
    index: number,
    field: keyof CareerExperienceForm,
    value: string | boolean | number,
  ) => void;
  onUpdateCareerCategory: (index: number, value: string) => void;
  onUpdateCareerLevel: (index: number, value: string) => void;
  onToggleCareerRelatedSkill: (careerIndex: number, skill: SkillForm) => void;
};