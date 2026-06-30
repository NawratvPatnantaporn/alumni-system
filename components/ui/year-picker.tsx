type YearPickerProps = {
  startYear: number;
  endYear: number;
  value?: string;
  onChange: (year: string) => void;
};

export function YearPicker({
  startYear,
  endYear,
  value,
  onChange,
}: YearPickerProps) {

  const years = [];

  for (let y = startYear; y <= endYear; y++) {
    years.push(y);
  }

  return (
    <div className="grid grid-cols-4 gap-3 max-h-64 overflow-y-auto p-2">
      {years.map((year) => {
        const isSelected = value === year.toString();

        return (
          <button
            key={year}
            onClick={() => onChange(year.toString())}
            className={`h-12 rounded-lg text-sm font-medium transition
              ${
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/70"
              }
            `}
          >
            {year}
          </button>
        );
      })}
    </div>
  );
}
