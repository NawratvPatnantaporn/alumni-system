"use client";

import { motion } from "framer-motion";
import {
  Briefcase,
  Calendar,
  MapPin,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { CareerExperienceForm } from "./types";

type Props = {
  career: CareerExperienceForm;
  index: number;
  onOpenInsight: (career: CareerExperienceForm) => void;
};

function formatDateRange(startDate?: string, endDate?: string, isCurrent?: boolean) {
  const start = startDate || "-";
  const end = isCurrent ? "ปัจจุบัน" : endDate || "-";
  return `${start} - ${end}`;
}

export function CareerExperienceCard({ career, index, onOpenInsight }: Props) {
  const alignmentColor = career.isAligned
    ? "bg-green-600 hover:bg-green-600"
    : "bg-amber-600 hover:bg-amber-600";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -3 }}
      className="group relative rounded-3xl border bg-gradient-to-br from-background to-muted/20 p-5 shadow-sm hover:shadow-lg transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold leading-tight">
              {career.position || "ไม่ระบุตำแหน่ง"}
            </h3>

            {career.isCurrent && (
              <Badge className="rounded-full bg-emerald-600 hover:bg-emerald-600">
                ปัจจุบัน
              </Badge>
            )}

            {career.careerCategory && (
              <Badge variant="secondary" className="rounded-full">
                {career.careerCategory}
              </Badge>
            )}
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            {career.company || "ไม่ระบุบริษัท / องค์กร"}
          </p>
        </div>

        <Badge className={`${alignmentColor} shrink-0 rounded-full`}>
          {career.isAligned ? "ตรงสาย" : "ไม่ตรงสาย"} {career.alignmentScore ?? 0}%
        </Badge>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {career.employmentType && (
          <Badge variant="outline" className="rounded-full">
            <Briefcase className="mr-1 h-3 w-3" />
            {career.employmentType}
          </Badge>
        )}

        {career.workMode && (
          <Badge variant="outline" className="rounded-full">
            {career.workMode}
          </Badge>
        )}

        {career.careerLevel && (
          <Badge variant="outline" className="rounded-full">
            ระดับ: {career.careerLevel}
          </Badge>
        )}
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Target className="h-4 w-4" />
            คะแนนความตรงสาย
          </span>
          <span className="font-medium">{career.alignmentScore ?? 0}%</span>
        </div>

        <Progress value={career.alignmentScore ?? 0} className="h-2" />

        <p className="text-xs text-muted-foreground">
          {career.alignmentReason || "ยังไม่มีข้อมูลเพียงพอสำหรับวิเคราะห์"}
        </p>
      </div>

      <div className="mt-5 grid gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {formatDateRange(career.startDate, career.endDate, career.isCurrent)}
        </div>

        {career.location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {career.location}
          </div>
        )}
      </div>

      {(career.description || career.achievements) && (
        <div className="mt-5 space-y-3">
          {career.description && (
            <div className="rounded-2xl border bg-muted/20 p-4">
              <p className="text-xs font-medium text-muted-foreground">
                รายละเอียดงาน
              </p>
              <p className="mt-2 text-sm leading-6">{career.description}</p>
            </div>
          )}

          {career.achievements && (
            <div className="rounded-2xl border bg-primary/5 p-4">
              <p className="flex items-center gap-2 text-xs font-medium text-primary">
                <Sparkles className="h-3 w-3" />
                ผลงานเด่น
              </p>
              <p className="mt-2 text-sm leading-6">{career.achievements}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-5 flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onOpenInsight(career)}
          className="rounded-full"
        >
          <TrendingUp className="mr-2 h-4 w-4" />
          ดูเหตุผลคะแนน
        </Button>
      </div>
    </motion.div>
  );
}