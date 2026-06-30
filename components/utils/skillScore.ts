import { UserSkill } from "../types/skill";

export function calculateSkillScore(skill: UserSkill) {
    return (
        skill.level * 30 +
        skill.yearsExperience * 10 +
        skill.endorsementCount * 5 +
        (skill.verified ? 20 : 0)
    )
}