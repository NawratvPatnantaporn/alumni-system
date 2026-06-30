"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, X, Star } from "lucide-react";
import { normalizeSkill, fuzzyMatchSkill } from "@/lib/skills";
import { POPULAR_SKILLS } from "./popularskills";
import type { SkillForm } from "./skillform";

interface SkillsInputProps {
  value: SkillForm[];
  onChange: (skills: SkillForm[]) => void;
  isEditing?: boolean;
  placeholder?: string;
}

const CATEGORIES = [
  "Frontend",
  "Backend",
  "Database",
  "DevOps",
  "AI/Automation",
  "Design",
  "Mobile",
  "Other",
];

const MAX_PRIMARY_SKILL = 4;

export function SkillsInput({
  value,
  onChange,
  isEditing = false,
  placeholder = "พิมพ์ทักษะ เช่น React, n8n, Python",
}: SkillsInputProps) {
  const [skillInput, setSkillInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (!skillInput.trim()) {
      setSuggestions([]);
      return;
    }

    const matches = fuzzyMatchSkill(skillInput);
    setSuggestions(matches.slice(0, 5));
  }, [skillInput]);

  const selectedNames = useMemo(
    () => value.map((s) => s.name.toLowerCase()),
    [value]
  );

  const availablePopularSkills = useMemo(() => {
    return POPULAR_SKILLS.filter(
      (skill) => !selectedNames.includes(skill.toLowerCase())
    );
  }, [selectedNames]);

  const addSkill = (rawSkill: string) => {
    const normalized = normalizeSkill(rawSkill) || rawSkill.trim();
    if (!normalized) return;

    const alreadyExists = value.some(
      (skill) => skill.name.toLowerCase() === normalized.toLowerCase()
    );
    if (alreadyExists) return;

    const nextSkill: SkillForm = {
      name: normalized,
      category: "Other",
      level: 3,
      yearsExperience: 0,
      isPrimary: value.length === 0,
      verified: false,
      displayOrder: value.length,
    };

    onChange([...value, nextSkill]);
    setSkillInput("");
    setSuggestions([]);
  };

  const removeSkill = (index: number) => {
    const nextSkills = value
      .filter((_, i) => i !== index)
      .map((skill, i) => ({
        ...skill,
        displayOrder: i,
      }));

    if (nextSkills.length > 0 && !nextSkills.some((s) => s.isPrimary)) {
      nextSkills[0].isPrimary = true;
    }

    onChange(nextSkills);
  };

  const updateSkillField = <K extends keyof SkillForm>(
    index: number,
    field: K,
    fieldValue: SkillForm[K]
  ) => {
    const nextSkills = value.map((skill, i) =>
      i === index ? { ...skill, [field]: fieldValue } : skill
    );

    onChange(nextSkills);
  };

  const togglePrimary = (index: number) => {
    const currentPrimaryCount = value.filter((skill) => skill.isPrimary).length;
    const targetSkill = value[index];

    if (!targetSkill) return;

    // กำหนดไม่ให้ primary เกิน 4 ตัว
    if (!targetSkill.isPrimary && currentPrimaryCount >= MAX_PRIMARY_SKILL) {
      alert(`เลือกทักษะหลักได้สูงสุด ${MAX_PRIMARY_SKILL} รายการ`)
      return;
    }

    const nextSkills = value.map((skill, i) =>
      i === index
        ? { ...skill, isPrimary: !skill.isPrimary }
        : skill
    );

    onChange(nextSkills);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 min-h-[48px] p-3 border rounded-lg bg-muted/20">
        {value.length > 0 ? (
          value.map((skill, index) => (
            <Badge
              key={`${skill.name}-${index}`}
              variant={skill.isPrimary ? "default" : "secondary"}
              className="gap-2 px-3 py-1"
            >
              {skill.name}
              {skill.isPrimary && <Star className="w-3 h-3" />}
              {isEditing && (
                <button type="button" onClick={() => removeSkill(index)}>
                  <X className="w-3 h-3" />
                </button>
              )}
            </Badge>
          ))
        ) : (
          <span className="text-sm text-muted-foreground italic">
            ยังไม่ได้เพิ่มทักษะ
          </span>
        )}
      </div>

            {isEditing && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={skillInput}
              placeholder={placeholder}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill(skillInput);
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => addSkill(skillInput)}
              disabled={!skillInput.trim()}
            >
              <Plus className="w-4 h-4 mr-2" />
              เพิ่ม
            </Button>
          </div>

          {suggestions.length > 0 && (
            <div className="border rounded-md bg-background shadow-sm overflow-hidden">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-muted"
                  onClick={() => addSkill(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {availablePopularSkills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {availablePopularSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition"
                  onClick={() => addSkill(skill)}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        เลือกทักษะหลักได้สูงสุด {MAX_PRIMARY_SKILL} รายการ
      </p>

      {isEditing && value.length > 0 && (
        <div className="space-y-4">
          {value.map((skill, index) => (
            <div
              key={`editor-${skill.name}-${index}`}
              className="rounded-xl border p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{skill.name}</p>
                  <p className="text-xs text-muted-foreground">
                    ปรับระดับความเชี่ยวชาญและประสบการณ์
                  </p>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant={skill.isPrimary ? "default" : "outline"}
                  onClick={() => togglePrimary(index)}
                >
                  {skill.isPrimary ? "ทักษะหลัก" : "ตั้งเป็นทักษะหลัก"}
                </Button>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>หมวดหมู่</Label>
                  <select
                    className="w-full border rounded-md px-3 py-2 bg-background"
                    value={skill.category || "Other"}
                    onChange={(e) =>
                      updateSkillField(index, "category", e.target.value)
                    }
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>ระดับความชำนาญ</Label>
                  <select
                    className="w-full border rounded-md px-3 py-2 bg-background"
                    value={skill.level}
                    onChange={(e) =>
                      updateSkillField(index, "level", Number(e.target.value))
                    }
                  >
                    <option value={1}>1 - พื้นฐาน</option>
                    <option value={2}>2 - พอใช้งาน</option>
                    <option value={3}>3 - ดี</option>
                    <option value={4}>4 - เชี่ยวชาญ</option>
                    <option value={5}>5 - ผู้เชี่ยวชาญมาก</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>ประสบการณ์ (ปี)</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.5"
                    value={skill.yearsExperience}
                    onChange={(e) =>
                      updateSkillField(
                        index,
                        "yearsExperience",
                        Number(e.target.value || 0)
                      )
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}