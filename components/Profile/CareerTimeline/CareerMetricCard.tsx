"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  description: string;
  gradientClassName?: string;
};

export function CareerMetricCard({
  icon: Icon,
  label,
  value,
  description,
  gradientClassName = "from-background to-muted/20",
}: Props) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.18 }}
      className={`group rounded-3xl border bg-gradient-to-br ${gradientClassName} p-5 shadow-sm hover:shadow-lg transition-all`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </div>

          <p className="mt-3 text-2xl font-bold">{value}</p>

          <p className="mt-1 text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}