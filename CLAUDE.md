# CLAUDE.md — Project Context for Claude Code

## Project

**Biblical Battle Plans** — an RPG-themed Bible reading tracker (PWA).
Built by ShirePath Solutions. Proprietary software.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite 7, Tailwind CSS 4
- **State:** TanStack Query (server state), Zustand (client state)
- **Backend:** Supabase (Auth, PostgreSQL, RPC functions)
- **Hosting:** Vercel (static deploy)
- **PWA:** vite-plugin-pwa

## Key Commands

```bash
npm run dev          # Vite dev server (port 5173)
npm run build        # tsc -b && vite build (MUST pass before PR)
npm run lint         # ESLint
npm run db:start     # Start local Supabase (Docker)
npm run db:stop      # Stop local Supabase
npm run db:reset     # Reset DB, apply all migrations, seed
npm run db:migrate   # Apply pending migrations only
npm run db:types     # Regenerate Supabase TypeScript types (use sparingly — see note below)
```

## Project Structure

```
src/
  components/        # Reusable UI components
  hooks/             # React hooks (data fetching, mutations)
    usePlans.ts      # Plan CRUD, reading mutations, streak RPC calls
    useStats.ts      # User stats fetching
    useAuth.ts       # Auth state and profile management
    useFreeReadingChapters.ts  # Free reading plan logic
  pages/             # Route components
  types/index.ts     # All TypeScript interfaces (source of truth for app types)
  lib/
    supabase.ts      # Supabase client setup
    database.types.ts # Auto-generated Supabase types (DO NOT edit manually)
supabase/
  migrations/        # Sequential SQL migrations (001-023)
  seed.sql           # Seed data (reading plans)
  config.toml        # Local Supabase config
docs/                # Project documentation
```

## Important Patterns

### Database Types vs App Types
- `src/types/index.ts` — hand-written interfaces used throughout the app
- `src/lib/database.types.ts` — auto-generated from Supabase schema
- These two often conflict. The generated types use `| null` everywhere and `Json` for JSONB columns, while app types use concrete types.
- **Do NOT regenerate `database.types.ts` casually.** It will introduce type errors across the codebase because the app casts through hand-written types. Only regenerate when adding new RPC functions, and expect to fix cascading type issues.

### Streak System (as of migration 023)
- Triggers are **removed**. No auto-recalculation on writes.
- Client calls `sync_reading_stats()` RPC after each reading mutation.
- Each `daily_progress` record is stamped with `streak_minimum` at write time.
- `recalculate_user_stats()` is kept as a repair/undo fallback only.
- Use `callSyncReadingStats()` helper from `usePlans.ts` for typed RPC calls.

### Query Invalidation Strategy
- Critical queries (current page): invalidate immediately
- Dashboard-only queries: `refetchType: 'none'` (stale but lazy)
- Stats: updated via RPC `setQueryData` (no extra round trip)

### Supabase Client Casting
Many Supabase queries use `as ReturnType<ReturnType<typeof getSupabase>['from']>` to work around the generated types not matching app types. This is intentional.

## Conventions

- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`)
- **Branching:** PRs to `main`, code review required
- **No auto-formatter** configured (no Prettier/Biome)
- **Migrations:** Applied manually to production via Supabase SQL editor (not CLI). Locally applied via `db:reset` or `db:migrate`.

## Known Issues / Tech Debt

- Migrations not applied via CLI to production (manual SQL paste)
- Generated types (`database.types.ts`) have empty `Functions` block — RPC calls require casting via `callSyncReadingStats()` helper
- `ios/` directory exists but Capacitor is not fully configured
- No test runner (Vitest/Jest) — testing done via SQL scripts and manual verification
- See `docs/FRAMEWORK_EVALUATION.md` for discussion on potential Next.js migration
