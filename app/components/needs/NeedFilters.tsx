"use client";

export type NeedFilter = "all" | "automotive" | "logistics" | "industry-4" | "energy";

const labels: Record<NeedFilter, string> = {
  all: "All",
  automotive: "Automotive",
  logistics: "Logistics",
  "industry-4": "Industry 4.0",
  energy: "Energy",
};

export function NeedFilters({ value, onChange }: { value: NeedFilter; onChange: (value: NeedFilter) => void }) {
  const filters: NeedFilter[] = ["all", "automotive", "logistics", "industry-4", "energy"];
  return (
    <div className="need-filters" role="group" aria-label="Filter representative challenges">
      {filters.map((filter) => <button key={filter} type="button" aria-pressed={value === filter} onClick={() => onChange(filter)}>{labels[filter]}</button>)}
    </div>
  );
}
