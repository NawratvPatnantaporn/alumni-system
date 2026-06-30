"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, BadgeCheck, Calendar, ExternalLink, FileCheck2, FolderKanban, LinkIcon, Medal, Plus, Search, Sparkles, Star, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type UserAchievementForm = {
  id?: string;
  title: string;
  issuer: string;
  achievementDate: string;
  description: string;
  url: string;
  achievementType: string;
  isFeatured: boolean;
  displayOrder: number;
};

type EarnedBadgeItem = {
  id?: string;
  badge_id?: string;
  awarded_at?: string | null;
  source?: string | null;
  show_on_profile?: boolean | null;
  is_pinned?: boolean | null;
  display_order?: number | null;
  badge_definitions?: {
    id?: string;
    code?: string | null;
    name?: string | null;
    description?: string | null;
    icon?: string | null;
    color?: string | null;
    rule_type?: string | null;
    badge_group?: string | null;
    tier_level?: number | null;
    points?: number | null;
    rarity?: string | null;
    display_order?: number | null;
  } | null;
};

type AchievementFilter = "all" | "badges" | "works" | "featured";

type Props = {
  isEditing: boolean;
  earnedBadges: EarnedBadgeItem[];
  achievements: UserAchievementForm[];
  onAddAchievement: () => void;
  onRemoveAchievement: (index: number) => void;
  onUpdateAchievementField: (
    index: number,
    field: keyof UserAchievementForm,
    value: string | boolean,
  ) => void;
  onUpdateBadgeDisplay?: (userBadgeId: string, showOnProfile: boolean) => void;
};

function formatThaiDate(value?: string | null) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getAchievementLabel(type: string) {
  switch (type?.toLowerCase()) {
    case "award":
      return "รางวัล";
    case "certificate":
      return "ใบรับรอง";
    case "project":
      return "โปรเจกต์";
    case "completion":
      return "สำเร็จการอบรม";
    case "portfolio":
      return "ผลงาน";
    default:
      return type || "ผลงาน";
  }
}

function getAchievementIcon(type: string) {
  switch (type?.toLowerCase()) {
    case "award":
      return Trophy;
    case "certificate":
      return FileCheck2;
    case "project":
      return FolderKanban;
    case "completion":
      return BadgeCheck;
    default:
      return Award;
  }
}

function getBadgeTone(index: number) {
  const tones = [
    "from-blue-500/10 to-cyan-500/10 text-blue-700",
    "from-emerald-500/10 to-green-500/10 text-emerald-700",
    "from-violet-500/10 to-fuchsia-500/10 text-violet-700",
    "from-amber-500/10 to-orange-500/10 text-amber-700",
  ];

  return tones[index % tones.length];
}

function AchievementMetricCard({
  icon: Icon,
  label,
  value,
  description,
  tone,
}: {
  icon: any;
  label: string;
  value: string | number;
  description: string;
  tone: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
      className={`rounded-3xl border bg-gradient-to-br ${tone} p-5 shadow-sm`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="rounded-2xl bg-background/70 p-2 shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-dashed bg-muted/20 p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
        <Award className="h-7 w-7 text-primary" />
      </div>

      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

function EarnedBadgeCard({
  item,
  index,
  onOpen,
}: {
  item: EarnedBadgeItem;
  index: number;
  onOpen: (item: EarnedBadgeItem) => void;
}) {
  const badge = item.badge_definitions;
  const tone = getBadgeTone(index);

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -4 }}
      onClick={() => onOpen(item)}
      className="group text-left"
    >
      <div
        className={`h-full rounded-3xl border bg-gradient-to-br ${tone} p-5 shadow-sm transition hover:shadow-lg`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background/80 shadow-sm">
            <Medal className="h-6 w-6" />
          </div>

          <Badge className="rounded-full bg-emerald-600 hover:bg-emerald-600">
            ปลดล็อกแล้ว
          </Badge>
        </div>

        <div className="mt-5">
          <h4 className="line-clamp-1 text-base font-semibold">
            {badge?.name ?? "เหรียญความสำเร็จ"}
          </h4>

          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {badge?.description ?? "ปลดล็อกจากกิจกรรมและความคืบหน้าในระบบ"}
          </p>

          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {formatThaiDate(item.awarded_at)}
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function AchievementWorkCard({
  item,
  index,
  onOpen,
}: {
  item: UserAchievementForm;
  index: number;
  onOpen: (item: UserAchievementForm) => void;
}) {
  const Icon = getAchievementIcon(item.achievementType);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -3 }}
      className={`rounded-3xl border bg-card p-5 shadow-sm transition hover:shadow-lg ${
        item.isFeatured ? "border-primary/40 ring-1 ring-primary/10" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="h-6 w-6" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-lg font-semibold leading-tight">
                {item.title || "ไม่ระบุชื่อผลงาน"}
              </h4>

              {item.isFeatured && (
                <Badge className="rounded-full">
                  <Star className="mr-1 h-3 w-3" />
                  ผลงานเด่น
                </Badge>
              )}
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              {item.issuer || "ไม่ระบุผู้ออกให้ / องค์กร"}
            </p>
          </div>
        </div>

        <Badge variant="secondary" className="rounded-full">
          {getAchievementLabel(item.achievementType)}
        </Badge>
      </div>

      {item.description && (
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">
          {item.description}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {formatThaiDate(item.achievementDate)}
        </div>

        <div className="flex items-center gap-2">
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium transition hover:bg-muted"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              เปิดลิงก์
            </a>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpen(item)}
          >
            ดูรายละเอียด
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function FeaturedAchievementCard({
  item,
  onOpen,
}: {
  item: UserAchievementForm;
  onOpen: (item: UserAchievementForm) => void;
}) {
  const Icon = getAchievementIcon(item.achievementType);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-accent/10 shadow-sm"
    >
      <div className="grid gap-5 p-6 md:grid-cols-[1fr_220px] md:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-full">
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              ผลงานเด่น
            </Badge>

            <Badge variant="secondary" className="rounded-full">
              {getAchievementLabel(item.achievementType)}
            </Badge>
          </div>

          <h3 className="mt-4 text-2xl font-bold tracking-tight">
            {item.title || "ไม่ระบุชื่อผลงาน"}
          </h3>

          <p className="mt-2 text-sm text-muted-foreground">
            {item.issuer || "ไม่ระบุองค์กร"} ·{" "}
            {formatThaiDate(item.achievementDate)}
          </p>

          {item.description && (
            <p className="mt-4 line-clamp-3 text-sm leading-7 text-muted-foreground">
              {item.description}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <Button type="button" onClick={() => onOpen(item)}>
              ดูรายละเอียด
            </Button>

            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center rounded-md border bg-background px-4 text-sm font-medium transition hover:bg-muted"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                เปิดลิงก์
              </a>
            )}
          </div>
        </div>

        <div className="hidden rounded-3xl border bg-background/70 p-8 shadow-inner md:flex md:h-48 md:items-center md:justify-center">
          <Icon className="h-20 w-20 text-primary/70" />
        </div>
      </div>
    </motion.div>
  );
}

function BadgeDisplayManager({
  badges,
  onUpdateBadgeDisplay,
}: {
  badges: EarnedBadgeItem[];
  onUpdateBadgeDisplay?: (userBadgeId: string, showOnProfile: boolean) => void;
}) {
  if (badges.length === 0) return null;

  const grouped = badges.reduce<Record<string, EarnedBadgeItem[]>>(
    (acc, item) => {
      const badge = item.badge_definitions;

      const group =
        badge?.badge_group ||
        badge?.rule_type ||
        badge?.code ||
        item.badge_id ||
        item.id ||
        "อื่น ๆ";

      if (!acc[group]) acc[group] = [];
      acc[group].push(item);

      return acc;
    },
    {},
  );

  return (
    <div className="rounded-3xl border bg-muted/20 p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            จัดการเหรียญที่แสดงบนโปรไฟล์
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            เหรียญเหล่านี้มีผลต่อคะแนนแนะนำและการจัดอันดับในระบบ
            แม้จะซ่อนจากหน้าโปรไฟล์
          </p>
        </div>

        <Badge variant="secondary" className="w-fit rounded-full">
          มีผลต่อ Popular Ranking
        </Badge>
      </div>

      <div className="mt-5 space-y-4">
        {Object.entries(grouped).map(([group, items]) => {
          const sortedItems = [...items].sort(
            (a, b) =>
              Number(b.badge_definitions?.tier_level ?? 1) -
              Number(a.badge_definitions?.tier_level ?? 1),
          );

          return (
            <div key={group} className="rounded-2xl border bg-background p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{group}</p>
                  <p className="text-xs text-muted-foreground">
                    ระบบจะแสดงเหรียญระดับสูงสุดของชุดนี้เป็นค่าเริ่มต้น
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {sortedItems.map((item) => {
                  const badge = item.badge_definitions;
                  const checked = item.show_on_profile !== false;

                  return (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-3 rounded-2xl border bg-muted/10 p-3"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">
                            {badge?.name ?? "เหรียญความสำเร็จ"}
                          </p>

                          <Badge variant="secondary" className="rounded-full">
                            Tier {badge?.tier_level ?? 1}
                          </Badge>

                          <Badge variant="outline" className="rounded-full">
                            {badge?.points ?? 0} แต้ม
                          </Badge>
                        </div>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {badge?.description ?? "-"}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={!item.id || !onUpdateBadgeDisplay}
                        onClick={() => {
                          if (!item.id) return;
                          onUpdateBadgeDisplay?.(item.id, !checked);
                        }}
                        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                          checked ? "bg-primary" : "bg-muted"
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-4 w-4 rounded-full bg-background shadow transition ${
                            checked ? "left-6" : "left-1"
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AchievementEditCard({
  item,
  index,
  onRemove,
  onUpdate,
}: {
  item: UserAchievementForm;
  index: number;
  onRemove: (index: number) => void;
  onUpdate: (
    index: number,
    field: keyof UserAchievementForm,
    value: string | boolean,
  ) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-3xl border bg-card p-5 shadow-sm"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <Badge
            variant={item.isFeatured ? "default" : "secondary"}
            className="rounded-full"
          >
            {item.isFeatured ? "ผลงานเด่น" : `รายการที่ ${index + 1}`}
          </Badge>

          <h4 className="mt-3 text-lg font-semibold">
            {item.title || "เพิ่มผลงาน / ความสำเร็จ"}
          </h4>
        </div>

        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => onRemove(index)}
        >
          ลบรายการนี้
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>ชื่อผลงาน / รางวัล</Label>
          <Input
            value={item.title}
            onChange={(e) => onUpdate(index, "title", e.target.value)}
            placeholder="เช่น Alumni Connect Web Application"
          />
        </div>

        <div className="space-y-2">
          <Label>ผู้ออกให้ / ผู้จัด / องค์กร</Label>
          <Input
            value={item.issuer}
            onChange={(e) => onUpdate(index, "issuer", e.target.value)}
            placeholder="เช่น Sripatum University"
          />
        </div>

        <div className="space-y-2">
          <Label>วันที่ได้รับ / วันที่เผยแพร่</Label>
          <Input
            type="date"
            value={item.achievementDate}
            onChange={(e) => onUpdate(index, "achievementDate", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>ประเภท</Label>
          <select
            value={item.achievementType}
            onChange={(e) => onUpdate(index, "achievementType", e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">เลือกประเภท</option>
            <option value="project">โปรเจกต์</option>
            <option value="award">รางวัล</option>
            <option value="certificate">ใบรับรอง</option>
            <option value="completion">สำเร็จการอบรม</option>
            <option value="portfolio">ผลงาน</option>
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>คำอธิบาย</Label>
          <Textarea
            value={item.description}
            onChange={(e) => onUpdate(index, "description", e.target.value)}
            placeholder="อธิบายผลงาน บทบาท เทคโนโลยีที่ใช้ หรือผลลัพธ์ที่เกิดขึ้น"
            className="min-h-28"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>ลิงก์อ้างอิง</Label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={item.url}
              onChange={(e) => onUpdate(index, "url", e.target.value)}
              placeholder="https://..."
              className="pl-9"
            />
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border bg-muted/20 p-4 md:col-span-2">
          <input
            type="checkbox"
            checked={item.isFeatured}
            onChange={(e) => onUpdate(index, "isFeatured", e.target.checked)}
            className="h-4 w-4"
          />

          <div>
            <p className="text-sm font-medium">ปักหมุดเป็นผลงานเด่น</p>
            <p className="text-xs text-muted-foreground">
              ผลงานเด่นจะถูกแสดงใหญ่กว่ารายการอื่น
              เพื่อเพิ่มความน่าสนใจของโปรไฟล์
            </p>
          </div>
        </label>
      </div>
    </motion.div>
  );
}

function AchievementDetailDialog({
  item,
  badge,
  onClose,
}: {
  item?: UserAchievementForm | null;
  badge?: EarnedBadgeItem | null;
  onClose: () => void;
}) {
  const isOpen = !!item || !!badge;
  const badgeDefinition = badge?.badge_definitions;

  const title = item?.title || badgeDefinition?.name || "รายละเอียด";
  const description =
    item?.description ||
    badgeDefinition?.description ||
    "ไม่มีรายละเอียดเพิ่มเติม";

  const typeLabel = item
    ? getAchievementLabel(item.achievementType)
    : "เหรียญในระบบ";

  const badgePoints = badge?.badge_definitions?.points ?? 0;
  const badgeTier = badge?.badge_definitions?.tier_level ?? 1;

  const date = item?.achievementDate || badge?.awarded_at || null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-2xl overflow-hidden rounded-3xl border bg-background shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b px-6 py-5">
              <div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="rounded-full">{typeLabel}</Badge>
                  {item?.isFeatured && (
                    <Badge variant="secondary" className="rounded-full">
                      ผลงานเด่น
                    </Badge>
                  )}
                </div>

                <h3 className="mt-3 text-2xl font-bold">{title}</h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  {item?.issuer || "ระบบ Alumni SPU"} · {formatThaiDate(date)}
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-5 px-6 py-5">
              <div className="rounded-2xl bg-muted/40 p-4">
                <p className="text-sm leading-7 text-muted-foreground">
                  {description}
                </p>
              </div>

              {badge && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border bg-muted/20 p-4">
                    <p className="text-xs text-muted-foreground">ระดับเหรียญ</p>
                    <p className="mt-1 text-lg font-semibold">
                      Tier {badgeTier}
                    </p>
                  </div>

                  <div className="rounded-2xl border bg-muted/20 p-4">
                    <p className="text-xs text-muted-foreground">
                      คะแนนแนะนำในระบบ
                    </p>
                    <p className="mt-1 text-lg font-semibold">
                      {badgePoints} แต้ม
                    </p>
                  </div>
                </div>
              )}

              {item?.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  เปิดลิงก์อ้างอิง
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function getHighestBadgePerGroup(items: EarnedBadgeItem[]) {
  const visibleItems = items.filter((item) => item.show_on_profile !== false);

  const map = new Map<string, EarnedBadgeItem>();

  visibleItems.forEach((item) => {
    const badge = item.badge_definitions;

    const group =
      badge?.badge_group ||
      badge?.rule_type ||
      badge?.code ||
      item.badge_id ||
      item.id ||
      "unknown";

    const current = map.get(group);

    if (!current) {
      map.set(group, item);
      return;
    }

    const currentTier = Number(current.badge_definitions?.tier_level ?? 1);
    const nextTier = Number(badge?.tier_level ?? 1);

    const currentPoints = Number(current.badge_definitions?.points ?? 0);
    const nextPoints = Number(badge?.points ?? 0);

    const currentDate = current.awarded_at
      ? new Date(current.awarded_at).getTime()
      : 0;

    const nextDate = item.awarded_at ? new Date(item.awarded_at).getTime() : 0;

    const shouldReplace =
      nextTier > currentTier ||
      (nextTier === currentTier && nextPoints > currentPoints) ||
      (nextTier === currentTier &&
        nextPoints === currentPoints &&
        nextDate > currentDate);

    if (shouldReplace) {
      map.set(group, item);
    }
  });

  return Array.from(map.values()).sort((a, b) => {
    if (!!a.is_pinned !== !!b.is_pinned) return a.is_pinned ? -1 : 1;

    const orderA = Number(
      a.badge_definitions?.display_order ?? a.display_order ?? 999,
    );
    const orderB = Number(
      b.badge_definitions?.display_order ?? b.display_order ?? 999,
    );

    if (orderA !== orderB) return orderA - orderB;

    return (
      Number(b.badge_definitions?.tier_level ?? 1) -
      Number(a.badge_definitions?.tier_level ?? 1)
    );
  });
}

export function AchievementsTab({
  isEditing,
  earnedBadges,
  achievements,
  onAddAchievement,
  onRemoveAchievement,
  onUpdateAchievementField,
  onUpdateBadgeDisplay,
}: Props) {
  const [filter, setFilter] = useState<AchievementFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAchievement, setSelectedAchievement] =
    useState<UserAchievementForm | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<EarnedBadgeItem | null>(
    null,
  );
  const shouldScrollToNewAchievement = useRef(false);
  const lastAchievementRef = useRef<HTMLDivElement | null>(null);

  const handleAddAchievement = () => {
    shouldScrollToNewAchievement.current = true;
    onAddAchievement();
  };

  useEffect(() => {
    if (!isEditing) return;
    if (!shouldScrollToNewAchievement.current) return;
    if (achievements.length === 0) return;

    const timer = window.setTimeout(() => {
      lastAchievementRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      shouldScrollToNewAchievement.current = false;
    }, 80);

    return () => window.clearTimeout(timer);
  }, [achievements.length, isEditing]);

  const sortedAchievements = useMemo(() => {
    return [...achievements].sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;

      const dateA = a.achievementDate
        ? new Date(a.achievementDate).getTime()
        : 0;
      const dateB = b.achievementDate
        ? new Date(b.achievementDate).getTime()
        : 0;

      if (dateA !== dateB) return dateB - dateA;

      return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
    });
  }, [achievements]);

  const featuredAchievement = sortedAchievements.find(
    (item) => item.isFeatured,
  );

  const filteredAchievements = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return sortedAchievements.filter((item) => {
      if (filter === "featured" && !item.isFeatured) return false;
      if (filter === "badges") return false;

      if (!q) return true;

      return [item.title, item.issuer, item.description, item.achievementType]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q));
    });
  }, [sortedAchievements, filter, searchQuery]);

  const showBadges = filter === "all" || filter === "badges";
  const showWorks =
    filter === "all" || filter === "works" || filter === "featured";

  const latestUpdate = useMemo(() => {
    const workDates = achievements
      .map((item) => item.achievementDate)
      .filter(Boolean);

    const badgeDates = earnedBadges
      .map((item) => item.awarded_at)
      .filter(Boolean) as string[];

    const dates = [...workDates, ...badgeDates]
      .map((date) => new Date(date).getTime())
      .filter((time) => !Number.isNaN(time))
      .sort((a, b) => b - a);

    return dates[0] ? formatThaiDate(new Date(dates[0]).toISOString()) : "-";
  }, [achievements, earnedBadges]);

  const displayBadges = useMemo(() => {
    return getHighestBadgePerGroup(earnedBadges);
  }, [earnedBadges]);

  const metrics = {
    badgeCount: displayBadges.length,
    totalBadgeCount: earnedBadges.length,
    workCount: achievements.length,
    featuredCount: achievements.filter((item) => item.isFeatured).length,
    latestUpdate,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight">ความสำเร็จ</h2>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            รวมเหรียญที่ปลดล็อก ผลงาน ใบรับรอง รางวัล
            และโปรเจกต์ที่ต้องการแสดงบนโปรไฟล์
          </p>
        </div>

        {isEditing && (
          <Button type="button" onClick={handleAddAchievement}>
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มผลงาน
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AchievementMetricCard
          icon={Medal}
          label="เหรียญที่ปลดล็อก"
          value={metrics.badgeCount}
          description={`แสดง ${metrics.badgeCount} จากทั้งหมด ${metrics.totalBadgeCount} เหรียญ`}
          tone="from-blue-500/10 to-cyan-500/10"
        />

        <AchievementMetricCard
          icon={FolderKanban}
          label="ผลงานทั้งหมด"
          value={metrics.workCount}
          description="ผลงานที่เพิ่มในโปรไฟล์"
          tone="from-emerald-500/10 to-green-500/10"
        />

        <AchievementMetricCard
          icon={Star}
          label="ผลงานเด่น"
          value={metrics.featuredCount}
          description="รายการที่ปักหมุดไว้"
          tone="from-violet-500/10 to-fuchsia-500/10"
        />

        <AchievementMetricCard
          icon={Calendar}
          label="อัปเดตล่าสุด"
          value={metrics.latestUpdate}
          description="จากเหรียญหรือผลงานล่าสุด"
          tone="from-amber-500/10 to-orange-500/10"
        />
      </div>

      {!isEditing && (
        <div className="flex flex-col gap-3 rounded-3xl border bg-muted/20 p-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "ทั้งหมด" },
              { value: "badges", label: "เหรียญในระบบ" },
              { value: "works", label: "ผลงาน" },
              { value: "featured", label: "ผลงานเด่น" },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value as AchievementFilter)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  filter === item.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-background hover:bg-muted"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="relative md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาผลงาน..."
              className="pl-9"
            />
          </div>
        </div>
      )}

      {isEditing ? (
        <div className="space-y-6">
          <BadgeDisplayManager
            badges={earnedBadges}
            onUpdateBadgeDisplay={onUpdateBadgeDisplay}
          />

          {achievements.length === 0 ? (
            <EmptyState
              title="ยังไม่มีผลงานในโปรไฟล์"
              description="เพิ่มโปรเจกต์ รางวัล ใบรับรอง หรือผลงานสำคัญ เพื่อทำให้โปรไฟล์ดูน่าเชื่อถือมากขึ้น"
              action={
                <Button type="button" onClick={handleAddAchievement}>
                  <Plus className="mr-2 h-4 w-4" />
                  เพิ่มผลงานแรก
                </Button>
              }
            />
          ) : (
            achievements.map((item, index) => {
              const isLast = index === achievements.length - 1;

              return (
                <div
                  key={item.id || `achievement-edit-wrapper-${index}`}
                  ref={isLast ? lastAchievementRef : null}
                >
                  <AchievementEditCard 
                    item={item}
                    index={index}
                    onRemove={onRemoveAchievement}
                    onUpdate={onUpdateAchievementField}
                  />
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {showWorks && featuredAchievement && (
            <section className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold">ผลงานเด่น</h3>
                <p className="text-sm text-muted-foreground">
                  ผลงานที่ผู้ใช้เลือกให้แสดงเด่นบนโปรไฟล์
                </p>
              </div>

              <FeaturedAchievementCard
                item={featuredAchievement}
                onOpen={setSelectedAchievement}
              />
            </section>
          )}

          {showBadges && (
            <section className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold">เหรียญตราที่ได้รับ</h3>
                <p className="text-sm text-muted-foreground">
                  แสดงเหรียญระดับสูงสุดของแต่ละหมวด โดยเหรียญทั้งหมดมีผลต่อการแนะนำในระบบ
                </p>
              </div>

              {displayBadges.length === 0 ? (
                <EmptyState
                  title="ยังไม่มีเหรียญที่ปลดล็อก"
                  description="เมื่อกรอกโปรไฟล์ ทำกิจกรรม หรือเพิ่มข้อมูลสำคัญ ระบบจะแสดงเหรียญที่ปลดล็อกในส่วนนี้"
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {displayBadges.map((item, index) => (
                    <EarnedBadgeCard
                      key={`badge-${item.id ?? item.badge_id ?? index}`}
                      item={item}
                      index={index}
                      onOpen={setSelectedBadge}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {showWorks && (
            <section className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold">
                  ผลงานและความสำเร็จทั้งหมด
                </h3>
                <p className="text-sm text-muted-foreground">
                  รางวัล ใบรับรอง โปรเจกต์ และผลงานที่ต้องการแสดงบนโปรไฟล์
                </p>
              </div>

              {filteredAchievements.length === 0 ? (
                <EmptyState
                  title="ไม่พบผลงานที่ตรงกับเงื่อนไข"
                  description="ลองเปลี่ยนตัวกรองหรือคำค้นหา หากยังไม่มีผลงาน ให้กดแก้ไขโปรไฟล์เพื่อเพิ่มข้อมูล"
                />
              ) : (
                <div className="grid gap-4 xl:grid-cols-2">
                  {filteredAchievements.map((item, index) => (
                    <AchievementWorkCard
                      key={`achievement-view-${item.id ?? item.title ?? index}`}
                      item={item}
                      index={index}
                      onOpen={setSelectedAchievement}
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      )}

      <AchievementDetailDialog
        item={selectedAchievement}
        badge={selectedBadge}
        onClose={() => {
          setSelectedAchievement(null);
          setSelectedBadge(null);
        }}
      />
    </div>
  );
}
