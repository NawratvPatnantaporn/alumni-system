import { UserSkill } from "../types/skill";
import { SKILL_DICTIONARY } from "./skills";

export const MOCK_USER_SKILLS: UserSkill[] = [
    {
        id: "1",
        skill: SKILL_DICTIONARY[0],
        level: 4,
        yearsExperience: 1,
        isPrimary: true,
        verified: true,
        endorsementCount: 12,
    },
    {
        id: "2",
        skill: SKILL_DICTIONARY[2],
        level: 3,
        yearsExperience: 2,
        isPrimary: false,
        verified: false,
        endorsementCount: 4,
    }
]