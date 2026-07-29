# WOD Security Remediation Report

**Review date:** 29 July 2026  
**Scope:** WOD private admin application (`wod-community-app/web`) and public website (`wodstory/website`)  
**Status:** All critical, high, and moderate issues identified during this review have been remediated in the local source.

## Executive summary

The review found five main areas requiring remediation:

1. known vulnerabilities in the JavaScript dependency tree;
2. newsletter subscriptions becoming active without email ownership verification;
3. request-size checks that trusted the client-supplied `Content-Length` header;
4. a development Webpack bundle using `eval()` in the public production site, which forced a weak Content Security Policy;
5. public Blog queries returning more database columns than the pages required.

The fixes remove the vulnerable production dependency paths, introduce a true double-opt-in newsletter flow, enforce limits while reading the real request stream, replace the development bundle with a small purpose-built script, harden the CSP, and restrict public Blog queries to explicit safe fields.

## Changes and rationale

### 1. Dependency and supply-chain remediation

Changed:

- upgraded `next` and `eslint-config-next` from `16.2.10` to `16.2.11`;
- forced `sharp` to the patched `0.35.x` line;
- forced `brace-expansion` to `5.0.8` or newer;
- added a narrow compatibility patch for legacy `minimatch@3.1.5`, allowing it to consume the patched `brace-expansion` CommonJS export safely;
- regenerated `pnpm-lock.yaml`.

Why:

- the original production tree contained ten known advisories, including high-severity issues in Next.js and Sharp;
- the full development audit later exposed a high-severity denial-of-service advisory in `brace-expansion`;
- applying the new package globally without the compatibility patch broke ESLint, so the final solution includes a small, repository-tracked adapter rather than accepting either a vulnerable or non-functional toolchain.

Result:

- `pnpm audit`: **No known vulnerabilities found**;
- ESLint and the production build both pass with the patched dependency tree.

### 2. Newsletter double opt-in

Changed:

- new subscriptions are stored as `pending`, not `active`;
- the double-opt-in flow uses a new `request_newsletter_subscription` RPC, leaving the currently deployed legacy RPC available during rollout to avoid downtime;
- an expiring, one-time UUID confirmation token is created server-side;
- Resend sends a dedicated confirmation email;
- the user must explicitly click **Confirm subscription** on `/newsletter/confirm`;
- only then does the database change the subscriber to `active`;
- previously unsubscribed addresses are no longer silently reactivated;
- existing active subscribers are preserved and marked as previously confirmed;
- confirmation tokens expire after 48 hours and are cleared after use or unsubscribe.

Why:

- the previous flow proved only that someone knew an email address, not that they owned it;
- automatic reactivation could override a previous unsubscribe decision;
- a confirmation page with an explicit button avoids accidental activation by email security scanners that automatically visit links.

Important:

- the migration `202607290014_newsletter_double_opt_in.sql` must be applied to Supabase **before** deploying the corresponding application code.

### 3. Real request-body limits

Changed:

- added a shared stream reader that:
  - validates `Content-Length` when present;
  - independently counts the bytes actually read;
  - cancels oversized streams;
  - rejects unsupported compressed request bodies;
  - rejects malformed UTF-8 and malformed JSON;
- applied a 4 KB limit to newsletter signup;
- applied a 16 KB limit to the public contact form;
- applied a 64 KB limit to inbound Resend webhook events.

Why:

- `Content-Length` is supplied by the client and may be missing or false;
- calling `request.json()` or `request.text()` first can allocate an unbounded body before validation;
- enforcing the limit during stream consumption reduces memory-exhaustion and oversized-payload risk.

### 4. Content Security Policy hardening

Admin application:

- replaced the static `unsafe-inline` script policy with a cryptographically random nonce per request;
- propagated the nonce through the Supabase session response;
- attached it to Blog JSON-LD scripts;
- enabled `strict-dynamic`;
- retained `unsafe-eval` only in local development, where Turbopack requires it;
- production responses no longer permit inline scripts without the nonce.

Public website:

- removed `unsafe-eval` and script-level `unsafe-inline`;
- added exact SHA-256 hashes for the three intentional JSON-LD blocks;
- changed `frame-ancestors` to `none`;
- added `object-src 'none'` and `upgrade-insecure-requests`;
- removed inline `onerror` JavaScript from Wiki images and replaced it with external event listeners.

Why:

- permissive script policies substantially reduce the protection CSP provides against cross-site scripting;
- nonces and hashes allow only the scripts intentionally produced by the application.

Maintenance note:

- if the inline JSON-LD in `index.html`, `wiki.html`, or `author.html` changes, its CSP hash in `vercel.json` must be regenerated.

### 5. Removal of the development production bundle

Removed:

- `assets/js/app.js`;
- the unused GSAP development chunk;
- the unused GSAP vendor chunk.

Added:

- `assets/js/public-app.js`, a small strict-mode vanilla JavaScript implementation for:
  - hero slide selection;
  - mouse, touch, keyboard, and thumbnail navigation;
  - reduced-motion-aware autoplay;
  - active video pause/play handling;
  - scroll-to-top behavior;
  - the existing vertical avatar-rail layout.

Why:

- the old 1.1 MB Webpack file was a development build containing 66 `eval()` calls;
- together with its chunks it added roughly 1.5 MB of unnecessary production JavaScript;
- its presence required `unsafe-eval` and included many libraries that this page did not use.

Result:

- no `eval()` bundle is loaded;
- all three thumbnails render correctly;
- changing to Book II works with click and keyboard input;
- desktop and 390 px mobile previews have no horizontal overflow.

### 6. Blog data minimisation

Changed:

- replaced `select("*")` in:
  - the Blog index;
  - individual Blog articles;
  - the RSS feed;
- introduced public Blog record types containing only the fields used by each view.

Why:

- public views do not need internal fields such as `author_id`, `newsletter_campaign_id`, or workflow status;
- explicit projections reduce accidental data exposure if new private columns are added later.

## Verification performed

| Check | Result |
|---|---|
| Full dependency audit, including development dependencies | `No known vulnerabilities found` |
| ESLint | Passed, no findings |
| Next.js 16.2.11 production build | Passed |
| TypeScript validation during build | Passed |
| Runtime production CSP header and matching HTML nonces | Passed |
| Static JavaScript syntax checks | Passed |
| `git diff --check` in both repositories | Passed |
| `vercel.json` JSON parsing | Passed |
| CSP JSON-LD hashes recalculated and compared | Passed |
| Search for production `eval()` and unsafe script directives | Passed |
| Search for hard-coded service-role/Resend secrets in tracked source | No secret found |
| Desktop browser preview | Passed |
| 390 × 844 mobile browser preview | Passed |
| Hero thumbnail click/active-slide behavior | Passed |

## Deployment order

1. Apply `supabase/migrations/202607290014_newsletter_double_opt_in.sql` to the production Supabase project.
2. Deploy the admin application.
3. Deploy the public website.
4. Perform one real newsletter signup with a new email and confirm:
   - the first API response asks the user to check their email;
   - the subscriber is `pending` before confirmation;
   - the confirmation page requires a button click;
   - the subscriber becomes `active` only afterward.

The migration can be applied before the application deployment without interrupting the currently deployed signup endpoint. The new application switches to the new double-opt-in RPC as soon as it is deployed.

## Residual considerations

- `style-src 'unsafe-inline'` remains because the current UI uses extensive inline style attributes. Script execution is no longer covered by that exception. Removing inline styles would require a separate visual refactor.
- Rate limiting remains application/database based. If traffic grows materially, Vercel Firewall or another edge-rate-limiting layer would add protection before requests reach the application.
- Security should be rechecked after major dependency upgrades, authentication changes, new public APIs, or changes to the Resend/Supabase integration.
- The legacy `register_newsletter_subscriber` RPC remains service-role-only for zero-downtime rollout. It can be removed in a later cleanup migration after the new application deployment is confirmed.
- The `@napi-rs/wasm-runtime` optional development fallback reports an upstream peer-version warning. It is not used by the deployed application, the native resolver works, and both lint and production build pass.

## Files with material security changes

Admin application:

- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `patches/minimatch@3.1.5.patch`
- `src/proxy.ts`
- `src/lib/supabase/proxy.ts`
- `src/lib/http/read-limited-body.ts`
- `src/lib/email/newsletter-confirmation.ts`
- `src/app/newsletter/confirm/page.tsx`
- `src/app/newsletter/confirm/actions.ts`
- `src/app/api/newsletter/subscribe/route.ts`
- `src/app/api/contact/route.ts`
- `src/app/api/contact/inbound/route.ts`
- `src/app/blog/page.tsx`
- `src/app/blog/[slug]/page.tsx`
- `src/app/blog/rss.xml/route.ts`
- `src/lib/blog.ts`
- `supabase/migrations/202607290014_newsletter_double_opt_in.sql`

Public website:

- `vercel.json`
- `index.html`
- `wiki.html`
- `assets/js/public-app.js`
- `assets/js/wiki-enhancements.js`
