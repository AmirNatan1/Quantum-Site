# Codex Workflow — Quantum-Hub Redesign

## Recommended method

Do not begin with a single unrestricted "redesign the whole site" task.

Use:

1. Root `AGENTS.md` for persistent project rules.
2. `docs/QUANTUM_HUB_REDESIGN_SPEC.md` for the complete source of truth.
3. The supplied audit and CSS in `docs/reference/`.
4. Codex Ask mode for repository discovery and a file-level plan.
5. Codex Code mode in reviewable phases.
6. A human review after each phase before continuing.

This follows the highest-reliability pattern for a large frontend change: persistent repository guidance, a stable specification, and narrowly scoped implementation tasks.

---

## Prompt 0 — Ask mode: inspect and plan

Paste this first. Do not ask Codex to code yet.

```text
Read `/AGENTS.md` and every file it marks as required reading. Explicitly ignore any file whose name contains `quantum-prototype` or `Quantum Prototype`.

Audit the current repository and running site against `docs/QUANTUM_HUB_REDESIGN_SPEC.md`. Do not modify production code in this task.

Return a concrete implementation plan containing:

1. Current stack, routing, rendering model, styling architecture, animation approach, content/data sources, forms, analytics, tests, build and deployment commands.
2. A route and component inventory.
3. Revalidation of the supplied audit's P0 findings against the current code. Distinguish confirmed, changed, and unverified findings.
4. The exact files/components you recommend changing or creating in each implementation phase.
5. A proposed structured data model for partners, metrics, audience CTAs, process stages, needs, case studies, outcomes, SPARK status, and updates.
6. Your recommended signal-path and sticky-panel implementation for this specific stack, including progressive enhancement and reduced-motion behavior.
7. Whether any new dependency is genuinely required. Prefer native capabilities and existing dependencies. Quantify expected bundle impact when possible.
8. A testing matrix covering build, lint, type checks, unit/component/E2E tests, accessibility, responsive widths, keyboard, touch, reduced motion, no-JavaScript behavior, and performance.
9. Asset/content blockers, especially hero video, partner marks, approved needs, case evidence, and program status.
10. Risks, rollback points, and an ordered phase plan.

For every material recommendation, give a confidence score from 0.0 to 1.0. Do not deviate from the specification because of a reference file unless confidence is at least 0.95 and the benefit is documented.

End with a concise Phase 1 task definition that could be completed and reviewed independently.
```

Review this plan before giving Codex Code mode.

---

## Prompt 1 — Code mode: P0 foundation

```text
Read `/AGENTS.md`, `docs/QUANTUM_HUB_REDESIGN_SPEC.md`, and the approved repository audit plan from the previous task.

Implement Phase 1 only: P0 credibility, accessibility, and responsive foundation.

Scope:
- Correct the hero media component, poster/fallback behavior, deterministic text scrim, and playback logic using approved available assets. Do not fabricate a new final asset.
- Replace plain-text partner treatment with approved marks if assets exist; otherwise implement the deliberate accessible fallback and document the missing assets.
- Rationalize the touched typography enough to remove sub-11px text, pixel-locked accessibility failures, and oversized mobile headline floors without performing the full design-system migration yet.
- Fix measured contrast failures.
- Add a working skip link.
- Add comprehensive visible focus for interactive UI.
- Correct undersized primary hit targets.
- Guard hover-only effects for pointer-capable devices.
- Correct missing/inconsistent tab state semantics.
- Fix the intermediate-width layout gap.
- Add canonical and structured-data scaffolding only where production facts are known.
- Preserve content, routes, form behavior, and existing analytics.

Before editing, run the baseline build/tests and identify the exact files you will touch. Work in small patches.

After editing:
- Run all available build, lint, type-check, and relevant tests.
- Test the affected pages at 360, 390, 501, 768, 890, 1024, 1100, and desktop widths where tooling permits.
- Perform keyboard and reduced-motion checks.
- Check browser console output.
- Report bundle/performance impact.
- Do not continue into Phase 2.

Return the completion report in the format required by the specification.
```

---

## Prompt 2 — Code mode: design and motion system

```text
Read `/AGENTS.md`, `docs/QUANTUM_HUB_REDESIGN_SPEC.md`, the current repository, and the completed Phase 1 diff.

Implement Phase 2 only: the shared design and motion foundation.

Scope:
- Create or consolidate the eight-step rem-based type scale.
- Establish semantic live/proven/status tokens using the existing magenta and teal ramps.
- Establish separate interface and narrative motion tokens.
- Migrate touched shared components away from ad-hoc duration and size values.
- Implement accessible line-level heading reveals that preserve words, accessible names, layout stability, font-loading behavior, and resize behavior.
- Implement a block reveal utility for non-heading content.
- Implement the designed reduced-motion foundation so resolved content remains visible and no large blank scroll budgets survive.
- Create shared utilities for focus, hover capability, hit targets, video scrims, and technical labels without duplicating Phase 1 styles.
- Preserve current visual identity and content. Do not yet build the full signal narrative, match instrument, or evidence ledger.

Prefer adapting `docs/reference/quantum-signal.css` to the existing architecture rather than appending it blindly.

Run and report all checks required by `/AGENTS.md`. Stop after Phase 2.
```

---

## Prompt 3 — Code mode: homepage narrative

```text
Read `/AGENTS.md`, `docs/QUANTUM_HUB_REDESIGN_SPEC.md`, and all completed Phase 1–2 changes.

Implement Phase 3 only: the homepage's coherent Quantum Signal narrative.

Required outcomes:
- Add the accessible, reversible audience selector for `I have a technology` and `I have an operational need`.
- Persist only non-sensitive session state and use it to adapt relevant CTA emphasis without hiding essential content.
- Implement the signal layer as a responsive, generated path through declared section/panel anchors. Do not use a fixed path that breaks across widths.
- Upgrade the consortium and evidence-metric chapters without introducing continuous logo motion.
- Build the `matchmaker with a workshop` alignment scene using semantic DOM plus SVG/CSS or an equivalent accessible approach.
- Rebuild the five-stage route as the centerpiece:
  1. Operational need.
  2. Global scouting.
  3. Partner match.
  4. Field POC.
  5. Scale what works, including rollout, reconfigure/retest, and useful-no branches.
- Preserve native scrolling and reversible progress.
- Give mobile the complete narrative. Use sticky frames only where content and browser behavior are safe; otherwise use deliberate vertical panels.
- Implement the full reduced-motion and no-JavaScript resolved states.
- Adapt the final homepage CTA to the audience state.
- Keep primary copy in the DOM.
- Add analytics through the existing system for audience selection and story-stage reach.
- Do not implement the Needs Exchange, match instrument, evidence ledger, or 3D POC platform in this phase.

Profile scroll performance and fix sustained main-thread jank before completion.

Run all tests and return the required completion report. Stop after Phase 3.
```

---

## Prompt 4 — Code mode: needs, matching, and evidence

```text
Read `/AGENTS.md`, `docs/QUANTUM_HUB_REDESIGN_SPEC.md`, and completed Phases 1–3.

Implement Phase 4 only: startup conversion through needs, matching, and evidence.

Scope:
- Create centralized structured data/configuration for approved needs, representative challenges, sectors, case studies, outcomes, and status labels.
- Build the accessible Live Needs Exchange or `Representative operational challenges` module. The title and claims must reflect the actual data approval state.
- Add filters and useful empty states.
- Build the need-to-match instrument with idle, selection, scanning, matched, no-match, error, and reduced-motion states.
- Make matching transparent and data-driven. Clearly label illustrative results.
- Route strong fits to SPARK, ongoing/Agile track, or appropriate contact/application destinations using existing routes.
- Build the evidence ledger with live-to-proven state transitions, text labels, filters, and deep links.
- Upgrade detailed case-study templates to the evidence schema where approved content exists.
- Add the data and UI state for a useful-no outcome without inventing a case.
- Add existing-system analytics events for needs, matches, evidence filters, and case opens.
- Write unit tests for matching logic and component/integration tests for filters and routing.
- Preserve confidentiality and do not expose partner/site information that is not already approved.

Do not build the flagship 3D/POC-platform scene in this phase.

Run all required checks and return the completion report. Stop after Phase 4.
```

---

## Prompt 5 — Code mode: SPARK, POCs, forms, and supporting routes

```text
Read `/AGENTS.md`, `docs/QUANTUM_HUB_REDESIGN_SPEC.md`, and completed Phases 1–4.

Implement Phase 5 only.

Scope:
- Rebuild SPARK as a clear runway with current program state driven from structured approved data.
- Improve the For Startups page with needs, eligibility, process, effort, confidentiality, and after-application context using only approved content.
- Make the POCs page the methodological authority with test design, criteria, roles, instrumentation, decision paths, and approved examples.
- Upgrade the Industries page into a cross-sector capability system rather than four repeated cards.
- Improve the SPARK application and contact flows with accessible intent routing, adaptive fields where justified, clear errors, privacy context, and useful success states.
- Improve About, Updates/Field Journal, and Footer only where approved assets/content exist.
- Standardize navigation and CTA terminology across routes.
- Preserve existing backend/form contracts unless a migration is explicitly necessary and documented.
- Add route-level tests and analytics through the existing system.

Do not fabricate dates, response times, testimonials, live program status, legal text, locations, or partner claims. Document blocked modules rather than filling them with invented content.

Run all required checks and return the completion report. Stop after Phase 5.
```

---

## Prompt 6 — Code mode: flagship POC platform

```text
Read `/AGENTS.md`, `docs/QUANTUM_HUB_REDESIGN_SPEC.md`, and completed Phases 1–5.

Implement Phase 6 only: one flagship interactive POC/test-platform scene.

First inspect approved assets and the current stack. Choose the simplest technology capable of premium execution:
1. SVG/CSS/pseudo-3D,
2. an existing graphics dependency,
3. WebGL/Three.js only if the first two cannot meet the approved design.

Required:
- Use the approved EV6/test-platform content and assets only.
- Show approved sensor positions, integration details, conditions, routes, safety, and evidence collection through accessible hotspots.
- Keep every meaningful label and explanation in the DOM.
- Provide keyboard, touch, mobile, reduced-motion, static-poster, no-WebGL, and load-error paths.
- Lazy-load the heavy implementation near the viewport.
- Keep it off the initial critical path.
- Dispose of resources and observers.
- Test frame rate and interaction latency on representative desktop and mid-range mobile conditions.
- Report dependency and bundle impact.
- Do not add other 3D scenes or decorative WebGL.

Run all required checks and return the completion report. Stop after Phase 6.
```

---

## Prompt 7 — Code mode: launch hardening

```text
Read `/AGENTS.md`, `docs/QUANTUM_HUB_REDESIGN_SPEC.md`, and all completed phases.

Perform Phase 7 only: launch hardening and final review.

Do not add new creative features unless required to fix a failed acceptance criterion.

Tasks:
- Review the complete diff against every non-negotiable and acceptance criterion.
- Run production build, lint, type checks, all tests, and end-to-end smoke tests.
- Perform cross-route responsive QA at the specified widths.
- Perform keyboard-only QA.
- Perform reduced-motion QA.
- Perform no-JavaScript/failure-state QA where the architecture permits.
- Run automated accessibility checks and manually inspect focus order, names, roles, states, forms, video, and canvas fallbacks.
- Profile hero loading, scroll interactions, INP-sensitive interactions, CLS, and the flagship scene.
- Inspect console errors, network failures, media caching, broken links, route metadata, canonical URLs, structured data, forms, and analytics event payloads.
- Verify every metric, commercial outcome, partner claim, date, status, and location against approved repository content.
- Remove dead code, debug logging, unused dependencies, duplicate CSS, and abandoned experiments.
- Produce deployment and rollback notes.
- Produce a clear list of remaining asset/content/legal blockers.
- Do not hide failures. Fix them or document them precisely.

Return a final launch-readiness report with pass/fail status for each major acceptance category.
```

---

## One-shot master prompt

Use this only when Codex Goal mode can sustain a long task and you are prepared to review a very large diff. The phased workflow above is safer and normally produces better work.

```text
Treat `/AGENTS.md` and `docs/QUANTUM_HUB_REDESIGN_SPEC.md` as the governing instructions for this repository. Explicitly ignore every file whose name contains `quantum-prototype` or `Quantum Prototype`.

First inspect the repository and create the Phase 0 architecture and implementation plan. Then implement Phases 1 through 7 in order, keeping each phase isolated and reviewable. Run the required checks at the end of every phase. Do not continue past a failed build, type check, critical accessibility check, or material regression until it is fixed or clearly documented as an external blocker.

Preserve the existing narrative spine and approved content. Build the Quantum Signal system, equal startup/industry paths, five-stage scroll story, needs/match experience, evidence ledger, SPARK/POC route improvements, and one flagship test-platform scene. Follow every accessibility, performance, confidentiality, responsive, reduced-motion, no-JavaScript, data-integrity, and testing requirement in the specification.

Do not fabricate assets, metrics, needs, partner claims, case results, dates, program status, testimonials, legal text, or locations. Do not use or inspect any Quantum Prototype file. Do not add generic tech effects or multiple 3D scenes.

At each phase, maintain a progress document containing:
- files changed,
- behavior implemented,
- checks run and results,
- bundle/performance observations,
- accessibility observations,
- blockers,
- deviations and confidence.

Finish by running the complete Phase 7 launch-hardening review and return a final launch-readiness report.
```
