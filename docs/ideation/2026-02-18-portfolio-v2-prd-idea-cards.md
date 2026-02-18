# Portfolio V2 Ideation Run

## Context
- Date: 2026-02-18
- Objective: Identify the next highest-leverage product and platform improvements after scanning the current TanStack Start + Convex portfolio codebase.
- Target user: prospective clients (public site) and portfolio owner/admin (backoffice).
- Timeline assumption: 4-8 weeks, single maintainer with occasional design support.
- Constraint assumptions:
  - Keep the current stack (TanStack Start, Convex, shadcn/ui, Better Auth).
  - Prioritize changes that can ship incrementally with minimal migration risk.
  - Avoid duplicating already-built capabilities in admin/project CRUD and base analytics.

## Current State Summary
- Product surface is focused and functional: `/` public portfolio, `/projects/$slug` detail view, `/admin` content/analytics/moderation panel, and Spotify data endpoints.
- Data model is already well-defined in Convex (`projects`, `testimonials`, `messages`, `analyticsEvents`, `siteSettings`, `wallEntries`, `adminSessions`, `spotifyNowPlaying`).
- Core content operations are mature: CRUD + reorder for projects and testimonials, moderation for wall, message inbox, widget settings, dummy data seeding.
- Analytics exists but is shallow: event tracking, overview, simple timeseries, top projects, with no attribution/funnel segmentation.
- Largest gaps from observed code:
  - Admin security is intentionally bypassed (`OPEN_ADMIN_MODE = true` and hardcoded `public-admin-mode` token).
  - Sign-the-wall public feature is implemented backend-first but hard-disabled on frontend (`isWallEnabled = false`).
  - Public UX has interaction/accessibility gaps (hover-dependent project interactions, limited keyboard/a11y affordances).
  - Quality safeguards are uneven: tests are concentrated around Spotify; core portfolio/admin flows have minimal automated coverage.

## Opportunity List
- 1) Harden admin authentication and session lifecycle for production safety.
- 2) Launch the existing Sign-the-Wall feature with anti-abuse and better submission feedback.
- 3) Ship an accessibility pass for high-traffic UI interactions (project showcase, testimonial controls, motion behavior).
- 4) Expand analytics from counts to decision-grade funnel + attribution insights.
- 5) Improve lead operations from passive inbox to structured pipeline (prioritization and follow-up flow).
- 6) Consolidate duplicate Spotify pipelines and raise regression safety with focused tests.

## PRD Idea Cards

### Idea
- `id`: secure-admin-auth-session-hardening
- `title`: Secure Admin Auth and Session Hardening
- `category`: security
- `secondary_tags`: technical, dx

### Problem
- `problem_statement`: Admin controls are currently open by design (`convex/lib/adminAuth.ts`, `src/routes/admin.tsx`), which creates direct data integrity and reputational risk if deployed publicly.
- `target_user`: portfolio owner/admin.
- `current_behavior`: Anyone with route access can use admin operations with `public-admin-mode` token.

### Goals
- `primary_goal`: Enforce owner-only admin access with auditable session handling.
- `success_metrics`:
  - 100% of admin queries/mutations require valid non-revoked session.
  - 0 successful unauthorized admin requests in logs after launch.
  - <2 minute median login-to-admin access time for owner.
- `non_goals`:
  - Multi-tenant RBAC.
  - Team collaboration permissions.

### Solution
- `solution_summary`: Enable Better Auth Google flow for admin route gate, remove open mode bypass, issue short-lived Convex admin sessions only to allowlisted owner emails.
- `user_story`: As the site owner, I want only authenticated allowlisted accounts to access admin so portfolio data cannot be changed by strangers.
- `acceptance_criteria`:
  - Unauthenticated access to `/admin` redirects to sign-in state.
  - Non-allowlisted users receive forbidden state and no admin data.
  - `OPEN_ADMIN_MODE` disabled in production path.
  - Session revoke path works and invalidates access immediately.
- `ux_notes`: Keep auth UX fast with clear states: loading, unauthorized, forbidden, expired-session.

### Scope
- `mvp_scope`: Route guard + owner allowlist + session issue/revoke + admin token injection from authenticated server fn.
- `phase_2_scope`: Session activity logs, device/session management UI.
- `dependencies`: Better Auth provider config, environment secrets, Convex mutation availability.

### Engineering
- `touchpoints`: `src/routes/admin.tsx`, `src/lib/admin-session.ts`, `src/lib/auth.js`, `src/routes/api/auth/$.js`, `convex/lib/adminAuth.ts`, `convex/adminSessions.ts`.
- `data_model_changes`: Optional `lastUsedAt` on `adminSessions` for auditability.
- `api_changes`: No public API change; stricter admin validation behavior.
- `observability`: Auth success/failure counters, forbidden events, admin session revoke events.

### Risk & Compliance
- `risks`: Locking out valid owner due to env misconfiguration.
- `security_considerations`: Session expiry, token hashing, allowlist checks, replay resistance.
- `privacy_considerations`: Avoid storing excess user profile data; keep only owner email/session metadata.
- `accessibility_considerations`: Auth screens keyboard and screen-reader friendly.

### Delivery
- `rollout_plan`: Deploy behind feature flag (`ADMIN_AUTH_REQUIRED`), verify owner login in staging, then enforce in production.
- `test_strategy`: Unit tests for `requireAdmin` branches + integration tests for `/admin` access states.
- `effort`: medium
- `impact`: high
- `confidence`: high

---

### Idea
- `id`: wall-launch-and-trust-controls
- `title`: Launch Sign-the-Wall with Trust Controls
- `category`: feature
- `secondary_tags`: growth, analytics

### Problem
- `problem_statement`: Wall submission and moderation are implemented but intentionally hidden on the public page (`src/routes/index.tsx` forces disabled), leaving engagement potential unused.
- `target_user`: site visitors and portfolio owner.
- `current_behavior`: Visitors cannot discover/sign wall despite backend support and admin moderation tooling.

### Goals
- `primary_goal`: Increase lightweight visitor engagement without increasing moderation burden.
- `success_metrics`:
  - +20% monthly interactive engagements (wall submits + testimonial switches + CTA clicks).
  - <10% of submissions needing deletion after moderation.
  - 95% moderation actions completed in <72 hours.
- `non_goals`:
  - Full social feed features.
  - Public user accounts.

### Solution
- `solution_summary`: Re-enable wall from site settings, add clearer submission status UX, and improve anti-abuse heuristics before auto-queueing for moderation.
- `user_story`: As a visitor, I want to leave a short signed note and know what happens next so I feel my contribution matters.
- `acceptance_criteria`:
  - Public wall visibility follows `siteSettings.wallEnabled`.
  - Submission success state clearly communicates moderation queue status.
  - Cooldown and length constraints are visible in form copy.
  - Admin moderation can filter by recency and bulk-approve/archive.
- `ux_notes`: Keep wall lightweight and optional; preserve premium portfolio tone.

### Scope
- `mvp_scope`: Remove hardcoded frontend disable, improve form microcopy/states, add moderation filters.
- `phase_2_scope`: Optional auto-approval for trusted repeat sessions.
- `dependencies`: Existing `wall.ts` mutations, `siteSettings`, admin wall tab.

### Engineering
- `touchpoints`: `src/routes/index.tsx`, `convex/wall.ts`, `src/routes/admin.tsx`, `convex/siteSettings.ts`.
- `data_model_changes`: Optional moderation metadata (`reviewedAt`, `reviewReason`).
- `api_changes`: Optional query args for moderation filters.
- `observability`: Track wall form view, submit success/failure, moderation queue depth.

### Risk & Compliance
- `risks`: Spam or low-quality content volume.
- `security_considerations`: Rate-limit enforcement and payload validation remain mandatory.
- `privacy_considerations`: Avoid collecting unnecessary visitor identifiers.
- `accessibility_considerations`: Form labels, error semantics, and focus management on submit feedback.

### Delivery
- `rollout_plan`: Enable for 20% traffic window or low-risk period, monitor queue quality, then full enable.
- `test_strategy`: Mutation validation tests + UI tests for submit/error/success states.
- `effort`: low
- `impact`: medium
- `confidence`: high

---

### Idea
- `id`: accessibility-core-interactions-pass
- `title`: Accessibility Pass for Core Portfolio Interactions
- `category`: accessibility
- `secondary_tags`: ux-ui, performance

### Problem
- `problem_statement`: Key interactions are heavily hover/motion oriented (`project-showcase`, rotating testimonial controls), which can degrade keyboard and reduced-motion experiences.
- `target_user`: all visitors, especially keyboard-only and assistive-tech users.
- `current_behavior`: Hover preview behavior and some interactive affordances are not optimized for keyboard focus order and reduced-motion fallback.

### Goals
- `primary_goal`: Make top user journeys perceivable and operable under WCAG-aligned interaction rules.
- `success_metrics`:
  - 0 critical issues in automated a11y scan for `/` and `/projects/$slug`.
  - Full keyboard reachability for project list, testimonial switching, and contact form.
  - Reduced-motion mode respects user preference across animated components.
- `non_goals`:
  - Full visual redesign.
  - Localization overhaul.

### Solution
- `solution_summary`: Refactor interactive controls to semantic elements with focus-visible styles, add reduced-motion variants, and formalize aria/live regions for dynamic updates.
- `user_story`: As a keyboard or assistive-tech user, I want to navigate and use all main portfolio interactions without relying on hover or dense animation.
- `acceptance_criteria`:
  - Project list interactions work with keyboard only.
  - Testimonial controls announce active state changes.
  - Motion-heavy effects disable or simplify under `prefers-reduced-motion`.
  - Contact and wall error/success messages are announced appropriately.
- `ux_notes`: Preserve visual identity while improving affordance clarity.

### Scope
- `mvp_scope`: Public homepage and project detail interactions.
- `phase_2_scope`: Admin a11y pass.
- `dependencies`: Existing component primitives and styling tokens.

### Engineering
- `touchpoints`: `src/components/project-showcase.tsx`, `src/components/theme-switcher.tsx`, `src/routes/index.tsx`, `src/routes/projects.$slug.tsx`, `src/styles.css`.
- `data_model_changes`: none.
- `api_changes`: none.
- `observability`: Track keyboard-initiated interaction rates to verify adoption.

### Risk & Compliance
- `risks`: Minor visual regressions from semantic/DOM changes.
- `security_considerations`: none beyond existing baseline.
- `privacy_considerations`: none.
- `accessibility_considerations`: WCAG 2.2 AA-aligned focus order, visible focus, semantic labels, motion controls.

### Delivery
- `rollout_plan`: Ship behind incremental component flags, validate with manual keyboard walk-through and screen reader smoke test.
- `test_strategy`: RTL interaction tests + accessibility snapshot checks.
- `effort`: low
- `impact`: medium
- `confidence`: high

---

### Idea
- `id`: analytics-funnel-attribution-v2
- `title`: Analytics Funnel and Attribution V2
- `category`: analytics
- `secondary_tags`: growth, technical

### Problem
- `problem_statement`: Current analytics tracks core events but lacks source attribution and step-level funnel visibility, limiting optimization decisions.
- `target_user`: portfolio owner/operator.
- `current_behavior`: Admin sees totals/timeseries/top projects but cannot answer which traffic sources or journeys produce quality leads.

### Goals
- `primary_goal`: Make acquisition and conversion decisions based on source-aware funnel data.
- `success_metrics`:
  - Attribution coverage on >90% page views.
  - Funnel dashboard with stage conversion rates visible for 7/30-day windows.
  - Time-to-insight for “what drove contact submits” reduced to <2 minutes.
- `non_goals`:
  - Third-party analytics migration.
  - Predictive ML scoring.

### Solution
- `solution_summary`: Extend analytics events with UTM/referrer/device fields, add funnel aggregation queries, and ship admin filter controls.
- `user_story`: As the portfolio owner, I want to compare source-to-conversion funnels so I can prioritize channels and project positioning.
- `acceptance_criteria`:
  - New events include normalized attribution metadata.
  - Admin dashboard supports source/device/date filtering.
  - Funnel stages: page view -> project open -> project link click -> contact submit.
- `ux_notes`: Keep analytics legible and fast with sensible defaults.

### Scope
- `mvp_scope`: Metadata capture, Convex aggregations, admin filters/charts.
- `phase_2_scope`: Cohort retention and cross-session pathing.
- `dependencies`: Existing analytics table and front-end tracking hooks.

### Engineering
- `touchpoints`: `src/lib/analytics.ts`, `convex/analytics.ts`, `src/routes/admin.tsx`, `convex/schema.ts`.
- `data_model_changes`: Optional additional fields on `analyticsEvents` (`source`, `medium`, `campaign`, `deviceType`, `referrerHost`).
- `api_changes`: New or extended admin analytics queries for segmented funnels.
- `observability`: Query latency and aggregation correctness checks.

### Risk & Compliance
- `risks`: Over-collecting low-value metadata.
- `security_considerations`: Validate/normalize event metadata server-side.
- `privacy_considerations`: Avoid storing full referrer URLs or PII in analytics meta.
- `accessibility_considerations`: Data visualizations with textual equivalents.

### Delivery
- `rollout_plan`: Add data fields first, backfill dashboard with “data since YYYY-MM-DD” note, then enable filters.
- `test_strategy`: Unit tests for aggregation math + integration tests for filter outputs.
- `effort`: medium
- `impact`: medium
- `confidence`: medium

---

### Idea
- `id`: lead-pipeline-and-followup-ops
- `title`: Lead Pipeline and Follow-up Workflow
- `category`: growth
- `secondary_tags`: feature, analytics

### Problem
- `problem_statement`: Contact messages currently function as a flat inbox (`new/read/archived`) with no prioritization, SLA visibility, or follow-up automation.
- `target_user`: portfolio owner handling inbound opportunities.
- `current_behavior`: Manual triage in admin with no reminders, tags, or reply tracking.

### Goals
- `primary_goal`: Improve conversion from inbound message to qualified conversation.
- `success_metrics`:
  - First-response SLA tracked for 100% of new leads.
  - +15% increase in qualified follow-ups within 30 days.
  - Inbox zero time reduced by 30%.
- `non_goals`:
  - Full CRM replacement.
  - Complex multi-user sales workflows.

### Solution
- `solution_summary`: Add lead stages, priority tags, and response reminders with optional email/webhook notifications for new high-priority inbound messages.
- `user_story`: As the portfolio owner, I want to classify and prioritize incoming leads so I can respond faster to high-value opportunities.
- `acceptance_criteria`:
  - Messages support `stage` and `priority` fields.
  - Admin can filter/sort by stage, priority, and age.
  - Optional reminder/notification trigger when unanswered >24h.
- `ux_notes`: Keep interactions lightweight to avoid admin overhead.

### Scope
- `mvp_scope`: Stage/priority fields, filters, reminder badge.
- `phase_2_scope`: Suggested reply templates and one-click external export.
- `dependencies`: Existing messages table and admin tab.

### Engineering
- `touchpoints`: `convex/messages.ts`, `convex/schema.ts`, `src/routes/admin.tsx`.
- `data_model_changes`: Add `priority`, `stage`, `updatedAt`, `firstResponseAt`.
- `api_changes`: Extended list/update queries and optional reminder endpoint.
- `observability`: Lead stage throughput and stale-lead counters.

### Risk & Compliance
- `risks`: Workflow complexity may exceed solo-maintainer needs.
- `security_considerations`: Sanitize message content rendering and notification payloads.
- `privacy_considerations`: Protect sender email and retention policy.
- `accessibility_considerations`: Filter and table controls keyboard/screen-reader operable.

### Delivery
- `rollout_plan`: Start with simple stage model and no external notifications, then add reminders.
- `test_strategy`: Mutation validation tests + admin filter behavior tests.
- `effort`: medium
- `impact`: medium
- `confidence`: medium

---

### Idea
- `id`: spotify-pipeline-consolidation-and-quality-net
- `title`: Spotify Pipeline Consolidation and Quality Net
- `category`: technical
- `secondary_tags`: performance, dx

### Problem
- `problem_statement`: Spotify now-playing logic exists in both Convex and app server layers, increasing drift risk and maintenance overhead.
- `target_user`: developer/maintainer.
- `current_behavior`: Multiple fetch/cache paths and partial overlap in tests across two implementations.

### Goals
- `primary_goal`: Reduce operational complexity and regression risk in music widget pipeline.
- `success_metrics`:
  - Single source of truth for now-playing retrieval in production path.
  - 0 regressions in playing/idle/unavailable behavior across release cycle.
  - Faster diagnosis from structured error telemetry.
- `non_goals`:
  - Replacing Spotify integration.
  - New music providers.

### Solution
- `solution_summary`: Choose one authoritative backend path (Convex recommended), deprecate duplicate route, and standardize contract tests around payload semantics.
- `user_story`: As maintainer, I want one stable now-playing pipeline so incidents are easier to debug and changes are safer.
- `acceptance_criteria`:
  - Public widget reads from one backend source only.
  - Deprecated endpoint is removed or clearly internal-only.
  - Shared contract tests cover status transitions and metadata.
- `ux_notes`: No visible behavior change expected for visitors.

### Scope
- `mvp_scope`: Pipeline decision, route cleanup, contract test suite.
- `phase_2_scope`: Background refresh scheduling optimization.
- `dependencies`: Convex action/query stability, existing widget component.

### Engineering
- `touchpoints`: `src/components/now-playing-widget.tsx`, `src/routes/api/spotify-now-playing.ts`, `src/lib/server/spotify-now-playing.ts`, `convex/spotifyNowPlaying.ts`.
- `data_model_changes`: none required.
- `api_changes`: Potential deprecation of `/api/spotify-now-playing`.
- `observability`: Error rates per Spotify endpoint and refresh latency.

### Risk & Compliance
- `risks`: Temporary data freshness changes during migration.
- `security_considerations`: Secrets remain server/Convex env-only.
- `privacy_considerations`: No user PII involved.
- `accessibility_considerations`: none.

### Delivery
- `rollout_plan`: Run both paths in shadow mode for one release, compare payload parity, then remove redundant path.
- `test_strategy`: Contract tests + mocked API failure scenarios.
- `effort`: medium
- `impact`: low
- `confidence`: medium

## Prioritization Matrix

| Rank | Idea ID | Category | user_value | business_value | strategic_fit | confidence | time_to_value | engineering_effort (rev) | risk_level (rev) | priority_score | Bucket | Rationale | Sequencing note |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|---|
| 1 | secure-admin-auth-session-hardening | security | 4 | 5 | 5 | 5 | 4 | 2 | 2 | 31 | Do now | Removes highest-impact failure mode and unlocks safe public iteration. | First; foundational gate before traffic or feature expansion. |
| 2 | wall-launch-and-trust-controls | feature | 4 | 4 | 4 | 4 | 5 | 2 | 2 | 29 | Next | Mostly already built; rapid engagement lift with moderate risk. | Immediately after auth hardening. |
| 3 | accessibility-core-interactions-pass | accessibility | 4 | 3 | 4 | 4 | 4 | 2 | 1 | 28 | Next | Improves usability for all visitors and reduces hidden UX churn quickly. | Pair with wall launch to avoid shipping inaccessible new interactions. |
| 4 | analytics-funnel-attribution-v2 | analytics | 4 | 4 | 5 | 3 | 3 | 3 | 2 | 27 | Next | Needed for channel-level product decisions and message optimization. | Start data capture early; dashboard can follow once data accumulates. |
| 5 | lead-pipeline-and-followup-ops | growth | 4 | 5 | 4 | 3 | 3 | 3 | 2 | 27 | Next | Direct revenue/response upside, but relies on higher inbound volume and cleaner attribution data. | Implement after analytics v2 baseline. |
| 6 | spotify-pipeline-consolidation-and-quality-net | technical | 3 | 3 | 4 | 4 | 3 | 3 | 2 | 24 | Later | Valuable maintenance cleanup, but lower user-visible impact. | Schedule during maintenance sprint after growth/security goals. |

Quick wins:
- wall-launch-and-trust-controls
- accessibility-core-interactions-pass

Strategic bets:
- analytics-funnel-attribution-v2
- lead-pipeline-and-followup-ops

## Implementation Plan for Top Ideas

### Plan A: secure-admin-auth-session-hardening
- Epic: Production-safe admin access control.
- Stories:
  - Story 1: As owner, I can sign in with Google and receive an admin session token.
  - Story 2: As unauthorized user, I cannot read or mutate admin resources.
  - Story 3: As owner, I can revoke active session and lose admin access instantly.
- Tasks:
  - Add admin route auth gate and loading/error states in `src/routes/admin.tsx`.
  - Wire `issueAdminToken` / `revokeAdminToken` into admin lifecycle.
  - Disable open bypass in `convex/lib/adminAuth.ts` for production mode.
  - Add allowlist + env validation guardrails with explicit startup logging.
  - Add tests for unauthorized/forbidden/authorized query and mutation paths.
- Acceptance criteria:
  - `/admin` rejects unauthenticated users.
  - All admin Convex functions reject missing/invalid tokens.
  - Owner session creation/revocation works end-to-end.
- Test strategy:
  - Unit tests for `requireAdmin` decision branches.
  - Integration tests for admin UI states and data fetch behavior.
  - Regression tests for key admin mutations.
- Rollout:
  - Stage with dual mode enabled.
  - Validate owner access and rollback switch.
  - Enforce auth requirement in production.
- Telemetry:
  - `admin_auth_success`, `admin_auth_forbidden`, `admin_auth_failed`, `admin_session_revoked` events.
- Risk controls:
  - Emergency env flag to temporarily re-open admin in incident window.
  - Pre-deploy checklist for OAuth and owner allowlist configuration.

### Plan B: wall-launch-and-trust-controls
- Epic: Visitor engagement feature launch with moderation safety.
- Stories:
  - Story 1: As visitor, I can submit wall signature and understand moderation state.
  - Story 2: As admin, I can quickly review and process queued entries.
  - Story 3: As owner, I can disable wall instantly from widget settings.
- Tasks:
  - Remove hardcoded `isWallEnabled = false` override in `src/routes/index.tsx`.
  - Improve wall form copy, constraints visibility, and success/error accessibility.
  - Add moderation filters and optional batch actions in `src/routes/admin.tsx`.
  - Add optional moderation metadata fields (`reviewedAt`, `reviewReason`).
  - Add analytics events for wall view/submit/moderation outcomes.
- Acceptance criteria:
  - Wall toggles correctly from admin settings.
  - Submit flow handles cooldown and validation gracefully.
  - Moderation throughput remains manageable at initial traffic.
- Test strategy:
  - Convex mutation tests for cooldown/validation.
  - UI tests for enabled/disabled/ticker states.
  - Admin moderation action tests.
- Rollout:
  - Enable during a monitored window.
  - Check moderation queue quality daily for first week.
  - Iterate on thresholds then fully roll out.
- Telemetry:
  - `wall_view`, `wall_submit_success`, `wall_submit_rejected`, `wall_moderation_approved`, `wall_moderation_archived`.
- Risk controls:
  - Immediate kill switch via settings.
  - Tight payload limits and cooldown enforcement.

### Plan C: accessibility-core-interactions-pass
- Epic: Accessibility baseline for high-traffic public UX.
- Stories:
  - Story 1: As keyboard user, I can navigate and activate all primary actions.
  - Story 2: As reduced-motion user, I experience low-motion transitions.
  - Story 3: As screen reader user, I can understand dynamic state changes.
- Tasks:
  - Refactor `project-showcase` interaction model for keyboard parity.
  - Add explicit focus-visible and aria state patterns for testimonial selectors.
  - Add reduced-motion CSS/JS behavior in animated components.
  - Ensure form feedback uses semantic, announced status regions.
  - Add route-level a11y test checks.
- Acceptance criteria:
  - Keyboard-only pass for full home-page journey.
  - Reduced-motion behavior verified on supported browsers.
  - No critical automated accessibility violations on key pages.
- Test strategy:
  - RTL tests for keyboard navigation and activation.
  - Automated a11y lint/check integration.
  - Manual screen reader smoke test (VoiceOver/NVDA baseline).
- Rollout:
  - Ship per component area to reduce visual regression risk.
  - Verify analytics baseline before/after to detect interaction drop-offs.
- Telemetry:
  - Track keyboard-originated interaction events and form completion rates.
- Risk controls:
  - Visual snapshot checks for component diffs.
  - Feature-flag risky animation changes.

## Open Questions / Assumptions
- Assumption: single owner admin workflow remains sufficient for next 6 months.
- Assumption: no strict legal compliance requirements beyond baseline privacy/security best practices.
- Assumption: primary growth channel is portfolio traffic from social/professional referrals.
- Open question: Should unauthorized `/admin` users see a branded sign-in screen or immediate redirect?
- Open question: Is bilingual content strategy planned (current contact success message is partly Polish)?
- Open question: Should wall feature be permanently on or event/campaign-driven?
- Open question: Is there a preferred external notification channel for new leads (email, Slack, Discord)?
