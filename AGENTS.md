# AGENTS.md — Quantum-Hub Website

## Mission

Build and maintain the Quantum-Hub website as a premium, evidence-driven digital experience for a serious industrial innovation company.

The website must do two things exceptionally well:

1. Explain Quantum-Hub's role clearly to startups, industrial partners, and other interested parties.
2. Convince field-ready startups that Quantum-Hub can connect them to real operational needs, real test environments, internal decision-makers, and evidence-based commercial outcomes.

The experience should feel innovative, technically credible, controlled, and memorable. It must never feel like generic "future tech," a crypto site, a gaming site, a venture-capital template, or an effects demo.

The governing narrative is:

> An operational need appears. A signal is detected. Relevant technologies converge. A field test is designed. Evidence is generated. A decision is made. What works scales.

## Required reading before editing

Before changing code, read:

1. `docs/QUANTUM_HUB_REDESIGN_SPEC.md`
2. `docs/reference/quantum-hub-design-audit.md`
3. `docs/reference/quantum-signal.css`
4. `docs/reference/README-integration.md`
5. The existing repository README, package manifest, build configuration, routes, design tokens, and tests.

Do not use, inspect, reference, copy, or derive decisions from any file named `quantum-prototype`, `Quantum Prototype`, or equivalent. It is explicitly out of scope.

## Source hierarchy and change control

Use this priority order:

1. The user's current direct instruction.
2. This `AGENTS.md`.
3. `docs/QUANTUM_HUB_REDESIGN_SPEC.md`.
4. Existing approved site content, routes, facts, assets, and business logic.
5. The supplied audit and CSS as supporting evidence and implementation reference.

The supplied audit and CSS validate and refine the direction; they do not replace it. Do not deviate from the redesign specification because a reference file suggests a different approach unless all of the following are true:

- The alternative is objectively better for usability, accessibility, performance, maintainability, or conversion.
- It preserves the strategic intent.
- You are at least 0.95 confident it is beneficial.
- You document the deviation, the evidence, the tradeoff, and your confidence in the completion report.

When confidence is below 0.95, follow the specification.

## Core design invariants

These are non-negotiable:

- Preserve the existing information architecture wherever it is sound. Improve expression before restructuring.
- Use one coherent visual and motion language: the **Quantum Signal**.
- The signal represents uncertainty becoming evidence. It is not decorative.
- Magenta represents live, unresolved, scouting, or in-test states.
- Teal represents proven, signed, commercialized, or in-production states.
- Never communicate state by color alone.
- Real industrial environments, field testing, instruments, measurements, and evidence take precedence over abstract futuristic imagery.
- Use spectacle selectively. One deeply integrated flagship interaction is better than many unrelated effects.
- Keep native scrolling. Never hijack the wheel or trap the visitor in a scroll sequence.
- Maintain full meaning without animation, JavaScript, hover, or WebGL.
- Design the reduced-motion path as a complete experience, not a disabled version.
- Mobile receives the same narrative and conversion value as desktop.
- Do not fabricate metrics, current needs, partner claims, testimonials, case-study results, program dates, locations, or commercial outcomes.
- Do not invent partner logos or use unapproved brand assets.
- Do not use placeholder lorem ipsum in final UI.
- Do not rewrite approved business copy without a clear reason. Correct consistency, hierarchy, or accessibility issues while preserving meaning.
- Do not add dependencies when native platform capabilities or the existing stack can solve the problem reliably.

## Visual direction

The preferred character is **industrial future**, not generic future tech.

Use:

- Graphite/carbon stages and warm off-white editorial sections.
- Precise rules, fine grids, measurement ticks, diagnostic overlays, and restrained technical metadata.
- Existing Quantum-Hub magenta as the live signal accent.
- Existing teal as the proven/evidence accent.
- Real photography and video from POCs, partner environments, equipment, and field tests.
- Large, controlled display typography with readable body typography.
- Monospaced text only for technical labels, states, IDs, measurements, and metadata.
- Intentional asymmetry and generous quiet space.
- Alternation between dense technical scenes and calm editorial chapters.

Avoid:

- Particle clouds without meaning.
- Space, quantum-computing, circuit-board, cryptocurrency, or cyberpunk imagery.
- Excess neon, glassmorphism, chrome blobs, floating spheres, cursor trails, or decorative data streams.
- Permanent custom cursors.
- Aggressive card tilt, magnetic-button gimmicks, or constant parallax.
- Endless logo marquees.
- Unreadable kinetic typography.
- Animating every word, letter, card, or section.
- Autoplay audio.
- Mandatory loaders or intro sequences.
- Essential text inside video, canvas, or WebGL only.

## Engineering workflow

For every substantial task:

1. Inspect the relevant code before proposing changes.
2. Identify the framework, routing, state management, styling approach, testing tools, package manager, and deployment target from the repository. Do not assume them.
3. Run the current site and capture the baseline:
   - Build status.
   - Tests, type checks, and lint status.
   - Key routes.
   - Browser console errors.
   - Current responsive behavior.
   - Current Core Web Vitals or local performance indicators when tooling permits.
4. Write a concise implementation plan with file-level changes and acceptance criteria.
5. Make changes in small, reviewable slices.
6. Reuse existing tokens and components where sound.
7. Run all available checks after each slice.
8. Verify desktop, intermediate widths, mobile, keyboard use, touch behavior, reduced motion, and no-JavaScript rendering where feasible.
9. Review the final diff against this file and the redesign specification.
10. Report:
    - Files changed.
    - Behavior implemented.
    - Tests run and results.
    - Performance or accessibility impact.
    - Remaining asset/content blockers.
    - Any deviations and confidence.

Do not perform a broad rewrite before understanding the current architecture.

## Code quality

- Keep components cohesive and small enough to reason about.
- Prefer semantic HTML and progressive enhancement.
- Keep primary content in the DOM.
- Use CSS custom properties for design and motion tokens.
- Use data attributes or component props for state, not presentation-specific DOM scraping.
- Keep animation state deterministic and reversible.
- Avoid reading layout continuously in scroll handlers.
- If JavaScript drives scroll progress, batch reads/writes in `requestAnimationFrame`.
- Use `IntersectionObserver`, CSS scroll timelines, or a proven existing project utility where appropriate.
- Clean up observers, listeners, animation frames, media queries, and WebGL resources.
- Do not leave dead code, duplicate styles, console logs, or commented-out experiments.
- Do not add a large animation library for one small effect.
- If a new dependency is justified, document bundle impact and why the existing stack/native APIs are insufficient.
- Respect the repository's naming, formatting, import, and testing conventions.

## Accessibility baseline

Target WCAG 2.2 AA at minimum.

Required:

- Semantic headings and landmarks.
- Skip link.
- Logical source and focus order.
- Visible focus for all interactive elements.
- Full keyboard operation.
- Touch targets at least 24×24 CSS pixels; prefer 44×44 for primary controls.
- Text contrast of at least 4.5:1 for normal text.
- Non-text contrast where applicable.
- No status conveyed by color alone.
- Captions and meaningful poster images for video.
- Alternative text based on purpose.
- Hover content also available by focus and touch.
- No sticky tap hover states; guard hover effects with `(hover: hover) and (pointer: fine)`.
- Respect `prefers-reduced-motion`.
- Reduced motion retains all content and state, using resolved diagrams, crossfades, or static annotations.
- Do not split accessible heading text into malformed words. Visual line wrappers must preserve a clean accessible name.
- Forms require explicit labels, useful errors, status announcements, and focus management.
- Any canvas/WebGL scene needs an equivalent DOM or annotated-image representation.

## Performance baseline

Target at the 75th percentile where real-user monitoring exists:

- LCP ≤ 2.5 s.
- INP ≤ 200 ms.
- CLS ≤ 0.1.

Project guardrails:

- Do not place a heavy 3D or animation library on the critical path.
- Lazy-load noncritical interactive scenes near the viewport.
- Keep the hero crisp and intentionally authored.
- Use a short dedicated hero loop, not a multi-minute recycled video.
- Supply a full-resolution poster.
- Reserve media dimensions.
- Use responsive AVIF/WebP images where appropriate.
- Use AV1/WebM with H.264 fallback for video when the pipeline supports it.
- Animate `transform` and `opacity` where possible.
- Avoid persistent `will-change`.
- Keep meaningful content server-rendered or statically rendered.
- The site must remain useful when JavaScript fails.
- Use hashed, long-lived cached media in production where the build/deployment platform supports it.

## Content and confidentiality

- Existing approved copy and facts are the source of truth.
- For the proposed Live Needs Exchange or match instrument, use approved real needs only.
- If approved live needs are unavailable, label examples as `Representative challenge` or `Illustrative match`; never imply they are active opportunities.
- Do not expose confidential partner constraints, site details, internal owners, or test data.
- Put mutable needs, case studies, metrics, partners, program status, and outcomes into structured data/configuration rather than hard-coding them across components.
- Keep the UI ready for future CMS or API integration without requiring it now.

## Required experience architecture

The homepage should retain and elevate this narrative:

1. Hero: operational signal and clear value proposition.
2. Consortium credibility.
3. Evidence metrics.
4. "Matchmaker with a workshop" explanation.
5. Five-stage signal-to-proof narrative.
6. Industries and/or needs matching.
7. Evidence ledger and case studies.
8. SPARK runway and startup fit.
9. POC playground / testing platform.
10. Audience-aware closing conversion.

The primary audience choice is:

- `I have a technology`
- `I have an operational need`

The choice must be accessible, reversible, and non-blocking. It may personalize CTA labels, proof ordering, FAQ ordering, and the final conversion module. Do not hide essential information based on the choice.

## Definition of done

A change is not complete because it looks impressive in one desktop viewport.

It is complete when:

- The intended story is clearer than before.
- The interaction communicates business meaning.
- Desktop, tablet/intermediate, and mobile layouts are deliberate.
- Keyboard, touch, reduced-motion, and no-motion paths work.
- Existing routes and business logic remain intact.
- All available tests, linting, type checks, and builds pass.
- No new console errors appear.
- No factual claims were invented.
- Performance remains within the specified guardrails or regressions are measured and justified.
- The final diff is reviewed against the acceptance criteria in `docs/QUANTUM_HUB_REDESIGN_SPEC.md`.
