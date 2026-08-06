# Quantum-Hub Website Redesign and Implementation Specification

## 1. Purpose

This is the definitive product, design, motion, accessibility, and engineering specification for evolving the Quantum-Hub website.

The objective is not to replace a functioning website with an effects showcase. The objective is to preserve the strong existing narrative and make it feel as sophisticated, credible, innovative, and commercially persuasive as Quantum-Hub's operating model.

The website must:

- Explain who Quantum-Hub is and what it does within seconds.
- Demonstrate—not merely claim—how Quantum-Hub converts operational needs into field evidence.
- Establish credibility through the consortium, methodology, facilities, and commercial outcomes.
- Attract qualified startups with deployable technology.
- Give industrial partners a clear path to bring an operational challenge.
- Feel like a guided story in which uncertainty becomes proof.
- Remain fast, accessible, maintainable, responsive, and truthful.

## 2. Governing concept: From Signal to Field Proof

The signature system is the **Quantum Signal**.

The signal begins as uncertainty and changes form according to the business process:

| Chapter | Meaning | Visual behavior |
|---|---|---|
| Operational need | An unresolved constraint | Noisy or unstable waveform |
| Global scouting | Searching the solution space | Expanding scan field |
| Partner match | Aligning capability and environment | Converging nodes and layers |
| Field POC | Measuring reality | Test matrix, telemetry, thresholds |
| Evidence | Replacing assumption with a result | Stabilized trace or resolved state |
| Scale | Acting on evidence | Propagation through a network |
| Useful no | Ending uncertainty without rollout | A clean, explicit termination |

The signal is not a decorative line pasted behind sections. Every use must communicate search, alignment, measurement, validation, resolution, or propagation.

## 3. Strategic principles

### 3.1 Preserve the strong narrative spine

The current site already has a useful order. Preserve it unless the repository reveals a clear usability defect:

1. Hero.
2. Partners.
3. Metrics.
4. Who Quantum-Hub is.
5. Five-stage route.
6. Statement/positioning.
7. Industries.
8. Proof.
9. SPARK.
10. Playground.
11. Closing CTA.

Improve chapter differentiation, pacing, hierarchy, and interaction before changing the order.

### 3.2 Give startups equal conversion priority

The site currently leans toward the industrial challenge path. The redesigned experience must make both sides of the network first-class:

- `I have a technology`
- `I have an operational need`

The startup path should persist throughout the journey through context-aware CTAs and relevant proof. This does not require hiding content or creating two separate websites.

### 3.3 Show demand, not only program benefits

Qualified startups are attracted by:

- A real operational problem.
- A credible deployment environment.
- A responsible internal owner.
- Clear evidence criteria.
- A pathway to commercial action.

Create a Live Needs Exchange or representative-needs system. The product must support real approved needs later even if current approved data is unavailable.

### 3.4 Proof before spectacle

Animation must amplify real assets:

- Real POCs.
- Test configurations.
- Partner environments.
- Evidence.
- Commercial outcomes.
- Methodology.
- The EV6 or equivalent test platform.

Never use spectacle to disguise missing proof.

### 3.5 Controlled innovation

The experience should contain a small number of memorable, integrated interactions:

1. The continuous signal.
2. The five-stage story.
3. The need-to-match instrument.
4. The evidence ledger.
5. One flagship POC/test-platform scene.

Do not build unrelated novelty effects for every section.

## 4. Required preliminary audit

Before implementation, inspect the repository and record:

- Framework and version.
- Package manager.
- Build and deploy commands.
- Routing architecture.
- Rendering model: static, SSR, SPA, or hybrid.
- Styling architecture.
- Existing design tokens.
- Existing animation code and dependencies.
- Content/data sources.
- Form submission paths.
- Analytics integration.
- Browser support policy.
- Test, lint, and type-check commands.
- Current page/routes inventory.
- Current mobile and intermediate-width behavior.
- Current hero media dimensions, duration, encoding, poster, playback logic, and caching.
- Existing partner asset availability.
- Current accessibility issues.
- Baseline performance.

Do not assume the reference audit still exactly matches the repository. Revalidate all measured findings before changing production code.

## 5. P0 remediation

Complete these before expensive creative implementation.

### 5.1 Hero media

The supplied audit reported a 960×540 source rendered substantially larger, a 172.84-second file reused in two locations, and possible playback pausing. Revalidate.

Target implementation:

- Dedicated hero loop, 6–10 seconds.
- 1920×1080 minimum source.
- Crisp full-resolution poster.
- AV1/WebM plus H.264 fallback when supported by the asset pipeline.
- Muted, inline, autoplay only where permitted.
- Graceful poster-only fallback.
- Deterministic text scrim so contrast does not depend on moving footage.
- No essential copy baked into video.
- Hashed asset name and long-lived cache headers in production.
- Do not block first paint on video decoding.
- Pause when not visible if that reduces resource use without causing a visible restart problem.
- Test actual iOS Safari, Android Chrome, macOS Safari/Chrome, and Windows Chrome/Edge.

If a new approved hero asset does not exist, implement the media component and poster/scrim system using the best approved source without fabricating or upscaling a final asset. Clearly document the asset blocker.

### 5.2 Consortium marks

Replace plain partner-name typography with approved partner marks when assets and permission exist.

Rules:

- Use SVG where available.
- Normalize by optical height.
- Initial monochrome treatment.
- Color reveal only on focus/hover when brand guidelines allow.
- Each mark requires an accessible name.
- Do not continuously animate the strip.
- Do not invent or download unapproved marks.
- If assets are missing, preserve names in a deliberately designed consortium lockup and document the required artwork.

### 5.3 Typography and contrast

Build an eight-step type system:

- Display 1.
- Display 2.
- Display 3.
- Body large.
- Body.
- Body small.
- Label.
- Micro.

Requirements:

- Use `rem`.
- Minimum equivalent of 11px for micro labels; prefer 12px.
- Lower mobile headline floors so words do not collapse into unusable stacks.
- Long-form copy width approximately 65–75 characters.
- Validate all text/background combinations.
- Normal text contrast at least 4.5:1.
- Labels over dark backgrounds must remain readable.
- A moving image may not be the only contrast control.

The supplied `quantum-signal.css` provides a useful reference scale. Adapt it to the existing design system; do not blindly duplicate tokens.

### 5.4 Interaction fundamentals

- Add a skip link.
- Ensure visible `:focus-visible` for all interactive elements.
- Expand undersized controls to practical hit areas.
- Correct missing/inconsistent tab states.
- Guard hover-only styling behind hover-capability media queries.
- Ensure touch, keyboard, and pointer interaction parity.
- Fix the 861–1100px layout gap or its current equivalent.
- Prefer component/container-aware layout where it produces a simpler and more resilient result.

### 5.5 Metadata and structured data

When the production domain and legal entity details are available:

- Add canonical URLs.
- Add appropriate Organization structured data.
- Add BreadcrumbList where routes warrant it.
- Add suitable structured data for case-study/editorial content only when semantically accurate.
- Do not invent legal names, addresses, relationships, or social profiles.

## 6. Design system

### 6.1 Color semantics

Use existing brand ramps where possible.

Recommended roles:

- `live`: Quantum magenta.
- `live-soft`: pale magenta.
- `proven`: existing teal.
- `proven-soft`: pale teal.
- `active-warning`: amber, only when needed.
- `stage`: graphite/carbon.
- `paper`: warm off-white.
- `ink`: primary copy.
- `quiet`: secondary copy that still passes contrast.
- `rule`: fine dividers and inactive signal tracks.

State examples:

- `LIVE NEED`
- `SCOUTING`
- `FIELD TEST ACTIVE`
- `EVIDENCE REVIEW`
- `COMMERCIAL OUTCOME`
- `USEFUL NO`

Every state combines text or iconography with color.

### 6.2 Typography

Preferred character:

- Display grotesk for major statements.
- Highly legible humanist or neo-grotesk body face.
- Monospace for technical metadata only.

Do not:

- Render body copy in monospace.
- Use many nearly identical heading sizes.
- split letters in semantic text.
- overuse the current separated "i" treatment.

The "signal-letter" effect may appear only at key brand moments and must preserve a correct accessible label.

### 6.3 Layout

- Strong 12-column desktop grid where appropriate.
- Deliberate asymmetry.
- Large chapter spacing.
- Alternating technical density and quiet editorial space.
- Full-bleed media only where it adds evidence or atmosphere.
- Avoid repetitive eyebrow-heading-paragraph-card modules.
- Give each major chapter distinct spatial behavior while using shared tokens.

### 6.4 Surface and texture

Allowed:

- Fine grids.
- Measurement ticks.
- Diagnostic overlays.
- Subtle grain.
- Restrained depth.
- Hairline borders.
- Real photography.
- Technical illustrations.

Avoid:

- Heavy glassmorphism.
- large soft shadows everywhere.
- chrome or liquid-metal decoration.
- meaningless wireframes.
- excessive gradient fog.

## 7. Motion system

### 7.1 Two tempos

Interface motion:

- Approximately 140–260ms.
- Buttons, navigation, filters, focus/hover feedback, accordion state.

Narrative motion:

- Approximately 600–1200ms.
- Chapter transitions, signal resolution, diagrams, evidence reveal.
- Use 60–80ms line or element stagger where it adds hierarchy.

Use a consistent, deliberate decelerating curve. Preserve an existing good curve if present.

### 7.2 Motion vocabulary

Every animation must represent at least one:

- Search.
- Alignment.
- Measurement.
- Validation.
- Resolution.
- Propagation.

### 7.3 Motion rules

- Native scroll only.
- Reversible when scroll-driven.
- No mandatory wait.
- No essential information revealed only after animation.
- No continuous motion without informational value.
- No autoplay sound.
- No animation of every word or card.
- Hover effects require touch and keyboard equivalents.
- Mobile motion amplitude and complexity are lower.
- `will-change` only while actively needed.
- Use transform/opacity where possible.
- Avoid continuous layout reads.

### 7.4 Line reveals

Display headings may reveal line-by-line.

Implementation constraints:

- Preserve words.
- Preserve accessible text.
- Recompute after fonts load and at relevant resize points.
- Do not cause visible layout shift.
- Reduced motion renders the final state immediately.

### 7.5 Reduced motion

Under `prefers-reduced-motion: reduce`:

- The signal renders complete or as a static resolved diagram.
- Sticky sequences become ordinary vertical sections or static panels.
- Spatial movement becomes crossfade or immediate state.
- The match instrument resolves without sweeping motion.
- The evidence ledger displays final states.
- No information disappears.
- No huge blank scroll budgets remain.

## 8. Homepage experience

### 8.1 Scene 1 — Hero: the operational signal

Objective: explain the company within seconds and route both audiences.

Required content hierarchy:

1. Concise positioning statement.
2. Supporting sentence.
3. Audience choice:
   - `I have a technology`
   - `I have an operational need`
4. Contextual primary CTA.
5. Scroll cue only if it remains legible and useful.

Visual behavior:

- Real, crisp field footage is preferred for the first implementation.
- A thin unstable signal may enter or resolve through the scene.
- Pointer movement may subtly affect sampling position on pointer-capable devices.
- Do not create a cursor follower.
- Text remains stable and readable.
- Use a deterministic scrim.

Audience state:

- Accessible segmented control, radio group, or equivalent.
- Reversible.
- Does not block browsing.
- May persist in `sessionStorage`.
- Must not create privacy-sensitive profiling.
- Must not hide essential content.
- Updates CTA labels and later emphasis.

Startup CTA examples:

- `Check startup fit`
- `Introduce your technology`
- `Apply to SPARK`

Industry CTA examples:

- `Bring a challenge`
- `Scope a field POC`
- `Book a working session`

Use existing approved wording where available.

### 8.2 Scene 2 — Consortium network

Objective: immediate credibility.

At rest:

- Approved marks or designed name lockups.
- Four consortium members.
- Short statement of what the shared network enables.

On focus/hover:

- Relevant sectors.
- Associated proof count only when supported by data.
- Concise relationship description.

Animation:

- Restrained network response.
- No continuous marquee.
- No overclaiming of relationships.

### 8.3 Scene 3 — Evidence metrics

Transform counters into evidence objects.

Each metric should include:

- Number.
- Label.
- Definition or context where ambiguity exists.
- Source or data date where operationally appropriate.

Counters may animate once when visible, but:

- The final value is present in the DOM.
- Reduced motion shows it immediately.
- Do not animate from misleading intermediate values for long periods.
- Do not fabricate or update figures.

### 8.4 Scene 4 — "A matchmaker with a workshop"

Objective: show how Quantum-Hub bridges two worlds.

Composition:

- One side: operational site, constraint, owner, environment.
- Other side: startup, deployable product, capability, field support.
- Center: Quantum-Hub translation layer.

Scroll behavior:

- Initially misaligned vocabulary and constraints.
- Need framing, scouting, criteria, test design, and evidence progressively align both sides.
- End in one test configuration.

Fallback:

- Static annotated diagram.
- All labels in DOM.
- No drag-only interaction.

### 8.5 Scene 5 — The five-stage route

This is the homepage centerpiece.

Stages:

1. Operational need.
2. Global scouting.
3. Partner match.
4. Field POC.
5. Scale what works.

Desktop:

- Five sticky viewport chapters or an equivalent pinned narrative.
- Copy and diagram share the frame.
- One signal path connects stages.
- Each stage has a distinct, meaningful diagram.
- Scroll budget must be tested; do not default blindly to 220vh per panel.
- Avoid fatigue. Prefer the shortest duration that allows comprehension.

Mobile:

- Retain one chapter at a time.
- Sticky only where content height and browser behavior are safe.
- Fall back to vertical chapters if required.
- Never disable the narrative entirely.
- Provide chapter controls with 44px practical targets.

Stage diagrams:

**Operational need**
- A boundary or tolerance closes around a constraint.
- Communicate the unknown.

**Global scouting**
- A scan crosses a field of candidates.
- Most candidates recede; a small number remain.
- Do not imply a specific database size unless supported.

**Partner match**
- Capability, site, owners, value case, and constraints align.
- Misaligned candidates drop away.

**Field POC**
- A test matrix appears.
- Conditions, instruments, success criteria, and evidence accumulate.

**Scale what works**
- Branch visibly:
  - Roll out.
  - Reconfigure/retest.
  - Useful no.
- Treat a useful no as a credible result, not a failure animation.

Implementation:

- Prefer a procedurally generated responsive SVG path through section anchors.
- The path must regenerate on resize/layout changes.
- Primary content sits above the path.
- If JavaScript drives progress, use one scheduled frame and avoid multiple scroll listeners.
- If CSS scroll timelines fit the browser support policy, progressively enhance.
- Ensure print/no-JS/static states are coherent.

### 8.6 Scene 6 — Industries and Live Needs Exchange

Objective: demonstrate relevant demand.

Core data model:

- `id`
- `title`
- `status`
- `sector`
- `capabilityTags`
- `environment`
- `constraint`
- `readiness`
- `desiredEvidence`
- `geography` when approved
- `closingOrReviewDate` when approved
- `confidentialityLevel`
- `ctaRoute`

UI:

- Sector and capability filtering.
- Accessible controls.
- Need cards with concrete constraints and readiness.
- Direct action: `My product could fit`.
- Deep-linkable filtered state where practical.

Confidentiality:

- Use real needs only when approved.
- Otherwise call the module `Representative operational challenges`.
- Do not imply availability, deadline, partner, or location without approved data.
- Keep partner/site names anonymized when required.

Cross-sector systems map:

- Show capability transfer across automotive, logistics, Industry 4.0, and energy.
- Examples must be grounded in approved content.

### 8.7 Scene 7 — Need-to-match instrument

Objective: let a founder experience Quantum-Hub's matching logic.

Input:

- Select technology/capability.
- Select sector.
- Select readiness.
- Optional concise description.
- Do not collect unnecessary personal data before showing a useful result.

Output:

- Relevant operational challenge category.
- Likely test environment.
- Evidence a POC would need.
- Appropriate route:
  - SPARK.
  - Agile/ongoing track.
  - Not yet field-ready.

Required states:

- Idle.
- Selected.
- Scanning.
- Matched.
- No clear match.
- Error/fallback.
- Reduced motion.

Rules:

- Matching logic must be transparent and data-driven.
- Do not pretend an algorithm found a real partner fit if the data is illustrative.
- Clearly label illustrative results.
- Provide a useful result even when no fit exists.
- Results remain keyboard and screen-reader accessible.
- Scan animation lasts no longer than needed.
- Final data is ordinary DOM content.

### 8.8 Scene 8 — Evidence ledger

Objective: convert case studies into institutional proof.

Case-study schema:

- Company.
- Partner where approved.
- Sector.
- The unknown.
- Operational environment.
- Proposed technology.
- Test design.
- Success criteria.
- Duration.
- Scenarios/environments.
- Evidence generated.
- Decision.
- Commercial outcome.
- Current status.
- Related media.
- Date.
- Confidentiality status.

Index behavior:

- Filter by sector, technology, partner, outcome, test location, program, and commercial status when data supports it.
- Strong editorial hierarchy; not all cases are equal.
- Rows/cards may resolve from magenta live state to teal proven state as the outcome appears.
- Include at least the product capability to represent:
  - commercialized,
  - partnership signed,
  - units ordered,
  - further testing,
  - useful no,
  - confidential result.
- Do not invent a useful-no case. Build the state and publish only approved evidence.

Detailed evidence page structure:

1. The unknown.
2. Environment.
3. Technology.
4. Test design.
5. Success criteria.
6. What happened.
7. What the evidence changed.
8. Commercial decision.
9. What happened next.

Media:

- 20–40 second silent clips where approved.
- Captions/transcripts for substantive media.
- Poster and static fallback.

### 8.9 Scene 9 — SPARK runway

Objective: make the program concrete and reduce startup uncertainty.

Show:

- Current program status.
- Eligibility.
- Equity-free/no participation fee claims only when current and approved.
- Application steps.
- Owner and decision at each gate.
- Startup obligations.
- Typical duration where approved.
- Stop conditions.
- What happens after each stage.
- Difference between SPARK and any ongoing/Agile track.

Runway stages:

1. Application.
2. Fit review.
3. Partner selection.
4. POC scoping.
5. Field execution.
6. Decision and next step.

Do not present fixed dates or cohort state unless sourced from approved data.

### 8.10 Scene 10 — POC playground / flagship test platform

Objective: show operational capability in a memorable way.

Preferred first flagship: the Kia EV6 or the existing approved testing platform.

Experience:

- Technical silhouette or high-quality image first.
- Hotspots reveal approved sensor positions, data/power integration, routes, test conditions, safety, and evidence collection.
- Transition between illustration and real field media where approved.
- Hotspots are buttons with accessible names and DOM descriptions.
- Keyboard sequence is logical.
- Touch uses tap-to-open.
- Static annotated fallback.
- Reduced motion uses immediate state changes.

Technology choice:

- Start with SVG/CSS or pseudo-3D if sufficient.
- Use WebGL/Three.js only when it materially improves the experience.
- Lazy-load.
- Do not put it on the initial critical path.
- Dispose of GPU resources.
- Provide low-power/mobile fallback.
- Keep all meaningful information outside the canvas too.

### 8.11 Scene 11 — Audience-aware closing conversion

Startup state:

- `Your technology may already match a need in the network.`
- `Check my fit`
- `Introduce my technology`
- `Apply to SPARK`

Industry state:

- `Turn one operational unknown into a measurable test.`
- `Bring a challenge`
- `Tour the POC center`
- `Book a scoping call`

The signal should complete or stabilize here.

Use approved copy; the examples above are direction, not mandatory wording.

## 9. Other routes

### 9.1 For Startups

Required modules:

- Relevant access.
- Real POC.
- Expert support.
- Continued relevance/alumni.
- Live or representative needs.
- Eligibility checker.
- Typical timeline where approved.
- Selection criteria.
- Startup effort.
- IP/confidentiality summary.
- Field-support expectations.
- Decision-maker involvement.
- Outcomes and testimonials only when approved.
- What happens after application.
- Current program state.

Use a factual before/after comparison where useful:

Without an orchestrated POC:
- Unclear owner.
- Demo without criteria.
- Procurement ambiguity.
- No real environment.

With Quantum-Hub:
- Defined owner.
- Measurable POC.
- Operating site.
- Evidence-based decision.

Avoid adversarial or exaggerated claims.

### 9.2 SPARK

- Use `Apply` consistently unless product terminology requires another verb.
- Publish status from data/config.
- Estimated application time.
- Review timing when approved.
- SPARK vs ongoing track comparison.
- Startup logos/outcomes only when approved.
- One-page program summary only when content exists.
- Application checklist.
- Move critical FAQ answers into the decision journey rather than hiding all context at the bottom.

### 9.3 SPARK application

Keep the form concise.

Recommended behavior:

- Single-page adaptive form unless user testing proves a wizard is better.
- Initial readiness questions tailor later fields.
- Explicit labels.
- Inline examples.
- Clear privacy statement.
- Response expectation.
- Save/return only if technically and legally supported.
- Optional deck upload only if required.
- Submission receipt with next steps.
- Fit checker pre-fills compatible fields.
- Do not request unnecessary data before basic fit.

Validate client and server side. Preserve accessible error summaries and field-level errors.

### 9.4 POCs

Make this the methodological authority.

Modules:

- What a POC buys: information.
- Risk isolation.
- Success criteria.
- Test matrix.
- Roles and accountability.
- Timeline.
- Instrumentation.
- Data and confidentiality.
- Safety and site readiness.
- Go/no-go framework.
- Example report preview.
- Facility imagery/tour when approved.
- Downloadable method only if a maintained asset exists.

### 9.5 Industries

- Show four sector domains.
- Add capability transfer across sectors.
- Attach approved needs and evidence.
- Avoid four generic repeated cards.
- Use a systems map or connected capability view.
- Ensure all interaction works without hover.

### 9.6 About

Add only with approved material:

- Origin and timeline.
- Why the consortium formed.
- Facility imagery.
- Partner operating environment map.
- Leadership portraits.
- Role-specific expertise.
- Decision principles.
- Press/external recognition.
- LinkedIn links.

No novelty portrait effects.

### 9.7 Updates / Field Journal

Each entry should support:

- Date.
- Location when approved.
- Category.
- Media.
- Related company/partner.
- Related case.
- Shareable URL.
- Short takeaway.

Categories may include:

- Field note.
- Program.
- Partnership.
- Test completed.
- Commercial outcome.
- Event.
- Open need.

### 9.8 Contact

First route intent:

- I have a technology.
- I have an operational need.
- Partnership.
- Media/general.

Then adapt fields and prompt.

Add:

- Response expectation.
- Location when approved.
- Privacy statement.
- Accessible status feedback.
- Useful success state.
- No unnecessary fields.

### 9.9 Footer

Add when content/legal approval exists:

- Privacy.
- Terms.
- Accessibility statement.
- Cookie preferences where required.
- Legal company relationship.
- Office/location.
- General email.
- Program status.
- LinkedIn.
- Field-journal subscription.

The signal should conclude here without compromising usability.

## 10. Data architecture

Create centralized structured content for:

- Partners.
- Metrics.
- Audience CTAs.
- Process stages.
- Sectors.
- Needs.
- Case studies.
- Outcomes.
- SPARK status and stages.
- Team.
- Updates.
- Contact intents.

Benefits:

- Prevent inconsistent copy.
- Support audience personalization.
- Support filtering.
- Prepare for CMS/API migration.
- Prevent hard-coded facts in animations.
- Make test fixtures easy.

Do not introduce a CMS unless requested or already present.

## 11. Component architecture

Exact file paths depend on the repository. Prefer components equivalent to:

- `AudienceSelector`
- `SignalLayer`
- `SignalNarrative`
- `SignalPanel`
- `ConsortiumNetwork`
- `EvidenceMetric`
- `MatchmakerDiagram`
- `NeedsExchange`
- `MatchInstrument`
- `EvidenceLedger`
- `EvidenceCard`
- `SparkRunway`
- `PocPlatform`
- `ContextualCTA`
- `ReducedMotionProvider` or an equivalent hook/utility

Do not over-componentize individual spans or decorative fragments.

Animation orchestration should remain separate from content data.

## 12. Technical implementation guidance

### 12.1 Signal path

Preferred structure:

- One SVG layer scoped to the relevant narrative container, not necessarily the entire document if route/layout constraints make that brittle.
- Section/panel anchors declare waypoint positions.
- Generate a smooth path through current anchors.
- Recalculate after layout-affecting events:
  - viewport resize,
  - font readiness,
  - dynamic content changes,
  - orientation change.
- Debounce structural recalculation.
- Update draw progress within animation frames.
- Keep content above the layer.
- Ensure opaque sticky panels do not hide it unintentionally.

Do not use a fixed hand-authored `d` path across responsive widths.

### 12.2 Sticky panels

- Measure actual content.
- Test short and tall mobile viewports.
- Do not allow essential copy to become inaccessible inside an overflowing sticky frame.
- Avoid five identical 220vh panels without testing.
- Reduced motion removes excessive scroll budgets.
- Preserve browser back/forward and anchor behavior.

### 12.3 Animation library decision

Use this order:

1. Native CSS transitions/animations.
2. CSS scroll timelines if compatible with support policy and progressive enhancement.
3. Existing project animation utilities.
4. A focused library already present.
5. Add GSAP/other library only if the complexity justifies its cost.
6. Add Three.js only for the flagship scene if a 2D approach cannot reach the intended quality.

Document any new dependency and bundle impact.

### 12.4 Browser and device matrix

At minimum test:

- Current Chrome.
- Current Safari.
- Current Firefox.
- Current Edge.
- iOS Safari.
- Android Chrome.

Widths:

- 360.
- 390.
- 501.
- 768.
- 890.
- 1024.
- 1100.
- 1280.
- 1440+.

Test:

- Short laptop height.
- Landscape tablet.
- Dynamic mobile browser bars.
- Touch and pointer.
- 200% zoom.
- Increased browser default font size.
- Reduced motion.
- High contrast/forced colors where practical.

### 12.5 No-JavaScript and failure handling

Without JavaScript:

- Primary content is visible.
- Links and forms remain usable where architecture permits.
- Story panels render in a logical order.
- Signal diagrams may be static.
- No huge empty scroll regions.
- No content remains permanently opacity zero.

If interactive data fails:

- Show clear fallback.
- Preserve route to contact/application.
- Do not fake results.

## 13. Accessibility acceptance criteria

- One logical `h1` per page.
- Headings do not skip levels without reason.
- All page regions have useful landmarks.
- Skip link works.
- Focus is visible and not hidden by sticky headers.
- All tabs use correct roles/states or simpler button patterns.
- All dialogs/popovers manage focus correctly.
- All primary controls have practical hit areas.
- All form errors are announced and linked.
- All status changes are available to assistive technology.
- All meaningful animation has a reduced-motion equivalent.
- No flash or rapid luminance changes.
- Videos have controls when substantive.
- Autoplay decorative video is muted and can be paused where required.
- Canvas/WebGL has an equivalent description and controls.
- Text resizing does not clip or overlap.
- Color contrast passes.
- State does not rely on color.
- The audience selection is clearly announced and reversible.

Run automated accessibility checks, then perform keyboard and screen-reader spot checks. Automated checks are not sufficient by themselves.

## 14. Performance acceptance criteria

- Production build succeeds.
- No new runtime errors.
- Initial critical JavaScript does not include the flagship 3D package.
- Hero media does not dominate LCP with an oversized or long source.
- Layout dimensions are reserved.
- Animation does not trigger sustained main-thread jank.
- Scroll sequences remain responsive on mid-range mobile hardware.
- Lazy-loaded sections have stable placeholders.
- Route navigation remains fast.
- Bundle changes are reported.
- Lighthouse/local audits are comparative, not treated as real-user data.
- Where RUM exists, preserve or improve LCP, INP, and CLS targets.

## 15. Analytics events

Use the existing analytics system. Do not add a vendor without approval.

Recommended event schema:

- `audience_selected`
- `startup_fit_started`
- `startup_fit_completed`
- `need_filter_changed`
- `need_opened`
- `need_fit_clicked`
- `match_started`
- `match_completed`
- `case_opened`
- `evidence_filter_changed`
- `spark_apply_started`
- `spark_apply_completed`
- `challenge_started`
- `challenge_submitted`
- `poc_platform_interacted`
- `story_stage_reached`

Do not send sensitive free-text descriptions or personal data to analytics.

## 16. Testing requirements

Use repository tools where available.

Required categories:

- Unit tests for data mapping and matching logic.
- Component tests for audience selection, tabs, filters, forms, and state labels.
- Integration tests for application/contact flow.
- End-to-end smoke tests for primary routes.
- Keyboard tests for interactive sections.
- Reduced-motion tests.
- Visual regression at representative widths if tooling exists.
- Animation fallback tests.
- Build, type-check, and lint.
- Console-error checks.
- Link validation where feasible.

Do not make tests brittle by asserting exact animation frame timing.

## 17. Implementation phases

### Phase 0 — Repository discovery and plan

Deliver:

- Current architecture summary.
- Baseline issues revalidated.
- Proposed file map.
- Dependency decision.
- Data model.
- Risk register.
- Test plan.
- Asset/content blockers.
- Ordered implementation plan.

Do not change production code in this phase unless explicitly instructed.

### Phase 1 — P0 credibility and accessibility

Implement:

- Hero media component/fallback/scrim.
- Partner-mark component or approved fallback.
- Typography floors and contrast.
- Focus, skip link, touch targets, hover guards.
- Mobile headline and intermediate layout fixes.
- Metadata scaffolding where facts exist.

Acceptance:

- No regression to content or routes.
- Automated and manual accessibility spot checks.
- Production build passes.

### Phase 2 — Design and motion foundation

Implement:

- Rationalized tokens.
- Semantic live/proven states.
- Two-tempo motion.
- Line reveals.
- Reduced-motion foundation.
- Shared responsive utilities.

Acceptance:

- Existing modules visually migrate without a full rewrite.
- No content hidden before JS.
- Motion tokens replace ad-hoc values in touched components.

### Phase 3 — Homepage signal narrative

Implement:

- Audience selector.
- Signal layer.
- Consortium/evidence improvements.
- Matchmaker workshop scene.
- Five-stage story.
- Mobile and reduced-motion versions.
- Contextual CTA state.

Acceptance:

- Story works at all target widths.
- Keyboard/touch parity.
- No scroll hijacking.
- Performance profile shows no sustained jank.

### Phase 4 — Needs and evidence conversion

Implement:

- Needs data model and exchange.
- Match instrument.
- Evidence ledger.
- Case-study schema/template upgrades.
- Startup fit routing.
- Analytics events.

Acceptance:

- No fabricated data.
- Illustrative data clearly labeled.
- Deep links and state restoration where practical.
- Matching logic tested.

### Phase 5 — SPARK, POCs, forms, and supporting routes

Implement:

- SPARK runway.
- Startup page improvements.
- POC methodology page.
- Industries systems map.
- Contact routing.
- Application form enhancements.
- About/updates/footer improvements where approved content exists.

Acceptance:

- Forms remain secure and accessible.
- Content gaps are documented rather than invented.
- Route-level SEO and navigation consistency.

### Phase 6 — Flagship POC platform

Implement:

- SVG/pseudo-3D or WebGL scene according to approved technical plan.
- Approved hotspots and media.
- Lazy loading.
- Static/mobile/reduced-motion fallback.
- Cleanup and error handling.

Acceptance:

- Not on critical path.
- Useful without WebGL.
- No inaccessible canvas-only content.
- No severe battery or frame-rate regression.

### Phase 7 — Hardening and launch review

Deliver:

- Cross-browser/device QA.
- Accessibility audit.
- Performance comparison.
- Visual regression review.
- Content/fact verification.
- Broken-link and form checks.
- Final change log.
- Known limitations.
- Deployment and rollback notes.

## 18. Final visual quality checklist

The final result should answer yes to all:

- Does the first viewport look crisp and credible?
- Are the four consortium members immediately recognizable?
- Can a new visitor explain Quantum-Hub after one screen?
- Does a startup see a relevant path without searching?
- Does the page visually show uncertainty becoming evidence?
- Is the five-stage route the clear centerpiece?
- Is there one memorable interaction rather than many gimmicks?
- Does proof feel specific and commercial?
- Are useful-no outcomes treated honestly?
- Does mobile retain the complete story?
- Does reduced motion feel designed?
- Are quiet sections present so the spectacle has contrast?
- Does every animation carry meaning?
- Is every claim sourced from approved content?
- Is the site still fast and usable on ordinary hardware?
- Does the experience feel serious enough for industrial executives and innovative enough for ambitious founders?

## 19. Completion report format

For each phase, report:

### Implemented
- Feature and behavior.
- Files changed.

### Verified
- Commands run.
- Tests and outcomes.
- Routes and widths checked.
- Accessibility checks.
- Performance/bundle observations.

### Decisions
- New dependencies.
- Tradeoffs.
- Deviations from specification.
- Confidence for each deviation.

### Blockers
- Missing assets.
- Missing approved content.
- External-service requirements.
- Items deferred and why.

### Next recommended phase
- Exact scope.
- Risks.
- Prerequisites.
