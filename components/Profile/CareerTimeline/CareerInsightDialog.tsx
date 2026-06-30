"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { CareerExperienceForm } from "./types";

type Props = {
  career: CareerExperienceForm | null;
  onClose: () => void;
};

export function CareerInsightDialog({ career, onClose }: Props) {
  return (
    <AnimatePresence>
      {career && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-2xl overflow-hidden rounded-3xl border bg-background shadow-2xl"
          >
            <div className="flex items-start justify-between border-b p-5">
              <div>
                <h2 className="text-xl font-bold">วิเคราะห์ความตรงสาย</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {career.position || "ไม่ระบุตำแหน่ง"} ·{" "}
                  {career.company || "ไม่ระบุองค์กร"}
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-5 p-5">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border bg-muted/20 p-4">
                  <p className="text-xs text-muted-foreground">สายงาน</p>
                  <p className="mt-2 font-semibold">
                    {career.careerCategory || "-"}
                  </p>
                </div>

                <div className="rounded-2xl border bg-muted/20 p-4">
                  <p className="text-xs text-muted-foreground">ระดับ</p>
                  <p className="mt-2 font-semibold">
                    {career.careerLevel || "-"}
                  </p>
                </div>

                <div className="rounded-2xl border bg-muted/20 p-4">
                  <p className="text-xs text-muted-foreground">ผลลัพธ์</p>
                  <p
                    className={`mt-2 font-semibold ${
                      career.isAligned ? "text-green-600" : "text-amber-600"
                    }`}
                  >
                    {career.isAligned ? "ตรงสาย" : "ไม่ตรงสาย"}{" "}
                    {career.alignmentScore ?? 0}%
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border bg-muted/20 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium">คะแนนรวม</p>
                  <p className="text-2xl font-bold">
                    {career.alignmentScore ?? 0}%
                  </p>
                </div>

                <Progress value={career.alignmentScore ?? 0} className="h-2" />

                <p className="mt-3 text-sm text-muted-foreground">
                  {career.alignmentReason || "ยังไม่มีข้อมูลเพียงพอ"}
                </p>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold">
                  ทักษะที่นำมาคำนวณ
                </p>

                {career.relatedSkills.length === 0 ? (
                  <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
                    ยังไม่ได้เลือกทักษะที่ใช้ในงานนี้
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {career.relatedSkills.map((skill) => (
                      <div
                        key={skill.userSkillId}
                        className="rounded-2xl border bg-background p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium">
                              {skill.skillName || "ไม่ระบุทักษะ"}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              หมวดหมู่: {skill.selectedCategory || "-"}
                            </p>
                          </div>

                          {skill.isPrimary && (
                            <Badge className="rounded-full">ทักษะหลัก</Badge>
                          )}
                        </div>

                        <p className="mt-3 text-xs text-muted-foreground">
                          ระดับ {skill.level} · ประสบการณ์{" "}
                          {skill.yearsExperience} ปี
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}