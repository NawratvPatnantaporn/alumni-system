"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Briefcase, Clock, Plus, Target, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CareerMetricCard } from "./CareerMetricCard";
import { CareerExperienceCard } from "./CareerExperienceCard";
import { CareerExperienceEditCard } from "./CareerExperienceEditCard";
import { CareerInsightDialog } from "./CareerInsightDialog";
import type { CareerExperienceForm, CareerFilter, CareerSort, CareerTimelineTabProps } from "./types";

export function CareerTimelineTab({
  isEditing,
  careers,
  skills,
  careerCategories,
  onAddCareer,
  onRemoveCareer,
  onUpdateCareerField,
  onUpdateCareerCategory,
  onUpdateCareerLevel,
  onToggleCareerRelatedSkill,
}: CareerTimelineTabProps) {
  const [careerFilter, setCareerFilter] = useState<CareerFilter>("all");
  const [careerSort, setCareerSort] = useState<CareerSort>("latest");
  const [selectedCareerInsight, setSelectedCareerInsight] =
    useState<CareerExperienceForm | null>(null);
  const latestCareerEditCardRef = useRef<HTMLDivElement | null>(null);
  const previousCareerCountRef = useRef(careers.length);
  const shouldScrollToNewCareerRef = useRef(false);

  const handleAddCareer = () => {
    shouldScrollToNewCareerRef.current = true;
    onAddCareer();
  };

  useEffect(() => {
    const previousCount = previousCareerCountRef.current;
    const currentCount = careers.length;

    const hasNewCareer = currentCount > previousCount;

    if (isEditing && hasNewCareer && shouldScrollToNewCareerRef.current) {
      window.requestAnimationFrame(() => {
        latestCareerEditCardRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        shouldScrollToNewCareerRef.current = false;
      });
    }

    previousCareerCountRef.current = currentCount;
  }, [careers.length, isEditing]);

  const careerSummary = useMemo(() => {
    const total = careers.length;
    const currentCount = careers.filter((item) => item.isCurrent).length;
    const alignedCount = careers.filter((item) => item.isAligned).length;

    const notAlignedCount = careers.filter(
      (item) => item.careerCategory && !item.isAligned,
    ).length;

    const averageAlignment =
      total > 0
        ? Math.round(
            careers.reduce(
              (sum, item) => sum + Number(item.alignmentScore ?? 0),
              0,
            ) / total,
          )
        : 0;

    const latestCareer = [...careers].sort((a, b) => {
      if (a.isCurrent !== b.isCurrent) return a.isCurrent ? -1 : 1;

      const aStart = a.startDate ? new Date(a.startDate).getTime() : 0;
      const bStart = b.startDate ? new Date(b.startDate).getTime() : 0;

      return bStart - aStart;
    })[0];

    return {
      total,
      currentCount,
      alignedCount,
      notAlignedCount,
      averageAlignment,
      latestCategory: latestCareer?.careerCategory || "-",
    };
  }, [careers]);

  const sortedCareers = useMemo(() => {
    return [...careers]
      .filter((item) => {
        if (careerFilter === "current") return item.isCurrent;
        if (careerFilter === "aligned") return item.isAligned;
        if (careerFilter === "not_aligned") {
          return !!item.careerCategory && !item.isAligned;
        }

        return true;
      })
      .sort((a, b) => {
        if (careerSort === "alignment_high") {
          return Number(b.alignmentScore ?? 0) - Number(a.alignmentScore ?? 0);
        }

        if (careerSort === "alignment_low") {
          return Number(a.alignmentScore ?? 0) - Number(b.alignmentScore ?? 0);
        }

        const aStart = a.startDate ? new Date(a.startDate).getTime() : 0;
        const bStart = b.startDate ? new Date(b.startDate).getTime() : 0;

        if (careerSort === "oldest") {
          return aStart - bStart;
        }

        if (a.isCurrent !== b.isCurrent) return a.isCurrent ? -1 : 1;

        const aEnd = a.endDate ? new Date(a.endDate).getTime() : 0;
        const bEnd = b.endDate ? new Date(b.endDate).getTime() : 0;

        if (aEnd !== bEnd) return bEnd - aEnd;

        return bStart - aStart;
      });
  }, [careers, careerFilter, careerSort]);

  const selectedCareerInsightLive = selectedCareerInsight
    ? careers.find(
        (career) =>
          career.id === selectedCareerInsight.id ||
          (career.company === selectedCareerInsight.company &&
            career.position === selectedCareerInsight.position &&
            career.startDate === selectedCareerInsight.startDate),
      ) ?? selectedCareerInsight
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">เส้นทางอาชีพ</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            ประสบการณ์ทำงาน สายงาน และความสอดคล้องกับทักษะของคุณ
          </p>
        </div>

        {isEditing && (
          <Button type="button" onClick={handleAddCareer}>
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มประสบการณ์
          </Button>
        )}
      </div>

      {careers.length > 0 && (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <CareerMetricCard
            icon={Briefcase}
            label="ประสบการณ์ทั้งหมด"
            value={careerSummary.total}
            description="รายการในเส้นทางอาชีพ"
            gradientClassName="from-blue-500/10 to-cyan-500/10"
          />

          <CareerMetricCard
            icon={Clock}
            label="งานปัจจุบัน"
            value={careerSummary.currentCount}
            description="ตำแหน่งที่กำลังทำอยู่"
            gradientClassName="from-emerald-500/10 to-green-500/10"
          />

          <CareerMetricCard
            icon={BarChart3}
            label="สายงานล่าสุด"
            value={careerSummary.latestCategory}
            description="สายงานจากประสบการณ์ล่าสุด"
            gradientClassName="from-purple-500/10 to-fuchsia-500/10"
          />

          <CareerMetricCard
            icon={Target}
            label="ความตรงสายเฉลี่ย"
            value={`${careerSummary.averageAlignment}%`}
            description="เฉลี่ยจากทุกประสบการณ์"
            gradientClassName="from-slate-500/10 to-zinc-500/10"
          />
        </div>
      )}

      {isEditing ? (
        <div className="space-y-4">
          {careers.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-card p-6 text-sm text-muted-foreground">
              ยังไม่มีประสบการณ์การทำงาน
            </div>
          ) : (
            careers.map((item, index) => {
              const isLatestCareer = index === careers.length - 1;

              return (
                <div
                  key={item.id || `career-edit-wrapper-${index}`}
                  ref={isLatestCareer ? latestCareerEditCardRef : null}
                  className="scroll-mt-28"
                >
                  <CareerExperienceEditCard 
                    item={item}
                    index={index}
                    skills={skills}
                    careerCategories={careerCategories}
                    onRemove={onRemoveCareer}
                    onUpdateField={onUpdateCareerField}
                    onUpdateCareerCategory={onUpdateCareerCategory}
                    onUpdateCareerLevel={onUpdateCareerLevel}
                    onToggleCareerRelatedSkill={onToggleCareerRelatedSkill}
                  />
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {careers.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-card p-6 text-sm text-muted-foreground">
              ยังไม่มีประสบการณ์การทำงาน
            </div>
          ) : (
            <>
              <div className="relative z-20 flex flex-col gap-3 rounded-2xl border bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setCareerFilter("all")}
                    className={`rounded-full px-3 py-1.5 text-sm transition ${
                      careerFilter === "all"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background hover:bg-muted"
                    }`}
                  >
                    ทั้งหมด
                  </button>

                  <button
                    type="button"
                    onClick={() => setCareerFilter("current")}
                    className={`rounded-full px-3 py-1.5 text-sm transition ${
                      careerFilter === "current"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background hover:bg-muted"
                    }`}
                  >
                    งานปัจจุบัน
                  </button>

                  <button
                    type="button"
                    onClick={() => setCareerFilter("aligned")}
                    className={`rounded-full px-3 py-1.5 text-sm transition ${
                      careerFilter === "aligned"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background hover:bg-muted"
                    }`}
                  >
                    ตรงสาย
                  </button>

                  <button
                    type="button"
                    onClick={() => setCareerFilter("not_aligned")}
                    className={`rounded-full px-3 py-1.5 text-sm transition ${
                      careerFilter === "not_aligned"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background hover:bg-muted"
                    }`}
                  >
                    ไม่ตรงสาย
                  </button>
                </div>

                <select
                  value={careerSort}
                  onChange={(e) => setCareerSort(e.target.value as CareerSort)}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="latest">ล่าสุดก่อน</option>
                  <option value="oldest">เก่าสุดก่อน</option>
                  <option value="alignment_high">ตรงสายมากสุด</option>
                  <option value="alignment_low">ตรงสายน้อยสุด</option>
                </select>
              </div>

              <div className="relative mt-8">
                <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-primary/20" />

                <div className="space-y-6">
                  {sortedCareers.map((career, index) => (
                    <motion.div
                      key={career.id || `career-view-${index}`}
                      initial={{ opacity: 0, y: -12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative pl-14"
                    >
                      <div
                        className={`absolute left-[5px] top-6 z-10 flex h-7 w-7 items-center justify-center rounded-full border-4 border-background shadow-sm ${
                          career.isCurrent ? "bg-emerald-500" : "bg-primary"
                        }`}
                      >
                        <div className="h-2.5 w-2.5 rounded-full bg-white" />
                      </div>

                      <CareerExperienceCard 
                        career={career}
                        index={index}
                        onOpenInsight={setSelectedCareerInsight}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <CareerInsightDialog
        career={selectedCareerInsightLive}
        onClose={() => setSelectedCareerInsight(null)}
      />
    </div>
  );
}