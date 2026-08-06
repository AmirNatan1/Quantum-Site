# Quantum-hub — Design, Motion & Interaction Audit

**Subject:** https://quantum-site-e4b.pages.dev/
**Date:** 3 August 2026
**Scope:** Visual design, typography, motion, interaction, responsive behaviour, accessibility, delivery. Content strategy only where it affects design decisions.

---

## 1. Verdict

The site is **well-built and badly under-dramatised.**

The information architecture is genuinely strong. The section order — hero → partners → metrics → who we are → five-step route → statement → sectors → proof → SPARK → playground → CTA — is already a story spine. Most companies at this stage don't have that. The design tokens are disciplined: a complete ink ramp (950→25), a magenta ramp, a teal ramp, three deliberate typefaces, a custom easing curve. The semantics are better than most agency output: one `h1`, sane heading order, real `role="tablist"`/`tabpanel` wiring, `aria-label` on every step control.

And yet it does not read as an impressive site. It reads as a *tidy* site. The gap between those two things is almost entirely motion and craft, not structure.

The measured evidence for that claim:

| Signal | Measured | What it means |
|---|---|---|
| `@keyframes` blocks on the page | **3** (`travel`, `orbit`, `scan`) | Effectively no animation vocabulary |
| Inline SVG elements | **0** | Nothing is drawn; everything is a box with text |
| Images on the page | **2** (both logos) | No visual material at all |
| Animation library | **none** | No GSAP, ScrollTrigger, Lenis, Three, Motion |
| Total page JS | **~4 KB inline** | Nothing is orchestrated |
| `[data-reveal]` elements | **19** across 8,552 px | One reveal per ~450 px; sections fade in as single blocks |
| Typical transition duration | **0.14 s / 0.22 s** | UI-widget tempo, not narrative tempo |
| `clip-path` / `mix-blend-mode` / `mask-image` | **0 / 0 / 0** | No compositing craft |
| Scroll-driven animation (`animation-timeline`) | **0** | Scroll position drives nothing |
| Gradients | **2** | Flat by default, not by decision |

The brief asks for scrolling to feel like being walked hand-in-hand through a story. That ambition currently lives in the copy and the section order. It does not exist in the motion. The page announces a story and then presents a document.

The good news: the fix is not a redesign. The narrative is already written. It needs to be *drawn*.

---

## 2. Method

Audited in a real Chromium browser at 1524×785, 501 px and ~890 px widths. I read the compiled stylesheet (44.7 KB, brotli, `immutable`), enumerated every `@keyframes`, transition, sticky context and media query, measured computed typography on every text node, calculated WCAG contrast ratios against resolved backgrounds, measured every tap target, inspected the media pipeline and cache headers, and read the navigation waterfall. Findings below are measured, not impressions, except where explicitly flagged.

---

## 3. P0 — Defects to fix before any creative work

These actively damage credibility. Creative work layered on top of them is wasted.

### 3.1 The hero video is 960×540

It renders at **1509×1008 CSS px** with `object-fit: cover`. That is roughly a **1.9× upscale on a 1× display and ~3.7× on retina**. The first thing a visitor sees is a soft, mushy image.

On a site whose entire proposition is engineering rigour and field-proven hardware, a blurry hero is the most expensive pixel on the property. Nothing else on this list matters as much.

**Fix:** re-encode at 1920×1080 minimum. Ship AV1 with an H.264 fallback. Target a 6–10 s loop under 2 MB. Add a sharp `poster` at full resolution so the first frame is crisp even before the video decodes.

### 3.2 The hero video was not playing

Measured state at scroll-top: `readyState: 4` (fully loaded), `error: null`, `autoplay`/`muted`/`playsInline` all set — and `paused: true`, stalled at `t = 1.78 s`. I called `play()` manually; the promise resolved, playback advanced ~0.5 s, then paused again. Something is actively re-pausing it.

> **Verify before acting.** Automation environments do throttle background media, so this may be an artefact of my harness. But if it reproduces on real hardware, your hero is a low-resolution *still frame* — which would compound 3.1 into a total failure of the opening moment. Check on a real phone and a real laptop, on battery and on mains.

### 3.3 The hero video is the same file as the playground video, and it is 172 seconds long

Both the hero background and the playground section load `/media/poc-playground.mp4`. Duration: **172.84 s**.

Two problems. First, your opening shot is recycled footage from a section 6,000 px further down the page — so the hero has no authored identity of its own. Second, a near-three-minute file used as a background loop is a large download for a decorative element.

It also ships with `Cache-Control: public, max-age=0, must-revalidate` — no CDN caching, re-validated on every visit. (Your CSS is correctly `immutable` + brotli, so this is a media-pipeline gap specifically.)

**Fix:** shoot or cut a dedicated hero loop. Set long-lived immutable caching on hashed media filenames.

### 3.4 The four partner names are plain text

`Taavura`, `Hyundai`, `VDL`, `Bazan` render as **19 px Poppins 600**. No logo, no mark, no image.

The entire credibility of a consortium rests on those four names, and they are presented as a word list in the site's body font. This is the single highest-leverage fix on the site — a founder deciding whether you are real will look at that strip first.

**Fix:** real marks, normalised to a single optical height, monochrome `--ink-700`, with the colour version revealed on hover. If trademark clearance is the blocker, say so and design around it explicitly — a disciplined monochrome lockup with a visible "shown with permission" line still reads as far more real than text.

### 3.5 The signature scroll interaction is disabled on mobile

`.story-sticky` drops to `position: relative` below the 860 px breakpoint. The one genuinely narrative moment on the site — the sticky console tracking five process steps — **does not exist for phone visitors.**

Founders discover you on a phone, from a LinkedIn link. This is where the story lives and it is switched off for the majority of your inbound.

**Fix:** the story must be mobile-first, not mobile-excluded. Sticky viewport panels work better on mobile than desktop, because the viewport *is* the frame. See §6.2.

### 3.6 The mobile headline floor is too large

`font-size: clamp(60px, 7vw, 104px)` never goes below 60 px. Measured at 486 px viewport width: the `h1` is **4 lines and 255 px tall**. On a 390 px iPhone it is worse — roughly six characters per line.

**Fix:** drop the floor to ~40 px. The whole clamp set needs revisiting (§4.1).

---

## 4. P1 — Design system

### 4.1 The type scale is ad-hoc

Measured on the homepage: **20 distinct rendered font sizes.** In the stylesheet: **23 distinct `px` font-size values** plus **13 `clamp()` formulas with 11 different maxima** — 76, 104, 92, 29, 70, 76, 66, 82, 118, 68, 84.

That is ten near-identical "large heading" sizes. The consequence is that nothing on the page has a *deliberate* hierarchy — every section is roughly as loud as every other section, which is precisely why a well-organised page reads as flat. Emphasis requires contrast, and contrast requires restraint elsewhere.

**Fix:** three display sizes, three body sizes, two utility sizes. Eight total. Ratios chosen, not accumulated. A rationalised scale is supplied in `quantum-signal.css`.

### 4.2 Everything is locked to pixels

Exactly **one `rem`** appears in 44.7 KB of CSS. Every font size is `px`.

This means the site ignores user font-size preferences entirely. A visitor who has set a larger default text size in their OS or browser gets no change. That is an accessibility failure with regulatory exposure under the European Accessibility Act, and it is trivially avoidable.

**Fix:** `rem` for all type. Keep `px` only for borders, hairlines and the few places where a physical pixel is the point.

### 4.3 Thirty-four text nodes are below 11 px

**18 elements at 9 px** and **16 at 10 px.** These are your eyebrows, sector numbers, and case-study category labels — `AUTOMOTIVE`, `MOBILITY`, `01`–`04`, `SHARED BY`, `CAMERA`, `LIDAR`.

9 px is not a design choice, it is a legibility floor breach. It also guarantees the contrast failures in §5.1, because tiny text needs *more* contrast, not less.

**Fix:** 11 px minimum for uppercase mono labels, 12 px preferred, with letter-spacing carrying the "technical label" character instead of smallness.

### 4.4 The teal ramp is defined and almost unused

`--teal-600`, `--teal-500`, `--teal-100` exist in the token set and barely appear on the page. That is a wasted expressive axis on a site that needs more visual language, not less.

**This is an opportunity, not just a cleanup.** Assign the two accents semantic meaning:

- **Magenta = live signal.** In test, in progress, being scouted, unproven.
- **Teal = proven.** Agreement signed, in production, rolled out.

Suddenly your proof section has a visual grammar: a case study can visibly *transition* from magenta to teal as the scroll reveals that the POC ended in a signed agreement. The colour carries the argument. That is structure encoding meaning rather than decorating it — and it costs nothing, because both ramps already exist.

### 4.5 Motion tempo is uniformly too fast

Measured durations: `0.14 s` (nav, buttons, partner strip), `0.22 s` (header, tabs, cards, rail), `0.36 s` (story steps), `0.7 s` (reveals). The easing curve `cubic-bezier(.22, .85, .24, 1)` is good — a proper decelerating curve.

But 0.14–0.22 s is *interface* tempo. It's correct for a button. It is far too fast for a narrative beat. Nothing on this page is allowed to unfold, so nothing feels considered.

**Fix:** two tempos, deliberately separated. Interface: 140–220 ms, keep as is. Narrative: 600–1200 ms with stagger. The distinction between them is most of what "cinematic" actually means in practice.

### 4.6 No text splitting

Headings animate as single blocks. There is no line-level or word-level reveal anywhere on the site. Staggered line reveals on a large display heading are the cheapest, highest-return motion technique in existence, and it is entirely absent.

---

## 5. P2 — Accessibility

### 5.1 Measured contrast failures

| Element | Colour on background | Ratio | Required |
|---|---|---|---|
| `SHARED BY` (10 px) | `#8d9599` on `#fff` | **3.05** | 4.5 |
| Sector numbers `02`/`03`/`04` (10 px) | `#8d9599` on `#fff` | **3.05** | 4.5 |
| `AUTOMOTIVE` / `MOBILITY` / `01`–`04` on proof cards (9 px) | `#8d9599` on `#fff` | **3.05** | 4.5 |
| `WORK WITH US` (9 px) | `rgba(255,255,255,.38)` on `#1a1e1f` | **3.55** | 4.5 |
| `CAMERA` / `Visibility` (9–10 px) | `#6e767a` on `#fef3f7` | **4.27** | 4.5 |

All are normal-weight text below 18.66 px, so 4.5:1 applies. All fail.

### 5.2 Hero text sits over uncontrolled video

Hero eyebrow is `rgba(255,255,255,.68)`, body copy `.76`, and `SCROLL TO FOLLOW THE SIGNAL` is **10 px at 58 % white opacity over moving footage.** There is a `.home-video-shade` overlay, but contrast against a *changing* image is by definition not guaranteed. Unknowable contrast is failing contrast.

**Fix:** raise text to full opacity, and put a deterministic scrim behind it — a linear gradient from `--ink-950` at 78 % to transparent, sized to the text column rather than the whole frame. Then the ratio is computable and stable regardless of the footage.

### 5.3 Tap targets below minimum

- **Story step buttons: 21 × 21 px.** These are the primary controls of your core interactive section. WCAG 2.5.8 requires 24 × 24 px minimum; 44 × 44 px is the practical standard.
- Footer links: 21 px tall.
- `See the technology areas`: 193 × 21 px.

**Fix:** expand the hit area with padding or a `::before` overlay without changing the visual size.

### 5.4 Other findings

- **No skip link.** Keyboard users traverse the full nav on every page.
- **Only 5 `:focus-visible` rules** for the entire site. Focus styling is close to absent on cards, tabs and the story controls.
- **The playground tablist has no `aria-selected`**, while the sector tablist does. Inconsistent — one was done properly and the other wasn't.
- **No `@media (hover: hover)` guard anywhere.** Every hover state fires as a sticky tap-state on touch devices, so mobile users get stuck hover styling after tapping.
- **One `prefers-reduced-motion` block** exists. It is adequate for three keyframes. It will not cover anything proposed in §6 — the reduced-motion path has to be designed alongside the motion, not retrofitted.

---

## 6. The creative direction

### 6.0 The insight

**You already have your art direction and you are not using it.**

Read your own copy: "Follow the signal through Quantum-hub." "SCROLL TO FOLLOW THE SIGNAL." The console label `Q / SIGNAL`. Then read your own stylesheet: the three keyframes you wrote are named **`travel`, `orbit`, `scan`.**

The metaphor is fully formed in the writing and completely absent from the visual design. Nobody has drawn the signal. That is the whole gap, and it means the direction doesn't need to be invented — it needs to be executed.

Everything below derives from that one idea. This matters: it's why the result will look like Quantum-hub and not like a template, because the concept comes from your own material rather than from a trend.

### 6.1 Signature element — the continuous signal path

**One unbroken stroke that runs the entire length of the page, drawn by your scroll.**

It enters at the hero as a single thin line. It threads down through the metric band. It becomes the story rail. At the sector section it **splits into four** — one per industry. Through the proof section the four strands **converge**, and each one that ends in a signed agreement **shifts from magenta to teal** as it resolves. At the CTA the strands merge back into one line that terminates in a point.

This is the hand-holding, made literal. It is one element, it spans the whole page, and it encodes the actual argument: needs enter, get scouted, split across sectors, and resolve into proof.

Implementation is a single absolutely-positioned SVG layer behind the content. Each section declares an anchor (`data-signal-anchor="left|center|right"`), and the path is generated procedurally as a smooth cubic spline through those anchors — so it is fully responsive and regenerates on resize rather than being a hand-drawn path that breaks at every width. Draw progress is `stroke-dashoffset` driven by scroll position, written only inside `requestAnimationFrame`.

Working implementation: `quantum-signal.js` → `SignalPath`.

### 6.2 Rebuild the story section as the centrepiece

Currently five process steps resolve inside **1,050 px** — about 1.3 viewports for the single most important explanation on your site. It's over before it registers.

Give it **five full-viewport sticky panels.** Each panel holds one step, and each gets its own diagram that is *drawn* as you scroll through it:

1. **Operational need** — a constraint tightening. A boundary contracts until something has to give.
2. **Global scouting** — the scan. A sweep across a field of candidate points, most dimming, a few staying lit.
3. **Partner match** — two sets converging. Solution, site, owners, value case snapping into alignment.
4. **Field POC** — the instrument. Live readouts, a test running, evidence accumulating.
5. **Scale what works** — resolution. The line either thickens into rollout or terminates cleanly as a useful no. *Show the "no" too — it is the most trust-building thing on your site.*

This is where the scroll budget should go. It is worth more than the rest of the page combined, because it is the thing a partner or founder actually needs to understand.

Mobile-first, explicitly reversing §3.5: sticky viewport panels are *better* on a phone than on a desktop, because the viewport is the frame and there is no competing content in the periphery.

### 6.3 A live need-to-match instrument

The sector section is currently four tabs revealing four paragraphs. That explains what you cover. It does not demonstrate what you do.

Replace it with a working instrument. A visitor picks an operational constraint — or types a capability — and the instrument **scans and returns the match**: which partner has that need, which site it would be tested at, what the value case looks like, what evidence a POC would have to produce.

This is the "show off what we can offer them" moment. It's the difference between telling a founder you do matchmaking and letting them watch their own technology get matched. It is also the single most likely thing on the page to convert a browsing founder into a form submission, because they arrive at the CTA having already seen their own name in the machine.

The match instrument should be implemented from the documented behavior and the current repository architecture; no prototype is in scope.

### 6.4 The proof section as an outcome ledger

You have four cases that ended in signed commitments, and they are presented as four static cards. Meanwhile `data-count` is already wired to your metric numbers, so the counter infrastructure exists.

Turn the proof section into a ledger that resolves on scroll: each case animates from POC state (magenta, in test) to outcome state (teal, signed), with the specific commitment landing as the line completes — *mass-production agreement*, *reseller agreement*, *100 units ordered*, *launched in the ISUZU AI truck*.

Four signed agreements is a strong hand. Play it as one.

### 6.5 Motion craft baseline

- **Two tempos, separated.** Interface 140–220 ms. Narrative 600–1200 ms with stagger.
- **Line-level text reveals** on every display heading, staggered 60–80 ms per line. Absent today; highest return per line of code of anything here.
- **A designed reduced-motion path,** not a disable switch. Under `prefers-reduced-motion: reduce`, the signal path should render *complete* rather than not at all, panels should cross-fade rather than transform, and the instrument should resolve instantly. The story still reads; it just doesn't move.
- **Guard every hover in `@media (hover: hover)`.**
- **`will-change` only on elements currently animating,** removed after. It is absent today, which is safe but leaves performance on the table for the transforms in §6.1–6.2.

### 6.6 The hero

Given §3.1–3.3, the hero needs rebuilding regardless. Two routes:

**Route A — real footage, done properly.** A dedicated 6–10 s loop at 1920×1080, AV1 + H.264, under 2 MB, full-resolution poster, deterministic text scrim. Lowest risk, and real hardware in a real field is your most persuasive asset.

**Route B — generative signal field.** Replace video with a canvas or WebGL field of points from which the signal emerges and resolves into the headline. Smaller than any video, infinitely sharp at any resolution, and it makes the hero *the thesis of the site* rather than a b-roll plate. Higher risk, higher ceiling.

**Recommendation: A now, B as the next iteration.** Route A removes an active credibility problem this week. Route B is a project, and it should not block fixing a blurry hero.

---

## 7. Technical and delivery

- **No `<link rel="canonical">`.** On a `*.pages.dev` preview domain this is an active duplicate-content risk the moment the production domain goes live. Add it now.
- **No JSON-LD.** You should ship `Organization` (with the four partners as `memberOf`/`parentOrganization` as appropriate) and a `BreadcrumbList`. Each proof case is a natural `CreativeWork`. This is how you show up as an entity rather than a page.
- **The 861–1100 px range is effectively unstyled.** `@media (width<=1100px)` is **271 bytes / 6 selectors**, against 3,254 bytes at 860 px and 2,861 bytes at 560 px. Small laptops and landscape tablets get near-desktop layout at nowhere near desktop width. This is a real audience — add a proper tier.
- **Consider container queries.** Zero present. The sector panel, proof cards and story console are all components whose layout should respond to their own width, not the viewport's. This would also fix the 1100 px gap structurally rather than with another breakpoint.
- **Performance is fine and not the problem.** FCP 1,124 ms, DCL 1,213 ms, 139 KB across 35 requests. `load` at 4,493 ms is entirely video-bound. You have substantial headroom to add the motion in §6 — the budget is there, it's just unspent.
- **Fonts:** confirm `font-display: swap` and preload the two display weights actually used above the fold. Poppins at weight 500 for display and Manrope for body is a sound pairing; keep it.

---

## 8. Implementation sequence

**Week 1 — stop the bleeding.** Re-encode the hero video (3.1) and diagnose the pause (3.2). Real partner marks (3.4). Fix the five contrast failures and raise 9 px text to 11 px (5.1, 4.3). Add canonical + JSON-LD (7). Expand tap targets (5.3).

*These are cheap and they remove every active credibility problem. Do not start week 2 before this is done.*

**Week 2 — the system.** Adopt the rationalised type scale and convert to `rem` (4.1, 4.2). Assign semantic meaning to magenta and teal (4.4). Split the two motion tempos (4.5). Add the line-reveal system (4.6). Add the 861–1100 px tier (7).

**Weeks 3–4 — the signature.** Build the signal path (6.1). Rebuild the story as five sticky panels, mobile-first (6.2, 3.5). Design the reduced-motion path alongside, not after (6.5).

**Weeks 5–6 — the conversion moment.** Build the match instrument (6.3). Rebuild proof as the outcome ledger (6.4).

**Later.** Route B hero (6.6). Container queries (7).

---

## 9. What was already right

Worth stating plainly, because a list of problems is a distorted picture:

- The section order is a genuine narrative spine. Most of this audit is about *expressing* it, not fixing it.
- The token architecture is disciplined — a full 13-step ink ramp is more rigour than most sites ever get.
- `cubic-bezier(.22, .85, .24, 1)` is a properly considered easing curve, not a default.
- Real ARIA tab semantics on the sector section, and `aria-label` on every story control. Someone cared.
- One `h1`, clean heading order, every image has `alt`, `lang` is set.
- CSS is brotli-compressed and `immutable`-cached. The build is competent.
- 139 KB total. The site is *fast*, which means there is room to make it impressive.

The foundation is sound. That is why this is a two-to-six week project and not a rebuild.

---

## Appendix — measured data

**Sections and heights (desktop, 1524 px):** hero 1008 · partner-strip 102 · metric-band 397 · intro 675 · story 1350 · statement-band 490 · sector 1074 · proof 1083 · spark-band 678 · playground 767 · closing-cta 569. Total document 8,552 px.

**Rendered font sizes:** 9, 10, 11, 13, 14, 15, 16, 17, 18, 20, 24, 27, 34, 40, 42, 43, 44, 46, 54, 60 px (20 distinct).

**`clamp()` maxima in CSS:** 29, 66, 68, 70, 76, 76, 82, 84, 92, 104, 118 px (13 formulas).

**Breakpoints:** `width<=1100px` (271 B, 6 selectors) · `width<=860px` (3,254 B, 49) · `width<=560px` (2,861 B, 65) · `prefers-reduced-motion: reduce` (1 block).

**CSS feature census:** 3 keyframes · 3 sticky · 20 transitions · 38 transforms · 2 gradients · 2 backdrop-filter · 2 filter:blur · 1 perspective · 1 aspect-ratio · 5 focus-visible · 0 clip-path · 0 mix-blend-mode · 0 mask-image · 0 container queries · 0 scroll-driven animations · 0 hover guards · 1 rem.

**Delivery:** CSS 44.7 KB brotli, `max-age=31536000, immutable`. Media `max-age=0, must-revalidate`. 35 requests, 139 KB. FCP 1,124 ms · DCL 1,213 ms · load 4,493 ms.

**Hero video:** `/media/poc-playground.mp4` · 960×540 intrinsic · 1509×1008 rendered · `object-fit: cover` · `filter: saturate(.82) contrast(1.05) brightness(.78)` · 172.84 s · shared with playground section.
