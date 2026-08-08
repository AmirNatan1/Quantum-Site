# Quantum-hub website

The public Quantum-hub website: a responsive, multi-route storytelling experience deployed through Cloudflare Pages with vinext.

## Local preview

```bash
npm install
npm run dev
```

`npm start` serves an existing Vinext build for local preview only. It is not the production deployment path.

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

## Asset status

- No approved hero video or poster is active. The homepage uses its approved semantic DOM and CSS composition without a media runtime dependency.
- No approved consortium marks are present. Partner names render as accessible, optically consistent consortium lockups. Add approved SVG marks and usage permission to the corresponding partner records before enabling logo treatment.
- Canonical URLs, absolute social-image metadata, and organization URL/logo fields are emitted only when `NEXT_PUBLIC_SITE_URL` contains the approved HTTPS production origin. The known organization name, Herzliya locality, country, and LinkedIn profile remain available without inventing a domain or legal relationship.

## Forms

The contact and SPARK submission surfaces are deliberately closed. The Cloudflare Pages Functions under `functions/api/` remain fail-closed with HTTP 503 before request bodies are read; no environment variable activates submission. No form values are sent to analytics.

## Build and deployment

Production uses Cloudflare Pages Git integration from `main`. Pages must use Node 22.13 or later, run `npm run build`, and publish `dist/client`. `NEXT_PUBLIC_SITE_URL` is required for the main production Pages build and must contain the approved HTTPS origin. Pages Functions live under `functions/api/`.

The generated `dist/server` and Worker/Sites artifacts are build outputs for other runtime paths; they are not this site's production deployment target. Fingerprinted files under `/assets/` receive immutable caching through `public/_headers`; unversioned branding and team assets retain revalidation behavior so replacements can propagate.

Deployment remains repository-driven: merge or push the accepted commit to `main`, let the existing Cloudflare Pages integration build it, then smoke-test `/`, `/pocs`, `/spark`, a direct nested route refresh, versioned assets, and form-unavailable responses. Roll back by reverting the phase commit or selecting the preceding Cloudflare deployment.

## Public routes

- `/`
- `/about`
- `/for-partners`
- `/for-startups`
- `/spark`
- `/industries`
- `/pocs`
- `/case-studies`
- `/updates`
- `/contact`
- `/spark-register`
