import { useMemo, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Props {
  startYear: number;
  endYear: number;
  value?: number;
  onChange: (year: number) => void;
}

const RANGE_SIZE = 10;

export default function YearPicker({
  startYear,
  endYear,
  value,
  onChange,
}: Props) {
  const [rangeStart, setRangeStart] = useState(startYear);
  const [search, setSearch] = useState("");

  // ====== Generate year list ======
  const years = useMemo(() => {
    return Array.from({ length: RANGE_SIZE }, (_, i) => rangeStart + i);
  }, [rangeStart]);

  // ====== Jump to searched year ======
  useEffect(() => {
    const year = Number(search);
    if (!year) return;

    if (year >= startYear && year <= endYear) {
      const newStart =
        Math.floor((year - startYear) / RANGE_SIZE) * RANGE_SIZE +
        startYear;
      setRangeStart(newStart);
    }
  }, [search, startYear, endYear]);

  return (
    <div className="space-y-3">

      {/* 🔍 Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-60" />
        <Input
          placeholder="ค้นหาปี..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Range Header */}
      <div className="flex items-center justify-between text-sm font-medium">

        <button
          onClick={() =>
            setRangeStart((prev) =>
              Math.max(startYear, prev - RANGE_SIZE)
            )
          }
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span>
          {rangeStart} – {Math.min(rangeStart + RANGE_SIZE - 1, endYear)}
        </span>

        <button
          onClick={() =>
            setRangeStart((prev) =>
              Math.min(endYear - RANGE_SIZE + 1, prev + RANGE_SIZE)
            )
          }
        >
          <ChevronRight className="w-4 h-4" />
        </button>

      </div>

      {/* Year Grid */}
      <div className="grid grid-cols-4 gap-2">

        {years.map((year) => {
          if (year > endYear) return null;

          const selected = year === value;

          return (
            <button
              key={year}
              onClick={() => onChange(year)}
              className={`
                rounded-xl py-3 text-sm font-medium
                transition-all
                hover:scale-105
                ${selected
                  ? "bg-primary text-white"
                  : "bg-muted hover:bg-muted/70"}
              `}
            >
              {year}
            </button>
          );
        })}

      </div>
    </div>
  );
}
