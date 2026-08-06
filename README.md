# Quantum-hub website

The public Quantum-hub website: a responsive, multi-route storytelling experience built for Cloudflare-compatible deployment with vinext.

## Local preview

```bash
npm install
npm run dev
```

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e
```

The test suite compiles the production bundle, server-renders every public route, validates structured content and asset budgets, and checks the production brand assets. Playwright covers Chromium, WebKit, mobile viewports, keyboard navigation, reduced motion, no-JavaScript behavior, and honest form availability.

## Content and evidence

Mutable site records live in `app/data/`. Metrics without an approved source date are marked pending. Needs without publication approval are explicitly representative, and case studies distinguish public claims from evidence packages still awaiting approval.

## Phase 1 asset status

- No approved short, full-HD hero loop is present. The homepage therefore uses the approved 1511×790 poster as a deliberate decorative fallback; the media component is ready for approved WebM and MP4 sources later.
- No approved consortium marks are present. Partner names render as accessible, optically consistent consortium lockups. Add approved SVG marks and usage permission to the corresponding partner records before enabling logo treatment.
- Canonical URLs, absolute social-image metadata, and organization URL/logo fields are emitted only when `NEXT_PUBLIC_SITE_URL` contains the approved HTTPS production origin. The known organization name, Herzliya locality, country, and LinkedIn profile remain available without inventing a domain or legal relationship.

## Forms

The contact and SPARK forms never simulate success. They remain visibly unavailable until `LEAD_WEBHOOK_URL` and `LEAD_WEBHOOK_SECRET` are configured for the Cloudflare Pages Functions in `functions/api/`. No form values are sent to analytics.

## Build and deployment

Cloudflare Pages should use Node 22.13 or later, run `npm run build`, and publish `dist/client`. The production branch remains `main`. Versioned assets under `/assets/` and the approved hero fallback receive immutable caching through `public/_headers`.

Deployment remains repository-driven: merge or push the accepted commit to `main`, let the existing Cloudflare Pages integration build it, then smoke-test `/`, `/pocs`, `/spark`, a direct nested route refresh, the versioned hero asset, and form-unavailable responses. Roll back by reverting the phase commit or selecting the preceding Cloudflare deployment.

## Public routes

- `/`
- `/about`
- `/for-partners`
- `/for-startups`
- `/spark`
- `/industries`
- `/pocs`
- `/case-studies`
- `/case-studies/actasys`
- `/updates`
- `/contact`
- `/spark-register`
