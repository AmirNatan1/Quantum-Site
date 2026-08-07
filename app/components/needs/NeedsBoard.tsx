"use client";

import { useState } from "react";
import { needs } from "../../data";
import { track } from "../../lib/analytics";
import { NeedCard } from "./NeedCard";
import { NeedFilters, type NeedFilter } from "./NeedFilters";

export function NeedsBoard() {
  const [filter, setFilter] = useState<NeedFilter>("all");
  const visible = filter === "all" ? needs : needs.filter((need) => (need.sectorIds as readonly string[]).includes(filter));
  const changeFilter = (nextFilter: NeedFilter) => {
    if (nextFilter === filter) return;
    setFilter(nextFilter);
    track({ event: "need_filter", route: "/pocs", placement: "pocs_catalogue", sector: nextFilter });
  };
  return (
    <section id="representative-challenges" className="needs-board needs-catalogue section-pad" aria-labelledby="needs-board-title">
      <div className="shell">
        <div className="eyebrow"><span className="eyebrow-dot" aria-hidden="true" />the kind of problem we work on</div>
        <div className="needs-board-head"><h2 id="needs-board-title">Representative challenges</h2><p>These are examples of the kind of operational need we frame and test against. They are not open calls.</p></div>
        <p className="representative-notice">These categories describe the kind of work we do. They are not current opportunities, they carry no deadline, and applying against one does not create a live process. When we run an open call we will say so explicitly and date it.</p>
        <NeedFilters value={filter} onChange={changeFilter} />
        <div className="needs-grid">{visible.map((need) => <NeedCard key={need.id} need={need} />)}</div>
      </div>
    </section>
  );
}
