import { UserSkill } from "../types/skill";
import { motion } from "framer-motion";
import { Star, Briefcase, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Props {
  skill: UserSkill;
}

const levelLabelMap: Record<number, string> = {
  1: "พื้นฐาน",
  2: "ปานกลาง",
  3: "ใช้งานได้ดี",
  4: "เชี่ยวชาญ",
  5: "เชี่ยวชาญมาก",
};

export function SkillCard({ skill }: Props) {
  const percent = (Number(skill.level ?? 1) / 5) * 100;

  const displayCategory =
    (skill as any).selectedCategory ||
    (skill as any).selected_category ||
    skill.skill?.category ||
    "ทักษะทั่วไป";

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.18 }}
      className="group rounded-3xl border bg-gradient-to-br from-background to-muted/20 p-5 shadow-sm hover:shadow-lg transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">
              {skill.skill?.name || "ไม่ระบุทักษะ"}
            </h3>
            {skill.isPrimary && <Sparkles className="w-4 h-4 text-primary" />}
          </div>

          <p className="text-sm text-muted-foreground mt-1">
            {displayCategory}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-end">
          {skill.isPrimary && (
            <Badge variant="default" className="gap-1 rounded-full">
              <Star className="w-3 h-3" />
              ทักษะหลัก
            </Badge>
          )}

          {skill.verified && (
            <Badge className="rounded-full bg-emerald-600 hover:bg-emerald-600">
              ได้รับการยืนยัน
            </Badge>
          )}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">ระดับความชำนาญ</span>
          <span className="font-medium">
            ระดับ {skill.level} · {levelLabelMap[skill.level] ?? "ไม่ระบุ"}
          </span>
        </div>

        <Progress value={percent} className="h-2" />

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Briefcase className="w-4 h-4" />
          ประสบการณ์ {skill.yearsExperience ?? 0} ปี
        </div>
      </div>
    </motion.div>
  );
}