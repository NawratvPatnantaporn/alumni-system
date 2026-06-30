import { UserSkill } from "../types/skill";

export function calculateMatchScore( userA: UserSkill[], userB: UserSkill[]) {
    let score = 0;

    userA.forEach((a) => {
        const match = userB.find(
            (b) => b.skill.id === a.skill.id
        );

        if (match) {
            score += Math.min(a.level, match.level) * 20;
        }
    });

    return score;
}