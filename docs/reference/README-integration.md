# Integration Reference — Sanitized for Quantum-Hub

This reference is derived from the supplied `README-integration.md`.

The Quantum Prototype is explicitly excluded from this project and must not be opened, used, copied, or treated as a source. The supplied `quantum-signal.css` and design audit may be used as supporting references. A `quantum-signal.js` file was mentioned by the original integration guide but was not supplied in this package; do not assume it exists.

## Supplied reference files

| File | Role |
|---|---|
| `quantum-hub-design-audit.md` | Supporting measured audit and prioritization evidence. Revalidate findings against the current repository before production changes. |
| `quantum-signal.css` | Reference tokens, accessibility fixes, motion patterns, signal-layer styles, narrative-panel styles, match-instrument styles, evidence-ledger styles, and reduced-motion treatment. Adapt to the repository rather than loading blindly. |

## Incremental adoption guidance

The CSS reference is namespaced with `qs-` classes and new token names. Useful patterns include:

- `qs-reveal` and `qs-rise-in` for line and block reveals.
- `qs-label` for technical labels with a legible size and stronger contrast.
- `qs-hit` for expanding small controls to a practical target.
- `qs-video-scrim` for deterministic text contrast over footage.
- Signal-path and sticky-panel structures.
- Match-instrument and outcome-ledger patterns.
- Designed reduced-motion states.

Do not simply append the entire stylesheet to production. Map useful patterns into the existing token and component architecture, remove duplication, and preserve repository conventions.

## Signal-path structure

The supplied CSS expects a structure broadly equivalent to:

```html
<div class="qs-narrative" data-signal>
  <section class="qs-panel" data-signal-anchor="left">
    <div class="qs-panel__frame">
      <div class="qs-panel__copy qs-above">...</div>
      <div class="qs-stage qs-above">...</div>
    </div>
  </section>
</div>
```

Implementation principles:

- Generate a responsive path through declared waypoints instead of relying on a fixed hand-authored path.
- Regenerate after relevant layout changes.
- Keep sticky panel frames transparent where the signal needs to remain visible, or scope the signal layer differently.
- Keep meaningful content above the signal and in the DOM.
- Do not rely on `nth-child()` selectors when runtime layers may be inserted.
- Drive per-panel progress through a single normalized value where useful.
- Test actual scroll budgets rather than accepting any reference height as a default.

## Shipping checks

- Verify SVG behavior in supported Safari versions, particularly when using `pathLength` on shapes other than `<path>`.
- Test the longest panel at 360px width and on short mobile viewports.
- Ensure sticky content does not become inaccessible through internal overflow.
- Ensure the reduced-motion path renders complete, readable states without excessive blank scrolling.
- Confirm all observers, listeners, animation frames, and media-query subscriptions are cleaned up.
- Confirm the site remains readable if JavaScript fails.

## Not included or not assumed

- No final hero video asset.
- No approved partner artwork.
- No production canonical domain or legal entity details.
- No supplied signal JavaScript implementation.
- No permission to replace the complete existing type system without a deliberate repository-wide migration.
