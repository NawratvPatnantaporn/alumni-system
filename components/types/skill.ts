export type UserSkill = {
  id: string;
  userId: string;
  skillId: string;
  level: number;
  yearsExperience: number;
  isPrimary: boolean;
  verified: boolean;
  displayOrder: number;
  selectedCategory?: string;
  selected_category?: string;
  skill: {
    id: string;
    name: string;
    category: string;
  };
};