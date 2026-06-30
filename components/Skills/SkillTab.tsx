"use client";

import { useEffect, useMemo, useState } from "react";
import { UserSkill } from "../types/skill";
import { getUserSkills } from "@/app/features/skills/services/skillService.service";
import { SkillCard } from "./SkillCard";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { Sparkles, Star, CheckCircle2, TrendingUp, BarChart3 } from "lucide-react";

export function SkillTab() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSkills = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const result = await getUserSkills(user.id);
        setSkills(result);
      } catch (error) {
        console.error("LOAD SKILLS ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSkills();
  }, [user?.id]);

  const metrics = useMemo(() => {
    const totalSkills = skills.length;
    const primaryCount = skills.filter((s) => s.isPrimary).length;
    const verifiedCount = skills.filter((s) => s.verified).length;
    const maxYears = Math.max(...skills.map((s) => Number(s.yearsExperience ?? 0)), 0);

    const avgLevel =
      totalSkills > 0
        ? (
            skills.reduce((sum, s) => sum + Number(s.level ?? 1), 0) / totalSkills
          ).toFixed(1)
        : "0.0";

    return {
      totalSkills,
      primaryCount,
      verifiedCount,
      maxYears,
      avgLevel,
    };
  }, [skills]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">กำลังโหลดทักษะ...</p>;
  }

  if (!skills.length) {
    return (
      <div className="rounded-2xl border border-dashed bg-card p-6 text-sm text-muted-foreground">
        ยังไม่มีข้อมูลทักษะ
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        <motion.div
          whileHover={{ y: -3 }}
          className="rounded-2xl border bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-4"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4" />
            จำนวนทักษะของคุณ
          </div>
          <p className="mt-2 text-2xl font-bold">{metrics.totalSkills}</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          className="rounded-2xl border bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-4"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="w-4 h-4" />
            ทักษะหลัก
          </div>
          <p className="mt-2 text-2xl font-bold">{metrics.primaryCount}</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          className="rounded-2xl border bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-4"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="w-4 h-4" />
            ประสบการณ์
          </div>
          <p className="mt-2 text-2xl font-bold">{metrics.maxYears} ปี</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          className="rounded-2xl border bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 p-4"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4" />
            ทักษะที่ตรวจสอบแล้ว
          </div>
          <p className="mt-2 text-2xl font-bold">{metrics.verifiedCount}</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          className="rounded-2xl border bg-gradient-to-br from-slate-500/10 to-zinc-500/10 p-4"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BarChart3 className="w-4 h-4" />
            ประสบการณ์เฉลี่ย
          </div>
          <p className="mt-2 text-2xl font-bold">{metrics.avgLevel} ปี</p>
        </motion.div>
      </div>

      <motion.div layout className="grid gap-4 md:grid-cols-2">
        {skills.map((s, index) => (
          <motion.div
            key={`skill-${s.id ?? s.skillId ?? index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
          >
            <SkillCard skill={s} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}