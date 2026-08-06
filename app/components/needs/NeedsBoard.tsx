"use client";

import { useState } from "react";
import { needs } from "../../data";
import { NeedCard } from "./NeedCard";
import { NeedFilters, type NeedFilter } from "./NeedFilters";

export function NeedsBoard() {
  const [filter, setFilter] = useState<NeedFilter>("all");
  const visible = filter === "all" ? needs : needs.filter((need) => (need.sectorIds as readonly string[]).includes(filter));
  return (
    <section className="needs-board section-pad" aria-labelledby="needs-board-title">
      <div className="shell">
        <div className="eyebrow"><span className="eyebrow-dot" aria-hidden="true" />representative operational challenges</div>
        <div className="needs-board-head"><h2 id="needs-board-title">Start with what must change.</h2><p>These examples show the shape of needs Quantum-hub can work against. They are not presented as currently open opportunities.</p></div>
        <NeedFilters value={filter} onChange={setFilter} />
        <div className="needs-grid">{visible.map((need) => <NeedCard key={need.id} need={need} />)}</div>
      </div>
    </section>
  );
}
