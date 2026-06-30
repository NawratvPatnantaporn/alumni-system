export const SKILL_DICTIONARY = [
  { name: "React", aliases: ["reactjs"] },
  { name: "Next.js", aliases: ["nextjs", "next"] },
  { name: "Node.js", aliases: ["node", "nodejs"] },
  { name: "TypeScript", aliases: ["ts"] },
  { name: "JavaScript", aliases: ["js"] },
  { name: "Python", aliases: [] },
  { name: "SQL", aliases: ["mysql", "postgres", "postgresql"] },
  { name: "Tailwind CSS", aliases: ["tailwind"] },
  { name: "UI/UX Design", aliases: ["ux", "ui"] },
  { name: "Figma", aliases: [] },
  { name: "Git", aliases: [] },
  { name: "Docker", aliases: [] },
];

export function normalizeSkill(input: string) {
  const lower = input.toLowerCase().trim();

  for (const skill of SKILL_DICTIONARY) {
    if (skill.name.toLowerCase() === lower) return skill.name;

    if (skill.aliases.includes(lower)) return skill.name;
  }

  return input.trim();
}

export function fuzzyMatchSkill(input: string) {
  const lower = input.toLowerCase();

  return SKILL_DICTIONARY
    .map((skill) => skill.name)
    .filter((skill) =>
      skill.toLowerCase().includes(lower)
    );
}
