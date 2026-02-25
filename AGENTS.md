# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Single-app portfolio site (TanStack Start + Convex + Better Auth). See `README.md` for full feature list and env var reference.

### Services

| Service | Command | Notes |
|---|---|---|
| **Vite dev server** | `pnpm dev` | Port 3000. Works without Convex/auth credentials (gracefully degrades). |
| **Convex backend** | `npx convex dev` | Requires a Convex account & deployment. Without it, the app runs but all database-driven content (projects, testimonials, messages, wall, analytics) shows placeholders. |

### Key commands

| Task | Command |
|---|---|
| Install deps | `pnpm install` |
| Dev server | `pnpm dev` |
| Type check | `npx tsc --noEmit` |
| Tests | `pnpm test` |
| Build | `pnpm build` |

### Non-obvious caveats

- **vitest.config.ts is required.** The `vite.config.ts` includes the `@cloudflare/vite-plugin` which creates a workerd environment incompatible with CJS test dependencies (e.g. `tiny-warning`). A separate `vitest.config.ts` exists to exclude the cloudflare plugin from test runs.
- **SSR error in dev is expected.** Without a real `VITE_CONVEX_URL`, the SSR pass logs a "Could not find Convex client" error and falls back to client rendering. This is normal for local dev without Convex credentials.
- **Build scripts must be approved.** `pnpm.onlyBuiltDependencies` in `package.json` allows `esbuild`, `sharp`, and `workerd` to run their postinstall scripts. Without this, `pnpm install` silently skips native builds and tools like `wrangler` may fail.
- **Admin login requires Google OAuth.** There is no bypass/open-admin mode. The admin panel at `/admin` requires `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `BETTER_AUTH_URL`, `OWNER_EMAILS`, and `ADMIN_ISSUE_SECRET` env vars.
- **`.env` file is gitignored.** Create one with at minimum `VITE_CONVEX_URL` and `BETTER_AUTH_URL` for the dev server to start.
