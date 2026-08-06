"use client";

export type NeedFilter = "all" | "automotive" | "logistics" | "industry-4" | "energy";

export function NeedFilters({ value, onChange }: { value: NeedFilter; onChange: (value: NeedFilter) => void }) {
  const filters: NeedFilter[] = ["all", "automotive", "logistics", "industry-4", "energy"];
  return (
    <div className="need-filters" role="group" aria-label="Filter representative challenges">
      {filters.map((filter) => <button key={filter} type="button" aria-pressed={value === filter} onClick={() => onChange(filter)}>{filter.replace("industry-4", "Industry 4.0")}</button>)}
    </div>
  );
}
