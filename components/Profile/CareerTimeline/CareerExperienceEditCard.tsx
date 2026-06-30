"use client";

import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import type { SkillForm } from "@/components/Skills/skillform";
import type {
  CareerCategoryOption,
  CareerExperienceForm,
} from "./types";

type Props = {
  item: CareerExperienceForm;
  index: number;
  skills: SkillForm[];
  careerCategories: CareerCategoryOption[];

  onRemove: (index: number) => void;
  onUpdateField: (
    index: number,
    field: keyof CareerExperienceForm,
    value: string | boolean | number,
  ) => void;
  onUpdateCareerCategory: (index: number, value: string) => void;
  onUpdateCareerLevel: (index: number, value: string) => void;
  onToggleCareerRelatedSkill: (careerIndex: number, skill: SkillForm) => void;
};

export function CareerExperienceEditCard({
  item,
  index,
  skills,
  careerCategories,
  onRemove,
  onUpdateField,
  onUpdateCareerCategory,
  onUpdateCareerLevel,
  onToggleCareerRelatedSkill,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-3xl border border-dashed bg-gradient-to-br from-background to-muted/20 p-5 shadow-sm"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <Badge variant={item.isCurrent ? "default" : "secondary"}>
          {item.isCurrent ? "งานปัจจุบัน" : `ประสบการณ์ลำดับที่ ${index + 1}`}
        </Badge>

        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => onRemove(index)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          ลบรายการนี้
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>บริษัท / องค์กร</Label>
          <Input
            value={item.company}
            onChange={(e) => onUpdateField(index, "company", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>ตำแหน่ง</Label>
          <Input
            value={item.position}
            onChange={(e) => onUpdateField(index, "position", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>สายงานของตำแหน่งนี้</Label>
          <select
            value={item.careerCategory}
            onChange={(e) => onUpdateCareerCategory(index, e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">เลือกสายงาน</option>
            {careerCategories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.label_th}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label>ระดับตำแหน่ง</Label>
          <select
            value={item.careerLevel}
            onChange={(e) => onUpdateCareerLevel(index, e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">เลือกระดับ</option>
            <option value="Intern">Intern</option>
            <option value="Junior">Junior</option>
            <option value="Mid">Mid</option>
            <option value="Senior">Senior</option>
            <option value="Lead">Lead</option>
            <option value="Manager">Manager</option>
            <option value="Founder">Founder</option>
            <option value="Other">อื่น ๆ</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label>ประเภทงาน</Label>
          <Input
            value={item.employmentType}
            onChange={(e) =>
              onUpdateField(index, "employmentType", e.target.value)
            }
            placeholder="Full-time / Internship / Freelance"
          />
        </div>

        <div className="space-y-2">
          <Label>รูปแบบงาน</Label>
          <Input
            value={item.workMode}
            onChange={(e) => onUpdateField(index, "workMode", e.target.value)}
            placeholder="On-site / Hybrid / Remote"
          />
        </div>

        <div className="space-y-2">
          <Label>สถานที่</Label>
          <Input
            value={item.location}
            onChange={(e) => onUpdateField(index, "location", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>วันที่เริ่มงาน</Label>
          <Input
            type="date"
            value={item.startDate}
            onChange={(e) => onUpdateField(index, "startDate", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>วันที่สิ้นสุด</Label>
          <Input
            type="date"
            value={item.endDate}
            disabled={item.isCurrent}
            onChange={(e) => onUpdateField(index, "endDate", e.target.value)}
          />
        </div>

        <div className="md:col-span-2 space-y-3 rounded-2xl border bg-muted/20 p-4">
          <div>
            <Label>ทักษะที่ใช้ในงานนี้</Label>
            <p className="mt-1 text-xs text-muted-foreground">
              เลือกจากทักษะที่คุณเพิ่มไว้ เพื่อใช้คำนวณว่างานนี้ตรงสายหรือไม่
            </p>
          </div>

          {skills.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              ยังไม่มีทักษะ กรุณาเพิ่มทักษะในแท็บทักษะก่อน
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => {
                const skillId = skill.id || skill.skillId;
                const active = item.relatedSkills.some(
                  (rel) => rel.userSkillId === skillId,
                );

                return (
                  <button
                    key={skillId || skill.name}
                    type="button"
                    onClick={() => onToggleCareerRelatedSkill(index, skill)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-background hover:bg-muted"
                    }`}
                  >
                    {skill.name}
                    <span className="ml-1 text-xs opacity-70">
                      {skill.category}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="rounded-xl bg-background p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">คะแนนตรงสาย</span>
              <Badge
                className={
                  item.isAligned
                    ? "bg-green-600 hover:bg-green-600"
                    : "bg-amber-600 hover:bg-amber-600"
                }
              >
                {item.alignmentScore}%
              </Badge>
            </div>

            <Progress value={item.alignmentScore} className="mt-2 h-2" />

            <p className="mt-2 text-xs text-muted-foreground">
              {item.alignmentReason || "เลือกสายงานและทักษะเพื่อคำนวณ"}
            </p>
          </div>
        </div>

        <div className="md:col-span-2 flex items-center gap-2">
          <input
            id={`current-job-${index}`}
            type="checkbox"
            checked={item.isCurrent}
            onChange={(e) =>
              onUpdateField(index, "isCurrent", e.target.checked)
            }
          />
          <Label htmlFor={`current-job-${index}`}>
            กำลังทำงานอยู่ที่นี่
          </Label>
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label>รายละเอียดงาน</Label>
          <Textarea
            value={item.description}
            onChange={(e) =>
              onUpdateField(index, "description", e.target.value)
            }
            placeholder="สรุปหน้าที่ความรับผิดชอบหรือขอบเขตงาน"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label>ผลงานเด่น</Label>
          <Textarea
            value={item.achievements}
            onChange={(e) =>
              onUpdateField(index, "achievements", e.target.value)
            }
            placeholder="เช่น พัฒนาเว็บภายในองค์กร ลดเวลางาน manual 40%"
          />
        </div>
      </div>
    </motion.div>
  );
}