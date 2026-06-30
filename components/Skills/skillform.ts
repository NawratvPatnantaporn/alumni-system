export type SkillForm = {
    id?: string;
    skillId?: string;
    name: string;
    category: string | null;
    level: number;
    yearsExperience: number;
    isPrimary: boolean;
    verified: boolean;
    displayOrder: number;
};